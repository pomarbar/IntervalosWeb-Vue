<?php
// Solo permitimos peticiones POST (para que no entren por el navegador directamente)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
    exit;
}

// Leer los datos enviados desde Vue (viene en formato JSON)
 $json = file_get_contents('php://input');
 $data = json_decode($json, true);

// Extraer los datos (con valores por defecto por seguridad)
 $usuario   = isset($data['usuario']) ? $data['usuario'] : 'Desconocido';
 $pregunta  = isset($data['pregunta']) ? $data['pregunta'] : 0;
 $sonado    = isset($data['sonado']) ? $data['sonado'] : '';
 $respondido = isset($data['respondido']) ? $data['respondido'] : '';
 $timestamp = date('Y-m-d H:i:s');

// Crear la línea de texto formato CSV: Fecha, Usuario, Pregunta#, Intervalo Correcto, Respuesta Usuario
// Usamos addslashes o str_replace para evitar que una coma rompa el CSV
 $linea = sprintf('"%s","%s","%s","%s","%s"', $timestamp, $usuario, $pregunta, $sonado, $respondido);

// Nombre del archivo donde se guardarán los resultados
 $archivo = 'resultados_intervalos.csv';

// Guardar la línea en el archivo (FILE_APPEND agrega al final, LOCK_EX evita corrupción si muchos escriben a la vez)
file_put_contents($archivo, $linea . PHP_EOL, FILE_APPEND | LOCK_EX);

// Decirle a Vue que todo salió bien
echo json_encode(['status' => 'ok']);
?>