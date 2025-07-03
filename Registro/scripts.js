document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-registro');
  form.addEventListener('submit', onSubmitRegistro);
});

function onSubmitRegistro(event) {
  event.preventDefault();
  
  document.querySelectorAll('.error-message').forEach(el => el.remove());

  const pwd       = document.getElementById('password').value.trim();
  const pwdVerify = document.getElementById('confirm-password').value.trim();


  if (!pwd || !pwdVerify) {
    if (!pwd) showError('password', 'Este campo es obligatorio');
    if (!pwdVerify) showError('confirm-password', 'Este campo es obligatorio');
    return;
  }
  if (pwd !== pwdVerify) {
    showError('confirm-password', 'Las contraseñas no coinciden');
    return;
  }

  const datos = new FormData(event.target);
  const registro = Object.fromEntries(datos.entries());
  console.log('Datos de registro:', registro);

  alert('¡Registro exitoso!');


  event.target.reset();
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const err = document.createElement('div');
  err.className = 'error-message';
  err.textContent = message;
  field.parentElement.appendChild(err);
}
