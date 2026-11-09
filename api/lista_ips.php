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

require_once __DIR__ . '/db_conexion.php';

try {
    $conexion = obtenerConexionDB();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
    exit;
}

$pagina = max(1, (int)($_GET['pagina'] ?? 1));
$por_pagina = max(1, min(100, (int)($_GET['por_pagina'] ?? 50)));
$offset = ($pagina - 1) * $por_pagina;

$filtro_tipo = $_GET['filtro'] ?? '';

$where = '';
$params = [];
if ($filtro_tipo === 'visita' || $filtro_tipo === 'descarga') {
    $where = 'WHERE tipo = :tipo';
    $params[':tipo'] = $filtro_tipo;
}

$sqlCount = "SELECT COUNT(*) AS total FROM registros_metricas $where";
$stmtCount = $conexion->prepare($sqlCount);
$stmtCount->execute($params);
$total_registros = (int)$stmtCount->fetch()['total'];
$total_paginas = max(1, ceil($total_registros / $por_pagina));

$sql = "SELECT id, tipo, direccion_ip, fecha_registro FROM registros_metricas $where ORDER BY fecha_registro DESC LIMIT :limite OFFSET :offset";
$stmt = $conexion->prepare($sql);
foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}
$stmt->bindValue(':limite', $por_pagina, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$registros = $stmt->fetchAll();

echo json_encode([
    'registros' => $registros,
    'pagina_actual' => $pagina,
    'total_paginas' => $total_paginas,
    'total_registros' => $total_registros,
    'por_pagina' => $por_pagina
], JSON_UNESCAPED_UNICODE);
