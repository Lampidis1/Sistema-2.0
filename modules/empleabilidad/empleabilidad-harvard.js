// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-harvard.js — CV estandarizado en formato Harvard
// Sistema AM · Antofagasta Minerals
//
// QUÉ ES EL FORMATO HARVARD
// No es una librería, es una norma de estructura: una sola columna, sin
// colores ni gráficos, cada entrada con fecha, y cada viñeta empezando con un
// verbo de acción y terminando en un resultado medible. Ese orden es lo que
// hace que un CV pase los filtros automáticos y que un reclutador encuentre lo
// que busca en diez segundos.
//   Educación → Experiencia → Cursos y certificaciones → Habilidades
//
// LA ADAPTACIÓN LOCAL, Y POR QUÉ
// El estándar Harvard excluye foto, RUT, fecha de nacimiento y estado civil.
// En Chile el RUT y el teléfono se piden igual, y sin ellos el CV no sirve
// para postular. Se mantiene entonces la ESTRUCTURA Harvard con un encabezado
// de contacto local. La foto sí se omite, como manda el estándar.
//
// Se genera con el jsPDF que el módulo ya carga: cero dependencias nuevas.
//
// <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

// Verbos con los que debería empezar una viñeta de logro. Se usan para avisar
// —no para reescribir: el texto es de la persona, no del sistema.
const HV_VERBOS=['opero','operé','conduje','mantuve','realicé','ejecuté','supervisé','coordiné','lideré',
  'instalé','reparé','construí','soldé','inspeccioné','controlé','gestioné','atendí','apoyé','capacité',
  'implementé','reduje','aumenté','logré','cumplí','preparé','organicé','administré','manejé','revisé'];

function hvLimpio(s){ return String(s==null?'':s).replace(/\s+/g,' ').trim(); }

// ── Revisión de calidad ─────────────────────────────────────────────────────
// Antes de exportar se dice qué le falta al CV para cumplir el estándar. No se
// corrige solo: se avisa, y la persona o el equipo decide.
function hvRevisar(cv){
  const obs=[];
  if(!hvLimpio(cv.nombres)||!hvLimpio(cv.apellidos)) obs.push({grave:true, txt:'Falta el nombre completo.'});
  if(!hvLimpio(cv.telefono)&&!hvLimpio(cv.email))    obs.push({grave:true, txt:'Sin teléfono ni correo: no hay cómo contactar.'});
  if(!(cv.academico||[]).length)  obs.push({grave:true, txt:'Sin formación registrada. En el formato Harvard la educación va primero.'});
  if(!(cv.experiencia||[]).length) obs.push({grave:false, txt:'Sin experiencia registrada.'});

  (cv.experiencia||[]).forEach((e,i)=>{
    const q='Experiencia '+(i+1)+' ('+(hvLimpio(e.cargo)||'sin cargo')+')';
    if(!hvLimpio(e.desde))   obs.push({grave:false, txt:q+': sin fecha de inicio. Cada entrada debe ir fechada.'});
    if(!hvLimpio(e.empresa)) obs.push({grave:false, txt:q+': falta la empresa.'});
    const fs=(e.funciones||[]).filter(f=>hvLimpio(f));
    if(!fs.length) obs.push({grave:false, txt:q+': sin viñetas de tareas o logros.'});
    else {
      const conVerbo=fs.filter(f=>{ const p=hvLimpio(f).toLowerCase().split(' ')[0];
        return HV_VERBOS.some(v=>p.startsWith(v.slice(0,5))); }).length;
      if(conVerbo===0) obs.push({grave:false, txt:q+': ninguna viñeta empieza con verbo de acción (operé, mantuve, coordiné…).'});
      const conNumero=fs.filter(f=>/\d/.test(f)).length;
      if(conNumero===0) obs.push({grave:false, txt:q+': ninguna viñeta tiene un resultado medible (cantidad, toneladas, %, personas a cargo).'});
    }
  });
  return obs;
}

// ── PDF ─────────────────────────────────────────────────────────────────────
const HV = {mx:18, top:18, ancho:174, base:9.5, salto:4.6};

function hvSeccion(doc, y, titulo){
  doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.setTextColor(0,0,0);
  doc.text(titulo.toUpperCase(), HV.mx, y);
  doc.setDrawColor(0,0,0); doc.setLineWidth(0.4);
  doc.line(HV.mx, y+1.4, HV.mx+HV.ancho, y+1.4);
  return y+6.5;
}
// Entrada: título a la izquierda en negrita, fecha a la derecha. Esa alineación
// es lo que permite recorrer el CV con la vista por la columna de fechas.
function hvEntrada(doc, y, izq, der, sub){
  doc.setFont('helvetica','bold'); doc.setFontSize(HV.base);
  doc.text(hvLimpio(izq).slice(0,78), HV.mx, y);
  if(der){
    doc.setFont('helvetica','normal');
    doc.text(hvLimpio(der), HV.mx+HV.ancho, y, {align:'right'});
  }
  y+=HV.salto;
  if(hvLimpio(sub)){
    doc.setFont('helvetica','italic'); doc.setFontSize(HV.base-0.5);
    doc.text(hvLimpio(sub).slice(0,95), HV.mx, y);
    y+=HV.salto;
  }
  return y;
}
function hvVinetas(doc, y, lista){
  doc.setFont('helvetica','normal'); doc.setFontSize(HV.base-0.5);
  (lista||[]).filter(f=>hvLimpio(f)).forEach(f=>{
    const lineas=doc.splitTextToSize('•  '+hvLimpio(f), HV.ancho-4);
    lineas.forEach(l=>{
      if(y>272){ doc.addPage(); y=HV.top; }
      doc.text(l, HV.mx+3, y); y+=HV.salto-0.5;
    });
  });
  return y+1;
}

function generarCVHarvard(cv, opciones){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm', format:'a4'});
  let y=HV.top;

  // ── Encabezado: nombre y una línea de contacto. Sin foto, como el estándar.
  doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text(hvLimpio((cv.nombres||'')+' '+(cv.apellidos||'')).toUpperCase()||'SIN NOMBRE',
           HV.mx+HV.ancho/2, y, {align:'center'});
  y+=6;
  const contacto=[
    hvLimpio(cv.direccion), hvLimpio(cv.comuna),
    hvLimpio(cv.telefono), hvLimpio(cv.email),
    cv.rut?('RUT '+hvLimpio(cv.rut)):''
  ].filter(Boolean).join('  ·  ');
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
  doc.splitTextToSize(contacto, HV.ancho).forEach(l=>{
    doc.text(l, HV.mx+HV.ancho/2, y, {align:'center'}); y+=4;
  });
  y+=3;

  // ── Perfil (opcional; el estándar no lo exige pero lo acepta si es corto)
  if(hvLimpio(cv.resumen)){
    y=hvSeccion(doc,y,'Perfil');
    doc.setFont('helvetica','normal'); doc.setFontSize(HV.base-0.5);
    doc.splitTextToSize(hvLimpio(cv.resumen).slice(0,420), HV.ancho).forEach(l=>{
      doc.text(l, HV.mx, y); y+=HV.salto-0.5;
    });
    y+=2;
  }

  // ── Educación primero: así lo define el formato Harvard.
  if((cv.academico||[]).length){
    y=hvSeccion(doc,y,'Educación');
    cv.academico.forEach(a=>{
      if(y>262){ doc.addPage(); y=HV.top; }
      y=hvEntrada(doc,y, a.titulo||'Estudios', a.periodo||'', [a.institucion,a.ciudad].filter(Boolean).join(', '));
    });
    y+=1;
  }

  // ── Experiencia, de lo más reciente a lo más antiguo.
  if((cv.experiencia||[]).length){
    y=hvSeccion(doc,y,'Experiencia');
    const exp=cv.experiencia.slice().sort((a,b)=>String(b.desde||'').localeCompare(String(a.desde||'')));
    exp.forEach(e=>{
      if(y>258){ doc.addPage(); y=HV.top; }
      const fecha=[e.desde,e.hasta].filter(Boolean).join(' – ');
      y=hvEntrada(doc,y, e.empresa||e.cargo||'', fecha, [e.cargo,e.ciudad].filter(Boolean).join(' · '));
      y=hvVinetas(doc,y, [...(e.funciones||[]), e.logro].filter(Boolean));
    });
  }

  // ── Cursos y certificaciones
  if((cv.cursos||[]).length){
    y=hvSeccion(doc,y,'Cursos y certificaciones');
    cv.cursos.forEach(c=>{
      if(y>268){ doc.addPage(); y=HV.top; }
      y=hvEntrada(doc,y, c.evento||c.tema||'', c.anio||'', c.institucion||'');
    });
    y+=1;
  }

  // ── Habilidades: idiomas, software, licencia. Cierra el CV, como el estándar.
  const hab=[];
  if((cv.idiomas||[]).length)  hab.push('Idiomas: '+cv.idiomas.map(i=>hvLimpio(i.idioma)+(i.nivel?' ('+i.nivel+')':'')).filter(Boolean).join(', '));
  if((cv.software||[]).length) hab.push('Software: '+cv.software.map(s=>hvLimpio(s.nombre)).filter(Boolean).join(', '));
  if(cv.licencia)              hab.push('Licencia de conducir: '+(cv.tipo_licencia||'sí'));
  if(hvLimpio(cv.certificaciones)) hab.push('Certificaciones: '+hvLimpio(cv.certificaciones));
  if(hvLimpio(cv.disponibilidad))  hab.push('Disponibilidad: '+hvLimpio(cv.disponibilidad));
  if(hab.length){
    if(y>258){ doc.addPage(); y=HV.top; }
    y=hvSeccion(doc,y,'Habilidades');
    y=hvVinetas(doc,y,hab);
  }

  // Pie discreto: de dónde salió el documento.
  const paginas=doc.internal.getNumberOfPages();
  for(let i=1;i<=paginas;i++){
    doc.setPage(i);
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(130,130,130);
    doc.text('Sistema de Empleabilidad · Relaciones Comunitarias, Antofagasta Minerals',
             HV.mx, 288);
    doc.text(i+'/'+paginas, HV.mx+HV.ancho, 288, {align:'right'});
  }
  return doc;
}

// ── Botón de la ficha ───────────────────────────────────────────────────────
function exportarCVHarvard(cvId){
  const cv=(cvId?CVS.find(c=>c.cv_id===cvId):CV_EDIT)||CV_EDIT;
  if(!cv){ toast('No hay CV abierto','err'); return; }
  const obs=hvRevisar(cv);
  const graves=obs.filter(o=>o.grave);
  if(obs.length){
    const txt='Revisión del formato Harvard:\n\n'+
      obs.slice(0,10).map(o=>(o.grave?'⛔ ':'⚠ ')+o.txt).join('\n')+
      (obs.length>10?`\n… y ${obs.length-10} observaciones más`:'')+
      '\n\n¿Generar el PDF de todas formas?';
    if(!confirm(txt)) return;
  }
  if(graves.length>2){ toast('El CV está muy incompleto; revisa los datos marcados','err'); }
  const doc=generarCVHarvard(cv);
  const nom=hvLimpio((cv.nombres||'')+'_'+(cv.apellidos||'')).replace(/\s+/g,'_')||'CV';
  doc.save('CV_Harvard_'+nom+'.pdf');
}

// Panel de revisión, sin generar el PDF: sirve para corregir antes.
function revisarHarvard(){
  const cv=CV_EDIT; if(!cv){ toast('No hay CV abierto','err'); return; }
  const obs=hvRevisar(cv);
  const cont=document.getElementById('hvBody');
  cont.innerHTML=obs.length
    ? `<div class="hv-lista">${obs.map(o=>`<div class="hv-obs ${o.grave?'grave':''}">
         <span>${o.grave?'⛔':'⚠'}</span><span>${esc(o.txt)}</span></div>`).join('')}</div>
       <div class="hv-nota">El formato Harvard pide una columna, sin foto, cada entrada con fecha, y
         viñetas que empiecen con verbo de acción y terminen en un resultado medible
         («Operé cargador frontal LHD movilizando 1.200 t por turno»). El sistema avisa,
         no reescribe: el texto es de la persona.</div>`
    : '<div class="hv-ok">✓ El CV cumple la estructura Harvard. Puedes exportarlo.</div>';
  document.getElementById('hvModal').classList.add('show');
}
function cerrarHarvard(){ document.getElementById('hvModal').classList.remove('show'); }
