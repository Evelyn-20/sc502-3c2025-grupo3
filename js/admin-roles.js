// admin-roles.js
(async function(){
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function estadoBadge(id_estado){
    return id_estado == 1 ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>';
  }
  function accionBtn(rol){
    const activar = rol.id_estado != 1;
    const txt = activar ? 'Habilitar' : 'Deshabilitar';
    const cls = activar ? 'btn-success' : 'btn-danger';
    const action = activar ? 'enable' : 'disable';
    return `<button class="btn btn-sm ${cls}" data-action="${action}" data-id="${rol.id_rol}">${txt}</button>`;
  }
  function renderTabla(roles){
    const tbody = qs('.custom-table tbody') || qs('table tbody');
    if(!tbody) return;
    tbody.innerHTML = roles.map(r => `
      <tr>
        <td>${r.id_rol}</td>
        <td>${r.nombre}</td>
        <td>${r.descripcion||''}</td>
        <td>${estadoBadge(r.id_estado)}</td>
        <td>
          <a class="btn btn-sm btn-primary me-2" href="EditarRol.html?id=${r.id_rol}">Editar</a>
          ${accionBtn(r)}
        </td>
      </tr>
    `).join('');
  }
  async function cargar(){
    try{
      const res = await fetch('../router.php?action=listRoles');
      const json = await res.json();
      if(json.status==='success'){
        renderTabla(json.data||[]);
      }
    }catch(e){ console.error(e); }
  }
  async function toggle(id, activar){
    const fd = new FormData();
    fd.append('id_rol', id);
    const action = activar ? 'enableRol' : 'disableRol';
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