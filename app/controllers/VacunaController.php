<?php
require_once 'app/models/Vacuna.php';

class VacunaController {
    
    // Crear vacuna para administrador/médico
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
                echo json_encode(['status' => 'success', 'message' => 'Vacunación registrada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar la vacunación']);
            }
        } catch (Exception $e) {
            error_log("Error en create vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al registrar la vacunación']);
        }
    }

    // Crear vacuna para paciente (desde su propia cuenta)
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
                echo json_encode(['status' => 'success', 'message' => 'Vacunación registrada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar la vacunación']);
            }
        } catch (Exception $e) {
            error_log("Error en createForPatient vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al registrar la vacunación']);
        }
    }

    // Listar todas las vacunaciones (para médicos/admin)
    public function list() {
        try {
            $vacuna = new Vacuna();
            $vacunas = $vacuna->obtenerTodas();

            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en list vacunas: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener las vacunaciones']);
        }
    }

    // Listar vacunaciones por usuario específico (para admin)
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
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener las vacunaciones del usuario']);
        }
    }

    // Listar vacunaciones del usuario en sesión (para pacientes)
    public function listMyVaccines() {
        try {
            $vacuna = new Vacuna();
            $vacunas = $vacuna->obtenerVacunasUsuarioSesion();

            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en listMyVaccines: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener tus vacunaciones']);
        }
    }

    // Mostrar una vacunación específica
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
                echo json_encode(['status' => 'error', 'message' => 'Vacunación no encontrada']);
            }
        } catch (Exception $e) {
            error_log("Error en show vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener la vacunación']);
        }
    }

    // Mostrar vacunación de paciente con detalles completos
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
                echo json_encode(['status' => 'error', 'message' => 'Vacunación no encontrada']);
            }
        } catch (Exception $e) {
            error_log("Error en showVacunaPaciente: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener la vacunación']);
        }
    }

    // Actualizar vacunación completa
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
                echo json_encode(['status' => 'error', 'message' => 'ID de vacunación requerido']);
                return;
            }

            // Validaciones básicas
            if (empty($nombre_completo) || empty($fecha_vacunacion) || empty($tiempo_tratamiento) || 
                empty($dosis) || $id_vacuna == 0) {
                echo json_encode(['status' => 'error', 'message' => 'Todos los campos son requeridos']);
                return;
            }

            if ($vacuna->actualizar($id_vacuna_paciente, $nombre_completo, $fecha_vacunacion, $tiempo_tratamiento, $dosis, $descripcion, $id_vacuna)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacunación actualizada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la vacunación']);
            }
        } catch (Exception $e) {
            error_log("Error en update vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al actualizar la vacunación']);
        }
    }

    public function updateEstadoVacuna() {
        try {
            $vacuna = new Vacuna();
            $id_vacuna_paciente = $_POST['id_vacuna_paciente'] ?? 0;
            $id_estado = $_POST['id_estado'] ?? 0;

            if ($id_vacuna_paciente == 0 || $id_estado == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID de vacunación y estado requeridos']);
                return;
            }

            // Validar que el estado sea válido (1 = activo, 2 = inactivo)
            if (!in_array($id_estado, [1, 2])) {
                echo json_encode(['status' => 'error', 'message' => 'Estado no válido']);
                return;
            }

            if ($vacuna->actualizarEstadoVacunaPaciente($id_vacuna_paciente, $id_estado)) {
                $mensaje = $id_estado == 1 ? 'Vacunación habilitada exitosamente' : 'Vacunación deshabilitada exitosamente';
                echo json_encode(['status' => 'success', 'message' => $mensaje]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el estado']);
            }
        } catch (Exception $e) {
            error_log("Error en updateEstadoVacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al actualizar el estado']);
        }
    }

    // Eliminar vacunación
    public function delete() {
        try {
            $vacuna = new Vacuna();
            $id = $_POST['id'] ?? 0;

            if ($id == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
                return;
            }

            if ($vacuna->eliminar($id)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacunación eliminada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar la vacunación']);
            }
        } catch (Exception $e) {
            error_log("Error en delete vacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al eliminar la vacunación']);
        }
    }

    // Obtener vacunaciones por fecha
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
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener vacunaciones por fecha']);
        }
    }

    // Obtener catálogo de vacunas disponibles (con detalles)
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

    // Buscar paciente por cédula (para vacunaciones)
    public function searchPatientVacuna() {
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
            error_log("Error en searchPatientVacuna: " . $e->getMessage());
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

    // ============ MÉTODOS CRUD PARA CATÁLOGO DE VACUNAS (ADMIN) ============

    // Crear vacuna en catálogo
    public function createVacunaCatalogo() {
        try {
            $vacuna = new Vacuna();

            $nombre = $_POST['nombre'] ?? '';
            $id_enfermedad = $_POST['id_enfermedad'] ?? 0;
            $id_esquema_vacunacion = $_POST['id_esquema_vacunacion'] ?? 0;
            $id_via_administracion = $_POST['id_via_administracion'] ?? 0;
            $id_estado = $_POST['id_estado'] ?? 1;

            // Validaciones básicas
            if (empty($nombre) || $id_enfermedad == 0 || $id_esquema_vacunacion == 0 || $id_via_administracion == 0) {
                echo json_encode(['status' => 'error', 'message' => 'Todos los campos son requeridos']);
                return;
            }

            if ($vacuna->crearVacunaCatalogo($nombre, $id_enfermedad, $id_esquema_vacunacion, $id_via_administracion, $id_estado)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacuna registrada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo registrar la vacuna']);
            }
        } catch (Exception $e) {
            error_log("Error en createVacunaCatalogo: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al registrar la vacuna']);
        }
    }

    // Listar todas las vacunas del catálogo
    public function listVacunasCatalogo() {
        try {
            $vacuna = new Vacuna();
            $vacunas = $vacuna->obtenerTodasVacunasCatalogo();

            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en listVacunasCatalogo: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener las vacunas']);
        }
    }

    // Mostrar una vacuna del catálogo
    public function showVacunaCatalogo() {
        try {
            $vacuna = new Vacuna();
            $id = $_GET['id'] ?? 0;

            if ($id == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
                return;
            }

            $item = $vacuna->obtenerVacunaCatalogoPorId($id);

            if ($item) {
                echo json_encode(['status' => 'success', 'data' => $item]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vacuna no encontrada']);
            }
        } catch (Exception $e) {
            error_log("Error en showVacunaCatalogo: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener la vacuna']);
        }
    }

    // Actualizar vacuna del catálogo
    public function updateVacunaCatalogo() {
        try {
            $vacuna = new Vacuna();

            $id = $_POST['id'] ?? 0;
            $nombre = $_POST['nombre'] ?? '';
            $id_enfermedad = $_POST['id_enfermedad'] ?? 0;
            $id_esquema_vacunacion = $_POST['id_esquema_vacunacion'] ?? 0;
            $id_via_administracion = $_POST['id_via_administracion'] ?? 0;
            $id_estado = $_POST['id_estado'] ?? 1;

            if ($id == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID de vacuna requerido']);
                return;
            }

            if (empty($nombre) || $id_enfermedad == 0 || $id_esquema_vacunacion == 0 || $id_via_administracion == 0) {
                echo json_encode(['status' => 'error', 'message' => 'Todos los campos son requeridos']);
                return;
            }

            if ($vacuna->actualizarVacunaCatalogo($id, $nombre, $id_enfermedad, $id_esquema_vacunacion, $id_via_administracion, $id_estado)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacuna actualizada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la vacuna']);
            }
        } catch (Exception $e) {
            error_log("Error en updateVacunaCatalogo: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al actualizar la vacuna']);
        }
    }

    // Actualizar estado de vacuna
    public function updateVacunaStatus() {
        try {
            $vacuna = new Vacuna();
            $id = $_POST['id'] ?? 0;
            $id_estado = $_POST['id_estado'] ?? 0;

            if ($id == 0 || $id_estado == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID y estado requeridos']);
                return;
            }

            if ($vacuna->actualizarEstadoVacunaCatalogo($id, $id_estado)) {
                echo json_encode(['status' => 'success', 'message' => 'Estado actualizado exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el estado']);
            }
        } catch (Exception $e) {
            error_log("Error en updateVacunaStatus: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al actualizar el estado']);
        }
    }

    // Eliminar vacuna del catálogo
    public function deleteVacunaCatalogo() {
        try {
            $vacuna = new Vacuna();
            $id = $_POST['id'] ?? 0;

            if ($id == 0) {
                echo json_encode(['status' => 'error', 'message' => 'ID requerido']);
                return;
            }

            if ($vacuna->eliminarVacunaCatalogo($id)) {
                echo json_encode(['status' => 'success', 'message' => 'Vacuna eliminada exitosamente']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar la vacuna']);
            }
        } catch (Exception $e) {
            error_log("Error en deleteVacunaCatalogo: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al eliminar la vacuna']);
        }
    }

    // Buscar vacunas en catálogo
    public function searchVacunasCatalogo() {
        try {
            $vacuna = new Vacuna();
            $termino = $_GET['termino'] ?? '';

            if (empty($termino)) {
                echo json_encode(['status' => 'error', 'message' => 'Término de búsqueda requerido']);
                return;
            }

            $vacunas = $vacuna->buscarVacunasCatalogo($termino);
            echo json_encode(['status' => 'success', 'data' => $vacunas]);
        } catch (Exception $e) {
            error_log("Error en searchVacunasCatalogo: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al buscar vacunas']);
        }
    }

    // ============ MÉTODOS AUXILIARES PARA FORMULARIOS ============

    // Obtener enfermedades
    public function getEnfermedades() {
        try {
            $vacuna = new Vacuna();
            $enfermedades = $vacuna->obtenerEnfermedades();

            echo json_encode(['status' => 'success', 'data' => $enfermedades]);
        } catch (Exception $e) {
            error_log("Error en getEnfermedades: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener enfermedades']);
        }
    }

    // Obtener esquemas de vacunación
    public function getEsquemasVacunacion() {
        try {
            $vacuna = new Vacuna();
            $esquemas = $vacuna->obtenerEsquemasVacunacion();

            echo json_encode(['status' => 'success', 'data' => $esquemas]);
        } catch (Exception $e) {
            error_log("Error en getEsquemasVacunacion: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener esquemas de vacunación']);
        }
    }

    // Obtener estados de vacuna
    public function getStatesVacuna() {
        try {
            $vacuna = new Vacuna();
            $estados = $vacuna->obtenerEstados();

            echo json_encode(['status' => 'success', 'data' => $estados]);
        } catch (Exception $e) {
            error_log("Error en getStatesVacuna: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener estados']);
        }
    }

    // Obtener vías de administración
    public function getViasAdministracion() {
        try {
            $vacuna = new Vacuna();
            $vias = $vacuna->obtenerViasAdministracion();

            echo json_encode(['status' => 'success', 'data' => $vias]);
        } catch (Exception $e) {
            error_log("Error en getViasAdministracion: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener vías de administración']);
        }
    }

    // Método alias para compatibilidad
    public function searchPatient() {
        $this->searchPatientVacuna();
    }
}
?>