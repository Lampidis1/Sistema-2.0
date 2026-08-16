// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-match.js — Comparar un cargo con la lista de CVs
// Sistema AM · Antofagasta Minerals
//
// POR QUÉ NO SE USÓ UN MODELO DE IA
// Un modelo de embeddings entiende que "operario de maquinaria pesada" y
// "operador de cargador frontal" se parecen, sin escribir sinónimos. Pero pesa
// más de 100 MB y, sobre todo, NO PUEDE EXPLICAR por qué dio 62%. Acá se
// deciden postulaciones de personas: hay que poder mirar a alguien y decirle
// qué le faltó. Por eso el match es explicable y cada porcentaje viene con su
// desglose (ver `matchDetalle`).
//
// CÓMO PUNTÚA
//   1. Sinónimos primero: el criterio y el CV se expanden con el diccionario
//      de oficios (shared/assets/oficios-mineria.json), así "LHD" encuentra
//      "cargador frontal".
//   2. BM25 para el resto: pondera las palabras raras. "LHD" pesa mucho más
//      que "trabajo", que aparece en todos los CVs. El conteo simple anterior
//      les daba lo mismo.
//   3. La ponderación de cada criterio la define quien publica la oferta;
//      eso no cambia.
//
// El diccionario se carga una vez y vive en el repositorio: sin llamadas a
// terceros y sin exponer datos de las personas (CLAUDE.md Reglas 5 y 6).
//
// <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

let OFICIOS = null;        // diccionario cargado
let _SINONIMOS = null;     // término normalizado → grupo canónico
let _IDF = null;           // palabra → idf, recalculado cuando cambia la lista de CVs
let _IDF_N = 0;

async function cargarDiccionarioOficios(){
  if(OFICIOS) return OFICIOS;
  try{
    const r=await fetch('../../shared/assets/oficios-mineria.json');
    OFICIOS=await r.json();
  }catch(e){
    console.warn('diccionario de oficios',e);
    OFICIOS={oficios:[],competencias:[]};   // sin diccionario el match igual funciona, con menos alcance
  }
  _SINONIMOS={};
  [...(OFICIOS.oficios||[]), ...(OFICIOS.competencias||[])].forEach(o=>{
    const canon=mNorm(o.nombre);
    [o.nombre, ...(o.sinonimos||[])].forEach(s=>{ _SINONIMOS[mNorm(s)]=canon; });
  });
  return OFICIOS;
}

// Normaliza: minúsculas, sin tildes, sin puntuación.
function mNorm(s){
  return String(s==null?'':s).toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ]+/g,' ').trim();
}

// Palabras que no distinguen a nadie: aparecen en todos los CVs.
const M_STOP=new Set(['de','la','el','en','y','o','a','con','del','los','las','un','una','para','por','al',
  'que','se','su','sus','como','mas','muy','trabajo','trabajos','laboral','experiencia','ano','anos','año','años',
  'curriculum','vitae','cv','datos','personales','nivel','tipo','clase','empresa','area','general','realizar',
  'apoyo','tareas','funciones','cargo','desde','hasta','actual','actualidad']);

const mTokens = t => mNorm(t).split(' ').filter(w=>w.length>2 && !M_STOP.has(w));

// Reemplaza en el texto cada sinónimo conocido por su término canónico, de
// modo que "lhd" y "cargador frontal" terminen siendo la misma palabra.
function mCanonizar(texto){
  let t=' '+mNorm(texto)+' ';
  if(!_SINONIMOS) return t.trim();
  // primero las frases largas: "cargador frontal" antes que "cargador"
  Object.keys(_SINONIMOS).sort((a,b)=>b.length-a.length).forEach(s=>{
    if(!s || s.length<3) return;
    if(t.includes(' '+s+' ')) t=t.split(' '+s+' ').join(' '+_SINONIMOS[s].replace(/ /g,'_')+' ');
  });
  return t.trim();
}

// ¿Este texto nombra un oficio del diccionario? Lo usa el lector para saber
// cuál de dos trozos de una línea es el cargo y cuál la empresa.
// Devuelve 2 si el texto ES un oficio, 1 si solo lo menciona, 0 si no.
// La diferencia importa: "Casino Melipal" MENCIONA un oficio (casino) pero es
// el nombre de la empresa; "Cocinera" ES el oficio.
function esOficioConocido(texto){
  const t=mNorm(texto); if(!t || !_SINONIMOS) return 0;
  if(_SINONIMOS[t]) return 2;
  return Object.keys(_SINONIMOS).some(s=>s.length>4 && t.includes(s)) ? 1 : 0;
}

// ── BM25 ────────────────────────────────────────────────────────────────────
// Una palabra que está en 3 de 200 CVs identifica; una que está en 190 no.
// El idf mide eso; se recalcula cuando cambia el conjunto de CVs.
const BM25_K1=1.5, BM25_B=0.75;

function mConstruirIDF(listaCVs){
  const docs=listaCVs.map(cv=>new Set(mTokens(mCanonizar(cvTexto(cv)))));
  const N=docs.length||1;
  const df={};
  docs.forEach(d=>d.forEach(w=>{ df[w]=(df[w]||0)+1; }));
  _IDF={}; _IDF_N=N;
  Object.keys(df).forEach(w=>{ _IDF[w]=Math.log(1+(N-df[w]+0.5)/(df[w]+0.5)); });
  // largo promedio, para no premiar al CV que escribió más
  _IDF._avg = docs.reduce((s,d)=>s+d.size,0)/N || 1;
}

function mIdf(w){
  if(!_IDF) return 1;
  // una palabra que no está en ningún CV es la más distintiva de todas
  return _IDF[w]!=null ? _IDF[w] : Math.log(1+(_IDF_N+0.5)/0.5);
}

// Puntaje de un criterio contra un CV: 0 a 1, con el detalle de qué palabras
// se encontraron y cuáles no.
function mCriterio(criterioTexto, cvCanon, cvTokens, largoCV){
  const canonC=mCanonizar(criterioTexto);
  const palabras=mTokens(canonC);
  const detalle={encontradas:[], faltantes:[]};

  if(!palabras.length) return {score:0, detalle};

  // la frase completa aparece tal cual → cumple entero
  if(canonC && (' '+cvCanon+' ').includes(' '+canonC+' ')){
    detalle.encontradas=palabras.slice();
    return {score:1, detalle};
  }

  const avg=(_IDF&&_IDF._avg)||1;
  let num=0, den=0;
  palabras.forEach(w=>{
    const idf=mIdf(w);
    den+=idf;
    // frecuencia del término en el CV (con raíz, para minero/minera/minería)
    const raiz=w.slice(0,Math.max(4,Math.floor(w.length*0.75)));
    const tf=cvTokens.filter(t=>t===w || t.startsWith(raiz)).length;
    if(tf>0){
      const norm=tf*(BM25_K1+1)/(tf+BM25_K1*(1-BM25_B+BM25_B*largoCV/avg));
      num+=idf*Math.min(1,norm/(BM25_K1+1)*2);   // acotado a 1 por palabra
      detalle.encontradas.push(w);
    } else {
      detalle.faltantes.push(w);
    }
  });
  return {score: den?Math.min(1,num/den):0, detalle};
}

// ── API que usa el módulo ───────────────────────────────────────────────────
// Devuelve el porcentaje Y el desglose. La pantalla puede mostrar solo el
// número, pero el desglose siempre está disponible para justificarlo.
function matchDetalle(cv, oferta){
  const crits=((oferta&&oferta.criterios)||[]).filter(c=>(c.texto||'').trim());
  if(!crits.length) return {pct:0, criterios:[], sinCriterios:true};

  const canon=mCanonizar(cvTexto(cv));
  const toks=mTokens(canon);
  const largo=toks.length||1;
  const sumP=crits.reduce((a,c)=>a+(Math.max(0,+c.ponderacion||0)),0)||crits.length;

  let got=0;
  const filas=crits.map(c=>{
    const pond=Math.max(0,+c.ponderacion||0)||(100/crits.length);
    const r=mCriterio(c.texto, canon, toks, largo);
    got+=pond*r.score;
    return {texto:c.texto, ponderacion:Math.round(pond), score:r.score,
            aporta:Math.round(pond*r.score), ...r.detalle};
  });
  filas.sort((a,b)=>b.aporta-a.aporta);
  return {pct:Math.round(got/sumP*100), criterios:filas};
}

// Reemplaza al matchPct anterior: misma firma, mejor motor.
function matchPct2(cv, oferta){ return matchDetalle(cv,oferta).pct; }

// Frase corta para la lista: qué le falta a esta persona para el cargo.
function matchResumen(cv, oferta){
  const d=matchDetalle(cv,oferta);
  if(d.sinCriterios) return 'La oferta no tiene criterios definidos.';
  const falta=d.criterios.filter(c=>c.score<0.5);
  if(!falta.length) return 'Cumple todos los criterios de la oferta.';
  return 'Falta: '+falta.slice(0,3).map(c=>c.texto).join(', ')+(falta.length>3?` y ${falta.length-3} más`:'');
}

// ── Panel de explicación ────────────────────────────────────────────────────
function matchExplicar(cvId, ofertaId){
  const cv=CVS.find(c=>c.cv_id===cvId);
  const of=OFERTAS.find(o=>o.oferta_id===ofertaId)||OFERTAS.find(o=>o.oferta_id===OFERTA_MATCH);
  if(!cv||!of){ toast('Elige una oferta para comparar','err'); return; }
  const d=matchDetalle(cv,of);
  const col=d.pct>=70?'#1e7e34':d.pct>=40?'#b8860b':'#c0311b';

  document.getElementById('mxBody').innerHTML=`
    <div class="mx-head">
      <div>
        <div class="mx-quien">${esc((cv.nombres||'')+' '+(cv.apellidos||''))}</div>
        <div class="mx-vs">frente a <b>${esc(of.cargo||of.empresa||'la oferta')}</b></div>
      </div>
      <div class="mx-pct" style="color:${col}">${d.pct}%</div>
    </div>
    <table class="mx-tabla">
      <thead><tr><th>Criterio</th><th class="num">Peso</th><th>Resultado</th><th class="num">Aporta</th></tr></thead>
      <tbody>${d.criterios.map(c=>{
        const est=c.score>=0.99?'cumple':c.score>=0.5?'parcial':'no';
        return `<tr>
          <td><b>${esc(c.texto)}</b>
            ${c.encontradas.length?`<div class="mx-kw ok">encontrado: ${c.encontradas.map(esc).join(', ')}</div>`:''}
            ${c.faltantes.length?`<div class="mx-kw no">no aparece: ${c.faltantes.map(esc).join(', ')}</div>`:''}
          </td>
          <td class="num">${c.ponderacion}</td>
          <td><span class="mx-est ${est}">${est==='cumple'?'✓ cumple':est==='parcial'?'~ parcial':'✕ no aparece'}</span></td>
          <td class="num"><b>${c.aporta}</b></td>
        </tr>`;
      }).join('')}</tbody>
    </table>
    <div class="mx-nota">El puntaje pondera las palabras poco frecuentes: un término que aparece en
      casi todos los CVs distingue menos que uno específico del cargo. Los sinónimos del rubro
      (por ejemplo LHD = cargador frontal) se consideran equivalentes.</div>`;
  document.getElementById('mxModal').classList.add('show');
}
function matchCerrarExplicacion(){ document.getElementById('mxModal').classList.remove('show'); }
