// ═══════════════════════════════════════════════════════════════════════════
// movil-operativo.js — Operativo de la jornada (Fase 5)
// Sistema AM · Antofagasta Minerals
//
// Al iniciar la jornada, el ejecutivo marca la posición del móvil (GPS del
// teléfono; si no se puede, se ubica por comuna). Todas las atenciones que
// registre mientras el operativo esté activo quedan ligadas a ese punto
// (atenciones.operativo_id), y alimentan el dashboard con mapa de Empleabilidad.
// La coordenada se guarda SOLO en Supabase (no va a terceros — Reglas 5 y 6).
//
// Reutiliza globales del Móvil: SB, toast, miNombre, esc, imModal/imCerrar.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo op/OP.
// ═══════════════════════════════════════════════════════════════════════════

let ACTIVE_OP = null;
const OP_COMUNAS = ['Antofagasta','Mejillones','Sierra Gorda','Taltal','Calama','Ollagüe','San Pedro de Atacama','Tocopilla','María Elena'];
// Centroides aprox. por comuna (fallback si el GPS no está disponible) [lng,lat].
const OP_CENTRO = {
  'Antofagasta':[-70.3975,-23.6524],'Mejillones':[-70.4506,-23.0997],'Sierra Gorda':[-69.3202,-22.8915],
  'Taltal':[-70.4787,-25.4062],'Calama':[-68.9294,-22.4547],'Ollagüe':[-68.2586,-21.2256],
  'San Pedro de Atacama':[-68.1997,-22.9087],'Tocopilla':[-70.1979,-22.0920],'María Elena':[-69.6698,-22.3479]
};

async function opBootstrap(){
  try{
    const {data}=await SB.from('operativos').select('*')
      .eq('created_by',miNombre()).eq('estado','activo')
      .order('created_at',{ascending:false}).limit(1);
    ACTIVE_OP=(data&&data[0])||null;
  }catch(e){ ACTIVE_OP=null; }
  opRender();
}
function opRender(){
  const el=document.getElementById('rcOperativo'); if(!el) return;
  if(ACTIVE_OP){
    const coord=(ACTIVE_OP.lat!=null&&ACTIVE_OP.lng!=null)?(ACTIVE_OP.lat.toFixed(4)+', '+ACTIVE_OP.lng.toFixed(4)):'sin coordenadas';
    el.innerHTML=`<div class="op-bar on">
      <div class="op-info">📍 <b>Operativo activo</b>${ACTIVE_OP.lugar?(' · '+esc(ACTIVE_OP.lugar)):''}${ACTIVE_OP.comuna?(' · '+esc(ACTIVE_OP.comuna)):''}
        <span class="op-coord">${coord}</span></div>
      <button class="btn gray" onclick="opCerrar()">Cerrar operativo</button></div>`;
  }else{
    el.innerHTML=`<div class="op-bar">
      <div class="op-info">Sin operativo activo. Inícialo para ubicar en el mapa las atenciones de hoy.</div>
      <button class="btn" onclick="opIniciar()">📍 Iniciar operativo</button></div>`;
  }
}
function opIniciar(){
  if(typeof imModal!=='function'){ toast('No se pudo abrir','err'); return; }
  imModal(`<h3>📍 Iniciar operativo</h3>
    <div class="rc-nota">Marca dónde está el móvil hoy. Se usa el GPS del teléfono; si no se puede, se ubica por el centro de la comuna (puedes ajustarlo después).</div>
    <div class="fld"><label>Lugar / referencia</label><input id="opLugar" placeholder="Plaza, feria, sede vecinal…"></div>
    <div class="fld"><label>Comuna</label><select id="opComuna">${OP_COMUNAS.map(c=>`<option>${c}</option>`).join('')}</select></div>
    <div class="btn-row" style="justify-content:flex-end;margin-top:10px">
      <button class="btn gray" onclick="imCerrar()">Cancelar</button>
      <button class="btn" onclick="opCrear()">📍 Usar mi ubicación e iniciar</button></div>`);
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
async function opCrear(){
  const lugar=(document.getElementById('opLugar')||{}).value||'';
  const comuna=(document.getElementById('opComuna')||{}).value||'';
  toast('Obteniendo ubicación…');
  const coord=await opGPS(comuna);
  try{
    const id='op_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const {data,error}=await SB.from('operativos').insert({
      operativo_id:id, lugar:lugar.trim()||null, comuna:comuna||null,
      lng:coord[0], lat:coord[1], estado:'activo', created_by:miNombre()
    }).select('*').single();
    if(error) throw error;
    ACTIVE_OP=data; imCerrar(); opRender(); toast('✅ Operativo iniciado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function opCerrar(){
  if(!ACTIVE_OP) return;
  if(!confirm('¿Cerrar el operativo actual? Las próximas atenciones ya no se ligarán a este punto.')) return;
  try{ await SB.from('operativos').update({estado:'cerrado',cerrado_at:new Date().toISOString()}).eq('operativo_id',ACTIVE_OP.operativo_id); }catch(e){}
  ACTIVE_OP=null; opRender(); toast('Operativo cerrado','ok');
}
// Id del operativo activo (para ligar la atención). null si no hay.
function opActivoId(){ return (ACTIVE_OP&&ACTIVE_OP.operativo_id)||null; }
