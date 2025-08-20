document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del expediente al iniciar la página
    cargarExpediente();
    
    // Si estamos en la página de actualizar, configurar el formulario
    const expedienteForm = document.getElementById('expedienteForm');
    if (expedienteForm) {
        expedienteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            actualizarExpediente();
        });
    }
});

/**
 * Cargar datos del expediente desde el servidor
 */
function cargarExpediente() {
    // Mostrar indicador de carga
    const nombreElement = document.getElementById('nombreCompleto');
    if (nombreElement) {
        nombreElement.textContent = 'Cargando...';
    }

    fetch('../router.php?action=showExpediente')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                llenarFormulario(data.data);
            } else {
                console.error('Error del servidor:', data.message);
                mostrarError('Error al cargar el expediente: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            mostrarError('Error de conexión al cargar el expediente. Verifique su conexión a internet.');
        });
}

/**
 * Llenar el formulario con los datos del expediente
 * @param {Object} data - Datos del expediente
 */
function llenarFormulario(data) {
    try {
        // Información personal
        const nombreCompleto = (data.nombre || '') + ' ' + (data.apellidos || '');
        document.getElementById('nombreCompleto').textContent = nombreCompleto.trim() || 'Sin nombre';
        
        // Campos de solo lectura y editables
        setValue('cedula', data.cedula_usuario);
        setValue('correo', data.correo);
        setValue('telefono', data.telefono);
        setValue('estadoCivil', data.estado_civil);
        setValue('fechaNacimiento', data.fecha_nacimiento);
        setValue('genero', data.genero);
        setValue('direccion', data.direccion);

        // Información médica
        setValue('peso', data.peso);
        setValue('altura', data.altura);
        setValue('tipoSangre', data.tipo_sangre);
        setValue('enfermedades', data.enfermedades);
        setValue('alergias', data.alergias);
        setValue('cirugias', data.cirugias);
        
    } catch (error) {
        console.error('Error al llenar formulario:', error);
        mostrarError('Error al mostrar la información del expediente');
    }
}

/**
 * Establecer valor en un campo de forma segura
 * @param {string} fieldId - ID del campo
 * @param {*} value - Valor a establecer
 */
function setValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
    }
}

/**
 * Actualizar expediente en el servidor
 */
function actualizarExpediente() {
    const form = document.getElementById('expedienteForm');
    if (!form) {
        console.error('Formulario de expediente no encontrado');
        return;
    }

    // Validar campos requeridos
    if (!validarFormulario(form)) {
        return;
    }

    const formData = new FormData(form);
    
    // Mostrar indicador de carga
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Guardando...';
    submitBtn.disabled = true;
    
    fetch('../router.php?action=updateExpediente', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            mostrarExito('Expediente actualizado exitosamente');
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = 'Expediente.html';
            }, 1500);
        } else {
            mostrarError('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error de conexión:', error);
        mostrarError('Error de conexión al actualizar el expediente. Intente nuevamente.');
    })
    .finally(() => {
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

/**
 * Validar campos del formulario
 * @param {HTMLFormElement} form - Formulario a validar
 * @returns {boolean} - True si es válido
 */
function validarFormulario(form) {
    const correo = form.querySelector('[name="correo"]');
    
    if (!correo || !correo.value.trim()) {
        mostrarError('El correo electrónico es requerido');
        correo?.focus();
        return false;
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.value.trim())) {
        mostrarError('Por favor ingrese un correo electrónico válido');
        correo.focus();
        return false;
    }
    
    return true;
}

/**
 * Mostrar mensaje de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarError(mensaje) {
    // Usar alert por simplicidad, puedes cambiar por un modal o toast
    alert('❌ ' + mensaje);
}

/**
 * Mostrar mensaje de éxito
 * @param {string} mensaje - Mensaje de éxito
 */
function mostrarExito(mensaje) {
    // Usar alert por simplicidad, puedes cambiar por un modal o toast
    alert('✅ ' + mensaje);
}

/**
 * Función auxiliar para debugging
 * @param {string} message - Mensaje a loggear
 * @param {*} data - Datos adicionales
 */
function debugLog(message, data = '') {
    if (console && console.log) {
        console.log('[Expediente Debug]', message, data);
    }
}