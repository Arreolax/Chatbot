<?php
require_once '../Models/methods_model.php';

header('Content-Type: application/json');

$extras = new ExtraModel();         //Se llama la funcion del modelo
$method = $_SERVER['REQUEST_METHOD'];

$type = isset($_GET['type']) ? $_GET['type'] : '';

switch ($method) {
    case 'GET':
        $extra = $extras->get($type);

        header('Content-Type: application/json');
        echo json_encode($extra);
        break;

    default:
        http_response_code(405);    // Maper el codigo si no se escuentra el metodo
        echo json_encode(['error' => 'Metodo Invalido']);
}
