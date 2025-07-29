<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Citas</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>

<body>
  <?php include("MenuMedico.php") ?>

  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <a href="inicioMedico.html" class="navbar-brand d-flex align-items-center">
        <div class="logo"></div>
      </a>
      <div class="navbar-nav me-auto">
        <a class="nav-link" href="CitasProgramadas.php">Citas</a>
        <a class="nav-link" href="ConsultarExpediente.php">Expediente</a>
        <a class="nav-link" href="Medicamentos.php">Medicamentos</a>
        <a class="nav-link" href="Vacunas.php">Vacunas</a>
      </div>
      <div class="d-flex align-items-center">
        <a href="../Registro/Login.php" class="text-black me-3 text-decoration-none">Cerrar sesión</a>
      </div>
    </div>
  </nav>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 class="text-center mb-5">Citas</h1>

        <div class="mb-4">
          <input type="text" class="search-input w-100" placeholder="Buscar">
        </div>

        <table class="custom-table table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre Paciente</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
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