(() => {
  const LS = {
    get: (k, d) => {
      try { return JSON.parse(localStorage.getItem(k)) || d; }
      catch { return d; }
    },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
  };

  const state = {
    meta: 50000,
    contactos: LS.get('crm_contactos', []),
    tareas: LS.get('crm_tareas', []),
    vista: 'dashboard',
    contactoActual: null,
    fechaCalendario: new Date()
  };

  const $ = id => document.getElementById(id);
  const openModal = id => $(id).classList.add('abierto');
  const closeModal = id => $(id).classList.remove('abierto');
  const formatDate = f => new Date(f).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'});
  const save = () => {
    LS.set('crm_contactos', state.contactos);
    LS.set('crm_tareas', state.tareas);
  };

  // ===== Login =====
  $('form-login').addEventListener('submit', e => {
    e.preventDefault();
    const u = $('usuario').value;
    const p = $('clave').value;
    if (u === 'admin' && p === 'password') {
      $('login').style.display = 'none';
      $('app').style.display = 'grid';
      render();
    } else {
      $('login-error').textContent = 'Credenciales incorrectas';
      setTimeout(() => $('login-error').textContent = '', 3000);
    }
  });
  $('salir').addEventListener('click', () => {
    $('app').style.display = 'none';
    $('login').style.display = 'flex';
  });

  // ===== Navegación =====
  document.querySelectorAll('.link-nav').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      seleccionarVista(a.dataset.vista);
    });
  });
  function seleccionarVista(v) {
    state.vista = v;
    document.querySelectorAll('.link-nav').forEach(l => {
      l.classList.toggle('activo', l.dataset.vista === v);
    });
    document.querySelectorAll('.seccion').forEach(s => {
      s.classList.toggle('activa', s.id === v);
    });
    if (v === 'dashboard') renderDashboard();
    if (v === 'contactos') renderContactos();
    if (v === 'calendario') renderCalendario();
    if (v === 'detalle') renderDetalle();
  }

  // ===== Dashboard =====
  function renderDashboard() {
    $('metrica-meta').textContent = '$' + state.meta.toLocaleString();
    $('metrica-ventas').textContent = state.contactos.filter(c => c.tipo === 'cliente').length;
    $('metrica-oportunidades').textContent = state.tareas.filter(t => t.estado === 'pendiente').length;
    $('metrica-prospectos').textContent = state.contactos.filter(c => c.tipo === 'prospecto').length;

    const ulP = $('lista-pendientes');
    ulP.innerHTML = '';
    state.tareas.filter(t => t.estado === 'pendiente').slice(0,8).forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.desc} (${formatDate(t.fecha)})`;
      ulP.appendChild(li);
    });

    const ulN = $('lista-prospectos');
    ulN.innerHTML = '';
    state.contactos.filter(c => c.tipo === 'prospecto' && state.tareas.every(t => t.contactoId !== c.id))
      .slice(0,8)
      .forEach(c => {
        const li = document.createElement('li');
        li.textContent = c.nombre;
        ulN.appendChild(li);
      });
  }

  // ===== Contactos =====
  $('nuevo-contacto').addEventListener('click', () => {
    $('form-contacto').reset();
    $('c-id').value = '';
    $('titulo-modal-contacto').textContent = 'Nuevo contacto';
    openModal('modal-contacto');
  });

  $('form-contacto').addEventListener('submit', e => {
    e.preventDefault();
    const id = $('c-id').value;
    const obj = {
      nombre: $('c-nombre').value,
      tipo: $('c-tipo').value,
      email: $('c-email').value,
      telefono: $('c-telefono').value,
      comercial: $('c-comercial').value,
      razon: $('c-razon').value,
      ubicacion: $('c-ubicacion').value,
      refiere: $('c-refiere').value,
      agente: $('c-agente').value,
      empresa: $('c-empresa').value
    };
    if (id) {
      const idx = state.contactos.findIndex(c => c.id == id);
      state.contactos[idx] = { ...state.contactos[idx], ...obj };
    } else {
      obj.id = Date.now();
      state.contactos.push(obj);
    }
    save();
    closeModal('modal-contacto');
    renderContactos();
  });

  function renderContactos() {
    const tbody = $('tabla-contactos');
    tbody.innerHTML = '';
    state.contactos.forEach(c => {
      const tr = document.createElement('tr');
      tr.dataset.id = c.id;
      tr.innerHTML = `<td>${c.nombre}</td><td>${c.tipo}</td><td>${c.email || ''}</td><td>${c.telefono || ''}</td><td><button class='accion' data-del='${c.id}'>X</button></td>`;
      tbody.appendChild(tr);
    });
  }

  $('tabla-contactos').addEventListener('click', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = parseInt(tr.dataset.id);
    if (e.target.dataset.del) {
      if (confirm('¿Eliminar contacto?')) {
        state.contactos = state.contactos.filter(c => c.id !== id);
        state.tareas = state.tareas.filter(t => t.contactoId !== id);
        save();
        renderContactos();
      }
    } else {
      state.contactoActual = id;
      seleccionarVista('detalle');
    }
  });

  // ===== Detalle y Tareas =====
  $('volver').addEventListener('click', () => seleccionarVista('contactos'));
  $('agregar-tarea').addEventListener('click', () => {
    $('form-tarea').reset();
    $('t-id').value = '';
    openModal('modal-tarea');
  });

  $('form-tarea').addEventListener('submit', e => {
    e.preventDefault();
    const id = $('t-id').value;
    const obj = {
      desc: $('t-desc').value,
      lugar: $('t-lugar').value,
      fecha: $('t-fecha').value,
      hora: $('t-hora').value,
      notas: $('t-notas').value,
      contactoId: state.contactoActual,
      estado: 'pendiente'
    };
    if (id) {
      const idx = state.tareas.findIndex(t => t.id == id);
      state.tareas[idx] = { ...state.tareas[idx], ...obj };
    } else {
      obj.id = Date.now();
      state.tareas.push(obj);
    }
    save();
    closeModal('modal-tarea');
    renderDetalle();
  });

  $('guardar-nota').addEventListener('click', () => {
    const nota = $('nota-seguimiento').value;
    if (!nota) return;
    const contacto = state.contactos.find(c => c.id === state.contactoActual);
    if (!contacto) return;
    if (!contacto.seguimiento) contacto.seguimiento = [];
    contacto.seguimiento.push({ fecha: new Date().toISOString(), nota });
    save();
    renderDetalle();
    $('nota-seguimiento').value = '';
  });

  function renderDetalle() {
    const c = state.contactos.find(c => c.id === state.contactoActual);
    if (!c) return;
    $('nombre-detalle').textContent = 'Seguimiento: ' + c.nombre;
    $('info-contacto').innerHTML = `
      <p><strong>Tipo:</strong> ${c.tipo}</p>
      <p><strong>Empresa:</strong> ${c.comercial || '—'}</p>
      <p><strong>Razón Social:</strong> ${c.razon || '—'}</p>
      <p><strong>Email:</strong> ${c.email || '—'}</p>
      <p><strong>Teléfono:</strong> ${c.telefono || '—'}</p>
      <p><strong>Ubicación:</strong> ${c.ubicacion || '—'}</p>
      <p><strong>Quién recomienda:</strong> ${c.refiere || '—'}</p>
      <p><strong>Vendedor/Agente:</strong> ${c.agente || '—'}</p>
      <p><strong>Tipo de Empresa:</strong> ${c.empresa || '—'}</p>`;

    const tbodyPend = $('tabla-tareas-pendientes');
    tbodyPend.innerHTML = '';
    state.tareas.filter(t => t.contactoId === c.id && t.estado === 'pendiente').forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.desc}</td><td>${t.lugar || ''}</td><td>${formatDate(t.fecha)} ${t.hora}</td><td>${t.notas || ''}</td><td><button class='accion' data-fin='${t.id}'>✓</button></td>`;
      tbodyPend.appendChild(tr);
    });

    const tbHist = $('tabla-historial');
    tbHist.innerHTML = '';
    const historialOrdenado = (c.seguimiento || []).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    historialOrdenado.forEach(n => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>Nota de seguimiento</td><td>${new Date(n.fecha).toLocaleString()}</td><td>N/A</td><td>${n.nota || ''}</td>`;
      tbHist.appendChild(tr);
    });

    const tbHistTareas = $('tabla-historial-tareas');
    tbHistTareas.innerHTML = '';
    state.tareas.filter(t => t.contactoId === c.id && t.estado === 'finalizada').forEach(t => {
      const tr = document.createElement('tr');
      const archivos = (t.archivos || []).map(a => `<a href="${a.data}" download="${a.nombre}" class='accion' style='background:var(--azul);margin-right:4px'>Descargar</a>`).join('');
      tr.innerHTML = `<td>${t.desc}</td><td>${t.lugar || ''}</td><td>${formatDate(t.fecha)} ${t.hora}</td><td>${t.duracion || ''}</td><td>${t.comentario || ''}</td><td>${archivos}</td>`;
      tbHistTareas.appendChild(tr);
    });
  }

  $('tabla-tareas-pendientes').addEventListener('click', e => {
    if (e.target.dataset.fin) {
      const id = parseInt(e.target.dataset.fin);
      $('form-fin-tarea').reset();
      $('fin-id').value = id;
      openModal('modal-fin-tarea');
    }
  });

  $('lista-dia').addEventListener('click', e => {
    if (e.target.dataset.fin) {
      const id = parseInt(e.target.dataset.fin);
      $('form-fin-tarea').reset();
      $('fin-id').value = id;
      closeModal('modal-dia');
      openModal('modal-fin-tarea');
    }
  });

  $('form-fin-tarea').addEventListener('submit', async e => {
    e.preventDefault();
    const id = parseInt($('fin-id').value);
    const t = state.tareas.find(x => x.id === id);
    if (!t) return;
    t.estado = 'finalizada';
    t.duracion = $('fin-duracion').value;
    t.comentario = $('fin-comentario').value;
    const files = Array.from($('fin-archivos').files || []);
    if (files.length) {
      const readFile = f => new Promise(res => { const r = new FileReader(); r.onload = ev => res({nombre:f.name, data:ev.target.result}); r.readAsDataURL(f); });
      t.archivos = await Promise.all(files.map(readFile));
    } else {
      t.archivos = [];
    }
    save();
    closeModal('modal-fin-tarea');
    renderDetalle();
  });

  // ===== Calendario =====
  const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  $('calendario-encabezado').innerHTML = dias.map(d => `<div class='dia-enc'>${d}</div>`).join('');
  $('mes-prev').addEventListener('click', () => {
    state.fechaCalendario.setMonth(state.fechaCalendario.getMonth()-1);
    renderCalendario();
  });
  $('mes-next').addEventListener('click', () => {
    state.fechaCalendario.setMonth(state.fechaCalendario.getMonth()+1);
    renderCalendario();
  });

  function renderCalendario() {
    const grid = $('calendario-grid');
    grid.innerHTML = '';
    const f = new Date(state.fechaCalendario.getFullYear(), state.fechaCalendario.getMonth(), 1);
    const year = f.getFullYear();
    const mes = f.getMonth();
    $('titulo-mes').textContent = f.toLocaleString('es-ES',{month:'long', year:'numeric'});
    const primerDia = f.getDay();
    const diasMes = new Date(year, mes+1, 0).getDate();
    for (let i=0; i<primerDia; i++) grid.appendChild(document.createElement('div'));
    for (let d=1; d<=diasMes; d++) {
      const cel = document.createElement('div');
      cel.className = 'dia';
      cel.innerHTML = `<span class='numero'>${d}</span>`;
      const fechaStr = `${year}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const lista = state.tareas.filter(t => t.fecha === fechaStr);
      lista.forEach(t => {
        const badge = document.createElement('div');
        badge.className = 'tarea-badge';
        const contacto = state.contactos.find(c => c.id === t.contactoId);
        badge.textContent = t.desc + (contacto ? ` (${contacto.nombre})` : '');
        cel.appendChild(badge);
      });
      cel.onclick = () => mostrarDia(fechaStr);
      grid.appendChild(cel);
    }
  }

  function mostrarDia(fecha) {
    $('titulo-dia').textContent = 'Tareas del ' + formatDate(fecha);
    const ul = $('lista-dia');
    ul.innerHTML = '';
    state.tareas.filter(t => t.fecha === fecha).forEach(t => {
      const li = document.createElement('li');
      const contacto = state.contactos.find(c => c.id === t.contactoId) || {};
      li.innerHTML = `<span>${t.desc} - ${contacto.nombre || ''} ${t.hora}</span>`;
      if (t.estado === 'pendiente') {
        const btn = document.createElement('button');
        btn.className = 'accion';
        btn.dataset.fin = t.id;
        btn.textContent = 'Cerrar';
        li.appendChild(btn);
      }
      ul.appendChild(li);
    });
    openModal('modal-dia');
  }

  // ===== Modales =====
  document.querySelectorAll('[data-cerrar]').forEach(el => el.addEventListener('click', () => closeModal(el.dataset.cerrar)));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));

  // ===== Render Inicial =====
  function render() {
    renderDashboard();
    renderContactos();
    renderCalendario();
    renderDetalle();
  }
  seleccionarVista('dashboard');
})();
