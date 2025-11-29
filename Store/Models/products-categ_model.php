<?php
require_once "../conexion.php";

class ProductsModel {
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    public function get($id_cate) {
        $sql = "SELECT id_product, name, price, stock, description, id, image FROM products WHERE id_category = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id_cate); 
        $stmt->execute();
        $resultado = $stmt->get_result();

        $productos = [];
        while ($fila = $resultado->fetch_assoc()) {
            $productos[] = $fila;
        }

        $stmt->close();
        return $productos;
    }
    
    public function create($data) {
        $stmt = $this -> conn -> prepare("INSERT INTO products (name, description, price, stock, image, id_category) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt -> bind_param("ssdisi", $data['name'], $data['description'], $data['price'], $data['stock'], $data['image'], $data['id_category']);
        //Parametrizar los datos s->string
        return $stmt -> execute();
    }

    public function update($data) {
        $stmt = $this -> conn -> prepare("UPDATE products SET name=?, description=?, price=?, stock=?, image=?, id_category=? WHERE id=?");
        $stmt -> bind_param("ssdisii",  $data['name'], $data['description'], $data['price'], $data['stock'], $data['image'], $data['id_category'], $data['id']);
        //Parametrizar los datos s->string i->entero
        return $stmt -> execute();
    }

    public function delete($id) {
        $stmt = $this -> conn -> prepare("DELETE FROM products WHERE id=?");
        $stmt -> bind_param("i", $id);
        //Parametrizar los datos i->entero
        return $stmt -> execute();
    }
}
?>