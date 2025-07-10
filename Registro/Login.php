<?php
// Verificar si el formulario fue enviado
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $cedula = trim($_POST['cedula']);
    $password = trim($_POST['password']);
    
    // Credenciales (igual que en tu JavaScript)
    $cedulaAdmin = "123456789";
    $passwordAdmin = "admin123";
    
    $cedulaDoctor = "987654321";
    $passwordDoctor = "medico123";
    
    $cedulaPaciente = "456789123";
    $passwordPaciente = "paciente123";
    
    // Verificar campos vacíos
    if (empty($cedula) || empty($password)) {
        echo "<script>alert('Por favor complete todos los campos');</script>";
    } 
    // Verificar credenciales
    elseif ($cedula === $cedulaAdmin && $password === $passwordAdmin) {
        echo "<script>window.location.href = '../Administrativo/inicioAdmin.html';</script>";
        exit();
    } 
    elseif ($cedula === $cedulaDoctor && $password === $passwordDoctor) {
        echo "<script>window.location.href = '../Medicos/inicioMedico.html';</script>";
        exit();
    } 
    elseif ($cedula === $cedulaPaciente && $password === $passwordPaciente) {
        echo "<script>window.location.href = '../Paciente/inicioPaciente.html';</script>";
        exit();
    } 
    else {
        echo "<script>alert('Credenciales incorrectas');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Iniciar Sesión</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center">
    <div class="row justify-content-center w-100">
      <div class="col-md-4 col-lg-3">
        <div class="text-center mb-4">
          <div class="login-logo mb-4"></div>
          <h1 class="mb-4">Iniciar Sesión</h1>
          <p class="text-muted mb-4">Bienvenido al sistema de gestión médica</p>
        </div>
        
        <form method="POST" action="">
          <div class="mb-3">
            <label for="cedula" class="form-label">Cédula</label>
            <input type="text" id="cedula" name="cedula" class="form-control" placeholder="Ingrese su cédula">
          </div>
          
          <div class="mb-4">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" id="password" name="password" class="form-control" placeholder="Ingrese su contraseña">
          </div>
          
          <div class="text-center mb-4">
            <button type="submit" class="btn btn-login">Iniciar Sesión</button>
          </div>
        </form>
        
        <div class="text-center">
          <p class="text-muted mb-2">¿No tienes cuenta?</p>
          <a href="Registro.php" class="back-link">Registrarse aquí</a>
        </div>
      </div>
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
</body>
</html>