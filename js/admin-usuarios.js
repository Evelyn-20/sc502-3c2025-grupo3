// admin-usuarios.js
(async function(){
  function qs(sel, root=document){ return root.querySelector(sel); }
  function estadoBadge(id_estado){
    return id_estado == 1 ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>';
  }
  function rolNombre(id_rol){
    if(id_rol == 1) return 'Administrador';
    if(id_rol == 2) return 'Medico';
    return 'Paciente';
  }
  function accionBtn(u){
    const activar = u.id_estado != 1;
    const txt = activar ? 'Habilitar' : 'Deshabilitar';
    const cls = activar ? 'btn-success' : 'btn-danger';
    const action = activar ? 'enable' : 'disable';
    return `<button class="btn btn-sm ${cls}" data-action="${action}" data-id="${u.id_usuario}">${txt}</button>`;
  }
  function renderTabla(usuarios){
    const tbody = qs('.custom-table tbody') || qs('table tbody');
    if(!tbody) return;
    tbody.innerHTML = usuarios.map(u => `
      <tr>
        <td>${u.cedula_usuario||''}</td>
        <td>${u.nombre||''}</td>
        <td>${u.apellidos||''}</td>
        <td>${u.telefono||''}</td>
        <td>${u.correo||''}</td>
        <td>${rolNombre(u.id_rol)}</td>
        <td>${estadoBadge(u.id_estado)}</td>
        <td>
          <a class="btn btn-sm btn-primary me-2" href="EditarUsuario.html?id=${u.id_usuario}">Editar</a>
          ${accionBtn(u)}
        </td>
      </tr>
    `).join('');
  }
  async function cargar(){
    try{
      const res = await fetch('../router.php?action=listUsuarios');
      const json = await res.json();
      if(json.status==='success'){
        renderTabla(json.data||[]);
      }
    }catch(e){ console.error(e); }
  }
  async function toggle(id, activar){
    const fd = new FormData();
    fd.append('id_usuario', id);
    const action = activar ? 'enableUsuario' : 'disableUsuario';
    const res = await fetch('../router.php?action='+action, {method:'POST', body:fd});
    const json = await res.json();
    if(json.status==='success'){ await cargar(); }
    else{ alert(json.message||'No se pudo completar la acción'); }
  }
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('button[data-action]');
    if(!btn) return;
    const id = parseInt(btn.getAttribute('data-id'));
    const action = btn.getAttribute('data-action');
    toggle(id, action==='enable');
  });
  window.addEventListener('DOMContentLoaded', cargar);
})();