// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-operativos.js — Configuración de operativos del móvil (#17)
// Sistema AM · Antofagasta Minerals
//
// Desde Empleabilidad se PROGRAMAN los operativos (nombre, fecha, hora inicio/
// término, zona/comuna, responsable, estado). En el móvil, el ejecutivo los
// activa; a la hora de término se cierran solos (server-side: pg_cron + trigger).
// Estados: Programado → Activo → Finalizado (Activo→Finalizado automático).
//
// Reutiliza globales de Empleabilidad: SB, esc, toast, miNombre, AMForm.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo opc/OPC.
// ═══════════════════════════════════════════════════════════════════════════

let OPC={ list:[], loaded:false };
const OPC_COMUNAS=['Antofagasta','Mejillones','Sierra Gorda','Taltal','Calama','Ollagüe','San Pedro de Atacama','Tocopilla','María Elena'];
const OPC_CENTRO={
  'Antofagasta':[-70.3975,-23.6524],'Mejillones':[-70.4506,-23.0997],'Sierra Gorda':[-69.3202,-22.8915],
  'Taltal':[-70.4787,-25.4062],'Calama':[-68.9294,-22.4547],'Ollagüe':[-68.2586,-21.2256],
  'San Pedro de Atacama':[-68.1997,-22.9087],'Tocopilla':[-70.1979,-22.0920],'María Elena':[-69.6698,-22.3479]
};

async function opcRender(){
  const cont=document.getElementById('page-operativos'); if(!cont) return;
  if(!OPC.loaded){ cont.innerHTML='<div class="op-cfg"><div class="muted">Cargando operativos…</div></div>'; await opcCargar(); }
  opcPintar();
}
async function opcCargar(){
  try{ await SB.rpc('operativos_cerrar_vencidos'); }catch(e){}   // Activo→Finalizado automático al cargar
  try{
    const {data,error}=await SB.from('operativos').select('*').order('fecha',{ascending:false}).order('created_at',{ascending:false}).limit(300);
    if(error) throw error; OPC.list=data||[]; OPC.loaded=true;
  }catch(e){ OPC.list=[]; OPC.loaded=true; toast('Error al cargar operativos: '+e.message,'err'); }
}
function opcEstado(o){ if(o.estado==='finalizado'||o.estado==='cerrado') return 'finalizado'; if(o.estado==='activo') return 'activo'; return 'programado'; }
function opcPintar(){
  const cont=document.getElementById('page-operativos'); if(!cont) return;
  const rows=OPC.list.map(opcRow).join('');
  cont.innerHTML=`
   <div class="op-cfg">
    <div class="op-cfg-head">
      <div class="op-cfg-title">📍 Operativos del móvil</div>
      <button class="btn" onclick="opcForm()">➕ Programar operativo</button>
    </div>
    <div class="muted" style="margin-bottom:10px">Programa los operativos (nombre, fecha, horario, zona, responsable). En el móvil, el ejecutivo los activa; a la <b>hora de término</b> se cierran solos.</div>
    <div id="opcFormBox"></div>
    <div class="op-tbl-wrap"><table class="op-tbl">
      <thead><tr><th>Operativo</th><th>Fecha</th><th>Horario</th><th>Zona</th><th>Responsable</th><th>Estado</th><th></th></tr></thead>
      <tbody>${rows||'<tr><td colspan="7" class="muted" style="text-align:center;padding:16px">Sin operativos programados aún.</td></tr>'}</tbody>
    </table></div>
   </div>`;
}
function opcRow(o){
  const est=opcEstado(o);
  const hor=[String(o.hora_inicio||'').slice(0,5),String(o.hora_termino||'').slice(0,5)].filter(Boolean).join('–');
  const fecha=o.fecha?((typeof AMForm!=='undefined')?AMForm.fmtFechaDMY(String(o.fecha).slice(0,10)):String(o.fecha).slice(0,10)):'';
  return `<tr>
    <td><b>${esc(o.nombre||o.lugar||'—')}</b></td>
    <td>${esc(fecha)}</td><td>${esc(hor||'—')}</td>
    <td>${esc(o.comuna||'')}${(o.lugar&&o.lugar!==o.nombre)?(' · '+esc(o.lugar)):''}</td>
    <td>${esc(o.responsable||'—')}</td>
    <td><span class="op-badge ${est}">${est}</span></td>
    <td class="op-acc">
      ${est!=='finalizado'?`<button class="btn gray" onclick="opcForm('${o.operativo_id}')">✏</button>`:''}
      ${est!=='finalizado'?`<button class="btn gray" onclick="opcFinalizar('${o.operativo_id}')">Finalizar</button>`:''}
    </td></tr>`;
}
function opcForm(id){
  const o=id?OPC.list.find(x=>x.operativo_id===id):{} ; if(id&&!o) return;
  const box=document.getElementById('opcFormBox'); if(!box) return;
  const lugarExtra=(o.lugar&&o.lugar!==o.nombre)?o.lugar:'';
  box.innerHTML=`<div class="op-form">
    <div class="grid2">
      <div class="fld"><label>Nombre / referencia *</label><input id="opcNombre" value="${esc(o.nombre||o.lugar||'')}"></div>
      <div class="fld"><label>Responsable / equipo</label><input id="opcResp" value="${esc(o.responsable||'')}"></div>
    </div>
    <div class="grid2">
      <div class="fld"><label>Comuna / zona</label><select id="opcComuna">${OPC_COMUNAS.map(c=>`<option ${o.comuna===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
      <div class="fld"><label>Lugar (opcional)</label><input id="opcLugar" value="${esc(lugarExtra)}" placeholder="Plaza, sede vecinal…"></div>
    </div>
    <div class="grid3">
      <div class="fld"><label>Fecha *</label><input id="opcFecha" type="date" value="${esc(String(o.fecha||'').slice(0,10))}"></div>
      <div class="fld"><label>Hora inicio</label><input id="opcIni" type="time" value="${esc(String(o.hora_inicio||'').slice(0,5))}"></div>
      <div class="fld"><label>Hora término *</label><input id="opcFin" type="time" value="${esc(String(o.hora_termino||'').slice(0,5))}"></div>
    </div>
    <div class="btn-row">
      <button class="btn" onclick="opcGuardar('${id||''}')">💾 Guardar</button>
      <button class="btn gray" onclick="document.getElementById('opcFormBox').innerHTML=''">Cancelar</button>
    </div>
  </div>`;
}
async function opcGuardar(id){
  const g=i=>{const e=document.getElementById(i);return e?e.value.trim():'';};
  const nombre=g('opcNombre'), fecha=g('opcFecha'), fin=g('opcFin');
  if(!nombre){ toast('El nombre es obligatorio','err'); return; }
  if(!fecha){ toast('La fecha es obligatoria','err'); return; }
  if(!fin){ toast('La hora de término es obligatoria (para el cierre automático)','err'); return; }
  const comuna=(document.getElementById('opcComuna')||{}).value||'';
  const centro=OPC_CENTRO[comuna]||[-70.3975,-23.6524];
  const fila={ nombre, lugar:g('opcLugar')||nombre, comuna:comuna||null, responsable:g('opcResp')||null,
    fecha, hora_inicio:g('opcIni')||null, hora_termino:fin, lng:centro[0], lat:centro[1] };
  try{
    if(id){ const {error}=await SB.from('operativos').update(fila).eq('operativo_id',id); if(error) throw error; }
    else{ fila.operativo_id='op_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5); fila.estado='programado'; fila.created_by=miNombre(); const {error}=await SB.from('operativos').insert(fila); if(error) throw error; }
    toast('✅ Operativo guardado','ok');
    const box=document.getElementById('opcFormBox'); if(box) box.innerHTML='';
    OPC.loaded=false; await opcCargar(); opcPintar();
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function opcFinalizar(id){
  if(!confirm('¿Finalizar este operativo? No recibirá más atenciones.')) return;
  try{ const {error}=await SB.from('operativos').update({estado:'finalizado',cerrado_at:new Date().toISOString()}).eq('operativo_id',id); if(error) throw error;
    toast('Operativo finalizado','ok'); OPC.loaded=false; await opcCargar(); opcPintar();
  }catch(e){ toast('Error: '+e.message,'err'); }
}
