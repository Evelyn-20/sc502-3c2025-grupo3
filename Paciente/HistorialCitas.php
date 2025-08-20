<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Historical Citas</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>

<body>
  <?php include("../components/MenuPaciente.php") ?>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 class="text-center mb-5">Historical Citas</h1>

        <div class="row mb-4">
          <div class="col-md-12">
            <input type="text" class="form-control" placeholder="Buscar">
          </div>
        </div>

        <div id="citasResult" class="mb-3"></div>

        <div class="row mb-4">
          <div class="col-4">
            <a type="button" class="btn btn-nuevo" href="RegistrarCita.html">+ Registrar Cita</a>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table custom-table" id="citasTable">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Especialidad</th>
                <th>Médico</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Las citas se cargarán aquí via AJAX -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmación para Cancelar -->
  <div class="modal fade" id="modalConfirmacion" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmar Cancelación</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          ¿Está seguro de que desea cancelar esta cita?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
          <button type="button" class="btn btn-danger" id="confirmarCancelacion">Sí, Cancelar</button>
        </div>
      </div>
    </div>
  </div>

  <script src="../js/jquery-3.7.1.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="../js/citas.js"></script>
</body>
</html>