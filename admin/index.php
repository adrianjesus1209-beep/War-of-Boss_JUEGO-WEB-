<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../api/db_conexion.php';

if (!isset($_SESSION['admin_token_validated'])) {
    $token_recibido = $_GET['t'] ?? '';
    $token_db = obtenerTokenAdmin();

    $token_hash = hash('sha256', $token_recibido);
    if (!$token_db || !hash_equals($token_db, $token_hash)) {
        header('Location: ../index.php');
        exit;
    }

    $_SESSION['admin_token_validated'] = true;

    header('Location: index.php');
    exit;
}

$contenido = file_get_contents(__DIR__ . '/index.html');
echo $contenido;
