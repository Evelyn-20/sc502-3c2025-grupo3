<?php
require_once 'app/config/db.php';

class Expediente {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    // Obtener expediente completo del usuario en sesión
    public function obtenerPorUsuarioSesion() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user']['id'])) {
            return null;
        }
        
        return $this->obtenerPorUsuario($_SESSION['user']['id']);
    }

    // Obtener expediente por ID de usuario
    public function obtenerPorUsuario($id_usuario) {
        $stmt = $this->db->prepare("
            SELECT u.id_usuario, u.cedula_usuario, u.nombre, u.apellidos, u.correo, u.telefono,
                   u.fecha_nacimiento, u.direccion,
                   CASE 
                       WHEN u.id_genero = 1 THEN 'masculino'
                       WHEN u.id_genero = 2 THEN 'femenino'
                       WHEN u.id_genero = 3 THEN 'otro'
                       ELSE ''
                   END as genero,
                   CASE 
                       WHEN u.id_estado_civil = 1 THEN 'soltero'
                       WHEN u.id_estado_civil = 2 THEN 'casado'
                       WHEN u.id_estado_civil = 3 THEN 'divorciado'
                       WHEN u.id_estado_civil = 4 THEN 'viudo'
                       ELSE ''
                   END as estado_civil,
                   e.peso, e.altura, e.tipo_sangre, e.enfermedades, e.alergias, e.cirugias
            FROM usuario u
            LEFT JOIN expediente e ON u.id_usuario = e.id_usuario
            WHERE u.id_usuario = ? AND u.id_estado = 1
        ");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Obtener todos los expedientes (para admin)
    public function obtenerTodos() {
        $stmt = $this->db->prepare("
            SELECT u.id_usuario, u.cedula_usuario, 
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_completo,
                   u.correo, u.telefono, u.fecha_nacimiento,
                   CASE 
                       WHEN u.id_genero = 1 THEN 'masculino'
                       WHEN u.id_genero = 2 THEN 'femenino'
                       WHEN u.id_genero = 3 THEN 'otro'
                       ELSE ''
                   END as genero,
                   CASE 
                       WHEN u.id_estado_civil = 1 THEN 'soltero'
                       WHEN u.id_estado_civil = 2 THEN 'casado'
                       WHEN u.id_estado_civil = 3 THEN 'divorciado'
                       WHEN u.id_estado_civil = 4 THEN 'viudo'
                       ELSE ''
                   END as estado_civil,
                   e.peso, e.altura, e.tipo_sangre, e.enfermedades, e.alergias, e.cirugias
            FROM usuario u
            LEFT JOIN expediente e ON u.id_usuario = e.id_usuario
            WHERE u.id_rol = 3 AND u.id_estado = 1
            ORDER BY u.nombre, u.apellidos
        ");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Función auxiliar para convertir género string a ID
    private function getGeneroId($genero) {
        switch (strtolower($genero)) {
            case 'masculino': return 1;
            case 'femenino': return 2;
            case 'otro': return 3;
            default: return null;
        }
    }

    // Función auxiliar para convertir estado civil string a ID
    private function getEstadoCivilId($estado_civil) {
        switch (strtolower($estado_civil)) {
            case 'soltero': return 1;
            case 'casado': return 2;
            case 'divorciado': return 3;
            case 'viudo': return 4;
            default: return null;
        }
    }

    // Crear o actualizar expediente
    public function actualizarExpediente($correo, $telefono, $estado_civil, $fecha_nacimiento, $genero, $direccion, $peso, $altura, $tipo_sangre, $enfermedades, $alergias, $cirugias) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user']['id'])) {
            error_log("ERROR: No hay sesión de usuario activa");
            return false;
        }
        
        $id_usuario = $_SESSION['user']['id'];
        
        // Convertir valores string a IDs
        $id_genero = $this->getGeneroId($genero);
        $id_estado_civil = $this->getEstadoCivilId($estado_civil);
        
        // Iniciar transacción
        $this->db->begin_transaction();
        
        try {
            // Actualizar información personal en tabla usuario
            $stmt1 = $this->db->prepare("
                UPDATE usuario 
                SET correo = ?, telefono = ?, id_estado_civil = ?, fecha_nacimiento = ?, id_genero = ?, direccion = ?
                WHERE id_usuario = ?
            ");
            $stmt1->bind_param("ssisssi", $correo, $telefono, $id_estado_civil, $fecha_nacimiento, $id_genero, $direccion, $id_usuario);
            $stmt1->execute();

            // Verificar si ya existe un registro en expediente
            $stmt_check = $this->db->prepare("SELECT id_expediente FROM expediente WHERE id_usuario = ?");
            $stmt_check->bind_param("i", $id_usuario);
            $stmt_check->execute();
            $result = $stmt_check->get_result()->fetch_assoc();

            if ($result) {
                // Actualizar expediente existente
                $stmt2 = $this->db->prepare("
                    UPDATE expediente 
                    SET peso = ?, altura = ?, tipo_sangre = ?, enfermedades = ?, alergias = ?, cirugias = ?
                    WHERE id_usuario = ?
                ");
                $stmt2->bind_param("ssssssi", $peso, $altura, $tipo_sangre, $enfermedades, $alergias, $cirugias, $id_usuario);
            } else {
                // Crear nuevo expediente
                $stmt2 = $this->db->prepare("
                    INSERT INTO expediente (id_usuario, peso, altura, tipo_sangre, enfermedades, alergias, cirugias) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt2->bind_param("issssss", $id_usuario, $peso, $altura, $tipo_sangre, $enfermedades, $alergias, $cirugias);
            }
            
            $stmt2->execute();
            
            // Confirmar transacción
            $this->db->commit();
            return true;
            
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $this->db->rollback();
            error_log("ERROR actualizando expediente: " . $e->getMessage());
            return false;
        }
    }

    // Buscar paciente por cédula
    public function buscarPacientePorCedula($cedula) {
        $stmt = $this->db->prepare("
            SELECT u.id_usuario, u.cedula_usuario, 
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_completo,
                   u.nombre, u.apellidos, u.correo, u.telefono, 
                   u.fecha_nacimiento, u.direccion,
                   CASE 
                       WHEN u.id_genero = 1 THEN 'masculino'
                       WHEN u.id_genero = 2 THEN 'femenino'
                       WHEN u.id_genero = 3 THEN 'otro'
                       ELSE ''
                   END as genero,
                   CASE 
                       WHEN u.id_estado_civil = 1 THEN 'soltero'
                       WHEN u.id_estado_civil = 2 THEN 'casado'
                       WHEN u.id_estado_civil = 3 THEN 'divorciado'
                       WHEN u.id_estado_civil = 4 THEN 'viudo'
                       ELSE ''
                   END as estado_civil,
                   e.peso, e.altura, e.tipo_sangre, e.enfermedades, e.alergias, e.cirugias
            FROM usuario u
            LEFT JOIN expediente e ON u.id_usuario = e.id_usuario
            WHERE u.cedula_usuario = ? AND u.id_rol = 3 AND u.id_estado = 1
        ");
        $stmt->bind_param("s", $cedula);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Actualizar expediente por admin/médico (para otro usuario)
    public function actualizarExpedienteAdmin($id_usuario, $correo, $telefono, $estado_civil, $fecha_nacimiento, $genero, $direccion, $peso, $altura, $tipo_sangre, $enfermedades, $alergias, $cirugias) {
        // Convertir valores string a IDs
        $id_genero = $this->getGeneroId($genero);
        $id_estado_civil = $this->getEstadoCivilId($estado_civil);
        
        // Iniciar transacción
        $this->db->begin_transaction();
        
        try {
            // Actualizar información personal en tabla usuario
            $stmt1 = $this->db->prepare("
                UPDATE usuario 
                SET correo = ?, telefono = ?, id_estado_civil = ?, fecha_nacimiento = ?, id_genero = ?, direccion = ?
                WHERE id_usuario = ? AND id_rol = 3
            ");
            $stmt1->bind_param("ssisssi", $correo, $telefono, $id_estado_civil, $fecha_nacimiento, $id_genero, $direccion, $id_usuario);
            $stmt1->execute();

            // Verificar si ya existe un registro en expediente
            $stmt_check = $this->db->prepare("SELECT id_expediente FROM expediente WHERE id_usuario = ?");
            $stmt_check->bind_param("i", $id_usuario);
            $stmt_check->execute();
            $result = $stmt_check->get_result()->fetch_assoc();

            if ($result) {
                // Actualizar expediente existente
                $stmt2 = $this->db->prepare("
                    UPDATE expediente 
                    SET peso = ?, altura = ?, tipo_sangre = ?, enfermedades = ?, alergias = ?, cirugias = ?
                    WHERE id_usuario = ?
                ");
                $stmt2->bind_param("ssssssi", $peso, $altura, $tipo_sangre, $enfermedades, $alergias, $cirugias, $id_usuario);
            } else {
                // Crear nuevo expediente
                $stmt2 = $this->db->prepare("
                    INSERT INTO expediente (id_usuario, peso, altura, tipo_sangre, enfermedades, alergias, cirugias) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt2->bind_param("issssss", $id_usuario, $peso, $altura, $tipo_sangre, $enfermedades, $alergias, $cirugias);
            }
            
            $stmt2->execute();
            
            // Confirmar transacción
            $this->db->commit();
            return true;
            
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $this->db->rollback();
            error_log("ERROR actualizando expediente admin: " . $e->getMessage());
            return false;
        }
    }
}