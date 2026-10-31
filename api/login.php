<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db_conexion.php';

function obtenerIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return $_SERVER['HTTP_X_REAL_IP'];
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ip = obtenerIP();
    $input = json_decode(file_get_contents('php://input'), true);
    $clave = $input['clave'] ?? '';

    $password_hash = obtenerPasswordHash();
    if (!$password_hash) {
        http_response_code(500);
        echo json_encode(['success' => false, 'mensaje' => 'Error interno del servidor.']);
        exit;
    }

    if (password_verify($clave, $password_hash)) {
        registrarIntento($ip, true);
        $_SESSION['admin_logged_in'] = true;
        echo json_encode(['success' => true, 'mensaje' => 'Sesión iniciada correctamente']);
    } else {
        registrarIntento($ip, false);
        http_response_code(401);
        echo json_encode(['success' => false, 'mensaje' => 'Contraseña incorrecta.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $is_logged_in = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    echo json_encode(['logged_in' => $is_logged_in]);
    exit;
}
