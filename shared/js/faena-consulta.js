// ═══════════════════════════════════════════════════════════════════════════
// faena-consulta.js — Consulta de proveedores por faena (SOLO LECTURA)
//
// Compartido por Centinela, Antucoya y Zaldívar. Antes era el mismo archivo
// triplicado: los 3 .css eran byte a byte idénticos y los .js sólo diferían en
// 7 lugares, todos el nombre de la faena.
//
// CADA MÓDULO DEBE DEFINIR window.FAENA_CFG ANTES DE CARGAR ESTE ARCHIVO:
//
//   <script>window.FAENA_CFG = {
//     nombre: 'Zaldívar',    // se muestra al usuario (puede llevar tilde)
//     clave:  'Zaldivar',    // clave de datos (SIN tilde) — ojo: no siempre
//                            //   coincide con `nombre`. En Zaldívar difieren.
//     slug:   'zaldivar'     // slug de acceso en app_metadata.accesos
//   };</script>              //   y de ahí sale la columna pub_<slug>
//   <script src="../../shared/js/faena-consulta.js"></script>
//
// Cargar con <script src> clásico. NUNCA type="module": los onclick del HTML
// necesitan que estas funciones sean globales. Ver CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

const CFG_FAENA = window.FAENA_CFG || {};
if(!CFG_FAENA.nombre || !CFG_FAENA.clave || !CFG_FAENA.slug){
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.innerHTML = '<div style="font:16px system-ui;padding:40px;text-align:center">'
      + 'Error de configuración: falta <code>window.FAENA_CFG</code>.<br>'
      + 'Revisa el index.html de este módulo.</div>';
  });
  throw new Error('faena-consulta.js: falta window.FAENA_CFG');
}


// ═══════════════════════════════════════════════════════════════════
// ICONOS DE RUBRO (estilo Lucide, línea, currentColor) — v11 estética
// ═══════════════════════════════════════════════════════════════════
const RUBRO_ICONS = {
  hospedaje:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>',
  alimentacion:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M5 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  transporte:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
  maquinaria:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>',
  construccion:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M5 20V8l7-5 7 5v12"/><path d="M9 20v-6h6v6"/></svg>',
  aseo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 22-1-4"/><path d="M19 13.99a1 1 0 0 0 1-1V12a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v.99a1 1 0 0 0 1 1H19Z"/><path d="M5 14v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/><path d="m8 22 1-4"/></svg>',
  seguridad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/></svg>',
  ferreteria:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/></svg>',
  electricidad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
  combustible:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>',
  salud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2z"/></svg>',
  tecnologia:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>',
  consultoria:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>',
  default:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
};
function rubroIcon(rubro){
  const s=String(rubro||'').toLowerCase();
  if(/hospedaj|hotel|hostal|aloj|caba|pensi|residenci/.test(s)) return RUBRO_ICONS.hospedaje;
  if(/aliment|restaur|banquet|cocina|catering|comida/.test(s)) return RUBRO_ICONS.alimentacion;
  if(/transport|carga|flota|cami|bus|traslad|logist/.test(s)) return RUBRO_ICONS.transporte;
  if(/maquinari|equipo|excavad|retroexca|gr[uú]a|maquina/.test(s)) return RUBRO_ICONS.maquinaria;
  if(/construc|obra|edificaci|movimiento de tierra|hormig/.test(s)) return RUBRO_ICONS.construccion;
  if(/aseo|limpiez|sanitiz|jardin|paisaj/.test(s)) return RUBRO_ICONS.aseo;
  if(/segurid|vigilanc|guardi|protecc/.test(s)) return RUBRO_ICONS.seguridad;
  if(/ferreter|herramient|insumo/.test(s)) return RUBRO_ICONS.ferreteria;
  if(/electric|el[eé]ctric|energ/.test(s)) return RUBRO_ICONS.electricidad;
  if(/combustib|petr[oó]le|lubricant|gas/.test(s)) return RUBRO_ICONS.combustible;
  if(/salud|m[eé]dic|enfermer|cl[ií]nic|hospital|ambulanc/.test(s)) return RUBRO_ICONS.salud;
  if(/tecnolog|inform[aá]tic|software|computac|ti\b/.test(s)) return RUBRO_ICONS.tecnologia;
  if(/consultor|asesor|ingenier|estudi/.test(s)) return RUBRO_ICONS.consultoria;
  return RUBRO_ICONS.default;
}


const FAENA         = CFG_FAENA.nombre;
const FAENA_KEY     = CFG_FAENA.clave;
const PAGINA_ORIGEN = CFG_FAENA.slug;
const PUB_COL       = 'pub_' + CFG_FAENA.slug;
let SB=null, DATA=[], CONTACTOS={}, RANGO='', RUBRO='', SEL=new Set(), USER=null;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tel=raw=>{ if(!raw)return''; let d=String(raw).replace(/[^0-9+]/g,''); if(d&&d[0]!=='+'){ if(d.startsWith('56'))d='+'+d; else if(d.length===9||d.length===8)d='+56'+d; } return d; };
function dispName(p){ return (p.nombre_fantasia&&p.nombre_fantasia.length>2&&(p.nombre_fantasia||'').toLowerCase()!==(p.razon_social||'').toLowerCase())?p.nombre_fantasia:(p.razon_social||p.nombre_fantasia||'Proveedor'); }
function gErr(m){ const e=document.getElementById('gErr'); e.textContent=m||''; e.style.display=m?'block':'none'; }

function initSB(){ if(!window.SUPA_CFG){ gErr('Falta config.js'); return false; } SB=window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key, {auth:{persistSession:true,storageKey:'am_pub_'+PUB_COL}}); return true; }

// ── URLs firmadas (P-1b) ────────────────────────────────────────────────
// Este modulo es de solo lectura: nunca sube archivos, solo muestra fotos
// que subio proveedores.js. Mismo mecanismo de firma que alla.
function _rutaDocumentoFaena(url){
  if(!url) return null;
  const m=String(url).match(/\/object\/public\/documentos\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : url;
}
function resolverUrlFirmadaFaena(url, ttlSeg){
  if(!url) return Promise.resolve(null);
  if(!SB) return Promise.resolve(url);
  return SB.storage.from('documentos').createSignedUrl(_rutaDocumentoFaena(url), ttlSeg||3600)
    .then(function(r){ return (r.error||!r.data) ? null : r.data.signedUrl; })
    .catch(function(){ return null; });
}
function _hidratarImgsFirmadasFaena(root){
  var imgs=[];
  if(root.nodeType===1 && root.matches && root.matches('img[data-firmar]')) imgs.push(root);
  if(root.querySelectorAll){ var found=root.querySelectorAll('img[data-firmar]'); for(var i=0;i<found.length;i++) imgs.push(found[i]); }
  imgs.forEach(function(img){
    var raw=img.getAttribute('data-firmar'); if(!raw) return;
    img.removeAttribute('data-firmar');
    resolverUrlFirmadaFaena(raw).then(function(u){ if(u) img.src=u; });
  });
}
(function _iniciarHidratacionImagenesFaena(){
  var start=function(){ new MutationObserver(function(muts){
    muts.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType===1) _hidratarImgsFirmadasFaena(n); }); });
  }).observe(document.body,{childList:true,subtree:true}); };
  if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
})();

async function entrar(){
  gErr(''); if(!SB && !initSB()) return;
  const email=document.getElementById('gEmail').value.trim(), pass=document.getElementById('gPass').value;
  if(!email||!pass){ gErr('Ingresa correo y contraseña'); return; }
  const btn=document.getElementById('gBtn'); btn.disabled=true; btn.textContent='Verificando...';
  try{
    const {data,error}=await SB.auth.signInWithPassword({email,password:pass});
    if(error) throw error;
    USER=data.user;
    await trasLogin();
  }catch(e){ gErr(e.message==='Invalid login credentials'?'Correo o contraseña incorrectos':e.message); }
  finally{ btn.disabled=false; btn.textContent='Ingresar'; }
}

async function trasLogin(){
  // bloquear si no está aprobado (salvo admin)
  const md=(USER&&USER.app_metadata)||{};
  const accesos=Array.isArray(md.accesos)?md.accesos:[];
  const puedeEntrar = md.rol==='admin' || (md.estado==='aprobado' && accesos.includes(PAGINA_ORIGEN));
  if(!puedeEntrar){
    await SB.auth.signOut(); USER=null;
    verLogin();
    gErr(md.estado==='rechazado'?'Tu acceso fue rechazado.':(md.estado!=='aprobado'?'Tu cuenta está pendiente de aprobación del administrador.':'Tu cuenta no tiene acceso a '+FAENA+'.'));
    return;
  }
  // perfil (nombre)
  let nombre='';
  try{ const {data}=await SB.from('perfiles').select('*').eq('id',USER.id).maybeSingle(); if(data&&data.nombre){ nombre=(data.nombre+' '+(data.apellido||'')).trim(); } }catch(e){}
  if(!nombre){ document.getElementById('loginStep').style.display='none'; document.getElementById('perfStep').style.display='block'; return; }
  document.getElementById('uName').textContent=nombre;
  document.getElementById('gate').style.display='none';
  cargar();
}

async function guardarPerfilPub(){
  const n=document.getElementById('gNombre').value.trim(), a=document.getElementById('gApellido').value.trim();
  if(!n){ gErr('Ingresa tu nombre'); return; }
  try{ await SB.from('perfiles').upsert({id:USER.id,nombre:n,apellido:a,email:USER.email,updated_at:new Date().toISOString()},{onConflict:'id'}); }catch(e){ gErr('Error: '+e.message); return; }
  document.getElementById('uName').textContent=(n+' '+a).trim();
  document.getElementById('gate').style.display='none';
  cargar();
}

async function salir(){ try{ await SB.auth.signOut(); }catch(e){} location.reload(); }

async function cargar(){
  document.getElementById('cont').innerHTML='<div class="loading">Cargando proveedores…</div>';
  try{
    // RLS filtra automáticamente por la faena del usuario; igual filtramos por la columna
    const {data:prov,error}=await SB.from('proveedores').select('*').eq(PUB_COL,true).neq('estado_registro','Eliminado');
    if(error) throw error;
    DATA=prov||[];
    const ids=DATA.map(p=>p.proveedor_id);
    if(ids.length){ const {data:cts}=await SB.from('contactos').select('*').in('proveedor_id',ids); (cts||[]).forEach(c=>{ (CONTACTOS[c.proveedor_id]=CONTACTOS[c.proveedor_id]||[]).push(c); }); }
    buildFiltros(); render();
  }catch(e){ document.getElementById('cont').innerHTML='<div class="empty">No se pudieron cargar los proveedores.<br><small>'+esc(e.message)+'</small></div>'; }
}

function buildFiltros(){
  const rangos=[...new Set(DATA.map(p=>p.rango_trabajos).filter(Boolean))];
  const rubros=[...new Set(DATA.flatMap(p=>String(p.rubros_norm||'').split('|').map(s=>s.trim()).filter(Boolean)))].sort();
  const c=document.getElementById('filtros'); let h='';
  if(rubros.length){
    h+='<div class="fa-fgroup-lbl">🏷 Rubro</div>';
    h+='<div class="chip chip-ico '+(RUBRO===''?'active':'')+'" onclick="setRubro(\'\')"><span class="cico">'+rubroIcon('')+'</span>Todos</div>';
    h+=rubros.map(r=>'<div class="chip chip-ico '+(RUBRO===r?'active':'')+'" onclick="setRubro(\''+esc(r).replace(/\x27/g,"\\x27")+'\')"><span class="cico">'+rubroIcon(r)+'</span>'+esc(r)+'</div>').join('');
  }
  if(rangos.length){
    h+='<div class="fa-fgroup-lbl">📐 Rango de trabajos</div>';
    h+='<div class="chip '+(RANGO===''?'active':'')+'" onclick="setRango(\'\')">Todos</div>';
    h+=rangos.map(r=>'<div class="chip '+(RANGO===r?'active':'')+'" onclick="setRango(\''+esc(r).replace(/\x27/g,"\\x27")+'\')">'+esc(r)+'</div>').join('');
  }
  c.innerHTML=h;
}
function setRubro(r){ RUBRO=r; buildFiltros(); render(); }
function setRango(r){ RANGO=r; buildFiltros(); render(); }

function filtered(){
  const q=(document.getElementById('q').value||'').toLowerCase().trim();
  return DATA.filter(p=>{
    if(RANGO && p.rango_trabajos!==RANGO) return false;
    if(RUBRO && !String(p.rubros_norm||'').split('|').map(s=>s.trim()).includes(RUBRO)) return false;
    if(q){ const cs=(CONTACTOS[p.proveedor_id]||[]).map(c=>c.nombre+' '+c.cargo).join(' ');
      const hay=[p.razon_social,p.nombre_fantasia,p.localidad,p.giros_sii,p.rubros_norm,p.descripcion_general,cs].join(' ').toLowerCase();
      if(!hay.includes(q)) return false; }
    return true;
  });
}

function toggleSel(id){ if(SEL.has(id))SEL.delete(id); else SEL.add(id); render(); }

function render(){
  const data=filtered();
  document.getElementById('count').textContent=data.length+' proveedor'+(data.length===1?'':'es');
  const btn=document.getElementById('btnXls'); btn.disabled=SEL.size===0; btn.textContent='⬇ Descargar selección ('+SEL.size+')';
  const cont=document.getElementById('cont');
  if(!data.length){ cont.innerHTML='<div class="empty">Sin proveedores publicados para esta faena.</div>'; return; }
  cont.innerHTML='<div class="grid">'+data.map(p=>{
    const name=dispName(p), cs=CONTACTOS[p.proveedor_id]||[];
    const cp=cs.find(c=>String(c.principal).toUpperCase()==='TRUE')||cs[0]||null;
    const fono=(cp&&cp.fono)||p.fono_empresa||'', correo=(cp&&cp.correo)||p.correo_empresa||'';
    const rubros=String(p.rubros_norm||'').split('|').map(s=>s.trim()).filter(Boolean).slice(0,4);
    const sel=SEL.has(p.proveedor_id);
    return '<div class="dc-card'+(sel?' selected':'')+'">'+
      '<div class="dc-selbox" onclick="toggleSel(\''+p.proveedor_id+'\')"></div>'+
      '<div class="dc-top">'+
        '<div class="dc-ri">'+rubroIcon(rubros[0]||'')+'</div>'+
        (p.rango_trabajos?'<div class="dc-rango">'+esc(p.rango_trabajos)+'</div>':'')+
        '<div class="dc-nombre">'+esc(name)+'</div>'+
        '<div class="dc-loc">📍 '+esc(p.localidad||'')+'</div></div>'+
      '<div class="dc-tags">'+(rubros[0]?'<span class="dc-tag t-teal">'+esc(rubros[0])+'</span>':'')+
        rubros.slice(1).map(r=>'<span class="dc-tag t-lt">'+esc(r)+'</span>').join('')+'</div>'+
      (((p.pub_centinela||p.pub_zaldivar||p.pub_antucoya)||p.plataformas_mineras)?'<div class="dc-exp-row">'+
        (p.pub_centinela?'<span class="dc-exp">⛏ CEN</span>':'')+(p.pub_zaldivar?'<span class="dc-exp">⛏ CMZ</span>':'')+(p.pub_antucoya?'<span class="dc-exp">⛏ ANT</span>':'')+
        String(p.plataformas_mineras||'').split(/[,;\/|]+/).map(s=>s.trim()).filter(Boolean).map(pl=>'<span class="dc-plat">'+esc(pl)+'</span>').join('')+'</div>':'')+
      '<div class="dc-mid">'+(cp?'<div class="dc-contact">👤 <b>'+esc(cp.nombre||'')+'</b>'+(cp.cargo?' · '+esc(cp.cargo):'')+(fono?'<br>📞 '+esc(fono):'')+(correo?'<br>✉ '+esc(correo):'')+'</div>':'')+'</div>'+
      '<div class="dc-bot">'+
        '<button class="dc-cta" onclick="verFicha(\''+p.proveedor_id+'\')">Ver ficha →</button>'+
        (tel(fono)?'<a class="dc-act call" href="tel:'+tel(fono)+'">📞</a>':'')+
        (correo?'<a class="dc-act mail" href="mailto:'+esc(correo)+'">✉</a>':'')+'</div></div>';
  }).join('')+'</div>';
}

function descargarSeleccion(){
  if(!SEL.size) return;
  const sel=DATA.filter(p=>SEL.has(p.proveedor_id));
  const rows=sel.map(p=>{
    const cs=CONTACTOS[p.proveedor_id]||[]; const cp=cs.find(c=>String(c.principal).toUpperCase()==='TRUE')||cs[0]||{};
    return {
      'Razón social':p.razon_social||'', 'Nombre fantasía':p.nombre_fantasia||'', 'RUT':p.rut_empresa||'',
      'Localidad':p.localidad||'', 'Rubros':String(p.rubros_norm||'').split('|').join(', '),
      'Rango de trabajos':p.rango_trabajos||'', 'Contacto':cp.nombre||'', 'Cargo':cp.cargo||'',
      'Teléfono':(cp.fono||p.fono_empresa||''), 'Correo':(cp.correo||p.correo_empresa||''),
      'Dirección':p.direccion||'', 'Descripción':p.descripcion_general||''
    };
  });
  // ── Excel con estética Antofagasta Minerals ──
  const cols=Object.keys(rows[0]||{});
  const fecha=new Date().toLocaleDateString('es-CL');
  // Construir AOA con título corporativo en las primeras filas
  const aoa=[];
  aoa.push(['ANTOFAGASTA MINERALS']);
  aoa.push(['Directorio de Proveedores Comunitarios · Faena '+FAENA]);
  aoa.push(['Generado: '+fecha+'  ·  '+rows.length+' proveedores']);
  aoa.push([]);
  aoa.push(cols);
  rows.forEach(r=>aoa.push(cols.map(c=>r[c])));
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols']=cols.map(c=>({wch: c==='Descripción'?40:(c==='Correo'||c==='Dirección'?28:20)}));
  // Combinar celdas del título
  ws['!merges']=[
    {s:{r:0,c:0},e:{r:0,c:cols.length-1}},
    {s:{r:1,c:0},e:{r:1,c:cols.length-1}},
    {s:{r:2,c:0},e:{r:2,c:cols.length-1}}
  ];
  // Estilos (color corporativo teal/dorado) — requiere XLSX con soporte de estilos
  const TEAL='FF006973', GOLD='FFF2A900', WHITE='FFFFFFFF';
  function st(cell,style){ if(ws[cell]) ws[cell].s=style; }
  st('A1',{font:{bold:true,sz:16,color:{rgb:TEAL}},alignment:{horizontal:'left'}});
  st('A2',{font:{bold:true,sz:11,color:{rgb:'FF1C2632'}}});
  st('A3',{font:{sz:9,color:{rgb:'FF5F6973'}}});
  // Header de tabla (fila 5 = índice 4)
  for(let ci=0;ci<cols.length;ci++){
    const ref=XLSX.utils.encode_cell({r:4,c:ci});
    if(ws[ref]) ws[ref].s={font:{bold:true,color:{rgb:WHITE},sz:10},fill:{fgColor:{rgb:TEAL}},alignment:{horizontal:'center',vertical:'center',wrapText:true},border:{bottom:{style:'thin',color:{rgb:GOLD}}}};
  }
  // Filas alternadas
  for(let ri=5;ri<aoa.length;ri++){
    for(let ci=0;ci<cols.length;ci++){
      const ref=XLSX.utils.encode_cell({r:ri,c:ci});
      if(ws[ref]) ws[ref].s={font:{sz:9,color:{rgb:'FF1C2632'}},fill:{fgColor:{rgb: ri%2===0?'FFF4F7F8':WHITE}},alignment:{vertical:'top',wrapText:true},border:{bottom:{style:'hair',color:{rgb:'FFD7DEE4'}}}};
    }
  }
  ws['!rows']=[{hpt:22},{hpt:16},{hpt:13},{hpt:6},{hpt:26}];
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Proveedores '+FAENA);
  XLSX.writeFile(wb,'Proveedores_'+FAENA+'_'+new Date().toISOString().slice(0,10)+'.xlsx');
}

function verRegistro(){ document.getElementById('loginStep').style.display='none'; document.getElementById('perfStep').style.display='none'; document.getElementById('regStep').style.display='block'; gErr(''); }
function verLogin(){ document.getElementById('regStep').style.display='none'; document.getElementById('perfStep').style.display='none'; document.getElementById('loginStep').style.display='block'; gErr(''); }

async function registrarsePub(){
  gErr(''); if(!SB && !initSB()) return;
  const nombre=document.getElementById('rNombre').value.trim();
  const apellido=document.getElementById('rApellido').value.trim();
  const email=document.getElementById('rEmail').value.trim().toLowerCase();
  const pass=document.getElementById('rPass').value;
  if(!nombre||!email||!pass){ gErr('Completa nombre, correo y contraseña'); return; }
  if(pass.length<6){ gErr('La contraseña debe tener al menos 6 caracteres'); return; }
  try{
    const {data,error}=await SB.auth.signUp({email,password:pass});
    if(error) throw error;
    const uid=data.user&&data.user.id;
    if(uid){ try{ await SB.rpc('registrar_solicitud',{p_uid:uid,p_nombre:nombre,p_apellido:apellido,p_email:email,p_origen:PAGINA_ORIGEN,p_rol_sol:'abastecimiento',p_faena_sol:FAENA_KEY}); }catch(e){} }
    verLogin();
    alert('Tu solicitud fue enviada y está PENDIENTE de aprobación por el administrador. Cuando te aprueben, podrás iniciar sesión.');
  }catch(e){ gErr(e.message.includes('already registered')?'Ese correo ya está registrado':e.message); }
}

// auto-sesión si ya había login
(async()=>{ if(!initSB())return; try{ const {data}=await SB.auth.getSession(); if(data&&data.session){ try{const {data:ref}=await SB.auth.refreshSession();if(ref&&ref.session)USER=ref.session.user;else USER=data.session.user;}catch(e){USER=data.session.user;} await trasLogin(); } }catch(e){} })();

function toggleSidebar(){ const sb=document.getElementById('sidebarFa'); if(sb) sb.classList.toggle('show'); }

// ═══ FICHA DETALLE + PDF v12 (faena) ═══
var _FICHA_ACTUAL=null;
const LOGO_AMSA_PDF = "data:image/png;base64,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";
function verFicha(pid){
  const p=DATA.find(x=>x.proveedor_id===pid); if(!p) return;
  _FICHA_ACTUAL=p;
  const cs=CONTACTOS[pid]||[]; const cp=cs.find(c=>String(c.principal).toUpperCase()==='TRUE')||cs[0]||null;
  const name=dispName(p);
  document.getElementById('fmLoc').textContent=(p.localidad||'')+(p.rango_trabajos?'  ·  '+p.rango_trabajos:'');
  document.getElementById('fmNom').textContent=name;
  const razon=(p.razon_social&&p.razon_social.toLowerCase()!==name.toLowerCase())?p.razon_social:'';
  document.getElementById('fmRazon').textContent=razon;
  const rubros=String(p.rubros_norm||'').split('|').map(s=>s.trim()).filter(Boolean);
  const giros=String(p.giros_sii||'').split(/[\n;]+/).map(s=>s.trim()).filter(Boolean);
  const exp=[]; if(p.pub_centinela)exp.push('Centinela'); if(p.pub_zaldivar)exp.push('Zaldívar'); if(p.pub_antucoya)exp.push('Antucoya');
  let h='';
  h+='<div class="fm-sec"><div class="fm-sec-t">Rubros y giros</div>';
  if(rubros.length) h+='<div class="fm-row"><b>Rubros</b><span>'+rubros.join(' · ')+'</span></div>';
  if(giros.length) h+='<div class="fm-row"><b>Giros SII</b><span>'+giros.join(' · ')+'</span></div>';
  h+='</div>';
  h+='<div class="fm-sec"><div class="fm-sec-t">Contacto</div>';
  if(cp){ if(cp.nombre)h+='<div class="fm-row"><b>Nombre</b><span>'+esc(cp.nombre)+'</span></div>';
    if(cp.cargo)h+='<div class="fm-row"><b>Cargo</b><span>'+esc(cp.cargo)+'</span></div>';
    if(cp.fono||p.fono_empresa)h+='<div class="fm-row"><b>Teléfono</b><span>'+esc(cp.fono||p.fono_empresa)+'</span></div>';
    if(cp.correo||p.correo_empresa)h+='<div class="fm-row"><b>Correo</b><span>'+esc(cp.correo||p.correo_empresa)+'</span></div>';
  } else { if(p.fono_empresa)h+='<div class="fm-row"><b>Teléfono</b><span>'+esc(p.fono_empresa)+'</span></div>';
    if(p.correo_empresa)h+='<div class="fm-row"><b>Correo</b><span>'+esc(p.correo_empresa)+'</span></div>'; }
  if(p.rut_empresa)h+='<div class="fm-row"><b>RUT</b><span>'+esc(p.rut_empresa)+'</span></div>';
  if(p.direccion)h+='<div class="fm-row"><b>Dirección</b><span>'+esc(p.direccion)+'</span></div>';
  h+='</div>';
  if(exp.length||p.plataformas_mineras){ h+='<div class="fm-sec"><div class="fm-sec-t">Experiencia minera AMSA</div>';
    if(exp.length)h+='<div class="fm-row"><b>Faenas</b><span>'+exp.join(' · ')+'</span></div>';
    if(p.plataformas_mineras)h+='<div class="fm-row"><b>Plataformas</b><span>'+esc(p.plataformas_mineras)+'</span></div>'; h+='</div>'; }
  // Datos comerciales / clasificación
  if(p.categoria_sii||p.estado_facturacion||p.agrupacion_gremial){
    h+='<div class="fm-sec"><div class="fm-sec-t">Datos comerciales</div>';
    if(p.categoria_sii)h+='<div class="fm-row"><b>Categoría SII</b><span>'+esc(p.categoria_sii)+'</span></div>';
    if(p.estado_facturacion)h+='<div class="fm-row"><b>Facturación</b><span>'+esc(p.estado_facturacion)+'</span></div>';
    if(p.agrupacion_gremial&&p.agrupacion_gremial!=='No pertenece')h+='<div class="fm-row"><b>Agrupación</b><span>'+esc(p.agrupacion_gremial)+'</span></div>';
    h+='</div>';
  }
  // ── columna derecha: descripción + fotos (estilo directorio index) ──
  let d='';
  if(p.descripcion_general&&p.descripcion_general.trim()){ d+='<div class="fm-sec"><div class="fm-sec-t">≡ Descripción general</div><div style="font-size:.92rem;line-height:1.65">'+esc(p.descripcion_general)+'</div></div>'; }
  let _fotosF=[]; try{ _fotosF=JSON.parse(p.fotos_json||'[]')||[]; }catch(e){}
  if(_fotosF.length){ d+='<div class="fm-sec"><div class="fm-sec-t">📷 Fotografías</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+_fotosF.slice(0,3).map(function(u){return '<img data-firmar="'+u+'" style="width:31%;aspect-ratio:1.35;object-fit:cover;border-radius:8px;border:1px solid #ddd">';}).join('')+'</div></div>'; }
  // Maquinaria / Flota (columna derecha, ancho completo dentro de ella)
  let _flota=[]; try{ _flota=JSON.parse(p.flota_json||'[]')||[]; }catch(e){ _flota=[]; }
  if(_flota.length){
    d+='<div class="fm-sec"><div class="fm-sec-t">⚙ Maquinaria y Equipamiento</div>';
    d+='<table class="fm-flota"><thead><tr><th>Tipo</th><th>Categoría</th><th>Marca</th><th>Modelo</th><th>Año</th><th>Cant.</th><th>Capacidad / Uso</th></tr></thead><tbody>';
    _flota.forEach(f=>{ d+='<tr><td><b>'+esc(f.tipo||'')+'</b></td><td>'+esc(f.categoria||'')+'</td><td>'+esc(f.marca||'')+'</td><td>'+esc(f.modelo||'')+'</td><td>'+esc(f.anio||'')+'</td><td>'+esc(f.cant||'')+'</td><td>'+esc(f.capacidad||'')+'</td></tr>'; });
    d+='</tbody></table></div>';
  }
  document.getElementById('fmBody').innerHTML='<div class="fm-2col" style="display:grid;grid-template-columns:1fr 1.25fr;gap:0 28px"><div style="border-right:1.5px solid #e8eef0;padding-right:18px">'+h+'</div><div>'+(d||'<div style="font-size:.84rem;color:#8a94a0">Sin descripción ni fotografías.</div>')+'</div></div>';
  document.getElementById('fmPdfBtn').onclick=function(){ exportarFichaPDF(pid); };
  document.getElementById('fmodalOv').classList.add('show');
}
function cerrarFicha(){ document.getElementById('fmodalOv').classList.remove('show'); }

async function exportarFichaPDF(pid){
  const p=DATA.find(x=>x.proveedor_id===pid); if(!p) return;
  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'mm',format:'a4'});
    const W=210,M=16,maxW=W-M*2; let y=0;
    const TEAL=[0,105,115], TEAL2=[0,163,153], GOLD=[242,169,0], DARK=[28,38,50], GRAY=[95,105,115], LT=[228,246,245];
    const cs=CONTACTOS[pid]||[]; const cp=cs.find(c=>String(c.principal).toUpperCase()==='TRUE')||cs[0]||null;
    const name=dispName(p);
    doc.setFillColor.apply(doc,[].concat(TEAL)); doc.rect(0,0,W,34,'F');
    try{ doc.addImage(LOGO_AMSA_PDF,'PNG',M,10,46,10.2); }catch(e){}
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(8);
    doc.text('DIRECTORIO DE PROVEEDORES COMUNITARIOS',W-M,14,{align:'right'});
    doc.setFont('helvetica','normal'); doc.setFontSize(7);
    doc.text('Faena '+FAENA+' · '+new Date().toLocaleDateString('es-CL'),W-M,19,{align:'right'});
    y=44;
    doc.setTextColor.apply(doc,[].concat(DARK)); doc.setFont('helvetica','bold'); doc.setFontSize(19);
    const nl=doc.splitTextToSize(name,maxW); doc.text(nl,M,y); y+=nl.length*7.5;
    if(p.razon_social&&p.razon_social.toLowerCase()!==name.toLowerCase()){ doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor.apply(doc,[].concat(GRAY)); doc.text(p.razon_social,M,y); y+=5.5; }
    doc.setFontSize(9); doc.setTextColor.apply(doc,[].concat(TEAL2)); doc.setFont('helvetica','bold');
    doc.text((p.localidad||'')+(p.rango_trabajos?'   ·   '+p.rango_trabajos:''),M,y); y+=3;
    doc.setDrawColor.apply(doc,[].concat(GOLD)); doc.setLineWidth(.8); doc.line(M,y,M+30,y); y+=8;
    function sec(t){ if(y>262){doc.addPage();y=20;} doc.setFillColor.apply(doc,[].concat(LT)); doc.rect(M,y-4.5,maxW,7,'F'); doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor.apply(doc,[].concat(TEAL)); doc.text(t.toUpperCase(),M+2,y); doc.setTextColor.apply(doc,[].concat(DARK)); y+=8; }
    function campo(l,v){ if(!v)return; if(y>275){doc.addPage();y=20;} doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor.apply(doc,[].concat(GRAY)); doc.text(l,M,y); const lw=doc.getTextWidth(l); doc.setFont('helvetica','normal');doc.setTextColor.apply(doc,[].concat(DARK)); const tx=doc.splitTextToSize(String(v),maxW-lw-3); doc.text(tx,M+lw+3,y); y+=tx.length*5+1.5; }
    const rubros=String(p.rubros_norm||'').split('|').map(s=>s.trim()).filter(Boolean);
    const giros=String(p.giros_sii||'').split(/[\n;]+/).map(s=>s.trim()).filter(Boolean);
    sec('Rubros y giros'); campo('Rubros: ',rubros.join(' · ')); campo('Giros SII: ',giros.join(' · ')); y+=2;
    sec('Contacto');
    if(cp){ campo('Nombre: ',cp.nombre); campo('Cargo: ',cp.cargo); campo('Teléfono: ',cp.fono||p.fono_empresa); campo('Correo: ',cp.correo||p.correo_empresa); }
    else { campo('Teléfono: ',p.fono_empresa); campo('Correo: ',p.correo_empresa); }
    campo('RUT: ',p.rut_empresa); campo('Dirección: ',p.direccion); y+=2;
    const exp=[]; if(p.pub_centinela)exp.push('Centinela (CEN)'); if(p.pub_zaldivar)exp.push('Zaldívar (CMZ)'); if(p.pub_antucoya)exp.push('Antucoya (ANT)');
    if(exp.length||p.plataformas_mineras){ sec('Experiencia minera AMSA'); campo('Faenas: ',exp.join(' · ')); campo('Plataformas: ',p.plataformas_mineras); y+=2; }
    if(p.descripcion_general&&p.descripcion_general.trim()){ sec('Servicios y capacidades'); doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor.apply(doc,[].concat(DARK)); const d=doc.splitTextToSize(p.descripcion_general.trim(),maxW); d.forEach(function(l){ if(y>282){doc.addPage();y=20;} doc.text(l,M,y); y+=4.6; }); y+=2; }
    // Maquinaria / Flota
    let _flotaPDF=[]; try{ _flotaPDF=JSON.parse(p.flota_json||'[]')||[]; }catch(e){ _flotaPDF=[]; }
    if(_flotaPDF.length){
      sec('Maquinaria y Equipamiento');
      const cols=[['Tipo',M,30],['Categoría',M+32,28],['Marca',M+62,24],['Modelo',M+88,22],['Año',M+112,14],['Cant.',M+128,12],['Capacidad',M+142,36]];
      doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor.apply(doc,[].concat(GRAY));
      cols.forEach(function(c){ doc.text(c[0],c[1],y); }); y+=1.5;
      doc.setDrawColor.apply(doc,[].concat(GOLD));doc.setLineWidth(.3);doc.line(M,y,W-M,y);y+=4;
      doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor.apply(doc,[].concat(DARK));
      _flotaPDF.forEach(function(f){ if(y>278){doc.addPage();y=20;}
        const vals=[f.tipo||'',f.categoria||'',f.marca||'',f.modelo||'',String(f.anio||''),String(f.cant||''),f.capacidad||''];
        cols.forEach(function(c,ci){ const t=doc.splitTextToSize(String(vals[ci]),c[2]); doc.text(t[0]||'',c[1],y); });
        y+=5.2;
      });
      y+=2;
    }
    // ── Fotografías ──
    let _fpdf=[]; try{ _fpdf=JSON.parse(p.fotos_json||'[]')||[]; }catch(e){}
    if(_fpdf.length){
      const _b64s=await Promise.all(_fpdf.slice(0,3).map(function(u){ return resolverUrlFirmadaFaena(u).then(function(firmada){ return new Promise(function(res){ fetch(firmada||u).then(function(r){return r.blob();}).then(function(b){ const rd=new FileReader(); rd.onload=function(){res(rd.result);}; rd.onerror=function(){res(null);}; rd.readAsDataURL(b); }).catch(function(){res(null);}); }); }); }));
      const _vld=_b64s.filter(Boolean);
      if(_vld.length){
        if(y>240){doc.addPage();y=20;}
        sec('Fotografías');
        const fw=(maxW-2*6)/3, fh=fw*0.72;
        _vld.forEach(function(b64,i){ try{ doc.addImage(b64,'JPEG',M+i*(fw+6),y,fw,fh); }catch(e){} });
        y+=fh+8;
      }
    }
    const pages=doc.internal.getNumberOfPages();
    for(let i=1;i<=pages;i++){ doc.setPage(i); doc.setDrawColor.apply(doc,[].concat(GOLD)); doc.setLineWidth(.5); doc.line(M,288,W-M,288); doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.setTextColor.apply(doc,[].concat(GRAY)); doc.text('Antofagasta Minerals · Proveedores Comunitarios',M,292); doc.text('Pág. '+i+'/'+pages,W-M,292,{align:'right'}); }
    doc.save('Ficha_'+name.replace(/[^a-z0-9]/gi,'_')+'.pdf');
  }catch(e){ alert('Error generando PDF: '+e.message); console.error(e); }
}
