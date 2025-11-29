<?php
require_once '../Models/carts-user_model.php';

header('Content-Type: application/json');

$cart = new CartsModel();         //Se llama la funcion del modelo
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
        $input = json_decode(file_get_contents("php://input"), true);

        $id_user = $input['id_user'] ?? null;
        $id_method = $input['id_method'] ?? null;

        if (!$id_user || !$id_method) {
            echo json_encode(["error" => "Faltan parámetros"]);
            exit;
        }

        // Obtener todos los productos del carrito
        $carritos = $cart->get($id_user);

        // Insertar en otra tabla
        $result = $cart->create($carritos, $id_user, $id_method);

        if ($result) {
            echo json_encode(["success" => true, "inserted" => count($carritos)]);
        } else {
            echo json_encode(["error" => "No se pudo insertar"]);
        }
        break;

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
