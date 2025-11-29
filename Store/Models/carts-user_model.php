<?php
require_once "../conexion.php";

class CartsModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    // Obtener productos del carrito de un usuario
    public function get($id_user) {
        $sql = "SELECT p.name, p.price, 1 AS amount, p.description, c.id AS cart_id, p.image
                FROM cart c
                JOIN products p ON c.id_product = p.id
                WHERE c.id_user = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id_user);
        $stmt->execute();
        $resultado = $stmt->get_result();

        $productos = [];
        while ($fila = $resultado->fetch_assoc()) {
            $productos[] = $fila;
        }

        $stmt->close();
        return $productos;
    }

    public function create($carritos, $id_user, $id_method) {
        if (empty($carritos)) return false;

        $values = [];
        foreach ($carritos as $c) {
            $cart_id = intval($c['cart_id']);  // seguridad básica
            $user_id = intval($id_user);
            $method_id = intval($id_method);
            $values[] = "($cart_id, $user_id, $method_id)";
        }

        $sql = "INSERT INTO payments (id_cart, id_user, id_method) VALUES " . implode(", ", $values);
        return $this->conn->query($sql);
    }

    public function update($data)
    {
        $stmt = $this->conn->prepare("UPDATE cart SET id_product=?, id_user=? WHERE id=?");
        $stmt->bind_param("iii", $data['id_product'], $data['id_user'], $data['id']);
        //Parametrizar los datos s->string i->entero
        return $stmt->execute();
    }

    public function delete($id_user, $id_product)
    {
        $stmt = $this->conn->prepare("DELETE FROM cart WHERE id_user = ? AND id_product = ?");
        if (!$stmt) {
            return false;
        }

        $stmt->bind_param("ii", $id_user, $id_product); // "ii" = dos enteros
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }
}
