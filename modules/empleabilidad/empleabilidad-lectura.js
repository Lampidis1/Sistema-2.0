// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-lectura.js — Lectura de CVs: PDF, Word, escaneos y fotos
// Sistema AM · Antofagasta Minerals
//
// EL PROBLEMA QUE RESUELVE
// pdf.js lee la capa de texto de un PDF. Si el CV es una foto del papel o un
// escaneo, esa capa no existe: la lectura devolvía vacío y la ficha quedaba en
// blanco sin avisar. Acá se detecta ese caso y se pasa por OCR.
//
// CÓMO DECIDE
//   1. PDF → pdf.js. Además del texto, se conservan las coordenadas de cada
//      trozo para reconstruir las LÍNEAS reales (ver `pdfLineas`); leer un CV
//      de dos columnas sin eso mezcla la columna izquierda con la derecha.
//   2. Si el texto sacado es demasiado pobre (menos de UMBRAL_OCR caracteres
//      por página), se rasteriza la página y se pasa por Tesseract.
//   3. .docx → mammoth.  .jpg/.png → directo a Tesseract.
//   4. .doc antiguo → no hay forma decente en el navegador; se avisa.
//
// TESSERACT SE CARGA SOLO CUANDO HACE FALTA
// La librería y el diccionario de español pesan ~17 MB. Bajarlos en cada
// visita para los CVs que sí traen texto sería absurdo, así que el <script> se
// inyecta la primera vez que un documento lo necesita. Después queda en caché
// del navegador.
//
// PRIVACIDAD: todo ocurre en el navegador. Ningún CV se sube a un tercero
// (CLAUDE.md Regla 5 y 6). Tesseract es WebAssembly local, no un servicio.
//
// <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

const OCR_CDN   = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const OCR_IDIOMA = 'spa';
const UMBRAL_OCR = 120;   // caracteres por página bajo los cuales se sospecha escaneo

let _ocrCargando = null;

// Carga diferida de Tesseract. Devuelve la promesa para que varias llamadas
// simultáneas esperen la misma descarga en vez de bajarla dos veces.
function ocrDisponible(){
  if(typeof Tesseract!=='undefined') return Promise.resolve(true);
  if(_ocrCargando) return _ocrCargando;
  _ocrCargando=new Promise((ok,fail)=>{
    const s=document.createElement('script');
    s.src=OCR_CDN;
    s.onload=()=>ok(true);
    s.onerror=()=>fail(new Error('No se pudo cargar el lector de imágenes (OCR)'));
    document.head.appendChild(s);
  });
  return _ocrCargando;
}

// Aviso de progreso: leer por OCR puede tardar y el usuario tiene que verlo.
function ocrAviso(txt, pct){
  let b=document.getElementById('ocrAviso');
  if(!b){
    b=document.createElement('div');
    b.id='ocrAviso'; b.className='ocr-aviso';
    document.body.appendChild(b);
  }
  b.innerHTML=`<div class="ocr-txt">${esc(txt)}</div>
    <div class="ocr-barra"><div style="width:${Math.round((pct||0)*100)}%"></div></div>`;
  b.style.display='block';
}
function ocrCerrar(){ const b=document.getElementById('ocrAviso'); if(b) b.style.display='none'; }

// ── PDF: texto con estructura ───────────────────────────────────────────────
// pdf.js entrega trozos sueltos con su posición. Se agrupan por coordenada Y
// (misma línea) y se ordenan por X, así una tabla o un CV a dos columnas no
// queda con las palabras intercaladas.
function pdfLineas(items){
  const filas={};
  items.forEach(it=>{
    if(!it.str || !it.str.trim()) return;
    const y=Math.round(it.transform[5]);          // posición vertical
    const x=it.transform[4];
    const alto=Math.abs(it.transform[3])||10;     // tamaño de letra
    // se tolera medio renglón de diferencia: la misma línea no siempre trae la Y exacta
    const clave=Object.keys(filas).find(k=>Math.abs(k-y)<=alto*0.5) || y;
    (filas[clave]=filas[clave]||[]).push({x, str:it.str, alto});
  });
  return Object.keys(filas)
    .sort((a,b)=>b-a)                              // de arriba hacia abajo
    .map(k=>{
      const trozos=filas[k].sort((a,b)=>a.x-b.x);
      const alto=Math.max(...trozos.map(t=>t.alto));
      // un espacio extra donde hubo un salto grande de X (columnas)
      let txt='';
      trozos.forEach((t,i)=>{
        if(i>0 && t.x - (trozos[i-1].x) > alto*3) txt+='   ';
        txt+=t.str;
      });
      return {texto:txt.replace(/\s+/g,' ').trim(), alto:alto};
    })
    .filter(l=>l.texto);
}

async function leerPDFEstructurado(file){
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  const lineas=[]; let chars=0;
  const paginas=[];
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const c=await page.getTextContent();
    const ls=pdfLineas(c.items);
    ls.forEach(l=>{ lineas.push(l); chars+=l.texto.length; });
    paginas.push(page);
  }
  return {pdf, paginas, lineas, chars};
}

// Rasteriza una página y la pasa por OCR. La escala 2 es el punto donde el
// texto chico de un CV escaneado empieza a reconocerse bien.
async function ocrDePagina(page, worker){
  const vp=page.getViewport({scale:2});
  const canvas=document.createElement('canvas');
  canvas.width=vp.width; canvas.height=vp.height;
  await page.render({canvasContext:canvas.getContext('2d'), viewport:vp}).promise;
  const {data}=await worker.recognize(canvas);
  canvas.width=canvas.height=0;   // liberar memoria: un CV de 5 páginas se nota
  return data.text||'';
}

// ── Entrada única ───────────────────────────────────────────────────────────
// Devuelve {texto, lineas, origen, aviso}. `origen` dice de dónde salió el
// texto, y se guarda en la ficha: un CV leído por OCR merece más revisión que
// uno leído de la capa de texto.
async function leerDocumento(file){
  const nombre=file.name||'';

  if(/\.docx$/i.test(nombre)){
    const buf=await file.arrayBuffer();
    const res=await mammoth.extractRawText({arrayBuffer:buf});
    const txt=res.value||'';
    return {texto:txt, lineas:txt.split('\n').map(t=>({texto:t.trim(),alto:10})).filter(l=>l.texto), origen:'word'};
  }

  if(/\.doc$/i.test(nombre)){
    throw new Error('Los .doc antiguos no se pueden leer en el navegador. '+
      'Ábrelo en Word y guárdalo como .docx o PDF.');
  }

  if(/\.(jpe?g|png|webp|bmp|tiff?)$/i.test(nombre)){
    ocrAviso('Leyendo la imagen del CV… (la primera vez descarga el lector, ~17 MB)',0);
    await ocrDisponible();
    const worker=await Tesseract.createWorker(OCR_IDIOMA, 1, {
      logger:m=>{ if(m.status==='recognizing text') ocrAviso('Reconociendo texto…', m.progress); }
    });
    try{
      const {data}=await worker.recognize(file);
      const txt=data.text||'';
      return {texto:txt, lineas:txt.split('\n').map(t=>({texto:t.trim(),alto:10})).filter(l=>l.texto),
              origen:'ocr-imagen', confianza:data.confidence};
    } finally { await worker.terminate(); ocrCerrar(); }
  }

  if(/\.pdf$/i.test(nombre)){
    const r=await leerPDFEstructurado(file);
    const porPagina=r.chars/Math.max(1,r.paginas.length);

    if(porPagina>=UMBRAL_OCR){
      return {texto:r.lineas.map(l=>l.texto).join('\n'), lineas:r.lineas, origen:'pdf-texto'};
    }

    // Sin capa de texto útil: es un escaneo o una foto dentro de un PDF.
    ocrAviso('Este PDF viene escaneado. Leyendo con OCR… (la primera vez descarga el lector, ~17 MB)',0);
    await ocrDisponible();
    const worker=await Tesseract.createWorker(OCR_IDIOMA, 1, {
      logger:m=>{ if(m.status==='recognizing text') ocrAviso('Reconociendo texto…', m.progress); }
    });
    try{
      let txt='';
      for(let i=0;i<r.paginas.length;i++){
        ocrAviso('Reconociendo texto — página '+(i+1)+' de '+r.paginas.length, i/r.paginas.length);
        txt+=await ocrDePagina(r.paginas[i], worker)+'\n';
      }
      return {texto:txt, lineas:txt.split('\n').map(t=>({texto:t.trim(),alto:10})).filter(l=>l.texto),
              origen:'pdf-ocr'};
    } finally { await worker.terminate(); ocrCerrar(); }
  }

  throw new Error('Formato no soportado: '+nombre+'. Se aceptan PDF, .docx e imágenes.');
}

const ORIGEN_ETIQUETA={
  'pdf-texto':'PDF con texto',
  'pdf-ocr':'PDF escaneado, leído con OCR',
  'word':'Documento Word',
  'ocr-imagen':'Imagen leída con OCR',
};

// ═══════════════════════════════════════════════════════════════════════════
// PARSEO ESTRUCTURADO
//
// Antes se buscaba a ciegas en todo el texto. Acá primero se parte el CV en
// SECCIONES y después se lee cada una con sus propias reglas: un año dentro de
// "Experiencia" es el periodo de un trabajo; el mismo año dentro de "Cursos"
// es la fecha del curso. Sin esa separación las dos cosas se mezclaban.
//
// El corte de sección se detecta por dos señales a la vez:
//   · el texto de la línea coincide con un encabezado conocido, o
//   · la línea es corta, va en mayúsculas y su letra es más grande que el
//     cuerpo del documento (por eso `pdfLineas` conserva el alto).
// ═══════════════════════════════════════════════════════════════════════════

const SECCIONES = [
  {k:'personal',   re:/^(datos|antecedentes)\s+(personales|generales)|^informaci[oó]n\s+personal/i},
  {k:'resumen',    re:/^(perfil|resumen|objetivo|presentaci[oó]n|acerca de m[ií]|sobre m[ií])/i},
  {k:'experiencia',re:/^(experiencia|antecedentes\s+laborales|trayectoria|historial\s+laboral|experiencia\s+profesional)/i},
  {k:'academico',  re:/^(formaci[oó]n|educaci[oó]n|estudios|antecedentes\s+acad[eé]micos|acad[eé]mic)/i},
  {k:'cursos',     re:/^(cursos|capacitaci|certificac|perfeccionamiento|seminarios|licencias)/i},
  {k:'idiomas',    re:/^idiomas/i},
  {k:'software',   re:/^(software|computaci[oó]n|inform[aá]tica|herramientas|conocimientos\s+computacionales)/i},
  {k:'habilidades',re:/^(habilidades|competencias|aptitudes|destrezas)/i},
  {k:'referencias',re:/^referencias/i},
];

function _esEncabezado(linea, altoCuerpo){
  const t=(linea.texto||'').trim();
  if(!t || t.length>60) return null;
  const sec=SECCIONES.find(s=>s.re.test(t.replace(/[:：]/g,'').trim()));
  if(sec) return sec.k;
  // sin coincidencia de texto: mayúsculas + letra más grande que el cuerpo
  const mays = t===t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(t);
  if(mays && linea.alto > altoCuerpo*1.15 && t.split(' ').length<=5) return '_otra';
  return null;
}

// Parte las líneas en secciones. Lo que va antes del primer encabezado es la
// cabecera del CV: ahí están el nombre y los datos de contacto.
function partirEnSecciones(lineas){
  const altos=lineas.map(l=>l.alto).sort((a,b)=>a-b);
  const altoCuerpo=altos[Math.floor(altos.length/2)]||10;   // mediana = tamaño del cuerpo
  const secs={cabecera:[]};
  let actual='cabecera';
  lineas.forEach((l,i)=>{
    // Las dos primeras líneas son el nombre y el contacto: van en mayúsculas y
    // en letra grande igual que un encabezado, pero no lo son.
    const k=(i<2 && !SECCIONES.some(sx=>sx.re.test((l.texto||'').replace(/[:：]/g,'').trim())))
      ? null : _esEncabezado(l, altoCuerpo);
    if(k && k!=='_otra'){ actual=k; secs[actual]=secs[actual]||[]; return; }
    if(k==='_otra'){ actual='_'+(l.texto||'').toLowerCase().slice(0,20); secs[actual]=secs[actual]||[]; return; }
    (secs[actual]=secs[actual]||[]).push(l.texto);
  });
  return secs;
}

// Un periodo: "2019 - 2023", "ene 2019 a la fecha", "2019-actual"
const _RE_PERIODO=/((?:19|20)\d{2})\s*(?:-|–|—|a|al|hasta|\/)\s*((?:19|20)\d{2}|actual(?:idad)?|presente|la fecha|hoy)/i;

function _leerExperiencia(lineas){
  const out=[];
  let cur=null;
  (lineas||[]).forEach(raw=>{
    const l=raw.trim(); if(!l) return;
    const per=l.match(_RE_PERIODO);
    const vineta=/^[\-•·*▪◦o]\s+/.test(raw);
    if(per && !vineta){
      // línea con periodo = empieza un trabajo nuevo
      if(cur) out.push(cur);
      const resto=l.replace(_RE_PERIODO,'').replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g,'');
      const partes=resto.split(/\s+[-–—|·]\s+|\s{3,}/).filter(Boolean);
      // "2019-2024 Minera Centinela - Operador de cargador frontal" y
      // "2019-2024 Operador de cargador frontal - Minera Centinela" son ambos
      // habituales. Se decide cuál es el cargo preguntándole al diccionario de
      // oficios; si no reconoce ninguno, se respeta el orden en que vino.
      let cargo=(partes[0]||resto||'').trim(), empresa=(partes[1]||'').trim();
      if(partes.length>=2 && typeof esOficioConocido==='function'){
        const a0=esOficioConocido(partes[0]), a1=esOficioConocido(partes[1]);
        if(a1>a0){ cargo=partes[1].trim(); empresa=partes[0].trim(); }
      }
      cur={desde:per[1], hasta:/^(19|20)\d{2}$/.test(per[2])?per[2]:'Actual',
           cargo, empresa, ciudad:(partes[2]||'').trim(), funciones:[], logro:''};
    } else if(cur){
      if(vineta || l.length>25) cur.funciones.push(l.replace(/^[\-•·*▪◦o]\s+/,'').trim());
      else if(!cur.empresa) cur.empresa=l;
    } else if(l.length>3){
      cur={desde:'',hasta:'',cargo:l,empresa:'',ciudad:'',funciones:[],logro:''};
    }
  });
  if(cur) out.push(cur);
  return out.slice(0,12);
}

function _leerAcademico(lineas){
  return (lineas||[]).filter(l=>l.trim().length>4).slice(0,10).map(raw=>{
    const l=raw.trim();
    const per=l.match(_RE_PERIODO)||l.match(/((?:19|20)\d{2})/);
    const resto=l.replace(_RE_PERIODO,'').replace(/((?:19|20)\d{2})/g,'')
                 .replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g,'');
    const partes=resto.split(/\s+[-–—|·]\s+|\s{3,}/).filter(Boolean);
    return {periodo:per?(per[2]&&/\d/.test(per[2])?per[1]+'–'+per[2]:per[1]):'',
            titulo:(partes[0]||resto).trim(), institucion:(partes[1]||'').trim(), ciudad:(partes[2]||'').trim()};
  });
}

function _leerCursos(lineas){
  return (lineas||[]).filter(l=>l.trim().length>3).slice(0,15).map(raw=>{
    const l=raw.replace(/^[\-•·*▪◦o]\s+/,'').trim();
    const anio=(l.match(/((?:19|20)\d{2})/)||[])[1]||'';
    const resto=l.replace(/((?:19|20)\d{2})/g,'').replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g,'');
    const partes=resto.split(/\s+[-–—|·]\s+|\s{3,}/).filter(Boolean);
    return {anio, evento:(partes[0]||resto).trim(), tema:'', institucion:(partes[1]||'').trim()};
  });
}

// Datos de contacto: se buscan primero en la cabecera y, si no aparecen, en
// todo el documento. Un correo o un RUT son inconfundibles vayan donde vayan.
function _leerContacto(cv, cabecera, todo){
  const enCab=(cabecera||[]).join('\n');
  const buscar=(re, texto)=>{ const m=(texto||'').match(re); return m?m[1]||m[0]:''; };

  cv.email = buscar(/[\w.\-]+@[\w.\-]+\.\w+/, enCab) || buscar(/[\w.\-]+@[\w.\-]+\.\w+/, todo);
  if(!cv.email && /ocr/.test(cv.fuente||'')){
    // El OCR lee la arroba como Q, O o 0 muy seguido. NO se reconstruye el
    // correo adivinando: un correo inventado le escribe a nadie y nadie se
    // entera. Se avisa con el texto tal cual salió, para corregirlo a mano.
    const alt=buscar(/([\w.\-]{3,}[QO0][\w.\-]{3,}\.[a-z]{2,4})\b/i, todo);
    if(alt) (cv._avisos=cv._avisos||[]).push('Posible correo mal leído: "'+alt+'". Corrígelo a mano.');
  }
  const rut = buscar(/(\d{1,2}\.?\d{3}\.?\d{3}\s*[\-\.]?\s*[\dkK])/, enCab) ||
              buscar(/(\d{1,2}\.?\d{3}\.?\d{3}\s*[\-\.]?\s*[\dkK])/, todo);
  if(rut) cv.rut=rut.replace(/\s/g,'');
  const tels=(enCab.match(/(\+?56\s?9\s?\d{4}\s?\d{4}|\b9\s?\d{4}\s?\d{4}\b)/g)||
              todo.match(/(\+?56\s?9\s?\d{4}\s?\d{4}|\b9\s?\d{4}\s?\d{4}\b)/g)||[]);
  cv.telefono=(tels[0]||'').trim(); cv.telefono2=(tels[1]||'').trim();

  const fn=todo.match(/(?:nacimiento|nacid[oa]|f\.?\s*nac)[^\d]{0,15}(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if(fn) cv.fecha_nacimiento=fn[1];
  const nac=todo.match(/nacionalidad\s*:?\s*([a-záéíóúñ]+)/i);
  if(nac) cv.nacionalidad=nac[1].charAt(0).toUpperCase()+nac[1].slice(1);
  const com=todo.match(/comuna\s*:?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ ]{3,30})/i);
  if(com) cv.comuna=com[1].trim();
  const dir=todo.match(/(?:direcci[oó]n|domicilio)\s*:?\s*([^\n]{5,60})/i);
  if(dir) cv.direccion=dir[1].trim();
  const lic=todo.match(/licencia[^\n]{0,30}?(?:clase\s*)?\b([A-E]\-?\d?)\b/i);
  if(lic){ cv.licencia='Sí'; cv.tipo_licencia=(lic[1]||'').toUpperCase(); }

  // El nombre: la primera línea de la cabecera que no sea un dato de contacto.
  const fuente=(cabecera&&cabecera.length)?cabecera:(todo.split('\n').slice(0,6));
  const cand=fuente.find(l=>{
    const t=l.trim();
    return t.length>5 && t.length<60 && !/[@\d]/.test(t) &&
           !/^(curriculum|currículum|vitae|cv|hoja de vida|datos)/i.test(t);
  });
  if(cand){
    const p=cand.trim().replace(/\s+/g,' ').split(' ');
    if(p.length>=3){ cv.nombres=p.slice(0,p.length-2).join(' '); cv.apellidos=p.slice(-2).join(' '); }
    else { cv.nombres=p[0]||''; cv.apellidos=p.slice(1).join(' '); }
  }
}

// Entrada única del parseo: de las líneas leídas al objeto CV del sistema.
function estructurarCV(lectura, fname){
  const cv={ cv_id:'cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    rut:'',nombres:'',apellidos:'',fecha_nacimiento:'',sexo:'',nacionalidad:'',direccion:'',comuna:'',ciudad:'',
    telefono:'',telefono2:'',email:'',resumen:'',experiencia:[],academico:[],cursos:[],idiomas:[],software:[],
    adjuntos:[],licencia:'',tipo_licencia:'',oficios:'',exp_mineria:'',certificaciones:'',educacion:'',
    fuente:lectura.origen||'pdf', _nuevo:true, _origen_lectura:lectura.origen, _archivo:fname };

  const secs=partirEnSecciones(lectura.lineas||[]);
  const todo=lectura.texto||'';

  _leerContacto(cv, secs.cabecera, todo);
  cv.resumen     = (secs.resumen||[]).join(' ').slice(0,600);
  cv.experiencia = _leerExperiencia(secs.experiencia);
  cv.academico   = _leerAcademico(secs.academico);
  cv.cursos      = _leerCursos(secs.cursos);
  cv.idiomas     = (secs.idiomas||[]).filter(l=>l.trim().length>2).slice(0,6)
                     .map(l=>({idioma:l.replace(/^[\-•·*]\s*/,'').trim(), nivel:''}));
  cv.software    = (secs.software||[]).join(', ').split(/[,;•·\n]/).map(s=>s.trim())
                     .filter(s=>s.length>1 && s.length<40).slice(0,12).map(s=>({nombre:s, nivel:''}));
  cv.certificaciones=(secs.cursos||[]).slice(0,6).join(' · ').slice(0,300);
  cv.educacion   = (cv.academico[0]||{}).titulo||'';
  cv.oficios     = (cv.experiencia[0]||{}).cargo||'';

  // Qué tan completo quedó: sirve para avisar cuánto hay que revisar a mano.
  const campos=[cv.nombres,cv.rut,cv.email,cv.telefono,cv.experiencia.length,cv.academico.length];
  cv._completitud=Math.round(campos.filter(Boolean).length/campos.length*100);
  return cv;
}
