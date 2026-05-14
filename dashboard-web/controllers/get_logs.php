<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');

$tipo     = $_GET['tipo'] ?? 'profesor';
$endpoint = match($tipo) {
    'alumno'   => '/nfc/get_fichajes_alumnos',
    'profesor' => '/nfc/get_fichajes_profesores',
    default    => '/nfc/get_fichajes_profesores',
};

$result = odoo_call($endpoint);
odoo_require_auth($result);

echo $result['body'] ?? json_encode(['error' => 'No se pudo conectar con Odoo']);
