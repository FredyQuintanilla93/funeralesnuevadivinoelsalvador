/* ─── FUNERARIA NUEVA DIVINO EL SALVADOR — main.js ─── */

const WA_NUMBER = '50300000000'; // ← Reemplazar con número real

function buildWALink(mensaje) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

/* ─── FORMULARIO DE CONTACTO ─── */
function enviarFormulario() {
  const nombre      = document.getElementById('nombre').value.trim();
  const telefono    = document.getElementById('telefono').value.trim();
  const email       = document.getElementById('email').value.trim();
  const pais        = document.getElementById('pais').options[document.getElementById('pais').selectedIndex].text;
  const departamento = document.getElementById('departamento').options[document.getElementById('departamento').selectedIndex].text;
  const distrito    = document.getElementById('distrito').value.trim();
  const mensaje     = document.getElementById('mensaje').value.trim();

  if (!nombre || !telefono) {
    alert('Por favor complete al menos su nombre y teléfono.');
    return;
  }

  const texto =
    `Hola, me contacto desde el sitio web de Nueva Divino el Salvador.\n\n` +
    `Nombre: ${nombre}\n` +
    `Teléfono: ${telefono}\n` +
    (email       ? `Correo: ${email}\n`           : '') +
    (pais        ? `País: ${pais}\n`               : '') +
    (departamento !== 'Seleccionar...' ? `Departamento: ${departamento}\n` : '') +
    (distrito    ? `Distrito/Ciudad: ${distrito}\n` : '') +
    (mensaje     ? `\nConsulta: ${mensaje}`         : '');

  window.open(buildWALink(texto), '_blank');
}

/* ─── NAV SHRINK ON SCROLL ─── */
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.height = '60px';
      nav.style.borderBottomColor = 'rgba(184,150,110,0.3)';
    } else {
      nav.style.height = '72px';
      nav.style.borderBottomColor = 'rgba(184,150,110,0.2)';
    }
  }, { passive: true });
}

/* ─── SMOOTH SCROLL FOR NAV LINKS ─── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ─── MODAL PLANES DE PREVISIÓN ─── */
function abrirModalPrevision() {
  document.getElementById('modalPrevision').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('modalPrevision').classList.remove('active');
  document.body.style.overflow = '';
}

// Cerrar con click fuera del modal o con Escape
function initModal() {
  const overlay = document.getElementById('modalPrevision');
  if (!overlay) return;

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) cerrarModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarModal();
  });

  // Configurar el campo de fecha: solo lunes a viernes, desde mañana
  const fechaInput = document.getElementById('prev-fecha');
  if (fechaInput) {
    // Fecha mínima: mañana
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    fechaInput.min = manana.toISOString().split('T')[0];

    // Validar que no sea sábado (6) ni domingo (0)
    fechaInput.addEventListener('change', function() {
      const selected = new Date(this.value + 'T12:00:00');
      const day = selected.getDay();
      if (day === 0 || day === 6) {
        alert('Las visitas solo se realizan de lunes a viernes. Por favor seleccione otro día.');
        this.value = '';
      }
    });
  }
}

/* ─── GEOLOCALIZACIÓN GPS ─── */
function obtenerUbicacion() {
  const btn = document.getElementById('btnGPS');
  const status = document.getElementById('gpsStatus');
  const latInput = document.getElementById('prev-lat');
  const lngInput = document.getElementById('prev-lng');

  if (!navigator.geolocation) {
    status.textContent = 'Su navegador no soporta geolocalización.';
    status.className = 'gps-status error';
    return;
  }

  btn.classList.add('loading');
  btn.textContent = 'Obteniendo ubicación...';
  status.textContent = '';
  status.className = 'gps-status';

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      latInput.value = lat;
      lngInput.value = lng;

      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"/></svg>' +
        ' Ubicación capturada';

      status.textContent = 'Lat: ' + lat.toFixed(5) + ', Lng: ' + lng.toFixed(5);
      status.className = 'gps-status success';
    },
    function(err) {
      btn.classList.remove('loading');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        ' Compartir mi ubicación';

      if (err.code === 1) {
        status.textContent = 'Permiso denegado. Active la ubicación en su navegador.';
      } else {
        status.textContent = 'No se pudo obtener la ubicación. Intente de nuevo.';
      }
      status.className = 'gps-status error';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* ─── ENVIAR FORMULARIO DE VISITA POR WHATSAPP ─── */
function enviarVisitaWA() {
  const nombre    = document.getElementById('prev-nombre').value.trim();
  const telefono  = document.getElementById('prev-telefono').value.trim();
  const direccion = document.getElementById('prev-direccion').value.trim();
  const fechaVal  = document.getElementById('prev-fecha').value;
  const horarioEl = document.getElementById('prev-horario');
  const horario   = horarioEl.value ? horarioEl.options[horarioEl.selectedIndex].text : '';
  const lat       = document.getElementById('prev-lat').value;
  const lng       = document.getElementById('prev-lng').value;

  if (!nombre || !telefono) {
    alert('Por favor complete al menos su nombre y teléfono.');
    return;
  }

  if (!fechaVal || !horarioEl.value) {
    alert('Por favor seleccione una fecha y horario para la visita.');
    return;
  }

  // Formatear fecha legible
  const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fechaObj = new Date(fechaVal + 'T12:00:00');
  const fechaTexto = diasSemana[fechaObj.getDay()] + ' ' + fechaObj.getDate() + ' de ' + meses[fechaObj.getMonth()] + ' de ' + fechaObj.getFullYear();

  let texto =
    'Hola, me contacto desde el sitio web de Nueva Divino el Salvador.\n' +
    'Estoy interesado en un Plan de Previsión y deseo agendar una visita.\n\n' +
    'Nombre: ' + nombre + '\n' +
    'Teléfono: ' + telefono + '\n' +
    'Fecha: ' + fechaTexto + '\n' +
    'Horario: ' + horario + '\n';

  if (direccion) texto += 'Dirección: ' + direccion + '\n';
  if (lat && lng) {
    texto += '\nUbicación GPS:\nhttps://www.google.com/maps?q=' + lat + ',' + lng;
  }

  window.open(buildWALink(texto), '_blank');
}

/* ─── ENVIAR FORMULARIO DE VISITA (botón principal) ─── */
function enviarVisitaPrevision() {
  // Por ahora redirige al mismo flujo de WhatsApp
  enviarVisitaWA();
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initSmoothScroll();
  initModal();
});
