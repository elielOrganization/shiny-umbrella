<?php
$ODOO_IP   = "10.102.6.225";
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
   Llama a esto después de odoo_call(). Si Odoo devuelve 401 limpia la
   sesión PHP y responde con JSON 401 para que el JS redirija al login.
   ───────────────────────────────────────────────────────────────────────── */
function odoo_require_auth(array $result): void
{
    if ($result['http_code'] === 401) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode([
            'error'   => 'unauthorized',
            'message' => 'Sesión expirada. Por favor, inicia sesión de nuevo.',
        ]);
        exit;
    }
}
