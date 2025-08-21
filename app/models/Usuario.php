<?php
require_once 'app/config/db.php';

class Usuario {
    private $db;
    public function __construct() { $this->db = Database::connect(); }

    public function login($cedula, $password) {
        $stmt = $this->db->prepare("SELECT u.*, r.nombre AS rol_nombre FROM usuario u
            INNER JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.cedula_usuario = ? AND u.id_estado = 1 LIMIT 1");
        $stmt->bind_param("s", $cedula);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if (!$user) return false;

        $stored = $user['contrasena'];
        $ok = false;
        if (preg_match('/^\$2[aby]\$/', $stored)) {
            $ok = password_verify($password, $stored);
        } else {
            $ok = ($password === $stored);
        }
        if (!$ok) return false;

        return [
            'id_usuario' => (int)$user['id_usuario'],
            'cedula_usuario' => $user['cedula_usuario'],
            'nombre' => $user['nombre'],
            'apellidos' => $user['apellidos'],
            'correo' => $user['correo'],
            'telefono' => $user['telefono'],
            'fecha_nacimiento' => $user['fecha_nacimiento'],
            'direccion' => $user['direccion'],
            'id_rol' => (int)$user['id_rol'],
            'rol_nombre' => $user['rol_nombre'],
            'id_estado' => (int)$user['id_estado'],
        ];
    }

<<<<<<< Updated upstream
    private function emailExists($email) {
        $stmt = $this->db->prepare("SELECT id_usuario FROM usuario WHERE correo = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
    }
}
=======
    public function getAll() {
        $sql = "SELECT id_usuario, cedula_usuario, nombre, apellidos, correo, telefono, fecha_nacimiento, direccion, id_rol, id_estado
                FROM usuario ORDER BY id_usuario ASC";
        $res = $this->db->query($sql);
        $out = [];
        while ($row = $res->fetch_assoc()) $out[] = $row;
        return $out;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT id_usuario, cedula_usuario, nombre, apellidos, correo, telefono, fecha_nacimiento, direccion, id_rol, id_estado
                                    FROM usuario WHERE id_usuario=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO usuario
            (cedula_usuario, nombre, apellidos, correo, telefono, fecha_nacimiento, direccion, contrasena, id_genero, id_estado_civil, id_rol, id_estado)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
        $contrasena = $data['contrasena'];
        // keep plain if needed for compatibility; optionally hash if requested
        $stmt->bind_param("ssssssssssii",
            $data['cedula_usuario'],
            $data['nombre'],
            $data['apellidos'],
            $data['correo'],
            $data['telefono'],
            $data['fecha_nacimiento'],
            $data['direccion'],
            $contrasena,
            $data['id_genero'],
            $data['id_estado_civil'],
            $data['id_rol'],
            $data['id_estado']
        );
        $stmt->execute();
        return $this->db->insert_id;
    }

    public function update($data) {
        // Build dynamic update with/without password
        if (isset($data['contrasena']) && $data['contrasena'] !== '') {
            $stmt = $this->db->prepare("UPDATE usuario SET
                cedula_usuario=?, nombre=?, apellidos=?, correo=?, telefono=?, fecha_nacimiento=?, direccion=?, contrasena=?, id_genero=?, id_estado_civil=?, id_rol=?, id_estado=?
                WHERE id_usuario=?");
            $stmt->bind_param("ssssssssssiii",
                $data['cedula_usuario'], $data['nombre'], $data['apellidos'], $data['correo'], $data['telefono'],
                $data['fecha_nacimiento'], $data['direccion'], $data['contrasena'], $data['id_genero'], $data['id_estado_civil'],
                $data['id_rol'], $data['id_estado'], $data['id_usuario']
            );
        } else {
            $stmt = $this->db->prepare("UPDATE usuario SET
                cedula_usuario=?, nombre=?, apellidos=?, correo=?, telefono=?, fecha_nacimiento=?, direccion=?, id_genero=?, id_estado_civil=?, id_rol=?, id_estado=?
                WHERE id_usuario=?");
            $stmt->bind_param("ssssssssiiii",
                $data['cedula_usuario'], $data['nombre'], $data['apellidos'], $data['correo'], $data['telefono'],
                $data['fecha_nacimiento'], $data['direccion'], $data['id_genero'], $data['id_estado_civil'],
                $data['id_rol'], $data['id_estado'], $data['id_usuario']
            );
        }
        return $stmt->execute();
    }

    public function setEstado($id, $estado) {
        $stmt = $this->db->prepare("UPDATE usuario SET id_estado=? WHERE id_usuario=?");
        $stmt->bind_param("ii", $estado, $id);
        return $stmt->execute();
    }
}
?>
>>>>>>> Stashed changes
