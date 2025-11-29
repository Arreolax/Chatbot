<?php
require_once '../Models/category_model.php';
 
header('Content-Type: application/json');

$category = new CategoryModel();         //Se llama la funcion del modelo
$method = $_SERVER['REQUEST_METHOD']; 

switch ($method) {
    case 'GET':
        $category -> getAll();
    break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $category -> create($data)]);
    break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $category -> update($data)]);
    break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $user->delete($data['id'])]);
    break;

    default:
        http_response_code(405);    // Maper el codigo si no se escuentra el metodo
        echo json_encode(['error' => 'Metodo Invalido']);
}
