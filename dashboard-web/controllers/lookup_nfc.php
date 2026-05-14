<?php
// lookup_nfc.php — endpoint PÚBLICO: el escáner NFC global lo usa sin sesión PHP
require_once __DIR__ . '/../config/odoo.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$uid  = trim($data['uid'] ?? '');

if (!$uid) {
    echo json_encode(['error' => 'UID no proporcionado']);
    exit;
}

// Usa odoo_call() del config — incluirá el sessionid si hay sesión activa
$rAlumnos    = odoo_call('/nfc/get_alumnos');
$rProfesores = odoo_call('/nfc/get_profesores');

$alumnos    = $rAlumnos['data']['result']['alumnos']       ?? [];
$profesores = $rProfesores['data']['result']['profesores'] ?? [];

foreach ($alumnos as $a) {
    if (isset($a['uid']) && $a['uid'] === $uid) {
        echo json_encode([
            'nombre' => trim(($a['nombre'] ?? '') . ' ' . ($a['apellido'] ?? '')),
            'tipo'   => 'alumno',
        ]);
        exit;
    }
}

foreach ($profesores as $p) {
    if (isset($p['uid']) && $p['uid'] === $uid) {
        echo json_encode([
            'nombre' => trim(($p['nombre'] ?? '') . ' ' . ($p['apellido'] ?? '')),
            'tipo'   => 'profesor',
        ]);
        exit;
    }
}

echo json_encode(['error' => true, 'message' => 'Tarjeta no vinculada a ninguna persona']);
