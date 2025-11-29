<?php
require_once "../conexion.php";

class PaymentsModel {
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    public function getAll() {
        $result = $this -> conn -> query("SELECT * FROM payments");
        return $result -> fetch_all(MYSQLI_ASSOC);
    }
    
    public function create($data) {
        $stmt = $this -> conn -> prepare("INSERT INTO payments (id_product, id_user, payment_method) VALUES (?, ?, ?)");
        $stmt -> bind_param("iis", $data['id_product'], $data['id_user'], $data['payment_method']);
        //Parametrizar los datos s->string
        return $stmt -> execute();
    }

    public function update($data) {
        $stmt = $this -> conn -> prepare("UPDATE payments SET id_product=?, id_user=?, payment_method=? WHERE id=?");
        $stmt -> bind_param("iisi", $data['id_product'], $data['id_user'], $data['payment_method'], $data['id']);
        //Parametrizar los datos s->string i->entero
        return $stmt -> execute();
    }

    public function delete($id) {
        $stmt = $this -> conn -> prepare("DELETE FROM payments WHERE id=?");
        $stmt -> bind_param("i", $id);
        //Parametrizar los datos i->entero
        return $stmt -> execute();
    }
}
?>