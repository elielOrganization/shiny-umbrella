<?php
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['uid'])) {
    // Petición AJAX → JSON 401 para que apiFetch.js redirija limpiamente
    $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH'])
        || str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
        || str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json');

    if ($isAjax) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'unauthorized', 'message' => 'Sesión no iniciada.']);
        exit;
    }

    header('Location: ../index.php');
    exit;
}
