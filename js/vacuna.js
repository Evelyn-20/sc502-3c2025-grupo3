$(document).ready(function() {
    cargarVacunas();

    // Búsqueda en tiempo real
    $('#buscarVacuna').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterTable(searchTerm);
    });
});

function cargarVacunas() {
    $.ajax({
        url: '../router.php?action=listMyVaccines',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                mostrarVacunas(response.data);
            } else {
                $('#vacunasResult').html('<div class="alert alert-warning">' + response.message + '</div>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar vacunas:', error);
            $('#vacunasResult').html('<div class="alert alert-danger">Error al cargar las vacunas</div>');
        }
    });
}

function mostrarVacunas(vacunas) {
    let html = '';
    
    if (vacunas.length === 0) {
        html = '<tr><td colspan="5" class="text-center">No tienes vacunas registradas</td></tr>';
    } else {
        vacunas.forEach(function(vacuna) {
            html += `
                <tr>
                    <td>${vacuna.nombre_vacuna || 'N/A'}</td>
                    <td>${vacuna.descripcion || 'Sin descripción'}</td>
                    <td>${formatearFecha(vacuna.fecha_vacunacion)}</td>
                    <td>${vacuna.dosis}</td>
                    <td>
                        <button class="btn btn-sm" style="background-color: #44C1F2; border-color: #44C1F2; color: white;" onclick="verDetalles(${vacuna.id_vacuna_paciente})" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    $('#vacunasTableBody').html(html);
}

function verDetalles(id) {
    $.ajax({
        url: '../router.php?action=showVacunaPaciente&id=' + id,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const vacuna = response.data;
                let detallesHtml = `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nombre Completo:</label>
                            <div style="background-color: white; padding: 12px 20px; border-radius: 25px; border: 1px solid #d0d0d0;">
                                ${vacuna.nombre_completo}
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Vacuna:</label>
                            <div style="background-color: white; padding: 12px 20px; border-radius: 25px; border: 1px solid #d0d0d0;">
                                ${vacuna.nombre_vacuna || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Fecha de Vacunación:</label>
                            <div style="background-color: white; padding: 12px 20px; border-radius: 25px; border: 1px solid #d0d0d0;">
                                ${formatearFecha(vacuna.fecha_vacunacion)}
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Dosis:</label>
                            <div style="background-color: white; padding: 12px 20px; border-radius: 25px; border: 1px solid #d0d0d0;">
                                ${vacuna.dosis}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label">Tiempo de Tratamiento:</label>
                            <div style="background-color: white; padding: 12px 20px; border-radius: 25px; border: 1px solid #d0d0d0;">
                                ${vacuna.tiempo_tratamiento}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label">Descripción:</label>
                            <div style="background-color: white; padding: 12px 20px; border-radius: 25px; border: 1px solid #d0d0d0; min-height: 60px;">
                                ${vacuna.descripcion || 'Sin descripción'}
                            </div>
                        </div>
                    </div>
                `;
                $('#vacunaDetalles').html(detallesHtml);
                $('#vacunaModal').modal('show');
            } else {
                alert('Error al cargar los detalles de la vacuna');
            }
        },
        error: function() {
            alert('Error al cargar los detalles de la vacuna');
        }
    });
}

function filterTable(searchTerm) {
    $('#vacunasTableBody tr').each(function() {
        const rowText = $(this).text().toLowerCase();
        if (rowText.indexOf(searchTerm) === -1) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Vacunas - Módulo Médico
document.addEventListener("DOMContentLoaded", () => {
  const tablaGlobal = document.getElementById("tablaVacunasGlobal");
  const buscadorGlobal = document.getElementById("buscarVacunaGlobal");

  const tablaPaciente = document.getElementById("tablaVacunasPaciente");
  const buscadorPaciente = document.getElementById("buscarVacunaPaciente");
  const formRegistro = document.getElementById("form-registro");
  const cedulaInput = document.getElementById("cedula");
  const nombreInput = document.getElementById("nombre");
  const fechaInput = document.getElementById("fecha");

  if (fechaInput) fechaInput.value = new Date().toISOString().split("T")[0];

  // ----- LISTADO GLOBAL DE VACUNAS -----
  if (tablaGlobal) {
    fetch(`../../controllers/VacunasController.php?action=listarVacunas`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") renderVacunas(data.data, tablaGlobal);
        else tablaGlobal.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron vacunas</td></tr>`;
      });

    if (buscadorGlobal) {
      buscadorGlobal.addEventListener("keyup", () => {
        const termino = buscadorGlobal.value.toLowerCase();
        fetch(`../../controllers/VacunasController.php?action=listarVacunas`)
          .then(res => res.json())
          .then(data => {
            if (data.status === "success") {
              const filtradas = data.data.filter(v =>
                v.nombre.toLowerCase().includes(termino) ||
                v.enfermedad.toLowerCase().includes(termino) ||
                (v.grupo && v.grupo.toLowerCase().includes(termino)) ||
                v.esquema_vacunacion.toLowerCase().includes(termino) ||
                v.via_administracion.toLowerCase().includes(termino)
              );
              renderVacunas(filtradas, tablaGlobal);
            }
          });
      });
    }
  }

  // ----- REGISTRAR VACUNACIÓN -----
  if (formRegistro) {

    if (cedulaInput && nombreInput) {
      cedulaInput.addEventListener("blur", () => {
        const cedula = cedulaInput.value.trim();
        if (!cedula) return;

        fetch(`../../controllers/VacunasController.php?action=buscarPaciente&cedula=${cedula}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === "success") {
              nombreInput.value = data.data.nombre_completo;
              actualizarTablaPaciente(data.data.id_usuario);
            } else {
              nombreInput.value = "";
              tablaPaciente.innerHTML = `<tr><td colspan="5" class="text-center">Paciente no encontrado</td></tr>`;
            }
          });
      });
    }

    formRegistro.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(formRegistro);

      fetch('../../controllers/VacunasController.php?action=registrarVacuna', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          alert("Vacunación registrada correctamente.");
          formRegistro.reset();
          nombreInput.value = "";
          const cedula = cedulaInput.value.trim();
          if (cedula) {
            fetch(`../../controllers/VacunasController.php?action=buscarPaciente&cedula=${cedula}`)
              .then(res => res.json())
              .then(data => {
                if (data.status === "success") actualizarTablaPaciente(data.data.id_usuario);
              });
          }
        } else alert("Error: " + data.message);
      });
    });

    // Buscador vacunas del paciente
    if (buscadorPaciente) {
      buscadorPaciente.addEventListener("keyup", () => {
        const termino = buscadorPaciente.value.toLowerCase();
        const cedula = cedulaInput.value.trim();
        if (!cedula) return;
        fetch(`../../controllers/VacunasController.php?action=buscarPaciente&cedula=${cedula}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === "success") {
              const id_usuario = data.data.id_usuario;
              fetch(`../../controllers/VacunasController.php?action=listarVacunasPaciente&id_usuario=${id_usuario}`)
                .then(res => res.json())
                .then(data => {
                  if (data.status === "success") {
                    const filtradas = data.data.filter(v =>
                      v.nombre.toLowerCase().includes(termino) ||
                      v.enfermedad.toLowerCase().includes(termino) ||
                      (v.grupo && v.grupo.toLowerCase().includes(termino)) ||
                      v.esquema_vacunacion.toLowerCase().includes(termino) ||
                      v.via_administracion.toLowerCase().includes(termino)
                    );
                    renderVacunas(filtradas, tablaPaciente);
                  }
                });
            }
          });
      });
    }

    function actualizarTablaPaciente(id_usuario) {
      if (!id_usuario || !tablaPaciente) return;
      fetch(`../../controllers/VacunasController.php?action=listarVacunasPaciente&id_usuario=${id_usuario}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") renderVacunas(data.data, tablaPaciente);
          else tablaPaciente.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron vacunas</td></tr>`;
        });
    }
  }
});

// Función para renderizar la tabla de vacunas
function renderVacunas(vacunas, tabla) {
  tabla.innerHTML = "";
  if (vacunas.length === 0) {
    tabla.innerHTML = `<tr><td colspan="5" class="text-center">No hay vacunas registradas</td></tr>`;
    return;
  }

  vacunas.forEach(vacuna => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${vacuna.nombre}</td>
      <td>${vacuna.enfermedad}</td>
      <td>${vacuna.grupo ?? 'N/A'}</td>
      <td>${vacuna.esquema_vacunacion}</td>
      <td>${vacuna.via_administracion}</td>
    `;
    tabla.appendChild(fila);
  });
}

