<?php
require_once '../Models/products-categ_model.php';

header('Content-Type: application/json');

$product = new ProductsModel();         //Se llama la funcion del modelo
$method = $_SERVER['REQUEST_METHOD'];

// Obtener id_category de la URL
$id_category = isset($_GET['id_category']) ? intval($_GET['id_category']) : 0;

switch ($method) {
    case 'GET':
        $productos = $product->get($id_category);

        // Responder en JSON
        header('Content-Type: application/json');
        echo json_encode($productos);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $product->create($data)]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $product->update($data)]);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $user->delete($data['id'])]);
        break;

    default:
        http_response_code(405);    // Maper el codigo si no se escuentra el metodo
        echo json_encode(['error' => 'Metodo Invalido']);
}
