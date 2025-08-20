<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Expedientes</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>

<body>
  <?php include("../components/MenuMedico.php") ?>

  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 class="text-center mb-5">Expedientes</h1>

        <div class="mb-4">
          <input type="text" class="search-input w-100" placeholder="Buscar">
        </div>

        <table class="custom-table table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre Paciente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>301230456</td>
              <td>Juan Pérez</td>
              <td>
                <a type="button" class="btn-action btn-ver me-2" href="Expediente.html" title="Ver Expediente">
                  <i class="fas fa-file-medical"></i> Ver Expediente
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
  <script src="../js/scripts.js" defer></script>
</body>
</html>