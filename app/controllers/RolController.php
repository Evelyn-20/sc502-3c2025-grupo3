<?php
<<<<<<< Updated upstream
=======
require_once 'app/models/Rol.php';

class RolController {
    private $model;
    public function __construct(){ $this->model = new Rol(); }

    public function getAll(){
        header('Content-Type: application/json');
        echo json_encode(['status'=>'success','data'=>$this->model->getAll()]);
    }
    public function getOne(){
        $id = intval($_GET['id'] ?? 0);
        $r = $this->model->getById($id);
        header('Content-Type: application/json');
        if ($r) echo json_encode(['status'=>'success','data'=>$r]);
        else echo json_encode(['status'=>'error','message'=>'Rol no encontrado']);
    }
    public function create(){
        $data = [
            'nombre'=>$_POST['nombre']??'',
            'descripcion'=>$_POST['descripcion']??'',
            'id_estado'=>intval($_POST['id_estado']??(($_POST['estado']??'activo')==='inactivo'?2:1)),
        ];
        $id = $this->model->create($data);
        header('Content-Type: application/json');
        echo json_encode(['status'=>'success','id'=>$id]);
    }
    public function update(){
        $data = [
            'id_rol'=>intval($_POST['id_rol']??0),
            'nombre'=>$_POST['nombre']??'',
            'descripcion'=>$_POST['descripcion']??'',
            'id_estado'=>intval($_POST['id_estado']??(($_POST['estado']??'activo')==='inactivo'?2:1)),
        ];
        $ok = $this->model->update($data);
        header('Content-Type: application/json');
        echo json_encode($ok?['status':'success']:['status':'error','message':'No se pudo actualizar']);
    }
    public function enable(){ $this->setEstado(1); }
    public function disable(){ $this->setEstado(2); }
    private function setEstado($estado){
        $id = intval($_POST['id_rol'] ?? $_POST['id'] ?? 0);
        $ok = $this->model->setEstado($id, $estado);
        header('Content-Type: application/json');
        echo json_encode($ok?['status'=>'success']:['status'=>'error','message'=>'No se pudo cambiar el estado']);
    }
}
?>
>>>>>>> Stashed changes
