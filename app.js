(function(){
  /* ========= ESTADO ========= */
  const LS=(k,v)=>v===undefined?JSON.parse(localStorage.getItem(k)||"null"):localStorage.setItem(k,JSON.stringify(v));
  let state={
    meta:50000,
    contactos:LS('crm_contactos')||[],
    tareas:LS('crm_tareas')||[], // {id,contactoId,desc,lugar,fecha,hora,notas,estado:'pendiente'|'finalizada',duracion,comentario}
    vista:'dashboard',
    contactoActual:null,
    fechaCalendario:new Date(),
    vistaCalendario:'mes'
  };
  /* ========= UTIL ========= */
  const byId=id=>document.getElementById(id);
  const cerrarModal=id=>byId(id).classList.remove('abierto');
  const abrirModal=id=>byId(id).classList.add('abierto');
  const formatoFecha=(f)=>new Date(f).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'});
  function claseEstado(t){
    if(t.estado==='finalizada') return 'verde';
    const hoy=new Date().toISOString().slice(0,10);
    if(t.fecha<hoy) return 'roja';
    if(t.fecha===hoy) return 'amarilla';
    return '';
  }
  const guardar=()=>{LS('crm_contactos',state.contactos);LS('crm_tareas',state.tareas);};
  /* ========= LOGIN ========= */
  byId('form-login').addEventListener('submit',e=>{e.preventDefault();const u=byId('usuario').value,p=byId('clave').value;if(u==='admin'&&p==='password'){byId('login').style.display='none';byId('app').style.display='grid';render();}else{byId('login-error').textContent='Credenciales incorrectas';setTimeout(()=>byId('login-error').textContent='',3000);}});
  byId('salir').onclick=()=>{byId('app').style.display='none';byId('login').style.display='flex';};
  /* ========= NAVEGACIÓN ========= */
  document.querySelectorAll('.link-nav').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();seleccionarVista(a.dataset.vista);}));
function seleccionarVista(v){
  state.vista=v;
  document.querySelectorAll('.link-nav').forEach(l=>l.classList.toggle('activo',l.dataset.vista===v));
  document.querySelectorAll('.seccion').forEach(s=>s.classList.toggle('activa',s.id===v));
  if(v==='dashboard')renderDashboard();
  if(v==='contactos')renderContactos();
  if(v==='calendario')renderCalendario();
  if(v==='detalle')renderDetalle();
  if(v==='tareas')renderTareasGlobal();
}
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
  function llenarSelectContactos(sel){
    sel.innerHTML=state.contactos.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('');
  }

  function abrirModalTarea({contactoId=null,fecha=null}={}){
    byId('form-tarea').reset();
    byId('t-id').value='';
    const sel=byId('t-contacto');
    if(sel){
      llenarSelectContactos(sel);
      if(contactoId){
        sel.value=contactoId;
        sel.disabled=true;
      }else{
        sel.disabled=false;
      }
    }
    if(fecha) byId('t-fecha').value=fecha;
    abrirModal('modal-tarea');
  }

  byId('agregar-tarea').onclick=()=>abrirModalTarea({contactoId:state.contactoActual});
byId('form-tarea').addEventListener('submit',e=>{
  e.preventDefault();
  const id=byId('t-id').value;
  const sel=byId('t-contacto');
  const contactoId=sel?parseInt(sel.value):state.contactoActual;
  const obj={
    desc:byId('t-desc').value,
    lugar:byId('t-lugar').value,
    fecha:byId('t-fecha').value,
    hora:byId('t-hora').value,
    notas:byId('t-notas').value,
    contactoId,
    estado:'pendiente'
  };
  if(id){
    const idx=state.tareas.findIndex(t=>t.id==id);
    state.tareas[idx]={...state.tareas[idx],...obj};
  }else{
    obj.id=Date.now();
    state.tareas.push(obj);
  }
  guardar();
  cerrarModal('modal-tarea');
  renderDetalle();
  renderCalendario();
  if(fechaDiaActual) mostrarDia(fechaDiaActual);
});
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

  function renderTareasGlobal(){
    const sel=byId('filtro-tareas');
    if(!sel) return;
    sel.innerHTML='';
    const opt=document.createElement('option');
    opt.value='todos';
    opt.textContent='Todos';
    sel.appendChild(opt);
    state.contactos.forEach(c=>{
      const o=document.createElement('option');
      o.value=c.id;
      o.textContent=c.nombre;
      sel.appendChild(o);
    });
    sel.onchange=actualizarTareasGlobal;
    actualizarTareasGlobal();
  }

  function renderFiltroCalendario(){
    const sel=byId('filtro-calendario');
    if(!sel) return;
    const val=sel.value || 'todos';
    sel.innerHTML='';
    const opt=document.createElement('option');
    opt.value='todos';
    opt.textContent='Todos';
    sel.appendChild(opt);
    state.contactos.forEach(c=>{
      const o=document.createElement('option');
      o.value=c.id;
      o.textContent=c.nombre;
      sel.appendChild(o);
    });
    sel.value=val;
    sel.onchange=renderCalendario;
  }

  function actualizarTareasGlobal(){
    const sel=byId('filtro-tareas');
    const id=sel?sel.value:'todos';
    const pendientes=byId('tabla-tareas-global');
    const historial=byId('tabla-historial-global');
    if(!pendientes||!historial) return;
    pendientes.innerHTML='';
    historial.innerHTML='';
    const lista=id==='todos'?state.tareas:state.tareas.filter(t=>t.contactoId==id);
    lista.filter(t=>t.estado==='pendiente').forEach(t=>{
      const contacto=state.contactos.find(c=>c.id===t.contactoId)||{};
      const tr=document.createElement('tr');
      const cls=claseEstado(t);
      if(cls) tr.classList.add('tarea-'+cls);
      tr.innerHTML=`<td>${t.desc}</td><td>${contacto.nombre||''}</td><td>${t.lugar||''}</td><td>${formatoFecha(t.fecha)} ${t.hora||''}</td><td>${t.notas||''}</td>`;
      pendientes.appendChild(tr);
    });
    lista.filter(t=>t.estado==='finalizada').sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).forEach(t=>{
      const contacto=state.contactos.find(c=>c.id===t.contactoId)||{};
      const archivos=(t.archivos||[]).map(a=>`<a class='descarga-btn' href="${a.data}" download="${a.name}">Descargar</a>`).join(' ');
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${t.desc}</td><td>${contacto.nombre||''}</td><td>${t.lugar||''}</td><td>${formatoFecha(t.fecha)} ${t.hora||''}</td><td>${t.duracion||''}</td><td>${t.comentario||''}</td><td>${archivos}</td>`;
      historial.appendChild(tr);
    });
  }

  /* ========= CALENDARIO ========= */
  const nombresDias=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  byId('calendario-encabezado').innerHTML=nombresDias.map(d=>`<div class='dia-enc'>${d}</div>`).join('');

  const selVista=byId('vista-calendario');
  if(selVista) selVista.onchange=()=>{state.vistaCalendario=selVista.value;renderCalendario();};

  byId('mes-prev').onclick=()=>{
    if(state.vistaCalendario==='mes') state.fechaCalendario.setMonth(state.fechaCalendario.getMonth()-1);
    else if(state.vistaCalendario==='semana') state.fechaCalendario.setDate(state.fechaCalendario.getDate()-7);
    else state.fechaCalendario.setDate(state.fechaCalendario.getDate()-1);
    renderCalendario();
  };
  byId('mes-next').onclick=()=>{
    if(state.vistaCalendario==='mes') state.fechaCalendario.setMonth(state.fechaCalendario.getMonth()+1);
    else if(state.vistaCalendario==='semana') state.fechaCalendario.setDate(state.fechaCalendario.getDate()+7);
    else state.fechaCalendario.setDate(state.fechaCalendario.getDate()+1);
    renderCalendario();
  };
  function renderCalendario(){
    renderFiltroCalendario();
    const grid=byId('calendario-grid');
    const encabezado=byId('calendario-encabezado');
    const contDia=byId('calendario-dia');
    grid.innerHTML='';
    contDia.innerHTML='';
    const vista=byId('vista-calendario')?byId('vista-calendario').value:state.vistaCalendario;
    state.vistaCalendario=vista;
    encabezado.style.display=vista==='dia'?'none':'grid';
    grid.style.display=vista==='dia'?'none':'grid';
    contDia.style.display=vista==='dia'?'block':'none';

    const filtroSel=byId('filtro-calendario');
    const filtro=filtroSel?filtroSel.value:'todos';

    if(vista==='mes'){
      const f=new Date(state.fechaCalendario.getFullYear(),state.fechaCalendario.getMonth(),1);
      const year=f.getFullYear(),mes=f.getMonth();
      byId('titulo-mes').textContent=f.toLocaleString('es-ES',{month:'long',year:'numeric'});
      const primerDia=f.getDay();
      const diasMes=new Date(year,mes+1,0).getDate();
      for(let i=0;i<primerDia;i++) grid.appendChild(document.createElement('div'));
      for(let d=1;d<=diasMes;d++){
        const cel=document.createElement('div');
        cel.className='dia';
        cel.innerHTML=`<span class='numero'>${d}</span>`;
        const fechaStr=`${year}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const lista=state.tareas.filter(t=>t.fecha===fechaStr && (filtro==='todos'||t.contactoId==filtro));
        lista.forEach(t=>{
          const badge=document.createElement('div');
          const cls=claseEstado(t);
          badge.classList.add('tarea-badge');
          if(cls) badge.classList.add(cls);
          const contacto=state.contactos.find(c=>c.id===t.contactoId);
          badge.textContent=t.desc+(contacto?` (${contacto.nombre})`:'');
          cel.appendChild(badge);
        });
        cel.onclick=()=>mostrarDia(fechaStr);
        grid.appendChild(cel);
      }
    } else if(vista==='semana'){
      const start=new Date(state.fechaCalendario);
      start.setDate(start.getDate()-start.getDay());
      const end=new Date(start);
      end.setDate(start.getDate()+6);
      byId('titulo-mes').textContent=`Semana del ${formatoFecha(start.toISOString())}`;
      for(let i=0;i<7;i++){
        const d=new Date(start);
        d.setDate(start.getDate()+i);
        const cel=document.createElement('div');
        cel.className='dia';
        cel.innerHTML=`<span class='numero'>${d.getDate()}</span>`;
        const fechaStr=d.toISOString().slice(0,10);
        const lista=state.tareas.filter(t=>t.fecha===fechaStr && (filtro==='todos'||t.contactoId==filtro));
        lista.forEach(t=>{
          const badge=document.createElement('div');
          const cls=claseEstado(t);
          badge.classList.add('tarea-badge');
          if(cls) badge.classList.add(cls);
          const contacto=state.contactos.find(c=>c.id===t.contactoId);
          badge.textContent=t.desc+(contacto?` (${contacto.nombre})`:'');
          cel.appendChild(badge);
        });
        cel.onclick=()=>mostrarDia(fechaStr);
        grid.appendChild(cel);
      }
    } else {
      const f=new Date(state.fechaCalendario);
      byId('titulo-mes').textContent=formatoFecha(f.toISOString());
      for(let h=0;h<24;h++){
        const linea=document.createElement('div');
        linea.className='hora-linea';
        const label=document.createElement('div');
        label.className='hora-label';
        label.textContent=(`${h}`.padStart(2,'0'))+':00';
        const eventos=document.createElement('div');
        eventos.className='hora-eventos';
        const horaStr=`${String(h).padStart(2,'0')}`;
        const fechaStr=f.toISOString().slice(0,10);
        state.tareas.filter(t=>t.fecha===fechaStr && t.hora && t.hora.startsWith(horaStr) && (filtro==='todos'||t.contactoId==filtro)).forEach(t=>{
          const div=document.createElement('div');
          const cls=claseEstado(t);
          if(cls) div.classList.add('tarea-'+cls);
          const contacto=state.contactos.find(c=>c.id===t.contactoId)||{};
          div.textContent=`${t.hora} - ${t.desc} ${(contacto.nombre? '('+contacto.nombre+')':'')}`;
          eventos.appendChild(div);
        });
        linea.appendChild(label);
        linea.appendChild(eventos);
        contDia.appendChild(linea);
      }
    }
  }
  function mostrarDia(fecha){
    fechaDiaActual=fecha;
    byId('titulo-dia').textContent='Tareas del '+formatoFecha(fecha);
    const ul=byId('lista-dia');
    ul.innerHTML='';
    const filtroSel=byId('filtro-calendario');
    const filtro=filtroSel?filtroSel.value:'todos';
    state.tareas.filter(t=>t.fecha===fecha && (filtro==='todos'||t.contactoId==filtro)).forEach(t=>{
      const li=document.createElement('li');
      const contacto=state.contactos.find(c=>c.id===t.contactoId)||{};
      li.innerHTML=`<span>${t.desc} - ${contacto.nombre||''} ${t.hora||''}</span>`;
      const cls=claseEstado(t);
      if(cls) li.classList.add('tarea-'+cls);
      if(t.estado!=='finalizada'){
        const btn=document.createElement('button');
        btn.textContent='Finalizar';
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
  byId('nueva-tarea-dia').onclick=()=>abrirModalTarea({fecha:fechaDiaActual});
  /* ========= MODALES GENÉRICOS ========= */
  document.querySelectorAll('[data-cerrar]').forEach(el=>el.onclick=()=>cerrarModal(el.dataset.cerrar));
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)cerrarModal(m.id);}));
  /* ========= RENDER INICIAL ========= */
  function render(){
    renderDashboard();
    renderContactos();
    renderCalendario();
    renderDetalle();
    renderTareasGlobal(); /* Initial render for tasks view */
  }
  seleccionarVista('dashboard');
})();
