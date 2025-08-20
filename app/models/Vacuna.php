<?php
require_once 'app/config/db.php';

class Vacuna {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    // Registrar vacuna para paciente
    public function registrarVacunaPaciente($nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_vacuna) {
        // Obtener ID del usuario desde la sesión
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user']['id'])) {
            error_log("ERROR: No hay sesión de usuario activa");
            return false;
        }
        
        $id_usuario = $_SESSION['user']['id'];
        error_log("DEBUG: Usuario en sesión: " . $id_usuario);
        
        $stmt = $this->db->prepare("
            INSERT INTO vacuna_paciente 
            (nombre_completo, fecha_vacunacion, tiempo_tratamiento, dosis, descripcion, id_usuario, id_vacuna) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sssssii", $nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_usuario, $id_vacuna);
        return $stmt->execute();
    }

    // Registrar vacuna para admin
    public function registrarVacunaAdmin($nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $cedula_paciente, $id_vacuna) {
        // Buscar el ID del paciente por cédula
        $paciente = $this->buscarPacientePorCedula($cedula_paciente);
        if (!$paciente) {
            error_log("ERROR: Paciente no encontrado con cédula: " . $cedula_paciente);
            return false;
        }
        
        $id_usuario = $paciente['id_usuario'];
        
        $stmt = $this->db->prepare("
            INSERT INTO vacuna_paciente 
            (nombre_completo, fecha_vacunacion, tiempo_tratamiento, dosis, descripcion, id_usuario, id_vacuna) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sssssii", $nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_usuario, $id_vacuna);
        return $stmt->execute();
    }

    // Obtener todas las vacunas de pacientes con información detallada (para admin)
    public function obtenerTodas() {
        $stmt = $this->db->prepare("
            SELECT vp.*, 
                   u.cedula_usuario, 
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_paciente,
                   v.nombre as nombre_vacuna
            FROM vacuna_paciente vp
            LEFT JOIN usuario u ON vp.id_usuario = u.id_usuario
            LEFT JOIN vacuna v ON vp.id_vacuna = v.id_vacuna
            ORDER BY vp.fecha_vacunacion DESC
        ");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener vacunas por usuario específico
    public function obtenerPorUsuario($id_usuario) {
        $stmt = $this->db->prepare("
            SELECT vp.*, 
                   v.nombre as nombre_vacuna
            FROM vacuna_paciente vp
            LEFT JOIN vacuna v ON vp.id_vacuna = v.id_vacuna
            WHERE vp.id_usuario = ? 
            ORDER BY vp.fecha_vacunacion DESC
        ");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener vacuna por ID
    public function obtenerPorId($id_vacuna_paciente) {
        $stmt = $this->db->prepare("
            SELECT vp.*, 
                   v.nombre as nombre_vacuna,
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_paciente_completo
            FROM vacuna_paciente vp
            LEFT JOIN vacuna v ON vp.id_vacuna = v.id_vacuna
            LEFT JOIN usuario u ON vp.id_usuario = u.id_usuario
            WHERE vp.id_vacuna_paciente = ?
        ");
        $stmt->bind_param("i", $id_vacuna_paciente);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Obtener vacuna de paciente por ID con detalles completos
    public function obtenerVacunaPacientePorId($id_vacuna_paciente) {
        $stmt = $this->db->prepare("
            SELECT vp.*, 
                   v.nombre as nombre_vacuna,
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_paciente
            FROM vacuna_paciente vp
            INNER JOIN usuario u ON vp.id_usuario = u.id_usuario
            LEFT JOIN vacuna v ON vp.id_vacuna = v.id_vacuna
            WHERE vp.id_vacuna_paciente = ?
        ");
        $stmt->bind_param("i", $id_vacuna_paciente);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Actualizar vacuna de paciente
    public function actualizar($id_vacuna_paciente, $nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_vacuna) {
        $stmt = $this->db->prepare("
            UPDATE vacuna_paciente 
            SET nombre_completo = ?, fecha_vacunacion = ?, tiempo_tratamiento = ?, 
                dosis = ?, descripcion = ?, id_vacuna = ? 
            WHERE id_vacuna_paciente = ?
        ");
        $stmt->bind_param("sssssii", $nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_vacuna, $id_vacuna_paciente);
        return $stmt->execute();
    }

    // Eliminar vacuna de paciente
    public function eliminar($id_vacuna_paciente) {
        $stmt = $this->db->prepare("DELETE FROM vacuna_paciente WHERE id_vacuna_paciente = ?");
        $stmt->bind_param("i", $id_vacuna_paciente);
        return $stmt->execute();
    }

    // Obtener vacunas disponibles en el catálogo
    public function obtenerVacunasDisponibles() {
        $stmt = $this->db->prepare("
            SELECT v.*, 
                   e.nombre as enfermedad,
                   ev.nombre as esquema_vacunacion,
                   va.nombre as via_administracion
            FROM vacuna v
            LEFT JOIN enfermedad e ON v.id_enfermedad = e.id_enfermedad
            LEFT JOIN esquema_vacunacion ev ON v.id_esquema_vacunacion = ev.id_esquema_vacunacion
            LEFT JOIN via_administracion va ON v.id_via_administracion = va.id_via_administracion
            WHERE v.id_estado = 1 
            ORDER BY v.nombre
        ");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener catálogo simple de vacunas (para formularios)
    public function obtenerCatalogoVacunas() {
        $stmt = $this->db->prepare("
            SELECT id_vacuna, nombre 
            FROM vacuna 
            WHERE id_estado = 1 
            ORDER BY nombre
        ");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Buscar paciente por cédula
    public function buscarPacientePorCedula($cedula) {
        $stmt = $this->db->prepare("
            SELECT u.id_usuario, u.cedula_usuario, 
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_completo,
                   u.nombre, u.apellidos, u.correo, u.telefono
            FROM usuario u
            WHERE u.cedula_usuario = ? AND u.id_rol = 3 AND u.id_estado = 1
        ");
        $stmt->bind_param("s", $cedula);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Obtener vacunas del usuario logueado
    public function obtenerVacunasUsuarioSesion() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user']['id'])) {
            error_log("ERROR: No hay sesión de usuario activa para obtener vacunas");
            return [];
        }
        
        $id_usuario = $_SESSION['user']['id'];
        error_log("DEBUG: Obteniendo vacunas para usuario: " . $id_usuario);
        
        return $this->obtenerPorUsuario($id_usuario);
    }

    // Obtener vacunas por fecha
    public function obtenerPorFecha($fecha) {
        $stmt = $this->db->prepare("
            SELECT vp.*, 
                   v.nombre as nombre_vacuna,
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_paciente_completo
            FROM vacuna_paciente vp
            LEFT JOIN vacuna v ON vp.id_vacuna = v.id_vacuna
            LEFT JOIN usuario u ON vp.id_usuario = u.id_usuario
            WHERE vp.fecha_vacunacion = ? 
            ORDER BY vp.nombre_completo
        ");
        $stmt->bind_param("s", $fecha);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Verificar si una vacuna ya está asignada a un paciente (para evitar duplicados)
    public function verificarVacunaAsignada($id_vacuna, $id_usuario) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total 
            FROM vacuna_paciente 
            WHERE id_vacuna = ? AND id_usuario = ?
        ");
        $stmt->bind_param("ii", $id_vacuna, $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['total'] > 0;
    }

    // Obtener estadísticas de vacunación por paciente
    public function obtenerEstadisticasPaciente($id_usuario) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total_vacunas,
                   COUNT(CASE WHEN YEAR(fecha_vacunacion) = YEAR(CURDATE()) THEN 1 END) as vacunas_este_ano
            FROM vacuna_paciente 
            WHERE id_usuario = ?
        ");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
}