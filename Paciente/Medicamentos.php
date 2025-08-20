<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Medicamentos</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>

<body>
  <?php include("../components/MenuPaciente.php") ?>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 class="text-center mb-5">Medicamentos</h1>

        <div class="row mb-4">
          <div class="col-md-12">
            <input type="text" id="buscarMedicamento" class="form-control" placeholder="Buscar medicamento">
          </div>
        </div>

        <table class="custom-table table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Grupo Terapéutico</th>
              <th>Vía Administración</th>
              <th>Forma Farmacéutica</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="medicamentosTableBody">
          </tbody>
        </table>

        <div id="medicamentosResult" class="mt-3"></div>
      </div>
    </div>
  </div>

  <script src="../js/jquery-3.7.1.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="../js/medicamento.js"></script>
</body>

</html>