<?php
<<<<<<< Updated upstream
=======
require_once 'app/models/Usuario.php';

class UsuarioController {
    private $model;
    public function __construct() { $this->model = new Usuario(); }

    public function getAll() {
        header('Content-Type: application/json');
        echo json_encode(['status'=>'success', 'data'=>$this->model->getAll()]);
    }
    public function getOne() {
        $id = intval($_GET['id'] ?? 0);
        $u = $this->model->getById($id);
        header('Content-Type: application/json');
        if ($u) echo json_encode(['status'=>'success','data'=>$u]);
        else echo json_encode(['status'=>'error','message'=>'Usuario no encontrado']);
    }
    public function create() {
        $data = [
            'cedula_usuario'=>$_POST['cedula']??'',
            'nombre'=>$_POST['nombre']??'',
            'apellidos'=>$_POST['apellidos']??'',
            'correo'=>$_POST['email']??'',
            'telefono'=>$_POST['telefono']??'',
            'fecha_nacimiento'=>$_POST['fecha_nacimiento']??null,
            'direccion'=>$_POST['direccion']??'',
            'contrasena'=>$_POST['contrasena']??($_POST['password']??'123456'),
            'id_genero'=>$_POST['id_genero']??None,
            'id_estado_civil'=>$_POST['id_estado_civil']??None,
            'id_rol'=>intval($_POST['id_rol']??($_POST['rol']??3)),
            'id_estado'=>intval($_POST['id_estado']??(($_POST['estado']??'activo')==='inactivo'?2:1)),
        ];
        $id = $this->model->create($data);
        header('Content-Type: application/json');
        echo json_encode(['status'=>'success','id'=>$id]);
    }
    public function update() {
        $data = [
            'id_usuario'=>intval($_POST['id_usuario']??0),
            'cedula_usuario'=>$_POST['cedula']??'',
            'nombre'=>$_POST['nombre']??'',
            'apellidos'=>$_POST['apellidos']??'',
            'correo'=>$_POST['email']??'',
            'telefono'=>$_POST['telefono']??'',
            'fecha_nacimiento'=>$_POST['fecha_nacimiento']??null,
            'direccion'=>$_POST['direccion']??'',
            'contrasena'=>$_POST['contrasena']??($_POST['password']??''),
            'id_genero'=>$_POST['id_genero']??None,
            'id_estado_civil'=>$_POST['id_estado_civil']??None,
            'id_rol'=>intval($_POST['id_rol']??($_POST['rol']??3)),
            'id_estado'=>intval($_POST['id_estado']??(($_POST['estado']??'activo')==='inactivo'?2:1)),
        ];
        $ok = $this->model->update($data);
        header('Content-Type: application/json');
        echo json_encode($ok?['status'=>'success']:['status'=>'error','message'=>'No se pudo actualizar']);
    }
    public function enable() { $this->setEstado(1); }
    public function disable(){ $this->setEstado(2); }
    private function setEstado($estado){
        $id = intval($_POST['id_usuario'] ?? $_POST['id'] ?? 0);
        $ok = $this->model->setEstado($id, $estado);
        header('Content-Type: application/json');
        echo json_encode($ok?['status'=>'success']:['status'=>'error','message'=>'No se pudo cambiar el estado']);
    }
}
?>
>>>>>>> Stashed changes
