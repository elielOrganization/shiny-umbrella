<?php
session_start();
require_once __DIR__ . '/../config/odoo.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

$login    = trim($_POST['email']    ?? '');
$password = trim($_POST['password'] ?? '');

if (!$login || !$password) {
    header('Location: ../index.php?error=campos');
    exit;
}

$payload = json_encode([
    "jsonrpc" => "2.0",
    "method"  => "call",
    "params"  => [
        "db"       => $ODOO_DB,
        "login"    => $login,
        "password" => $password
    ]
]);

$context  = stream_context_create(['http' => [
    'header'        => "Content-Type: application/json\r\n",
    'method'        => 'POST',
    'content'       => $payload,
    'ignore_errors' => true,
    'timeout'       => 8
]]);

$response = @file_get_contents($ODOO_BASE . "/web/session/authenticate", false, $context);

if ($response === false) {
    header('Location: ../index.php?error=conexion');
    exit;
}

$data = json_decode($response, true);
$uid  = $data['result']['uid'] ?? false;

if ($uid && $uid !== false) {
    $_SESSION['uid']   = $uid;
    $_SESSION['name']  = $data['result']['name']  ?? 'Usuario';
    $_SESSION['login'] = $data['result']['username'] ?? $login;
    header('Location: ../views/main.php');
} else {
    header('Location: ../index.php?error=credenciales');
}
exit;
