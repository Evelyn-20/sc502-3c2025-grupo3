// admin-usuarios-form.js
(function(){
  function qs(s,root=document){ return root.querySelector(s); }
  function getId(){ const u=new URL(location.href); return parseInt(u.searchParams.get('id')||'0'); }
  function estadoToInt(v){ v=(v||'').toString().toLowerCase(); return v==='inactivo'?2:1; }
  function rolToInt(v){ v=(v||'').toString().toLowerCase(); if(v==='admin'||v==='administrador')return 1; if(v==='medico'||v==='doctor')return 2; return 3; }
  function fillForm(u){
    if(!u) return;
    qs('#cedula').value = u.cedula_usuario||'';
    qs('#nombre').value = u.nombre||'';
    qs('#apellidos').value = u.apellidos||'';
    qs('#telefono').value = u.telefono||'';
    qs('#email').value = u.correo||'';
    qs('#fecha-nacimiento').value = (u.fecha_nacimiento||'').split('T')[0] || '';
    qs('#direccion').value = u.direccion||'';
    qs('#rol').value = (u.id_rol==1?'admin':u.id_rol==2?'medico':'user');
    qs('#estado').value = (u.id_estado==2?'inactivo':'activo');
  }
  async function load(){
    const id=getId();
    if(id>0){
      const r = await fetch(`../router.php?action=getUsuario&id=${id}`);
      const j = await r.json();
      if(j.status==='success') fillForm(j.data);
    }
  }
  async function onSubmit(ev){
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id=getId();
    const payload = new FormData();
    payload.append('cedula', fd.get('cedula')||'');
    payload.append('nombre', fd.get('nombre')||'');
    payload.append('apellidos', fd.get('apellidos')||'');
    payload.append('telefono', fd.get('telefono')||'');
    // map email -> correo (el backend también lo acepta)
    payload.append('email', fd.get('email')||'');
    payload.append('fecha_nacimiento', fd.get('fecha_nacimiento')||fd.get('fecha-nacimiento')||'');
    payload.append('direccion', fd.get('direccion')||'');
    payload.append('rol', fd.get('rol')||'');
    payload.append('estado', fd.get('estado')||'');
    let action = 'createUsuario';
    if(id>0){ action='updateUsuario'; payload.append('id_usuario', id); }
    const resp = await fetch(`../router.php?action=${action}`, { method:'POST', body:payload });
    const res = await resp.json();
    if(res.status==='success'){ alert('Guardado correctamente'); location.href='Usuarios.php'; }
    else { alert(res.message||'No se pudo guardar'); }
  }
  window.addEventListener('DOMContentLoaded', ()=>{
    const form = qs('#form-registro');
    if(form){
      form.addEventListener('submit', onSubmit);
      load();
    }
  });
})();