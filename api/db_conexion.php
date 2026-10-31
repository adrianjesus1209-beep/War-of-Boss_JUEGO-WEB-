<?php
require_once __DIR__ . '/config_db.php';

function obtenerConexionDB() {
    global $db_config;
    static $conexion = null;

    if ($conexion === null) {
        $conexion = new PDO(
            "mysql:host={$db_config['host']};port={$db_config['puerto']};dbname={$db_config['db_name']};charset={$db_config['charset']}",
            $db_config['usuario'],
            $db_config['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
    }

    return $conexion;
}

function obtenerTokenAdmin() {
    try {
        $conexion = obtenerConexionDB();
        $stmt = $conexion->prepare("SELECT valor FROM admin_config WHERE clave = 'admin_token' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ? $row['valor'] : null;
    } catch (PDOException $e) {
        return null;
    }
}

function obtenerPasswordHash() {
    try {
        $conexion = obtenerConexionDB();
        $stmt = $conexion->prepare("SELECT valor FROM admin_config WHERE clave = 'admin_password_hash' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ? $row['valor'] : null;
    } catch (PDOException $e) {
        return null;
    }
}

function estaIPBloqueada($ip) {
    return false;
}

function contarIntentosFallidos($ip) {
    try {
        $conexion = obtenerConexionDB();
        $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM admin_login_attempts WHERE direccion_ip = :ip AND exitoso = 0 AND fecha_intento > DATE_SUB(NOW(), INTERVAL 3 DAY)");
        $stmt->execute([':ip' => $ip]);
        $row = $stmt->fetch();
        return (int)$row['total'];
    } catch (PDOException $e) {
        return 0;
    }
}

function registrarIntento($ip, $exitoso) {
    try {
        $conexion = obtenerConexionDB();
        $stmt = $conexion->prepare("INSERT INTO admin_login_attempts (direccion_ip, exitoso) VALUES (:ip, :exitoso)");
        $stmt->execute([':ip' => $ip, ':exitoso' => $exitoso ? 1 : 0]);
    } catch (PDOException $e) {
    }
}
