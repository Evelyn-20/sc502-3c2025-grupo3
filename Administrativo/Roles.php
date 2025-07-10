<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Roles</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <a href="inicioAdmin.html" class="navbar-brand d-flex align-items-center">
        <div class="logo"></div>
      </a>
      <div class="navbar-nav me-auto">
        <a class="nav-link" href="RegistrarUsuario.html">Usuarios</a>
        <a class="nav-link" href="Roles.php">Roles</a>
        <a class="nav-link" href="Citas.php">Citas</a>
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
        <h1 class="text-center mb-5">Roles</h1>
        <div class="row mb-4">
          <div class="col-md-12">
            <input type="text" class="form-control" placeholder="Buscar">
          </div>
        </div>
        <div class="row mb-4">
          <div class="col-4">
            <a type="button" class="btn btn-nuevo" href="RegistrarMedicamento.html">+ Registrar Rol</a>
          </div>
        </div>
        <table class="custom-table table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Administrador</td>
              <td>Acceso completo al sistema</td>
              <td>Activo</td>
              <td>
                <a type="button" class="btn-action btn-editar me-2" href="EditarRol.html" title="Editar">
                    <i class="fas fa-edit"></i> Editar
                </a>
                <button class="btn-action btn-deshabilitar" title="Deshabilitar" data-bs-toggle="modal" data-bs-target="#modalConfirmacion">
                  <i class="fas fa-ban"></i> Deshabilitar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalConfirmacion" tabindex="-1" aria-labelledby="modalConfirmacionLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalConfirmacionLabel">Confirmar acción</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-warning mb-3" style="font-size: 3rem;"></i>
            <h5 class="mb-3">¿Está seguro que desea deshabilitar este rol?</h5>
            <p class="text-muted">Esta acción cambiará el estado del rol a "Inactivo". Podrá habilitarlo nuevamente si es necesario.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger" onclick="deshabilitarRol()">Deshabilitar</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
  <script src="../js/scripts.js" defer></script>
</body>
</html>