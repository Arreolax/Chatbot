<?php
require_once "../conexion.php";

class CartUserModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    public function get($id_user)
    {
        $sql = "SELECT COUNT(*) AS Total_Products, SUM(p.price) AS Total_Price FROM cart c, products p WHERE c.id_user = 1 AND c.id_product = p.id";

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

    public function create($id_user, $id_product)
    {
        $stmt = $this->conn->prepare("INSERT INTO cart (id_user, id_product) VALUES (?, ?)");
        if (!$stmt) {
            return false;
        }
        if (!$stmt->bind_param("ii", $id_user, $id_product)) {
            return false;
        }
        if (!$stmt->execute()) {
            return false;
        }
        $stmt->close();
        return true;
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
