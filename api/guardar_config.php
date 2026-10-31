<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso no autorizado']);
    exit;
}

$config_path = __DIR__ . '/config.json';
$raw_input = file_get_contents('php://input');
$nuevo_config = json_decode($raw_input, true);

if (is_array($nuevo_config)) {
    $allowed_keys = ['general', 'multimedia', 'redes', 'novedades', 'caracteristicas'];
    $filtered = [];
    foreach ($allowed_keys as $key) {
        if (isset($nuevo_config[$key])) {
            $filtered[$key] = $nuevo_config[$key];
        }
    }

    if (file_put_contents($config_path, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'mensaje' => 'Configuración guardada exitosamente']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al escribir el archivo de configuración']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'JSON de configuración inválido']);
}
