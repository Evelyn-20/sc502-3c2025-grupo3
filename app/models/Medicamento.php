<?php
require_once 'app/config/db.php';

class Medicamento {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    // Asignar medicamento a un paciente
    public function asignarMedicamento($nombre_completo, $fecha_preescripcion, $tiempo_tratamiento, $indicaciones, $id_medicamento, $id_paciente, $id_estado = 1) {
        $stmt = $this->db->prepare("
            INSERT INTO medicamento_paciente 
            (nombre_completo, fecha_preescripcion, tiempo_tratamiento, indicaciones, id_medicamento, id_paciente, id_estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("ssssiii", $nombre_completo, $fecha_preescripcion, $tiempo_tratamiento, $indicaciones, $id_medicamento, $id_paciente, $id_estado);
        return $stmt->execute();
    }

    public function obtenerTodos() {
    $stmt = $this->db->prepare("
        SELECT m.*, 
               ff.nombre as forma_farmaceutica,
               gt.nombre as grupo_terapeutico,
               va.nombre as via_administracion,
               e.nombre as estado
        FROM medicamento m
        LEFT JOIN forma_farmaceutica ff ON m.id_forma_farmaceutica = ff.id_forma_farmaceutica
        LEFT JOIN grupo_terapeutico gt ON m.id_grupo_terapeutico = gt.id_grupo_farmaceutico
        LEFT JOIN via_administracion va ON m.id_via_administracion = va.id_via_administracion
        LEFT JOIN estado e ON m.id_estado = e.id_estado
        ORDER BY m.nombre ASC
    ");
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

    // Obtener medicamentos del usuario en sesión
    public function obtenerMedicamentosPacienteSesion() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user']['id'])) {
            return [];
        }
        
        return $this->obtenerMedicamentosPaciente($_SESSION['user']['id']);
    }

    // Obtener medicamentos de un paciente específico
    public function obtenerMedicamentosPaciente($id_paciente) {
        $stmt = $this->db->prepare("
            SELECT mp.*, 
                   m.nombre as nombre_medicamento,
                   ff.nombre as forma_farmaceutica,
                   gt.nombre as grupo_terapeutico,
                   va.nombre as via_administracion,
                   e.nombre as estado
            FROM medicamento_paciente mp
            INNER JOIN medicamento m ON mp.id_medicamento = m.id_medicamento
            LEFT JOIN forma_farmaceutica ff ON m.id_forma_farmaceutica = ff.id_forma_farmaceutica
            LEFT JOIN grupo_terapeutico gt ON m.id_grupo_terapeutico = gt.id_grupo_farmaceutico
            LEFT JOIN via_administracion va ON m.id_via_administracion = va.id_via_administracion
            LEFT JOIN estado e ON mp.id_estado = e.id_estado
            WHERE mp.id_paciente = ?
            ORDER BY mp.fecha_preescripcion DESC
        ");
        $stmt->bind_param("i", $id_paciente);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener un medicamento específico asignado a un paciente
    public function obtenerMedicamentoPacientePorId($id_medicamento_paciente) {
        $stmt = $this->db->prepare("
            SELECT mp.*, 
                   m.nombre as nombre_medicamento,
                   ff.nombre as forma_farmaceutica,
                   gt.nombre as grupo_terapeutico,
                   va.nombre as via_administracion
            FROM medicamento_paciente mp
            INNER JOIN medicamento m ON mp.id_medicamento = m.id_medicamento
            LEFT JOIN forma_farmaceutica ff ON m.id_forma_farmaceutica = ff.id_forma_farmaceutica
            LEFT JOIN grupo_terapeutico gt ON m.id_grupo_terapeutico = gt.id_grupo_farmaceutico
            LEFT JOIN via_administracion va ON m.id_via_administracion = va.id_via_administracion
            WHERE mp.id_medicamento_paciente = ?
        ");
        $stmt->bind_param("i", $id_medicamento_paciente);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Actualizar medicamento asignado a paciente
    public function actualizarMedicamentoPaciente($id_medicamento_paciente, $nombre_completo, $fecha_preescripcion, $tiempo_tratamiento, $indicaciones, $id_medicamento, $id_estado) {
        $stmt = $this->db->prepare("
            UPDATE medicamento_paciente 
            SET nombre_completo = ?, fecha_preescripcion = ?, tiempo_tratamiento = ?, 
                indicaciones = ?, id_medicamento = ?, id_estado = ?
            WHERE id_medicamento_paciente = ?
        ");
        $stmt->bind_param("ssssiiii", $nombre_completo, $fecha_preescripcion, $tiempo_tratamiento, $indicaciones, $id_medicamento, $id_estado, $id_medicamento_paciente);
        return $stmt->execute();
    }

    // Actualizar estado de medicamento asignado
    public function actualizarEstadoMedicamentoPaciente($id_medicamento_paciente, $id_estado) {
        $stmt = $this->db->prepare("UPDATE medicamento_paciente SET id_estado = ? WHERE id_medicamento_paciente = ?");
        $stmt->bind_param("ii", $id_estado, $id_medicamento_paciente);
        return $stmt->execute();
    }

    // Eliminar medicamento asignado
    public function eliminarMedicamentoPaciente($id_medicamento_paciente) {
        $stmt = $this->db->prepare("DELETE FROM medicamento_paciente WHERE id_medicamento_paciente = ?");
        $stmt->bind_param("i", $id_medicamento_paciente);
        return $stmt->execute();
    }

    // Obtener medicamentos activos de un paciente
    public function obtenerMedicamentosActivosPaciente($id_paciente) {
        $stmt = $this->db->prepare("
            SELECT mp.*, 
                   m.nombre as nombre_medicamento,
                   ff.nombre as forma_farmaceutica,
                   gt.nombre as grupo_terapeutico,
                   va.nombre as via_administracion
            FROM medicamento_paciente mp
            INNER JOIN medicamento m ON mp.id_medicamento = m.id_medicamento
            LEFT JOIN forma_farmaceutica ff ON m.id_forma_farmaceutica = ff.id_forma_farmaceutica
            LEFT JOIN grupo_terapeutico gt ON m.id_grupo_terapeutico = gt.id_grupo_farmaceutico
            LEFT JOIN via_administracion va ON m.id_via_administracion = va.id_via_administracion
            WHERE mp.id_paciente = ? AND mp.id_estado = 1
            ORDER BY mp.fecha_preescripcion DESC
        ");
        $stmt->bind_param("i", $id_paciente);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Verificar si un medicamento ya está asignado a un paciente (para evitar duplicados)
    public function verificarMedicamentoAsignado($id_medicamento, $id_paciente) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total 
            FROM medicamento_paciente 
            WHERE id_medicamento = ? AND id_paciente = ? AND id_estado = 1
        ");
        $stmt->bind_param("ii", $id_medicamento, $id_paciente);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['total'] > 0;
    }

    // Buscar paciente por cédula (para médicos que asignan medicamentos)
    public function buscarPacientePorCedula($cedula) {
        $stmt = $this->db->prepare("
            SELECT u.id_usuario, u.cedula_usuario, 
                   CONCAT(u.nombre, ' ', u.apellidos) as nombre_completo
            FROM usuario u
            WHERE u.cedula_usuario = ? AND u.id_rol = 3 AND u.id_estado = 1
        ");
        $stmt->bind_param("s", $cedula);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Crear medicamento
    public function crear($nombre, $id_forma_farmaceutica, $id_grupo_terapeutico, $id_via_administracion, $id_estado = 1) {
        $stmt = $this->db->prepare("
            INSERT INTO medicamento (nombre, id_forma_farmaceutica, id_grupo_terapeutico, id_via_administracion, id_estado) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("siiii", $nombre, $id_forma_farmaceutica, $id_grupo_terapeutico, $id_via_administracion, $id_estado);
        return $stmt->execute();
    }

    // Obtener medicamento por ID
    public function obtenerPorId($id_medicamento) {
        $stmt = $this->db->prepare("
            SELECT m.*, 
                   ff.nombre as forma_farmaceutica,
                   gt.nombre as grupo_terapeutico,
                   va.nombre as via_administracion,
                   e.nombre as estado
            FROM medicamento m
            LEFT JOIN forma_farmaceutica ff ON m.id_forma_farmaceutica = ff.id_forma_farmaceutica
            LEFT JOIN grupo_terapeutico gt ON m.id_grupo_terapeutico = gt.id_grupo_farmaceutico
            LEFT JOIN via_administracion va ON m.id_via_administracion = va.id_via_administracion
            LEFT JOIN estado e ON m.id_estado = e.id_estado
            WHERE m.id_medicamento = ?
        ");
        $stmt->bind_param("i", $id_medicamento);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Actualizar medicamento
    public function actualizar($id_medicamento, $nombre, $id_forma_farmaceutica, $id_grupo_terapeutico, $id_via_administracion, $id_estado) {
        $stmt = $this->db->prepare("
            UPDATE medicamento 
            SET nombre = ?, id_forma_farmaceutica = ?, id_grupo_terapeutico = ?, 
                id_via_administracion = ?, id_estado = ?
            WHERE id_medicamento = ?
        ");
        $stmt->bind_param("siiiii", $nombre, $id_forma_farmaceutica, $id_grupo_terapeutico, $id_via_administracion, $id_estado, $id_medicamento);
        return $stmt->execute();
    }

    // Actualizar estado del medicamento
    public function actualizarEstado($id_medicamento, $id_estado) {
        $stmt = $this->db->prepare("UPDATE medicamento SET id_estado = ? WHERE id_medicamento = ?");
        $stmt->bind_param("ii", $id_estado, $id_medicamento);
        return $stmt->execute();
    }

    // Eliminar medicamento
    public function eliminar($id_medicamento) {
        $stmt = $this->db->prepare("DELETE FROM medicamento WHERE id_medicamento = ?");
        $stmt->bind_param("i", $id_medicamento);
        return $stmt->execute();
    }

    // Buscar medicamentos
    public function buscar($termino) {
        $termino = "%$termino%";
        $stmt = $this->db->prepare("
            SELECT m.*, 
                   ff.nombre as forma_farmaceutica,
                   gt.nombre as grupo_terapeutico,
                   va.nombre as via_administracion,
                   e.nombre as estado
            FROM medicamento m
            LEFT JOIN forma_farmaceutica ff ON m.id_forma_farmaceutica = ff.id_forma_farmaceutica
            LEFT JOIN grupo_terapeutico gt ON m.id_grupo_terapeutico = gt.id_grupo_farmaceutico
            LEFT JOIN via_administracion va ON m.id_via_administracion = va.id_via_administracion
            LEFT JOIN estado e ON m.id_estado = e.id_estado
            WHERE m.nombre LIKE ? OR ff.nombre LIKE ? OR gt.nombre LIKE ? OR va.nombre LIKE ?
            ORDER BY m.nombre ASC
        ");
        $stmt->bind_param("ssss", $termino, $termino, $termino, $termino);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener formas farmacéuticas
    public function obtenerFormasFarmaceuticas() {
        $stmt = $this->db->prepare("SELECT * FROM forma_farmaceutica WHERE id_estado = 1 ORDER BY nombre");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener grupos terapéuticos
    public function obtenerGruposTerapeuticos() {
        $stmt = $this->db->prepare("SELECT * FROM grupo_terapeutico WHERE id_estado = 1 ORDER BY nombre");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Obtener vías de administración
    public function obtenerViasAdministracion() {
        $stmt = $this->db->prepare("SELECT * FROM via_administracion WHERE id_estado = 1 ORDER BY nombre");
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}
?>