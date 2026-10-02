// ═══════════════════════════════════════════════════════════════════════════
// movil-formacion.js — Pestaña Formación (catálogo de cursos compartido)
// Sistema AM · Antofagasta Minerals
//
// Vista de nivel superior del móvil (#1, #2, #10). Muestra el catálogo de cursos,
// que es la MISMA tabla `cursos` que usa Empleabilidad: un curso creado aquí
// aparece allá y viceversa (sin duplicar). El admin puede crear/editar (reutiliza
// rcCursoNuevo/rcGuardarCurso de movil-recepcion.js). Debajo, las inscripciones y
// levantamientos recientes (tabla `formaciones`).
//
// Reutiliza globales del Móvil: SB, esc, toast, AMForm, ES_ADMIN, rcCursoNuevo.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo mf/MF.
// ═══════════════════════════════════════════════════════════════════════════

let MF={ cursos:[], form:[], loaded:false, q:'' };

async function mfRender(){
  const cont=document.getElementById('page-formacion'); if(!cont) return;
  if(!MF.loaded){ cont.innerHTML='<div class="card"><div class="rc-nota">Cargando formación…</div></div>'; await mfCargar(); }
  mfPintar();
}
async function mfCargar(){
  try{
    const {data:cur,error}=await SB.from('cursos').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false});
    if(error) throw error; MF.cursos=cur||[];
    try{ const {data:fo}=await SB.from('formaciones').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false}).limit(200); MF.form=fo||[]; }catch(e){ MF.form=[]; }
    MF.loaded=true;
  }catch(e){ MF.cursos=[]; MF.form=[]; MF.loaded=true; toast('Error al cargar formación: '+e.message,'err'); }
}
function mfPintar(){
  const cont=document.getElementById('page-formacion'); if(!cont) return;
  const admin=(typeof ES_ADMIN!=='undefined'&&ES_ADMIN);
  const q=(MF.q||'').toLowerCase();
  const cursos=MF.cursos.filter(c=>!q||[c.nombre,c.institucion,c.area].join(' ').toLowerCase().includes(q));
  cont.innerHTML=`
   <div class="card">
    <div class="sec-t">🎓 Formación · cursos</div>
    <div class="rc-nota">Catálogo <b>compartido</b> con Empleabilidad: lo que se crea o edita aquí aparece allá y viceversa (misma fuente, sin duplicar).</div>
    ${admin?'<div class="btn-row"><button class="btn" onclick="rcCursoNuevo()">➕ Crear curso</button></div>':''}
    <input class="search" placeholder="🔍 Buscar curso" value="${esc(MF.q||'')}" oninput="MF.q=this.value;mfPintar()">
    <div class="mf-list">${cursos.length?cursos.map(mfCursoCard).join(''):'<div class="rc-nota">Sin cursos cargados.</div>'}</div>
   </div>
   <div class="card">
    <div class="sec-t">📋 Inscripciones y levantamientos recientes</div>
    ${MF.form.length?('<div class="mf-forms">'+MF.form.slice(0,60).map(mfFormRow).join('')+'</div>'):'<div class="rc-nota">Sin registros aún.</div>'}
   </div>`;
}
function mfCursoCard(c){
  const admin=(typeof ES_ADMIN!=='undefined'&&ES_ADMIN);
  const det=[c.area, c.duracion&&('Duración: '+c.duracion), c.cupos&&(c.cupos+' cupos'),
    c.fecha_inicio&&('Inicio: '+String(c.fecha_inicio).slice(0,10)), c.ruta==='eecc'?'EECC':'AMSA'].filter(Boolean);
  return `<div class="rc-vac-wrap"><div class="rc-vac">
    <div><div class="rc-vac-cargo">${esc(c.nombre||'Curso')}</div>
      <div class="rc-vac-emp">${esc(c.institucion||'')}${c.modalidad?' · '+esc(c.modalidad):''}${c.estado?' · '+esc(c.estado):''}</div></div>
    <div class="rc-vac-btns">${admin?`<button class="btn gray" onclick="rcCursoNuevo('${c.curso_id}')">✏ Editar</button>`:''}</div>
    </div>
    ${det.length?`<div class="rc-vac-meta">${det.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
    ${c.descripcion?`<div class="rc-nota" style="margin:6px 0 0">${esc(c.descripcion)}</div>`:''}
  </div>`;
}
function mfFormRow(f){
  const fecha=f.created_at?((typeof AMForm!=='undefined')?AMForm.fmtFechaDMY(String(f.created_at).slice(0,10)):String(f.created_at).slice(0,10)):'';
  return `<div class="mf-form-row"><div><b>${esc(f.nombre||f.rut||'—')}</b> · ${esc(f.tipo||'Inscripción')}</div>
    <div class="rc-nota" style="margin:0">${esc(fecha)}${f.comuna?(' · '+esc(f.comuna)):''}${f.registrado_por?(' · '+esc((f.registrado_por||'').split('@')[0])):''}</div></div>`;
}
// Para refrescar la lista cuando cambia el catálogo (realtime o alta local).
function mfInvalidar(){ MF.loaded=false; const pf=document.getElementById('page-formacion'); if(pf&&pf.classList.contains('active')) mfRender(); }
