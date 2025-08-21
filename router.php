<?php
error_reporting(E_ERROR | E_PARSE);
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once 'app/controllers/AuthController.php';
require_once 'app/controllers/CitaController.php';
require_once 'app/controllers/ExpedienteController.php';
require_once 'app/controllers/MedicamentoController.php';
require_once 'app/controllers/VacunaController.php';
<<<<<<< Updated upstream

// Verificar sesión para rutas que la necesitan
if (in_array($_GET['action'] ?? '', [
    'createCitaPatient', 'listMyCitas', 'showExpediente', 'updateExpediente',
    'listMisMedicamentos', 'showMedicamentoPaciente', 
    'createVacunaPatient', 'listMyVaccines', 'showVacunaPaciente', 'updateVacuna', 'deleteVacuna'
]) && !isset($_SESSION['user']['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada']);
    exit;
}
=======
require_once 'app/controllers/UsuarioController.php';
require_once 'app/controllers/RolController.php';
>>>>>>> Stashed changes

$action = $_GET['action'] ?? '';

$auth = new AuthController();
$usuario = new UsuarioController();
$rol = new RolController();
$cita = new CitaController();
$expediente = new ExpedienteController();
$medicamento = new MedicamentoController();
$vacuna = new VacunaController();
<<<<<<< Updated upstream
=======

// Rutas que requieren sesión (ejemplo simple: todo excepto login)
$requiresSession = [
    'getUsuarios','getUsuario','createUsuario','updateUsuario','enableUsuario','disableUsuario',
    'getRoles','getRol','createRol','updateRol','enableRol','disableRol',
    // ... agregue aquí otras rutas protegidas si aplica
];

if (in_array($action, $requiresSession)) {
    if (!isset($_SESSION['user'])) {
        header('Content-Type: application/json');
        echo json_encode(['status'=>'error','message'=>'No autenticado']);
        exit;
    }
}
>>>>>>> Stashed changes

switch ($action) {
    // Autenticación
    case 'login': $auth->login(); break;
    case 'logout': $auth->logout(); break;

<<<<<<< Updated upstream
    // Rutas de medicamentos
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
    
    // Rutas de vacunas
    case 'createVacuna':
        $vacuna->create();
        break;
    case 'createVacunaPatient':
        $vacuna->createForPatient();
        break;
    case 'listVacunas':
        $vacuna->list();
        break;
    case 'listVacunasByUser':
        $vacuna->listByUser();
        break;
    case 'listMyVaccines':
        $vacuna->listMyVaccines();
        break;
    case 'showVacuna':
        $vacuna->show();
        break;
    case 'showVacunaPaciente':
        $vacuna->showVacunaPaciente();
        break;
    case 'updateVacuna':
        $vacuna->update();
        break;
    case 'deleteVacuna':
        $vacuna->delete();
        break;
    case 'getVacunasByDate':
        $vacuna->getByDate();
        break;
    case 'getAvailableVaccines':
        $vacuna->getAvailableVaccines();
        break;
    case 'searchPatientVacuna':
        $vacuna->searchPatient();
        break;
    case 'getVacunasCatalogo':
        $vacuna->getVacunasCatalogo();
        break;
    
    default:
        echo json_encode(['status' => 'error', 'message' => 'Ruta no encontrada']);
=======
    // Usuarios (Administración)
    case 'getUsuarios': $usuario->getAll(); break;
    case 'getUsuario': $usuario->getOne(); break;
    case 'createUsuario': $usuario->create(); break;
    case 'updateUsuario': $usuario->update(); break;
    case 'enableUsuario': $usuario->enable(); break;
    case 'disableUsuario': $usuario->disable(); break;

    // Roles (Administración)
    case 'getRoles': $rol->getAll(); break;
    case 'getRol': $rol->getOne(); break;
    case 'createRol': $rol->create(); break;
    case 'updateRol': $rol->update(); break;
    case 'enableRol': $rol->enable(); break;
    case 'disableRol': $rol->disable(); break;

    // Mantener las rutas existentes del resto de módulos
    default:
        header('Content-Type: application/json');
        echo json_encode(['status'=>'error','message'=>'Ruta no encontrada']);
>>>>>>> Stashed changes
}
?>