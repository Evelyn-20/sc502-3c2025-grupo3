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

  window.cambiarMes = function(direccion) {
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

  window.seleccionarFecha = function(dia) {
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