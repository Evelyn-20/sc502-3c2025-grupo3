<?php
require_once 'app/models/Cita.php';

class CitaController {
    
    // Crear cita para administrador
    public function create() {
        $cita = new Cita();

        $fecha = $_POST['fecha'] ?? '';
        $hora = $_POST['hora'] ?? '';
        $cedula_paciente = $_POST['cedula_paciente'] ?? '';
        $id_medico = $_POST['id_medico'] ?? 0;
        $id_servicio = $_POST['id_servicio'] ?? 0;
        $id_especialidad = $_POST['id_especialidad'] ?? 0;
        $id_estado = $_POST['id_estado'] ?? 3; // CAMBIO: De 1 a 3 (Pendiente)

        if ($cita->registrarCitaAdmin($fecha, $hora, $cedula_paciente, $id_medico, $id_servicio, $id_especialidad, $id_estado)) {
            echo json_encode(['status' => 'success', 'message' => 'Cita registrada exitosamente']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar la cita']);
        }
    }

    // Crear cita para paciente
    public function createForPatient() {
        $cita = new Cita();

        $fecha = $_POST['fecha'] ?? '';
        $hora = $_POST['hora'] ?? '';
        $id_servicio = $_POST['id_servicio'] ?? 0;
        $id_especialidad = $_POST['id_especialidad'] ?? 0;
        $id_estado = $_POST['id_estado'] ?? 3; // CAMBIO: De 1 a 3 (Pendiente)

        if ($cita->registrarCitaPaciente($fecha, $hora, $id_servicio, $id_especialidad, $id_estado)) {
            echo json_encode(['status' => 'success', 'message' => 'Cita registrada exitosamente']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar la cita o no hay médicos disponibles']);
        }
    }

    // Listar todas las citas
    public function list() {
        $cita = new Cita();
        $citas = $cita->obtenerTodas();

        echo json_encode(['status' => 'success', 'data' => $citas]);
    }

    // Listar citas por usuario
    public function listByUser() {
        $cita = new Cita();
        $id_usuario = $_GET['id_usuario'] ?? 0;

        if ($id_usuario > 0) {
            $citas = $cita->obtenerPorUsuario($id_usuario);
            echo json_encode(['status' => 'success', 'data' => $citas]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID de usuario requerido']);
        }
    }

    // Listar citas del usuario en sesión
    public function listMyAppointments() {
        $cita = new Cita();
        $citas = $cita->obtenerCitasUsuarioSesion();

        echo json_encode(['status' => 'success', 'data' => $citas]);
    }

    // Mostrar una cita específica
    public function show() {
        $cita = new Cita();
        $id = $_GET['id'] ?? 0;

        $item = $cita->obtenerPorId($id);

        if ($item) {
            echo json_encode(['status' => 'success', 'data' => $item]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Cita no encontrada']);
        }
    }

    // Actualizar cita completa
    public function update() {
        $cita = new Cita();

        $id_cita = $_POST['id_cita'] ?? 0;
        $fecha = $_POST['fecha'] ?? '';
        $hora = $_POST['hora'] ?? '';
        $id_servicio = $_POST['id_servicio'] ?? 0;
        $id_especialidad = $_POST['id_especialidad'] ?? 0;
        $id_estado = $_POST['id_estado'] ?? 3; // CAMBIO: De 1 a 3 (Pendiente)

        // NUEVO: Buscar un médico disponible para la nueva fecha/hora/especialidad
        $id_medico = $cita->buscarMedicoDisponible($id_especialidad, $fecha, $hora);
        
        if (!$id_medico) {
            echo json_encode(['status' => 'error', 'message' => 'No hay médicos disponibles para esta fecha y hora']);
            return;
        }

        if ($cita->actualizar($id_cita, $fecha, $hora, $id_medico, $id_servicio, $id_especialidad, $id_estado)) {
            echo json_encode(['status' => 'success', 'message' => 'Cita actualizada exitosamente']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la cita']);
        }
    }

    // Actualizar solo el estado de la cita
    public function updateStatus() {
        $cita = new Cita();

        $id_cita = $_POST['id_cita'] ?? 0;
        $id_estado = $_POST['id_estado'] ?? 0;

        if ($cita->actualizarEstado($id_cita, $id_estado)) {
            echo json_encode(['status' => 'success', 'message' => 'Estado de cita actualizado']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el estado']);
        }
    }

    // Eliminar cita
    public function delete() {
        $cita = new Cita();
        $id = $_POST['id'] ?? 0;

        if ($cita->eliminar($id)) {
            echo json_encode(['status' => 'success', 'message' => 'Cita eliminada exitosamente']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar la cita']);
        }
    }

    // Verificar disponibilidad
    public function checkAvailability() {
        $cita = new Cita();
        
        $fecha = $_GET['fecha'] ?? '';
        $hora = $_GET['hora'] ?? '';
        $id_medico = $_GET['id_medico'] ?? 0;

        $disponible = $cita->verificarDisponibilidad($fecha, $hora, $id_medico);

        echo json_encode([
            'status' => 'success', 
            'disponible' => $disponible,
            'message' => $disponible ? 'Horario disponible' : 'Horario no disponible'
        ]);
    }

    // Obtener citas por fecha
    public function getByDate() {
        $cita = new Cita();
        $fecha = $_GET['fecha'] ?? '';

        if ($fecha) {
            $citas = $cita->obtenerPorFecha($fecha);
            echo json_encode(['status' => 'success', 'data' => $citas]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Fecha requerida']);
        }
    }

    // Obtener médicos disponibles
    public function getAvailableDoctors() {
        $cita = new Cita();
        
        $id_especialidad = $_GET['id_especialidad'] ?? 0;
        $fecha = $_GET['fecha'] ?? '';
        $hora = $_GET['hora'] ?? '';

        if ($id_especialidad && $fecha && $hora) {
            $medicos = $cita->obtenerMedicosDisponibles($id_especialidad, $fecha, $hora);
            echo json_encode(['status' => 'success', 'data' => $medicos]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Especialidad, fecha y hora requeridos']);
        }
    }

    // Buscar paciente por cédula
    public function searchPatient() {
        $cita = new Cita();
        $cedula = $_GET['cedula'] ?? '';

        if ($cedula) {
            $paciente = $cita->buscarPacientePorCedula($cedula);
            
            if ($paciente) {
                echo json_encode(['status' => 'success', 'data' => $paciente]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Cédula requerida']);
        }
    }

    // Obtener especialidades
    public function getSpecialties() {
        $cita = new Cita();
        $especialidades = $cita->obtenerEspecialidades();

        echo json_encode(['status' => 'success', 'data' => $especialidades]);
    }

    // Obtener servicios
    public function getServices() {
        $cita = new Cita();
        $servicios = $cita->obtenerServicios();

        echo json_encode(['status' => 'success', 'data' => $servicios]);
    }
}
?>