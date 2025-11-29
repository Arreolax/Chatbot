<?php
require_once '../Models/user_model.php';

header('Content-Type: application/json');

$users = new UsersModel();         //Se llama la funcion del modelo
$method = $_SERVER['REQUEST_METHOD'];

$phone = isset($_GET['phone']) ? intval($_GET['phone']) : 0;

switch ($method) {
    case 'GET':
        $user = $users->get($phone);

        header('Content-Type: application/json');
        echo json_encode($user);
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['phone']) || !isset($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos incompletos']);
            exit;
        }
        $phone = $input['phone'];
        $name = $input['name'];
        $result = $users->createUser($phone, $name);
        if ($result) {
            // Devuelve el usuario insertado para que JS lo use
            echo json_encode([[
                'phone' => $phone,
                'username' => $name
            ]]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear el usuario']);
        }
        exit;
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['success' => $user->update($data)]);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['success' => $user->delete($data['id'])]);
        break;

    default:
        http_response_code(405);    // Maper el codigo si no se escuentra el metodo
        echo json_encode(['error' => 'Metodo Invalido']);
}
?>