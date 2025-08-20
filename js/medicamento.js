$(document).ready(function() {
    console.log('Inicializando medicamentos...');
    // Cargar medicamentos del paciente al iniciar la página
    loadPatientMedications();
    
    // Configurar búsqueda si existe el campo
    $('#buscarMedicamento').on('input', function() {
        filtrarMedicamentos($(this).val());
    });
});

let medicamentosData = []; // Almacenar datos para filtrado

/**
 * Determinar URL del router
 */
function determineRouterUrl(action) {
    return `../router.php?action=${action}`;
}

/**
 * Cargar medicamentos del paciente
 */
function loadPatientMedications() {
    console.log('Cargando medicamentos del paciente...');
    const url = determineRouterUrl('listMisMedicamentos');
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Medicamentos cargados:', response);
            if (response.status === 'success') {
                medicamentosData = response.data;
                populateMedicationsTable(response.data);
            } else {
                $('#medicamentosTableBody').html('<tr><td colspan="6" class="text-center">No se pudieron cargar los medicamentos</td></tr>');
                mostrarError('Error al cargar medicamentos: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar medicamentos:', error, xhr.responseText);
            $('#medicamentosTableBody').html('<tr><td colspan="6" class="text-center">Error al cargar los medicamentos</td></tr>');
            mostrarError('Error de conexión al cargar los medicamentos.');
        }
    });
}

/**
 * Llenar tabla de medicamentos
 */
function populateMedicationsTable(medicamentos) {
    const tbody = $('#medicamentosTableBody');
    
    if (!medicamentos || medicamentos.length === 0) {
        tbody.html('<tr><td colspan="6" class="text-center">No tienes medicamentos registrados</td></tr>');
        return;
    }

    let rows = '';
    medicamentos.forEach(medicamento => {
        const estadoClass = medicamento.id_estado == 1 ? 'badge bg-success' : 'badge bg-secondary';
        const estadoTexto = medicamento.estado || (medicamento.id_estado == 1 ? 'Activo' : 'Inactivo');

        // Acciones disponibles - siguiendo el patrón de citas
        let actionsHtml = `
            <button class="btn btn-sm btn-primary me-1" onclick="verDetallesMedicamento(${medicamento.id_medicamento_paciente})" title="Ver detalles">
                Ver
            </button>
        `;

        rows += `
            <tr>
                <td>
                    <strong>${medicamento.nombre_medicamento || medicamento.nombre_completo || 'N/A'}</strong>
                    ${medicamento.nombre_completo && medicamento.nombre_medicamento !== medicamento.nombre_completo ? '<br><small class="text-muted">' + medicamento.nombre_completo + '</small>' : ''}
                </td>
                <td>${medicamento.grupo_terapeutico || 'N/A'}</td>
                <td>${medicamento.via_administracion || 'N/A'}</td>
                <td>${medicamento.forma_farmaceutica || 'N/A'}</td>
                <td><span class="${estadoClass}">${estadoTexto}</span></td>
                <td>${actionsHtml}</td>
            </tr>
        `;
    });

    tbody.html(rows);
}

/**
 * Filtrar medicamentos por nombre
 * @param {string} filtro - Texto a filtrar
 */
function filtrarMedicamentos(filtro) {
    if (!medicamentosData) {
        return;
    }

    const filtroLower = filtro.toLowerCase();
    const medicamentosFiltrados = medicamentosData.filter(medicamento => {
        const nombre = (medicamento.nombre_medicamento || medicamento.nombre_completo || '').toLowerCase();
        const grupo = (medicamento.grupo_terapeutico || '').toLowerCase();
        const via = (medicamento.via_administracion || '').toLowerCase();
        const forma = (medicamento.forma_farmaceutica || '').toLowerCase();
        
        return nombre.includes(filtroLower) || 
               grupo.includes(filtroLower) || 
               via.includes(filtroLower) || 
               forma.includes(filtroLower);
    });

    populateMedicationsTable(medicamentosFiltrados);
}

/**
 * Ver detalles de un medicamento
 * @param {number} idMedicamentoPaciente - ID del medicamento asignado
 */
function verDetallesMedicamento(idMedicamentoPaciente) {
    const url = determineRouterUrl(`showMedicamentoPaciente&id=${idMedicamentoPaciente}`);
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                mostrarModalDetalles(response.data);
            } else {
                mostrarError('Error al cargar detalles: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al cargar detalles.');
        }
    });
}

/**
 * Mostrar modal con detalles del medicamento
 * @param {Object} medicamento - Datos del medicamento
 */
function mostrarModalDetalles(medicamento) {
    const modalHtml = `
        <div class="modal fade" id="modalDetallesMedicamento" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-pills me-2"></i>
                            Detalles del Medicamento
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-info-circle me-2"></i>Información General</h6>
                                <p><strong>Medicamento:</strong> ${medicamento.nombre_medicamento || 'N/A'}</p>
                                <p><strong>Nombre completo:</strong> ${medicamento.nombre_completo || 'N/A'}</p>
                                <p><strong>Fecha prescripción:</strong> ${formatearFecha(medicamento.fecha_preescripcion)}</p>
                                <p><strong>Tiempo de tratamiento:</strong> ${medicamento.tiempo_tratamiento || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-capsules me-2"></i>Características</h6>
                                <p><strong>Forma farmacéutica:</strong> ${medicamento.forma_farmaceutica || 'N/A'}</p>
                                <p><strong>Grupo terapéutico:</strong> ${medicamento.grupo_terapeutico || 'N/A'}</p>
                                <p><strong>Vía administración:</strong> ${medicamento.via_administracion || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6><i class="fas fa-clipboard-list me-2"></i>Indicaciones</h6>
                                <div class="alert alert-light">
                                    ${medicamento.indicaciones || 'Sin indicaciones específicas'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('modalDetallesMedicamento');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetallesMedicamento'));
    modal.show();

    // Limpiar modal del DOM cuando se cierre
    document.getElementById('modalDetallesMedicamento').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Formatear fecha para mostrar
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    try {
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return fecha;
    }
}

/**
 * Mostrar mensaje de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarError(mensaje) {
    console.error(mensaje);
    // Podrías implementar un sistema de notificaciones más elegante aquí
    alert('⚠️ ' + mensaje);
}

/**
 * Mostrar mensaje de éxito
 * @param {string} mensaje - Mensaje de éxito
 */
function mostrarExito(mensaje) {
    console.log(mensaje);
    alert('✅ ' + mensaje);
}

/**
 * Función auxiliar para debugging
 * @param {string} message - Mensaje a loggear
 * @param {*} data - Datos adicionales
 */
function debugLog(message, data = '') {
    if (console && console.log) {
        console.log('[Medicamentos Debug]', message, data);
    }
}