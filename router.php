<?php

error_reporting(E_ERROR | E_PARSE);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'app/controllers/AuthController.php';
require_once 'app/controllers/CitaController.php';
require_once 'app/controllers/ExpedienteController.php';
require_once 'app/controllers/MedicamentoController.php';

// Verificar sesión para rutas que la necesitan
if (in_array($_GET['action'] ?? '', ['createCitaPatient', 'listMyCitas', 'showExpediente', 'updateExpediente']) && !isset($_SESSION['user']['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesion no iniciada']);
    exit;
}

$action = $_GET['action'] ?? '';

$auth = new AuthController();
$cita = new CitaController();
$expediente = new ExpedienteController();
$medicamento = new MedicamentoController();

switch ($action) {
    // Rutas de autenticación
    case 'login':
        $auth->login();
        break;
    case 'register':
        $auth->register();
        break;
    case 'logout':
        $auth->logout();
        break;
    
    // Rutas de citas
    case 'createCita':
        $cita->create();
        break;
    case 'createCitaPatient':
        $cita->createForPatient();
        break;
    case 'listCitas':
        $cita->list();
        break;
    case 'listCitasByUser':
        $cita->listByUser();
        break;
    case 'listMyCitas':
        $cita->listMyAppointments();
        break;
    case 'showCita':
        $cita->show();
        break;
    case 'updateCita':
        $cita->update();
        break;
    case 'updateCitaStatus':
        $cita->updateStatus();
        break;
    case 'deleteCita':
        $cita->delete();
        break;
    case 'checkAvailability':
        $cita->checkAvailability();
        break;
    case 'getCitasByDate':
        $cita->getByDate();
        break;
    case 'getAvailableDoctors':
        $cita->getAvailableDoctors();
        break;
    case 'searchPatient':
        $cita->searchPatient();
        break;
    case 'getSpecialties':
        $cita->getSpecialties();
        break;
    case 'getServices':
        $cita->getServices();
        break;
    
    // Rutas de expediente
    case 'showExpediente':
        $expediente->show();
        break;
    case 'updateExpediente':
        $expediente->update();
        break;
    case 'showExpedienteByUser':
        $expediente->showByUser();
        break;
    case 'searchPatientByCedula':
        $expediente->searchPatient();
        break;
    case 'listExpedientes':
        $expediente->list();
        break;

    // Rutas de expediente
    case 'createMedicamento':
        $medicamento->create();
        break;
    case 'listMedicamentos':
        $medicamento->list();
        break;
    case 'showMedicamento':
        $medicamento->show();
        break;
    case 'updateMedicamento':
        $medicamento->update();
        break;
    case 'updateMedicamentoStatus':
        $medicamento->updateStatus();
        break;
    case 'deleteMedicamento':
        $medicamento->delete();
        break;
    case 'searchMedicamentos':
        $medicamento->search();
        break;
    case 'getFormasFarmaceuticas':
        $medicamento->getFormasFarmaceuticas();
        break;
    case 'getGruposTerapeuticos':
        $medicamento->getGruposTerapeuticos();
        break;
    case 'getViasAdministracion':
        $medicamento->getViasAdministracion();
        break;
    case 'asignarMedicamento':
        $medicamento->asignar();
        break;
    case 'listMisMedicamentos':
        $medicamento->listMisMedicamentos();
        break;
    case 'listMedicamentosPaciente':
        $medicamento->listMedicamentosPaciente();
        break;
    case 'showMedicamentoPaciente':
        $medicamento->showMedicamentoPaciente();
        break;
    case 'actualizarMedicamentoPaciente':
        $medicamento->actualizar();
        break;
    case 'actualizarEstadoMedicamentoPaciente':
        $medicamento->actualizarEstado();
        break;
    case 'eliminarMedicamentoPaciente':
        $medicamento->eliminar();
        break;
    case 'listMedicamentosActivos':
        $medicamento->listMedicamentosActivos();
        break;
    case 'buscarPacienteMedicamento':
        $medicamento->buscarPaciente();
        break;
    case 'getCatalogoMedicamentos':
        $medicamento->getCatalogoMedicamentos();
        break;
    
    default:
        echo json_encode(['status' => 'error', 'message' => 'Ruta no encontrada']);
}
?>