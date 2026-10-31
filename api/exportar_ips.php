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

require_once __DIR__ . '/db_conexion.php';

try {
    $conexion = obtenerConexionDB();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
    exit;
}

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

$sql = "SELECT id, tipo, direccion_ip, fecha_registro FROM registros_metricas $where ORDER BY fecha_registro DESC LIMIT 10000";
$stmt = $conexion->prepare($sql);
$stmt->execute($params);
$registros = $stmt->fetchAll();

echo json_encode([
    'registros' => $registros,
    'total' => $total_registros,
    'filtro' => $filtro_tipo ?: 'todos'
], JSON_UNESCAPED_UNICODE);
