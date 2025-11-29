<?php
require_once '../Models/cart-user_model.php';

header('Content-Type: application/json');

$cart = new CartModel();         //Se llama la funcion del modelo
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id_user = isset($_GET['id_user']) ? intval($_GET['id_user']) : 0;

        $products = $cart->get($id_user);

        // Responder en JSON
        header('Content-Type: application/json');
        echo json_encode($products);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $id_user = $input['id_user'];
        $id_product = $input['id_product'];

        $result = $cart->create($id_user, $id_product);
        if ($result) {
            // Devuelve el usuario insertado para que JS lo use
            echo json_encode([[
                'id_user' => $id_user,
                'id_product' => $id_product
            ]]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear el usuario']);
        }
        exit;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['success' => $cart->update($data)]);
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $input);

        $id_user = isset($input['id_user']) ? intval($input['id_user']) : null;
        $id_product = isset($input['id_product']) ? intval($input['id_product']) : null;


        $deleted = $cart->delete($id_user, $id_product);

        if ($deleted) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo eliminar']);
        }
        break;

    default:
        http_response_code(405);    // Maper el codigo si no se escuentra el metodo
        echo json_encode(['error' => 'Metodo Invalido']);
}
