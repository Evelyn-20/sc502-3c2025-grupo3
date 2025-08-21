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
    <?php include("../components/MenuMedico.php"); ?>

    <div class="container mt-5">
        <h1 class="text-center mb-5">Expedientes</h1>

        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Cédula</th>
                    <th>Nombre Paciente</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php if(!empty($expedientes)): ?>
                    <?php foreach($expedientes as $p): ?>
                    <tr>
                        <td><?= htmlspecialchars($p['cedula_usuario']) ?></td>
                        <td><?= htmlspecialchars($p['nombre_completo']) ?></td>
                        <td>
                            <a class="btn btn-primary" href="Expediente.html?cedula=<?= urlencode($p['cedula_usuario']) ?>">
                                Ver Expediente
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="3" class="text-center">No hay pacientes registrados</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
<script src="../js/expediente.js" defer></script>
</body>
</html>

