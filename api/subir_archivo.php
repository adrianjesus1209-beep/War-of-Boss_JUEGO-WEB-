<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso no autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo o hubo un error al subir.']);
    exit;
}

$archivo = $_FILES['archivo'];
$tipo_recurso = $_POST['tipo_recurso'] ?? '';

$tipos_permitidos = ['fondo', 'logo_claro', 'logo_oscuro', 'feat_0', 'feat_1', 'feat_2', 'audio_clic', 'audio_musica'];
$es_foto = preg_match('/^foto_\d+$/', $tipo_recurso) === 1;

if (!in_array($tipo_recurso, $tipos_permitidos) && !$es_foto) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de recurso no permitido.']);
    exit;
}

$ext = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
$extensiones_permitidas = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp3', 'ogg', 'wav'];

if (!in_array($ext, $extensiones_permitidas)) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato de archivo no permitido.']);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $archivo['tmp_name']);
finfo_close($finfo);
$mimes_imagen = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$mimes_audio = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/wave', 'audio/x-wav'];

if (!in_array($mime, $mimes_imagen) && !in_array($mime, $mimes_audio)) {
    http_response_code(400);
    echo json_encode(['error' => 'El contenido del archivo no coincide con un formato permitido.']);
    exit;
}

$uploads_dir_base = __DIR__ . '/../uploads';

if (in_array($tipo_recurso, ['fondo', 'logo_claro', 'logo_oscuro'])) {
    $subcarpeta = 'imagenes';
} elseif ($es_foto) {
    $subcarpeta = 'galeria';
} elseif (in_array($tipo_recurso, ['feat_0', 'feat_1', 'feat_2'])) {
    $subcarpeta = 'imagenes';
} elseif (in_array($tipo_recurso, ['audio_clic', 'audio_musica'])) {
    $subcarpeta = 'audio';
} else {
    $subcarpeta = 'imagenes';
}

$uploads_dir = $uploads_dir_base . '/' . $subcarpeta;
if (!is_dir($uploads_dir)) {
    mkdir($uploads_dir, 0755, true);
}

$archivos_anteriores = glob($uploads_dir . '/' . $tipo_recurso . '.*');
if ($archivos_anteriores) {
    foreach ($archivos_anteriores as $archivo_viejo) {
        if (is_file($archivo_viejo)) {
            @unlink($archivo_viejo);
        }
    }
}

$nuevo_nombre = $tipo_recurso . '.' . $ext;
$destino_absoluto = $uploads_dir . '/' . $nuevo_nombre;
$ruta_relativa = 'uploads/' . $subcarpeta . '/' . $nuevo_nombre;

if (!move_uploaded_file($archivo['tmp_name'], $destino_absoluto)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al mover el archivo subido']);
    exit;
}

if (in_array($mime, $mimes_imagen) && function_exists('imagewebp')) {
    $src_img = null;
    switch ($mime) {
        case 'image/jpeg': $src_img = @imagecreatefromjpeg($destino_absoluto); break;
        case 'image/png':  $src_img = @imagecreatefrompng($destino_absoluto); break;
        case 'image/gif':  $src_img = @imagecreatefromgif($destino_absoluto); break;
        case 'image/webp': $src_img = @imagecreatefromwebp($destino_absoluto); break;
    }
    if ($src_img) {
        $webp_path = $uploads_dir . '/' . $tipo_recurso . '.webp';
        if (imagewebp($src_img, $webp_path, 70)) {
            @unlink($destino_absoluto);
            $ruta_relativa = 'uploads/' . $subcarpeta . '/' . $tipo_recurso . '.webp';
        }
        imagedestroy($src_img);
    }
}

echo json_encode([
    'success' => true,
    'ruta' => $ruta_relativa,
    'mensaje' => 'Archivo subido y reemplazado con éxito'
]);
