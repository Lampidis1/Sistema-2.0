// ═══════════════════════════════════════════════════════════════════════════
// gestion-vacante.js — Portal PÚBLICO de la empresa (EECC) por token
// Sistema AM · Antofagasta Minerals
//
// Sin login: la empresa recibe un link ?t=<token>. Con el token, la función
// SECURITY DEFINER gestion_vacante_publico(token, clave) devuelve la vacante y
// sus candidatos derivados. Si el link tiene CLAVE de visualización, primero se
// pide y se verifica server-side (nunca viaja el hash). La empresa marca estado
// y seguimiento por candidato (gestion_vacante_seguimiento), descarga el CV de
// cada uno, exporta el listado a Excel y puede bajar todos los CV. El token es
// un UUID aleatorio (Regla 5). <script src> clásico (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const TOKEN=new URLSearchParams(location.search).get('t')||'';
let SB=null, DATA=null, CLAVE='';
const ESTADOS=['registrada','en evaluación','contratado','rechazado'];
const estCls=s=>({'registrada':'reg','en evaluación':'eval','contratado':'ok','rechazado':'no'}[s]||'reg');
function toast(m,t){const e=document.getElementById('toast');if(!e)return;e.textContent=m;e.className='toast on '+(t||'');clearTimeout(e._t);e._t=setTimeout(()=>e.className='toast',3000);}
function fin(ico,tit,msg){const e=document.getElementById('estado');e.innerHTML=`<div class="ico">${ico}</div><h2>${esc(tit)}</h2><p>${esc(msg||'')}</p>`;e.style.display='';document.getElementById('app').style.display='none';}
function _pj(s){try{const x=typeof s==='string'?JSON.parse(s||'[]'):(s||[]);return Array.isArray(x)?x:[];}catch(e){return [];}}

document.addEventListener('DOMContentLoaded', init);
async function init(){
  if(!TOKEN){ fin('🔒','Link inválido','Falta el código del enlace.'); return; }
  try{ SB=window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key); }
  catch(e){ fin('⚠️','No se pudo iniciar','Recarga la página.'); return; }
  cargar();
}

async function cargar(){
  try{
    const {data,error}=await SB.rpc('gestion_vacante_publico',{p_token:TOKEN, p_clave:CLAVE||null});
    if(error) throw error;
    if(!data){ fin('🔒','Enlace no disponible','Pide uno nuevo a Antofagasta Minerals.'); return; }
    if(data.error==='clave_requerida'){ pedirClave(false); return; }
    if(data.error==='clave_incorrecta'){ pedirClave(true); return; }
    if(data.error){ fin('🔒','Enlace no disponible','El enlace no es válido, fue desactivado o caducó. Pide uno nuevo a Antofagasta Minerals.'); return; }
    DATA=data; render();
  }catch(e){ fin('⚠️','No se pudo cargar','Intenta de nuevo más tarde.'); }
}

// Pantalla de clave de visualización.
function pedirClave(errado){
  const e=document.getElementById('estado'); e.style.display=''; document.getElementById('app').style.display='none';
  e.innerHTML=`<div class="ico">🔑</div><h2>Enlace protegido</h2>
    <p>${errado?'<b style="color:#c0311b">Clave incorrecta.</b> ':''}Ingresa la clave de visualización que te entregó Antofagasta Minerals.</p>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
      <input id="gvClave" type="password" placeholder="Clave" style="min-width:200px"
        onkeydown="if(event.key==='Enter')document.getElementById('gvClaveBtn').click()">
      <button class="btn" id="gvClaveBtn">Entrar</button></div>`;
  const inp=document.getElementById('gvClave'); if(inp) inp.focus();
  document.getElementById('gvClaveBtn').onclick=()=>{ CLAVE=(inp&&inp.value||'').trim(); if(!CLAVE){ inp.focus(); return; } e.innerHTML='<div class="ico">⏳</div><h2>Comprobando…</h2>'; cargar(); };
}

function render(){
  const v=DATA.vacante||{}, cs=DATA.candidatos||[];
  const comps=_pj(v.competencias_json);
  document.getElementById('estado').style.display='none';
  const app=document.getElementById('app'); app.style.display='';
  const cnt=e=>cs.filter(c=>(c.estado||'registrada')===e).length;
  app.innerHTML=`
    <div class="card">
      <div class="vac-t">${esc(v.cargo||'Vacante')}</div>
      <div class="vac-sub">${esc(v.empresa||DATA.empresa||'')}${v.compania?' · '+esc(v.compania):''} · Código ${esc(v.codigo_puesto||'—')}</div>
      <div class="vac-meta">
        ${v.n_vacantes?`<span class="chip">${esc(v.n_vacantes)} vacante(s)</span>`:''}
        ${v.turno?`<span class="chip">Turno ${esc(v.turno)}</span>`:''}
        ${v.residencia?`<span class="chip">${esc(v.residencia)}</span>`:''}
        ${v.formacion?`<span class="chip">${esc(v.formacion)}</span>`:''}
      </div>
      ${v.descripcion?`<div class="vac-desc">${esc(v.descripcion)}</div>`:''}
      ${v.datos_adicionales?`<div class="vac-desc"><b>Datos adicionales:</b> ${esc(v.datos_adicionales)}</div>`:''}
      ${comps.length?`<div class="comps">${comps.map(c=>`<span class="comp ${c.excluyente?'exc':''}">${c.excluyente?'⛔ ':''}${esc(c.texto||'')}</span>`).join('')}</div>`:''}
    </div>

    <div class="card">
      <div class="sec-t">Candidatos derivados</div>
      <div class="nota">Descarga el CV de cada persona y marca el <b>estado</b> y tu <b>seguimiento</b> (queda guardado y visible para Antofagasta Minerals).</div>
      <div class="kpis">
        <div class="kpi"><b>${cs.length}</b><span>Derivados</span></div>
        <div class="kpi"><b style="color:#b8860b">${cnt('en evaluación')}</b><span>En evaluación</span></div>
        <div class="kpi"><b style="color:#1e7e34">${cnt('contratado')}</b><span>Contratados</span></div>
        <div class="kpi"><b style="color:#c0311b">${cnt('rechazado')}</b><span>Rechazados</span></div>
      </div>
      ${cs.length?`<div class="save-row" style="margin:6px 0 12px">
        <button class="btn" onclick="gvExcel()">⬇ Exportar listado (Excel)</button>
        <button class="btn g" onclick="gvTodosCV()">⬇ Descargar todos los CV</button>
        <span class="nota" style="margin:0">El Excel incluye una columna con el link para descargar cada CV.</span>
      </div>`:''}
      <div class="tblwrap">
      <table>
        <thead><tr><th>Candidato</th><th>Contacto</th><th>Localidad</th><th>CV</th><th>Estado</th><th>Seguimiento (contratación / no)</th></tr></thead>
        <tbody>
          ${!cs.length?'<tr><td colspan="6" style="text-align:center;color:#8a949a;padding:22px">Aún no hay candidatos derivados a esta vacante.</td></tr>'
          : cs.map((c,i)=>{
            const nom=[c.nombre||c.cv_nombres,c.apellidos||c.cv_apellidos].filter(Boolean).join(' ')||'—';
            const tieneApresto=!!(c.experiencia_json||c.resumen||c.academico_json);
            const cvCell = [
              c.cv_pdf_url?`<a class="btn g" href="${esc(c.cv_pdf_url)}" target="_blank" rel="noopener">⬇ CV (PDF)</a>`:'',
              tieneApresto?`<button class="btn g" onclick="gvCV(${i})">⬇ CV apresto</button>`:''
            ].filter(Boolean).join(' ') || '<span style="color:#8a949a;font-size:.78rem">sin CV</span>';
            return `<tr>
              <td><b>${esc(nom)}</b>${c.rut?`<br><span style="color:#8a949a">${esc(c.rut)}</span>`:''}</td>
              <td>${c.telefono?esc(c.telefono):''}${c.email?`<br>${esc(c.email)}`:''}</td>
              <td>${esc(c.localidad||c.comuna||'—')}</td>
              <td><div style="display:flex;gap:5px;flex-wrap:wrap">${cvCell}</div></td>
              <td><select class="est ${estCls(c.estado)}" onchange="gvEstado('${esc(c.derivacion_id)}',this)">${ESTADOS.map(o=>`<option ${o===(c.estado||'registrada')?'selected':''}>${o}</option>`).join('')}</select></td>
              <td><div class="save-row"><input id="seg_${i}" value="${esc(c.seguimiento_eecc||'')}" placeholder="Comentario / decisión" style="flex:1;min-width:150px">
                <button class="btn" onclick="gvSeg('${esc(c.derivacion_id)}',${i})">Guardar</button></div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      </div>
    </div>
    <div class="nota" style="text-align:center">Antofagasta Minerals · Relaciones Comunitarias — este enlace es privado; no lo compartas fuera de tu equipo de selección.</div>`;
}

// Arma el objeto CV (formato Harvard) de un candidato.
function _cvObj(c){
  return { nombres:c.cv_nombres||c.nombre||'', apellidos:c.cv_apellidos||c.apellidos||'', rut:c.rut||'',
    comuna:c.comuna||c.localidad||'', telefono:c.telefono||'', email:c.email||'', direccion:'',
    resumen:c.resumen||'',
    experiencia:_pj(c.experiencia_json), academico:_pj(c.academico_json),
    cursos:_pj(c.cursos_json), idiomas:_pj(c.idiomas_json), software:_pj(c.software_json) };
}
const _TIT={perfil:'Resumen Profesional',educacion:'Antecedentes Académicos',experiencia:'Antecedentes Laborales',cursos:'Seminarios y Cursos',habilidades:'Información Adicional'};

// Descargar el CV del candidato (formato Harvard) a partir de sus datos.
window.gvCV=function(i){
  const c=(DATA.candidatos||[])[i]; if(!c) return;
  try{
    if(typeof generarCVHarvard!=='function'){ toast('No se pudo generar el CV','err'); return; }
    const doc=generarCVHarvard(_cvObj(c),{titulos:_TIT});
    doc.save('CV_'+(( _cvObj(c).apellidos|| _cvObj(c).nombres||c.rut||'candidato').replace(/\W+/g,'_'))+'.pdf');
  }catch(e){ toast('No se pudo generar el CV: '+e.message,'err'); }
};

// Descargar TODOS los CV: primero los de apresto (PDF generado) y luego abre los
// PDF cargados. Sin librerías nuevas (Regla 6): jsPDF ya está; se bajan uno a uno.
window.gvTodosCV=async function(){
  const cs=DATA.candidatos||[]; let n=0;
  for(const c of cs){
    const tieneApresto=!!(c.experiencia_json||c.resumen||c.academico_json);
    if(tieneApresto && typeof generarCVHarvard==='function'){
      try{ const o=_cvObj(c); const doc=generarCVHarvard(o,{titulos:_TIT});
        doc.save('CV_'+((o.apellidos||o.nombres||c.rut||'candidato').replace(/\W+/g,'_'))+'.pdf'); n++;
        await new Promise(r=>setTimeout(r,350)); }catch(e){}
    }
  }
  // Los CV cargados como PDF (cv_pdf_url) se abren en pestañas para descargarlos.
  const pdfs=cs.filter(c=>c.cv_pdf_url);
  if(pdfs.length && confirm('Se abrirán '+pdfs.length+' PDF cargado(s) en pestañas nuevas para descargarlos. ¿Continuar?')){
    pdfs.forEach(c=>window.open(c.cv_pdf_url,'_blank','noopener'));
  }
  toast('Descargados '+n+' CV de apresto'+(pdfs.length?' + '+pdfs.length+' PDF':''),'ok');
};

// Exportar el listado a Excel, con una columna de link para descargar el CV.
window.gvExcel=function(){
  if(typeof XLSX==='undefined'){ toast('No se pudo preparar el Excel','err'); return; }
  const v=DATA.vacante||{}, cs=DATA.candidatos||[];
  const aoa=[['Candidato','RUT','Teléfono','Email','Localidad','Estado','Seguimiento','CV (PDF cargado)','CV apresto']];
  cs.forEach(c=>{
    const nom=[c.nombre||c.cv_nombres,c.apellidos||c.cv_apellidos].filter(Boolean).join(' ');
    const tieneApresto=!!(c.experiencia_json||c.resumen||c.academico_json);
    aoa.push([nom, c.rut||'', c.telefono||'', c.email||'', c.localidad||c.comuna||'',
      c.estado||'registrada', c.seguimiento_eecc||'', c.cv_pdf_url||'',
      tieneApresto?'Sí (descargable en el portal)':'—']);
  });
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols']=[{wch:28},{wch:14},{wch:15},{wch:26},{wch:16},{wch:14},{wch:34},{wch:48},{wch:24}];
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Candidatos');
  const nombre=('candidatos_'+(v.cargo||'vacante')).replace(/\W+/g,'_').toLowerCase();
  XLSX.writeFile(wb, nombre+'_'+new Date().toISOString().slice(0,10)+'.xlsx');
};

window.gvEstado=async function(id,sel){
  sel.className='est '+estCls(sel.value);
  try{ const {data,error}=await SB.rpc('gestion_vacante_seguimiento',{p_token:TOKEN,p_derivacion_id:id,p_estado:sel.value,p_seguimiento:null,p_clave:CLAVE||null});
    if(error||(data&&data.error)) throw new Error('no'); toast('Estado guardado','ok');
    const c=(DATA.candidatos||[]).find(x=>x.derivacion_id===id); if(c) c.estado=sel.value;
  }catch(e){ toast('No se pudo guardar','err'); }
};
window.gvSeg=async function(id,i){
  const inp=document.getElementById('seg_'+i); if(!inp) return;
  try{ const {data,error}=await SB.rpc('gestion_vacante_seguimiento',{p_token:TOKEN,p_derivacion_id:id,p_estado:null,p_seguimiento:inp.value,p_clave:CLAVE||null});
    if(error||(data&&data.error)) throw new Error('no'); toast('Seguimiento guardado','ok');
    const c=(DATA.candidatos||[]).find(x=>x.derivacion_id===id); if(c) c.seguimiento_eecc=inp.value;
  }catch(e){ toast('No se pudo guardar','err'); }
};
})();
