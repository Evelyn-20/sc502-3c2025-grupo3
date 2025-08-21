// =====================================================
// ARCHIVO: vacunacion.js - GESTIÓN DE VACUNACIONES (MEJORADO)
// =====================================================

// Variables globales
let currentVacunacionId = null;

// =====================================================
// FUNCIONES PARA LA PÁGINA DE LISTADO (Vacunas.php)
// =====================================================

$(document).ready(function() {
    // Solo ejecutar si estamos en la página de listado
    if (window.location.pathname.includes('Vacunas.php') || $('#vacunasTableBody').length > 0) {
        inicializarListado();
    }
    
    // Solo ejecutar si estamos en la página de registro
    if (window.location.pathname.includes('RegistrarVacunacion') || $('#form-vacunacion').length > 0) {
        inicializarRegistro();
    }
    
    // Solo ejecutar si estamos en la página de actualización
    if (window.location.pathname.includes('ActualizarVacunacion') || $('#form-vacunacion-edit').length > 0) {
        inicializarActualizacion();
    }
});

// Inicializar página de listado
function inicializarListado() {
    console.log('Inicializando listado de vacunaciones...');
    cargarVacunaciones();
    
    // Búsqueda en tiempo real
    $('#buscarVacuna').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        filtrarTabla(searchTerm);
    });
}

// Cargar todas las vacunaciones
function cargarVacunaciones() {
    console.log('Cargando vacunaciones...');
    
    // Mostrar indicador de carga
    $('#vacunasTableBody').html('<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando vacunaciones...</td></tr>');
    
    $.ajax({
        url: '../router.php?action=listVacunas',
        method: 'GET',
        dataType: 'json',
        timeout: 10000, // 10 segundos de timeout
        success: function(response) {
            console.log('Respuesta del servidor:', response);
            
            if (response && response.status === 'success') {
                if (response.data && Array.isArray(response.data)) {
                    mostrarVacunaciones(response.data);
                } else {
                    console.warn('Datos no válidos recibidos:', response.data);
                    $('#vacunasTableBody').html('<tr><td colspan="6" class="text-center">No hay datos válidos para mostrar</td></tr>');
                }
            } else {
                console.error('Error en respuesta del servidor:', response);
                const mensaje = response && response.message ? response.message : 'Error desconocido del servidor';
                $('#vacunasTableBody').html(`<tr><td colspan="6" class="text-center text-danger">Error: ${mensaje}</td></tr>`);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error AJAX completo:', {
                status: status,
                error: error,
                responseText: xhr.responseText,
                statusCode: xhr.status
            });
            
            let mensaje = 'Error de conexión';
            if (xhr.status === 404) {
                mensaje = 'Archivo router.php no encontrado';
            } else if (xhr.status === 500) {
                mensaje = 'Error interno del servidor';
            } else if (status === 'timeout') {
                mensaje = 'Tiempo de espera agotado';
            }
            
            $('#vacunasTableBody').html(`<tr><td colspan="6" class="text-center text-danger">${mensaje}</td></tr>`);
        }
    });
}

// Mostrar vacunaciones en la tabla
// =====================================================
// ACTUALIZACIÓN: Agregar funciones de habilitar/deshabilitar vacunas
// =====================================================

// Actualizar la función mostrarVacunaciones para incluir botones según el estado
function mostrarVacunaciones(vacunaciones) {
    console.log('Mostrando', vacunaciones.length, 'vacunaciones');
    let html = '';
    
    if (vacunaciones.length === 0) {
        html = '<tr><td colspan="6" class="text-center text-muted">No hay vacunaciones registradas</td></tr>';
    } else {
        vacunaciones.forEach(function(vacunacion, index) {
            // Validar datos esenciales
            if (!vacunacion.id_vacuna_paciente) {
                console.warn(`Vacunación ${index} sin ID válido:`, vacunacion);
                return; // Saltar esta vacunación
            }
            
            const id = vacunacion.id_vacuna_paciente;
            const nombrePaciente = vacunacion.nombre_paciente || vacunacion.nombre_completo || 'Sin nombre';
            const nombreVacuna = vacunacion.nombre_vacuna || 'Vacuna no especificada';
            const dosis = vacunacion.dosis || 'No especificada';
            const fecha = formatearFecha(vacunacion.fecha_vacunacion);
            const estadoBadge = getEstadoBadge(vacunacion);
            
            // Botones de acción base
            let actionsHtml = `
                <button class="btn btn-sm btn-info" 
                        onclick="verDetalles(${id})" 
                        title="Ver Detalles"
                        data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning ms-1" 
                        onclick="editarVacunacion(${id})" 
                        title="Editar"
                        data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
            `;

            // Botón de deshabilitar/habilitar según el estado actual
            if (vacunacion.id_estado == 1) {
                actionsHtml += `
                    <button class="btn btn-sm btn-danger ms-1" 
                            onclick="deshabilitarVacuna(${id})" 
                            title="Deshabilitar"
                            data-id="${id}">
                        <i class="fas fa-ban"></i>
                    </button>
                `;
            } else if (vacunacion.id_estado == 2) {
                actionsHtml += `
                    <button class="btn btn-sm btn-success ms-1" 
                            onclick="habilitarVacuna(${id})" 
                            title="Habilitar"
                            data-id="${id}">
                        <i class="fas fa-check"></i>
                    </button>
                `;
            }
            
            html += `
                <tr data-vacunacion-id="${id}">
                    <td>${escapeHtml(nombrePaciente)}</td>
                    <td>${escapeHtml(nombreVacuna)}</td>
                    <td>${fecha}</td>
                    <td>${escapeHtml(dosis)}</td>
                    <td>${estadoBadge}</td>
                    <td>
                        <div class="btn-group" role="group">
                            ${actionsHtml}
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    $('#vacunasTableBody').html(html);
}

// Ver detalles de la vacunación
function verDetalles(id) {
    if (!validarId(id, 'ver detalles')) return;
    
    console.log('Viendo detalles de vacunación ID:', id);
    
    $.ajax({
        url: `../router.php?action=showVacunaPaciente&id=${id}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.status === 'success' && response.data) {
                mostrarModalDetalles(response.data);
            } else {
                const mensaje = response && response.message ? response.message : 'No se encontraron los datos';
                alert('Error al cargar detalles: ' + mensaje);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar detalles:', error);
            alert('Error de conexión al cargar los detalles');
        }
    });
}

// Mostrar modal con detalles
function mostrarModalDetalles(vacuna) {
    const detallesHtml = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Paciente:</label>
                <div class="p-2 border rounded bg-light">
                    ${escapeHtml(vacuna.nombre_completo || 'N/A')}
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Cédula:</label>
                <div class="p-2 border rounded bg-light">
                    ${escapeHtml(vacuna.cedula_usuario || 'N/A')}
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Vacuna:</label>
                <div class="p-2 border rounded bg-light">
                    ${escapeHtml(vacuna.nombre_vacuna || 'N/A')}
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Dosis:</label>
                <div class="p-2 border rounded bg-light">
                    ${escapeHtml(vacuna.dosis || 'N/A')}
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Fecha de Vacunación:</label>
                <div class="p-2 border rounded bg-light">
                    ${formatearFecha(vacuna.fecha_vacunacion)}
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Tiempo de Tratamiento:</label>
                <div class="p-2 border rounded bg-light">
                    ${escapeHtml(vacuna.tiempo_tratamiento || 'N/A')}
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 mb-3">
                <label class="form-label fw-bold">Descripción:</label>
                <div class="p-2 border rounded bg-light" style="min-height: 60px;">
                    ${escapeHtml(vacuna.descripcion || 'Sin descripción')}
                </div>
            </div>
        </div>
    `;
    
    $('#vacunaDetalles').html(detallesHtml);
    $('#vacunaModal').modal('show');
}

// Editar vacunación
function editarVacunacion(id) {
    if (!validarId(id, 'editar')) return;
    
    console.log('Editando vacunación ID:', id);
    
    // Intentar con diferentes extensiones de archivo
    const posiblesArchivos = [
        `ActualizarVacunacion.html?id=${id}`,
        `ActualizarVacunacion.html?id=${id}`,
        `EditarVacunacion.php?id=${id}`
    ];
    
    // Por ahora usar el primero, pero podrías implementar detección
    window.location.href = posiblesArchivos[0];
}

// Confirmar eliminación
function confirmarEliminacion(id) {
    if (!validarId(id, 'eliminar')) return;
    
    console.log('Preparando eliminación de vacunación ID:', id);
    currentVacunacionId = id;
    $('#modalConfirmacion').modal('show');
}

// Ejecutar eliminación confirmada
function confirmarDeshabilitacion() {
    if (!currentVacunacionId) {
        alert('Error: No se especificó qué vacunación eliminar');
        return;
    }
    
    const id = currentVacunacionId;
    console.log('Eliminando vacunación ID:', id);
    
    // Deshabilitar botón para evitar doble click
    const btnConfirmar = $('button[onclick="confirmarDeshabilitacion()"]');
    const textoOriginal = btnConfirmar.html();
    btnConfirmar.html('<i class="fas fa-spinner fa-spin"></i> Eliminando...').prop('disabled', true);
    
    $.ajax({
        url: '../router.php?action=deleteVacuna',
        method: 'POST',
        data: { id: id },
        dataType: 'json',
        success: function(response) {
            btnConfirmar.html(textoOriginal).prop('disabled', false);
            
            if (response && response.status === 'success') {
                alert('Vacunación eliminada exitosamente');
                $('#modalConfirmacion').modal('hide');
                currentVacunacionId = null;
                cargarVacunaciones(); // Recargar la lista
            } else {
                const mensaje = response && response.message ? response.message : 'Error desconocido';
                alert('Error al eliminar: ' + mensaje);
            }
        },
        error: function(xhr, status, error) {
            btnConfirmar.html(textoOriginal).prop('disabled', false);
            console.error('Error al eliminar:', error);
            alert('Error de conexión al eliminar la vacunación');
        }
    });
}

// =====================================================
// FUNCIONES PARA REGISTRO DE VACUNACIÓN (MEJORADAS)
// =====================================================

function inicializarRegistro() {
    console.log('Inicializando registro de vacunación...');
    
    cargarVacunasCatalogo();
    
    // Event listeners
    $('#form-vacunacion').on('submit', function(e) {
        e.preventDefault();
        registrarVacunacion();
    });
    
    // Configurar búsqueda automática de paciente por cédula (IGUAL QUE EN MEDICACIÓN)
    setupPatientSearchVacunacion();
    
    // Autocompletar fecha actual
    const today = new Date().toISOString().split('T')[0];
    $('#fecha_vacunacion').val(today);
    
    // Mostrar fecha actual
    $('#fecha-actual').text(new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }));
}

/**
 * Configurar búsqueda automática de paciente por cédula (NUEVA FUNCIÓN)
 */
function setupPatientSearchVacunacion() {
    let searchTimeout;
    
    // Validación de cédula solo números
    $('#cedula').on('input', function() {
        // Solo permitir números
        this.value = this.value.replace(/[^0-9]/g, '');
        
        const cedula = $(this).val().trim();
        
        // Limpiar timeout anterior
        clearTimeout(searchTimeout);
        
        // Limpiar campo de nombre si no hay cédula
        if (!cedula) {
            $('#nombre_completo').val('');
            $('#cedula').removeData('paciente-id');
            return;
        }
        
        // Buscar después de 500ms de inactividad
        searchTimeout = setTimeout(() => {
            buscarPacientePorCedulaAuto(cedula);
        }, 500);
    });
}

/**
 * Buscar paciente por cédula automáticamente (NUEVA FUNCIÓN)
 */
function buscarPacientePorCedulaAuto(cedula) {
    if (cedula.length < 9) {
        $('#nombre_completo').val('');
        $('#cedula').removeData('paciente-id');
        return; // Cédula muy corta
    }
    
    console.log('Buscando paciente con cédula:', cedula);
    
    $.ajax({
        url: '../router.php?action=searchPatientVacuna',
        method: 'GET',
        data: { cedula: cedula },
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta búsqueda automática:', response);
            
            if (response && response.status === 'success' && response.data) {
                const paciente = response.data;
                $('#nombre_completo').val(paciente.nombre_completo);
                // Guardar ID del paciente para uso posterior
                $('#cedula').data('paciente-id', paciente.id_usuario || paciente.id);
                
                // Opcional: Mover el foco al siguiente campo
                $('#id_vacuna').focus();
            } else {
                $('#nombre_completo').val('');
                $('#cedula').removeData('paciente-id');
                
                // Solo mostrar error si la cédula es suficientemente larga
                if (cedula.length >= 9) {
                    console.warn('Paciente no encontrado con cédula:', cedula);
                    // No mostrar alert automáticamente para no molestar al usuario
                    // El usuario sabrá que no se encontró porque el nombre quedará vacío
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al buscar paciente automáticamente:', error);
            $('#nombre_completo').val('');
            $('#cedula').removeData('paciente-id');
        }
    });
}

// Cargar catálogo de vacunas
function cargarVacunasCatalogo() {
    $.ajax({
        url: '../router.php?action=getVacunasCatalogo',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.status === 'success') {
                llenarSelectVacunas(response.data);
            } else {
                console.error('Error al cargar catálogo:', response);
                alert('Error al cargar el catálogo de vacunas');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar catálogo:', error);
            alert('Error de conexión al cargar las vacunas disponibles');
        }
    });
}

// Llenar select de vacunas
function llenarSelectVacunas(vacunas) {
    const select = $('#id_vacuna');
    select.empty().append('<option value="">-- Selecciona una vacuna --</option>');
    
    if (vacunas && Array.isArray(vacunas)) {
        vacunas.forEach(vacuna => {
            select.append(`<option value="${vacuna.id_vacuna}">${escapeHtml(vacuna.nombre)}</option>`);
        });
    }
}

// Registrar vacunación (NUEVA FUNCIÓN)
function registrarVacunacion() {
    // Validar campos
    if (!validarFormularioVacunacion()) {
        return;
    }
    
    // Recopilar datos del formulario con los nombres correctos que espera el PHP
    const formData = {
        // Para el controlador createForPatient, necesitamos estos campos:
        nombre_completo: $('#nombre_completo').val().trim(),
        fecha_vacunacion: $('#fecha_vacunacion').val(),
        tiempo_tratamiento: $('#tiempo_tratamiento').val().trim(),
        dosis: $('#dosis').val().trim(),
        descripcion: $('#descripcion').val().trim(),
        id_vacuna: parseInt($('#id_vacuna').val())
        
        // Nota: cedula_paciente no se necesita para createForPatient 
        // porque usa la sesión del usuario logueado
    };
    
    console.log('Datos de vacunación a enviar:', formData);
    
    // Deshabilitar botón de envío
    const btnSubmit = $('#form-vacunacion button[type="submit"]');
    const textoOriginal = btnSubmit.text();
    btnSubmit.prop('disabled', true).text('Registrando...');
    
    $.ajax({
        url: '../router.php?action=createVacunaPatient',
        method: 'POST',
        data: formData,
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta del registro:', response);
            
            if (response && response.status === 'success') {
                // Éxito: limpiar formulario y mostrar mensaje
                limpiarFormulario();
                alert('✅ Vacunación registrada exitosamente');
                
                // Opcional: redireccionar después de un momento
                setTimeout(() => {
                    window.location.href = 'Vacunas.php';
                }, 1500);
            } else {
                const mensaje = response && response.message ? response.message : 'Error desconocido';
                alert('❌ Error al registrar vacunación: ' + mensaje);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al registrar vacunación:', error, xhr.responseText);
            alert('❌ Error de conexión al registrar la vacunación');
        },
        complete: function() {
            // Rehabilitar botón
            btnSubmit.prop('disabled', false).text(textoOriginal);
        }
    });
}

// Validar formulario de vacunación (NUEVA FUNCIÓN)
function validarFormularioVacunacion() {
    let isValid = true;
    let errors = [];
    
    // Validar nombre completo
    const nombreCompleto = $('#nombre_completo').val().trim();
    if (!nombreCompleto) {
        errors.push('El nombre completo del paciente es requerido');
        isValid = false;
    }
    
    // Validar vacuna
    const idVacuna = $('#id_vacuna').val();
    if (!idVacuna || idVacuna === '') {
        errors.push('Debe seleccionar una vacuna');
        isValid = false;
    }
    
    // Validar dosis
    const dosis = $('#dosis').val().trim();
    if (!dosis) {
        errors.push('La dosis es requerida');
        isValid = false;
    }
    
    // Validar tiempo de tratamiento
    const tiempoTratamiento = $('#tiempo_tratamiento').val().trim();
    if (!tiempoTratamiento) {
        errors.push('El tiempo de tratamiento es requerido');
        isValid = false;
    }
    
    // Validar fecha
    const fechaVacunacion = $('#fecha_vacunacion').val();
    if (!fechaVacunacion) {
        errors.push('La fecha de vacunación es requerida');
        isValid = false;
    }

    const descripcion = $('#descripcion').val().trim();
    if (!descripcion) {
        errors.push('La descripción es requerida');
        isValid = false;
    }
    
    if (!isValid) {
        alert('Por favor corrija los siguientes errores:\n• ' + errors.join('\n• '));
        
        // Enfocar el primer campo con error
        if (!nombreCompleto) $('#nombre_completo').focus();
        else if (!idVacuna) $('#id_vacuna').focus();
        else if (!dosis) $('#dosis').focus();
        else if (!tiempoTratamiento) $('#tiempo_tratamiento').focus();
        else if (!fechaVacunacion) $('#fecha_vacunacion').focus();
    }
    
    return isValid;
}

// Buscar paciente (función antigua mantenida para compatibilidad)
function buscarPaciente() {
    const cedula = $('#cedula').val().trim();
    
    if (!cedula) {
        alert('Por favor ingrese una cédula');
        $('#cedula').focus();
        return;
    }
    
    // Usar la función automática
    buscarPacientePorCedulaAuto(cedula);
}

// =====================================================
// FUNCIONES PARA ACTUALIZACIÓN DE VACUNACIÓN (COMPLETA)
// =====================================================

let vacunacionId = null;
let datosOriginales = null;

function inicializarActualizacion() {
    console.log('Inicializando actualización de vacunación...');
    
    // Obtener ID de la URL
    vacunacionId = obtenerIdDeUrl();
    
    if (!vacunacionId) {
        alert('Error: No se especificó qué vacunación editar');
        window.location.href = 'Vacunas.php';
        return;
    }
    
    console.log('ID de vacunación a editar:', vacunacionId);
    
    // Cargar catálogo de vacunas primero, luego los datos
    cargarVacunasCatalogoParaEdicion();
    
    // Configurar evento del formulario
    $('#form-vacunacion-edit').on('submit', function(e) {
        e.preventDefault();
        actualizarVacunacion();
    });
}

function obtenerIdDeUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('ID obtenido de URL:', id);
    return id;
}

function cargarVacunasCatalogoParaEdicion() {
    $.ajax({
        url: '../router.php?action=getVacunasCatalogo',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.status === 'success') {
                llenarSelectVacunas(response.data);
                // Una vez cargado el catálogo, cargar los datos de la vacunación
                cargarDatosVacunacion();
            } else {
                console.error('Error al cargar catálogo:', response);
                alert('Error al cargar el catálogo de vacunas');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar catálogo:', error);
            alert('Error de conexión al cargar las vacunas disponibles');
        }
    });
}

function cargarDatosVacunacion() {
    // Mostrar overlay de carga
    $('#loading-overlay').show();
    
    $.ajax({
        url: `../router.php?action=showVacunaPaciente&id=${vacunacionId}`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Datos cargados:', response);
            
            if (response && response.status === 'success' && response.data) {
                datosOriginales = response.data;
                llenarFormularioConDatos(response.data);
            } else {
                const mensaje = response && response.message ? response.message : 'No se encontraron los datos';
                alert('Error al cargar datos de la vacunación: ' + mensaje);
                window.location.href = 'Vacunas.php';
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar vacunación:', error);
            alert('Error de conexión al cargar la vacunación');
            window.location.href = 'Vacunas.php';
        },
        complete: function() {
            $('#loading-overlay').hide();
        }
    });
}

function llenarFormularioConDatos(vacunacion) {
    console.log('Llenando formulario con datos:', vacunacion);
    
    // Llenar campos del formulario
    $('#id_vacuna_paciente').val(vacunacion.id_vacuna_paciente || vacunacionId);
    $('#cedula').val(vacunacion.cedula_usuario || '');
    $('#nombre_completo').val(vacunacion.nombre_completo || '');
    $('#dosis').val(vacunacion.dosis || '');
    $('#tiempo_tratamiento').val(vacunacion.tiempo_tratamiento || '');
    $('#fecha_vacunacion').val(vacunacion.fecha_vacunacion || '');
    $('#descripcion').val(vacunacion.descripcion || '');
    
    // Seleccionar vacuna cuando el select esté listo
    if (vacunacion.id_vacuna) {
        // Esperar a que el select se cargue completamente
        const checkSelect = setInterval(() => {
            if ($('#id_vacuna option').length > 1) {
                $('#id_vacuna').val(vacunacion.id_vacuna);
                clearInterval(checkSelect);
                console.log('Vacuna seleccionada:', vacunacion.id_vacuna);
            }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => {
            clearInterval(checkSelect);
            $('#id_vacuna').val(vacunacion.id_vacuna);
        }, 3000);
    }
}

function actualizarVacunacion() {
    // Validar campos
    if (!validarFormularioVacunacionEdit()) {
        return;
    }
    
    // Obtener el ID de la vacunación
    const idVacunacionPaciente = $('#id_vacuna_paciente').val();
    
    if (!idVacunacionPaciente) {
        alert('Error: No se puede identificar la vacunación a actualizar');
        return;
    }
    
    // Recopilar datos del formulario
    const formData = {
        id_vacuna_paciente: idVacunacionPaciente,
        nombre_completo: $('#nombre_completo').val().trim(),
        fecha_vacunacion: $('#fecha_vacunacion').val(),
        tiempo_tratamiento: $('#tiempo_tratamiento').val().trim(),
        dosis: $('#dosis').val().trim(),
        descripcion: $('#descripcion').val().trim(),
        id_vacuna: parseInt($('#id_vacuna').val())
    };
    
    console.log('Datos de actualización a enviar:', formData);
    
    // Deshabilitar botón de envío
    const btnSubmit = $('#form-vacunacion-edit button[type="submit"]');
    const textoOriginal = btnSubmit.text();
    btnSubmit.prop('disabled', true).text('Actualizando...');
    
    // Mostrar overlay de carga
    $('#loading-overlay').show();
    
    $.ajax({
        url: '../router.php?action=updateVacuna',
        method: 'POST',
        data: formData,
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta de actualización:', response);
            
            if (response && response.status === 'success') {
                alert('✅ Vacunación actualizada exitosamente');
                
                // Redireccionar después de un momento
                setTimeout(() => {
                    window.location.href = 'Vacunas.php';
                }, 1000);
            } else {
                const mensaje = response && response.message ? response.message : 'Error desconocido';
                alert('❌ Error al actualizar vacunación: ' + mensaje);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al actualizar vacunación:', error, xhr.responseText);
            alert('❌ Error de conexión al actualizar la vacunación');
        },
        complete: function() {
            // Rehabilitar botón y ocultar overlay
            btnSubmit.prop('disabled', false).text(textoOriginal);
            $('#loading-overlay').hide();
        }
    });
}

function validarFormularioVacunacionEdit() {
    let isValid = true;
    let errors = [];
    
    // Validar nombre completo
    const nombreCompleto = $('#nombre_completo').val().trim();
    if (!nombreCompleto) {
        errors.push('El nombre completo del paciente es requerido');
        isValid = false;
    }
    
    // Validar vacuna
    const idVacuna = $('#id_vacuna').val();
    if (!idVacuna || idVacuna === '') {
        errors.push('Debe seleccionar una vacuna');
        isValid = false;
    }
    
    // Validar dosis
    const dosis = $('#dosis').val().trim();
    if (!dosis) {
        errors.push('La dosis es requerida');
        isValid = false;
    }
    
    // Validar tiempo de tratamiento
    const tiempoTratamiento = $('#tiempo_tratamiento').val().trim();
    if (!tiempoTratamiento) {
        errors.push('El tiempo de tratamiento es requerido');
        isValid = false;
    }
    
    // Validar fecha
    const fechaVacunacion = $('#fecha_vacunacion').val();
    if (!fechaVacunacion) {
        errors.push('La fecha de vacunación es requerida');
        isValid = false;
    }
    
    // Validar ID de vacunación (debe existir)
    const idVacunacionPaciente = $('#id_vacuna_paciente').val();
    if (!idVacunacionPaciente) {
        errors.push('No se puede identificar la vacunación a actualizar');
        isValid = false;
    }
    
    if (!isValid) {
        alert('Por favor corrija los siguientes errores:\n• ' + errors.join('\n• '));
        
        // Enfocar el primer campo con error
        if (!nombreCompleto) $('#nombre_completo').focus();
        else if (!idVacuna) $('#id_vacuna').focus();
        else if (!dosis) $('#dosis').focus();
        else if (!tiempoTratamiento) $('#tiempo_tratamiento').focus();
        else if (!fechaVacunacion) $('#fecha_vacunacion').focus();
    }
    
    return isValid;
}

// Exportar funciones globalmente
window.actualizarVacunacion = actualizarVacunacion;
window.validarFormularioVacunacionEdit = validarFormularioVacunacionEdit;

// =====================================================
// FUNCIONES UTILITARIAS
// =====================================================

// Validar ID
function validarId(id, accion) {
    if (!id || id === 'undefined' || id === 'null' || id === '' || isNaN(id)) {
        console.error(`ID inválido para ${accion}:`, id);
        alert(`Error: ID de vacunación no válido para ${accion}`);
        return false;
    }
    return true;
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Filtrar tabla por término de búsqueda
function filtrarTabla(searchTerm) {
    let totalVisible = 0;
    
    $('#vacunasTableBody tr').each(function() {
        const row = $(this);
        const rowText = row.text().toLowerCase();
        
        if (rowText.includes(searchTerm)) {
            row.show();
            totalVisible++;
        } else {
            row.hide();
        }
    });
    
    // Mostrar mensaje si no hay resultados
    if (searchTerm && totalVisible === 0) {
        if ($('#vacunasTableBody').find('.no-results').length === 0) {
            $('#vacunasTableBody').append('<tr class="no-results"><td colspan="6" class="text-center text-muted">No se encontraron resultados para la búsqueda</td></tr>');
        }
    } else {
        $('.no-results').remove();
    }
}

// Obtener badge de estado
function getEstadoBadge(vacunacion) {
    if (vacunacion.id_estado == 2) {
        return '<span class="badge bg-secondary">Inactiva</span>';
    }
    return '<span class="badge bg-success">Aplicada</span>';
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    
    try {
        // Manejar diferentes formatos de fecha
        let date;
        if (fecha.includes('T')) {
            date = new Date(fecha);
        } else {
            date = new Date(fecha + 'T00:00:00');
        }
        
        if (isNaN(date.getTime())) {
            console.warn('Fecha inválida:', fecha);
            return 'Fecha inválida';
        }
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error al formatear fecha:', error, fecha);
        return 'Error en fecha';
    }
}

// =====================================================
// EXPORTAR FUNCIONES GLOBALES
// =====================================================

// Hacer funciones disponibles globalmente
window.verDetalles = verDetalles;
window.editarVacunacion = editarVacunacion;
window.confirmarEliminacion = confirmarEliminacion;
window.confirmarDeshabilitacion = confirmarDeshabilitacion;
window.buscarPaciente = buscarPaciente;
window.limpiarFormulario = function() {
    $('#form-vacunacion')[0].reset();
    $('#nombre_completo').val('');
    $('#cedula').removeData('paciente-id');
    const today = new Date().toISOString().split('T')[0];
    $('#fecha_vacunacion').val(today);
    $('#cedula').focus();
};