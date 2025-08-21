// Variables globales
let editingCitaId = null;

// Verificar si jQuery está disponible
if (typeof $ === 'undefined') {
  console.error('jQuery no está cargado');
}

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    if (typeof $ !== 'undefined') {
      initializePage();
      setupEventListeners();
    } else {
      console.error('jQuery no disponible, reintentando...');
      setTimeout(function() {
        if (typeof $ !== 'undefined') {
          initializePage();
          setupEventListeners();
        }
      }, 500);
    }
  }, 100);
});

// Inicializar la página según el contexto
function initializePage() {
  console.log('Inicializando página...');
  const currentPage = window.location.pathname;
  const fileName = currentPage.split('/').pop();
  
  // Si es página de registro
  if (fileName === 'RegistrarCita.html') {
    console.log('Detectado formulario de registro');
    loadFormData();
    setupDateRestrictions();
    initializeCalendar();
  }
  
  // Si es página de actualización
  else if (fileName === 'ActualizarCita.html') {
    console.log('Detectado formulario de actualización');
    loadFormData();
    setupDateRestrictions();
    initializeCalendar();
    loadCitaForEditing();
  }
  
  // Si hay tabla de citas (HistorialCitas.php)
  else if (fileName === 'HistorialCitas.php' || document.querySelector('.custom-table') || document.getElementById('citasTable')) {
    console.log('Detectada tabla de citas');
    loadPatientAppointments();
  }
}

// Configurar event listeners
function setupEventListeners() {
  if (typeof $ === 'undefined') {
    console.error('jQuery no disponible para event listeners');
    return;
  }

  console.log('Configurando event listeners...');

  // Botón registrar cita
  $(document).off('click', '.btn-register').on('click', '.btn-register', function(e) {
    if ($(this).attr('id') === 'btnActualizar') {
      handleUpdateCita(e);
    } else {
      handleCitaSubmit(e);
    }
  });
  
  // Botón actualizar específico
  $(document).off('click', '#btnActualizar').on('click', '#btnActualizar', handleUpdateCita);
  
  // Botón cancelar en actualización
  $(document).off('click', '#btnCancelar').on('click', '#btnCancelar', function() {
    if (confirm('¿Está seguro de que desea cancelar? Los cambios se perderán.')) {
      window.location.href = 'HistorialCitas.php';
    }
  });
  
  // Cambios en selects para verificar disponibilidad
  $(document).off('change', '#servicio, #especialidad, #hora, #fecha').on('change', '#servicio, #especialidad, #hora, #fecha', function() {
    setTimeout(checkAvailability, 100);
  });
  
  // Búsqueda en tabla
  $(document).off('keyup', 'input[placeholder*="Buscar"]').on('keyup', 'input[placeholder*="Buscar"]', function() {
    searchInTable($(this).val());
  });
  
  // Configurar fecha mínima
  setupDateRestrictions();
}

// Configurar restricciones de fecha
function setupDateRestrictions() {
  const today = new Date().toISOString().split('T')[0];
  $('#fecha, .date-input').each(function() {
    if ($(this).attr('type') !== 'text') {
      $(this).attr('min', today);
    }
  });
}

// Inicializar el calendario simple existente
function initializeCalendar() {
  if (typeof window.seleccionarFecha === 'undefined') {
    window.seleccionarFecha = function(dia) {
      const fechaClick = new Date(window.añoActual || new Date().getFullYear(), 
                                  window.mesActual || new Date().getMonth(), dia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaClick < hoy) {
        alert('No puedes seleccionar una fecha pasada');
        return;
      }

      const mes = String((window.mesActual || new Date().getMonth()) + 1).padStart(2, '0');
      const diaSeleccionado = String(dia).padStart(2, '0');
      const inputFecha = document.getElementById('fecha');
      if (inputFecha) {
        inputFecha.value = `${window.añoActual || new Date().getFullYear()}-${mes}-${diaSeleccionado}`;
        $(inputFecha).trigger('change');
      }
    };
  }
}

// Cargar datos iniciales del formulario
function loadFormData() {
  console.log('Cargando datos del formulario...');
  loadSpecialties();
  loadServices();
}

// Cargar especialidades
function loadSpecialties() {
  const url = determineRouterUrl('getSpecialties');
  console.log('Cargando especialidades desde:', url);
  
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta especialidades:', response);
      if (response.status === 'success') {
        const select = $('#especialidad');
        populateSelect(select, response.data, 'id_especialidad', 'nombre');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al cargar especialidades:', error, xhr.responseText);
    }
  });
}

// Cargar servicios
function loadServices() {
  const url = determineRouterUrl('getServices');
  console.log('Cargando servicios desde:', url);
  
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta servicios:', response);
      if (response.status === 'success') {
        const select = $('#servicio');
        populateSelect(select, response.data, 'id_servicio', 'nombre');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al cargar servicios:', error, xhr.responseText);
    }
  });
}

// Determinar la URL del router según la ubicación actual
function determineRouterUrl(action) {
  const currentPath = window.location.pathname;
  let basePath = '';
  
  if (currentPath.includes('/Paciente/') || currentPath.includes('/paciente/')) {
    basePath = '../router.php';
  } else {
    basePath = 'router.php';
  }
  
  return `${basePath}?action=${action}`;
}

// Llenar un select con opciones
function populateSelect(select, data, valueField, textField) {
  if (!select || select.length === 0) {
    console.warn('Select no encontrado para poblar');
    return;
  }
  
  const currentValue = select.val();
  select.empty().append('<option value="">Seleccionar...</option>');
  
  if (data && Array.isArray(data)) {
    data.forEach(item => {
      select.append(`<option value="${item[valueField]}">${item[textField]}</option>`);
    });
  }
  
  if (currentValue) {
    select.val(currentValue);
  }
}

// Verificar disponibilidad de cita
function checkAvailability() {
  const especialidad = $('#especialidad').val();
  const fecha = $('#fecha').val();
  const hora = $('#hora').val();
  
  if (!especialidad || !fecha || !hora) {
    return;
  }
  
  const url = determineRouterUrl('getAvailableDoctors');
  
  $.ajax({
    url: url,
    method: 'GET',
    data: {
      id_especialidad: especialidad,
      fecha: fecha,
      hora: hora
    },
    dataType: 'json',
    success: function(response) {
      if (response.status === 'success') {
        if (response.data && response.data.length > 0) {
          console.log('Médicos disponibles:', response.data.length);
        } else {
          alert('No hay médicos disponibles en este horario. Por favor selecciona otro.');
        }
      }
    },
    error: function(xhr, status, error) {
      console.warn('No se pudo verificar la disponibilidad:', error);
    }
  });
}

// Manejar envío del formulario de REGISTRO
function handleCitaSubmit(e) {
  e.preventDefault();
  console.log('Registrando nueva cita...');
  
  const formData = {
    id_servicio: parseInt($('#servicio').val()),
    id_especialidad: parseInt($('#especialidad').val()),
    hora: $('#hora').val(),
    fecha: $('#fecha').val(),
    id_estado: 3 // CAMBIO: De 1 a 3 (Pendiente)
  };
  
  console.log('Datos del formulario:', formData);
  
  if (!formData.id_servicio || !formData.id_especialidad || !formData.hora || !formData.fecha) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  const url = determineRouterUrl('createCitaPatient');
  console.log('Enviando a:', url);
  
  $.ajax({
    url: url,
    method: 'POST',
    data: formData,
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta del servidor:', response);
      if (response.status === 'success') {
        alert('Cita registrada exitosamente');
        
        // Limpiar formulario
        $('#servicio, #especialidad, #hora').val('');
        $('#fecha').val('');
        
        // Redireccionar al historial
        setTimeout(() => {
          window.location.href = 'HistorialCitas.php';
        }, 1000);
      } else {
        alert(response.message || 'Error al registrar la cita');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error AJAX:', error, xhr.responseText);
      alert('Error de conexión con el servidor. Revisa la consola para más detalles.');
    }
  });
}

// Manejar envío del formulario de ACTUALIZACIÓN
function handleUpdateCita(e) {
  e.preventDefault();
  console.log('Actualizando cita...');
  
  if (!editingCitaId) {
    alert('Error: No se encontró el ID de la cita a actualizar');
    return;
  }
  
  const formData = {
    id_cita: editingCitaId,
    id_servicio: parseInt($('#servicio').val()),
    id_especialidad: parseInt($('#especialidad').val()),
    hora: $('#hora').val(),
    fecha: $('#fecha').val(),
    id_estado: 3 // CAMBIO: De 1 a 3 (Pendiente)
  };
  
  console.log('Datos de actualización:', formData);
  
  if (!formData.id_servicio || !formData.id_especialidad || !formData.hora || !formData.fecha) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  const url = determineRouterUrl('updateCita');
  console.log('Enviando actualización a:', url);
  
  $.ajax({
    url: url,
    method: 'POST',
    data: formData,
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta del servidor:', response);
      if (response.status === 'success') {
        alert('Cita actualizada exitosamente');
        
        // Redireccionar al historial
        setTimeout(() => {
          window.location.href = 'HistorialCitas.php';
        }, 1000);
      } else {
        alert(response.message || 'Error al actualizar la cita');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error AJAX:', error, xhr.responseText);
      alert('Error de conexión con el servidor. Revisa la consola para más detalles.');
    }
  });
}

// Cargar cita para edición (solo en ActualizarCita.html)
function loadCitaForEditing() {
  const urlParams = new URLSearchParams(window.location.search);
  const citaId = urlParams.get('id');
  
  if (!citaId) {
    alert('Error: No se especificó qué cita editar');
    window.location.href = 'HistorialCitas.php';
    return;
  }
  
  editingCitaId = citaId;
  showLoadingOverlay();
  
  const url = determineRouterUrl('showCita');
  
  $.ajax({
    url: url,
    method: 'GET',
    data: { id: citaId },
    dataType: 'json',
    success: function(response) {
      hideLoadingOverlay();
      if (response.status === 'success') {
        // Esperar un poco para que los selects se carguen
        setTimeout(() => {
          fillFormWithCitaData(response.data);
        }, 1000);
      } else {
        alert('Error al cargar los datos de la cita');
        window.location.href = 'HistorialCitas.php';
      }
    },
    error: function(xhr, status, error) {
      hideLoadingOverlay();
      console.error('Error al cargar cita:', error);
      alert('Error de conexión al cargar la cita');
      window.location.href = 'HistorialCitas.php';
    }
  });
}

// Llenar formulario con datos de la cita
function fillFormWithCitaData(cita) {
  console.log('Llenando formulario con:', cita);
  
  $('#servicio').val(cita.id_servicio);
  $('#especialidad').val(cita.id_especialidad);
  $('#hora').val(cita.hora);
  $('#fecha').val(cita.fecha);
  
  // Trigger change events para validaciones
  $('#servicio, #especialidad, #hora, #fecha').trigger('change');
}

// Mostrar/ocultar overlay de carga
function showLoadingOverlay() {
  $('#loadingOverlay').show();
}

function hideLoadingOverlay() {
  $('#loadingOverlay').hide();
}

// Cargar citas del paciente
function loadPatientAppointments() {
  console.log('Cargando citas del paciente...');
  const url = determineRouterUrl('listMyCitas');
  
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    success: function(response) {
      console.log('Citas cargadas:', response);
      if (response.status === 'success') {
        populateAppointmentsTable(response.data);
      } else {
        $('#citasTable tbody').html('<tr><td colspan="7" class="text-center">No se pudieron cargar las citas</td></tr>');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al cargar citas:', error, xhr.responseText);
      $('#citasTable tbody').html('<tr><td colspan="7" class="text-center">Error al cargar las citas</td></tr>');
    }
  });
}

// Llenar tabla de citas
function populateAppointmentsTable(citas) {
  const tbody = $('#citasTable tbody');
  
  if (!citas || citas.length === 0) {
    tbody.html('<tr><td colspan="7" class="text-center">No tienes citas registradas</td></tr>');
    return;
  }
  
  let rows = '';
  citas.forEach(cita => {
    const canEdit = canEditAppointment(cita.fecha, cita.id_estado);
    const canCancel = canCancelAppointment(cita.id_estado);
    
    let actionsHtml = '';
    
    if (canEdit) {
      actionsHtml += `
        <button class="btn btn-sm me-1" style="background-color: #44C1F2; border-color: #44C1F2; color: white;" onclick="editAppointment(${cita.id_cita})" title="Editar Cita">
          <i class="fas fa-edit"></i>
        </button>
      `;
    }
    
    if (canCancel) {
      actionsHtml += `
        <button class="btn btn-sm" style="background-color: #dc3545; border-color: #dc3545; color: white;" onclick="cancelAppointment(${cita.id_cita})" title="Cancelar Cita">
          <i class="fas fa-times"></i>
        </button>
      `;
    }
    
    rows += `
      <tr data-cita-id="${cita.id_cita}">
        <td>${formatDate(cita.fecha)}</td>
        <td>${formatTime(cita.hora)}</td>
        <td>${cita.nombre_servicio || 'N/A'}</td>
        <td>${cita.nombre_especialidad || 'N/A'}</td>
        <td>${cita.nombre_medico || 'N/A'}</td>
        <td><span class="badge ${getStatusBadgeClass(cita.id_estado)}">${cita.nombre_estado}</span></td>
        <td>${actionsHtml}</td>
      </tr>`;
  });
  
  tbody.html(rows);
}

// Verificar si se puede editar una cita
function canEditAppointment(fechaCita, estadoId) {
  const citaDate = new Date(fechaCita);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Permitir editar solo citas con estado "Pendiente" (3)
  return estadoId == 3;
}

function canCancelAppointment(estadoId) {
  return estadoId == 1 || estadoId == 3;
}

// Editar cita - ACTUALIZADO para redirigir a ActualizarCita.html
function editAppointment(citaId) {
  console.log('Redirigiendo a editar cita:', citaId);
  window.location.href = `ActualizarCita.html?id=${citaId}`;
}

// Cancelar cita
function cancelAppointment(citaId) {
  if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
    return;
  }
  
  const url = determineRouterUrl('updateCitaStatus');
  
  $.ajax({
    url: url,
    method: 'POST',
    data: {
      id_cita: citaId,
      id_estado: 4
    },
    dataType: 'json',
    success: function(response) {
      if (response.status === 'success') {
        alert('Cita cancelada exitosamente');
        loadPatientAppointments();
      } else {
        alert(response.message || 'Error al cancelar la cita');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al cancelar cita:', error);
      alert('Error de conexión al cancelar la cita');
    }
  });
}

// Buscar en la tabla
function searchInTable(searchTerm) {
  const rows = $('#citasTable tbody tr');
  
  if (!searchTerm) {
    rows.show();
    return;
  }
  
  rows.each(function() {
    const text = $(this).text().toLowerCase();
    if (text.includes(searchTerm.toLowerCase())) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
}

// Formatear fecha para mostrar
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Formatear hora para mostrar
function formatTime(timeString) {
  if (!timeString) return 'N/A';
  
  const time = timeString.substring(0, 5);
  const [hour, minute] = time.split(':');
  const hourInt = parseInt(hour);
  
  const ampm = hourInt >= 12 ? 'PM' : 'AM';
  const hour12 = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
  
  return `${hour12}:${minute} ${ampm}`;
}

// Obtener clase CSS para el badge del estado
function getStatusBadgeClass(estadoId) {
  switch (parseInt(estadoId)) {
    case 1: return 'bg-success';       // Activa/Confirmada
    case 2: return 'bg-info';          // Completada  
    case 3: return 'bg-warning';       // Pendiente
    case 4: return 'bg-danger';        // Cancelada
    case 5: return 'bg-secondary';     // Reprogramada
    default: return 'bg-light text-dark';
  }
}

// Funciones globales para uso en HTML
window.editAppointment = editAppointment;
window.cancelAppointment = cancelAppointment;