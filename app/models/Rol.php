<?php
<<<<<<< Updated upstream
=======
require_once 'app/config/db.php';

class Rol {
    private $db;
    public function __construct() {
        $this->db = Database::connect();
    }

    public function getAll() {
        $res = $this->db->query("SELECT * FROM rol ORDER BY id_rol ASC");
        $out = [];
        while ($row = $res->fetch_assoc()) $out[] = $row;
        return $out;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM rol WHERE id_rol = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO rol (nombre, descripcion, id_estado) VALUES (?,?,?)");
        $stmt->bind_param("ssi", $data['nombre'], $data['descripcion'], $data['id_estado']);
        $stmt->execute();
        return $this->db->insert_id;
    }

    public function update($data) {
        $stmt = $this->db->prepare("UPDATE rol SET nombre=?, descripcion=?, id_estado=? WHERE id_rol=?");
        $stmt->bind_param("ssii", $data['nombre'], $data['descripcion'], $data['id_estado'], $data['id_rol']);
        return $stmt->execute();
    }

    public function setEstado($id, $estado) {
        $stmt = $this->db->prepare("UPDATE rol SET id_estado=? WHERE id_rol=?");
        $stmt->bind_param("ii", $estado, $id);
        return $stmt->execute();
    }
}
?>
>>>>>>> Stashed changes
