<?php
require_once "../conexion.php";

class ExtraModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    public function get($type, $id) {
        $sql = "SELECT * FROM miscellany WHERE type = ? AND id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $type, $id); 
        $stmt->execute();
        $resultado = $stmt->get_result();

        $methods = [];
        while ($fila = $resultado->fetch_assoc()) {
            $methods[] = $fila;
        }

        $stmt->close();
        return $methods;
    }
}
?>