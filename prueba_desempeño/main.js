// Gestión de Eventos - SPA
// Autor: Daniel Tapias Villamil

// URL base de la API y clave de sesión
const API_URL = "http://localhost:3000";
const SESSION_KEY = "eventos_sesion";
const app = document.getElementById('app');

// Funciones de sesión
function guardarSesion(usuario) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}
function obtenerSesion() {
  const user = localStorage.getItem(SESSION_KEY);
  return user ? JSON.parse(user) : null;
}
function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  window.location.hash = '#/login';
}

//Vistas principales
// Vista de inicio de sesión
function vistaLogin() {
  app.innerHTML = `
    <h2>Iniciar Sesión</h2>
    <form id="loginForm">
      <label>Email:<br><input type="email" name="email" required></label><br><br>
      <label>Contraseña:<br><input type="password" name="password" required></label><br><br>
      <button type="submit">Iniciar Sesión</button>
    </form>
    <div id="loginMsg"></div>
    <p>¿No tienes cuenta? <a href="#/register">Regístrate</a></p>
  `;
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch(`${API_URL}/users?email=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`);
    const users = await res.json();
    const msg = document.getElementById('loginMsg');
    if (users.length === 0) {
      msg.style.color = 'red';
      msg.textContent = 'Credenciales incorrectas';
    } else {
      guardarSesion(users[0]);
      window.location.hash = '#/dashboard';
    }
  };
}

// Vista de registro de usuario
function vistaRegister() {
  app.innerHTML = `
    <h2>Registro de Usuario</h2>
    <form id="registerForm">
      <label>Nombre:<br><input type="text" name="nombre" required></label><br><br>
      <label>Email:<br><input type="email" name="email" required></label><br><br>
      <label>Contraseña:<br><input type="password" name="password" required minlength="4"></label><br><br>
      <button type="submit">Registrarse</button>
    </form>
    <div id="registerMsg"></div>
    <p>¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p>
  `;
  document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch(`${API_URL}/users?email=${encodeURIComponent(data.email)}`);
    const users = await res.json();
    const msg = document.getElementById('registerMsg');
    if (users.length > 0) {
      msg.style.color = 'red';
      msg.textContent = 'El correo ya está registrado';
      return;
    }
    const nuevoUsuario = { ...data, rol: 'visitante' };
    await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoUsuario)
    });
    msg.style.color = 'green';
    msg.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
    e.target.reset();
  };
}

// Vista principal del dashboard (admin y visitante)
function vistaDashboard() {
  const user = obtenerSesion();
  if (!user) { window.location.hash = '#/login'; return; }
  if (user.rol === 'admin') {
    app.innerHTML = `
      <h1>Bienvenido, ${user.nombre} (${user.rol})</h1>
      <button id="logoutBtn">Cerrar sesión</button>
      <hr>
      <div class="layout-dashboard">
        <nav class="sidebar-admin">
          <a href="#/dashboard">Inicio</a>
          <a href="#/dashboard/events/create">Crear evento</a>
          <a href="#/dashboard/events/edit">Editar eventos</a>
        </nav>
        <div class="dashboard-content">
          <div id="dashboardContent"></div>
        </div>
      </div>
    `;
    document.getElementById('logoutBtn').onclick = cerrarSesion;
    cargarEventos(user, true);
  } else {
    app.innerHTML = `
      <h1>Bienvenido, ${user.nombre} (${user.rol})</h1>
      <button id="logoutBtn">Cerrar sesión</button>
      <hr>
      <div id="dashboardContent"></div>
    `;
    document.getElementById('logoutBtn').onclick = cerrarSesion;
    cargarEventos(user, false);
  }
}

// Vista para crear un nuevo evento (solo admin)
function vistaCrearEvento() {
  const user = obtenerSesion();
  if (!user || user.rol !== 'admin') { vistaNotFound(); return; }
  app.innerHTML = `
    <h2>Crear Evento</h2>
    <form id="createEventForm">
      <label>Nombre:<br><input type="text" name="nombre" required></label><br><br>
      <label>Descripción:<br><textarea name="descripcion" required></textarea></label><br><br>
      <label>Fecha:<br><input type="date" name="fecha" required></label><br><br>
      <label>Hora:<br><input type="time" name="hora" required></label><br><br>
      <label>Lugar:<br><input type="text" name="lugar" required></label><br><br>
      <label>Capacidad:<br><input type="number" name="capacidad" min="1" required></label><br><br>
      <button type="submit">Crear Evento</button>
    </form>
    <div id="eventCreateMsg"></div>
    <p><a href="#/dashboard">Volver al dashboard</a></p>
  `;
  document.getElementById('createEventForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.capacidad = parseInt(data.capacidad);
    data.registrados = 0;
    await fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    document.getElementById('eventCreateMsg').textContent = '¡Evento creado exitosamente!';
    e.target.reset();
  };
}

// Vista para editar eventos existentes (solo admin)
function vistaEditarEvento() {
  const user = obtenerSesion();
  if (!user || user.rol !== 'admin') { vistaNotFound(); return; }
  app.innerHTML = `<h2>Editar Evento</h2><div id="eventList">Cargando...</div><div id="editFormContainer"></div><p><a href="#/dashboard">Volver al dashboard</a></p>`;
  const eventList = document.getElementById('eventList');
  const editFormContainer = document.getElementById('editFormContainer');
  fetch(`${API_URL}/eventos`).then(res => res.json()).then(eventos => {
    if (eventos.length === 0) {
      eventList.innerHTML = '<p>No hay eventos para editar.</p>';
      return;
    }
    eventList.innerHTML = '<ul>' + eventos.map(ev => `<li><button data-id="${ev.id}">${ev.nombre} (${ev.fecha})</button></li>`).join('') + '</ul>';
    eventList.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = () => mostrarFormularioEdicion(eventos.find(ev => ev.id == btn.dataset.id));
    });
  });
  function mostrarFormularioEdicion(evento) {
    editFormContainer.innerHTML = `
      <h3>Editando: ${evento.nombre}</h3>
      <form id="editEventForm">
        <label>Nombre:<br><input type="text" name="nombre" value="${evento.nombre}" required></label><br><br>
        <label>Descripción:<br><textarea name="descripcion" required>${evento.descripcion}</textarea></label><br><br>
        <label>Fecha:<br><input type="date" name="fecha" value="${evento.fecha}" required></label><br><br>
        <label>Hora:<br><input type="time" name="hora" value="${evento.hora}" required></label><br><br>
        <label>Lugar:<br><input type="text" name="lugar" value="${evento.lugar}" required></label><br><br>
        <label>Capacidad:<br><input type="number" name="capacidad" min="1" value="${evento.capacidad}" required></label><br><br>
        <button type="submit">Guardar Cambios</button>
        <button type="button" id="deleteEventBtn">Eliminar Evento</button>
      </form>
      <div id="editEventMsg"></div>
    `;
    document.getElementById('editEventForm').onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      data.capacidad = parseInt(data.capacidad);
      data.registrados = evento.registrados || 0;
      await fetch(`${API_URL}/eventos/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, ...data })
      });
      document.getElementById('editEventMsg').textContent = '¡Cambios guardados!';
    };
    document.getElementById('deleteEventBtn').onclick = async () => {
      if (!confirm('¿Seguro que deseas eliminar este evento?')) return;
      await fetch(`${API_URL}/eventos/${evento.id}`, { method: 'DELETE' });
      editFormContainer.innerHTML = '';
      vistaEditarEvento();
    };
  }
}

// Vista para rutas no encontradas o acceso denegado
function vistaNotFound() {
  app.innerHTML = `<h2>Página no encontrada o acceso no permitido.</h2><p><a href="#/dashboard">Ir al dashboard</a></p>`;
}

//Dashboard: eventos y registros
// Carga y muestra los eventos disponibles y registros del usuario
function cargarEventos(user, esAdmin = false) {
  const cont = esAdmin ? document.querySelector('.dashboard-content #dashboardContent') : document.getElementById('dashboardContent');
  cont.innerHTML = '<h2>Eventos disponibles</h2><div id="eventosList">Cargando eventos...</div>' +
    (user.rol === 'admin' ? '' : (user.rol === 'visitante' ? `<h2>Mis registros</h2><div id="misRegistros">Cargando...</div>` : ''));
  // Listar eventos
  fetch(`${API_URL}/eventos`).then(res => res.json()).then(eventos => {
    const eventosList = document.getElementById('eventosList');
    if (eventos.length === 0) {
      eventosList.innerHTML = '<p>No hay eventos disponibles.</p>';
      return;
    }
    eventosList.innerHTML = '<ul>' + eventos.map(ev => `
      <li>
        <strong>${ev.nombre}</strong> - ${ev.fecha} ${ev.hora} en ${ev.lugar}<br>
        ${ev.descripcion}<br>
        Capacidad: ${ev.capacidad} | Registrados: ${ev.registrados || 0}
        ${user.rol === 'visitante' ? `<br><button data-id="${ev.id}" class="btn-registrar">Registrarme</button>` : ''}
      </li>
    `).join('') + '</ul>';
    // Permite a los visitantes registrarse en eventos
    if (user.rol === 'visitante') {
      document.querySelectorAll('.btn-registrar').forEach(btn => {
        btn.onclick = async () => {
          const eventId = btn.dataset.id;
          btn.disabled = true;
          btn.textContent = 'Registrando...';
          const eventoRes = await fetch(`${API_URL}/eventos/${eventId}`);
          const evento = await eventoRes.json();
          if ((evento.registrados || 0) >= evento.capacidad) {
            alert('El evento ya está lleno.');
            btn.disabled = false;
            btn.textContent = 'Registrarme';
            return;
          }
          const regRes = await fetch(`${API_URL}/registros?eventoId=${eventId}&usuarioId=${user.id}`);
          const yaRegistrado = await regRes.json();
          if (yaRegistrado.length > 0) {
            alert('Ya estás registrado en este evento.');
            btn.disabled = false;
            btn.textContent = 'Registrarme';
            return;
          }
          await fetch(`${API_URL}/registros`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventoId: eventId, usuarioId: user.id })
          });
          await fetch(`${API_URL}/eventos/${eventId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrados: (evento.registrados || 0) + 1 })
          });
          alert('¡Registro exitoso!');
          cargarEventos(user, esAdmin);
        };
      });
    }
  });
 }

// Ruteo SPA
// Controla la navegación entre vistas según el hash de la URL
function router() {
  const hash = window.location.hash;
  if (hash.startsWith('#/dashboard/events/create')) {
    vistaCrearEvento();
  } else if (hash.startsWith('#/dashboard/events/edit')) {
    vistaEditarEvento();
  } else if (hash.startsWith('#/dashboard')) {
    vistaDashboard();
  } else if (hash.startsWith('#/register')) {
    vistaRegister();
  } else if (hash.startsWith('#/login')) {
    vistaLogin();
  } else {
    vistaLogin();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router); 
