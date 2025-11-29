<?php
require_once "../conexion.php";

class UsersModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    }

    public function get($phon)
    {
        $sql = "SELECT id, username, phone FROM users WHERE phone = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $phon);
        $stmt->execute();
        $resultado = $stmt->get_result();

        $users = [];
        while ($fila = $resultado->fetch_assoc()) {
            $users[] = $fila;
        }

        $stmt->close();
        return $users;
    }

    public function createUser($phone, $name)
    {
        $stmt = $this->conn->prepare("INSERT INTO users (phone, username) VALUES (?, ?)");
        if (!$stmt) {
            return false;
        }
        if (!$stmt->bind_param("ss", $phone, $name)) {
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
        $stmt = $this->conn->prepare("UPDATE users SET name=?, last_name=?, phone=?, address=? WHERE id=?");
        $stmt->bind_param("ssssi", $data['name'], $data['last_name'], $data['phone'], $data['address'], $data['id']);
        //Parametrizar los datos s->string i->entero
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
?>