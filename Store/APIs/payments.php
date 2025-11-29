<?php
require_once '../Models/payments_model.php';
 
header('Content-Type: application/json'); 

$payment = new PaymentsModel();         //Se llama la funcion del modelo
$method = $_SERVER['REQUEST_METHOD']; 

switch ($method) {
    case 'GET':
        echo json_encode($payment -> getAll());
    break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $payment -> create($data)]);
    break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $payment -> update($data)]);
    break;

    case 'DELETE':
         $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode(['sucess' => $user->delete($data['id'])]);
    break;

    default:
        http_response_code(405);    // Maper el codigo si no se escuentra el metodo
        echo json_encode(['error' => 'Metodo Invalido']);
}
