<?php
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestión de Medicamentos</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
  <?php include("../components/MenuMedico.php") ?>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 class="text-center mb-5">Gestión de Medicamentos</h1>

        <!-- Formulario de registro -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Registrar Nuevo Medicamento</h5>
            <form id="formRegistrarMedicamento">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre del Medicamento</label>
                <input type="text" class="form-control" id="nombre" name="nombre" required>
              </div>
              <div class="mb-3">
                <label for="id_forma_farmaceutica" class="form-label">Forma Farmacéutica</label>
                <select id="id_forma_farmaceutica" name="id_forma_farmaceutica" class="form-select" required></select>
              </div>
              <div class="mb-3">
                <label for="id_grupo_terapeutico" class="form-label">Grupo Terapéutico</label>
                <select id="id_grupo_terapeutico" name="id_grupo_terapeutico" class="form-select" required></select>
              </div>
              <div class="mb-3">
                <label for="id_via_administracion" class="form-label">Vía de Administración</label>
                <select id="id_via_administracion" name="id_via_administracion" class="form-select" required></select>
              </div>
              <div class="mb-3">
                <label for="id_estado" class="form-label">Estado</label>
                <select id="id_estado" name="id_estado" class="form-select" required>
                  <option value="1" selected>Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Registrar Medicamento</button>
              <span id="mensaje" class="ms-3"></span>
            </form>
          </div>
        </div>

        <!-- Buscador y tabla -->
        <div class="row mb-4">
          <div class="col-md-12">
            <input type="text" id="buscarMedicamento" class="form-control" placeholder="Buscar medicamento...">
          </div>
        </div>

        <table id="tablaMedicamentos" class="custom-table table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Forma Farmacéutica</th>
              <th>Grupo Terapéutico</th>
              <th>Vía de Administración</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <!-- Los medicamentos se cargan aquí vía JS -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal para detalles -->
  <div class="modal fade" id="medicamentoModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalles del Medicamento</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body" id="medicamentoDetalles">
          <!-- Se llenará vía JS -->
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
  <script src="js/medicamentos.js"></script>
</body>
</html>

