<?php
require_once 'app/models/Expediente.php';

class ExpedienteController {
    
    // Mostrar expediente del usuario en sesión
    public function show() {
        $expediente = new Expediente();
        $data = $expediente->obtenerPorUsuarioSesion();

        if ($data) {
            echo json_encode(['status' => 'success', 'data' => $data]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Expediente no encontrado']);
        }
    }

    // Mostrar expediente por ID de usuario (para admin/medico)
    public function showByUser() {
        $expediente = new Expediente();
        $id_usuario = $_GET['id_usuario'] ?? 0;

        if ($id_usuario > 0) {
            $data = $expediente->obtenerPorUsuario($id_usuario);
            if ($data) {
                echo json_encode(['status' => 'success', 'data' => $data]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Expediente no encontrado']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID de usuario requerido']);
        }
    }

    // Crear o actualizar expediente
    public function update() {
        $expediente = new Expediente();

        // Información personal
        $correo = $_POST['correo'] ?? '';
        $telefono = $_POST['telefono'] ?? '';
        $estado_civil = $_POST['estado_civil'] ?? '';
        $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? '';
        $genero = $_POST['genero'] ?? '';
        $direccion = $_POST['direccion'] ?? '';

        // Información médica
        $peso = $_POST['peso'] ?? '';
        $altura = $_POST['altura'] ?? '';
        $tipo_sangre = $_POST['tipo_sangre'] ?? '';
        $enfermedades = $_POST['enfermedades'] ?? '';
        $alergias = $_POST['alergias'] ?? '';
        $cirugias = $_POST['cirugias'] ?? '';

        if ($expediente->actualizarExpediente($correo, $telefono, $estado_civil, $fecha_nacimiento, $genero, $direccion, $peso, $altura, $tipo_sangre, $enfermedades, $alergias, $cirugias)) {
            echo json_encode(['status' => 'success', 'message' => 'Expediente actualizado exitosamente']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el expediente']);
        }
    }

    // Buscar paciente por cédula (para médicos/admin)
    public function searchPatient() {
        $expediente = new Expediente();
        $cedula = $_GET['cedula'] ?? '';

        if ($cedula) {
            $paciente = $expediente->buscarPacientePorCedula($cedula);
            
            if ($paciente) {
                echo json_encode(['status' => 'success', 'data' => $paciente]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Cédula requerida']);
        }
    }

    // Listar todos los expedientes (para admin)
    public function list() {
        $expediente = new Expediente();
        $expedientes = $expediente->obtenerTodos();

        echo json_encode(['status' => 'success', 'data' => $expedientes]);
    }
}
?>