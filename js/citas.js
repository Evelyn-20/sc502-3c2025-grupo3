/*

  Script para el Calendario

*/
document.addEventListener("DOMContentLoaded", function () {
  const calendario = document.getElementById('calendario-simple');
  if (!calendario) return;

  let mesActual = new Date().getMonth();
  let añoActual = new Date().getFullYear();
  let fechaSeleccionada = null;

  crearCalendario();

  window.cambiarMes = function (direccion) {
    mesActual += direccion;

    if (mesActual > 11) {
      mesActual = 0;
      añoActual++;
    } else if (mesActual < 0) {
      mesActual = 11;
      añoActual--;
    }

    crearCalendario();
  };

  window.seleccionarFecha = function (dia) {
    const fechaClick = new Date(añoActual, mesActual, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaClick < hoy) {
      showError(calendario, 'No puedes seleccionar una fecha pasada');
      return;
    }

    fechaSeleccionada = {
      dia: dia,
      mes: mesActual,
      año: añoActual
    };

    const mes = String(mesActual + 1).padStart(2, '0');
    const diaSeleccionado = String(dia).padStart(2, '0');
    const inputFecha = document.querySelector('.date-input');
    if (inputFecha) {
      inputFecha.value = `${añoActual}-${mes}-${diaSeleccionado}`;
    }

    crearCalendario();
  };

  function crearCalendario() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    let html = `
      <div style="background: white; border: 1px solid #d0d0d0; border-radius: 15px; padding: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); min-height: 220px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <button onclick="cambiarMes(-1)" style="background: #44C1F2; color: white; border: none; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-weight: 500;">‹</button>
          <div style="font-weight: 500; font-size: 16px; color: #333;">
            ${meses[mesActual]} ${añoActual}
          </div>
          <button onclick="cambiarMes(1)" style="background: #44C1F2; color: white; border: none; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-weight: 500;">›</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center;">
          <div style="font-weight: 500; color: #666; padding: 5px;">Dom</div>
          <div style="font-weight: 500; color: #666; padding: 5px;">Lun</div>
          <div style="font-weight: 500; color: #666; padding: 5px;">Mar</div>
          <div style="font-weight: 500; color: #666; padding: 5px;">Mié</div>
          <div style="font-weight: 500; color: #666; padding: 5px;">Jue</div>
          <div style="font-weight: 500; color: #666; padding: 5px;">Vie</div>
          <div style="font-weight: 500; color: #666; padding: 5px;">Sáb</div>
    `;

    const primerDia = new Date(añoActual, mesActual, 1).getDay();
    const diasDelMes = new Date(añoActual, mesActual + 1, 0).getDate();
    const hoy = new Date();

    for (let i = 0; i < primerDia; i++) {
      html += '<div style="padding: 8px;"></div>';
    }

    for (let dia = 1; dia <= diasDelMes; dia++) {
      const esHoy = (dia === hoy.getDate() && mesActual === hoy.getMonth() && añoActual === hoy.getFullYear());
      const esPasado = new Date(añoActual, mesActual, dia) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const esSeleccionado = fechaSeleccionada &&
        fechaSeleccionada.dia === dia &&
        fechaSeleccionada.mes === mesActual &&
        fechaSeleccionada.año === añoActual;

      let estilo = 'padding: 8px; cursor: pointer; border-radius: 8px; transition: background-color 0.2s;';

      if (esPasado) {
        estilo += 'color: #d0d0d0; cursor: not-allowed;';
      } else if (esSeleccionado) {
        estilo += 'background: #4B94F2; color: white; font-weight: 500;';
      } else if (esHoy) {
        estilo += 'background: #41D2F2; color: white; font-weight: 500;';
      } else {
        estilo += 'color: #333;';
      }

      const onClick = esPasado ? '' : `onclick="seleccionarFecha(${dia})"`;
      html += `<div style="${estilo}" ${onClick}>${dia}</div>`;
    }

    html += '</div></div>';
    calendario.innerHTML = html;
  }

  function showError(el, msg) {
    clearError(el);

    const div = document.createElement("div");
    div.className = "error-message";
    div.textContent = msg;
    div.style.color = "#d9534f";
    div.style.fontSize = "14px";
    div.style.marginTop = "5px";
    div.style.fontWeight = "500";

    el.parentElement.appendChild(div);

    setTimeout(() => {
      if (div.parentElement) {
        div.remove();
      }
    }, 3000);
  }

  function clearError(el) {
    const wrapper = el.parentElement;
    const prev = wrapper.querySelector(".error-message");
    if (prev) prev.remove();
  }
});

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
  
  // Si hay formulario de cita (RegistrarCita.html)
  if (document.querySelector('.btn-register') || document.getElementById('servicio')) {
    console.log('Detectado formulario de registro');
    loadFormData();
    setupDateRestrictions();
    initializeCalendar();
  }
  
  // Si hay tabla de citas (HistorialCitas.php)
  if (document.querySelector('.custom-table') || document.getElementById('citasTable')) {
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
  $(document).off('click', '.btn-register').on('click', '.btn-register', handleCitaSubmit);
  
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
  
  // Verificar cita para editar
  setTimeout(checkForEditingCita, 1000);
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

// Cargar especialidades - CORREGIDO para usar el router
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

// Cargar servicios - CORREGIDO para usar el router
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

// NUEVA FUNCIÓN: Determinar la URL del router según la ubicación actual
function determineRouterUrl(action) {
  const currentPath = window.location.pathname;
  let basePath = '';
  
  // Si estamos en una carpeta como 'Paciente', usar router relativo
  if (currentPath.includes('/Paciente/') || currentPath.includes('/paciente/')) {
    basePath = '../router.php';
  } 
  // Si estamos en la raíz
  else {
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

// Verificar disponibilidad de cita - CORREGIDO
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

// Manejar envío del formulario
function handleCitaSubmit(e) {
  e.preventDefault();
  console.log('Enviando formulario de cita...');
  
  // Recopilar datos del formulario
  const formData = {
    id_servicio: parseInt($('#servicio').val()),
    id_especialidad: parseInt($('#especialidad').val()),
    hora: $('#hora').val(),
    fecha: $('#fecha').val(),
    id_estado: 1
  };
  
  console.log('Datos del formulario:', formData);
  
  // Validaciones
  if (!formData.id_servicio || !formData.id_especialidad || !formData.hora || !formData.fecha) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  const isEditing = editingCitaId !== null;
  if (isEditing) {
    formData.id_cita = editingCitaId;
  }
  
  const action = isEditing ? 'updateCita' : 'createCitaPatient';
  const url = determineRouterUrl(action);
  
  console.log('Enviando a:', url);
  
  $.ajax({
    url: url,
    method: 'POST',
    data: formData,
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta del servidor:', response);
      if (response.status === 'success') {
        alert(isEditing ? 'Cita actualizada exitosamente' : 'Cita registrada exitosamente');
        
        // Limpiar formulario
        $('#servicio, #especialidad, #hora').val('');
        $('#fecha').val('');
        
        if (isEditing) {
          cancelEdit();
        }
        
        // Redireccionar al historial
        setTimeout(() => {
          window.location.href = 'HistorialCitas.php';
        }, 1000);
      } else {
        alert(response.message || 'Error al procesar la cita');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error AJAX:', error, xhr.responseText);
      alert('Error de conexión con el servidor. Revisa la consola para más detalles.');
    }
  });
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
      actionsHtml += `<button class="btn btn-sm btn-primary me-1" onclick="editAppointment(${cita.id_cita})">Editar</button>`;
    }
    if (canCancel) {
      actionsHtml += `<button class="btn btn-sm btn-danger" onclick="cancelAppointment(${cita.id_cita})">Cancelar</button>`;
    }
    if (!canEdit && !canCancel) {
      actionsHtml = '<span class="text-muted">Sin acciones</span>';
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
  
  return estadoId == 1 && citaDate >= today;
}

// Verificar si se puede cancelar una cita
function canCancelAppointment(estadoId) {
  return estadoId == 1 || estadoId == 3;
}

// Editar cita
function editAppointment(citaId) {
  const url = determineRouterUrl('showCita');
  
  $.ajax({
    url: url,
    method: 'GET',
    data: { id: citaId },
    dataType: 'json',
    success: function(response) {
      if (response.status === 'success') {
        const cita = response.data;
        
        // Guardar en sessionStorage y navegar
        sessionStorage.setItem('editingCita', JSON.stringify(cita));
        window.location.href = 'RegistrarCita.html';
      } else {
        alert('Error al cargar los datos de la cita');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al cargar cita:', error);
      alert('Error de conexión al cargar la cita');
    }
  });
}

// Verificar si hay una cita para editar al cargar la página
function checkForEditingCita() {
  const editingCita = sessionStorage.getItem('editingCita');
  if (editingCita && document.querySelector('.btn-register')) {
    try {
      const cita = JSON.parse(editingCita);
      sessionStorage.removeItem('editingCita');
      fillEditForm(cita);
    } catch (e) {
      console.error('Error al parsear cita para editar:', e);
      sessionStorage.removeItem('editingCita');
    }
  }
}

// Llenar formulario para edición
function fillEditForm(cita) {
  console.log('Llenando formulario para editar:', cita);
  editingCitaId = cita.id_cita;
  
  // Esperar un poco para que los selects estén poblados
  setTimeout(() => {
    $('#servicio').val(cita.id_servicio);
    $('#especialidad').val(cita.id_especialidad);
    $('#hora').val(cita.hora);
    $('#fecha').val(cita.fecha);
    
    // Cambiar el texto del botón
    $('.btn-register').text('Actualizar Cita');
    $('h1').text('Editar Cita');
  }, 1000);
}

// Cancelar edición
function cancelEdit() {
  editingCitaId = null;
  $('.btn-register').text('Registrar Cita');
  $('h1').text('Registrar Cita');
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
    case 1: return 'bg-primary';      // Programada
    case 2: return 'bg-success';      // Completada  
    case 3: return 'bg-warning';      // En proceso
    case 4: return 'bg-danger';       // Cancelada
    case 5: return 'bg-secondary';    // Reprogramada
    default: return 'bg-light text-dark';
  }
}

// Funciones globales para uso en HTML
window.editAppointment = editAppointment;
window.cancelAppointment = cancelAppointment;