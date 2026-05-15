<?php
$ODOO_IP   = "10.102.6.187";
$ODOO_PORT = "8069";
$ODOO_BASE = "http://{$ODOO_IP}:{$ODOO_PORT}";
$ODOO_DB   = "odoo";

require_once __DIR__ . '/logger.php';

// Arrancar sesión si todavía no está activa (controllers la necesitan para leer odoo_session_id)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* ─────────────────────────────────────────────────────────────────────────
   odoo_request()
   Capa HTTP de bajo nivel: envía un POST a Odoo con el cookie de sesión
   activo y devuelve el código HTTP y el cuerpo de la respuesta.
   ───────────────────────────────────────────────────────────────────────── */
function odoo_request(string $endpoint, string $payload): array
{
    global $ODOO_BASE;

    $sessionId    = $_SESSION['odoo_session_id'] ?? '';
    $cookieHeader = $sessionId ? "Cookie: session_id={$sessionId}\r\n" : '';

    $ctx  = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => "Content-Type: application/json\r\n{$cookieHeader}",
        'content'       => $payload,
        'ignore_errors' => true,
        'timeout'       => 10,
    ]]);

    odoo_log('odoo_request', "→ POST {$endpoint}");

    $body = @file_get_contents($ODOO_BASE . $endpoint, false, $ctx);

    // PHP 8.4+: usar http_get_last_response_headers(); fallback para versiones anteriores
    $responseHeaders = function_exists('http_get_last_response_headers')
        ? (http_get_last_response_headers() ?? [])
        : ($http_response_header ?? []);  // @phpstan-ignore-line

    $code = 0;
    foreach ($responseHeaders as $h) {
        if (preg_match('#^HTTP/\S+\s+(\d+)#', $h, $m)) {
            $code = (int) $m[1];
            break;
        }
    }

    odoo_log('odoo_request', "← {$code} {$endpoint}", [
        'body_preview' => $body !== false ? substr($body, 0, 300) : 'FALSE',
    ]);

    return ['http_code' => $code, 'body' => ($body !== false) ? $body : null];
}

/* ─────────────────────────────────────────────────────────────────────────
   odoo_call()
   Wrapper de alto nivel: empaqueta params en JSON-RPC y devuelve los datos
   ya decodificados junto con el código HTTP.
   ───────────────────────────────────────────────────────────────────────── */
function odoo_call(string $endpoint, array $params = []): array
{
    $payload = json_encode([
        'jsonrpc' => '2.0',
        'method'  => 'call',
        'params'  => empty($params) ? new stdClass() : $params,
    ]);

    $result         = odoo_request($endpoint, $payload);
    $result['data'] = $result['body'] !== null ? json_decode($result['body'], true) : null;
    return $result;
}

/* ─────────────────────────────────────────────────────────────────────────
   odoo_require_auth()
   Detecta sesión expirada tanto por HTTP 401 como por el error JSON-RPC
   de Odoo (code 100 / SessionExpiredException). Limpia la sesión PHP y
   responde con HTTP 401 JSON para que apiFetch.js redirija al login.
   ───────────────────────────────────────────────────────────────────────── */
function odoo_require_auth(array $result): void
{
    $httpExpired  = $result['http_code'] === 401;
    $odooExpired  = isset($result['data']['error']['code'])
                    && $result['data']['error']['code'] === 100;

    if ($httpExpired || $odooExpired) {
        session_unset();
        session_destroy();

        // Limpiar cualquier output bufferado antes de emitir la respuesta
        if (ob_get_level() > 0) ob_end_clean();

        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'error'   => 'unauthorized',
            'message' => 'Sesión expirada. Por favor, inicia sesión de nuevo.',
        ]);
        exit;
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   odoo_json_body()
   Valida que la respuesta de Odoo sea JSON antes de reenviarla al cliente.
   Si Odoo devuelve HTML (error interno, página de mantenimiento, etc.)
   lanza una excepción con mensaje legible en lugar de reenviar el HTML.
   ───────────────────────────────────────────────────────────────────────── */
function odoo_json_body(array $result): string
{
    if ($result['body'] === null) {
        throw new RuntimeException('Sin respuesta de Odoo. Comprueba la conexión.');
    }

    $first = ltrim($result['body'])[0] ?? '';
    if ($first !== '{' && $first !== '[') {
        odoo_log('odoo_json_body', 'Odoo devolvió respuesta no-JSON', [
            'http_code' => $result['http_code'],
            'preview'   => substr($result['body'], 0, 120),
        ]);
        throw new RuntimeException('Odoo devolvió una respuesta inesperada (no JSON).');
    }

    return $result['body'];
}
