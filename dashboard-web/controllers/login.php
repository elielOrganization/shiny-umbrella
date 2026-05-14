<?php
require_once __DIR__ . '/../config/odoo.php'; // también arranca la sesión y el logger

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

$login    = trim($_POST['login'] ?? $_POST['email'] ?? '');
$password = trim($_POST['password'] ?? '');

if (!$login || !$password) {
    header('Location: ../index.php?error=campos');
    exit;
}

odoo_log('login', 'Intento de login', ['user' => $login]);

// ── Llamada al nuevo endpoint /nfc/login ──────────────────────────────────
$payload = json_encode([
    'jsonrpc' => '2.0',
    'method'  => 'call',
    'params'  => ['login' => $login, 'password' => $password],
]);

$ctx = stream_context_create(['http' => [
    'method'        => 'POST',
    'header'        => "Content-Type: application/json\r\n",
    'content'       => $payload,
    'ignore_errors' => true,
    'timeout'       => 8,
]]);

$body = @file_get_contents($ODOO_BASE . '/nfc/login', false, $ctx);

if ($body === false) {
    odoo_log('login', 'ERROR: no se pudo conectar con Odoo');
    header('Location: ../index.php?error=conexion');
    exit;
}

$responseHeaders = function_exists('http_get_last_response_headers')
    ? (http_get_last_response_headers() ?? [])
    : ($http_response_header ?? []);  // @phpstan-ignore-line

// ── DEBUG TEMPORAL: muestra la respuesta exacta de Odoo ──────────────────
// Descomenta este bloque si el login sigue sin funcionar para ver la respuesta

$raw = json_decode($body, true);

// Soportar tanto JSON plano { status, uid, name }
// como JSON-RPC envuelto  { result: { status, uid, name } }
$data = isset($raw['result']) ? $raw['result'] : $raw;

if (($data['status'] ?? '') !== 'ok' || empty($data['uid'])) {
    odoo_log('login', 'ERROR: credenciales rechazadas', [
        'status'  => $data['status']  ?? 'n/a',
        'message' => $data['message'] ?? 'n/a',
        'uid'     => $data['uid']     ?? 'n/a',
    ]);
    header('Location: ../index.php?error=credenciales');
    exit;
}

// ── Capturar sessionid del Set-Cookie de Odoo ─────────────────────────────
$sessionId = null;
foreach ($responseHeaders as $h) {
    if (preg_match('/^Set-Cookie:\s*session_id=([^;]+)/i', $h, $m)) {
        $sessionId = trim($m[1]);
        break;
    }
}

odoo_log('login', 'Login OK', [
    'uid'        => $data['uid'],
    'name'       => $data['name'] ?? '',
    'session_id' => $sessionId ? substr($sessionId, 0, 10) . '…' : 'NO ENCONTRADO',
]);

// ── Guardar en la sesión PHP ──────────────────────────────────────────────
$_SESSION['uid']              = $data['uid'];
$_SESSION['name']             = $data['name'] ?? 'Usuario';
$_SESSION['login']            = $login;
$_SESSION['odoo_session_id']  = $sessionId ?? '';

header('Location: ../views/main.php');
exit;
