// ═══════════════════════════════════════════════════════════════════════════
// proveedores-agenda.js — Agenda telefónica + Nuevo proveedor
// Sistema AM · Antofagasta Minerals
//
// P-8 (docs/PENDIENTES.md), tercer corte: se extrajo SOLO el subconjunto
// realmente autocontenido del bloque "VISTA AGENDA TELEFÓNICA + NUEVO
// PROVEEDOR". registrarLog() vivía físicamente en medio de este mismo
// bloque pero es una utilidad ampliamente compartida (19 usos en todo
// proveedores.js) — se quedó ahí, no se movió.
//
// Depende de globals declaradas en proveedores.js (SUPA, showToast,
// registrarLog, esc, DB, PROVEEDORES, dispName, RANGOS_TRABAJO, saveDB,
// gSyncPush, buildFilters, buildRangoFilters, applyFilters,
// updateHeroStats) — por eso se carga DESPUÉS de proveedores.js en
// index.html, como <script src> clásico. Nunca type="module": los
// onclick del HTML necesitan que estas funciones sean globales. Ver
// CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

function telLink(raw){
  if(!raw) return '';
  let d=String(raw).replace(/[^0-9+]/g,'');
  if(d && d[0]!=='+'){ if(d.startsWith('56')) d='+'+d; else if(d.length===9) d='+56'+d; else if(d.length===8) d='+56'+d; }
  return d;
}
function renderAgenda(data){
  const cont=document.getElementById('viewAgenda'); if(!cont) return;
  // Una entrada por contacto: el principal con el nombre de la empresa, los
  // secundarios repiten la empresa con el contacto en azul. Cada uno con botón llamar.
  const empresas=data.map(p=>({p, nombre:dispName(p)}))
    .sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
  if(!empresas.length){ cont.innerHTML='<div class="agenda-empty" style="text-align:center;color:var(--text-muted);padding:40px">Sin proveedores</div>'; return; }

  let out='<div class="agenda-list">';
  let lastIni='';
  empresas.forEach(({p,nombre})=>{
    const ini=(nombre[0]||'#').toUpperCase();
    if(ini!==lastIni){ out+=`<div class="agenda-sep">${ini}</div>`; lastIni=ini; }
    // ordenar contactos: principal primero
    const cs=(DB.contactos[p._id]||[]).slice().sort((a,b)=>(b.principal?1:0)-(a.principal?1:0));
    // si no hay contactos, usar datos de la empresa
    const filas = cs.length ? cs : [{nombre:'', cargo:'', fono:p.fono||'', correo:p.correo||'', principal:true, _empresaFallback:true}];
    filas.forEach((c,idx)=>{
      const esPrincipal = idx===0;
      const fono = c.fono || (esPrincipal?p.fono:'') || '';
      const tel = telLink(fono);
      out+=`<div class="agenda-row">
        <div class="agenda-ava ${esPrincipal?'':'sec'}" onclick="openModal('${p._id}')">${esc(nombre[0]||'?').toUpperCase()}</div>
        <div class="agenda-main" onclick="openModal('${p._id}')">
          <div class="agenda-nombre">${esc(nombre)}</div>
          ${c.nombre?`<div class="agenda-contacto ${esPrincipal?'':'sec'}">${esPrincipal?'':'↳ '}${esc(c.nombre)}${c.cargo?' · '+esc(c.cargo):''}</div>`:(c._empresaFallback?'<div class="agenda-contacto agenda-nofono">Sin contacto registrado</div>':'')}
        </div>
        <div class="agenda-actions">
          ${tel?`<a class="agenda-btn call" href="tel:${tel}" title="Llamar">📞 Llamar</a>`:'<span class="agenda-btn call agenda-nofono">Sin tel.</span>'}
        </div>
      </div>`;
    });
  });
  out+='</div>';
  cont.innerHTML=out;
}

// ── NUEVO PROVEEDOR ────────────────────────────────────────────────────────
function openNuevoProveedor(){
  if(!SUPA.session){ showToast('Inicia sesión para agregar','err'); return; }
  document.getElementById('npRazon').value='';
  document.getElementById('npFantasia').value='';
  document.getElementById('npRut').value='';
  document.getElementById('npLocalidad').value='';
  document.getElementById('npDireccion').value='';
  document.getElementById('npRubros').value='';
  document.getElementById('npContacto').value='';
  document.getElementById('npCargo').value='';
  document.getElementById('npFono').value='';
  document.getElementById('npCorreo').value='';
  document.getElementById('npFacturar').value='Sin información';
  document.getElementById('npServicioAM').value='';
  const nr=document.getElementById('npRango');
  nr.innerHTML='<option value="">— Sin definir —</option>'+RANGOS_TRABAJO.map(v=>`<option value="${v}">${v}</option>`).join('');
  nr.value=''; ['npPubCen','npPubAnt','npPubZal'].forEach(id=>{const e=document.getElementById(id); if(e)e.checked=false;});
  document.getElementById('nuevoProvModal').style.display='flex';
}
function cerrarNuevoProveedor(){ document.getElementById('nuevoProvModal').style.display='none'; }

async function guardarNuevoProveedor(){
  const razon=document.getElementById('npRazon').value.trim();
  if(!razon){ showToast('La razón social es obligatoria','err'); return; }
  const rut=document.getElementById('npRut').value.trim();
  const rutNorm=rut.replace(/[^0-9kK]/g,'');
  const pid = rutNorm ? ('re_'+rutNorm) : ('nm_'+razon.toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,24)+'_'+Date.now().toString(36));

  // ¿ya existe por RUT?
  if(rutNorm && PROVEEDORES.some(p=>(p.rut_empresa||'').replace(/[^0-9kK]/g,'')===rutNorm)){
    showToast('Ya existe un proveedor con ese RUT','err'); return;
  }
  const rubros=document.getElementById('npRubros').value.split(/[,;|]+/).map(s=>s.trim()).filter(Boolean);
  const nuevo={
    _id:pid, _proveedorId:pid, _edited:true,
    razon_social:razon,
    nombre_fantasia:document.getElementById('npFantasia').value.trim(),
    rut_empresa:rut,
    localidad:document.getElementById('npLocalidad').value.trim()||'Sin información',
    direccion:document.getElementById('npDireccion').value.trim(),
    correo:document.getElementById('npCorreo').value.trim(),
    fono:document.getElementById('npFono').value.trim(),
    giros:rubros.slice(), rubrosNorm:rubros.length?rubros:['Otros'],
    actividad_principal:'', descripcion:'', plataformas:'', categoria_sii:'',
    facturar:document.getElementById('npFacturar').value,
    agrupacion:'', servicio_am:document.getElementById('npServicioAM').value.trim(),
    rango_trabajos:document.getElementById('npRango').value,
    pub_centinela:!!document.getElementById('npPubCen').checked,
    pub_antucoya:!!document.getElementById('npPubAnt').checked,
    pub_zaldivar:!!document.getElementById('npPubZal').checked,
    estado:'Activo', nombre_contacto:'', cargo:'', rut_persona:''
  };
  PROVEEDORES.push(nuevo);

  // contacto principal
  const cont=document.getElementById('npContacto').value.trim();
  if(cont){
    DB.contactos[pid]=[{
      id:'cont_'+pid+'_0', nombre:cont,
      cargo:document.getElementById('npCargo').value.trim(),
      rut:'', correo:document.getElementById('npCorreo').value.trim(),
      fono:document.getElementById('npFono').value.trim(), principal:true
    }];
  }

  await saveDB();
  await registrarLog('proveedor', pid, 'crear', 'Nuevo proveedor: '+razon);
  if(SUPA.session){ await gSyncPush(pid); }

  cerrarNuevoProveedor();
  buildFilters(); buildRangoFilters(); applyFilters(); updateHeroStats();
  showToast('✅ Proveedor agregado: '+razon,'success');
}
