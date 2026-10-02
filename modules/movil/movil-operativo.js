// ═══════════════════════════════════════════════════════════════════════════
// movil-operativo.js — Operativo de la jornada (programado + cierre automático)
// Sistema AM · Antofagasta Minerals
//
// El operativo se CONFIGURA desde Empleabilidad (nombre, fecha, hora inicio/
// término, ubicación, responsable). En el móvil, el ejecutivo ACTIVA el operativo
// del día (puede ser después de la hora de inicio; el inicio real = el momento de
// activar). A la hora de término se cierra SOLO en el servidor (RPC
// operativos_cerrar_vencidos + pg_cron cada 5 min + trigger en atenciones), no
// depende de que el navegador quede abierto (#16, #17).
//
// También hay un "operativo rápido" (crea y activa en el acto) con hora de término
// OBLIGATORIA, para que igual se cierre solo.
//
// La coordenada vive SOLO en Supabase (Reglas 5 y 6). Reutiliza globales del
// Móvil: SB, toast, miNombre, esc, imModal/imCerrar. Prefijo op/OP.
// ═══════════════════════════════════════════════════════════════════════════

let ACTIVE_OP = null;     // operativo activo de hoy
let OP_HOY = [];          // operativos de hoy no finalizados (activo + programados)
const OP_COMUNAS = ['Antofagasta','Mejillones','Sierra Gorda','Taltal','Calama','Ollagüe','San Pedro de Atacama','Tocopilla','María Elena'];
// Centroides aprox. por comuna (fallback si el GPS no está disponible) [lng,lat].
const OP_CENTRO = {
  'Antofagasta':[-70.3975,-23.6524],'Mejillones':[-70.4506,-23.0997],'Sierra Gorda':[-69.3202,-22.8915],
  'Taltal':[-70.4787,-25.4062],'Calama':[-68.9294,-22.4547],'Ollagüe':[-68.2586,-21.2256],
  'San Pedro de Atacama':[-68.1997,-22.9087],'Tocopilla':[-70.1979,-22.0920],'María Elena':[-69.6698,-22.3479]
};

function _opHoyISO(){ return new Date().toISOString().slice(0,10); }
function _opHHMM(t){ return t?String(t).slice(0,5):''; }
// Vencido en el navegador (aproximación visual; el servidor es la autoridad).
function _opVencido(o){
  if(!o || !o.hora_termino) return false;
  const d=new Date(String(o.fecha)+'T'+String(o.hora_termino));
  return !isNaN(d) && d.getTime()<=Date.now();
}

async function opBootstrap(){
  try{ await SB.rpc('operativos_cerrar_vencidos'); }catch(e){}   // cierre server-side al cargar
  try{
    const {data}=await SB.from('operativos').select('*')
      .eq('fecha',_opHoyISO()).not('estado','in','("finalizado","cerrado")')
      .order('created_at',{ascending:false});
    OP_HOY=(data||[]).filter(o=>!_opVencido(o));
    ACTIVE_OP=OP_HOY.find(o=>o.estado==='activo')||null;
  }catch(e){ OP_HOY=[]; ACTIVE_OP=null; }
  opRender();
}
function opRender(){
  const el=document.getElementById('rcOperativo'); if(!el) return;
  let h='';
  if(ACTIVE_OP){
    const o=ACTIVE_OP;
    const hasta=o.hora_termino?('hasta '+_opHHMM(o.hora_termino)):'';
    const coord=(o.lat!=null&&o.lng!=null)?(Number(o.lat).toFixed(4)+', '+Number(o.lng).toFixed(4)):'';
    h+=`<div class="op-bar on">
      <div class="op-info">📍 <b>Operativo activo</b>${(o.nombre||o.lugar)?(' · '+esc(o.nombre||o.lugar)):''}${o.comuna?(' · '+esc(o.comuna)):''}
        ${hasta?`<span class="op-coord">⏱ ${esc(hasta)}</span>`:''}${coord?`<span class="op-coord">${coord}</span>`:''}</div>
      <button class="btn gray" onclick="opCerrar()">Cerrar operativo</button></div>`;
  }
  const prog=(OP_HOY||[]).filter(o=>o.estado!=='activo');
  if(!ACTIVE_OP && prog.length){
    h+=`<div class="op-bar"><div class="op-info">📅 Operativos programados para hoy — actívalos para ligar las atenciones:</div></div>`;
    h+=prog.map(o=>{
      const horario=[_opHHMM(o.hora_inicio),_opHHMM(o.hora_termino)].filter(Boolean).join('–');
      return `<div class="op-prog"><div class="op-info">📌 <b>${esc(o.nombre||o.lugar||'Operativo')}</b>${o.comuna?(' · '+esc(o.comuna)):''}${horario?(' · '+esc(horario)):''}${o.responsable?(' · '+esc(o.responsable)):''}</div>
        <button class="btn" onclick="opActivar('${o.operativo_id}')">Activar</button></div>`; }).join('');
  }
  if(!ACTIVE_OP){
    h+=`<div class="op-bar"><div class="op-info">${prog.length?'O crea uno rápido para hoy:':'Sin operativos programados para hoy. Puedes crear uno rápido:'}</div>
      <button class="btn" onclick="opIniciar()">📍 Operativo rápido</button></div>`;
  }
  el.innerHTML=h;
}
function opGPS(comuna){
  return new Promise(res=>{
    const fb=OP_CENTRO[comuna]||[-70.3975,-23.6524];
    if(!navigator.geolocation) return res(fb);
    navigator.geolocation.getCurrentPosition(
      p=>res([p.coords.longitude,p.coords.latitude]),
      ()=>res(fb),
      {enableHighAccuracy:true,timeout:8000,maximumAge:60000});
  });
}
function _opErr(code){
  return ({finalizado:'Ese operativo ya está finalizado',vencido:'Ese operativo ya pasó su hora de término',
    sin_acceso:'Sin permiso para activar',no_existe:'El operativo ya no existe'})[code]||('No se pudo activar ('+code+')');
}
async function opActivar(id){
  const o=(OP_HOY||[]).find(x=>x.operativo_id===id);
  toast('Activando operativo…');
  let coord=null; try{ coord=await opGPS((o&&o.comuna)||''); }catch(e){}
  try{
    const {data,error}=await SB.rpc('operativo_activar',{p_id:id});
    if(error) throw error;
    if(data && data.error){ toast(_opErr(data.error),'err'); return opBootstrap(); }
    if(coord){ try{ await SB.from('operativos').update({lng:coord[0],lat:coord[1]}).eq('operativo_id',id); }catch(e){} }
    toast('✅ Operativo activado','ok'); opBootstrap();
  }catch(e){ toast('Error: '+e.message,'err'); }
}
// Operativo rápido: crea y activa en el acto. Hora de término OBLIGATORIA.
function opIniciar(){
  if(typeof imModal!=='function'){ toast('No se pudo abrir','err'); return; }
  imModal(`<h3>📍 Operativo rápido</h3>
    <div class="rc-nota">Crea y activa un operativo para hoy. La <b>hora de término es obligatoria</b>: a esa hora se cierra solo.</div>
    <div class="fld"><label>Nombre / referencia</label><input id="opNombre" placeholder="Feria, sede vecinal, plaza…"></div>
    <div class="fld"><label>Comuna</label><select id="opComuna">${OP_COMUNAS.map(c=>`<option>${c}</option>`).join('')}</select></div>
    <div class="g2">
      <div class="fld"><label>Hora de término *</label><input id="opTermino" type="time"></div>
      <div class="fld"><label>Responsable</label><input id="opResp" value="${esc((typeof miNombre==='function'&&miNombre())||'')}"></div>
    </div>
    <div class="btn-row" style="justify-content:flex-end;margin-top:10px">
      <button class="btn gray" onclick="imCerrar()">Cancelar</button>
      <button class="btn" onclick="opCrear()">📍 Usar mi ubicación e iniciar</button></div>`);
}
async function opCrear(){
  const g=i=>{const e=document.getElementById(i);return e?e.value.trim():'';};
  const nombre=g('opNombre'), comuna=(document.getElementById('opComuna')||{}).value||'', termino=g('opTermino'), resp=g('opResp');
  if(!termino){ toast('La hora de término es obligatoria','err'); return; }
  toast('Obteniendo ubicación…');
  const coord=await opGPS(comuna);
  try{
    const id='op_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const ahora=new Date();
    const hhmm=String(ahora.getHours()).padStart(2,'0')+':'+String(ahora.getMinutes()).padStart(2,'0');
    const {data,error}=await SB.from('operativos').insert({
      operativo_id:id, nombre:nombre||null, lugar:nombre||null, comuna:comuna||null,
      lng:coord[0], lat:coord[1], fecha:_opHoyISO(),
      hora_inicio:hhmm, hora_termino:termino, inicio_real:ahora.toISOString(),
      estado:'activo', responsable:resp||null, created_by:miNombre()
    }).select('*').single();
    if(error) throw error;
    ACTIVE_OP=data; imCerrar(); opBootstrap(); toast('✅ Operativo iniciado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function opCerrar(){
  if(!ACTIVE_OP) return;
  if(!confirm('¿Cerrar el operativo actual? Las próximas atenciones ya no se ligarán a este punto.')) return;
  try{ await SB.from('operativos').update({estado:'finalizado',cerrado_at:new Date().toISOString()}).eq('operativo_id',ACTIVE_OP.operativo_id); }catch(e){}
  ACTIVE_OP=null; opBootstrap(); toast('Operativo cerrado','ok');
}
// Id del operativo activo (para ligar la atención). null si no hay.
function opActivoId(){ return (ACTIVE_OP&&ACTIVE_OP.operativo_id)||null; }
