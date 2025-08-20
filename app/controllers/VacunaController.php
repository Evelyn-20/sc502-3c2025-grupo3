<?php
require_once 'app/models/Vacuna.php';

class VacunaController {
    
    // Crear vacuna para administrador
    public function create() {
        try {
            $vacuna = new Vacuna();

            $nombre_completo = $_POST['nombre_completo'] ?? '';
            $fecha_vacunacion = $_POST['fecha_vacunacion'] ?? '';
            $tiempo_tratamiento = $_POST['tiempo_tratamiento'] ?? '';
            $dosis = $_POST['dosis'] ?? '';
            $descripcion = $_POST['descripcion'] ?? '';
            $cedula_paciente = $_POST['cedula_paciente'] ?? '';
            $id_vacuna = $_POST['id_vacuna'] ?? 0;

            // Validaciones básicas
            if (empty($nombre_completo) || empty($fecha_vacunacion) || empty($tiempo_tratamiento) || 
                empty($dosis) || empty($cedula_paciente) || $id_vacuna == 0) {
                echo json_encode(['status' => 'error', 'message' => 'Todos los campos son requeridos']);
                return;
            }

            if ($vacuna->registrarVacunaAdmin($nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $cedula_paciente, $id_vacuna)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacuna registrada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar la vacuna']);
            }
        } catch (Exception $e) {
            error_log("Error en create vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al registrar la vacuna']);
        }
    }

    // Crear vacuna para paciente
    public function createForPatient() {
        try {
            $vacuna = new Vacuna();

            $nombre_completo = $_POST['nombre_completo'] ?? '';
            $fecha_vacunacion = $_POST['fecha_vacunacion'] ?? '';
            $tiempo_tratamiento = $_POST['tiempo_tratamiento'] ?? '';
            $dosis = $_POST['dosis'] ?? '';
            $descripcion = $_POST['descripcion'] ?? '';
            $id_vacuna = $_POST['id_vacuna'] ?? 0;

            // Validaciones básicas
            if (empty($nombre_completo) || empty($fecha_vacunacion) || empty($tiempo_tratamiento) || 
                empty($dosis) || $id_vacuna == 0) {
                echo json_encode(['status' => 'error', 'message' => 'Todos los campos son requeridos']);
                return;
            }

            if ($vacuna->registrarVacunaPaciente($nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_vacuna)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacuna registrada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar la vacuna']);
            }
        } catch (Exception $e) {
            error_log("Error en createForPatient vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al registrar la vacuna']);
        }
    }

    // Listar todas las vacunas (para admin)
    public function list() {
        try {
            $vacuna = new Vacuna();
            $vacunas = $vacuna->obtenerTodas();

            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en list vacunas: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener las vacunas']);
        }
    }

    // Listar vacunas por usuario específico (para admin)
    public function listByUser() {
        try {
            $vacuna = new Vacuna();
            $id_usuario = $_GET['id_usuario'] ?? 0;

            if ($id_usuario == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID de usuario requerido']);
                return;
            }

            $vacunas = $vacuna->obtenerPorUsuario($id_usuario);
            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en listByUser vacunas: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener las vacunas del usuario']);
        }
    }

    // Listar vacunas del usuario en sesión (para paciente)
    public function listMyVaccines() {
        try {
            $vacuna = new Vacuna();
            $vacunas = $vacuna->obtenerVacunasUsuarioSesion();

            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en listMyVaccines: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener tus vacunas']);
        }
    }

    // Mostrar una vacuna específica
    public function show() {
        try {
            $vacuna = new Vacuna();
            $id = $_GET['id'] ?? 0;

            if ($id == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
                return;
            }

            $item = $vacuna->obtenerPorId($id);

            if ($item) {
                echo json_encode(['status' => 'success', 'data' => $item]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vacuna no encontrada']);
            }
        } catch (Exception $e) {
            error_log("Error en show vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener la vacuna']);
        }
    }

    // Mostrar vacuna de paciente con detalles completos
    public function showVacunaPaciente() {
        try {
            $vacuna = new Vacuna();
            $id = $_GET['id'] ?? 0;

            if ($id == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
                return;
            }

            $vacunaData = $vacuna->obtenerVacunaPacientePorId($id);

            if ($vacunaData) {
                echo json_encode(['status' => 'success', 'data' => $vacunaData]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vacuna no encontrada']);
            }
        } catch (Exception $e) {
            error_log("Error en showVacunaPaciente: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener la vacuna']);
        }
    }

    // Actualizar vacuna completa
    public function update() {
        try {
            $vacuna = new Vacuna();

            $id_vacuna_paciente = $_POST['id_vacuna_paciente'] ?? 0;
            $nombre_completo = $_POST['nombre_completo'] ?? '';
            $fecha_vacunacion = $_POST['fecha_vacunacion'] ?? '';
            $tiempo_tratamiento = $_POST['tiempo_tratamiento'] ?? '';
            $dosis = $_POST['dosis'] ?? '';
            $descripcion = $_POST['descripcion'] ?? '';
            $id_vacuna = $_POST['id_vacuna'] ?? 0;

            if ($id_vacuna_paciente == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID de vacuna requerido']);
                return;
            }

            if ($vacuna->actualizar($id_vacuna_paciente, $nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_vacuna)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacuna actualizada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la vacuna']);
            }
        } catch (Exception $e) {
            error_log("Error en update vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al actualizar la vacuna']);
        }
    }

    // Eliminar vacuna
    public function delete() {
        try {
            $vacuna = new Vacuna();
            $id = $_POST['id'] ?? 0;

            if ($id == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
                return;
            }

            if ($vacuna->eliminar($id)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacuna eliminada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar la vacuna']);
            }
        } catch (Exception $e) {
            error_log("Error en delete vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al eliminar la vacuna']);
        }
    }

    // Obtener vacunas por fecha
    public function getByDate() {
        try {
            $vacuna = new Vacuna();
            $fecha = $_GET['fecha'] ?? '';

            if (empty($fecha)) {
                echo json_encode(['status' => 'error', 'message' => 'Fecha requerida']);
                return;
            }

            $vacunas = $vacuna->obtenerPorFecha($fecha);
            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en getByDate vacunas: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener vacunas por fecha']);
        }
    }

    // Obtener catálogo de vacunas disponibles
    public function getAvailableVaccines() {
        try {
            $vacuna = new Vacuna();
            $vacunas = $vacuna->obtenerVacunasDisponibles();

            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en getAvailableVaccines: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener vacunas disponibles']);
        }
    }

    // Buscar paciente por cédula
    public function searchPatient() {
        try {
            $vacuna = new Vacuna();
            $cedula = $_GET['cedula'] ?? '';

            if (empty($cedula)) {
                echo json_encode(['status' => 'error', 'message' => 'Cédula requerida']);
                return;
            }

            $paciente = $vacuna->buscarPacientePorCedula($cedula);
            
            if ($paciente) {
                echo json_encode(['status' => 'success', 'data' => $paciente]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
            }
        } catch (Exception $e) {
            error_log("Error en searchPatient vacunas: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al buscar paciente']);
        }
    }

    // Obtener vacunas del catálogo (para formularios)
    public function getVacunasCatalogo() {
        try {
            $vacuna = new Vacuna();
            $vacunas = $vacuna->obtenerCatalogoVacunas();

            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en getVacunasCatalogo: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener catálogo de vacunas']);
        }
    }
}
?>