document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cedula = document.getElementById("cedula").value.trim();
    const password = document.getElementById("password").value;

    console.log("Intentando iniciar sesión con:", { cedula, password });

    if (cedula && password) {
      alert("Bienvenido, " + cedula + "!");
    } else {
      alert("Debes completar ambos campos.");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-register");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Usuario registrado correctamente.");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const formRol = document.getElementById("form-rol");

  if (formRol) {
    formRol.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombreRol").value.trim();
      const estado = document.getElementById("estadoRol").value;
      const descripcion = document.getElementById("descripcionRol").value.trim();

      if (nombre && estado && descripcion) {
        alert("Rol registrado correctamente:\n\n" +
              `Nombre: ${nombre}\nEstado: ${estado}\nDescripción: ${descripcion}`);
      } else {
        alert("Por favor completa todos los campos.");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const formCita = document.getElementById("form-cita");

  if (formCita) {
    formCita.addEventListener("submit", (e) => {
      e.preventDefault();

      const cedula = document.getElementById("cedulaPaciente").value.trim();
      const servicio = document.getElementById("servicio").value;
      const fecha = document.getElementById("fecha").value;
      const telefono = document.getElementById("telefono").value.trim();
      const especialidad = document.getElementById("especialidad").value;
      const calendario = document.getElementById("calendario").value;
      const hora = document.getElementById("hora").value;

      if (cedula && servicio && fecha && telefono && especialidad && calendario && hora) {
        alert("Cita registrada correctamente.");
      } else {
        alert("Por favor completa todos los campos.");
      }
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const formMedicamento = document.getElementById("form-medicamento");

  if (formMedicamento) {
    formMedicamento.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const forma = document.getElementById("forma").value;
      const grupo = document.getElementById("grupo").value;
      const estado = document.getElementById("estado").value;
      const via = document.getElementById("via").value;

      if (nombre && forma && grupo && estado && via) {
        alert("Medicamento registrado correctamente.");
      } else {
        alert("Por favor completa todos los campos.");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const formVacuna = document.getElementById("form-vacuna");

  if (formVacuna) {
    formVacuna.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const esquema = document.getElementById("esquema").value;
      const estado = document.getElementById("estado").value;
      const enfermedad = document.getElementById("enfermedad").value;
      const via = document.getElementById("via").value;
      const grupos = Array.from(document.querySelectorAll('input[name="grupo"]:checked')).map(cb => cb.value);

      if (nombre && esquema && estado && enfermedad && via && grupos.length > 0) {
        alert("Vacuna registrada correctamente.");
      } else {
        alert("Por favor completa todos los campos y selecciona al menos un grupo.");
      }
    });
  }
});

