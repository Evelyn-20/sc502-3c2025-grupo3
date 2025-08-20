<?php
require_once 'app/config/db.php';

class Rol {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function getAll($onlyActive = false) {
        $sql = "SELECT id_rol, nombre, descripcion, id_estado FROM rol";
        if ($onlyActive) {
            $sql .= " WHERE id_estado = 1";
        }
        $sql .= " ORDER BY id_rol ASC";
        $result = $this->db->query($sql);
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT id_rol, nombre, descripcion, id_estado FROM rol WHERE id_rol = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function create($nombre, $descripcion, $id_estado = 1) {
        $stmt = $this->db->prepare("INSERT INTO rol (nombre, descripcion, id_estado) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $nombre, $descripcion, $id_estado);
        return $stmt->execute();
    }

    public function update($id, $nombre, $descripcion, $id_estado) {
        $stmt = $this->db->prepare("UPDATE rol SET nombre = ?, descripcion = ?, id_estado = ? WHERE id_rol = ?");
        $stmt->bind_param("ssii", $nombre, $descripcion, $id_estado, $id);
        return $stmt->execute();
    }

    public function setEstado($id, $id_estado) {
        $stmt = $this->db->prepare("UPDATE rol SET id_estado = ? WHERE id_rol = ?");
        $stmt->bind_param("ii", $id_estado, $id);
        return $stmt->execute();
    }
}
?>
