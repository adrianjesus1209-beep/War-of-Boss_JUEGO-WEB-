<?php
session_start();
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

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso no autorizado']);
    exit;
}

$nombre_host = $_SERVER['SERVER_NAME'] ?? 'Servidor Desconocido';
if ($nombre_host === 'localhost' || $nombre_host === '127.0.0.1') {
    $servidor_display = 'Localhost (XAMPP)';
} else {
    $servidor_display = $nombre_host;
}

$version_php = 'v' . phpversion();

$carpetas_excluidas = ['.git', 'node_modules', '.svn', '__pycache__', '.cache', 'vendor'];

function obtener_tamano_directorio($dir, $excluidas) {
    $size = 0;
    if (!is_dir($dir)) return $size;
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = $dir . '/' . $item;
        if (is_dir($path)) {
            if (in_array($item, $excluidas, true)) continue;
            $size += obtener_tamano_directorio($path, $excluidas);
        } elseif (is_file($path)) {
            $size += filesize($path);
        }
    }
    return $size;
}

$raiz_proyecto = __DIR__ . '/..';
try {
    $bytes_usados = obtener_tamano_directorio($raiz_proyecto, $carpetas_excluidas);
    $mb_usados = round($bytes_usados / 1048576, 2);
} catch (Exception $e) {
    $mb_usados = 0;
}

echo json_encode([
    'host' => $servidor_display,
    'version_php' => $version_php,
    'mb_usados' => $mb_usados
], JSON_UNESCAPED_UNICODE);
