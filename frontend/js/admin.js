/**
 * admin.js — PowerFix
 * Panel administrativo: stats, charts (Chart.js), tablas, modales
 * Funcionalidad: CRUD contactos, CRUD servicios, dashboard, analítica
 */

const API = window.PF?.API_URL || 'http://localhost:8000';

let chartMaquinas = null;
let chartEstados  = null;
let chartVisitas  = null;

/* ── Paleta de colores para gráficos ──────────────────────── */
const CHART_COLORS = ['#E55F0A','#1E2D3D','#2563EB','#16A34A','#D97706','#DC2626','#7C3AED','#0891B2','#BE185D'];

document.addEventListener('DOMContentLoaded', async () => {

  /* 1 · Verificar autenticación */
  const token = localStorage.getItem('pf_token');
  const user  = (() => {
    try { return JSON.parse(localStorage.getItem('pf_user')); }
    catch { return null; }
  })();

  const authLoader   = document.getElementById('authLoader');
  const adminLayout  = document.getElementById('adminLayout');

  if (!token || !user || user.rol !== 'admin') {
    window.location.replace('login.html');
    return;
  }

  /* Mostrar layout */
  if (authLoader)  authLoader.setAttribute('hidden', '');
  if (adminLayout) adminLayout.removeAttribute('hidden');

  /* 2 · Rellenar info de usuario */
  const initiales = `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase();
  setText('userAvatar', initiales);
  setText('userName',   `${user.nombre} ${user.apellido}`);
  setText('userRole',   user.rol);

  /* 3 · Fecha en topbar */
  const hoy = new Date().toLocaleDateString('es-AR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  setText('topbarDate', hoy.charAt(0).toUpperCase() + hoy.slice(1));

  /* 4 · Configurar navegación del sidebar */
  initSidebar();

  /* 5 · Logout */
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('pf_token');
    localStorage.removeItem('pf_user');
    sessionStorage.removeItem('pf_session_token');
    window.location.replace('login.html');
  });

  /* 6 · Toggle tema */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  if (themeToggle) {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    themeIcon.className = current === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('pf_theme', next);
      themeIcon.className = next === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    });
  }

  /* 7 · Cargar datos del dashboard */
  await loadDashboard();
  await loadContactos();
  await loadServicios();
  await loadAgenda();
  await loadClientes();
});

/* ── Sidebar navigation ────────────────────────────────────── */
function initSidebar() {
  const items    = document.querySelectorAll('.sidebar__item[data-panel]');
  const panels   = document.querySelectorAll('.admin-panel');
  const topTitle = document.getElementById('topbarTitle');

  const TITLES = {
    dashboard: 'Dashboard',
    agenda:    'Agenda de Turnos',
    contactos: 'Órdenes de Trabajo',
    clientes:  'Clientes',
    servicios: 'Catálogo de Servicios',
    analytics: 'Analítica de Visitas',
  };

  items.forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      items.forEach(i  => i.classList.remove('sidebar__item--active'));
      panels.forEach(p => p.classList.remove('admin-panel--active'));
      item.classList.add('sidebar__item--active');
      document.getElementById(`panel-${panel}`)?.classList.add('admin-panel--active');
      if (topTitle) topTitle.textContent = TITLES[panel] || panel;
      if (panel === 'analytics') renderVisitasChart();
    });
  });

  /* Sidebar mobile toggle */
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('sidebar--open');
  });
}

/* ── Dashboard ─────────────────────────────────────────────── */
async function loadDashboard() {
  try {
    const [statsRes, chartRes] = await Promise.all([
      fetchAuth('/api/stats'),
      fetchAuth('/api/stats/charts'),
    ]);

    if (!statsRes.ok || !chartRes.ok) throw new Error('Error al cargar stats');

    const stats  = await statsRes.json();
    const charts = await chartRes.json();

    /* Stat cards */
    setText('statTotal',     stats.total_contactos);
    setText('statNuevo',     stats.contactos_nuevo);
    setText('statEnProceso', stats.contactos_en_proceso);
    setText('statResuelto',  stats.contactos_resuelto);
    setText('statServicios', stats.total_servicios);
    setText('statVisitas',   stats.total_visitas);

    /* Badges en sidebar */
    setText('contactosBadge',  stats.contactos_nuevo);
    setText('agendaBadge',     stats.turnos_pendientes);

    /* Stat cards — turnos */
    setText('statTurnos',          stats.total_turnos);
    setText('statTurnosHoy',       stats.turnos_hoy);
    setText('statTurnosPendientes', stats.turnos_pendientes);

    /* Gráfico: por tipo de máquina */
    renderBarChart('chartMaquinas', charts.maquinas.labels, charts.maquinas.data, 'Consultas');

    /* Gráfico: por estado */
    renderDoughnutChart('chartEstados', charts.estados.labels, charts.estados.data);

    /* Guardar para el panel de analytics */
    window._visitasData = charts.visitas;

  } catch (err) {
    console.error('Error en dashboard:', err);
  }
}

/* ═══════════════════════════════════════════════════════════════
   CONTACTOS
   ═══════════════════════════════════════════════════════════════ */

async function loadContactos(estado = '') {
  const tbody   = document.getElementById('contactosBody');
  const loader  = document.getElementById('contactosLoader');
  if (!tbody) return;

  loader?.classList.add('loader--visible');
  tbody.innerHTML = '';

  try {
    const url = estado ? `/api/contactos?estado=${estado}` : '/api/contactos';
    const res = await fetchAuth(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contactos = await res.json();

    if (contactos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="td-empty">Sin contactos registrados.</td></tr>`;
      return;
    }

    contactos.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-muted">#${c.id}</td>
        <td><strong>${c.nombre} ${c.apellido}</strong></td>
        <td>${c.tipo_maquina}</td>
        <td>${c.email}</td>
        <td>${c.telefono}</td>
        <td><span class="badge badge--${c.estado}">${c.estado.replace('_', ' ')}</span></td>
        <td>${window.PF.formatDate(c.created_at)}</td>
        <td class="td-actions">
          <button type="button" class="btn btn--sm btn--view" data-id="${c.id}" data-action="ver" title="Ver detalle">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button type="button" class="btn btn--sm btn--delete" data-id="${c.id}" data-action="eliminar" title="Eliminar contacto">
            <i class="fa-solid fa-trash"></i>
          </button>
          <select class="select-estado" data-id="${c.id}" data-action="estado" aria-label="Cambiar estado del contacto ${c.id}">
            <option value="nuevo"      ${c.estado==='nuevo'      ? 'selected':''}>Nuevo</option>
            <option value="en_proceso" ${c.estado==='en_proceso' ? 'selected':''}>En Proceso</option>
            <option value="resuelto"   ${c.estado==='resuelto'   ? 'selected':''}>Resuelto</option>
            <option value="cerrado"    ${c.estado==='cerrado'    ? 'selected':''}>Cerrado</option>
          </select>
        </td>`;
      tr._contactoData = c;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="td-error">Error al cargar contactos. Verificá que el servidor esté activo.</td></tr>`;
  } finally {
    loader?.classList.remove('loader--visible');
  }
}

/* Delegación de eventos: click y change en la tabla de contactos */
document.getElementById('contactosBody')?.addEventListener('click',  handleContactoAction);
document.getElementById('contactosBody')?.addEventListener('change', handleContactoAction);

/* Re-asignar listeners cuando el tbody se re-renderiza (DOMContentLoaded los pisa) */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contactosBody')?.addEventListener('click',  handleContactoAction);
  document.getElementById('contactosBody')?.addEventListener('change', handleContactoAction);
});

async function handleContactoAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id     = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'ver') {
    const tr = btn.closest('tr');
    openContactoModal(tr._contactoData);
  }

  if (action === 'estado') {
    const nuevoEstado = btn.value;
    try {
      const res = await fetchAuth(`/api/contactos/${id}/estado`, 'PATCH', { estado: nuevoEstado });
      if (!res.ok) throw new Error();
      const badgeEl = btn.closest('tr')?.querySelector('.badge');
      if (badgeEl) {
        badgeEl.className = `badge badge--${nuevoEstado}`;
        badgeEl.textContent = nuevoEstado.replace('_', ' ');
      }
    } catch {
      alert('No se pudo actualizar el estado.');
    }
  }

  if (action === 'eliminar') {
    if (!confirm('¿Eliminar este contacto? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetchAuth(`/api/contactos/${id}`, 'DELETE');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      btn.closest('tr')?.remove();
      /* Actualizar badge con nuevos */
      const badge = document.getElementById('contactosBadge');
      if (badge) badge.textContent = Math.max(0, parseInt(badge.textContent || '0') - 1);
    } catch {
      alert('No se pudo eliminar el contacto.');
    }
  }
}

/* Filtro de estado y recarga */
document.getElementById('filtroEstado')?.addEventListener('change', (e) => {
  loadContactos(e.target.value);
});
document.getElementById('recargarContactos')?.addEventListener('click', () => {
  const estado = document.getElementById('filtroEstado')?.value || '';
  loadContactos(estado);
});

/* ═══════════════════════════════════════════════════════════════
   SERVICIOS — CRUD completo
   ═══════════════════════════════════════════════════════════════ */

async function loadServicios() {
  const tbody  = document.getElementById('serviciosBody');
  const loader = document.getElementById('serviciosLoader');
  if (!tbody) return;

  loader?.classList.add('loader--visible');
  tbody.innerHTML = '';

  try {
    /* Admin endpoint: incluye servicios inactivos */
    const res      = await fetchAuth('/api/servicios/admin/all');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const servicios = await res.json();

    if (servicios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="td-empty">No hay servicios registrados.</td></tr>`;
      return;
    }

    servicios.forEach(s => {
      const tr = document.createElement('tr');
      const categBadge = s.categoria === 'Jardinería' ? 'resuelto'
                       : s.categoria === 'Energía'    ? 'nuevo'
                       : 'en_proceso';
      tr.innerHTML = `
        <td class="td-muted">#${s.id}</td>
        <td><strong>${s.nombre}</strong></td>
        <td><span class="badge badge--${categBadge}">${s.categoria}</span></td>
        <td>${window.PF.formatPrice(s.precio_base)}</td>
        <td>${s.tiempo_estimado || '—'}</td>
        <td>
          <span class="td-status ${s.disponible ? 'td-status--ok' : 'td-status--off'}">
            <i class="fa-solid fa-${s.disponible ? 'check-circle' : 'times-circle'}"></i>
            ${s.disponible ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td class="td-actions">
          <button type="button" class="btn btn--sm btn--view" data-id="${s.id}" data-action="svc-edit" title="Editar servicio">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn btn--sm ${s.disponible ? 'btn--deactivate' : 'btn--activate'}"
                  data-id="${s.id}" data-action="svc-toggle"
                  title="${s.disponible ? 'Desactivar' : 'Activar'}">
            <i class="fa-solid fa-${s.disponible ? 'eye-slash' : 'eye'}"></i>
          </button>
          <button type="button" class="btn btn--sm btn--delete" data-id="${s.id}" data-action="svc-delete" title="Eliminar servicio">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>`;
      tr._servicioData = s;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="td-error">Error al cargar servicios. Verificá que el servidor esté activo.</td></tr>`;
  } finally {
    loader?.classList.remove('loader--visible');
  }
}

/* Delegación de eventos en tabla de servicios */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('serviciosBody')?.addEventListener('click', handleServicioAction);

  /* Botón Nuevo Servicio */
  document.getElementById('nuevoServicioBtn')?.addEventListener('click', () => openServicioModal());
});

async function handleServicioAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id     = parseInt(btn.dataset.id);
  const action = btn.dataset.action;
  const tr     = btn.closest('tr');

  if (action === 'svc-edit') {
    openServicioModal(tr._servicioData);
  }

  if (action === 'svc-toggle') {
    const s = tr._servicioData;
    const payload = {
      nombre:          s.nombre,
      categoria:       s.categoria,
      descripcion:     s.descripcion,
      precio_base:     s.precio_base,
      imagen_path:     s.imagen_path,
      disponible:      !s.disponible,
      tiempo_estimado: s.tiempo_estimado,
    };
    try {
      const res = await fetchAuth(`/api/servicios/${id}`, 'PUT', payload);
      if (!res.ok) throw new Error();
      await loadServicios();
    } catch {
      alert('No se pudo actualizar el servicio.');
    }
  }

  if (action === 'svc-delete') {
    if (!confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetchAuth(`/api/servicios/${id}`, 'DELETE');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      tr.remove();
      /* Actualizar stat card */
      const statEl = document.getElementById('statServicios');
      if (statEl) statEl.textContent = Math.max(0, parseInt(statEl.textContent || '0') - 1);
    } catch {
      alert('No se pudo eliminar el servicio.');
    }
  }
}

/* ── Modal crear / editar servicio ─────────────────────────── */
function openServicioModal(servicio = null) {
  const modal = document.getElementById('servicioModal');
  const title = document.getElementById('servicioModalTitle');
  const form  = document.getElementById('servicioForm');
  if (!modal) return;

  form.reset();

  if (servicio) {
    title.textContent = 'Editar Servicio';
    document.getElementById('servicioId').value        = servicio.id;
    document.getElementById('svcNombre').value         = servicio.nombre;
    document.getElementById('svcCategoria').value      = servicio.categoria;
    document.getElementById('svcDescripcion').value    = servicio.descripcion;
    document.getElementById('svcPrecio').value         = servicio.precio_base;
    document.getElementById('svcTiempo').value         = servicio.tiempo_estimado || '';
    document.getElementById('svcImagen').value         = servicio.imagen_path;
    document.getElementById('svcDisponible').checked   = servicio.disponible;
  } else {
    title.textContent = 'Nuevo Servicio';
    document.getElementById('servicioId').value      = '';
    document.getElementById('svcDisponible').checked = true;
  }

  modal.classList.add('modal--open');
}

function closeServicioModal() {
  document.getElementById('servicioModal')?.classList.remove('modal--open');
}

/* Listeners del modal de servicio */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('servicioModalClose')?.addEventListener('click', closeServicioModal);
  document.getElementById('servicioModalCancel')?.addEventListener('click', closeServicioModal);
  document.getElementById('servicioModalOverlay')?.addEventListener('click', closeServicioModal);

  document.getElementById('servicioForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id  = document.getElementById('servicioId').value;
    const btn = document.getElementById('servicioFormSubmit');
    const txt = document.getElementById('servicioSubmitText');

    const nombre = document.getElementById('svcNombre').value.trim();
    const categ  = document.getElementById('svcCategoria').value;
    const desc   = document.getElementById('svcDescripcion').value.trim();
    const precio = parseFloat(document.getElementById('svcPrecio').value);
    const imagen = document.getElementById('svcImagen').value.trim();

    if (!nombre || !categ || !desc || isNaN(precio) || !imagen) {
      alert('Completá todos los campos obligatorios (*).');
      return;
    }

    const payload = {
      nombre,
      categoria:       categ,
      descripcion:     desc,
      precio_base:     precio,
      tiempo_estimado: document.getElementById('svcTiempo').value.trim() || null,
      imagen_path:     imagen,
      disponible:      document.getElementById('svcDisponible').checked,
    };

    btn.disabled   = true;
    txt.textContent = 'Guardando...';

    try {
      const res = id
        ? await fetchAuth(`/api/servicios/${id}`, 'PUT',  payload)
        : await fetchAuth('/api/servicios',        'POST', payload);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      closeServicioModal();
      await loadServicios();

      /* Si era nuevo, incrementar stat card */
      if (!id) {
        const statEl = document.getElementById('statServicios');
        if (statEl) statEl.textContent = parseInt(statEl.textContent || '0') + 1;
      }

    } catch (err) {
      alert(`No se pudo guardar el servicio: ${err.message}`);
    } finally {
      btn.disabled    = false;
      txt.textContent = 'Guardar Servicio';
    }
  });
});

/* Cerrar modales con Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeContactoModal();
    closeServicioModal();
  }
});

/* ═══════════════════════════════════════════════════════════════
   MODAL DETALLE CONTACTO
   ═══════════════════════════════════════════════════════════════ */

function openContactoModal(contacto) {
  const modal   = document.getElementById('contactoModal');
  const content = document.getElementById('modalContent');
  if (!modal || !content || !contacto) return;

  content.innerHTML = `
    <div class="modal-detail">
      <div class="modal-detail__grid">
        <div>
          <span class="modal-label">Cliente</span>
          <p class="modal-value">${contacto.nombre} ${contacto.apellido}</p>
        </div>
        <div>
          <span class="modal-label">Máquina</span>
          <p class="modal-value">${contacto.tipo_maquina}</p>
        </div>
        <div>
          <span class="modal-label">Email</span>
          <p class="modal-value">
            <a href="mailto:${contacto.email}" class="modal-value--link">${contacto.email}</a>
          </p>
        </div>
        <div>
          <span class="modal-label">Teléfono</span>
          <p class="modal-value">
            <a href="tel:${contacto.telefono}" class="modal-value--link">${contacto.telefono}</a>
          </p>
        </div>
      </div>
      <div>
        <span class="modal-label">Descripción del Problema</span>
        <p class="modal-desc">${contacto.descripcion}</p>
      </div>
      <div class="modal-footer">
        <span class="badge badge--${contacto.estado}">${contacto.estado.replace('_',' ')}</span>
        <span class="modal-meta">${window.PF.formatDate(contacto.created_at)}</span>
      </div>
    </div>`;

  modal.classList.add('modal--open');
}

function closeContactoModal() {
  document.getElementById('contactoModal')?.classList.remove('modal--open');
}

document.getElementById('modalClose')?.addEventListener('click', closeContactoModal);
document.getElementById('modalOverlay')?.addEventListener('click', closeContactoModal);

/* ═══════════════════════════════════════════════════════════════
   AGENDA — CRUD de turnos
   ═══════════════════════════════════════════════════════════════ */

const ESTADO_TURNO_LABEL = {
  agendado:   'Agendado',
  confirmado: 'Confirmado',
  en_curso:   'En Curso',
  completado: 'Completado',
  no_show:    'No Show',
};

async function loadAgenda() {
  const tbody  = document.getElementById('agendaBody');
  const loader = document.getElementById('agendaLoader');
  if (!tbody) return;

  loader?.classList.add('loader--visible');
  tbody.innerHTML = '';

  try {
    const res = await fetchAuth('/api/turnos');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const turnos = await res.json();

    if (turnos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="td-empty">No hay turnos registrados. Creá el primero con "Nuevo Turno".</td></tr>`;
      return;
    }

    turnos.forEach(t => {
      const tr = document.createElement('tr');
      const fechaFmt = t.fecha
        ? new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' })
        : '—';
      tr.innerHTML = `
        <td>
          <strong>${fechaFmt}</strong>
          <div class="td-muted">${t.hora}</div>
        </td>
        <td>
          <strong>${t.cliente_nombre}</strong>
          ${t.cliente_telefono ? `<div class="td-muted">${t.cliente_telefono}</div>` : ''}
        </td>
        <td>${t.vehiculo}</td>
        <td>${t.servicio}</td>
        <td>${t.mecanico || '<span class="td-muted">—</span>'}</td>
        <td>
          <select class="select-estado" data-id="${t.id}" data-action="turno-estado" aria-label="Estado del turno ${t.id}">
            ${Object.entries(ESTADO_TURNO_LABEL).map(([val, lbl]) =>
              `<option value="${val}" ${t.estado === val ? 'selected' : ''}>${lbl}</option>`
            ).join('')}
          </select>
        </td>
        <td class="td-actions">
          <button type="button" class="btn btn--sm btn--view" data-id="${t.id}" data-action="turno-edit" title="Editar turno">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn btn--sm btn--delete" data-id="${t.id}" data-action="turno-delete" title="Eliminar turno">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>`;
      tr._turnoData = t;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="td-error">Error al cargar la agenda. Verificá que el servidor esté activo.</td></tr>`;
  } finally {
    loader?.classList.remove('loader--visible');
  }
}

/* Delegación de eventos en tabla de agenda */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('agendaBody')?.addEventListener('click',  handleAgendaAction);
  document.getElementById('agendaBody')?.addEventListener('change', handleAgendaAction);
  document.getElementById('nuevoTurnoBtn')?.addEventListener('click', () => openTurnoModal());
  document.getElementById('recargarClientes')?.addEventListener('click', loadClientes);
});

async function handleAgendaAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id     = parseInt(btn.dataset.id);
  const action = btn.dataset.action;
  const tr     = btn.closest('tr');

  if (action === 'turno-edit') {
    openTurnoModal(tr._turnoData);
  }

  if (action === 'turno-estado') {
    try {
      const res = await fetchAuth(`/api/turnos/${id}/estado`, 'PATCH', { estado: btn.value });
      if (!res.ok) throw new Error();
      if (tr._turnoData) tr._turnoData.estado = btn.value;
    } catch {
      alert('No se pudo actualizar el estado del turno.');
    }
  }

  if (action === 'turno-delete') {
    if (!confirm('¿Eliminar este turno? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetchAuth(`/api/turnos/${id}`, 'DELETE');
      if (!res.ok) throw new Error();
      tr.remove();
      const badge = document.getElementById('agendaBadge');
      if (badge) badge.textContent = Math.max(0, parseInt(badge.textContent || '0') - 1);
    } catch {
      alert('No se pudo eliminar el turno.');
    }
  }
}

/* ── Modal crear / editar turno ────────────────────────────── */
function openTurnoModal(turno = null) {
  const modal = document.getElementById('turnoModal');
  const title = document.getElementById('turnoModalTitle');
  const form  = document.getElementById('turnoForm');
  if (!modal) return;

  form.reset();

  if (turno) {
    title.textContent = 'Editar Turno';
    document.getElementById('turnoId').value  = turno.id;
    document.getElementById('tNombre').value  = turno.cliente_nombre;
    document.getElementById('tEmail').value   = turno.cliente_email    || '';
    document.getElementById('tTelefono').value = turno.cliente_telefono || '';
    document.getElementById('tVehiculo').value = turno.vehiculo;
    document.getElementById('tServicio').value = turno.servicio;
    document.getElementById('tFecha').value   = turno.fecha;
    document.getElementById('tHora').value    = turno.hora;
    document.getElementById('tMecanico').value = turno.mecanico || '';
    document.getElementById('tNotas').value   = turno.notas    || '';
  } else {
    title.textContent = 'Nuevo Turno';
    document.getElementById('turnoId').value = '';
    /* Precargar fecha de hoy */
    document.getElementById('tFecha').value = new Date().toISOString().split('T')[0];
  }

  modal.classList.add('modal--open');
}

function closeTurnoModal() {
  document.getElementById('turnoModal')?.classList.remove('modal--open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('turnoModalClose')?.addEventListener('click', closeTurnoModal);
  document.getElementById('turnoModalCancel')?.addEventListener('click', closeTurnoModal);
  document.getElementById('turnoModalOverlay')?.addEventListener('click', closeTurnoModal);

  document.getElementById('turnoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id  = document.getElementById('turnoId').value;
    const btn = document.getElementById('turnoFormSubmit');
    const txt = document.getElementById('turnoSubmitText');

    const nombre   = document.getElementById('tNombre').value.trim();
    const vehiculo = document.getElementById('tVehiculo').value.trim();
    const servicio = document.getElementById('tServicio').value.trim();
    const fecha    = document.getElementById('tFecha').value;
    const hora     = document.getElementById('tHora').value;

    if (!nombre || !vehiculo || !servicio || !fecha || !hora) {
      alert('Completá los campos obligatorios: nombre, vehículo, servicio, fecha y hora.');
      return;
    }

    const payload = {
      cliente_nombre:   nombre,
      cliente_email:    document.getElementById('tEmail').value.trim()    || null,
      cliente_telefono: document.getElementById('tTelefono').value.trim() || null,
      vehiculo,
      servicio,
      fecha,
      hora,
      mecanico: document.getElementById('tMecanico').value.trim() || null,
      notas:    document.getElementById('tNotas').value.trim()    || null,
    };

    btn.disabled    = true;
    txt.textContent = 'Guardando...';

    try {
      const res = id
        ? await fetchAuth(`/api/turnos/${id}`, 'PUT',  payload)
        : await fetchAuth('/api/turnos',        'POST', payload);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      closeTurnoModal();
      await loadAgenda();

    } catch (err) {
      alert(`No se pudo guardar el turno: ${err.message}`);
    } finally {
      btn.disabled    = false;
      txt.textContent = 'Guardar Turno';
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   CLIENTES
   ═══════════════════════════════════════════════════════════════ */

async function loadClientes() {
  const tbody  = document.getElementById('clientesBody');
  const loader = document.getElementById('clientesLoader');
  if (!tbody) return;

  loader?.classList.add('loader--visible');
  tbody.innerHTML = '';

  try {
    const res = await fetchAuth('/api/clientes');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const clientes = await res.json();

    if (clientes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="td-empty">No hay clientes registrados aún.</td></tr>`;
      return;
    }

    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.nombre} ${c.apellido}</strong></td>
        <td><a href="mailto:${c.email}" class="modal-value--link">${c.email}</a></td>
        <td>${c.telefono || '<span class="td-muted">—</span>'}</td>
        <td><span class="badge badge--nuevo">${c.total_consultas}</span></td>
        <td>${window.PF.formatDate(c.ultima_consulta)}</td>`;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="td-error">Error al cargar clientes.</td></tr>`;
  } finally {
    loader?.classList.remove('loader--visible');
  }
}

/* ═══════════════════════════════════════════════════════════════
   CHARTS
   ═══════════════════════════════════════════════════════════════ */

function renderBarChart(canvasId, labels, data, label) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
  if (chartMaquinas) chartMaquinas.destroy();
  chartMaquinas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label, data, backgroundColor: colors, borderRadius: 6, borderSkipped: false }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { maxRotation: 30 } } },
    },
  });
}

function renderDoughnutChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  const ESTADO_COLORS = { nuevo: '#2563EB', en_proceso: '#D97706', resuelto: '#16A34A', cerrado: '#CBD5E0' };
  const colors = labels.map(l => ESTADO_COLORS[l] || '#E55F0A');
  if (chartEstados) chartEstados.destroy();
  chartEstados = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.map(l => l.replace('_', ' ')),
      datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }],
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
    },
  });
}

function renderVisitasChart() {
  const v = window._visitasData;
  if (!v || v.labels.length === 0) return;
  const ctx = document.getElementById('chartVisitas')?.getContext('2d');
  if (!ctx) return;
  if (chartVisitas) chartVisitas.destroy();
  chartVisitas = new Chart(ctx, {
    type: 'line',
    data: {
      labels: v.labels,
      datasets: [{
        label: 'Visitas',
        data: v.data,
        fill: true,
        backgroundColor: 'rgba(229,95,10,0.1)',
        borderColor: '#E55F0A',
        tension: 0.4,
        pointBackgroundColor: '#E55F0A',
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '—';
}

function fetchAuth(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('pf_token')}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`${API}${path}`, opts);
}
