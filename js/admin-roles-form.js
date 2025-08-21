// admin-roles-form.js
(function(){
  function qs(s,root=document){ return root.querySelector(s); }
  function getId(){ const u=new URL(location.href); return parseInt(u.searchParams.get('id')||'0'); }
  function estadoToInt(v){ v=(v||'').toString().toLowerCase(); return v==='inactivo'?2:1; }
  function fillForm(rol){
    if(!rol) return;
    qs('#nombre').value = rol.nombre||'';
    qs('#descripcion').value = rol.descripcion||'';
    qs('#estado').value = (rol.id_estado==2?'inactivo':'activo');
  }
  async function load(){
    const id=getId();
    if(id>0){
      const r = await fetch(`../router.php?action=getRol&id=${id}`);
      const j = await r.json();
      if(j.status==='success') fillForm(j.data);
    }
  }
  async function onSubmit(ev){
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id=getId();
    const payload = new FormData();
    payload.append('nombre', fd.get('nombre')||'');
    payload.append('descripcion', fd.get('descripcion')||'');
    payload.append('id_estado', estadoToInt(fd.get('estado')||'activo'));
    let action = 'createRol';
    if(id>0){ action='updateRol'; payload.append('id_rol', id); }
    const resp = await fetch(`../router.php?action=${action}`, { method:'POST', body:payload });
    const res = await resp.json();
    if(res.status==='success'){ alert('Guardado correctamente'); location.href='Roles.php'; }
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