document.addEventListener('DOMContentLoaded', function() {
    cargarExpedientes();
    
    // Configurar búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filtrarExpedientes(this.value);
        });
    }
});

/**
 * Cargar lista de expedientes
 */
function cargarExpedientes() {
    fetch('../router.php?action=listExpedientes')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                mostrarExpedientes(data.data);
            } else {
                console.error('Error:', data.message);
                mostrarError('Error al cargar expedientes: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            mostrarError('Error de conexión al cargar expedientes');
        });
}

/**
 * Mostrar expedientes en la tabla
 */
function mostrarExpedientes(expedientes) {
    const tbody = document.querySelector('.custom-table tbody');
    if (!tbody) return;
    
    if (expedientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">No hay expedientes disponibles</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = expedientes.map(exp => `
        <tr data-cedula="${exp.cedula_usuario}" data-nombre="${exp.nombre_completo.toLowerCase()}">
            <td>${exp.cedula_usuario}</td>
            <td>${exp.nombre_completo}</td>
            <td>
                <button type="button" class="btn-action btn-ver me-2" 
                        onclick="verExpediente(${exp.id_usuario})" 
                        title="Ver Expediente">
                    <i class="fas fa-file-medical"></i>
                </button>
                <button type="button" class="btn-action btn-editar" 
                        onclick="editarExpediente(${exp.id_usuario})" 
                        title="Editar Expediente">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtrar expedientes por búsqueda
 */
function filtrarExpedientes(termino) {
    const rows = document.querySelectorAll('.custom-table tbody tr');
    const terminoLower = termino.toLowerCase();
    
    rows.forEach(row => {
        const cedula = row.dataset.cedula || '';
        const nombre = row.dataset.nombre || '';
        
        const coincide = cedula.includes(terminoLower) || nombre.includes(terminoLower);
        row.style.display = coincide ? '' : 'none';
    });
}

/**
 * Ver expediente de un paciente
 */
function verExpediente(idUsuario) {
    window.location.href = `Expediente.html?id_usuario=${idUsuario}`;
}

/**
 * Editar expediente de un paciente
 */
function editarExpediente(idUsuario) {
    window.location.href = `ActualizarExpediente.html?id_usuario=${idUsuario}`;
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}