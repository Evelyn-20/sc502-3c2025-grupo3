<?php
require_once 'app/config/db.php';

class Cita {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    // Registrar cita para paciente
    public function registrarCitaPaciente($fecha, $hora, $id_servicio, $id_especialidad, $id_estado = 1) {
        // Obtener ID del usuario desde la sesión
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        // CAMBIO: Usar la estructura correcta de sesión
        if (!isset($_SESSION['user']['id'])) {
            error_log("ERROR: No hay sesión de usuario activa");
            return false;
        }
        
        $id_usuario = $_SESSION['user']['id']; // CAMBIO: era $_SESSION['id_usuario']
        error_log("DEBUG: Usuario en sesión: " . $id_usuario);
        
        // Buscar un médico disponible para esa especialidad en esa fecha y hora
        $id_medico = $this->buscarMedicoDisponible($id_especialidad, $fecha, $hora);
        
        if (!$id_medico) {
            error_log("ERROR: No hay médicos disponibles");
            return false;
        }
        
        error_log("DEBUG: Médico encontrado ID: " . $id_medico);
        
        $stmt = $this->db->prepare("INSERT INTO cita (fecha, hora, id_usuario, id_medico, id_servicio, id_especialidad, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssiiiii", $fecha, $hora, $id_usuario, $id_medico, $id_servicio, $id_especialidad, $id_estado);
        return $stmt->execute();
    }

    // Registrar cita para admin
    public function registrarCitaAdmin($fecha, $hora, $cedula_paciente, $id_medico, $id_servicio, $id_especialidad, $id_estado = 1) {
        // Buscar el ID del paciente por cédula
        $paciente = $this->buscarPacientePorCedula($cedula_paciente);
        if (!$paciente) {
            return false; // Paciente no encontrado
        }
        
        $id_usuario = $paciente['id_usuario'];
        
        // Verificar disponibilidad del médico
        if (!$this->verificarDisponibilidad($fecha, $hora, $id_medico)) {
            return false; // Médico no disponible
        }
        
        $stmt = $this->db->prepare("INSERT INTO cita (fecha, hora, id_usuario, id_medico, id_servicio, id_especialidad, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssiiiii", $fecha, $hora, $id_usuario, $id_medico, $id_servicio, $id_especialidad, $id_estado);
        return $stmt->execute();
    }

    // Obtener todas las citas con información detallada
    public function obtenerTodas() {
        $stmt = $this->db->prepare("
            SELECT c.*, 
                   u.cedula_usuario, 
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_paciente,
                   CONCAT(m.nombre, ' ', m.apellidos) as nombre_medico,
                   s.nombre as nombre_servicio,
                   e.nombre as nombre_especialidad,
                   est.nombre as nombre_estado
            FROM cita c
            LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
            LEFT JOIN usuario m ON c.id_medico = m.id_usuario
            LEFT JOIN servicio s ON c.id_servicio = s.id_servicio
            LEFT JOIN especialidad e ON c.id_especialidad = e.id_especialidad
            LEFT JOIN estado est ON c.id_estado = est.id_estado
            ORDER BY c.fecha DESC, c.hora DESC
        ");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener citas por usuario
    public function obtenerPorUsuario($id_usuario) {
        $stmt = $this->db->prepare("
            SELECT c.*, 
                   CONCAT(m.nombre, ' ', m.apellidos) as nombre_medico,
                   s.nombre as nombre_servicio,
                   e.nombre as nombre_especialidad,
                   est.nombre as nombre_estado
            FROM cita c
            LEFT JOIN usuario m ON c.id_medico = m.id_usuario
            LEFT JOIN servicio s ON c.id_servicio = s.id_servicio
            LEFT JOIN especialidad e ON c.id_especialidad = e.id_especialidad
            LEFT JOIN estado est ON c.id_estado = est.id_estado
            WHERE c.id_usuario = ? 
            ORDER BY c.fecha DESC, c.hora DESC
        ");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener cita por ID
    public function obtenerPorId($id_cita) {
        $stmt = $this->db->prepare("SELECT * FROM cita WHERE id_cita = ?");
        $stmt->bind_param("i", $id_cita);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Actualizar estado de la cita
    public function actualizarEstado($id_cita, $id_estado) {
        $stmt = $this->db->prepare("UPDATE cita SET id_estado = ? WHERE id_cita = ?");
        $stmt->bind_param("ii", $id_estado, $id_cita);
        return $stmt->execute();
    }

    // Actualizar cita completa
    public function actualizar($id_cita, $fecha, $hora, $id_medico, $id_servicio, $id_especialidad, $id_estado) {
        $stmt = $this->db->prepare("UPDATE cita SET fecha = ?, hora = ?, id_medico = ?, id_servicio = ?, id_especialidad = ?, id_estado = ? WHERE id_cita = ?");
        $stmt->bind_param("ssiiiii", $fecha, $hora, $id_medico, $id_servicio, $id_especialidad, $id_estado, $id_cita);
        return $stmt->execute();
    }

    // Eliminar cita
    public function eliminar($id_cita) {
        $stmt = $this->db->prepare("DELETE FROM cita WHERE id_cita = ?");
        $stmt->bind_param("i", $id_cita);
        return $stmt->execute();
    }

    // Verificar disponibilidad de hora
    public function verificarDisponibilidad($fecha, $hora, $id_medico) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM cita WHERE fecha = ? AND hora = ? AND id_medico = ? AND id_estado != 4");
        $stmt->bind_param("ssi", $fecha, $hora, $id_medico);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['total'] == 0;
    }

    // Obtener citas por fecha
    public function obtenerPorFecha($fecha) {
        $stmt = $this->db->prepare("SELECT * FROM cita WHERE fecha = ? ORDER BY hora");
        $stmt->bind_param("s", $fecha);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Buscar médico disponible para una especialidad en fecha y hora específica
    public function buscarMedicoDisponible($id_especialidad, $fecha, $hora) {
        $stmt = $this->db->prepare("
            SELECT u.id_usuario
            FROM usuario u
            INNER JOIN medico_especialidad me ON u.id_usuario = me.id_medico
            LEFT JOIN cita c ON u.id_usuario = c.id_medico AND c.fecha = ? AND c.hora = ? AND c.id_estado != 4
            WHERE u.id_rol = 2 
            AND u.id_estado = 1 
            AND me.id_especialidad = ?
            AND me.id_estado = 1
            AND c.id_cita IS NULL
            ORDER BY RAND()
            LIMIT 1
        ");
        $stmt->bind_param("ssi", $fecha, $hora, $id_especialidad);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result ? $result['id_usuario'] : null;
    }

    // Obtener médicos disponibles por especialidad para una fecha y hora
    public function obtenerMedicosDisponibles($id_especialidad, $fecha, $hora) {
        $stmt = $this->db->prepare("
            SELECT u.id_usuario, CONCAT(u.nombre, ' ', u.apellidos) as nombre_completo
            FROM usuario u
            INNER JOIN medico_especialidad me ON u.id_usuario = me.id_medico
            LEFT JOIN cita c ON u.id_usuario = c.id_medico AND c.fecha = ? AND c.hora = ? AND c.id_estado != 4
            WHERE u.id_rol = 2 
            AND u.id_estado = 1 
            AND me.id_especialidad = ?
            AND me.id_estado = 1
            AND c.id_cita IS NULL
            ORDER BY u.nombre
        ");
        $stmt->bind_param("ssi", $fecha, $hora, $id_especialidad);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener especialidades disponibles
    public function obtenerEspecialidades() {
        $stmt = $this->db->prepare("SELECT * FROM especialidad ORDER BY nombre");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener servicios disponibles
    public function obtenerServicios() {
        $stmt = $this->db->prepare("SELECT * FROM servicio ORDER BY nombre");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Buscar paciente por cédula y retornar datos para autocompletar
    public function buscarPacientePorCedula($cedula) {
        $stmt = $this->db->prepare("
            SELECT id_usuario, cedula_usuario, CONCAT(nombre, ' ', apellidos) as nombre_completo,
                   nombre, apellidos, correo, telefono
            FROM usuario 
            WHERE cedula_usuario = ? AND id_rol = 3 AND id_estado = 1
        ");
        $stmt->bind_param("i", $cedula);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Obtener citas del usuario logueado
    public function obtenerCitasUsuarioSesion() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        // CAMBIO: Usar la estructura correcta de sesión
        if (!isset($_SESSION['user']['id'])) {
            return [];
        }
        
        return $this->obtenerPorUsuario($_SESSION['user']['id']); // CAMBIO: era $_SESSION['id_usuario']
    }

    // Obtener citas por médico con fecha opcional
    public function obtenerPorMedico($id_medico, $fecha = null) {
        if ($fecha) {
            $stmt = $this->db->prepare("
                SELECT c.*, 
                       u.cedula_usuario, 
                       CONCAT(u.nombre, ' ', u.apellidos) as nombre_paciente,
                       s.nombre as nombre_servicio,
                       e.nombre as nombre_especialidad,
                       est.nombre as nombre_estado
                FROM cita c
                LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
                LEFT JOIN servicio s ON c.id_servicio = s.id_servicio
                LEFT JOIN especialidad e ON c.id_especialidad = e.id_especialidad
                LEFT JOIN estado est ON c.id_estado = est.id_estado
                WHERE c.id_medico = ? AND c.fecha = ? 
                ORDER BY c.hora
            ");
            $stmt->bind_param("is", $id_medico, $fecha);
        } else {
            $stmt = $this->db->prepare("
                SELECT c.*, 
                       u.cedula_usuario, 
                       CONCAT(u.nombre, ' ', u.apellidos) as nombre_paciente,
                       s.nombre as nombre_servicio,
                       e.nombre as nombre_especialidad,
                       est.nombre as nombre_estado
                FROM cita c
                LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
                LEFT JOIN servicio s ON c.id_servicio = s.id_servicio
                LEFT JOIN especialidad e ON c.id_especialidad = e.id_especialidad
                LEFT JOIN estado est ON c.id_estado = est.id_estado
                WHERE c.id_medico = ? 
                ORDER BY c.fecha DESC, c.hora DESC
            ");
            $stmt->bind_param("i", $id_medico);
        }
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}
?>