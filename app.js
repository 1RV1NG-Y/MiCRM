(function(){
  /* ========= ESTADO ========= */
  const LS=(k,v)=>v===undefined?JSON.parse(localStorage.getItem(k)||"null"):localStorage.setItem(k,JSON.stringify(v));
  let state={
    meta:50000,
    contactos:LS('crm_contactos')||[],
    tareas:LS('crm_tareas')||[], // {id,contactoId,desc,lugar,fecha,hora,notas,estado:'pendiente'|'finalizada',duracion,comentario}
    vista:'dashboard',
    contactoActual:null,
    fechaCalendario:new Date()
  };
  /* ========= UTIL ========= */
  const byId=id=>document.getElementById(id);
  const cerrarModal=id=>byId(id).classList.remove('abierto');
  const abrirModal=id=>byId(id).classList.add('abierto');
  const formatoFecha=(f)=>new Date(f).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'});
  const guardar=()=>{LS('crm_contactos',state.contactos);LS('crm_tareas',state.tareas);};
  /* ========= LOGIN ========= */
  byId('form-login').addEventListener('submit',e=>{e.preventDefault();const u=byId('usuario').value,p=byId('clave').value;if(u==='admin'&&p==='password'){byId('login').style.display='none';byId('app').style.display='grid';render();}else{byId('login-error').textContent='Credenciales incorrectas';setTimeout(()=>byId('login-error').textContent='',3000);}});
  byId('salir').onclick=()=>{byId('app').style.display='none';byId('login').style.display='flex';};
  /* ========= NAVEGACIÓN ========= */
  document.querySelectorAll('.link-nav').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();seleccionarVista(a.dataset.vista);}));
  function seleccionarVista(v){state.vista=v;document.querySelectorAll('.link-nav').forEach(l=>l.classList.toggle('activo',l.dataset.vista===v));document.querySelectorAll('.seccion').forEach(s=>s.classList.toggle('activa',s.id===v));if(v==='dashboard')renderDashboard();if(v==='contactos')renderContactos();if(v==='calendario')renderCalendario();if(v==='detalle')renderDetalle();}
  /* ========= DASHBOARD ========= */
  function renderDashboard(){byId('metrica-meta').textContent='$'+state.meta.toLocaleString();const ventas=state.contactos.filter(c=>c.tipo==='cliente').length;byId('metrica-ventas').textContent=ventas;const oportunidades=state.tareas.filter(t=>t.estado==='pendiente').length;byId('metrica-oportunidades').textContent=oportunidades;const prospects=state.contactos.filter(c=>c.tipo==='prospecto').length;byId('metrica-prospectos').textContent=prospects;/* pendientes */const ulP=byId('lista-pendientes');ulP.innerHTML='';state.tareas.filter(t=>t.estado==='pendiente').slice(0,8).forEach(t=>{const li=document.createElement('li');li.textContent=t.desc+' ('+formatoFecha(t.fecha)+')';ulP.appendChild(li);});/* prospectos nuevos */const ulN=byId('lista-prospectos');ulN.innerHTML='';state.contactos.filter(c=>c.tipo==='prospecto'&&state.tareas.every(t=>t.contactoId!==c.id)).slice(0,8).forEach(c=>{const li=document.createElement('li');li.textContent=c.nombre;ulN.appendChild(li);});}
  function renderDashboard(){
 byId('metrica-meta').textContent='$'+state.meta.toLocaleString();
 const ventas = state.contactos.filter(c => c.tipo === 'cliente').length;
 byId('metrica-ventas').textContent = ventas;
 const oportunidades = state.tareas.filter(t => t.estado === 'pendiente').length;
 byId('metrica-oportunidades').textContent = oportunidades;
 const prospectos = state.contactos.filter(c => c.tipo === 'prospecto').length;
 byId('metrica-prospectos').textContent = prospectos;
 /* pendientes */
 const ulP = byId('lista-pendientes');
 ulP.innerHTML = '';
 state.tareas.filter(t => t.estado === 'pendiente').slice(0, 8).forEach(t => {
 const li = document.createElement('li');
    li.textContent = t.desc + ' (' + formatoFecha(t.fecha) + ')';
 ulP.appendChild(li);
  });
 /* prospectos nuevos */
  const ulN = byId('lista-prospectos');
  ulN.innerHTML = '';
  state.contactos.filter(c => c.tipo === 'prospecto' && state.tareas.every(t => t.contactoId !== c.id)).slice(0, 8).forEach(c => {
    const li = document.createElement('li');
    li.textContent = c.nombre;
    ulN.appendChild(li);
  });
  }
  /* ========= CONTACTOS ========= */
  byId('nuevo-contacto').onclick=()=>{byId('form-contacto').reset();byId('c-id').value='';byId('titulo-modal-contacto').textContent='Nuevo contacto';abrirModal('modal-contacto');};
  byId('form-contacto').addEventListener('submit',e=>{e.preventDefault();const idInput=byId('c-id').value;const obj={nombre:byId('c-nombre').value,tipo:byId('c-tipo').value,email:byId('c-email').value,telefono:byId('c-telefono').value,comercial:byId('c-comercial').value,razon:byId('c-razon').value,ubicacion:byId('c-ubicacion').value,refiere:byId('c-refiere').value,agente:byId('c-agente').value,empresa:byId('c-empresa').value};if(idInput){const idx=state.contactos.findIndex(c=>c.id==idInput);state.contactos[idx]={...state.contactos[idx],...obj};}else{obj.id=Date.now();state.contactos.push(obj);}guardar();cerrarModal('modal-contacto');renderContactos();});
  function renderContactos(){const tbody=byId('tabla-contactos');tbody.innerHTML='';state.contactos.forEach(c=>{const tr=document.createElement('tr');tr.dataset.id=c.id;tr.innerHTML=`<td>${c.nombre}</td><td>${c.tipo}</td><td>${c.email||''}</td><td>${c.telefono||''}</td><td><button class='accion' data-del='${c.id}'>X</button></td>`;tbody.appendChild(tr);});}
  byId('tabla-contactos').addEventListener('click',e=>{const tr=e.target.closest('tr');if(!tr)return;const id=parseInt(tr.dataset.id);if(e.target.dataset.del){if(confirm('¿Eliminar contacto?')){state.contactos=state.contactos.filter(c=>c.id!==id);state.tareas=state.tareas.filter(t=>t.contactoId!==id);guardar();renderContactos();}}else{state.contactoActual=id;seleccionarVista('detalle');}});
  /* ========= DETALLE CONTACTO Y TAREAS ========= */
  byId('volver').onclick=()=>seleccionarVista('contactos');
  byId('agregar-tarea').onclick=()=>{byId('form-tarea').reset();byId('t-id').value='';abrirModal('modal-tarea');};
  byId('form-tarea').addEventListener('submit',e=>{e.preventDefault();const id=byId('t-id').value;const obj={desc:byId('t-desc').value,lugar:byId('t-lugar').value,fecha:byId('t-fecha').value,hora:byId('t-hora').value,notas:byId('t-notas').value,contactoId:state.contactoActual,estado:'pendiente'};if(id){const idx=state.tareas.findIndex(t=>t.id==id);state.tareas[idx]={...state.tareas[idx],...obj};}else{obj.id=Date.now();state.tareas.push(obj);}guardar();cerrarModal('modal-tarea');renderDetalle();});byId('guardar-nota').addEventListener('click',()=>{const nota=byId('nota-seguimiento').value;if(!nota)return;const contacto=state.contactos.find(c=>c.id===state.contactoActual);if(!contacto)return;if(!contacto.seguimiento)contacto.seguimiento=[];contacto.seguimiento.push({fecha:new Date().toISOString(),nota:nota});guardar();renderDetalle();byId('nota-seguimiento').value='';});function renderDetalle(){const c=state.contactos.find(c=>c.id===state.contactoActual);if(!c)return;byId('nombre-detalle').textContent='Seguimiento: '+c.nombre;byId('info-contacto').innerHTML=`<p><strong>Tipo:</strong> ${c.tipo}</p><p><strong>Empresa:</strong> ${c.comercial||'—'}</p><p><strong>Razón Social:</strong> ${c.razon||'—'}</p><p><strong>Email:</strong> ${c.email||'—'}</p><p><strong>Teléfono:</strong> ${c.telefono||'—'}</p><p><strong>Ubicación:</strong> ${c.ubicacion||'—'}</p><p><strong>Quién recomienda:</strong> ${c.refiere||'—'}</p><p><strong>Vendedor/Agente:</strong> ${c.agente||'—'}</p><p><strong>Tipo de Empresa:</strong> ${c.empresa||'—'}</p>`;/* tareas pendientes */const tbodyPendientes=byId('tabla-tareas-pendientes');tbodyPendientes.innerHTML='';state.tareas.filter(t=>t.contactoId===c.id&&t.estado==='pendiente').forEach(t=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${t.desc}</td><td>${t.lugar||''}</td><td>${formatoFecha(t.fecha)} ${t.hora}</td><td>${t.notas||''}</td><td><button class='accion' data-fin='${t.id}'>✓</button></td>`;tbodyPendientes.appendChild(tr);});/* historial */const tbH=byId('tabla-historial');tbH.innerHTML='';const historialOrdenado=(c.seguimiento||[]).sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));historialOrdenado.forEach(fu=>{const tr=document.createElement('tr');tr.innerHTML=`<td>Nota de seguimiento</td><td>${new Date(fu.fecha).toLocaleString()}</td><td>N/A</td><td>${fu.nota||''}</td>`;tbH.appendChild(tr);});renderHistorialTareas();}
let cierreId=null;
let fechaDiaActual=null;
byId("tabla-tareas-pendientes").addEventListener("click",e=>{
  if(e.target.dataset.fin){
    cierreId=parseInt(e.target.dataset.fin);
    byId("form-cierre").reset();
    byId("lista-archivos").innerHTML="";
    abrirModal("modal-cierre");
  }
});
byId("f-archivos").addEventListener("change",()=>{
  const ul=byId("lista-archivos");
  ul.innerHTML="";
  [...byId("f-archivos").files].forEach(f=>{const li=document.createElement("li");li.textContent=f.name;ul.appendChild(li);});
});
byId("form-cierre").addEventListener("submit",async e=>{
  e.preventDefault();
  const t=state.tareas.find(x=>x.id===cierreId);
  if(!t) return;
  t.estado="finalizada";
  t.duracion=byId("f-duracion").value;
  t.comentario=byId("f-comentario").value;
  const files=[...byId("f-archivos").files];
  if(files.length){
    t.archivos=await Promise.all(files.map(file=>new Promise(res=>{const r=new FileReader();r.onload=()=>res({name:file.name,data:r.result});r.readAsDataURL(file);})));
  }else{
    t.archivos=[];
  }
  guardar();
  cerrarModal("modal-cierre");
  renderDetalle();
  renderCalendario();
  if(fechaDiaActual) mostrarDia(fechaDiaActual);
});
function renderHistorialTareas(){
    const tbody=byId('tabla-historial-tareas');
    if(!tbody) return;
    tbody.innerHTML='';
    const tareasFinalizadas=state.tareas.filter(t=>t.contactoId===state.contactoActual && t.estado==='finalizada').sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
    tareasFinalizadas.forEach(t=>{
      const tr=document.createElement('tr');
      const archivos=(t.archivos||[]).map(a=>`<a class='descarga-btn' href="${a.data}" download="${a.name}">Descargar</a>`).join(' ');
      tr.innerHTML=`<td>${t.desc}</td><td>${t.lugar||''}</td><td>${formatoFecha(t.fecha)} ${t.hora||''}</td><td>${t.duracion||''}</td><td>${t.comentario||''}</td><td>${archivos}</td>`;
      tbody.appendChild(tr);
    });
  }

  /* ========= CALENDARIO ========= */
  const nombresDias=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  byId('calendario-encabezado').innerHTML=nombresDias.map(d=>`<div class='dia-enc'>${d}</div>`).join('');
  byId('mes-prev').onclick=()=>{state.fechaCalendario.setMonth(state.fechaCalendario.getMonth()-1);renderCalendario();};
  byId('mes-next').onclick=()=>{state.fechaCalendario.setMonth(state.fechaCalendario.getMonth()+1);renderCalendario();};
  function renderCalendario(){const grid=byId('calendario-grid');grid.innerHTML='';const f=new Date(state.fechaCalendario.getFullYear(),state.fechaCalendario.getMonth(),1);const year=f.getFullYear(),mes=f.getMonth();byId('titulo-mes').textContent=f.toLocaleString('es-ES',{month:'long',year:'numeric'});const primerDia=f.getDay();const diasMes=new Date(year,mes+1,0).getDate();for(let i=0;i<primerDia;i++){grid.appendChild(document.createElement('div'));}
    const hoy=new Date().toISOString().slice(0,10);
    for(let d=1;d<=diasMes;d++){const cel=document.createElement('div');cel.className='dia';cel.innerHTML=`<span class='numero'>${d}</span>`;const fechaStr=`${year}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const lista=state.tareas.filter(t=>t.fecha===fechaStr);lista.forEach(t=>{const badge=document.createElement('div');badge.className='tarea-badge';const contacto=state.contactos.find(c=>c.id===t.contactoId);badge.textContent=t.desc+(contacto?` (${contacto.nombre})`:"");if(t.estado==='finalizada'){badge.classList.add('tarea-cerrada');}else if(t.fecha<hoy){badge.classList.add('tarea-pasada');}else if(t.fecha===hoy){badge.classList.add('tarea-hoy');}cel.appendChild(badge);});cel.onclick=()=>mostrarDia(fechaStr);grid.appendChild(cel);} }
  function mostrarDia(fecha){
    fechaDiaActual=fecha;
    byId('titulo-dia').textContent='Tareas del '+formatoFecha(fecha);
    const ul=byId('lista-dia');
    ul.innerHTML='';
    const hoy=new Date().toISOString().slice(0,10);
    state.tareas.filter(t=>t.fecha===fecha).forEach(t=>{
      const li=document.createElement('li');
      const contacto=state.contactos.find(c=>c.id===t.contactoId)||{};
      li.innerHTML=`<span>${t.desc} - ${contacto.nombre||''} ${t.hora||''}</span>`;
      if(t.estado==='finalizada'){
        li.classList.add('tarea-cerrada');
      }else if(t.fecha<hoy){
        li.classList.add('tarea-pasada');
      }else if(t.fecha===hoy){
        li.classList.add('tarea-hoy');
      }
      if(t.estado!=='finalizada'){
        const btn=document.createElement('button');
        btn.textContent='Cerrar';
        btn.className='accion';
        btn.dataset.fin=t.id;
        li.appendChild(btn);
      }
      ul.appendChild(li);
    });
    abrirModal('modal-dia');
  }

  byId('lista-dia').addEventListener('click',e=>{
    if(e.target.dataset.fin){
      cierreId=parseInt(e.target.dataset.fin);
      byId('form-cierre').reset();
      byId('lista-archivos').innerHTML='';
      cerrarModal('modal-dia');
      abrirModal('modal-cierre');
    }
  });
  /* ========= MODALES GENÉRICOS ========= */
  document.querySelectorAll('[data-cerrar]').forEach(el=>el.onclick=()=>cerrarModal(el.dataset.cerrar));
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)cerrarModal(m.id);}));
  /* ========= RENDER INICIAL ========= */
  function render(){renderDashboard();renderContactos();renderCalendario(); renderDetalle(); /* Initial render for detail view */}
  seleccionarVista('dashboard');
})();
