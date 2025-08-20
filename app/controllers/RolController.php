<?php
require_once 'app/models/Rol.php';

class RolController {
    private $model;

    public function __construct() {
        $this->model = new Rol();
        header('Content-Type: application/json; charset=utf-8');
    }

    public function list() {
        $onlyActive = isset($_GET['onlyActive']) ? (bool)$_GET['onlyActive'] : false;
        echo json_encode(['status' => 'success', 'data' => $this->model->getAll($onlyActive)]);
    }

    public function get() {
        $id = intval($_GET['id'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'ID inválido']); return;
        }
        $row = $this->model->getById($id);
        if (!$row) { echo json_encode(['status'=>'error','message'=>'Rol no encontrado']); return; }
        echo json_encode(['status' => 'success', 'data' => $row]);
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $estado = intval($_POST['id_estado'] ?? 1);
        if ($nombre === '' || $descripcion === '') { echo json_encode(['status'=>'error','message'=>'Nombre y descripción son requeridos']); return; }
        $ok = $this->model->create($nombre, $descripcion, $estado ?: 1);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo crear el rol']);
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        $id = intval($_POST['id_rol'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $estado = intval($_POST['id_estado'] ?? 1);
        if ($id<=0 || $nombre==='' || $descripcion==='') { echo json_encode(['status'=>'error','message'=>'Datos incompletos']); return; }
        $ok = $this->model->update($id, $nombre, $descripcion, $estado ?: 1);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo actualizar']);
    }

    public function disable() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        $id = intval($_POST['id_rol'] ?? 0);
        if ($id <= 0) { echo json_encode(['status'=>'error','message'=>'ID inválido']); return; }
        $ok = $this->model->setEstado($id, 2);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo deshabilitar']);
    }

    public function enable() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        $id = intval($_POST['id_rol'] ?? 0);
        if ($id <= 0) { echo json_encode(['status'=>'error','message'=>'ID inválido']); return; }
        $ok = $this->model->setEstado($id, 1);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo habilitar']);
    }
}
?>
