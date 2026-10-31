<?php
header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost', 'http://127.0.0.1'];
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} elseif (isset($_SERVER['HTTP_HOST'])) {
    $host = $_SERVER['HTTP_HOST'];
    if ($host === 'localhost' || $host === '127.0.0.1' || explode(':', $host)[0] === 'localhost') {
        header('Access-Control-Allow-Origin: http://' . $host);
    }
}

$config_path = __DIR__ . '/config.json';

if (file_exists($config_path)) {
    echo file_get_contents($config_path);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Configuración no encontrada']);
}
