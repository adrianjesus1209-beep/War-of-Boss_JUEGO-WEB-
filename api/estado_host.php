<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$http_host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin) {
    $origin_host = parse_url($origin, PHP_URL_HOST);
    $server_host = explode(':', $http_host)[0];
    if ($origin_host === $server_host || 
        $origin_host === 'www.' . $server_host || 
        'www.' . $origin_host === $server_host ||
        in_array($origin_host, ['localhost', '127.0.0.1'], true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    }
} elseif ($http_host) {
    $proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https://' : 'http://';
    header('Access-Control-Allow-Origin: ' . $proto . $http_host);
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
$cache_ttl = 300; // 5 minutos de caché para evitar sobrecargar el disco con escaneos recursivos constantes
if (isset($_SESSION['cached_host_status_time']) && (time() - $_SESSION['cached_host_status_time']) < $cache_ttl && isset($_SESSION['cached_host_mb_usados'])) {
    $mb_usados = $_SESSION['cached_host_mb_usados'];
} else {
    try {
        $bytes_usados = obtener_tamano_directorio($raiz_proyecto, $carpetas_excluidas);
        $mb_usados = round($bytes_usados / 1048576, 2);
        $_SESSION['cached_host_mb_usados'] = $mb_usados;
        $_SESSION['cached_host_status_time'] = time();
    } catch (Exception $e) {
        $mb_usados = $_SESSION['cached_host_mb_usados'] ?? 0;
    }
}

echo json_encode([
    'host' => $servidor_display,
    'version_php' => $version_php,
    'mb_usados' => $mb_usados
], JSON_UNESCAPED_UNICODE);
