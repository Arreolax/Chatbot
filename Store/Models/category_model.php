<?php
require_once "../conexion.php";

class CategoryModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    public function getAll()
    {
        $result = $this->conn->query("SELECT id, name, description, image FROM category");
        $data = $result->fetch_all(MYSQLI_ASSOC);

        header('Content-Type: application/json');

        echo json_encode($data);
    }

    public function create($data)
    {
        $stmt = $this->conn->prepare("INSERT INTO category (name, description) VALUES (?, ?)");
        $stmt->bind_param("ss", $data['name'], $data['description']);
        //Parametrizar los datos s->string
        return $stmt->execute();
    }

    public function update($data)
    {
        $stmt = $this->conn->prepare("UPDATE category SET name=?, description=? WHERE id=?");
        $stmt->bind_param("ssi", $data['name'], $data['description'], $data['id']);
        //Parametrizar los datos s->string i->entero
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM category WHERE id=?");
        $stmt->bind_param("i", $id);
        //Parametrizar los datos i->entero
        return $stmt->execute();
    }
}
