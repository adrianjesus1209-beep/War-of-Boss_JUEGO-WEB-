<?php
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

$config_path = __DIR__ . '/config.json';

if (file_exists($config_path)) {
    $last_modified = filemtime($config_path);
    $raw_etag = md5_file($config_path);
    $etag = '"' . $raw_etag . '"';
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $last_modified) . ' GMT');
    header('ETag: ' . $etag);
    header('Cache-Control: public, max-age=60');

    $client_etag = trim($_SERVER['HTTP_IF_NONE_MATCH'] ?? '', "\"' \t\n\r\0\x0B");
    if (!$client_etag && function_exists('apache_request_headers')) {
        $req_headers = apache_request_headers();
        $client_etag = trim($req_headers['If-None-Match'] ?? ($req_headers['if-none-match'] ?? ''), "\"' \t\n\r\0\x0B");
    }

    if ($client_etag && ($client_etag === $raw_etag || $client_etag === '*')) {
        http_response_code(304);
        exit;
    }

    if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >= $last_modified) {
        http_response_code(304);
        exit;
    }
    echo file_get_contents($config_path);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Configuración no encontrada']);
}
