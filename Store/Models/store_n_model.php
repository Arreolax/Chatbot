<?php
require_once "../conexion.php";

class ExtraModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    public function get($typ) {
        $sql = "SELECT name, image FROM miscellany WHERE type = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $typ); 
        $stmt->execute();
        $resultado = $stmt->get_result();

        $stores = [];
        while ($fila = $resultado->fetch_assoc()) {
            $stores[] = $fila;
        }

        $stmt->close();
        return $stores;
    }
}