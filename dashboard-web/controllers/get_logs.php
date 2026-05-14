<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

$tipo     = $_GET['tipo'] ?? 'profesor';
$endpoint = match($tipo) {
    'alumno'   => '/nfc/get_fichajes_alumnos',
    'profesor' => '/nfc/get_fichajes_profesores',
    default    => '/nfc/get_fichajes_profesores',
};

$result = odoo_call($endpoint);
odoo_require_auth($result);

ob_end_clean();
echo odoo_json_body($result);
