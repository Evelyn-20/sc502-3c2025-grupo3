<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vacunas</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>

<body>
  <?php include("../components/MenuMedico.php") ?>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 class="text-center mb-5">Vacunas</h1>

        <div class="row mb-4">
          <div class="col-md-12">
            <input type="text" class="form-control" placeholder="Buscar">
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-4">
            <a type="button" class="btn btn-nuevo" href="RegistrarVacunacion.html">+ Registrar Vacunación</a>
          </div>
        </div>

        <table class="custom-table table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Enfermedad</th>
              <th>Grupo</th>
              <th>Esquema de Vacunación</th>
              <th>Vía de Administración</th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="../js/scripts.js" defer></script>
</body>

</html>