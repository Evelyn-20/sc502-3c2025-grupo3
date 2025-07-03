/*

  Script para el Administrador

*/

document.addEventListener("DOMContentLoaded", function () {
  const form      = document.getElementById("form-registro");
  const titleElem = document.querySelector(".register-container h2");
  if (!form || !titleElem) return;

  // 1 Detecta la página según IDs únicos
  const has = id => !!document.getElementById(id);
  let pageType;
  if      (has("cedula-paciente"))    pageType = "cita";
  else if (has("descripcion"))        pageType = "rol";
  else if (has("forma-farmaceutica")) pageType = "medicamento";
  else if (has("esquema"))            pageType = "vacuna";
  else                                pageType = "usuario";

  // 2 Listeners eléctricos por página
  if (pageType === "usuario") {
    // valida email al blur
    const email = document.getElementById("email");
    email.addEventListener("blur", () => {
      clearError(email);
      if (email.value.trim() && !email.value.includes("@")) {
        showError(email, "Correo inválido");
      }
    });
  } else if (pageType === "cita") {
    // valida cédula paciente
    const ced = document.getElementById("cedula-paciente");
    ced.addEventListener("blur", () => {
      clearError(ced);
      if (!ced.value.trim() || isNaN(ced.value.trim())) {
        showError(ced, "Cédula inválida");
      }
    });
  }

  // 3 Submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    document.querySelectorAll(".error-message").forEach(el => el.remove());
    let valid = true;

    // 5 Validaciones según página
    switch (pageType) {
      case "usuario":
        ["cedula","email","direccion","nombre","telefono",
         "genero","apellidos","fecha-nacimiento","rol","estado"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (!el.value.trim()) {
            showError(el, "Campo obligatorio");
            valid = false;
          }
        });
        break;

      case "cita":
        ["cedula-paciente","nombre-paciente",
         "servicio","especialidad","hora","fecha"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (!el.value.trim()) {
            showError(el, "Campo obligatorio");
            valid = false;
          }
        });
        const fechaVal = document.getElementById("fecha").value;
        if (fechaVal) {
          const sel = new Date(fechaVal),
                hoy = new Date();
          hoy.setHours(0,0,0,0);
          if (sel < hoy) {
            showError(document.getElementById("fecha"), "Fecha inválida");
            valid = false;
          }
        }
        break;

      case "rol":
        ["nombre","estado","descripcion"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (!el.value.trim()) {
            showError(el, "Campo obligatorio");
            valid = false;
          }
        });
        break;

      case "medicamento":
        ["nombre","forma-farmaceutica","grupo-terapeutico",
         "estado","via-administracion"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (!el.value.trim()) {
            showError(el, "Campo obligatorio");
            valid = false;
          }
        });
        break;

      case "vacuna":
        ["nombre","esquema","estado","enfermedad","via-administracion"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (!el.value.trim()) {
            showError(el, "Campo obligatorio");
            valid = false;
          }
        });
        const checks = Array.from(document.querySelectorAll("input[name='grupo']"));
        if (!checks.some(c => c.checked)) {
          const container = document.querySelector(".checkbox-group");
          showError(container, "Selecciona al menos un grupo");
          valid = false;
        }
        break;
    }

    if (!valid) return;

    const datos = Object.fromEntries(new FormData(form).entries());
    console.log(`Registrando ${pageType}:`, datos);
    alert(`¡${titleElem.innerText} exitoso!`);
    form.reset();
  });

// Funciones auxiliares 
  function showError(el, msg) {
    const wrapper = el.tagName === "DIV" ? el : el.parentElement;
    const div = document.createElement("div");
    div.className = "error-message";
    div.textContent = msg;
    wrapper.appendChild(div);
  }
  function clearError(el) {
    const wrapper = el.parentElement;
    const prev = wrapper.querySelector(".error-message");
    if (prev) prev.remove();
  }
});


/*

  Script para el Registro

*/
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
