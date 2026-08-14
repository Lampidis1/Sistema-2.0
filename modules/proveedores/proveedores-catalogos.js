// ═══════════════════════════════════════════════════════════════════════════
// proveedores-catalogos.js — Listas maestras del directorio
// Sistema AM · Antofagasta Minerals
//
// Plataformas Mineras y Agrupación Gremial se escribían a mano en cada ficha.
// La base terminó con "ARIBA,", "Arriba, C sep, Pc Factory, hola" y "grha":
// tres formas de nada. Ahora los valores se crean una vez acá, en Gestión
// Interna, y en la ficha se eligen de una lista.
//
// Tabla: catalogo_listas (item_id, tipo, valor, orden). `tipo` es
// 'plataforma' o 'agrupacion'. Se carga al iniciar sesión, como el catálogo
// de programas.
//
// Depende de globals de proveedores.js (SUPA, showToast, esc, registrarLog,
// miNombre). <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

let CAT_LISTAS = { plataforma: [], agrupacion: [] };

const CAT_TIPOS = {
  plataforma: { titulo: 'Plataformas Mineras', icono: '🔗',
                ayuda: 'Plataformas de registro y compras donde el proveedor está inscrito (ARIBA, SAP, etc.). Un proveedor puede estar en varias.' },
  agrupacion: { titulo: 'Agrupación Gremial', icono: '🤝',
                ayuda: 'Asociaciones o cámaras a las que pertenece el proveedor. Cada proveedor pertenece a una.' },
};

async function cargarCatalogoListas(){
  if(!SUPA.client || !SUPA.session) return;
  try{
    const {data,error}=await SUPA.client.from('catalogo_listas').select('*')
      .neq('estado_registro','Eliminado').order('orden').order('valor');
    if(error) throw error;
    CAT_LISTAS={plataforma:[],agrupacion:[]};
    (data||[]).forEach(x=>{ if(CAT_LISTAS[x.tipo]) CAT_LISTAS[x.tipo].push(x); });
  }catch(e){ console.warn('catalogo_listas',e); }
}

const catValores = tipo => (CAT_LISTAS[tipo]||[]).map(x=>x.valor);

// ── Panel en Gestión Interna ────────────────────────────────────────────────
function renderCatalogoListas(){
  const cont=document.getElementById('kanbanContent'); if(!cont) return;
  cont.innerHTML=`
    <div class="kb-head"><div class="kb-title">🗂 Listas del directorio</div></div>
    <div style="font-size:.85rem;color:var(--text-muted);max-width:720px;margin-bottom:18px;line-height:1.6">
      Lo que se cree acá es lo que aparece para elegir en la ficha del proveedor.
      Sirve para que no vuelvan a convivir tres formas de escribir lo mismo.
    </div>
    <div class="cat-cols">
      ${Object.keys(CAT_TIPOS).map(t=>catColumnaHTML(t)).join('')}
    </div>`;
}

function catColumnaHTML(tipo){
  const cfg=CAT_TIPOS[tipo];
  const items=CAT_LISTAS[tipo]||[];
  return `<div class="cat-col">
    <div class="cat-col-h">${cfg.icono} ${cfg.titulo} <span class="cat-n">${items.length}</span></div>
    <div class="cat-ayuda">${esc(cfg.ayuda)}</div>
    <div class="cat-add">
      <input id="catNuevo_${tipo}" placeholder="Escribe el nombre y agrega…"
             onkeydown="if(event.key==='Enter')catAgregar('${tipo}')">
      <button onclick="catAgregar('${tipo}')">＋ Agregar</button>
    </div>
    ${items.length?`<div class="cat-lista">${items.map(x=>`
      <div class="cat-item">
        <span class="cat-v">${esc(x.valor)}</span>
        <span class="cat-uso">${catEnUso(tipo,x.valor)} en uso</span>
        <button class="cat-x" title="Quitar de la lista" onclick="catEliminar('${tipo}','${x.item_id}')">✕</button>
      </div>`).join('')}</div>`
      :'<div class="cat-vacio">Todavía no hay valores. Agrega el primero.</div>'}
  </div>`;
}

// Cuántas fichas usan hoy ese valor: quitar algo que está en uso deja fichas
// con un valor que ya no se puede elegir, así que conviene verlo antes.
function catEnUso(tipo,valor){
  const v=String(valor||'').toLowerCase();
  if(tipo==='agrupacion') return PROVEEDORES.filter(p=>(p.agrupacion||'').toLowerCase()===v).length;
  return PROVEEDORES.filter(p=>String(p.plataformas||'').toLowerCase()
    .split(/\s*,\s*/).includes(v)).length;
}

async function catAgregar(tipo){
  const inp=document.getElementById('catNuevo_'+tipo);
  const valor=(inp.value||'').trim();
  if(!valor){ showToast('Escribe un nombre','err'); inp.focus(); return; }
  if((CAT_LISTAS[tipo]||[]).some(x=>x.valor.toLowerCase()===valor.toLowerCase())){
    showToast('Ese valor ya está en la lista','err'); return;
  }
  const id='cat_'+tipo.slice(0,4)+'_'+Date.now().toString(36);
  try{
    const {error}=await SUPA.client.from('catalogo_listas').insert({
      item_id:id, tipo:tipo, valor:valor, orden:(CAT_LISTAS[tipo]||[]).length,
      estado_registro:'Activo', created_by:miNombre(), updated_by:miNombre(),
      updated_at:new Date().toISOString()
    });
    if(error) throw error;
    await registrarLog('catalogo_listas', id, 'crear', 'Agregó "'+valor+'" a '+CAT_TIPOS[tipo].titulo);
    await cargarCatalogoListas();
    renderCatalogoListas();
    showToast('✅ Agregado a '+CAT_TIPOS[tipo].titulo,'success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

async function catEliminar(tipo,id){
  const it=(CAT_LISTAS[tipo]||[]).find(x=>x.item_id===id); if(!it) return;
  const uso=catEnUso(tipo,it.valor);
  const aviso=uso?('\n\n'+uso+' ficha'+(uso===1?'':'s')+' lo tiene'+(uso===1?'':'n')+
    ' asignado. No se les quita: quedan con ese valor aunque ya no se pueda elegir.'):'';
  if(!confirm('¿Quitar "'+it.valor+'" de la lista?'+aviso)) return;
  try{
    const {error}=await SUPA.client.from('catalogo_listas')
      .update({estado_registro:'Eliminado',updated_by:miNombre(),updated_at:new Date().toISOString()})
      .eq('item_id',id);
    if(error) throw error;
    await registrarLog('catalogo_listas', id, 'eliminar', 'Quitó "'+it.valor+'" de '+CAT_TIPOS[tipo].titulo);
    await cargarCatalogoListas();
    renderCatalogoListas();
    showToast('🗑 Quitado de la lista','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

// ── Controles para la ficha de edición ──────────────────────────────────────
// Plataformas: varias por proveedor → casillas.
// Agrupación: una sola → lista desplegable.
function catCheckboxesPlataformas(actual){
  const sel=String(actual||'').split(/\s*,\s*/).map(s=>s.trim()).filter(Boolean);
  const opts=catValores('plataforma');
  if(!opts.length){
    return `<div class="cat-sin">Todavía no hay plataformas creadas.
      Se crean en <b>Gestión Interna → 🗂 Listas del directorio</b>.</div>`;
  }
  return `<div class="cat-checks">${opts.map(v=>`
    <label class="cat-check"><input type="checkbox" value="${esc(v)}"
      ${sel.some(s=>s.toLowerCase()===v.toLowerCase())?'checked':''}> ${esc(v)}</label>`).join('')}</div>`;
}
// Lee las casillas marcadas al guardar la ficha.
function catLeerPlataformas(){
  const box=document.getElementById('ef_plataformas_box'); if(!box) return null;
  // Sin lista creada no hay casillas: se devuelve null para no borrar lo que
  // la ficha ya tenía escrito.
  if(!box.querySelector('input[type=checkbox]')) return null;
  return [...box.querySelectorAll('input[type=checkbox]:checked')].map(c=>c.value).join(', ');
}
function catSelectAgrupacion(actual){
  const opts=catValores('agrupacion');
  const cur=String(actual||'');
  // Si la ficha trae un valor que ya no está en la lista, se conserva como
  // opción para no borrarlo sin querer al guardar.
  const extra=(cur && !opts.some(v=>v.toLowerCase()===cur.toLowerCase())) ? [cur] : [];
  return `<select id="ef_agrupacion">
    <option value="">— Sin agrupación —</option>
    ${[...opts,...extra].map(v=>`<option value="${esc(v)}" ${cur===v?'selected':''}>${esc(v)}${
      extra.includes(v)?' (fuera de la lista)':''}</option>`).join('')}
  </select>
  ${opts.length?'':'<div class="cat-sin">No hay agrupaciones creadas. Se crean en <b>Gestión Interna → 🗂 Listas del directorio</b>.</div>'}`;
}
