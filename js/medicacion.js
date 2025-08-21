// medicacion-medico.js - Funcionalidad para médicos que prescriben medicamentos

$(document).ready(function() {
    console.log('Inicializando sistema de medicación para médicos...');
    
    // Determinar la página actual
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'RegistrarMedicacion.html') {
        initializeRegistrationForm();
    } else if (currentPage === 'ActualizarMedicacion.html') {
        initializeUpdateForm();
    } else if (currentPage === 'Medicamentos.php') {
        initializeMedicationsTable();
    }
});

/**
 * Inicializar formulario de registro de medicación
 */
function initializeRegistrationForm() {
    console.log('Inicializando formulario de registro...');
    
    // Cargar catálogo de medicamentos
    loadMedicamentoCatalog();
    
    // Configurar búsqueda de paciente por cédula
    setupPatientSearch();
    
    // Configurar envío del formulario
    setupFormSubmission();
    
    // Establecer fecha actual por defecto
    $('#fecha').val(new Date().toISOString().split('T')[0]);
}

/**
 * Inicializar formulario de actualización
 */
function initializeUpdateForm() {
    console.log('Inicializando formulario de actualización...');
    
    // Cargar catálogo de medicamentos
    loadMedicamentoCatalog();
    
    // Cargar datos del medicamento a actualizar
    const urlParams = new URLSearchParams(window.location.search);
    const medicacionId = urlParams.get('id');
    
    if (medicacionId) {
        loadMedicacionForUpdate(medicacionId);
    } else {
        alert('Error: No se especificó qué medicación editar');
        window.location.href = 'Medicamentos.php';
    }
    
    // Configurar envío del formulario de actualización
    setupUpdateFormSubmission(medicacionId);
}

/**
 * Inicializar tabla de medicaciones
 */
function initializeMedicationsTable() {
    console.log('Inicializando tabla de medicaciones...');
    loadAllPatientMedications();
    
    // Configurar búsqueda en tabla
    $('#buscarMedicamento').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterMedicationsTable(searchTerm);
    });
}

/**
 * Cargar catálogo de medicamentos disponibles
 */
function loadMedicamentoCatalog() {
    const url = determineRouterUrl('getCatalogoMedicamentos');
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Catálogo de medicamentos cargado:', response);
            if (response.status === 'success') {
                populateMedicamentoSelect(response.data);
            } else {
                console.error('Error al cargar medicamentos:', response.message);
                showError('Error al cargar el catálogo de medicamentos');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar medicamentos:', error);
            showError('Error de conexión al cargar medicamentos');
        }
    });
}

/**
 * Poblar select de medicamentos
 */
function populateMedicamentoSelect(medicamentos) {
    const select = $('#medicamento');
    select.empty().append('<option value="">-- Selecciona un medicamento --</option>');
    
    medicamentos.forEach(medicamento => {
        select.append(`
            <option value="${medicamento.id_medicamento}" 
                    data-grupo="${medicamento.grupo_terapeutico || ''}"
                    data-forma="${medicamento.forma_farmaceutica || ''}"
                    data-via="${medicamento.via_administracion || ''}">
                ${medicamento.nombre}
            </option>
        `);
    });
}

/**
 * Configurar búsqueda de paciente por cédula
 */
function setupPatientSearch() {
    let searchTimeout;
    
    $('#cedula').on('input', function() {
        const cedula = $(this).val().trim();
        
        // Limpiar timeout anterior
        clearTimeout(searchTimeout);
        
        // Limpiar campo de nombre si no hay cédula
        if (!cedula) {
            $('#nombre').val('');
            return;
        }
        
        // Buscar después de 500ms de inactividad
        searchTimeout = setTimeout(() => {
            searchPatientByCedula(cedula);
        }, 500);
    });
}

/**
 * Buscar paciente por cédula
 */
function searchPatientByCedula(cedula) {
    if (cedula.length < 9) return; // Cédula muy corta
    
    const url = determineRouterUrl('buscarPacienteMedicamento');
    
    $.ajax({
        url: url,
        method: 'GET',
        data: { cedula: cedula },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                $('#nombre').val(response.data.nombre_completo);
                // Guardar ID del paciente en un campo oculto o data attribute
                $('#cedula').data('paciente-id', response.data.id_usuario);
            } else {
                $('#nombre').val('');
                $('#cedula').removeData('paciente-id');
                
                if (cedula.length >= 9) {
                    showError('Paciente no encontrado con esa cédula');
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al buscar paciente:', error);
            $('#nombre').val('');
            $('#cedula').removeData('paciente-id');
        }
    });
}

/**
 * Configurar envío del formulario de registro
 */
function setupFormSubmission() {
    $('#form-registro').on('submit', function(e) {
        e.preventDefault();
        
        // Validar campos
        if (!validateRegistrationForm()) {
            return;
        }
        
        // Recopilar datos del formulario
        const formData = {
            nombre_completo: $('#nombre').val().trim(),
            fecha_preescripcion: $('#fecha').val(),
            tiempo_tratamiento: $('#tiempo').val().trim(),
            indicaciones: $('#indicaciones').val().trim(),
            id_medicamento: parseInt($('#medicamento').val()),
            id_paciente: $('#cedula').data('paciente-id') || 0,
            id_estado: 1
        };
        
        console.log('Datos a enviar:', formData);
        
        // Enviar al servidor
        registerMedicacion(formData);
    });
}

/**
 * Configurar envío del formulario de actualización
 */
function setupUpdateFormSubmission(medicacionId) {
    $('#form-registro').on('submit', function(e) {
        e.preventDefault();
        
        // Validar campos
        if (!validateRegistrationForm()) {
            return;
        }
        
        // Recopilar datos del formulario
        const formData = {
            id_medicamento_paciente: medicacionId,
            nombre_completo: $('#nombre').val().trim(),
            fecha_preescripcion: $('#fecha').val(),
            tiempo_tratamiento: $('#tiempo').val().trim(),
            indicaciones: $('#indicaciones').val().trim(),
            id_medicamento: parseInt($('#medicamento').val()),
            id_estado: 1
        };
        
        console.log('Datos de actualización:', formData);
        
        // Enviar actualización al servidor
        updateMedicacion(formData);
    });
}

/**
 * Validar formulario de registro
 */
function validateRegistrationForm() {
    let isValid = true;
    let errors = [];
    
    // Validar cédula y paciente
    const cedula = $('#cedula').val().trim();
    const pacienteId = $('#cedula').data('paciente-id');
    
    if (!cedula) {
        errors.push('La cédula del paciente es requerida');
        isValid = false;
    } else if (!pacienteId) {
        errors.push('Debe seleccionar un paciente válido');
        isValid = false;
    }
    
    // Validar medicamento
    if (!$('#medicamento').val()) {
        errors.push('Debe seleccionar un medicamento');
        isValid = false;
    }
    
    // Validar tiempo de tratamiento
    if (!$('#tiempo').val().trim()) {
        errors.push('El tiempo de tratamiento es requerido');
        isValid = false;
    }
    
    // Validar indicaciones
    if (!$('#indicaciones').val().trim()) {
        errors.push('Las indicaciones son requeridas');
        isValid = false;
    }
    
    // Validar fecha
    if (!$('#fecha').val()) {
        errors.push('La fecha de prescripción es requerida');
        isValid = false;
    }
    
    if (!isValid) {
        showError('Por favor corrija los siguientes errores:\n• ' + errors.join('\n• '));
    }
    
    return isValid;
}

/**
 * Registrar nueva medicación
 */
function registerMedicacion(formData) {
    const url = determineRouterUrl('asignarMedicamento');
    
    $.ajax({
        url: url,
        method: 'POST',
        data: formData,
        dataType: 'json',
        beforeSend: function() {
            // Deshabilitar botón de envío
            $('#form-registro button[type="submit"]').prop('disabled', true).text('Registrando...');
        },
        success: function(response) {
            console.log('Respuesta del registro:', response);
            if (response.status === 'success') {
                showSuccess('Medicación registrada exitosamente');
                
                // Limpiar formulario
                resetForm();
                
                // Redireccionar después de un momento
                setTimeout(() => {
                    window.location.href = 'Medicamentos.php';
                }, 1500);
            } else {
                showError('Error al registrar medicación: ' + (response.message || 'Error desconocido'));
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al registrar medicación:', error, xhr.responseText);
            showError('Error de conexión al registrar la medicación');
        },
        complete: function() {
            // Rehabilitar botón
            $('#form-registro button[type="submit"]').prop('disabled', false).text('Registrar Medicación');
        }
    });
}

/**
 * Cargar medicación para actualización
 */
function loadMedicacionForUpdate(medicacionId) {
    const url = determineRouterUrl(`showMedicamentoPaciente&id=${medicacionId}`);
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                fillUpdateForm(response.data);
            } else {
                showError('Error al cargar datos: ' + response.message);
                window.location.href = 'Medicamentos.php';
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar medicación:', error);
            showError('Error de conexión al cargar los datos');
            window.location.href = 'Medicamentos.php';
        }
    });
}

/**
 * Llenar formulario con datos para actualización
 */
function fillUpdateForm(medicacion) {
    console.log('Llenando formulario con:', medicacion);
    
    $('#cedula').val(medicacion.cedula_usuario || '').prop('readonly', true);
    $('#nombre').val(medicacion.nombre_paciente || '').prop('readonly', true);
    $('#medicamento').val(medicacion.id_medicamento || '');
    $('#tiempo').val(medicacion.tiempo_tratamiento || '');
    $('#indicaciones').val(medicacion.indicaciones || '');
    $('#fecha').val(medicacion.fecha_preescripcion || '');
    
    // Guardar ID del paciente
    $('#cedula').data('paciente-id', medicacion.id_paciente);
    
    // Cambiar texto del botón
    $('#form-registro button[type="submit"]').text('Actualizar Medicación');
}

/**
 * Actualizar medicación existente
 */
function updateMedicacion(formData) {
    const url = determineRouterUrl('actualizarMedicamentoPaciente');
    
    $.ajax({
        url: url,
        method: 'POST',
        data: formData,
        dataType: 'json',
        beforeSend: function() {
            $('#form-registro button[type="submit"]').prop('disabled', true).text('Actualizando...');
        },
        success: function(response) {
            console.log('Respuesta de actualización:', response);
            if (response.status === 'success') {
                showSuccess('Medicación actualizada exitosamente');
                
                setTimeout(() => {
                    window.location.href = 'Medicamentos.php';
                }, 1500);
            } else {
                showError('Error al actualizar medicación: ' + (response.message || 'Error desconocido'));
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al actualizar medicación:', error, xhr.responseText);
            showError('Error de conexión al actualizar la medicación');
        },
        complete: function() {
            $('#form-registro button[type="submit"]').prop('disabled', false).text('Actualizar Medicación');
        }
    });
}

/**
 * Cargar todas las medicaciones de pacientes
 */
function loadAllPatientMedications() {
    const url = determineRouterUrl('listMedicacionesPacientes');
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Medicaciones cargadas:', response);
            if (response.status === 'success') {
                populateAllMedicationsTable(response.data);
            } else {
                showTableError('No se pudieron cargar las medicaciones');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar medicaciones:', error);
            showTableError('Error de conexión al cargar las medicaciones');
        }
    });
}

/**
 * Poblar tabla con todas las medicaciones
 */
/**
 * Poblar tabla con todas las medicaciones
 */
function populateAllMedicationsTable(medicaciones) {
    const tbody = $('#medicamentosTableBody');
    
    if (!medicaciones || medicaciones.length === 0) {
        tbody.html('<tr><td colspan="7" class="text-center">No hay medicaciones registradas</td></tr>');
        return;
    }

    let rows = '';
    medicaciones.forEach(medicacion => {
        // Determinar estado real del medicamento
        const estadoInfo = determineRealStatus(
            medicacion.fecha_preescripcion, 
            medicacion.tiempo_tratamiento, 
            medicacion.id_estado
        );
        
        const estadoClass = estadoInfo.isActive ? 'badge bg-success' : 'badge bg-secondary';
        const estadoTexto = estadoInfo.reason;

        // Botones de acción base
        let actionsHtml = `
            <button class="btn btn-sm" style="background-color: #44C1F2; border-color: #44C1F2; color: white;" 
                    onclick="viewMedicationDetails(${medicacion.id_medicamento_paciente})" title="Ver Detalles">
                <i class="fas fa-eye"></i>
            </button>
            <a class="btn btn-sm ms-1" style="background-color: #ffc107; border-color: #ffc107; color: black;" 
               href="ActualizarMedicacion.html?id=${medicacion.id_medicamento_paciente}" title="Editar">
                <i class="fas fa-edit"></i>
            </a>
        `;

        // Botón de deshabilitar/habilitar según el estado actual
        if (medicacion.id_estado == 1) {
            actionsHtml += `
                <button class="btn btn-sm ms-1" style="background-color: #dc3545; border-color: #dc3545; color: white;" 
                        onclick="disableMedication(${medicacion.id_medicamento_paciente})" title="Deshabilitar">
                    <i class="fas fa-ban"></i>
                </button>
            `;
        } else if (medicacion.id_estado == 2) {
            actionsHtml += `
                <button class="btn btn-sm ms-1" style="background-color: #28a745; border-color: #28a745; color: white;" 
                        onclick="enableMedication(${medicacion.id_medicamento_paciente})" title="Habilitar">
                    <i class="fas fa-check"></i>
                </button>
            `;
        }

        rows += `
            <tr>
                <td>${medicacion.nombre_paciente || 'N/A'}</td>
                <td>${medicacion.nombre_medicamento || 'N/A'}</td>
                <td>${medicacion.grupo_terapeutico || 'N/A'}</td>
                <td>${formatDate(medicacion.fecha_preescripcion)}</td>
                <td>${medicacion.tiempo_tratamiento || 'N/A'}</td>
                <td><span class="${estadoClass}">${estadoTexto}</span></td>
                <td>${actionsHtml}</td>
            </tr>
        `;
    });

    tbody.html(rows);
}

/**
 * Determinar estado real del medicamento
 */
function determineRealStatus(fechaPreescripcion, tiempoTratamiento, idEstado) {
    // Si está inactivo en BD, respetarlo
    if (idEstado !== 1) {
        return { isActive: false, reason: 'Inactivo' };
    }
    
    // Tratamientos crónicos o continuos siempre activos
    const tratamientoCronico = /cronicos?|continuo|diario|permanente|segun\s+necesidad/i;
    if (tratamientoCronico.test(tiempoTratamiento)) {
        return { isActive: true, reason: 'Activo' };
    }
    
    // Extraer número de días
    const diasMatch = tiempoTratamiento.match(/(\d+)\s*dias?/i);
    if (!diasMatch) {
        return { isActive: true, reason: 'Activo' };
    }
    
    const diasTratamiento = parseInt(diasMatch[1]);
    const fechaInicio = new Date(fechaPreescripcion + 'T00:00:00');
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + diasTratamiento);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (hoy > fechaFin) {
        return { isActive: false, reason: 'Tratamiento finalizado' };
    }
    
    return { isActive: true, reason: 'Activo' };
}

/**
 * Filtrar tabla de medicaciones
 */
function filterMedicationsTable(searchTerm) {
    const rows = $('#medicamentosTableBody tr');
    
    if (!searchTerm) {
        rows.show();
        return;
    }
    
    rows.each(function() {
        const text = $(this).text().toLowerCase();
        if (text.includes(searchTerm)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

/**
 * Ver detalles de medicación
 */
function viewMedicationDetails(medicacionId) {
    const url = determineRouterUrl(`showMedicamentoPaciente&id=${medicacionId}`);
    
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                showMedicationModal(response.data);
            } else {
                showError('Error al cargar detalles: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            showError('Error de conexión al cargar detalles.');
        }
    });
}

/**
 * Mostrar modal con detalles
 */
function showMedicationModal(medicacion) {
    const estadoInfo = determineRealStatus(
        medicacion.fecha_preescripcion,
        medicacion.tiempo_tratamiento,
        medicacion.id_estado
    );
    
    const estadoClass = estadoInfo.isActive ? 'badge bg-success' : 'badge bg-secondary';
    
    const detallesHtml = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <strong>Paciente:</strong><br>
                ${medicacion.nombre_paciente || 'N/A'}
            </div>
            <div class="col-md-6 mb-3">
                <strong>Cédula:</strong><br>
                ${medicacion.cedula_usuario || 'N/A'}
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <strong>Medicamento:</strong><br>
                ${medicacion.nombre_medicamento || 'N/A'}
            </div>
            <div class="col-md-6 mb-3">
                <strong>Estado:</strong><br>
                <span class="${estadoClass}">${estadoInfo.reason}</span>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <strong>Fecha Prescripción:</strong><br>
                ${formatDate(medicacion.fecha_preescripcion)}
            </div>
            <div class="col-md-6 mb-3">
                <strong>Tiempo de Tratamiento:</strong><br>
                ${medicacion.tiempo_tratamiento || 'N/A'}
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 mb-3">
                <strong>Indicaciones:</strong><br>
                <div class="border p-2 rounded bg-light">
                    ${medicacion.indicaciones || 'Sin indicaciones específicas'}
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4 mb-3">
                <strong>Grupo Terapéutico:</strong><br>
                ${medicacion.grupo_terapeutico || 'N/A'}
            </div>
            <div class="col-md-4 mb-3">
                <strong>Forma Farmacéutica:</strong><br>
                ${medicacion.forma_farmaceutica || 'N/A'}
            </div>
            <div class="col-md-4 mb-3">
                <strong>Vía Administración:</strong><br>
                ${medicacion.via_administracion || 'N/A'}
            </div>
        </div>
    `;

    $('#medicacionDetalles').html(detallesHtml);
    $('#medicacionModal').modal('show');
}

/**
 * Deshabilitar medicación
 */
function disableMedication(medicacionId) {
    // Guardar ID para uso en modal
    window.currentMedicacionId = medicacionId;
    $('#modalConfirmacion').modal('show');
}

function enableMedication(medicacionId) {
    // Confirmar antes de habilitar
    if (!confirm('¿Está seguro que desea habilitar esta medicación?')) {
        return;
    }
    
    const url = determineRouterUrl('actualizarEstadoMedicamentoPaciente');
    
    $.ajax({
        url: url,
        method: 'POST',
        data: {
            id_medicamento_paciente: medicacionId,
            id_estado: 1 // Activo
        },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                showSuccess('Medicación habilitada exitosamente');
                loadAllPatientMedications(); // Recargar tabla
            } else {
                showError(response.message || 'Error al habilitar la medicación');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al habilitar medicación:', error, xhr.responseText);
            showError('Error de conexión al habilitar la medicación');
        }
    });
}

/**
 * Confirmar deshabilitación (función global para modal)
 */
function confirmarDeshabilitar() {
    const medicacionId = window.currentMedicacionId;
    
    if (!medicacionId) {
        showError('Error: No se encontró la medicación a deshabilitar');
        return;
    }
    
    const url = determineRouterUrl('actualizarEstadoMedicamentoPaciente');
    
    $.ajax({
        url: url,
        method: 'POST',
        data: {
            id_medicamento_paciente: medicacionId,
            id_estado: 2 // Inactivo
        },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                showSuccess('Medicación deshabilitada exitosamente');
                $('#modalConfirmacion').modal('hide');
                loadAllPatientMedications(); // Recargar tabla
            } else {
                showError(response.message || 'Error al deshabilitar la medicación');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al deshabilitar medicación:', error, xhr.responseText);
            showError('Error de conexión al deshabilitar la medicación');
        }
    });
}

/**
 * Utilidades
 */

function determineRouterUrl(action) {
    const currentPath = window.location.pathname;
    let basePath = '';
    
    // Mejorar la detección de la ruta
    console.log('Current path:', currentPath); // Para debug
    
    // Si estamos en una subcarpeta como /Medico/ o /medico/
    if (currentPath.includes('/Medico/') || currentPath.includes('/medico/')) {
        basePath = '../router.php';
    } else if (currentPath.includes('/Medicos/')) {
        basePath = '../router.php';
    } else {
        basePath = 'router.php';
    }
    
    const url = `${basePath}?action=${action}`;
    console.log('Generated URL:', url); // Para debug
    return url;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function resetForm() {
    $('#form-registro')[0].reset();
    $('#nombre').val('');
    $('#cedula').removeData('paciente-id');
    $('#fecha').val(new Date().toISOString().split('T')[0]);
}

function showTableError(message) {
    $('#medicamentosTableBody').html(`
        <tr>
            <td colspan="7" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>${message}
            </td>
        </tr>
    `);
}

function showError(message) {
    // Puedes implementar un sistema de notificaciones más elegante
    alert('❌ ' + message);
}

function showSuccess(message) {
    // Puedes implementar un sistema de notificaciones más elegante
    alert('✅ ' + message);
}

// Funciones globales para uso en HTML
window.viewMedicationDetails = viewMedicationDetails;
window.disableMedication = disableMedication;
window.enableMedication = enableMedication;
window.confirmarDeshabilitar = confirmarDeshabilitar;