<?php
require_once 'app/models/Usuario.php';

class UsuarioController {
    private $model;

    public function __construct() {
        $this->model = new Usuario();
        header('Content-Type: application/json; charset=utf-8');
    }

    public function list() {
        $onlyActive = isset($_GET['onlyActive']) ? (bool)$_GET['onlyActive'] : false;
        echo json_encode(['status'=>'success', 'data'=>$this->model->getAll($onlyActive)]);
    }

    public function get() {
        $id = intval($_GET['id'] ?? 0);
        if ($id<=0) { echo json_encode(['status'=>'error','message'=>'ID inválido']); return; }
        $row = $this->model->getById($id);
        if (!$row) { echo json_encode(['status'=>'error','message'=>'Usuario no encontrado']); return; }
        echo json_encode(['status'=>'success', 'data'=>$row]);
    }

        public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        // Mapear nombres de form -> claves esperadas por el modelo
        $cedula = trim($_POST['cedula'] ?? '');
        $nombre = trim($_POST['nombre'] ?? '');
        $apellidos = trim($_POST['apellidos'] ?? '');
        $correo = trim($_POST['correo'] ?? ($_POST['email'] ?? ''));
        $telefono = trim($_POST['telefono'] ?? '');
        $fecha_nacimiento = trim($_POST['fecha_nacimiento'] ?? '');
        $direccion = trim($_POST['direccion'] ?? '');
        $id_rol = $_POST['id_rol'] ?? ($_POST['rol'] ?? 3); // por defecto paciente
        $id_estado = $_POST['id_estado'] ?? ($_POST['estado'] ?? 1);
        $password = trim($_POST['password'] ?? '');
        if (empty($password) && !empty($cedula)) { $password = $cedula; }

        // Normalizaciones desde selects texto
        if (!is_numeric($id_rol)) {
            $mapRol = ['admin'=>1,'administrador'=>1,'medico'=>2,'doctor'=>2,'user'=>3,'usuario'=>3,'paciente'=>3];
            $id_rol = $mapRol[strtolower((string)$id_rol)] ?? 3;
        } else { $id_rol = intval($id_rol); }
        if (!is_numeric($id_estado)) {
            $mapEstado = ['activo'=>1,'inactivo'=>2,'habilitado'=>1,'deshabilitado'=>2];
            $id_estado = $mapEstado[strtolower((string)$id_estado)] ?? 1;
        } else { $id_estado = intval($id_estado); }

        $data = compact('cedula','nombre','apellidos','correo','telefono','fecha_nacimiento','direccion','password');
        $data['id_rol'] = $id_rol;
        $data['id_estado'] = $id_estado;

        $result = $this->model->register($data);
        echo json_encode($result);
    }

        public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        $id = intval($_POST['id_usuario'] ?? 0);
        if ($id<=0) { echo json_encode(['status'=>'error','message'=>'ID inválido']); return; }

        $data = [];

        // campos simples
        foreach (['cedula_usuario'=>'cedula','nombre'=>'nombre','apellidos'=>'apellidos','correo'=>'correo','telefono'=>'telefono','fecha_nacimiento'=>'fecha_nacimiento','direccion'=>'direccion'] as $dbk=>$formk) {
            if (isset($_POST[$formk])) { $data[$dbk] = trim($_POST[$formk]); }
        }
        // aceptar 'email' como 'correo'
        if (isset($_POST['email'])) { $data['correo'] = trim($_POST['email']); }

        // roles y estado
        if (isset($_POST['id_rol']) || isset($_POST['rol'])) {
            $v = $_POST['id_rol'] ?? $_POST['rol'];
            if (!is_numeric($v)) {
                $mapRol = ['admin'=>1,'administrador'=>1,'medico'=>2,'doctor'=>2,'user'=>3,'usuario'=>3,'paciente'=>3];
                $v = $mapRol[strtolower((string)$v)] ?? 3;
            }
            $data['id_rol'] = intval($v);
        }
        if (isset($_POST['id_estado']) || isset($_POST['estado'])) {
            $v = $_POST['id_estado'] ?? $_POST['estado'];
            if (!is_numeric($v)) {
                $mapEstado = ['activo'=>1,'inactivo'=>2,'habilitado'=>1,'deshabilitado'=>2];
                $v = $mapEstado[strtolower((string)$v)] ?? 1;
            }
            $data['id_estado'] = intval($v);
        }

        $ok = $this->model->update($id, $data);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo actualizar']);
    }
        }
        $ok = $this->model->update($id, $data);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo actualizar']);
    }

    public function disable() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        $id = intval($_POST['id_usuario'] ?? 0);
        if ($id<=0) { echo json_encode(['status'=>'error','message'=>'ID inválido']); return; }
        $ok = $this->model->setEstado($id, 2);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo deshabilitar']);
    }

    public function enable() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['status'=>'error','message'=>'Método no permitido']); return; }
        $id = intval($_POST['id_usuario'] ?? 0);
        if ($id<=0) { echo json_encode(['status'=>'error','message'=>'ID inválido']); return; }
        $ok = $this->model->setEstado($id, 1);
        echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>'No se pudo habilitar']);
    }
}
?>
