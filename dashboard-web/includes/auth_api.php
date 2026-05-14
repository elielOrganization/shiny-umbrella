<?php
/**
 * auth_api.php — Guarda de sesión para controladores JSON.
 * Si no hay sesión activa responde HTTP 401 con JSON en lugar de redirigir.
 * Incluir al principio de cualquier controller protegido.
 */
require_once __DIR__ . '/../config/odoo.php'; // también arranca la sesión

if (empty($_SESSION['uid'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'unauthorized',
        'message' => 'No hay sesión activa. Por favor, inicia sesión.',
    ]);
    exit;
}
