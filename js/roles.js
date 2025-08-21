// Variables globales
let editingRolId = null;

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
  console.log('Inicializando página de roles...');
  const currentPage = window.location.pathname;
  const fileName = currentPage.split('/').pop();
  
  // Si es página de registro
  if (fileName === 'RegistrarRol.html') {
    console.log('Detectado formulario de registro de rol');
    loadFormData();
  }
  
  // Si es página de actualización
  else if (fileName === 'EditarRol.html') {
    console.log('Detectado formulario de actualización de rol');
    loadFormData();
    loadRolForEditing();
  }
  
  // Si hay tabla de roles (Roles.php)
  else if (fileName === 'Roles.php' || document.querySelector('.custom-table') || document.getElementById('rolesTable')) {
    console.log('Detectada tabla de roles');
    loadRoles();
  }
}

// Configurar event listeners
function setupEventListeners() {
  if (typeof $ === 'undefined') {
    console.error('jQuery no disponible para event listeners');
    return;
  }

  console.log('Configurando event listeners...');

  // Envío del formulario
  $(document).off('submit', '#form-registro').on('submit', '#form-registro', function(e) {
    e.preventDefault();
    if (editingRolId) {
      handleRolUpdate(e);
    } else {
      handleRolSubmit(e);
    }
  });
  
  // Búsqueda en tabla
  $(document).off('keyup', 'input[placeholder*="Buscar"]').on('keyup', 'input[placeholder*="Buscar"]', function() {
    searchInTable($(this).val());
  });
}

// Cargar datos iniciales del formulario
function loadFormData() {
  console.log('Cargando datos del formulario...');
  loadStates();
}

// Cargar estados
function loadStates() {
  const url = determineRouterUrl('getStatesRol');
  console.log('Cargando estados desde:', url);
  
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta estados:', response);
      if (response.status === 'success') {
        const select = $('#estado');
        populateSelect(select, response.data, 'id_estado', 'nombre');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al cargar estados:', error, xhr.responseText);
    }
  });
}

// Determinar la URL del router según la ubicación actual
function determineRouterUrl(action) {
  const currentPath = window.location.pathname;
  let basePath = '';
  
  if (currentPath.includes('/Administrativo/') || currentPath.includes('/administrativo/')) {
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
  select.empty().append('<option value="">-- Selecciona --</option>');
  
  if (data && Array.isArray(data)) {
    data.forEach(item => {
      select.append(`<option value="${item[valueField]}">${item[textField]}</option>`);
    });
  }
  
  if (currentValue) {
    select.val(currentValue);
  }
}

// Manejar envío del formulario de REGISTRO
function handleRolSubmit(e) {
  e.preventDefault();
  console.log('Registrando nuevo rol...');
  
  const formData = {
    nombre: $('#nombre').val().trim(),
    descripcion: $('#descripcion').val().trim(),
    id_estado: parseInt($('#estado').val())
  };
  
  console.log('Datos del formulario:', formData);
  
  if (!formData.nombre || !formData.descripcion || !formData.id_estado) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  const url = determineRouterUrl('createRol');
  console.log('Enviando a:', url);
  
  $.ajax({
    url: url,
    method: 'POST',
    data: formData,
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta del servidor:', response);
      if (response.status === 'success') {
        alert('Rol registrado exitosamente');
        
        // Limpiar formulario
        $('#nombre, #descripcion').val('');
        $('#estado').val('');
        
        // Redireccionar a la lista
        setTimeout(() => {
          window.location.href = 'Roles.php';
        }, 1000);
      } else {
        alert(response.message || 'Error al registrar el rol');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error AJAX:', error, xhr.responseText);
      alert('Error de conexión con el servidor. Revisa la consola para más detalles.');
    }
  });
}

// Manejar envío del formulario de ACTUALIZACIÓN
function handleRolUpdate(e) {
  e.preventDefault();
  console.log('Actualizando rol...');
  
  if (!editingRolId) {
    alert('Error: No se encontró el ID del rol a actualizar');
    return;
  }
  
  const formData = {
    id_rol: editingRolId,
    nombre: $('#nombre').val().trim(),
    descripcion: $('#descripcion').val().trim(),
    id_estado: parseInt($('#estado').val())
  };
  
  console.log('Datos de actualización:', formData);
  
  if (!formData.nombre || !formData.descripcion || !formData.id_estado) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  const url = determineRouterUrl('updateRol');
  console.log('Enviando actualización a:', url);
  
  $.ajax({
    url: url,
    method: 'POST',
    data: formData,
    dataType: 'json',
    success: function(response) {
      console.log('Respuesta del servidor:', response);
      if (response.status === 'success') {
        alert('Rol actualizado exitosamente');
        
        // Redireccionar a la lista
        setTimeout(() => {
          window.location.href = 'Roles.php';
        }, 1000);
      } else {
        alert(response.message || 'Error al actualizar el rol');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error AJAX:', error, xhr.responseText);
      alert('Error de conexión con el servidor. Revisa la consola para más detalles.');
    }
  });
}

// Cargar rol para edición (solo en EditarRol.html)
function loadRolForEditing() {
  const urlParams = new URLSearchParams(window.location.search);
  const rolId = urlParams.get('id');
  
  if (!rolId) {
    alert('Error: No se especificó qué rol editar');
    window.location.href = 'Roles.php';
    return;
  }
  
  editingRolId = rolId;
  showLoadingOverlay();
  
  const url = determineRouterUrl('showRol');
  
  $.ajax({
    url: url,
    method: 'GET',
    data: { id: rolId },
    dataType: 'json',
    success: function(response) {
      hideLoadingOverlay();
      if (response.status === 'success') {
        // Esperar un poco para que los selects se carguen
        setTimeout(() => {
          fillFormWithRolData(response.data);
        }, 1000);
      } else {
        alert('Error al cargar los datos del rol');
        window.location.href = 'Roles.php';
      }
    },
    error: function(xhr, status, error) {
      hideLoadingOverlay();
      console.error('Error al cargar rol:', error);
      alert('Error de conexión al cargar el rol');
      window.location.href = 'Roles.php';
    }
  });
}

// Llenar formulario con datos del rol
function fillFormWithRolData(rol) {
  console.log('Llenando formulario con:', rol);
  
  $('#nombre').val(rol.nombre);
  $('#descripcion').val(rol.descripcion);
  $('#estado').val(rol.id_estado);
}

// Mostrar/ocultar overlay de carga
function showLoadingOverlay() {
  if ($('#loadingOverlay').length === 0) {
    $('body').append(`
      <div id="loadingOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="d-flex justify-content-center align-items-center h-100">
          <div class="text-white text-center">
            <i class="fas fa-spinner fa-spin fa-3x mb-3"></i>
            <div>Cargando datos...</div>
          </div>
        </div>
      </div>
    `);
  }
  $('#loadingOverlay').show();
}

function hideLoadingOverlay() {
  $('#loadingOverlay').hide();
}

// Cargar roles
function loadRoles() {
  console.log('Cargando roles...');
  const url = determineRouterUrl('listRoles');
  
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    success: function(response) {
      console.log('Roles cargados:', response);
      if (response.status === 'success') {
        populateRolesTable(response.data);
      } else {
        $('.custom-table tbody').html('<tr><td colspan="4" class="text-center">No se pudieron cargar los roles</td></tr>');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al cargar roles:', error, xhr.responseText);
      $('.custom-table tbody').html('<tr><td colspan="4" class="text-center">Error al cargar los roles</td></tr>');
    }
  });
}

// Llenar tabla de roles
function populateRolesTable(roles) {
  const tbody = $('.custom-table tbody');
  
  if (!roles || roles.length === 0) {
    tbody.html('<tr><td colspan="4" class="text-center">No hay roles registrados</td></tr>');
    return;
  }
  
  let rows = '';
  roles.forEach(rol => {
    // Habilitar edición y deshabilitar/habilitar para todos los roles
    let actionsHtml = '';
    
    // Botón de editar para todos los roles
    actionsHtml += `
      <a class="btn btn-sm me-1" style="background-color: #44C1F2; border-color: #44C1F2; color: white;" href="EditarRol.html?id=${rol.id_rol}" title="Editar Rol">
        <i class="fas fa-edit"></i>
      </a>
    `;
    
    // Botón de deshabilitar/habilitar según el estado actual
    if (rol.id_estado == 1) {
      actionsHtml += `
        <button class="btn btn-sm" style="background-color: #dc3545; border-color: #dc3545; color: white;" onclick="disableRole(${rol.id_rol})" title="Deshabilitar Rol">
          <i class="fas fa-ban"></i>
        </button>
      `;
    } else if (rol.id_estado == 2) {
      actionsHtml += `
        <button class="btn btn-sm" style="background-color: #28a745; border-color: #28a745; color: white;" onclick="enableRole(${rol.id_rol})" title="Habilitar Rol">
          <i class="fas fa-check"></i>
        </button>
      `;
    }
    
    rows += `
      <tr data-rol-id="${rol.id_rol}">
        <td>${rol.nombre}</td>
        <td>${rol.descripcion}</td>
        <td><span class="badge ${getStatusBadgeClass(rol.id_estado)}">${rol.nombre_estado || 'N/A'}</span></td>
        <td>${actionsHtml}</td>
      </tr>`;
  });
  
  tbody.html(rows);
}

// Deshabilitar rol
function disableRole(rolId) {
  if (!confirm('¿Está seguro que desea deshabilitar este rol?')) {
    return;
  }
  
  const url = determineRouterUrl('updateRolStatus');
  
  $.ajax({
    url: url,
    method: 'POST',
    data: {
      id_rol: rolId,
      id_estado: 2 // Inactivo
    },
    dataType: 'json',
    success: function(response) {
      if (response.status === 'success') {
        alert('Rol deshabilitado exitosamente');
        loadRoles();
      } else {
        alert(response.message || 'Error al deshabilitar el rol');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al deshabilitar rol:', error);
      alert('Error de conexión al deshabilitar el rol');
    }
  });
}

// Habilitar rol
function enableRole(rolId) {
  if (!confirm('¿Está seguro que desea habilitar este rol?')) {
    return;
  }
  
  const url = determineRouterUrl('updateRolStatus');
  
  $.ajax({
    url: url,
    method: 'POST',
    data: {
      id_rol: rolId,
      id_estado: 1 // Activo
    },
    dataType: 'json',
    success: function(response) {
      if (response.status === 'success') {
        alert('Rol habilitado exitosamente');
        loadRoles();
      } else {
        alert(response.message || 'Error al habilitar el rol');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error al habilitar rol:', error);
      alert('Error de conexión al habilitar el rol');
    }
  });
}

// Buscar en la tabla
function searchInTable(searchTerm) {
  const rows = $('.custom-table tbody tr');
  
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

// Obtener clase CSS para el badge del estado
function getStatusBadgeClass(estadoId) {
  switch (parseInt(estadoId)) {
    case 1: return 'bg-success';       // Activo
    case 2: return 'bg-danger';        // Inactivo
    default: return 'bg-light text-dark';
  }
}

// Funciones globales para uso en HTML
window.disableRole = disableRole;
window.enableRole = enableRole;