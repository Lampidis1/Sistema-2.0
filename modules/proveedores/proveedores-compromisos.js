// ═══════════════════════════════════════════════════════════════════════════
// proveedores-compromisos.js — Dashboard de Compromisos
// Sistema AM · Antofagasta Minerals
//
// P-8 (docs/PENDIENTES.md), segundo corte: se extrajo SOLO el subconjunto
// realmente autocontenido del bloque "DASHBOARD DE COMPROMISOS" original.
// Tres funciones que vivían físicamente ahí adentro NO se movieron porque
// las usa el sistema de visitas activo (montarVisitasV3) o el módulo de
// hotelería, y quedaron en proveedores.js: abrirCorreoMinuta() (además,
// resultó ser código muerto, sin ningún llamador — ver PENDIENTES.md),
// badgeOrigenVisita() y editarContrato().
//
// Depende de globals declaradas en proveedores.js (SUPA, showToast,
// registrarLog, miNombre, esc, DB, PROVEEDORES, dispName) — por eso se
// carga DESPUÉS de proveedores.js en index.html, como <script src>
// clásico. Nunca type="module": los onclick del HTML necesitan que estas
// funciones sean globales. Ver CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

// Cuenta regresiva + seguimiento/llamadas (v7.0).
let COMPROMISOS_CACHE=[];

async function renderCompromisosDash(){
  const cont=document.getElementById('compromisosContent');
  if(!cont) return;
  cont.innerHTML='<div class="kb-empty">Cargando compromisos…</div>';
  try{
    // Traer compromisos + su visita (para título/proveedor)
    const {data:comps,error}=await SUPA.client.from('visita_compromisos').select('*');
    if(error) throw error;
    const {data:visitas}=await SUPA.client.from('visitas').select('visita_id,titulo,proveedor_id,fecha,responsable_nombre').neq('estado_registro','Eliminado');
    const vmap={}; (visitas||[]).forEach(v=>vmap[v.visita_id]=v);
    // map proveedor_id -> nombre
    const provName={}; PROVEEDORES.forEach(p=>{ provName[p._proveedorId||p._id]=dispName(p); });
    COMPROMISOS_CACHE=(comps||[]).filter(c=>vmap[c.visita_id]).map(c=>{
      const v=vmap[c.visita_id];
      return {...c, _visitaTitulo:v.titulo, _proveedor:provName[v.proveedor_id]||v.proveedor_id, _visitaFecha:v.fecha, _responsableAM:v.responsable_nombre};
    });
    pintarCompromisos();
  }catch(e){ cont.innerHTML='<div class="kb-empty">Error: '+esc(e.message)+'</div>'; }
}

function diasRestantesComp(fecha){
  if(!fecha) return null;
  const hoy=new Date(); hoy.setHours(0,0,0,0);
  const f=new Date(fecha+'T00:00:00');
  return Math.round((f-hoy)/86400000);
}

function pintarCompromisos(){
  const cont=document.getElementById('compromisosContent');
  const filtro=document.getElementById('compFiltro')?.value||'abiertos';
  let lista=COMPROMISOS_CACHE.slice();
  if(filtro==='abiertos') lista=lista.filter(c=>c.estado!=='cumplido');
  else if(filtro==='cumplidos') lista=lista.filter(c=>c.estado==='cumplido');
  else if(filtro==='vencidos') lista=lista.filter(c=>c.estado!=='cumplido' && c.fecha_limite && diasRestantesComp(c.fecha_limite)<0);
  // ordenar por urgencia (menos días primero)
  lista.sort((a,b)=>{
    const da=a.fecha_limite?diasRestantesComp(a.fecha_limite):9999;
    const db=b.fecha_limite?diasRestantesComp(b.fecha_limite):9999;
    return da-db;
  });
  const pend=COMPROMISOS_CACHE.filter(c=>c.estado!=='cumplido').length;
  const badge=document.getElementById('badgeCompromisos'); if(badge){ badge.textContent=pend; badge.style.display=pend>0?'inline-block':'none'; }

  if(!lista.length){ cont.innerHTML='<div class="kb-empty">No hay compromisos para este filtro.</div>'; return; }

  cont.innerHTML=lista.map(c=>{
    const d=c.fecha_limite?diasRestantesComp(c.fecha_limite):null;
    let estadoTxt, color, bg;
    if(c.estado==='cumplido'){ estadoTxt='✓ Cumplido'; color='#0f7a3d'; bg='#E4F6EF'; }
    else if(d===null){ estadoTxt='Sin fecha'; color='#5F6973'; bg='#eef2f3'; }
    else if(d<0){ estadoTxt='Vencido hace '+Math.abs(d)+'d'; color='#c0311b'; bg='#fdecea'; }
    else if(d===0){ estadoTxt='Vence HOY'; color='#b8780a'; bg='#FFF3DF'; }
    else if(d<=7){ estadoTxt='Faltan '+d+'d'; color='#b8780a'; bg='#FFF3DF'; }
    else { estadoTxt='Faltan '+d+'d'; color='#0f7a3d'; bg='#E4F6EF'; }
    return `<div style="background:#fff;border:1px solid var(--border);border-left:4px solid ${color};border-radius:11px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div style="flex:1;min-width:200px">
          <div style="font-weight:700;font-size:.96rem">${esc(c.descripcion||'(sin descripción)')}</div>
          <div style="font-size:.8rem;color:var(--text-muted);margin-top:3px">🏢 ${esc(c._proveedor)} · 📋 ${esc(c._visitaTitulo||'')}</div>
          <div style="font-size:.78rem;color:var(--text-muted)">👤 ${esc(c.responsable||'—')}${c.fecha_limite?' · 📅 vence '+esc(c.fecha_limite):''}</div>
        </div>
        <span style="background:${bg};color:${color};border-radius:6px;padding:4px 11px;font-size:.78rem;font-weight:700;white-space:nowrap">${estadoTxt}</span>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:11px">
        ${c.estado!=='cumplido'?`<button class="mini-btn" style="width:auto;padding:5px 11px" onclick="abrirLlamada('${c.compromiso_id}')">📞 Registrar llamada / prórroga</button>`:''}
        ${c.estado!=='cumplido'?`<button class="mini-btn" style="width:auto;padding:5px 11px;color:#0f7a3d;border-color:#9ad9b8" onclick="marcarCumplido('${c.compromiso_id}')">✓ Marcar cumplido</button>`:`<button class="mini-btn" style="width:auto;padding:5px 11px" onclick="reabrirCompromiso('${c.compromiso_id}')">↺ Reabrir</button>`}
        <button class="mini-btn" style="width:auto;padding:5px 11px" onclick="verSeguimiento('${c.compromiso_id}')">🕘 Historial</button>
      </div>
      <div id="seg_${c.compromiso_id}" style="display:none;margin-top:10px;border-top:1px dashed var(--border);padding-top:10px"></div>
    </div>`;
  }).join('');
}

async function marcarCumplido(cid){
  try{
    await SUPA.client.from('visita_compromisos').update({estado:'cumplido',cerrado:true}).eq('compromiso_id',cid);
    const c=COMPROMISOS_CACHE.find(x=>x.compromiso_id===cid); if(c){ c.estado='cumplido'; c.cerrado=true; }
    pintarCompromisos();
    showToast('✓ Compromiso cumplido','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}
async function reabrirCompromiso(cid){
  try{
    await SUPA.client.from('visita_compromisos').update({estado:'abierto',cerrado:false}).eq('compromiso_id',cid);
    const c=COMPROMISOS_CACHE.find(x=>x.compromiso_id===cid); if(c){ c.estado='abierto'; c.cerrado=false; }
    pintarCompromisos();
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

// ── Registrar llamada + prórroga (sumar días o fecha nueva) ──
let LLAMADA_CID=null;
function abrirLlamada(cid){
  LLAMADA_CID=cid;
  const c=COMPROMISOS_CACHE.find(x=>x.compromiso_id===cid);
  document.getElementById('llamCompDesc').textContent=c?c.descripcion:'';
  document.getElementById('llamFechaActual').textContent=c&&c.fecha_limite?('Vence actualmente: '+c.fecha_limite):'Sin fecha límite definida';
  document.getElementById('llamTelefono').value='';
  document.getElementById('llamDetalle').value='';
  document.getElementById('llamModo').value='dias';
  document.getElementById('llamDias').value='7';
  document.getElementById('llamFechaNueva').value='';
  llamModoChange();
  document.getElementById('llamadaModal').style.display='flex';
}
function cerrarLlamada(){ document.getElementById('llamadaModal').style.display='none'; LLAMADA_CID=null; }
function llamModoChange(){
  const m=document.getElementById('llamModo').value;
  document.getElementById('llamDiasBox').style.display = m==='dias'?'block':'none';
  document.getElementById('llamFechaBox').style.display = m==='fecha'?'block':'none';
}

async function guardarLlamada(){
  const cid=LLAMADA_CID; if(!cid) return;
  const c=COMPROMISOS_CACHE.find(x=>x.compromiso_id===cid); if(!c) return;
  const tel=document.getElementById('llamTelefono').value.trim();
  const detalle=document.getElementById('llamDetalle').value.trim();
  const modo=document.getElementById('llamModo').value;
  const fechaAnterior=c.fecha_limite||'';
  let fechaNueva=fechaAnterior;
  if(modo==='dias'){
    const dias=parseInt(document.getElementById('llamDias').value)||0;
    const base=fechaAnterior?new Date(fechaAnterior+'T00:00:00'):new Date();
    base.setDate(base.getDate()+dias);
    fechaNueva=base.toISOString().slice(0,10);
  } else if(modo==='fecha'){
    fechaNueva=document.getElementById('llamFechaNueva').value;
    if(!fechaNueva){ showToast('Elige la nueva fecha','err'); return; }
  } else { fechaNueva=fechaAnterior; }
  try{
    // registrar seguimiento
    await SUPA.client.from('compromiso_seguimiento').insert({
      seg_id:'seg_'+Date.now().toString(36), compromiso_id:cid, visita_id:c.visita_id,
      tipo: modo==='nota'?'nota':'llamada', telefono:tel, detalle:detalle,
      fecha_anterior:fechaAnterior, fecha_nueva: modo==='nota'?null:fechaNueva, creado_por:miNombre()
    });
    // actualizar fecha límite si cambió
    if(modo!=='nota' && fechaNueva!==fechaAnterior){
      await SUPA.client.from('visita_compromisos').update({fecha_limite:fechaNueva}).eq('compromiso_id',cid);
      c.fecha_limite=fechaNueva;
    }
    await registrarLog('compromiso',cid,'seguimiento','Llamada/prórroga'+(fechaNueva!==fechaAnterior?(' → nuevo plazo '+fechaNueva):''));
    cerrarLlamada(); pintarCompromisos();
    showToast('📞 Seguimiento registrado','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

async function verSeguimiento(cid){
  const box=document.getElementById('seg_'+cid);
  if(!box) return;
  if(box.style.display==='block'){ box.style.display='none'; return; }
  box.style.display='block';
  box.innerHTML='<div style="font-size:.8rem;color:var(--text-muted)">Cargando historial…</div>';
  try{
    const {data}=await SUPA.client.from('compromiso_seguimiento').select('*').eq('compromiso_id',cid).order('creado_en',{ascending:false});
    if(!data||!data.length){ box.innerHTML='<div style="font-size:.8rem;color:var(--text-muted)">Sin seguimientos registrados.</div>'; return; }
    box.innerHTML=data.map(s=>`<div style="font-size:.8rem;padding:6px 0;border-bottom:1px solid var(--border)">
      <b>${s.tipo==='llamada'?'📞 Llamada':(s.tipo==='prorroga'?'⏩ Prórroga':'📝 Nota')}</b> · ${esc((s.creado_en||'').slice(0,10))} · ${esc(s.creado_por||'')}
      ${s.telefono?'<br>☎ '+esc(s.telefono):''}
      ${s.detalle?'<br>'+esc(s.detalle):''}
      ${s.fecha_nueva&&s.fecha_nueva!==s.fecha_anterior?`<br><span style="color:#b8780a">📅 ${esc(s.fecha_anterior||'sin fecha')} → ${esc(s.fecha_nueva)}</span>`:''}
    </div>`).join('');
  }catch(e){ box.innerHTML='<div style="font-size:.8rem;color:#c0311b">Error: '+esc(e.message)+'</div>'; }
}
