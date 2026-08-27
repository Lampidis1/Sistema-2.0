
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


// ── STATE ───────────────────────────

// Tramos de envergadura de proyecto (rango de trabajos)
const RANGOS_TRABAJO = [
  'CLP · Hasta $10M',
  'CLP · $10M – $50M',
  'CLP · $50M – $200M',
  'CLP · $200M – $500M',
  'CLP · $500M – $1.000M',
  'CLP · Más de $1.000M',
  'USD · Hasta US$50K',
  'USD · US$50K – US$250K',
  'USD · US$250K – US$1M',
  'USD · Más de US$1M'
];
let PROVEEDORES = [];

// ═══ SISTEMA v6 STATE ════════════════════════════════════════════════════════
let DB = {
  visitas:{}, hoteles:{}, acuerdos:{}, programas:{}, contactos:{}, licitaciones:{}, _eliminados:[],
  tarifas:{ simple_clp:50000, doble_clp:80000, tc:950 },
  gsync:{ sheetId:'', lastSync:null }
};
// Programas disponibles — se pueden agregar desde el dashboard
let PROGRAMAS_LIST = [
  'Diagn\u00f3stico Nuevos Proveedores Locales Sierra Gorda',
  'Programa Formaci\u00f3n Proveedores Comunitarios Sierra Gorda',
  'Programa Apoyo X',
];
let currentModalTab = 'datos';
let currentPage = 'directorio';

// ── PERSISTENCIA LOCAL ────────────────────────────────────────────────────
// SEGURIDAD (docs/PENDIENTES.md P-2): en el navegador SOLO se guardan
// preferencias de operacion. Los datos de personas, proveedores, visitas y
// contactos viven unicamente en Supabase y se recargan al iniciar sesion.
// No agregar campos aca sin leer docs/SEGURIDAD.md regla 3.
const CLAVE_PREFS = 'am_v6_prefs';

async function saveDB(){
  try{
    localStorage.setItem(CLAVE_PREFS, JSON.stringify({
      tarifas: DB.tarifas,
      gsync: DB.gsync,
      _inclHotel: DB._inclHotel
    }));
  }catch(e){}
}
async function loadDB(){
  try{
    const s = localStorage.getItem(CLAVE_PREFS);
    if(s){
      const d = JSON.parse(s);
      if(d.tarifas) DB.tarifas = d.tarifas;
      if(d.gsync) DB.gsync = d.gsync;
      if(d._inclHotel !== undefined) DB._inclHotel = d._inclHotel;
    }
  }catch(e){}
  // ── HISTORICO LEGACY (clave 'am_v6_db') ───────────────────────────────────
  // Volcado del sistema anterior a la migracion a Supabase. saveDB() ya no lo
  // reescribe, asi que esta congelado.
  //
  // NO se borra: contiene visitas historicas con fotos que no tienen copia en
  // ninguna tabla. Borrarlo seria irreversible. Ver docs/PENDIENTES.md → P-2.
  //
  // De el solo se rescata lo que no vive en ningun otro lado. Las visitas YA NO
  // se leen: el dashboard ahora usa la tabla 'visitas' de Supabase, que es la
  // fuente real. Leer las viejas solo mostraria datos congelados.
  try{
    const viejo = localStorage.getItem('am_v6_db');
    if(viejo){
      const d = JSON.parse(viejo);
      DB._eliminados   = d._eliminados || [];
      DB.hoteles       = d.hoteles || {};
    }
  }catch(e){}
}

let pendingFiles = [];
let activeLocalidades = new Set(), activeFacturacion = new Set(), activeRubros = new Set(), activeFaenaMinera = new Set();
let activeAgrup = new Set(), activeAM = new Set(), activeRango = new Set();
let activeMGI = new Set();   // 'si' | 'no' — participación en el programa MGI
let filterEditedOnly = false;
let currentView = 'cards';
let chartsInit = false, chartInst = {};
let currentModalId = null;

// ── NORMALIZAR RUBRO ──────────────────────────────────────────────────────────
const RUBROS_MAESTROS=['Hospedaje / Alojamiento','Alimentación / Banquetería','Transporte / Vehículos','Maquinaria','Construcción / Obras','Lavandería / Aseo','Consultoría / Asesoría','Eventos / Capacitación','Artesanías / Manufactura','Tecnología / Electricidad','Insumos / Ferretería','Seguridad','Otros Servicios'];
function normRubro(g) {
  if (!g) return null;
  const s = g.toString().trim().toLowerCase();
  if (/hospedaje|alojamiento|hotel|hostal|arriendo.*casa|alquiler.*inmueble|arriendo.*inmueble|residencial/.test(s)) return 'Hospedaje / Alojamiento';
  if (/banqueter|cociner|alimentac|restaurante|comida|amasander|pasteler|colacion/.test(s)) return 'Alimentación / Banquetería';
  if (/transporte|arriendo.*veh|alquiler.*veh|traslado/.test(s)) return 'Transporte / Vehículos';
  if (/maquinaria|excavad|retroexcavad|cargador.*frontal|gr[uú]a|motoniveladora|bulldozer|camion.*tolva|arriendo.*maquina/.test(s)) return 'Maquinaria';
  if (/obras|construcc|movimiento.*tierra|ingeniería|ingenieria|vulcaniz/.test(s)) return 'Construcción / Obras';
  if (/lavander|lavandera|aseo|limpieza/.test(s)) return 'Lavandería / Aseo';
  if (/consultori|asesor|auditoria|contab|gestión|gestion/.test(s)) return 'Consultoría / Asesoría';
  if (/event|productora|capacitac|taller|arriendo.*sal/.test(s)) return 'Eventos / Capacitación';
  if (/artesanía|artesania|textil|confección|confeccion|muebler|madera|merchadising|merchandising/.test(s)) return 'Artesanías / Manufactura';
  if (/electr|solar|tecnolog|computac|informatic|panel/.test(s)) return 'Tecnología / Electricidad';
  if (/insumo|ferreteri|epp|suministro/.test(s)) return 'Insumos / Ferretería';
  return 'Otros Servicios';
}

// ── DRAG & DROP ───────────────────────────────────────────────────────────────
const dropArea = document.getElementById('dropArea');
['dragenter','dragover'].forEach(e => dropArea.addEventListener(e, ev => { ev.preventDefault(); dropArea.classList.add('dragover'); }));
['dragleave','drop'].forEach(e => dropArea.addEventListener(e, ev => { ev.preventDefault(); dropArea.classList.remove('dragover'); }));
dropArea.addEventListener('drop', ev => handleFiles(ev.dataTransfer.files));

function toggleUploadSection(){ const u=document.getElementById('uploadSection'); if(u) u.style.display=(u.style.display==='none'||!u.style.display)?'flex':'none'; }
function handleFiles(files) {
  Array.from(files).forEach(f => {
    if (!f.name.match(/\.xlsx?$/i)) return;
    if (!pendingFiles.find(p => p.name === f.name)) pendingFiles.push(f);
  });
  renderFileChips();
  document.getElementById('btnLoad').disabled = pendingFiles.length === 0;
}
function renderFileChips() {
  const c = document.getElementById('fileChips');
  c.style.display = pendingFiles.length ? 'flex' : 'none';
  c.innerHTML = '';
  pendingFiles.forEach((f,i) => {
    const chip = document.createElement('div'); chip.className = 'file-chip';
    chip.innerHTML = `📊 ${f.name} <button onclick="removeFile(${i})">×</button>`;
    c.appendChild(chip);
  });
}
function removeFile(i) { pendingFiles.splice(i,1); renderFileChips(); document.getElementById('btnLoad').disabled = pendingFiles.length===0; }

// ── PROCESS FILES ─────────────────────────────────────────────────────────────
function processFiles() {
  if (!pendingFiles.length) return;
  const st = document.getElementById('uploadStatus');
  st.style.display = 'block'; st.className = 'upload-status';
  st.textContent = `⏳ Procesando ${pendingFiles.length} archivo(s)…`;
  const newData = []; let done = 0, errors = [];
  pendingFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type:'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
        let headerRow = 1;
        for (let r = 0; r < Math.min(6, rows.length); r++) {
          const s = rows[r].join('|').toLowerCase();
          if (s.includes('nombre contacto') || s.includes('razon social') || s.includes('razón social')) { headerRow = r; break; }
        }
        for (let r = headerRow+1; r < rows.length; r++) {
          const row = rows[r];
          const nombre = row[0];
          if (!nombre || !nombre.toString().trim()) continue;
          // Descartar filas que no son proveedores reales:
          // - nombre empieza con • (es un giro SII)
          // - sin RUT empresa ni RUT persona (y nombre parece descripción)
          // - fila de instrucciones de la plantilla
          const _nStr = nombre.toString().trim();
          const _rutEmpStr = (row[5]||'').toString().trim();
          const _rutPerStr = (row[2]||'').toString().trim();
          const _esGiro = _nStr.startsWith('•') || _nStr.startsWith('-');
          const _esInstruccion = _nStr.length > 60 && !_rutEmpStr && !_rutPerStr;
          const _esEncabezado = _nStr.toUpperCase() === 'NOMBRE CONTACTO' || _nStr === 'Nombre completo del contacto principal';
          if (_esGiro || _esInstruccion || _esEncabezado) continue;
          // v4 schema: 0=Contacto,1=Cargo,2=RUT Persona,3=Razón Social,
          // 4=Fantasía,5=RUT Empresa,6=Localidad,7=Dirección,8=Correo,9=Fono
          // 10=Giros SII,11=Actividad Principal,12=Descripción,13=Plataformas
          // 14=Categoría SII,15=Autorización,16=Agrupación,17=Servicios AM
          // 18=Hab Simples,19=Hab Dobles,20=Programas
          // 21=Hab Simples Baño Privado,22=Hab Dobles Baño Privado,23=Habitaciones Disponibles (informativo)
          const girosRaw = (ss(row[10])||'').split(/[\n;]+/).map(g=>g.trim()).filter(Boolean);
          const giros = girosRaw.length ? girosRaw : [];
          const rubrosNorm = [...new Set(giros.map(normRubro).filter(Boolean))];
          const localidad = ss(row[6]) || file.name.replace(/\.xlsx?$/i,'');
          const _xRE=(ss(row[5])||'').replace(/[^0-9kK]/g,'');
          const _xRP=(ss(row[2])||'').replace(/[^0-9kK]/g,'');
          const _xNm=(ss(row[0])||ss(row[3])||ss(row[4])||'');
          const _xId=_xRE?'re_'+_xRE:(_xRP?'rp_'+_xRP:('nm_'+_xNm.toLowerCase().replace(/\s+/g,'_').slice(0,24)||`${file.name}-${r}`));
          newData.push({
            _id: _xId,
            _source: file.name, _edited: false,
            nombre_contacto: ss(row[0]), cargo: ss(row[1]),
            rut_persona: ss(row[2]),
            razon_social: ss(row[3]), nombre_fantasia: ss(row[4]),
            rut_empresa: ss(row[5]), localidad,
            direccion: ss(row[7]), correo: ss(row[8]),
            fono: normFono(ss(row[9])),
            giros, rubrosNorm,
            actividad_principal: ss(row[11]),
            descripcion: ss(row[12]),
            plataformas: ss(row[13]),
            categoria_sii: ss(row[14]), facturar: ss(row[15]),
            agrupacion: ss(row[16]),
            servicio_am: ss(row[17]),
            estado: 'Activo',
          });
          // Guardar cargo en DB.contactos
          const _xCargo=ss(row[1]);
          // Cols S/T/U = hab simples, hab dobles, programas
          const _pid=newData[newData.length-1]._id;
          // Actualizar cargo en contacto existente si hay
          if(_xCargo&&DB.contactos[_pid]&&DB.contactos[_pid].length>0){
            const _cp=DB.contactos[_pid].find(c=>c.principal)||DB.contactos[_pid][0];
            if(_cp) _cp.cargo=_xCargo;
          }
          const _hs=Math.max(0,parseInt(row[18])||0);
          const _hd=Math.max(0,parseInt(row[19])||0);
          const _py=ss(row[20]);
          const _hsb=Math.max(0,parseInt(row[21])||0);
          const _hdb=Math.max(0,parseInt(row[22])||0);
          const _hDisp=ss(row[23]);
          if(_hs>0||_hd>0||_hsb>0||_hdb>0){
            if(!DB.hoteles[_pid])DB.hoteles[_pid]={simples:0,dobles:0,contratos:[],servicios:[]};
            if(_hs>0)DB.hoteles[_pid].simples=_hs;
            if(_hd>0)DB.hoteles[_pid].dobles=_hd;
            if(_hsb>0)DB.hoteles[_pid].simples_banio=Math.min(_hsb,_hs||_hsb);
            if(_hdb>0)DB.hoteles[_pid].dobles_banio=Math.min(_hdb,_hd||_hdb);
          }
          if(_hDisp!==''&&!isNaN(parseInt(_hDisp))){
            newData[newData.length-1].notas_ficha=('Disponibilidad informada (Informe Hospedajes Sierra Gorda 2026): '+parseInt(_hDisp)+' habitación(es) disponible(s) de '+(_hs+_hd)+' totales.');
          }
          if(_py){
            const _progs=_py.split('|').map(s=>s.trim()).filter(Boolean);
            if(!DB.programas[_pid])DB.programas[_pid]=[];
            _progs.forEach(nombre=>{
              if(!DB.programas[_pid].find(e=>e.nombre===nombre))
                DB.programas[_pid].push({id:uid(),nombre,inicio:'',fin:'',activo:true});
              if(!PROGRAMAS_LIST.includes(nombre))PROGRAMAS_LIST.push(nombre);
            });
          }
        }
      } catch(err) { errors.push(file.name); }
      done++;
      if (done === pendingFiles.length) finishLoad(newData, errors);
    };
    reader.readAsArrayBuffer(file);
  });
}
function ss(v) { return (v===undefined||v===null||v==='')?'':v.toString().trim(); }

function mergeContactos(newData){
  // Fusionar filas con mismo RUT empresa — el contacto de cada fila pasa a DB.contactos
  const seen={};
  const merged=[];
  newData.forEach(p=>{
    const keyRut=(p.rut_empresa||'').replace(/[^0-9kK]/g,'');
    const key=keyRut||p._id;
    // Construir entrada de contacto desde los datos de la fila
    const contacto={
      id:uid(),
      nombre:p.nombre_contacto||'',
      rut:p.rut_persona||'',
      correo:p.correo||'',
      fono:p.fono||'',
      cargo:p.cargo||'',
      principal:false
    };
    if(!seen[key]){
      seen[key]=p._id; // primer _id visto para este RUT
      // Usar el _id existente si ya lo teníamos en DB.contactos
      merged.push(p);
      // Primer contacto = principal
      contacto.principal=true;
      if(!DB.contactos[p._id]) DB.contactos[p._id]=[];
      // No duplicar si ya existe
      if(!DB.contactos[p._id].find(c=>c.rut===contacto.rut&&c.nombre===contacto.nombre)){
        DB.contactos[p._id].unshift(contacto);
      }
    } else {
      // Ya existe empresa — solo agregar contacto al _id canónico
      const canonId=seen[key];
      if(!DB.contactos[canonId]) DB.contactos[canonId]=[];
      if(!DB.contactos[canonId].find(c=>c.rut===contacto.rut&&c.nombre===contacto.nombre)){
        DB.contactos[canonId].push(contacto);
      }
      // No agregar fila duplicada a merged
    }
  });
  return merged;
}

function finishLoad(newData, errors) {
  const st = document.getElementById('uploadStatus');
  if (!newData.length) { st.className='upload-status err'; st.textContent='❌ No se pudo leer. Verifica el formato.'; return; }

  const isSheet = newData[0]?._source === '__sheet__';

  if (isSheet) {
    // Carga desde Sheet → reemplaza TODO
    PROVEEDORES = mergeContactos(newData);
  } else {
    // ── MERGE INTELIGENTE desde Excel ────────────────────────────────────
    // Por cada proveedor en el Excel:
    //   - Si es NUEVO (RUT no existe) → agregar
    //   - Si ya EXISTE → complementar campos vacíos, no sobreescribir
    //     campos que el usuario ya editó en el sistema (_edited)
    const merged = mergeContactos(newData);
    let agregados = 0, complementados = 0, sinCambios = 0;

    merged.forEach(incoming => {
      const rutKey = (incoming.rut_empresa||'').replace(/[^0-9kK]/g,'');
      const existing = PROVEEDORES.find(p =>
        rutKey && (p.rut_empresa||'').replace(/[^0-9kK]/g,'') === rutKey
      );

      if (!existing) {
        // Proveedor nuevo — agregar directamente
        PROVEEDORES.push(incoming);
        agregados++;
      } else {
        // Proveedor existente — complementar sin sobreescribir
        let changed = false;
        const CAMPOS_COMPLEMENTABLES = [
          'nombre_fantasia','direccion','correo','fono',
          'actividad_principal','descripcion','plataformas',
          'categoria_sii','facturar','agrupacion','servicio_am'
        ]; // notas_ficha se maneja aparte (ver bloque de habitaciones) para no pisar notas ya escritas
        CAMPOS_COMPLEMENTABLES.forEach(campo => {
          const valNuevo = (incoming[campo]||'').toString().trim();
          const valExist = (existing[campo]||'').toString().trim();
          // Solo completar si el campo existente está vacío
          if (valNuevo && !valExist) {
            existing[campo] = incoming[campo];
            changed = true;
          }
        });
        // Giros: agregar los que no estén ya
        if (incoming.giros && incoming.giros.length) {
          const existGiros = new Set(existing.giros||[]);
          const nuevosGiros = incoming.giros.filter(g => !existGiros.has(g));
          if (nuevosGiros.length) {
            existing.giros = [...(existing.giros||[]), ...nuevosGiros];
            existing.rubrosNorm = [...new Set([...(existing.rubrosNorm||[]),...(incoming.rubrosNorm||[])])];
            changed = true;
          }
        }
        // Contactos: agregar los que no estén ya (por nombre o RUT)
        const contExist = DB.contactos[existing._id]||[];
        const contNew   = DB.contactos[incoming._id]||[];
        contNew.forEach(c => {
          const dup = contExist.find(e =>
            (c.rut && e.rut === c.rut) || (c.nombre && e.nombre === c.nombre)
          );
          if (!dup) { contExist.push(c); changed = true; }
        });
        DB.contactos[existing._id] = contExist;
        // Habitaciones: solo si el existente tiene 0
        const hNew = DB.hoteles[incoming._id];
        if (hNew) {
          if (!DB.hoteles[existing._id]) DB.hoteles[existing._id] = {simples:0,dobles:0,contratos:[],servicios:[]};
          const hEx = DB.hoteles[existing._id];
          if (!hEx.simples && hNew.simples) { hEx.simples = hNew.simples; changed = true; }
          if (!hEx.dobles  && hNew.dobles)  { hEx.dobles  = hNew.dobles;  changed = true; }
          if (!hEx.simples_banio && hNew.simples_banio) { hEx.simples_banio = hNew.simples_banio; changed = true; }
          if (!hEx.dobles_banio  && hNew.dobles_banio)  { hEx.dobles_banio  = hNew.dobles_banio;  changed = true; }
        }
        // Notas: si el Excel trae disponibilidad informada y la ficha existente no tiene notas, se agrega
        if (incoming.notas_ficha && !(existing.notas_ficha||'').trim()) {
          existing.notas_ficha = incoming.notas_ficha; changed = true;
        }
        // Programas: agregar nuevos
        const progNew = DB.programas[incoming._id]||[];
        if (!DB.programas[existing._id]) DB.programas[existing._id] = [];
        progNew.forEach(pg => {
          if (!DB.programas[existing._id].find(e => e.nombre === pg.nombre)) {
            DB.programas[existing._id].push(pg); changed = true;
          }
        });
        if (changed) complementados++;
        else sinCambios++;
      }
    });

    const msg = [];
    if (agregados)      msg.push(`${agregados} nuevo(s)`);
    if (complementados) msg.push(`${complementados} complementado(s)`);
    if (sinCambios)     msg.push(`${sinCambios} sin cambios`);
    showToast(`Excel procesado: ${msg.join(' · ')}`, 'success');
  }

  const errMsg = errors.length ? ` (${errors.length} error(es))` : '';
  st.className='upload-status ok';
  st.textContent=`✅ ${PROVEEDORES.length} proveedores · ${new Set(PROVEEDORES.map(p=>p.localidad)).size} localidad(es)${errMsg}`;
  pendingFiles=[]; renderFileChips();
  document.getElementById('btnLoad').disabled=true;
  document.getElementById('fileInput').value='';
  document.getElementById('btnDownload').disabled=false;
  const btnES=document.getElementById('btnExportSheet'); if(btnES) btnES.disabled=false;
  saveDB();
  initApp();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function initApp() {
  document.getElementById('noDataScreen').style.display='none';
  document.getElementById('mainApp').style.display='block';
  document.getElementById('heroStrip').style.display='block';
  updateHeroStats();
  activeLocalidades.clear(); activeFacturacion.clear(); activeRubros.clear();
  activeAgrup.clear(); activeAM.clear();
  filterEditedOnly=false;
  document.getElementById('searchInput').value='';
  buildFilters(); buildAgrupFilters(); buildAMFilters(); buildRangoFilters(); applyFilters(); chartsInit=false;
}
function updateHeroStats() {
  const allRubros = {}; PROVEEDORES.forEach(p=>p.rubrosNorm.forEach(r=>{allRubros[r]=(allRubros[r]||0)+1;}));
  const edited = PROVEEDORES.filter(p=>p._edited).length;
  document.getElementById('statTotal').textContent = PROVEEDORES.length;
  document.getElementById('statFactura').textContent = PROVEEDORES.filter(p=>p.facturar==='Autorizado').length;
  document.getElementById('statRubros').textContent = Object.keys(allRubros).length;
  document.getElementById('statLocalidades').textContent = new Set(PROVEEDORES.map(p=>p.localidad)).size;
  document.getElementById('statEdited').textContent = edited;
  document.getElementById('editedCount').textContent = edited;
  document.getElementById('editedBadge').className = edited ? 'edited-badge show' : 'edited-badge';
}

// ── FILTERS BUILD ─────────────────────────────────────────────────────────────
function buildFilters() {
  // Localidades
  const locs = {}; PROVEEDORES.forEach(p=>{locs[p.localidad]=(locs[p.localidad]||0)+1;});
  const lf = document.getElementById('localidadFilters'); lf.innerHTML='';
  Object.entries(locs).sort((a,b)=>b[1]-a[1]).forEach(([loc,count])=>{
    const c=document.createElement('div'); c.className='loc-chip';
    c.innerHTML=`📍 ${loc} <span style="opacity:.65;font-size:.7rem">(${count})</span>`;
    c.onclick=()=>toggleSet(activeLocalidades,loc,c,applyFilters); lf.appendChild(c);
  });
  // Facturación
  const fops=[{val:'Autorizado',label:'Autorizado a facturar',color:'#1a7a38'},{val:'Boleta honorario',label:'Boleta honorarios',color:'#b86000'},{val:'NO',label:'Sin autorización',color:'#c0392b'},{val:'Sin información',label:'Sin información',color:'#888'}];
  const ff=document.getElementById('facturacionFilters'); ff.innerHTML='';
  fops.forEach(o=>{
    const cnt=PROVEEDORES.filter(p=>p.facturar===o.val).length; if(!cnt) return;
    const el=document.createElement('div'); el.className='fact-row';
    el.innerHTML=`<div class="fact-dot" style="background:${o.color}"></div>${o.label}<span class="fact-count">${cnt}</span>`;
    el.onclick=()=>toggleSet(activeFacturacion,o.val,el,applyFilters); ff.appendChild(el);
  });
  // Rubros
  const allR={}; PROVEEDORES.forEach(p=>p.rubrosNorm.forEach(r=>{allR[r]=(allR[r]||0)+1;}));
  const rf=document.getElementById('rubroFilters'); rf.innerHTML='';
  Object.entries(allR).sort((a,b)=>b[1]-a[1]).forEach(([r,cnt])=>{
    const c=document.createElement('div'); c.className='filter-chip rubro-chip';
    c.innerHTML=`<span class="rubro-ico">${rubroIcon(r)}</span><span class="rubro-txt">${r}</span><span class="chip-count">${cnt}</span>`;
    c.onclick=()=>toggleSet(activeRubros,r,c,applyFilters); rf.appendChild(c);
  });
  // Faena minera (CEN/ANT/CMZ) según pub_centinela/antucoya/zaldivar
  const faenas=[
    {key:'centinela',label:'CEN · Centinela',campo:'pub_centinela'},
    {key:'antucoya', label:'ANT · Antucoya', campo:'pub_antucoya'},
    {key:'zaldivar', label:'CMZ · Zaldívar', campo:'pub_zaldivar'}
  ];
  // Programa MGI: quiénes participan del programa de habitabilidad
  const mgif=document.getElementById('mgiFilters');
  if(mgif){ mgif.innerHTML='';
    const rubroLbl={hoteleria:'🏨 Hotelería',lavanderia:'🧺 Lavandería',alimentacion:'🍽 Alimentación'};
    const nSi=PROVEEDORES.filter(p=>p.programa_mgi===true).length;
    const opciones=[{k:'si',label:'⭐ Participa del programa MGI',cnt:nSi},
                    {k:'no',label:'Fuera del programa',cnt:PROVEEDORES.length-nSi}];
    opciones.forEach(o=>{
      const c=document.createElement('div'); c.className='filter-chip';
      c.innerHTML=`<span class="rubro-txt">${o.label}</span><span class="chip-count">${o.cnt}</span>`;
      c.onclick=()=>toggleSet(activeMGI,o.k,c,applyFilters); mgif.appendChild(c);
    });
    // Dentro del programa, por rubro
    Object.keys(rubroLbl).forEach(r=>{
      const cnt=PROVEEDORES.filter(p=>p.programa_mgi===true&&(p.programa_mgi_rubro||'hoteleria')===r).length;
      if(!cnt) return;
      const c=document.createElement('div'); c.className='filter-chip';
      c.innerHTML=`<span class="rubro-txt" style="padding-left:10px">${rubroLbl[r]}</span><span class="chip-count">${cnt}</span>`;
      c.onclick=()=>toggleSet(activeMGI,'r:'+r,c,applyFilters); mgif.appendChild(c);
    });
  }
  const fmf=document.getElementById('faenaMineraFilters'); if(fmf){ fmf.innerHTML='';
    faenas.forEach(f=>{
      const cnt=PROVEEDORES.filter(p=>p[f.campo]).length;
      const c=document.createElement('div'); c.className='filter-chip faena-chip';
      c.innerHTML=`<span class="rubro-ico">${RUBRO_ICONS.construccion}</span><span class="rubro-txt">${f.label}</span><span class="chip-count">${cnt}</span>`;
      c.onclick=()=>toggleSet(activeFaenaMinera,f.key,c,applyFilters); fmf.appendChild(c);
    });
  }
}
function toggleSet(set,val,el,cb){ if(set.has(val)){set.delete(val);el.classList.remove('active');}else{set.add(val);el.classList.add('active');} cb(); }

function buildAgrupFilters() {
  const vals = {}; PROVEEDORES.forEach(p=>{ const v=p.agrupacion||'Sin información'; vals[v]=(vals[v]||0)+1; });
  const c=document.getElementById('agrupFilters'); c.innerHTML='';
  Object.entries(vals).sort((a,b)=>b[1]-a[1]).forEach(([v,cnt])=>{
    const chip=document.createElement('div'); chip.className='filter-chip';
    chip.innerHTML=`${v} <span class="chip-count">${cnt}</span>`;
    chip.onclick=()=>toggleSet(activeAgrup,v,chip,applyFilters); c.appendChild(chip);
  });
}

function buildAMFilters() {
  // Normalize: group by "Sí", "En proceso", "No"
  const vals = {}; PROVEEDORES.forEach(p=>{ const v=p.servicio_am||'Sin información'; vals[v]=(vals[v]||0)+1; });
  const c=document.getElementById('amFilters'); c.innerHTML='';
  // Sort: Sí first, then En proceso, No, Sin info
  const order = ['Sí','En proceso de licitación','No','Sin información'];
  const sorted = Object.entries(vals).sort((a,b)=>{
    const ai=order.findIndex(o=>a[0].startsWith(o.slice(0,4)));
    const bi=order.findIndex(o=>b[0].startsWith(o.slice(0,4)));
    return (ai===-1?99:ai)-(bi===-1?99:bi);
  });
  sorted.forEach(([v,cnt])=>{
    const chip=document.createElement('div'); chip.className='filter-chip';
    const icon = v.startsWith('Sí')?'✅ ': v.startsWith('En proceso')?'🔄 ': v==='No'?'❌ ':'— ';
    chip.innerHTML=`${icon}${v} <span class="chip-count">${cnt}</span>`;
    chip.onclick=()=>toggleSet(activeAM,v,chip,applyFilters); c.appendChild(chip);
  });
}
function buildRangoFilters(){
  const vals={}; PROVEEDORES.forEach(p=>{ const v=p.rango_trabajos||'Sin definir'; vals[v]=(vals[v]||0)+1; });
  const c=document.getElementById('rangoFilters'); if(!c) return; c.innerHTML='';
  // ordenar según el orden de RANGOS_TRABAJO, "Sin definir" al final
  const order=[...RANGOS_TRABAJO,'Sin definir'];
  Object.entries(vals).sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0])).forEach(([v,cnt])=>{
    const chip=document.createElement('div'); chip.className='filter-chip';
    chip.innerHTML=`${v} <span class="chip-count">${cnt}</span>`;
    chip.onclick=()=>toggleSet(activeRango,v,chip,applyFilters); c.appendChild(chip);
  });
}

function toggleEditedFilter(){ filterEditedOnly=!filterEditedOnly; document.getElementById('chipEdited').classList.toggle('active',filterEditedOnly); applyFilters(); }

function applyFilters() {
  const q=document.getElementById('searchInput').value.toLowerCase().trim();
  const filtered=PROVEEDORES.filter(p=>{
    if(activeLocalidades.size&&!activeLocalidades.has(p.localidad)) return false;
    if(activeFaenaMinera.size){
      let ok=false;
      if(activeFaenaMinera.has('centinela')&&p.pub_centinela) ok=true;
      if(activeFaenaMinera.has('antucoya')&&p.pub_antucoya) ok=true;
      if(activeFaenaMinera.has('zaldivar')&&p.pub_zaldivar) ok=true;
      if(!ok) return false;
    }
    if(activeMGI.size){
      const enMGI=p.programa_mgi===true;
      const rub='r:'+(p.programa_mgi_rubro||'hoteleria');
      let ok=false;
      if(activeMGI.has('si')&&enMGI) ok=true;
      if(activeMGI.has('no')&&!enMGI) ok=true;
      if(enMGI&&activeMGI.has(rub)) ok=true;
      if(!ok) return false;
    }
    if(activeFacturacion.size&&!activeFacturacion.has(p.facturar)) return false;
    if(activeRubros.size&&!p.rubrosNorm.some(r=>activeRubros.has(r))) return false;
    if(activeAgrup.size&&!activeAgrup.has(p.agrupacion||'Sin información')) return false;
    if(activeAM.size&&!activeAM.has(p.servicio_am||'Sin información')) return false;
    if(activeRango.size&&!activeRango.has(p.rango_trabajos||'Sin definir')) return false;
    if(filterEditedOnly&&!p._edited) return false;
    if(q){const cs=(DB.contactos[p._id]||[]).map(c=>c.nombre+' '+c.correo+' '+c.cargo).join(' ');const hay=[p.nombre_contacto,p.razon_social,p.nombre_fantasia,p.localidad,p.direccion,...(p.giros||[]),p.descripcion,p.actividad_principal||'',p.plataformas||'',cs].join(' ').toLowerCase();if(!hay.includes(q))return false;}
    return true;
  });
  // Ordenamiento
  const _orden=document.getElementById('ordenDir')?.value||'az';
  filtered.sort((a,b)=>{
    if(_orden==='loc'){ const la=(a.localidad||'').localeCompare(b.localidad||'','es'); if(la!==0) return la; return dispName(a).localeCompare(dispName(b),'es'); }
    const cmp=dispName(a).localeCompare(dispName(b),'es');
    return _orden==='za'?-cmp:cmp;
  });
  document.getElementById('resultsCount').textContent=filtered.length;
  window._lastFilteredData=filtered; if(typeof actualizarBarraSel==='function') actualizarBarraSel();
  renderCards(filtered); renderTable(filtered); renderAgenda(filtered);
  const empty=filtered.length===0;
  document.getElementById('emptyResults').style.display=empty?'block':'none';
  document.getElementById('viewCards').style.display=(!empty&&currentView==='cards')?'grid':'none';
  document.getElementById('viewTable').style.display=(!empty&&currentView==='table')?'block':'none';
  const va=document.getElementById('viewAgenda'); if(va) va.style.display=(!empty&&currentView==='agenda')?'block':'none';
}
function clearFilters(){activeLocalidades.clear(); activeFaenaMinera.clear();activeMGI.clear();activeFacturacion.clear();activeRubros.clear();activeAgrup.clear();activeAM.clear();filterEditedOnly=false;document.getElementById('searchInput').value='';var _smb=document.getElementById('searchInputMobile');if(_smb)_smb.value='';document.querySelectorAll('.loc-chip,.fact-row,.filter-chip').forEach(el=>el.classList.remove('active'));document.getElementById('chipEdited').classList.remove('active');applyFilters();}

// ── RENDER ────────────────────────────────────────────────────────────────────
function amBadge(v){
  if(!v||v==='Sin información') return '';
  if(v.startsWith('Sí')) return `<span class="am-badge am-si">✅ ${v}</span>`;
  if(v.startsWith('En proceso')) return `<span class="am-badge am-licit">🔄 ${v}</span>`;
  if(v==='No') return `<span class="am-badge am-no">❌ Sin servicio AM</span>`;
  return `<span class="am-badge am-sin">${v}</span>`;
}
function agrupBadge(v){
  if(!v||v==='Sin información'||v==='No pertenece') return '';
  return `<span class="agrup-badge">🤝 ${v}</span>`;
}
function factBadge(f){
  if(f==='Autorizado') return`<span class="card-fact ba">✓ Factura</span>`;
  if(f==='Boleta honorario') return`<span class="card-fact bh">Honorarios</span>`;
  if(f==='NO') return`<span class="card-fact bn">Sin autorizar</span>`;
  return`<span class="card-fact bs">Sin info</span>`;
}
function dispName(p){ return (p.nombre_fantasia&&p.nombre_fantasia.length>2&&p.nombre_fantasia.toLowerCase()!==p.razon_social.toLowerCase())?p.nombre_fantasia:p.razon_social; }

const SEL_DIR=new Set();
function toggleSelDir(id){ if(SEL_DIR.has(id))SEL_DIR.delete(id); else SEL_DIR.add(id); renderCards(window._lastFilteredData||PROVEEDORES); actualizarBarraSel(); }
function actualizarBarraSel(){
  const bar=document.getElementById('selDirBar'); if(!bar) return;
  if(SEL_DIR.size){ bar.style.display='flex'; document.getElementById('selDirCount').textContent=SEL_DIR.size; }
  else bar.style.display='none';
}
function limpiarSelDir(){ SEL_DIR.clear(); renderCards(window._lastFilteredData||PROVEEDORES); actualizarBarraSel(); }
function descargarSeleccionDir(){
  if(!SEL_DIR.size) return;
  const sel=PROVEEDORES.filter(p=>SEL_DIR.has(p._id));
  const rows=sel.map(p=>{
    const cs=DB.contactos[p._id]||[]; const cp=cs.find(c=>c.principal)||cs[0]||{};
    return {
      'Razón social':p.razon_social||'','Nombre fantasía':p.nombre_fantasia||'','RUT':p.rut_empresa||'',
      'Localidad':p.localidad||'','Rubros':(p.rubrosNorm||[]).join(', '),'Rango':p.rango_trabajos||'',
      'Experiencia':[p.pub_centinela?'CEN':'',p.pub_zaldivar?'CMZ':'',p.pub_antucoya?'ANT':''].filter(Boolean).join(', '),
      'Plataformas':p.plataformas||'','Contacto':cp.nombre||'','Cargo':cp.cargo||'',
      'Teléfono':cp.fono||p.fono||'','Correo':cp.correo||p.correo||'','Dirección':p.direccion||''
    };
  });
  const cols=Object.keys(rows[0]||{});
  const aoa=[['ANTOFAGASTA MINERALS'],['Directorio de Proveedores Comunitarios — Selección'],['Generado: '+new Date().toLocaleDateString('es-CL')+'  ·  '+rows.length+' proveedores'],[],cols];
  rows.forEach(r=>aoa.push(cols.map(c=>r[c])));
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols']=cols.map(c=>({wch:c==='Dirección'||c==='Correo'?28:20}));
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:cols.length-1}},{s:{r:1,c:0},e:{r:1,c:cols.length-1}},{s:{r:2,c:0},e:{r:2,c:cols.length-1}}];
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Selección');
  XLSX.writeFile(wb,'Proveedores_Seleccion_'+new Date().toISOString().slice(0,10)+'.xlsx');
}
function renderCards(data){
  const c=document.getElementById('viewCards'); c.innerHTML='';
  data.forEach(p=>{
    const name=dispName(p);
    const cs=DB.contactos[p._id]||[]; const cp=cs.find(c=>c.principal)||cs[0]||null;
    const rubros=p.rubrosNorm||[];
    const rubroPrincipal=rubros[0]||'';
    const rubrosSec=rubros.slice(1);
    const exp=[]; if(p.pub_centinela)exp.push('CEN'); if(p.pub_zaldivar)exp.push('CMZ'); if(p.pub_antucoya)exp.push('ANT');
    const plats=String(p.plataformas||'').split(/[,;\/|]+/).map(s=>s.trim()).filter(Boolean);
    const sel=SEL_DIR.has(p._id);
    const fono=(cp&&cp.fono)||p.fono||''; const correo=(cp&&cp.correo)||p.correo||'';
    const card=document.createElement('div');
    card.className='dc-card'+(sel?' selected':'')+(p._edited?' edited-card':'');
    card.innerHTML=`
      <div class="dc-selbox" onclick="event.stopPropagation();toggleSelDir('${p._id}')">${sel?'✓':''}</div>
      <div class="dc-top">
        <div class="dc-ri">${rubroIcon(rubroPrincipal)}</div>
        ${p.rango_trabajos?`<div class="dc-rango">${esc(p.rango_trabajos)}</div>`:''}
        <div class="dc-nombre">${esc(name)}</div>
        ${name.toLowerCase()!==(p.razon_social||'').toLowerCase()&&p.razon_social?`<div class="dc-razon">${esc(p.razon_social)}</div>`:''}
        <div class="dc-loc">📍 ${esc(p.localidad||'')}</div>
      </div>
      <div class="dc-tags">
        ${rubroPrincipal?`<span class="dc-tag t-teal">${esc(rubroPrincipal)}</span>`:''}
        ${rubrosSec.map(r=>`<span class="dc-tag t-lt">${esc(r)}</span>`).join('')}
      </div>
      ${(exp.length||plats.length)?`<div class="dc-exp-row">
        ${exp.map(e=>`<span class="dc-exp">⛏ ${e}</span>`).join('')}
        ${plats.map(pl=>`<span class="dc-plat">${esc(pl)}</span>`).join('')}
      </div>`:''}
      <div class="dc-mid">
        ${cp?`<div class="dc-contact">👤 <b>${esc(cp.nombre||'')}</b>${cp.cargo?' · '+esc(cp.cargo):''}${fono?`<br>📞 ${esc(fono)}`:''}${correo?`<br>✉ ${esc(correo)}`:''}</div>`:(fono||correo?`<div class="dc-contact">${fono?`📞 ${esc(fono)}`:''}${correo?`<br>✉ ${esc(correo)}`:''}</div>`:'')}
      </div>
      <div class="dc-bot">
        <span style="font-size:.66rem;color:var(--dc-gray)">${(DB.contactos[p._id]||[]).length>1?`+${(DB.contactos[p._id]||[]).length-1} contacto(s)`:''}</span>
        <button class="dc-cta" onclick="event.stopPropagation();openModal('${p._id}')">Ver ficha →</button>
      </div>`;
    card.addEventListener('click',()=>openModal(p._id));
    c.appendChild(card);
  });
}
function toggleDesc(el){const c=el.nextElementSibling;const o=c.classList.toggle('open');el.textContent=o?'▲ Ocultar detalle':'▼ Ver servicios y capacidades';}

function renderTable(data){
  const tbody=document.getElementById('tableBody'); tbody.innerHTML='';
  data.forEach((p,i)=>{
    const name=dispName(p); const tr=document.createElement('tr');
    if(p._edited) tr.className='edited-row';
    tr.innerHTML=`
      <td style="color:#bbb;font-size:.72rem">${i+1}</td>
      <td><div class="td-name">${name}${p._edited?'<span class="edit-badge">✏</span>':''}</div><div class="td-sub">${name.toLowerCase()!==p.razon_social.toLowerCase()?p.razon_social:''}</div></td>
      <td><span style="font-size:.73rem;background:var(--primary-light);color:var(--primary);padding:2px 6px;border-radius:3px;font-weight:600">${p.localidad}</span></td>
      <td style="font-size:.76rem">${p.nombre_contacto}</td>
      <td>${p.rubrosNorm.map(r=>`<span class="giro-tag" style="font-size:.6rem">${r}</span>`).join(' ')}</td>
      <td>${factBadge(p.facturar)}</td>
      <td><span style="font-size:.72rem;color:var(--text-muted)">${p.estado||''}</span></td>`;
    tr.onclick=()=>openModal(p._id); tbody.appendChild(tr);
  });
}
function setView(v){currentView=v;document.getElementById('btnCards').classList.toggle('active',v==='cards');document.getElementById('btnTable').classList.toggle('active',v==='table');var ba=document.getElementById('btnAgenda');if(ba)ba.classList.toggle('active',v==='agenda');applyFilters();}

// ── MODAL VER ─────────────────────────────────────────────────────────────────
function switchPage(page, btn){
  currentPage=page;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+page);
  if(pg) pg.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(page==='dashboard') renderDashboard();
  if(page==='hoteleria') renderHoteleriaGlobal();
  if(page==='rca') rcaCargar();
  if(page==='acuerdos_dash') renderAcuerdosDash();
  if(page==='programas_dash') renderProgramasDash();
  if(page==='kanban') renderKanban();
  if(page==='estandarizacion') renderEstPage();
  if(page==='compromisos') renderCompromisosDash();
  if(page==='licitaciones_dir') renderLicitacionesDir();
}

function switchModalTab(tab){
  currentModalTab=tab;
  document.querySelectorAll('.modal-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.modal-tab-pane').forEach(p=>p.classList.toggle('active',p.dataset.tab===tab));
  if(tab==='visitas') montarVisitasV3(currentModalId);
  if(tab==='hoteleria') renderHoteleriaModal(currentModalId);
  if(tab==='acuerdos') renderAcuerdos(currentModalId);
  if(tab==='licitaciones') renderLicitacionesModal(currentModalId);
  if(tab==='programas') renderProgramasModal(currentModalId);
}

function openModal(id){
  currentModalId=id; const p=PROVEEDORES.find(x=>x._id===id); if(!p) return;
  const name=dispName(p); const hasDesc=p.descripcion&&p.descripcion.trim().length>5; const hasSii=p.info_sii&&p.info_sii.trim().length>5;
  currentModalTab='datos';
  const _dias=getDiasSinVisita(id);
  const _dBadge=_dias===null?'':_dias<=30?`<span class="dias-badge ok">&#10003; Visitado hace ${_dias}d</span>`:_dias<=90?`<span class="dias-badge warn">&#9888; ${_dias}d sin visitar</span>`:`<span class="dias-badge late">&#128308; ${_dias}d sin visitar</span>`;
  const _esHotel=esRubroHotel(p);
  document.getElementById('modalContent').innerHTML=`
    <div class="modal-header">
      <div>
        <div class="modal-loc">&#128205; ${p.localidad}${p._edited?'<span class="edit-badge">&#9998; editado</span>':''} ${_dBadge}</div>
        <div class="modal-title">${name}</div>
        ${name.toLowerCase()!==p.razon_social.toLowerCase()?`<div class="modal-subtitle">${p.razon_social}</div>`:''}
      </div>
      <div class="modal-header-right">
        <button class="btn-edit-modal" onclick="exportarFichaPDF('${id}')" style="background:var(--primary);color:#fff;border-color:var(--primary)">📄 Exportar Ficha</button>
        <button class="btn-edit-modal" onclick="openEditModal('${id}')">✏ Editar</button>
        <button class="btn-edit-modal" onclick="abrirEstandarizacion('${id}')" style="border-color:#5b4fcf;color:#5b4fcf">📏 Estandarización</button>
        <button class="btn-edit-modal" onclick="toggleSelDir('${id}');showToast(SEL_DIR.has('${id}')?'Agregado a selección':'Quitado de selección')" title="Agregar a la selección para exportar">＋ Selección</button>
        <button class="solo-admin btn-edit-modal" onclick="eliminarProveedor('${id}')" style="border-color:#e53e3e;color:#e53e3e" title="Eliminar proveedor">🗑 Eliminar</button>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
    </div>
    <div class="modal-tabs">
      <button class="modal-tab-btn active" data-tab="datos" onclick="switchModalTab('datos')">&#128203; Datos</button>
      <button class="modal-tab-btn" data-tab="visitas" onclick="switchModalTab('visitas')">&#128197; Visitas</button>
      ${_esHotel?'<button class="modal-tab-btn" data-tab="hoteleria" onclick="switchModalTab(\'hoteleria\')">&#127968; Hoteler&#237;a</button>':''}
      <button class="modal-tab-btn" data-tab="acuerdos" onclick="switchModalTab('acuerdos')">&#128196; Contratos</button>
      <button class="modal-tab-btn" data-tab="licitaciones" onclick="switchModalTab('licitaciones')">&#128220; Licitaciones</button>
      <button class="modal-tab-btn" data-tab="programas" onclick="switchModalTab('programas')">&#127775; Programas</button>
    </div>
    <div class="modal-body">
    <div class="modal-tab-pane active" data-tab="datos">
      <div class="dcf-layout">
        <!-- COLUMNA IZQUIERDA -->
        <div class="dcf-left">
          <div class="dcf-sec-t">Datos de Contacto</div>
          <div class="dcf-item"><span class="dcf-ico">📍</span><div><div class="dcf-l">Localidad</div><div class="dcf-v">${esc(p.localidad||'—')}</div></div></div>
          <div class="dcf-item"><span class="dcf-ico">🏠</span><div><div class="dcf-l">Dirección</div><div class="dcf-v">${esc(p.direccion||'—')}</div></div></div>
          <div class="dcf-item"><span class="dcf-ico">🪪</span><div><div class="dcf-l">RUT</div><div class="dcf-v">${esc(p.rut_empresa||'—')}</div></div></div>
          ${(()=>{const cs=DB.contactos[id]||[];const cp=cs.find(c=>c.principal)||cs[0]||null;return cp?`
          <div class="dcf-item"><span class="dcf-ico">👤</span><div><div class="dcf-l">Contacto</div><div class="dcf-v">${esc(cp.nombre||'—')}${cp.cargo?'<br><span style=\'font-size:.74rem;color:var(--text-muted)\'>'+esc(cp.cargo)+'</span>':''}</div></div></div>
          ${cp.fono?`<div class="dcf-item"><span class="dcf-ico">📞</span><div><div class="dcf-l">Teléfono</div><div class="dcf-v">${esc(cp.fono)}</div></div></div>`:''}
          ${cp.correo?`<div class="dcf-item"><span class="dcf-ico">✉</span><div><div class="dcf-l">Correo</div><div class="dcf-v" style="word-break:break-all;color:var(--dc-teal-dk,#006973)">${esc(cp.correo)}</div></div></div>`:''}`:'';})()}
          ${(DB.contactos[id]||[]).length>1?`<button onclick="switchModalTab('datos');setTimeout(()=>document.getElementById('contactosExtra_${id}')?.scrollIntoView({behavior:'smooth'}),100)" style="font-size:.72rem;background:none;border:none;color:var(--dc-teal,#00A399);cursor:pointer;padding:2px 0;margin-left:30px">+${(DB.contactos[id]||[]).length-1} contacto(s) más ↓</button>`:''}

          <div class="dcf-sec-t" style="margin-top:18px">Plataformas Mineras</div>
          ${p.plataformas?`<div class="dcf-v" style="font-size:.84rem">${esc(p.plataformas)}</div>`:`<div style="font-style:italic;color:var(--text-muted);font-size:.82rem">No registrado en plataformas</div>`}

          <div class="dcf-sec-t" style="margin-top:18px">Datos Comerciales</div>
          <div class="dcf-item"><span class="dcf-ico">🖥</span><div><div class="dcf-l">Categoría SII</div><div class="dcf-v">${esc(p.categoria_sii||'—')}</div></div></div>
          ${factBadge(p.facturar)?`<div style="margin-top:6px;margin-left:30px">${factBadge(p.facturar)} <span style="font-size:.8rem;margin-left:5px">${esc(p.facturar||'')}</span></div>`:''}

          <div class="dcf-sec-t" style="margin-top:18px">Giros SII</div>
          ${(p.giros||[]).length?(p.giros||[]).map(g=>`<div class="dcf-giro">• ${esc(g)}</div>`).join(''):'<div style="color:var(--text-muted);font-size:.82rem">—</div>'}
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="dcf-right">
          ${hasDesc?`<div class="dcf-sec-t">≡ Descripción General</div><div class="dcf-desc">${esc(p.descripcion)}</div>`:''}

          ${(p.notas_ficha&&p.notas_ficha.trim())?`<div class="dcf-sec-t" style="margin-top:18px">📝 Notas y Comentarios</div><div class="dcf-notas">${esc(p.notas_ficha)}</div>`:''}

          ${(p.pub_centinela||p.pub_zaldivar||p.pub_antucoya)?`
          <div class="dcf-sec-t" style="margin-top:18px">☆ Experiencia con Antofagasta Minerals</div>
          <div style="display:flex;flex-wrap:wrap;gap:7px">
            ${p.pub_centinela?'<span class="dcf-exp">☆ Centinela (CEN)</span>':''}
            ${p.pub_zaldivar?'<span class="dcf-exp">☆ Cía. Minera Zaldívar (CMZ)</span>':''}
            ${p.pub_antucoya?'<span class="dcf-exp">☆ Antucoya (ANT)</span>':''}
          </div>`:''}

          ${(p.fotos&&p.fotos.filter(Boolean).length)?`
          <div class="dcf-sec-t" style="margin-top:18px">📷 Fotografías</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${p.fotos.filter(Boolean).slice(0,3).map(u=>
            `<a href="javascript:void(0)" data-firmar-link="${esc(u)}" onclick="return abrirFirmado(this)" title="Ver más grande">
               <img data-firmar="${esc(u)}" style="width:112px;height:84px;object-fit:cover;border-radius:8px;border:1px solid var(--border,#e2e8f0)">
             </a>`).join('')}</div>`:''}

          ${(p.flota&&p.flota.length)?`
          <div class="dcf-flota-box" style="margin-top:18px">
            <div class="dcf-flota-hdr"><div class="dcf-flota-t">⚙ Maquinaria / Flota</div><div class="dcf-flota-s">Inventario de equipos</div></div>
            <table class="dcf-flota-tbl">
              <thead><tr><th>Tipo</th><th>Marca</th><th>Modelo</th><th>Año</th><th>Cant.</th><th>Capacidad</th></tr></thead>
              <tbody>${p.flota.map(f=>`<tr><td><b>${esc(f.tipo||'')}</b></td><td>${esc(f.marca||'')}</td><td>${esc(f.modelo||'')}</td><td>${esc(f.anio||'')}</td><td>${esc(f.cant||'')}</td><td>${esc(f.capacidad||'')}</td></tr>`).join('')}</tbody>
            </table>
          </div>`:''}

          <div class="dcf-sec-t" style="margin-top:18px;display:flex;align-items:center;justify-content:space-between">Contactos <button onclick="toggleFormContacto('${id}')" class="btn-add-contacto" style="width:auto;padding:4px 12px;margin:0;font-size:.72rem">+ Agregar</button></div>
          <div id="contactosExtra_${id}">${renderContactosInline(id)}</div>

          ${(p.agrupacion&&p.agrupacion!=='No pertenece')||p.servicio_am?`
          <div class="dcf-sec-t" style="margin-top:18px">Agrupación & Relación AMSA</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
            ${p.agrupacion&&p.agrupacion!=='No pertenece'?`<span class="agrup-badge" style="font-size:.8rem;padding:5px 12px">🤝 ${esc(p.agrupacion)}</span>`:''}
            ${p.servicio_am?`<span class="am-badge ${p.servicio_am.startsWith('Sí')?'am-si':p.servicio_am.startsWith('En proceso')?'am-licit':p.servicio_am==='No'?'am-no':'am-sin'}" style="font-size:.8rem;padding:5px 12px">${p.servicio_am.startsWith('Sí')?'✅':p.servicio_am.startsWith('En proceso')?'🔄':'❌'} ${esc(p.servicio_am)}</span>`:''}
          </div>`:''}

          <div class="dcf-sec-t" style="margin-top:18px">📷 Fotos para la Ficha <span style="font-size:.72rem;color:var(--text-muted);font-weight:400">(máx. 3)</span></div>
          <div id="fotoUploadArea" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
            ${[0,1,2].map(i=>`
            <label id="fotoLabel${i}" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;width:110px;height:84px;border:2px dashed #b0d8e0;border-radius:8px;background:#f7fbfc;color:#00778A;font-size:.78rem;gap:4px;position:relative" title="Foto ${i+1}">
              <span id="fotoThumb${i}" style="display:none;position:absolute;inset:0;border-radius:6px;overflow:hidden"><img id="fotoImg${i}" style="width:100%;height:100%;object-fit:cover"/></span>
              <span id="fotoPlaceholder${i}" style="display:flex;flex-direction:column;align-items:center;gap:3px">📷<span>Foto ${i+1}</span></span>
              <input type="file" accept="image/*" style="display:none" onchange="agregarFoto(this,${i})"/>
            </label>`).join('')}
          </div>
          <button onclick="limpiarFotosFicha('${id}')" style="margin-top:8px;font-size:.74rem;background:none;border:1px solid #ccc;border-radius:5px;padding:3px 10px;cursor:pointer;color:#718096">🗑 Limpiar fotos</button>
        </div>
      </div>
    </div><!-- /datos pane -->
    <div class="modal-tab-pane" data-tab="visitas" id="visitasPane_${id}">
      <div class="sin-visitas">Cargando visitas...</div>
    </div>
    <div class="modal-tab-pane" data-tab="hoteleria" id="hoteleriaPane_${id}">
      <div class="no-es-hotel">Cargando...</div>
    </div>
    <div class="modal-tab-pane" data-tab="acuerdos" id="acuerdosPane_${id}">
      <div class="sin-visitas">Cargando contratos...</div>
    </div>
    <div class="modal-tab-pane" data-tab="licitaciones" id="licitacionesPane_${id}">
      <div class="sin-visitas">Cargando licitaciones...</div>
    </div>
    <div class="modal-tab-pane" data-tab="programas" id="programasPane_${id}">
      <div class="sin-visitas">Cargando programas...</div>
    </div>
    </div>`;
  document.getElementById('modal').classList.add('open');
  // Precargar pestaña Licitaciones (evita el "Cargando...")
  try{ renderLicitacionesModal(id); }catch(e){}
  // Precargar fotos ya guardadas de este proveedor
  window._fichaFotosPid=id;
  window._fichaFotos=(p.fotos||[]).slice();
  setTimeout(()=>{
    [0,1,2].forEach(i=>{
      const url=window._fichaFotos[i];
      if(url){
        const img=document.getElementById('fotoImg'+i), th=document.getElementById('fotoThumb'+i), pl=document.getElementById('fotoPlaceholder'+i);
        // la URL guardada es del bucket privado: hay que firmarla antes de mostrarla
        if(img&&th&&pl){ resolverUrlFirmada(url).then(u=>{ img.src=u||url; }); th.style.display='block'; pl.style.display='none'; }
      } else { resetFoto(i); }
    });
  },50);
}

// Redimensiona/comprime una imagen a JPEG antes de subirla (máx 1100px, calidad .75)
function _comprimirImagen(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const maxW=1100; const scale=Math.min(1, maxW/img.width);
        const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
        const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
        cv.getContext('2d').drawImage(img,0,0,w,h);
        cv.toBlob(blob=>{
          if(!blob){ reject(new Error('No se pudo procesar la imagen')); return; }
          resolve(new File([blob],'foto.jpg',{type:'image/jpeg'}));
        },'image/jpeg',0.75);
      };
      img.onerror=()=>reject(new Error('Imagen inválida'));
      img.src=e.target.result;
    };
    reader.onerror=()=>reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

async function agregarFoto(input, idx){
  const file = input.files[0]; if(!file) return;
  const pid=window._fichaFotosPid; if(!pid){ showToast('Abre la ficha primero','err'); return; }
  const p=PROVEEDORES.find(x=>x._id===pid); if(!p){ showToast('Proveedor no encontrado','err'); return; }
  showToast('Subiendo foto '+(idx+1)+'...');
  try{
    const comprimida=await _comprimirImagen(file);
    const url=await subirArchivo(comprimida,'fichas/'+(p._proveedorId||pid));
    if(!url) throw new Error('No se pudo subir la foto');
    if(!window._fichaFotos) window._fichaFotos=[];
    window._fichaFotos[idx]=url;
    document.getElementById('fotoImg'+idx).src=url;
    document.getElementById('fotoThumb'+idx).style.display='block';
    document.getElementById('fotoPlaceholder'+idx).style.display='none';
    // Persistir en Supabase y en el estado local
    const fotosLimpias=window._fichaFotos.filter(Boolean).slice(0,3);
    p.fotos=fotosLimpias;
    const {error}=await SUPA.client.from('proveedores').update({fotos_json:JSON.stringify(fotosLimpias)}).eq('proveedor_id',p._proveedorId||pid);
    if(error) throw new Error(error.message);
    showToast('✅ Foto '+(idx+1)+' guardada','success');
  }catch(e){
    console.error('[FOTO] Error:',e);
    showToast('⚠ No se pudo guardar la foto: '+e.message,'err');
  }
}
async function limpiarFotosFicha(pid){
  const p=PROVEEDORES.find(x=>x._id===pid); if(!p) return;
  window._fichaFotos=[]; [0,1,2].forEach(resetFoto);
  p.fotos=[];
  try{
    const {error}=await SUPA.client.from('proveedores').update({fotos_json:'[]'}).eq('proveedor_id',p._proveedorId||pid);
    if(error) throw new Error(error.message);
    showToast('Fotos eliminadas','success');
  }catch(e){ showToast('⚠ Error al eliminar fotos: '+e.message,'err'); }
}
function resetFoto(i){
  const th=document.getElementById('fotoThumb'+i);
  const pl=document.getElementById('fotoPlaceholder'+i);
  if(th) th.style.display='none';
  if(pl) pl.style.display='flex';
}

function closeModal(){ document.getElementById('modal').classList.remove('open'); currentModalId=null; }
let _mdownOnOverlay=false;
function overlayMouseDown(e){ _mdownOnOverlay = (e.target===document.getElementById('modal')); }
function closeModalOverlay(e){ if(_mdownOnOverlay && e.target===document.getElementById('modal')) closeModal(); _mdownOnOverlay=false; }

async function eliminarProveedor(id){
  if(!puedeEliminar()) return;
  if(!requireSession()) return;
  const p=PROVEEDORES.find(x=>x._id===id);
  if(!p) return;
  const nombre=p.nombre_fantasia||p.razon_social||p.nombre_contacto||'este proveedor';
  if(!confirm(`¿Eliminar a "${nombre}" del directorio?\n\nEsta acción también eliminará sus visitas, contactos, licitaciones, hotelería y programas asociados. No se puede deshacer.`)) return;

  // Eliminar de Supabase primero (fuente de verdad)
  try{ await gSyncDelete(id, p.rut_empresa); }
  catch(e){ showToast('Error al eliminar en la nube: '+e.message,'err'); return; }
  await registrarLog('proveedor', p._proveedorId||id, 'eliminar', 'Eliminó proveedor '+nombre);

  // Eliminar del estado local
  PROVEEDORES=PROVEEDORES.filter(x=>x._id!==id);
  delete DB.hoteles[id];
  delete DB.acuerdos[id];
  delete DB.programas[id];
  delete DB.contactos[id];
  const _rutKey=(p.rut_empresa||'').replace(/[^0-9kK]/g,'')||(p.rut_persona||'').replace(/[^0-9kK]/g,'');
  if(_rutKey){ if(!DB._eliminados)DB._eliminados=[]; if(!DB._eliminados.includes(_rutKey))DB._eliminados.push(_rutKey); }

  closeModal();
  await saveDB();
  updateHeroStats(); buildFilters(); buildRangoFilters(); applyFilters();
  actualizarBadgeHabs(); actualizarBadgeAcuerdos(); actualizarBadgeProgramas();
  showToast(`🗑 "${nombre}" eliminado del directorio`,'success');
}

// ── MODAL EDITAR ──────────────────────────────────────────────────────────────
function openEditModal(id){
  currentModalId=id; const p=PROVEEDORES.find(x=>x._id===id); if(!p) return;
  const name=dispName(p);
  document.getElementById('modalContent').innerHTML=`
    <div class="modal-header">
      <div>
        <div class="modal-loc">✏ Editando registro · ${p.localidad}</div>
        <div class="modal-title">${name}</div>
      </div>
      <div class="modal-header-right">
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
    </div>
    <div class="modal-body">
      <div class="edit-form" id="editForm">
        <div class="form-field"><label>Nombre Contacto</label><input id="ef_contacto" value="${esc(p.nombre_contacto)}"></div>
        <div class="form-field"><label>Cargo</label><input id="ef_cargo" value="${esc(p.cargo||'')}"></div>
        <div class="form-field"><label>RUT Persona</label><input id="ef_rut_persona" value="${esc(p.rut_persona)}"></div>
        <div class="form-field"><label>RUT Empresa</label><input id="ef_rut_empresa" value="${esc(p.rut_empresa)}"></div>
        <div class="form-field"><label>Razón Social</label><input id="ef_razon" value="${esc(p.razon_social)}"></div>
        <div class="form-field"><label>Nombre Fantasía</label><input id="ef_fantasia" value="${esc(p.nombre_fantasia)}"></div>
        <div class="form-field"><label>Localidad</label><input id="ef_localidad" value="${esc(p.localidad)}"></div>
        <div class="form-field"><label>Dirección</label><input id="ef_direccion" value="${esc(p.direccion)}"></div>
        <div class="form-field"><label>Correo</label><input id="ef_correo" value="${esc(p.correo)}"></div>
        <div class="form-field"><label>Teléfono</label><input id="ef_fono" value="${esc(p.fono)}" placeholder="+56 9 XXXXXXXX"></div>
        <div class="form-field full" style="background:#1c2632;color:#fff;padding:9px 14px;border-radius:7px;margin-top:4px"><label style="color:#fff;margin:0;font-family:'Barlow Condensed',sans-serif;letter-spacing:.04em">RUBROS — SELECCIONA HASTA 3 · LAS SECCIONES DE ABAJO SE ACTIVAN AUTOMÁTICAMENTE</label></div>
        ${(()=>{const rb=p.rubrosNorm||[];const opt=(sel)=>RUBROS_MAESTROS.map(r=>`<option value="${esc(r)}" ${sel===r?'selected':''}>${esc(r)}</option>`).join('');return `
        <div class="form-field"><label>Rubro 1 *</label><select id="ef_rubro1" onchange="efRubrosChange()"><option value="">— ninguno —</option>${opt(rb[0]||'')}</select></div>
        <div class="form-field"><label>Rubro 2</label><select id="ef_rubro2" onchange="efRubrosChange()"><option value="">— ninguno —</option>${opt(rb[1]||'')}</select></div>
        <div class="form-field"><label>Rubro 3</label><select id="ef_rubro3" onchange="efRubrosChange()"><option value="">— ninguno —</option>${opt(rb[2]||'')}</select></div>`;})()}
        <div class="form-field"><label>Giro SII 1</label><input id="ef_giro1" value="${esc((p.giros||[])[0]||'')}"></div>
        <div class="form-field"><label>Giro SII 2</label><input id="ef_giro2" value="${esc((p.giros||[])[1]||'')}"></div>
        <div class="form-field full"><label>Actividad Principal (separar con coma)</label><input id="ef_act_principal" value="${esc(p.actividad_principal||'')}"></div>
        <div class="form-field full"><label>Descripción General de la Empresa</label><textarea id="ef_desc" rows="4" placeholder="Describe a la empresa: servicios, capacidades, experiencia...">${esc(p.descripcion)}</textarea></div>
        <div class="form-field full"><label>📝 Notas y Comentarios <span style="font-weight:400;color:var(--text-muted);font-size:.8rem">(observaciones internas que quedan en la ficha)</span></label><textarea id="ef_notas" rows="3" placeholder="Comentarios, observaciones, recordatorios sobre este proveedor...">${esc(p.notas_ficha||'')}</textarea></div>
        <div class="form-field full"><label>Plataformas Mineras</label>
          <div id="ef_plataformas_box">${catCheckboxesPlataformas(p.plataformas)}</div></div>
        <div class="form-field">
          <label>Categoría SII</label>
          <select id="ef_cat">
            <option value="">— Sin categoría —</option>
            ${['Primera Categoría','Segunda Categoría','Microempresa','MIPYME','Sin actividad'].map(v=>`<option value="${v}" ${p.categoria_sii===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label>Autorización para Facturar</label>
          <select id="ef_facturar">
            <option value="">— Sin información —</option>
            ${['Autorizado','No autorizado','En trámite'].map(v=>`<option value="${v}" ${p.facturar===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label>Agrupación Gremial</label>
          ${catSelectAgrupacion(p.agrupacion)}
        </div>
        <div class="form-field">
          <label>Estado Registro</label>
          <select id="ef_estado">
            ${['Activo','En proceso','Inactivo'].map(v=>`<option value="${v}" ${p.estado===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-field full">
          <label>Servicios con Antofagasta Minerals</label>
          <select id="ef_servicio_am">
            <option value="">— Sin información —</option>
            ${['Sí — Contrato vigente','Sí — Contrato anterior','En proceso de licitación','No','Sin información'].map(v=>`<option value="${v}" ${p.servicio_am===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-field full">
          <label>📐 Rango de trabajos (envergadura de proyecto en que se siente cómodo)</label>
          <select id="ef_rango">
            <option value="">— Sin definir —</option>
            ${RANGOS_TRABAJO.map(v=>`<option value="${v}" ${p.rango_trabajos===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-field full" style="margin-top:18px">
          <div style="background:linear-gradient(135deg,#F2A900,#d99500);color:#1c2632;padding:9px 14px;border-radius:7px;margin-bottom:14px;font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:.05em;text-transform:uppercase;font-size:.85rem">⛏ Experiencia en Faenas AMSA</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
            <label class="ef-faena-chip"><input type="checkbox" id="ef_pub_cen" ${p.pub_centinela?'checked':''}><span><b>CEN</b> · Centinela</span></label>
            <label class="ef-faena-chip"><input type="checkbox" id="ef_pub_zal" ${p.pub_zaldivar?'checked':''}><span><b>CMZ</b> · Zaldívar</span></label>
            <label class="ef-faena-chip"><input type="checkbox" id="ef_pub_ant" ${p.pub_antucoya?'checked':''}><span><b>ANT</b> · Antucoya</span></label>
          </div>
        </div>

        <!-- PROGRAMA MGI HABITABILIDAD ─────────────────────────────────────
             Marcarlo suma el proveedor a la plataforma MGI con todas sus
             funciones (visitas, estandarización, capacidad). Desmarcarlo lo
             saca. Antes MGI adivinaba por el texto del rubro y no había forma
             de entrar ni salir a voluntad. -->
        <div class="form-field full" style="margin-top:18px">
          <div style="background:linear-gradient(135deg,#5b4fcf,#4338ca);color:#fff;padding:9px 14px;border-radius:7px;margin-bottom:12px;font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:.05em;text-transform:uppercase;font-size:.85rem">🏘 Programa MGI Habitabilidad</div>
          <label class="ef-faena-chip" style="border-color:#5b4fcf">
            <input type="checkbox" id="ef_mgi" ${p.programa_mgi===true?'checked':''} onchange="efMgiChange()">
            <span><b>Participa del programa MGI</b><br><span style="font-size:.72rem;color:var(--text-muted)">Aparece en la plataforma MGI con visitas, estandarización y capacidad</span></span>
          </label>
          <div id="ef_mgi_rubro_box" style="margin-top:10px;${p.programa_mgi===true?'':'display:none'}">
            <label style="font-size:.68rem;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:.07em">Sección dentro de MGI</label>
            <select id="ef_mgi_rubro" style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:6px;margin-top:4px">
              <option value="hoteleria"    ${(p.programa_mgi_rubro||'hoteleria')==='hoteleria'?'selected':''}>🏨 Hotelería</option>
              <option value="lavanderia"   ${p.programa_mgi_rubro==='lavanderia'?'selected':''}>🧺 Lavandería</option>
              <option value="alimentacion" ${p.programa_mgi_rubro==='alimentacion'?'selected':''}>🍽 Alimentación</option>
            </select>
          </div>
          ${p.programa_mgi===false?'<div style="margin-top:8px;font-size:.74rem;color:#b86000">Este proveedor fue sacado del programa explícitamente.</div>':''}
        </div>
      </div>
      <!-- MAQUINARIA / FLOTA (se muestra si hay rubro de transporte o maquinaria) -->
      <div id="ef_maq_section" class="edit-section" style="display:block">
        <div class="form-field full" style="background:#1c2632;color:#fff;padding:9px 14px;border-radius:7px"><label style="color:#fff;margin:0;font-family:'Barlow Condensed',sans-serif;letter-spacing:.04em">⚙ MAQUINARIA Y FLOTA — UNA FILA POR EQUIPO</label></div>
        <div style="overflow-x:auto">
          <table id="ef_maq_tbl" style="width:100%;border-collapse:collapse;font-size:.8rem;margin-top:8px">
            <thead><tr style="background:#1c2632;color:#fff">
              <th style="padding:7px 10px;text-align:left;font-size:.66rem;letter-spacing:.05em">TIPO DE EQUIPO</th>
              <th style="padding:7px 10px;text-align:left;font-size:.66rem;letter-spacing:.05em">CATEGORÍA</th>
              <th style="padding:7px 10px;text-align:left;font-size:.66rem;letter-spacing:.05em">MARCA</th>
              <th style="padding:7px 10px;text-align:left;font-size:.66rem;letter-spacing:.05em">MODELO</th>
              <th style="padding:7px 10px;text-align:left;font-size:.66rem;letter-spacing:.05em">AÑO</th>
              <th style="padding:7px 10px;text-align:left;font-size:.66rem;letter-spacing:.05em">CANT.</th>
              <th style="padding:7px 10px;text-align:left;font-size:.66rem;letter-spacing:.05em">CAPACIDAD / USO</th>
              <th></th>
            </tr></thead>
            <tbody id="ef_maq_body"></tbody>
          </table>
        </div>
        <button type="button" onclick="efAddMaq()" style="margin-top:8px;font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.05em;padding:7px 16px;border-radius:6px;border:1.5px solid var(--border);background:#fff;cursor:pointer;color:var(--primary)">+ AGREGAR EQUIPO</button>
      </div>
      <div class="edit-actions">
        <button class="btn-cancel" onclick="openModal('${id}')">← Cancelar</button>
        <button class="btn-save" onclick="saveEdit('${id}')">💾 Guardar cambios</button>
      </div>
    </div>`;
  document.getElementById('modal').classList.add('open');
  // Inicializar flota/maquinaria
  _efFlota=Array.isArray(p.flota)?JSON.parse(JSON.stringify(p.flota)):[];
  efRenderMaq(); efRubrosChange();
}
// Muestra la seccion de MGI solo si el proveedor participa del programa.
function efMgiChange(){
  const on=!!document.getElementById('ef_mgi')?.checked;
  const box=document.getElementById('ef_mgi_rubro_box');
  if(box) box.style.display=on?'':'none';
}
function esc(s){ return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveEdit(id){
  const p=PROVEEDORES.find(x=>x._id===id); if(!p) return;
  p.nombre_contacto    = document.getElementById('ef_contacto').value.trim();
  p.cargo              = document.getElementById('ef_cargo')?.value.trim()||'';
  p.localidad          = document.getElementById('ef_localidad').value.trim();
  p.nombre_fantasia    = document.getElementById('ef_fantasia').value.trim();
  p.razon_social       = document.getElementById('ef_razon').value.trim();
  p.rut_persona        = document.getElementById('ef_rut_persona').value.trim();
  p.rut_empresa        = document.getElementById('ef_rut_empresa').value.trim();
  p.direccion          = document.getElementById('ef_direccion').value.trim();
  p.fono               = normFono(document.getElementById('ef_fono').value.trim());
  p.correo             = document.getElementById('ef_correo').value.trim();
  p.actividad_principal= document.getElementById('ef_act_principal')?.value.trim()||'';
  p.descripcion        = document.getElementById('ef_desc').value.trim();
  p.notas_ficha        = (document.getElementById('ef_notas')?.value||'').trim();
  const _plat          = catLeerPlataformas();
  p.plataformas        = _plat!==null ? _plat : (document.getElementById('ef_plataformas')?.value.trim()||'');
  p.categoria_sii      = document.getElementById('ef_cat').value;
  p.facturar           = document.getElementById('ef_facturar').value;
  p.estado             = document.getElementById('ef_estado').value;
  p.agrupacion         = (document.getElementById('ef_agrupacion')?.value||'').trim();
  p.servicio_am        = document.getElementById('ef_servicio_am').value;
  p.rango_trabajos     = document.getElementById('ef_rango')?.value||'';
  p.pub_centinela      = !!document.getElementById('ef_pub_cen')?.checked;
  p.pub_antucoya       = !!document.getElementById('ef_pub_ant')?.checked;
  p.pub_zaldivar       = !!document.getElementById('ef_pub_zal')?.checked;
  // Programa MGI: true = dentro, false = fuera. Nunca vuelve a null, porque
  // una vez que alguien decide, esa decisión manda sobre la detección por texto.
  if(document.getElementById('ef_mgi')){
    p.programa_mgi       = !!document.getElementById('ef_mgi').checked;
    p.programa_mgi_rubro = p.programa_mgi ? (document.getElementById('ef_mgi_rubro')?.value||'hoteleria') : null;
    if(p.programa_mgi && p.programa_mgi_rubro==='hoteleria') p.es_hoteleria=true;
  }
  // Giros: máximo 2 campos
  p.giros=[document.getElementById('ef_giro1')?.value.trim(),document.getElementById('ef_giro2')?.value.trim()].filter(Boolean);
  // Rubros: máximo 3 selectores (orden preservado)
  const _r1=document.getElementById('ef_rubro1')?.value||'',_r2=document.getElementById('ef_rubro2')?.value||'',_r3=document.getElementById('ef_rubro3')?.value||'';
  p.rubrosNorm=[...new Set([_r1,_r2,_r3].filter(Boolean))];
  if(!p.rubrosNorm.length){ const _d=p.giros.map(normRubro).filter(Boolean); p.rubrosNorm=_d.length?[...new Set(_d)]:['Otros Servicios']; }
  // Flota / maquinaria
  p.flota=(_efFlota||[]).filter(f=>f.tipo||f.marca||f.modelo).map(f=>({tipo:f.tipo||'',categoria:f.categoria||'',marca:f.marca||'',modelo:f.modelo||'',anio:f.anio||'',cant:f.cant||'',capacidad:f.capacidad||''}));
  // Actualizar cargo en contacto principal
  const _cpEdit=(DB.contactos[id]||[]).find(c=>c.principal)||(DB.contactos[id]||[])[0];
  if(_cpEdit) _cpEdit.cargo=p.cargo;
  p._edited=true;
  p._editedAt=new Date().toISOString();
  // registrar autor de la edición
  if(SUPA && SUPA.session){
    const u=SUPA.session.user;
    p._editedBy=(u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u.email||'').split('@')[0];
  }
  updateHeroStats(); buildFilters(); buildRangoFilters(); applyFilters(); chartsInit=false;
  closeModal();
  showToast('✅ Registro guardado correctamente','success');
  // guardar en Supabase + log de edición con el nombre del usuario
  (async()=>{
    await saveDB();
    if(SUPA && SUPA.session){
      await gSyncPush(id);
      await registrarLog('proveedor', id, 'editar', 'Editó ficha de '+dispName(p));
    }
  })();
}

// ── TABS ──────────────────────────────────────────────────────────────────────
function showTab(tab,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); el.classList.add('active');
  document.getElementById('tab-directorio').style.display=tab==='directorio'?'':'none';
  document.getElementById('tab-estadisticas').style.display=tab==='estadisticas'?'':'none';
  if(tab==='estadisticas'&&!chartsInit){initCharts();chartsInit=true;}
}

// ── CHARTS ────────────────────────────────────────────────────────────────────
function initCharts(){
  const teal=['#00778A','#009eb5','#00bcd4','#4dd0e1','#80deea','#005f6e','#007c8c','#33b5c8','#66c9d6','#99dce4'];
  const allR={}; PROVEEDORES.forEach(p=>p.rubrosNorm.forEach(r=>{allR[r]=(allR[r]||0)+1;}));
  const locs=new Set(PROVEEDORES.map(p=>p.localidad));
  const edited=PROVEEDORES.filter(p=>p._edited).length;
  document.getElementById('kpiGrid').innerHTML=`
    <div class="kpi"><div class="kpi-num">${PROVEEDORES.length}</div><div class="kpi-label">Total</div></div>
    <div class="kpi"><div class="kpi-num">${PROVEEDORES.filter(p=>p.facturar==='Autorizado').length}</div><div class="kpi-label">Autorizados</div></div>
    <div class="kpi"><div class="kpi-num">${locs.size}</div><div class="kpi-label">Localidades</div></div>
    <div class="kpi"><div class="kpi-num">${Object.keys(allR).length}</div><div class="kpi-label">Rubros</div></div>
    <div class="kpi"><div class="kpi-num">${PROVEEDORES.filter(p=>p.rubrosNorm.includes('Hospedaje / Alojamiento')).length}</div><div class="kpi-label">Hospedaje</div></div>
    <div class="kpi"><div class="kpi-num">${edited}</div><div class="kpi-label">Editados</div></div>`;
  Object.values(chartInst).forEach(c=>c.destroy()); chartInst={};
  const rubS=Object.entries(allR).sort((a,b)=>b[1]-a[1]);
  chartInst.r=new Chart(document.getElementById('chartRubros'),{type:'bar',data:{labels:rubS.map(r=>r[0]),datasets:[{data:rubS.map(r=>r[1]),backgroundColor:teal,borderRadius:5,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} proveedores`}}},scales:{x:{grid:{color:'#f0f0f0'},ticks:{color:'#666',font:{size:11}}},y:{grid:{display:false},ticks:{color:'#444',font:{size:11}}}}}});
  const fd={}; PROVEEDORES.forEach(p=>{fd[p.facturar||'Sin info']=(fd[p.facturar||'Sin info']||0)+1;});
  chartInst.f=new Chart(document.getElementById('chartFactura'),{type:'doughnut',data:{labels:Object.keys(fd),datasets:[{data:Object.values(fd),backgroundColor:['#1a7a38','#b86000','#c0392b','#888'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:10},color:'#555'}}}}});
  const cd={}; PROVEEDORES.forEach(p=>{const c=p.categoria_sii||'Sin categoría';cd[c]=(cd[c]||0)+1;});
  chartInst.c=new Chart(document.getElementById('chartCategoria'),{type:'pie',data:{labels:Object.keys(cd),datasets:[{data:Object.values(cd),backgroundColor:['#00778A','#4dc3d2','#ccc','#ffb347'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:10},color:'#555'}}}}});
  const ld={}; PROVEEDORES.forEach(p=>{ld[p.localidad]=(ld[p.localidad]||0)+1;});
  const ldS=Object.entries(ld).sort((a,b)=>b[1]-a[1]);
  chartInst.l=new Chart(document.getElementById('chartLocalidad'),{type:'bar',data:{labels:ldS.map(r=>r[0]),datasets:[{data:ldS.map(r=>r[1]),backgroundColor:teal,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} proveedores`}}},scales:{x:{grid:{display:false},ticks:{color:'#444'}},y:{grid:{color:'#f0f0f0'},beginAtZero:true,ticks:{color:'#666'}}}}});
}

// ── DESCARGAR CONSOLIDADO ─────────────────────────────────────────────────────
function downloadConsolidado(){
  if(!PROVEEDORES.length){showToast('No hay datos para exportar','warning');return;}
  const headers=['NOMBRE CONTACTO','CARGO','RUT PERSONA','RAZÓN SOCIAL','NOMBRE FANTASÍA','RUT EMPRESA','LOCALIDAD','DIRECCIÓN','CORREO','FONO','GIROS SII','ACTIVIDAD PRINCIPAL','DESCRIPCIÓN GENERAL','PLATAFORMAS MINERAS','CATEGORÍA SII','AUTORIZACIÓN PARA FACTURAR','AGRUPACIÓN GREMIAL','SERVICIOS CON AM','ESTADO','EDITADO','FECHA EDICIÓN','CONTACTO 2','CONTACTO 3'];
  const fmtContacto=c=>c?[c.nombre,c.cargo,c.fono,c.correo].filter(Boolean).join(' · '):'';
  const rows=PROVEEDORES.map((p,i)=>{
    const cs=DB.contactos[p._id]||[];
    const cp=cs.find(c=>c.principal)||cs[0]||null;
    const c2=cs.filter(c=>!c.principal)[0]||null;
    const c3=cs.filter(c=>!c.principal)[1]||null;
    return [
    cp?cp.nombre:(p.nombre_contacto||''),
    cp?cp.cargo:(p.cargo||''),
    cp?cp.rut:(p.rut_persona||''),
    p.razon_social||'', p.nombre_fantasia||'',
    p.rut_empresa||'', p.localidad||'', p.direccion||'', p.correo||'', p.fono||'',
    (p.giros||[]).join('; '),
    p.actividad_principal||'',
    p.descripcion||'',
    p.plataformas||'',
    p.categoria_sii||'', p.facturar||'',
    p.agrupacion||'', p.servicio_am||'',
    p.estado||'Activo',
    p._edited?'Sí':'No',
    p._editedAt?new Date(p._editedAt).toLocaleString('es-CL'):'',
    fmtContacto(c2), fmtContacto(c3)
  ];});

  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet([headers,...rows]);

  // Column widths
  const wscols=[{wch:28},{wch:22},{wch:16},{wch:32},{wch:26},{wch:16},{wch:18},{wch:30},{wch:30},{wch:18},{wch:40},{wch:35},{wch:50},{wch:32},{wch:16},{wch:22},{wch:28},{wch:28},{wch:14},{wch:16},{wch:20},{wch:45},{wch:45}];
  ws['!cols']=wscols;

  // Style header row
  const range=XLSX.utils.decode_range(ws['!ref']);
  for(let c=range.s.c;c<=range.e.c;c++){
    const addr=XLSX.utils.encode_cell({r:0,c});
    if(!ws[addr]) continue;
    ws[addr].s={font:{bold:true,color:{rgb:'FFFFFF'},sz:10},fill:{fgColor:{rgb:'00778A'}},alignment:{horizontal:'center',wrapText:true}};
  }

  // Highlight edited rows
  PROVEEDORES.forEach((p,i)=>{
    if(!p._edited) return;
    for(let c=0;c<=20;c++){
      const addr=XLSX.utils.encode_cell({r:i+1,c});
      if(ws[addr]) ws[addr].s={...ws[addr].s,fill:{fgColor:{rgb:'FFF4E0'}}};
    }
  });

  XLSX.utils.book_append_sheet(wb,ws,'Proveedores Consolidado');

  // Summary sheet
  const locs={};PROVEEDORES.forEach(p=>{locs[p.localidad]=(locs[p.localidad]||0)+1;});
  const sumHeaders=['Localidad','Total Proveedores','Autorizados a Facturar','Con Ediciones'];
  const sumRows=Object.entries(locs).sort((a,b)=>b[1]-a[1]).map(([loc,total])=>[
    loc, total,
    PROVEEDORES.filter(p=>p.localidad===loc&&p.facturar==='Autorizado').length,
    PROVEEDORES.filter(p=>p.localidad===loc&&p._edited).length,
  ]);
  sumRows.push(['','','','']);
  sumRows.push(['TOTAL',PROVEEDORES.length,PROVEEDORES.filter(p=>p.facturar==='Autorizado').length,PROVEEDORES.filter(p=>p._edited).length]);
  const ws2=XLSX.utils.aoa_to_sheet([sumHeaders,...sumRows]);
  ws2['!cols']=[{wch:22},{wch:18},{wch:22},{wch:16}];
  XLSX.utils.book_append_sheet(wb,ws2,'Resumen por Localidad');

  const fecha=new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb,`Proveedores_Consolidado_${fecha}.xlsx`);
  showToast(`✅ Descargando ${PROVEEDORES.length} registros…`,'success');
}


const IC = {
  building:    'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAADPUlEQVR4nO2bPXITQRQGO4IrIPuKQMhyBDgZEMElgAPgRNFQW6WIwMY8Ld88TXfVZJZH+77W/OzOwvV4CbwFPgMPwLBxzRo8XGr75lLrqbgHvhk4/0v6r5eaT8Fuo+ETkWCKkWAf9h3uidTgNRPwRQFI/QA+MQG/FICUAHvt4zj8E61BHAVAAZQARwAlwClACXANoAS4CFQC3AUoAW4DlQDvAygB3giqSHAG3gF3z7g5tf/tdvls9/7H6ncC90L+K9sN9D9WF+BU+G6vbqD/sboA6e936/W5+Qvs3v9QAAUYjgCOAMMpwClguAZwDTBcBLoIHO4C3AUMt4FuAwcTMPs+t3v/Y/X7AM95CPMn9zfQ/1hdgMrDmPc30P9YXYDzJYTk4+DNx8E5AWysPQLYUAAlwBFACXAKUAJcAygBLgKVAHcBSsAa28D0ufyz7wVkBUify9/C/T/V4hx9gelz+adw/8sLUCVd4KEAvQOoogDNA6iiAM0DqKIAzQOoogDNA6iiAM0DqKIAzQOoogDNA6iiAM0DqKIAzc/l34X7P1rQMkdfYPpc/hbuf3kB0ufyz74X8DhHG25j7SnAhgIoAY4ASoBTgBLgGkAJcBGoBLgLUALW2Aamz+WffS8gK0D6XP4W7v+pFufoC0yfyz+F+19egCrpAg8F6B1AFQVoHkAVBWgeQBUFaB5AFQVoHkAVBWgeQBUFaB5AFQVoHkAVBWgeQBUFaH4u/y7c/9GCljn6AtPn8rdw/8sLkD6Xf/a9gMc52nAba08BNhRACXAEUAKcApQA1wBKgItAJcBdgBLgNlAJJsAQiNYgjgKgAEqAI4AS4BSgBLgGUAJcBCoB7gJmkWD29/uH28BjCzT7+/1DAY4t0Ozv9w8FmLtAY/IWJ10ABQiTDlgBwqQDVoAw6YAVIEw6YAUIkw5YAcKkA1aAMOmAFSBMOmAFCJMOWAHCpANWgDDpgBUgTDpgBQiTDlgBwqQDVoAw6YAVIEw6YAUIkw5YAcKkA1aAMOmAFeBgXgAfgR8ThGnjr2rwHfhwya7M/o8sPC1rsGdXxl8+bdvPawiQvggbpRoowOISlUlfgA0FUAIcAZSA608BvwGMuvwl45IIOgAAAABJRU5ErkJggg==',
  idcard:      'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFJklEQVR4nO2dS4gdRRSGPx3NOD5AjESNBFFciCAirq6oUVCIiKgLMUKIj8QXotuoJOjGkCDiMyGI+MCFURHxhQsJykg0RkUMOL6ikUkWGgVj0DA+sKSgRjTM1Xunu0+d6v4/+JfdferUf7tv16muAiGEEEIIIYQQQgghhBBCCCFE9xgBFgJrgY3AOPCBRAk5GE99tib1YezLgTkIuB7YBQSJNuRgJ7BsECMcA2x2ELBEIzl4G5jXr/OPB75R8mm7+XYA8/fv/LH07MgdnIRJDramPv+bu5V8uma+ldOdfzSw10FAEqY5+AmYGw1wo5JPV823PBrgVQeBSGTJwcvRAF+pA+iqAb+IBvjFQSASWXIQ+17Jp9s5yB6AhAwgE5DvDrBCoss5EEIIIYQQQnSO3K8hEnlfAzUIQ6dzkD0ACRlAJkB3AJkAPQJkAvQfQCZAfwJlAvQWIBOg10CZAI0DyARoIEgmQCOBMgEaCpYJ6EYt4EfgE2Ab8K2DeEIfTTpYDmZnGwywG3gUuBg4bIaS9RzgrLRe0ZcO4g3AU8OuvdMQMYanSzXAHuAO4NAhGnwgsMTBaibn4YfzSzTAG2ltgtkyCjycMf4efuiVZoBH0mpkdXAD8JsMQDEGeJz6uVoGoAgDvAkcTDPcZ9yWS/HDZRXaYZawfWkpuqaIj5QJw/ZMAGcDJ2XWOcCnJRhgNb5/CaGjMluJ4khs0HqH+DPAC9ixwsGvKhQkk4ssNTTAKQ6SGgqSyUVOxpYfHCQ2FCKTiwwz1FsHHztIbChEJpU9a153kNhQiEwKPm00wDvACeQnxvCuZwPkeARsM2jTIvxwkXcDtPFPYA8/uK8GXmOYjFON2tTDD+4N8KJhMuIEExmA7g4Ff2jUpgvww4Xe7wAh7WHXNJcbtue1PvMXrTm84luPaTl4QcPl4M8M2xOAqbTfQk5NVWyD+b51cYZvEzxg3JbQEplfsC1TwkJLlOWi62qcFHpTpkmhoSXKduFN/7WN6QAckoyUO4GhcGW9+M/p7eCIIT8MuQL42kHyQguUPYCo74HHgEv6mGE0TcC8V7uc0UoDzLSr5UQq6ux2EE+YQfGjzCuBMzNrMbCrbQYoQYvxw1UygL0BevjBfTGojerhBxlABkB3AGMTnIsfYiwygLEB7scPD3o2wHfA88Aq4OY0iBN1K7AZ+LPCztd3/eN81wG3p1rDdiMTbAWey6z3K7ahkcT8Djybvlz9PxakYs4TKaF7ZjjfVJrrHxt8G3DagF8IPQTsNTJDKFS1n3ALcHrFW1osGR+VagVVZxQfC2x0kOjgVLWebG0aq/fIkhomT4QWqrYT3YJ/Fqb5ibmTHhyplpPcQznEtQj/cJD44ES11PUPoCzWOEh8cKJKB/+a/m2XxpjmE1CLATZQLtc6+PV5UKWDz6BcxrSQRDUDxDn4pfOkg19gbs36wI8onw0OOiC3Zn1gfJU6kXIZdbDiuAdVOvi9iit+52JOKhoFqXoS4mIM6zPsez9bedp0IjhQ9gAkZACZAN0BZALyPAJUHaOz5ot9bzZ9SsJdDj6PBnjFQSASWXLw0vSmS+oAOpmDZaSBHE2cpHOKH+DOnR4ZW+UgIAnTHNy5f2k0TslWJ9CJHGxJK6z8i/nADgfBSTSag7iyynH9iiTz0lJu6gRamYO3BinejaTPrCYdBCxRSw4m0xS4ob7ZGEmfdsX9/p4Bxmve916isRyMpz5bnfrQwzb3QgghhBBCCCGEEEIIIYQQQggs+Qs18AhzTeBTjwAAAABJRU5ErkJggg==',
  factory:     'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAADU0lEQVR4nO2dMW4TQRhGH0ViOmgh4gYcAYkTcAokaJK0nIOWM1BxBwhJEypETw0COQUNGbTSIoXCwU7s/WZn3pOmzqf5Xuyd3X9lEBEREREREZEeWQDHwEfgAigTr4vxbx+NWWRCDoBPgdJXrfMxk0zAorLyr0rgJ8EEHFdQ9qp1OMUG9M5pBUWvWifpzemBZQVFr1pDNtkxpfIlOyZdsAKESResAGHSBStAmHTBChAmXbAChEkXrABh0gUrQJh0wQoQJl2wAoRJF6wAYdIFK0CYdMEKECZdsAKESResAGHSBStAmHTBChAmXbAChEkXrABh0gUrQJh0wQoQJl2wAoRJF6wAYdIFK0CYdMEKECZdsAKESRc8FwEWwPPxfcUfwHfgA/AS2KM+1s6bLngOAjwFvlyTcXjB9iH1sFHedME1C3AfeANcrpHzDLg7x7zpgmsV4BnwdcOsL+aYN11wbQI8At7dMOv7OeZNF1yLAHfG/4ift8j6bY550wXXIMDj8Qq5y7zpgpMbuge8An71nDddcGpDnwCfzdufAPeA18Bv8/b3CXCTo1JpPW+64Ck29AHw1rx0J8A2jkql9bzpgne1ods8KpWW86YL3vaG7uKoVFrOmy54mxu6q6NdaTlvuuBtbOiuj3al5bzpALfd0CmOSqXlvOkAN93QKY92peW86QCbbmjiqFRazpsOsMmGpo5KpeW8ZQYbmj4qlZbzlspXDUel0nDeeID/rXUGHGtalxVkaEoAFwqgBPgJoAT4FaAEeA2gBHgRqAR4ClACPAYqAd4HUAK8EaQEeCdQCfBWsBLgswAlwIdBSoBPA5UAHwcrAc4DKAEOhCgBTgQpAY6EKQHOBCoBDoUqAU4FFyeOHQsvSuDcfel8D+IBXCiAEuAngBLgV4AS4DWAEuBFoBLgKUAJ8BioBHgfQAnwRpAS4J1AJcBbwUqAzwKUAB8GKQE+DVQCfBysBDgPoAQ4EKIEOBGkBDgSpgQ4E6gEOBSqBDgVrAQ4Fq4E+F6AEnD9iyFLX86gV0mGn7LjtIIgLiJ7cDIIcGQB9Crg4SDAAjivIIyLSfdg6Hz/7y9cHigBvZU/dP4P++NHwvC94IUhza3l+DO2h1f/80VERERERESkH/4A0gBiUM6D79AAAAAASUVORK5CYII=',
  tag:         'image/png;base64,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',
  tagarrow:    'image/png;base64,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',
  pin:         'image/png;base64,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',
  pin2:        'image/png;base64,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',
  handshake:   'image/png;base64,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',
  person:      'image/png;base64,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',
  phone:       'image/png;base64,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',
  mail:        'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEnUlEQVR4nO2dO4hVRxyHP43EICKibhRBUlisCIIhKCQkjU3ARpAUYgqtLLTy0QhaGbSLldYKCUkZCCmChBQhBgJGFCwWfCEIPhBR1wfR68iBubAuq7v3zJwzj//vgx/cYndmzvxnd++e754ZEEIIIYQQQgghhBBCCCGEqJMPgbU+zWthhHXAj8BzwPk0r38AxlMPTnTLN8DTKYV30zIJbFcR6mTztJ969448918rKmIhcGUOxXc+E8BHqQct4vHdCMV3PsdUgDrYAPzfYgG8BD5NPXgRxnzgfIviO59/gQ9UhHI5EFB857M/9UWIdnwCPImwAJ76m0WiMH6PUHzn8wcwL/UFibmzO2Lxnc8uFaAMVgD3OlgAD4CVqS9OzM7PHRTf+fykAuTN1g6L73y2pb5IMTNLgFs9LIDbwFIVIT9O91B853Mq9cWKt/kcGPS4AAbAVypCmaYvViZkDPPgWEARf/Vp+/0yhoWaviaPgDXAauBhyzZkDAs2fXuntLUvoB0ZwwJN3z9+AQ1pXv8V0J6MYUGm7wWwfoY2x+f4mcGZImNYkOk78p52jwa0K2NYgOm7PMtDIAuA/wLalzHM2PQN/A2j2dgEvGrZh4xhxqbv+xH6ORnQj4xhhqbvJrB4hL4WAdcC+pMxzMz0fd2izy3A65b9yRhmZPrOBPR7NqBfGcMMTN99YCyg72XAnZZ9yxhmYPp2RBjDjoD+ZQwTPNM3zG/E45eAccgYJjB9j73pi8VqGcNyTV8s9gWMR8YwoemLxXwZw3JNXyzGZQzLNX2xOBowPhnDhKYvFgtkDPM0fV/QH5tkDMs1fbE4GTBeGcOEpi8Wi2QMyzV9sdgiY5jW9DW2LjVnA8Zv3hh+GWD67gLLI7zx3BOYwwG/BQZ+DkyS2vSNAZcC+o8Vs8YwpenLpfjOqjFMafpyK76z9oxhStOXY/GdNWMYYvouBJi+nIvvfJq5qZrQ3TtftXzzV0LxnYVnDGPs3jnqIiil+K52Yxhz9865LoIxbwldYdlFZXSxe+dsi6DU4rsanzHsavfOdy2CkovvajOGXe/eOX0R1FB8V8szhn3t3jlcBDUV39XwjOGpHierubN4NYOiucgp1hj2vXtnrRmUuCtpqt07a81EacYwxPQplG0MQ0yfQtnGMNT0KZRtDGOc06dQ5q6ksc7pUyjTGMY8p0+hLGPYxTl9CmUYw67O6VMowxh2eU6fQt7GsI9z+hTyNIZ9mT6FPI1hn+f0KeRlDGX6sGsMZfqwbQxl+rBrDGX6sGsMZfqwbQxl+rBrDGX6sG0MZfqwawxl+rBrDGX6sG0MZfqwawxl+rBrDGX6sG0MZfqwawxl+rBrDGX6sG0MZfqwawxl+rBrDGX6sG0MZfqwawxXAZMZDEih1zmYHN4mPqHJx+riO05lu2opjDQHF5sF8EwTh+U/A9zJYCAKyRwB51QArC7A5pNefJvBQBSSzMHO4U0g/RbA3CL8c+rNoOb/Qe3uhZn8DXw8/XZwc/T6IeBGBgNU6GQOrgMHfa3fS3Mi50bgM4Ua5mBjhFNWhRBCCCGEEEIIIYQQQghRIG8AIwtwy6HGPxEAAAAASUVORK5CYII=',
  mountain:    'image/png;base64,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',
  clock:       'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEnElEQVR4nO2dz24WVRjGfzs1tO6MAcoKlxrZCHIJJNalwUuA2ptgIzsVFyhlxT1QrkCjbEzcAO74s1FXthAtbTPmxPMZ8intDJ2Z5/3mfX7Jk7CAycxznnnnnEPfU8jDMvApsAHcBX4DnleVP/8I3AAu1r9rJsJx4DrwDGha6lkNyjvqmzevzhvAFeBph4Fv5lSqw1XgNQ/EYlHe3J+PMPDNnL4D3lY/lGnHGeDXHge/qXoEvOtBiP/mDzH4TdVDV4K4vA78NODgN1Xfe04QkysjDH5T9bn6Yc1/l3pHme03HbUDnPYgxOH6iIPfVJVNIxOA5Y6bPH8CXwJngWNV54CvgL86XKdUnCX1w5t/tne7LOXeO8C094HHHa73iQdAz0aHN/+gwX8xBG0rwbf//isj427LwfqiwzWvtbzmDwM+l2nJ7y0H64MOjp5rec2y6WTE7LQcrC4TtqWW1yyfCnMAp4DPgDvAvZHX6kcJwLLwPp9Wr4pna8DKIibsZJ2c7QmNnFdZ9rXlwwD3O9Ne9fIEC8LHwFYA4+ZV1vlt+TrA/c6reLpKcNaB/QBmvex7XZZ4bf47eSfA/f6f9qvHYd/8qIM/0+NDQnAGeBLgPg8LwWrEb37Esv+ySnCtfueXqs7Xsh/1zZ/XVrQ5wc0ApmTTDQIt9SLN9rNoN8oScT2AGVm1RgA2AxiRVbcJwC8BjMiq+wRgO4ARWbVNANQmZJcctQHZJUdtQHbJURuQXXLUBmSXHLUB2SVHbUB2yVEbkF1y1AZklxy1AdklR21AdslRG5BdctQGZJcctQHZJUdtQHbJURuQXXLUBmSXHLUB2SWn7wfq6wyfLJLT58P0fYZPBsnp60GGOMNn9qPTIRoo5ljp6UfqJxOAIc7waYIO/otdVQ7AgGf4hHhDDsEBGPAMHwdgogF40wFgcgEY6gyf6DSeBA57ho8ngQtSAYY6w2ezzrajcaoeBecKMLEzfJqRJafvB5rCGT6NA6A3JovkqA3ILjlqA7JLjtqA7JKjNiC75KgNyC45agOyS47agOySozYgu+SoDcguOWoDskuO2oDsktP3A7kvgLwBcF8AeSuA+wLI/QlwXwC5A+C+AHIHwH0BOABtcV8A06sA7gsgdwVwXwC5A+C+AHIHoMh9AeQOwKwSuC+AvAGwyF0BLBwAhwBXAIcAfwIcAjwHcAjwJNAhwKsAhwAvAx0CvA/gEOCNIIcA7wQ6BExzK9h9AeTdCnZfAJ09k9Pnm+/fF0DeALgvgFfybTIBcF8AuQPgvgAcgLa4L4DpVQD3BZC7ArgvgNwBcF8AuQNQ5L4AcgdgVgncF0DeAFjkrgAWDoBDgCuAQ4A/AQ4BngM4BHgS6BDgVYBDgJeBDgHeB3AIiLURtOXNG1Sh/IMAPHAAUAXgHgEov57dZRmJB7cJwJoDgOoFuEQAVoA9h4CxB3+3eh+CDQeAsQPwDYE44dUAY8/+jxOMC/4UMMbg7wOrBGW93uDY5TCL9qvHoSnp9OYQg5T9j1gQ3qo/578b4K2Zwlt/K+I3vw0rdZ9gs+5abQcwNLq2q1dlk+fy0Eu9vwEusHhRpbRRDAAAAABJRU5ErkJggg==',
  clipboard:   'image/png;base64,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',
  gears:       'image/png;base64,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',
  logo:        'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAABwCAIAAAC/7rGtAAAACXBIWXMAAAsSAAALEgHS3X78AAAgAElEQVR4nO2dB1RUx9fAH4g0FSzYEDVEFHuNEXsUY0uMGk2MRhOjxqhJ/rElthh77w2k995771V6Z3fZSu9I77vf2b0633Mby+6iqHsPhwO78+bNzJv5vTt37tzBWB+MMJnM7i74s51BrPcxrX52vOLajxW3f6q1PtcU59pVWwbJWK+TyUQmMnm/BGN9WLRqyU0uO7eLunEMeZUKRV+Rul6ZulGR9pUC7Vulol8nVpv83llJYydnJ2a+60LLRCYy+QiBxWRygNVdbXytYMUw8rJB1A2jqZs1ad+OpW8fQ98xhrFrNGP3KMaPQ+nfyRUf1mx+4cK+SqZnyUQm75tgHwatWCxW2YXfiPOUKGvGUjeMo24cTf16NG3zKPq3I+nbNRg/aDB2jSj8SaNw/6jCX4Yw9ig0hhuxr5UxSyYyea/k/QdWF3smWP3sCnG2EmXNBMqasZS1Y9gaFi+w9owo3Du86IBG0cFhhb8oNKe4vZ4bykQmMnk/5P0GFpNDq6bYUNJnI8grx5FXaVL0x/QArP3Din4bUXRwUMlJrc5qOieX7nddD5nIRCYfPLA4M8HO2mrqpgWkhRrkL7TIq8aKBKyDQ4t/1yjcL1dlsJWTT7fMAC8TmbwX8j4Dq5utGZX9+wdh5hDyignkFWNFBtaw4sNDi/83ouhXrDH8ISerznddGZnIRCYfLrBgMljv7UyYPrRgyQTy0nHkFZq9A9YfQ4v/HFJyfFh7YRonR9nEUCYy6e+Cvb+6VTuDSl4+lTR/TMGS8QXiAEu95Ojw4t8HVN5fxuxsQ3NMmchEJv1W3k9gcchS9OsPBN2hBXoTC/TGiQms/6mVnBhefASr9/2Xna1sxVAmMunfgr2nk8Eac4P8T9VICz8hLdSSAFjqJcfUSv9WKzmh2EYKk3k5yEQm/Vyw93Ey2JqdSZw9kThbi7RgvBSA9c/QkuMDK25P726qZt9CNjGUiUz6q7xXwOKgpLutjf7thvxJGqT5n5Dma0kBWCeHlJ4ZVnIMq3PZz7mLzJVUJjLpp4K9d5PBiptX8zTViXO1iXPGSw1Yp4aUnVMr+QdryXRk30nm5SATmfRLwd4zp/aYqHztscTpE4mzJhDnShlYpWeVKm6M7apjh3OQeTnIRCb9ULD3aDLY9fIlecWSvE/GEGdqE2dKG1hnB5ddUC89jdXafs25o8wtSyYy6XeCvUfqVcnx4zmjhhFnTCJMmyB9Devs4LLzg8ovqZWdw5oTHrDvKpsYykQm/Uyw94VWLz09c0eNJEz5lKA7kdh3wLo4uPyScsV1tY7yDLj3u669TGQik/cHWExwai8qIs6akzdei6A7iTBNmzjjE+KcT4jzJ5I+m0BaNEF8T3ceYJVdUC2/OqT8AlZjvpjZ1cYJSipzf5eJTPqLYO+F4xVj997cEaPyP/00d9yYvPGj8z8Zla8zKl93JGG6BmHmCNI8jYIlmuQvxpFXa0qqYV0YVH5ZteKGWvlFrDHiFLsAzA9nXzSTyex6LUzR3M26u7shfTfnQYiRuEtcEVRCuEtnZ2cHRzo7O0WsjrQKwNWSPd6X7+VQC6hCr2ohlccqqEmRCMmqjx6oiH2sXwOL2clxajexyFJUyx2tRZw+lbZlTfGRHRW3T1Y+OVf1+EzFrb+Kf99K/2EZefl40ufDyMtHUr4cR1knGbCuqFZcU624qVJxc0A7LeRDnRj2tmczOcJ6pyIcEJ2dnaL0eKkIvil62yxCasFkMjs7O99mYTqFNprYRBZPROlj/RdYzC52O7Zk5uQMn1CwWK/i+rHGIMOWVMfWDJeWVKfmFKfmJMemRMemRKfGSNs65wdlF/fRNk0lL1Vna1gbx1K/HiUBsFQqbg2quCFXbTKtu7WWU5r3e2II/aClpSU6OjomJiYqKqqqqkp4/4avKBRKJEfy8/OFpIfPSSQSJM7NzYXPu7u7U1JSoqKiYnojsbGxkZGRtbW1+Dt2d3fD3+Xl5V5eXteuXTt79uy5c+du3brl6+tbWVmJdA2+ZWtubo6NjRW9ABERESUlJbxVhn/LysoiIyMhZVsbZ+e8aIKKR6FQnJycrl69CrV48OBBdHR0a2sr1FRE8jI5hamqqkKFaWlp6ZWWB38UFhZ6eno+efLk8ePHjx49MjIyioiIqKmpwScD6ejoiIuLg17U22fa3NzMF6/Z2dmRkZFRUVHZ2dk9Fhvr107tjS3UTd+Vnfq1NcOxLdelNcWuKd6qKdayKdqyMcqiMcK8Idy8IdS8IcS8Idy6Kdqx3tek9PxuytoxlLUjaJvG0jaPFB9YN1Uq7w0uv47VB/zyAeyLhve2oaEhhmFKSkoYhp08eRI/fgRd8vvvv2McGTlyJI3G9lDjO5Ygn/3790Pir79mu4Ywmcz29vbJkydjGCYvL4+JLAMGDMAwLCAgAOUMhSGTyfv27RsyZAiGYXJycpAY/lBXVz9w4ACdzg4hy6WkQIGzs7OhDOjCHgvw4MED3tygPPv27cMwTFFREcMwBwcH3mS8gmAaGxu7fv16eApIoFQ6OjrPnz+H2ZMozOriZPjnn3+iwlhYWIhYGMg/ODhYX19fWVmZtzAjRoz4+eef4UWF5muVlZWqqqoiNiM+N3l5+aysLHz/AVpVV1drampCyjFjxvT4Hu23wGLXqtbaqs7uagfNqyXZpjnBqiXRujnBujneujnWqinGqinKsjHSsjHcsjHUoiHYvD7ApD7IoiHCscb8Mu27ydR1Q2lbxkgErDvKlQ9UK+9gbfm277UxC2nay5YtwzBs4MCBGIZ98skn9fX1QjoHdPr//e9/GIZBh96zZ48gxsGHBw4cgJ73zTffIGBNmTKFL7DkXkuPwILM7ezsBg8eDFlx5TZgwAD4ZOjQoZ6enlyFhBGSm5uroKDQK2A9fPiQa/BDVmVlZSNGjEAt+dVXXwniOF4gwbVr16AAqMy8tVizZk1ZWVmPeTI5D662thYGPBTmiy++6HFuBd8ymczDhw+jB8HVAqiRVVRUTE1NUTsIAZagB4qABQoUqhQ8IwsLCwzDFDiCgCvkPdovgcVp63Y6sSncsI3g0pJk1ZJs25Jk0/LCRiCwQiwagszrA8xe+hg3hNjWOj9m7J5B/WoofdtoiYB1X6Xy/oBq4zFd9e+x+zs8/sTERNSBYECCaiCoc0AHhbe3goICdF8/Pz++lwgB1tSpU1EOeMF3aK6vYOwFBgayu0F7O4vFMjU1hU4PX2EYNnHixKVLly5ZsmT8+PHwCagYAwYMcHR0xBcSAQtqzXs7XoG7PHr0iAtY8LeBgQHcCIaisrJyXl6ecL5AYS5cuABkgcGpoKCgq6u7bNkyPT29UaNGQQVB85o5c2ZpaakoedrY2OALM2DAgMzMTOEXwldAq4EDB0KzKCsrT548eerUqdOmTYPCQJPCt2ZmZnBtZWUlvDYAr3wfKNfnUDYFBYWcnBxeDWvNmjWQG9yoR+Bi/dWA1dGW79mWadOaatuaaisqsALN6/3N6n2M6wNtau3v0LePp20ZTv9uJGOHuMC6p1T1WLXyHlbvs+n9jf4OPfuPP/5APRs6h3DVgC+w5s6dy2uJEAQssDqVlJTQaDT6a6FSqaWlpfHx8fCiBi7U1NRQKBSUBpK1tLTAXaKjoxUUFKDTYxi2Y8eO5OTkpqYm6NZNTU2xsbFfffUV0jJUVFRSU1NR1bg0LAzDPDw8KisrqVQqXbBQqVQuDRSNoiVLlnC15IULF4RMxKBxPD09UUsqKCgcP36cQCCA/YvJZL58+dLZ2Rmmz8CsqVOn8jWiIYF6ffnll1yF+fvvv3ssTFRUFBQGw7Bx48YZGBgUFhY2Nze3cqS2tvbFixd79uxByuagQYPS09PBhsVgMLgaqqysLCIiAr1LPD09q6qqeJu3o6MDVQcKn56ejtReAK6cnFxaWpqQbtkPgcWuT0dxYmu6RVumfWu6Xa+B5Wf20su4PtCu8ulJ2jfqbGD9oMH4UTwNS6nqoVLVM5XKB1hLxv330f0d+kdNTY2WlhZ0iIEDBwJ9FBUVhagGeGChlySGYVeuXBFk2eECFl/dDe5VVFQEpigMw0Ah4h1gUPKOjo7PPvsMja5nz56hTBBB4Pe1a9cQs1atWoW+4p0SvnjxQvi8g69APgkJCUiPUFJSgpacNm0aWLt54YJqMWPGDLj7oEGDQHnE1wKS1dXVAYAwDBs9ejTXHAov8GFWVhZUCiAIY15bW7uxsVEQ6aDWBw8ehMKoqqoCibjuAv8+evQIGQSWLl2Kb22ulAUFBaDhYhgmSvPCt3///Tf0roEDByJtTrh1FeuXewbpbVnWbVn2bRl2YgLLx+ylp1F9gH3p2U20bwYxdo4Wd0rIAdZTpWqDgdXGKp2VyZxCvk8GeHjw1tbWqFtfu3ZNTU0N+tbFixcFvY25NCxkhxoyZAgsAnI5WwkCVvebAtnSaDSYWWAYZmvLNhG2t7fzTWlra4ume2fPnoXBj3fqAVcASHzo0CGU2NvbG28txmtY8fHxkE+3UOGrRYKiimHYhAkTLl26hHQQLy8vvsMMXwuAqZER+xDf9vZ23lqwY721turp6S1YsEC4GauTk/jUqVNQmJEjR16+fBkVxsnJSdCYhzuuXLkSLvzxxx9R4yN0wvoA3AKeqby8/KJFi2ApFpqU6zERCAQErISEBL7Ny1WGhoaGSZMmwSU7d+789ttv0WRfCHD7FbA4/O5obie4tWXZSgosb9M6d+OXQfaFB6bTt6kxdo8s3DNcXGApVhsqVz3DXnrosd3fXxe1/wt6daP39syZM1ks1urVq+HfqVOnwlI6b+fAA0tOTm7EiBEqKirArC1btogOLC6BqxgMBgKWnZ0dX2hCyvXr10MyHR2dhoYG4RpHeXk5WnLatWuXIGDBiOqVhoUs3OPGjYNMdu/e3dnZOXbsWPh327ZtfMsGn2zcuBGSzZ07F1yf+I5GtBJXV1cnhFbM104qaMB/++23XV1dEydOhH83bdrE93J000WLFkHKY8eOIUMh38IwGIxvv/0W6M9XIBmRSBRdw4KvHB0d0bswNDTUz88PMV0IcPsdsDoLo9qzrNpyHNqy7CQDlkmdh1FXS3NTghftGyUOsMTWsBSrDRSrTVSqn2HNSafeo4khshSgaeDly5dZLJaxsTHqHD4+PkJUAwAWDAlkpkXzOHSV1IGF3J2GDx8Oyc6dOyd8wZ6rwOPHjwdzGxRDQmBBYktLS9QCMIahTUDxJJPJXJiAWpSWlmpoaECy+/fvC68FvGOEu2J1cQrj7u6OCgPrJydOnABtSFlZGdwReDOBa9ELTEdHB+AIWqoQxgkyhPcWWGiSvmnTJkivq6vb1tbW1NSkra2Nd4vh2wL9BlicBbiuWmJ7jnV7rkNbtr1EwPI1r3MzaCOxl0s4B9n/Tts8oHDvKImAZTSwxnRgtSnWURL0vkwM8RMHsJ6QSCR2EMSKijFjxkDn+P7770UB1ldffVVZWTly5EjU0V++fIk6tNSBBdfGxMSgqWhkZKQo721fX1+4ZMCAAchOzAWsuLg4NCkTJHyLvXbtWshh+vTpoJkmJiYia/f169e5Sgh/BwUFQZHk5OSSk5N7ZGWPDt9dnMu3bNkChdHW1oZngX8zCZrswye3bt1C1v2VK1cCapE5HLbmoML0uLGmV8CC9Hl5eUpKSmB0g1cRMmkBcAkEAl9mYf1oMthW1050as+zlxRY/uZ1HoaN8X6Ig92NtSVH5zN+UC3cpyERsMwUq02xl2463W1V/X9iCD2svr7+008/hZ4EUzkYwMgHZ/DgwXw9QrmApa+vz2Kxnjx5goxEsBoF/VLqwIJ/wZsBHKx6dE2CrwgEgrKyMowEd3d3NN+RxOgOOWdkZCgoKPAuC65YsQI/3cNrJXCLp0+fQoIxY8bwWmfQpkhe4auIdb82cg8aNAjYdOrUKfRYeZHK11O/tLQUFmHgUQ4aNGjXrl1ubm7QyMi4LsoOx94CCyoFHh7y8vKKiorg7sBisdLS0hD9//vvP77A7SfAYjdPJyO4Pc+6Pd+xPddefGAFmNf7mrwMsO5qqn+tgLIbriUrnLFzCFvDOjBcAg1LocZSqcYUa4r7uf8rWdBjnJ2dkaXAzc0NDWBY7YLP7927JwgZCFhr166F3rl8+XK0spOSkoI2r/YFsMCqjWHYlClT+LpT4AUttCEzloGBAS+wwKsoKysrISHhBT9JTExMTk7mdb86ffo0ev8TiUTECBMTE9SSQUFB+IrDhcePH4f7zpkzB19U8aSTkycsiYIzFF6RtLKyQoXh9aHFP4KoqChYqEUUxjBMTU1t3bp19+/fz87Oxjuy9fieEBFYyPoG3nkYhq1fvx5/C319ffh82rRpyOejnwELJoPV2R351u0Ex/Y8BwmB9dLreXsh8Y0NgByTU53TZfp3ckUHR0oELHOFWpuBNZZYO82eU/b+a8zishRMnjy5qakJ3wMWL14MX82bNw8tsQsHFuwsQW5+a9aswW86kSKwYPidO3cO0ujp6cHnPQKru7sbvJkwDLt9+zYeWMhxFBMs8O2gQYPQHhG0FRFZuJFJG9nIkacl12YAru1N0Ib4GR+TyTQzM7t06dKNGzeu4+TGjRuXL1+GbTq8dezq6po1axbkuXr1anyetbW1yJMWJvtCtlLl5ORs2LAB0QovioqKc+fOPX36NNBHyFahXgELPvTy8kJURRuboK1gOVuIdfVdAwuUz5aKDpJ9B9GxneAgCbAagixfehk0p0egnN+4S2dH2cXVjB8Viw5pSACsAbXWCrU2WJ3ryO5GSr91f0fzIxUVFbyloKOjg8lkAg6ePXuGOkd4eDhX5+ALLLgQ9utABzU2NmaxWPAylLqGhe6+dOlSUYw78O306dPhqjt37kgOLKiFm5sb1xpWZ2cn8kUAtyaYuhYWFqJqwrc7d+6Ebzds2MDleNXZ2Tl79mzerUvwr7a2Nte0rotTmMDAQDTgzc3NuQpz9OhRNNkvKCgQsq6K9h4/fPhww4YNw4YN49saW7ZsARdWIeuzIgILEn/33XeQcsKECeCdi+hfXV2NFl75WlffLbDYDdbd3dHJ8O8g2naQnCQCVrBFvb9JQ7gjs72Vj4EJAgHS0ot+1Sg6oF58eJgEwBpQaz+w1gZrjFr/uhL9zpiF3wsCe03wGyOgp+KN6Pv27RMFWJCgoqICraBraWmB4aMvgHXy5EmpAwu8lrS0tMbxEy0trTFjxkyePJkrVsHWrVvhWm1tbbyiCnWE+TXvDkT4DTulMQzbuHEjL7DmzJnDBSy0QWf69OlQeC5g7eH4oIOTOj6mBXybkpKC9sqAjiloUZJrrldRUeHu7v7bb7/p6uoCDWHiD75RgqzgogMLUpLJZFVVVUDhiRMn8MWDSxBwhwwZArvZ8Td9x8DqYLLaK5M7SdYdBU6Sa1gv/Uw6KgoFaT3MLna71Ac+YeyWK/59hETAspOvc1KstcUaqWynR2Y/2xfNaylYtWoVbLl4+VpqamqYTOZPP/2ExnBFRQV+bPAFFnqNwwI/9NGDBw/CJX03JZw3bx7k1uOUsKWl5ZNPPoGrwDbHa8OKiYkBF01B1m7QQ/EWblVVVUDA0aNHQRGAZqyrq4M/5s6dC5l//vnnqDxcU8Jly5ahr1D+hw4dWr58+dq1a9esWaOvr79hwwZUfl1dXTywujmFKSwsHDp0KCQ4cOAAk8msqalBj7Wurq6pqQk2D4HVDL8hhq9AHEF883Z2dqampp4+fRr2eAM99fT0+D4C0YEFrXH79m2kHoaHh3d0dKBuWVtb29HRERERgRLAKwffN94ZsLo41fYnF98PcmIxnNpIjhIBK9Sq3tewNS+hh9hVHJBVPdpWuFe++H8jSv6nJi6wFOrtsVLvaVEFOQ3tnIUhVj8S6Cs+Pj7o1a2urq6lpaWJk7Fjx2ppaYGXE3QOQ0NDfOcQBCw02DZs2IB27YSFhbFYrF9++UW6Gtbdu3eRKgHuQkIGHuRcUlKCXLesra35AisxMVHEVUIoxvXr11EraWhocLWkpqamlpYWVAcUh6ioKMgfLr948SLcd9KkScKxC+kRprmA1cn59sGDB0IKM3bs2PHjx6urq6NHHxISwhu+gq/XFYr8iR4xg8HQ09NDbyYu57teAQvpgEB22Ok1btw4rpbU1NQcN24c2su9YMECLuvquwEW3L6iqfk7Zz89M7eYZBcW1bGVIC6wwizrA02a4txBhxJ6Y45loYpWcmxC0eFBJX8NFdOGZStf56CQmOXlT61KLiru7mfh/fCWArTFTJCAyxKGYcuXLxdFw0KzpLS0NGVlZRgVCxYs6As/LBcXF9S5KRS2xbBHd0oISgGlCg4O5uuHBY6jYPcRJPgxNnPmTORIJbwl4RaHDh3CA8vOzg4SDB06lDcGA975C0yByBkVDyykZH3++ed8o9NwCdr7+fPPPwtZsxPkCwpqF2yiQrYt2McjHrDg37CwMOGRhVDhUQIu6+q7BNa/EfErLFzWWHtut3evzHfqJjm05YsDLE4MP4uul5UihQblrOs1JzoVHhhQcnSYGMCqsVZssMJyYv4JpNeFkylBBVRyDeflz+oXAh2ISqUOGjRIxMh5qOvgVQ8hwEJpYKUfWd/B01oqwIJkOTk5qAqgLgnxEYfbgacYrNAXFxejS8TwdIcEwcHBoserg6KOGjUK5tdw69TUVIhpwxWVUFDjrFu3DnKbMmUKAhZcEsGZLolYHrjjsGHDioqK8JQkk8ne3t7//fefi4uL8HcAMGvv3r2Q4cqVKyUEFmTV40sUBN6jXNZV7F1NBj0JlJWWrhvtvDbYuC8yc/vXx5VFdmwVA1gRVvWBz9uocCqXaNDgeGbVWB4oOoCVnBzeK2BVWyi+tMAKvRcHU4pDyfQwCi2MQg+j0GtbOKs5rHcveEvBgAEDFBQUjI2No6KiAgMDg9+UoKCg8PBwR0dHFDjhzz//5DIYCwIW/H758qWuri4kmDhxInKikdbWnLa2NghygGHY9u3bhQMLcl61ahWkX7RoEXwu9tYcSLB79264avTo0T4+PqGhoUFBQVwtGRgYGBMTc+fOHTRZwwe9a2tr09HR4W1hLkERONFKCC+wDrzWYUePHu3p6SmoMNHR0Y8fP0ZOmI8fP0YaJQpBhWHYl19+KRxYXEsfYgMLbbQCoxjs9IqPjw8ICOAqPJQ/Li4O4gXBtLe8vBxl8raBBbMnal39Zief9Xae620911p7rLV2+9zUzTPamUV2aMntDbCirBqCjVtSAnoXdh206+a68ouziv9ULP1nqOhbc2rN5apt1aNyooOopWFkaiiFHk5hhJLpCUUlnSLEtO1rQRMHZANGEz0hG8G2b98OibW0tNDqmHBgoR4J6/0wXUKzS6lsfsYv0oPnF2ypgdc+l8DABm0IFrauXr2KP2Sht8CCq4qLi9GE6I8//hDuD9nW1oZWOWBs8zbjyJEjwe+Bt75QL1jNgKIiYKFIpyNfs2z//v3CC8NkMhcsWACJFy5ciLeCnT9/HkzpioqK4HQqCKDwObgKI7cMMYCF9/iHqgnZaMXruvH8+XNUyLcKLOjpnd3dx4Oj19i4f23vtY4DrDVWbivN3dZaulAyHJkEh9YcEYFl1Rhu0Rhl2938yqm9FyXhKFmteSHFfyqX/q0mIrCqzZRemmBpcXcCaDWhBQWhZHooR72KoDKCybT8ymoJnZglF3jYoaGh6GFDMJO2tja+O+ZgPKDYcvgYtT0CC3VWWPIHPV+KwEIhnxQVFWF2M2fOHOApOooKHU4FeUI4ZpgPUqlU/Mp9b4EFeT58+BDNTWJjY4XsQATzE7AA0sM2AMgnJSUFOZTv2LEDv/EFBGhVV1cHVeACFmRiZGSED2/QY2HwGh8UHu6SkpLC9aRQiB6UA2pV/BZr9A4QT8NCjsqfffYZimDDW3h4x3R0dIDDB5d1FXv76pV1Zv5qG/fNjj4bX2tY+lZu+pZuC01cjjg7dxIc2nrWsKw5wLJuCDXpKHnTqb0XpWG3+0vv88VHsNIzw3oEVpWx8svnGMX760BKRQiJEkKmIWCFUxkRNEYohV7RxNk+wnpngrcUgDrN5azQowMEcl4XHVgEAgEdDCFFYKHEUAZYXJ8/fz5E48I7i7NYrKSkJKgCJIO9figgV2+BhTJfuHChiK72cJf8/Hy0EIGcjOAr8MaC4u3atQu/dRwFWYSFVxTfFT8lRCH5MRGcPOCOdDp98ODBYC367bffoMpwCWycBsT89NNPXAcUoadsa2uLzAVo5zzfUH9CgAUJYDEEugffrWDCF2fhkb1VYAGtMsurNjn6bHby2eTgvdHOEzQsfSu3VRZuqy1c5hg6mwU7sYj2zVk9aVix1o1hxq05PE7tossr9/f2ygdLS47Kl/2rLgRYVQZKNc+xcmvNsNzUIHJxSAEfYIVTGbGFxW2w/VXqzSdShV7ta0WWgr179/aoSsC3//33H7J5QYxaGCrCgcW7tU26wEKR3gAcEPpSVVV1586dZmZmkZGR4eHhxsbGW7duBRDA79WrV/NG4+0VsHjjCPPGdxdUNYAOlxs3xOqCXehQyHHjxh09etTFxSUmJsbPz+/8+fMQaQt0GTywoBb4sBC3bt3qsTBQhe+//x7ZvMB3Hz4nEAjg/AGUGT169P79+42MjEJCQuLi4jw9Pa9duwYxs5Dv6LVr14S4gwoBFvwBzmgQMgQpv8JbsqCgAAEXbH9vD1jQx5s7Og/7R2x08N7i5Ps1F7As3b4wd1lm4rzE2CnjhQMrz745UzCw4qwbo8ybE5yZ7ZxT2MSehXEmhh3FGaWnh5WeUS07P1ggsAyVag2wFwlm/tSqEFJBcAGNC1jhVEYkrTCUSs+u4ByQx3oHgj/LC8Y2rOuLYqzJyclRUlKCrgmBPWFa8ddff+E3qfICC/5tbW2F3W1wX94If1y3YzAY6urqMIxceQsAACAASURBVPzs7e17XDgrLS2dN28e/tAELkHjSk9Pr7r6jbk5AhZENB4wYECPfljw1a+//grsGD58OH7DjShx6aAdnJ2d4XMUmAyi+gwcOJDvQTUw5vX09IAm06ZNg1igaDuUgoLCkCFDevTw4Aq2A4WBgyRQ8JzAwEAIq48i0vAKmsZCnD8hD5REIqmoqEBiPLDQ4sz48eOhyt9++22PheeyNsjJyWlpaYEaiL1N9epZSuY6e69tLn7fOPnwAmuluctKU+cFz51+sHZsyLJvz7JrFTwlbIw066wGp3aJ4AC7lxujHpUcw8ouqJdfUOUBlmLlM5W6x1i+z14/SlUwkU0rXmBF0BgRtMJIOptZxfXswJhv2ZaFxicytc6aNYsr2onwzoHWZcaPHw+dA+8ThKaKvLlB14SIkdBlYQ+KkP5Np9PB6wKFSO5x+a+urm7v3r18aYWYdfjwYYjfgr81soWhYQnGe+GILCkpQYoqX/8jIfrghAkT4EJ0Bgy6vKCgAMIT8wUWLIYmJCSAFqajowN7CSsrK1H8su2c1VIRC9Pa2orseosXL+Z6ZBkZGSg2Dq9ACceMGQMOJcKjpBIIBHQIBR5Y+JcoJPDw8BB9iRZvXYVdq9hb82OIKSzZ5Oyz3dV/i7OvIGAtN3VeYeI045njTS8HVq5dczo/YCXYNkWatJHZL0lpUIEJ3qQ15t+U/I2VX1Irv/zGqTmVj1RqHmLFltOCCMRAEj2IRBEOrAh6YTSjqAmmJKy3J9BvKBTKihUrVq9ePX/+fBMTExH9udEe+s8++0xfX3/RokXIZPDo0aOFCxfq6enB0QDCVxtPnTq1iCOgo/EFFlxeXl6+fv36lStXLly4kNcVm2/+kFtqauqff/45Z84cdXV1FY4MHz58wYIFJ0+eROd08jWy0Gi01atXr1ixYuXKlbwx6XlbIzg4GLUG8lzvsSUhz7t37y5YsOCLL7748ssv8RGmYMx3dnb6+vru2rVLR0dn8ODBUIuRI0euWLECNhvQaDR9fX09Pb09e/aAnhsdHf3555/r6+uL2Fz4ihgYGMyfP3/VqlWrV68GxzQoJPIgDw0NPXTo0MKFCzU0NFRVVVVUVFRVVSdMmLBhwwZDQ0NY5egxgF9RUZG+vv7KlSsXL16MP9kEfp85c2bhwoXLly/ftm0bxLnu8SWK6L99+3Y4CQ1mhX0OrFfeJS2t+/3Ctrr69QispcZOS4wcZz9zCI+0Z+XYNaW9CaxEm+YY85Y0r56d2nsb36aGVn5Vs+y8YvmVwTgNS7nqoVL1k4ExSe5+5PIgYkEQiSocWFH0onBaYVpZxTtZLsQPwh63CgsSEY8d5r1KjHv1Kn80SplMZm1tLZUjYL0GQZMvyYXrhIhelRP/N+/OO1TCzs7O8vJyON8MFENBiozYlWLym7/zbS4mk9nY2MhgMKhUanFxMYryjpZfJBGuNhHvQnj6bwlYtxNSNzn77PAI3ObqJxxYSzjAmvfMfr2JfUWKfUe6bTOXhhVn1dUgmlO76AJB/jKdSk9j5Vf/H1gVD1Rr72KZ/id9qdVBBFIQidojsCI5GlYYlU7DLQO9TeHaXyLhhb3KDX/yiui361Uhkb8FV1Z845FLeEfptiRe+EZhhlqgdUNJHgRehF+IPyCHS2DLoRjNJfxbCcuPvYXJYCCFsdnVd6dn0HduAdt60rCWGDvpGTkueW6v+9juhKMdK8uuOQUBy7YpxrS9KLNPolBxmPXSbX/pOazixpCKm8oVdwdV38ZoVov9ifQAAiWQSBERWFGMIvipa+UTMrGvReyeIfk4ES9xbwuJrkWHcYmYSa/uKEkzinIvfBV4ayHkQbDELYnwa4WXp1c3ErsM7xhYYGhn1Df87Bv6g2fgDo9AEYG12Mjxc0P7zw3spjyycwuyY2XaNiaxmdUcZ96aE9BX1uxX7u/VlY90yy/JV9waXHlbsfyBWnhqmC+pOJBQEEikig6saEZRJKMwubS8qx+4v8tEJh+M9BWwACpdTOaFmBfb3P13ewf3FlgLDezmPrHVe2ZLibftSrNtSrRuSbLrbgGDRd8wi6NktZGDyy8NKL81pOYGlhx03ZtcFZhPDCBSegWsKEZRbGFxBL2woBaCovRJeWUik49NsD5Vr1wJBd+6+//kE7LTM6i3wPrsmd3CZ7aTH9j8bGnTkWbXHG/WUQFO7X2ps3CY1RD2b9UZjGT7jQ+pxD+vIIBAEQNYMYXFMYXFUYVFVQIOMZeJTGTSL4AFtMqrrt3jG7LHJ+RH72BxgGVgN/+p7YKnNhPv2Txzs2AVxoIjGqtPBfJvb6x02hqUEuVLLPLPFxtYRbFFbGAllZZ1yCaGMpFJ/wQWDPnmjo7TUfG7vIN/9pUIWPOe2Mx+bDvljqlLBjsk+VswCYEqlFxU7plT4J9f4J9PFlvDii4sflFS6kkim2ewPVNkSpZMZNLvgAXqlWV2/g7voP3+YRJqWHOf2Mx5bDP1vuWsh9aESrYPW5+G9wSm0GvrPLIJ/vlkv3yy2MCKLiyKLixOLCk5ExH/pZ1nNIPts9fVLZsYykQm/QZYQJPksordfiH7A8L3+oVKDqxZj6xnP7KeeNNku603/90BUhLIuaGt3T+f7JNL8pMAWNEcZiWVlD5Py9rq6rfVxW+3Z1A5xHKQIUsmMukPwHoVJaO19XhE7F7/MCkCa8YDq1kPrcZce34vJqVPJ4ZMFiuOVuSRTfTLI7N/xAVWJL0wvqjEp4Cyxzv4O/eAHe6Ba+09L0bBmZT9IjCpTGTyPor0gfUsPWuPf+jBoIh9AWFSA9ZDq+n3LXXvWWjfMo2jlfTF3AoKT6yoccsk+OYV+OYVSAIstltDUfHJsNjt7v4/eAZud/Xf5uqvb+PuQSC/HUucTGTyQQom3clgRGHxTwGhh0Oi9geGSxdY0+5bTrtvOf6G8RdGzvXS9iB/pRs2t3hlk3xyCnxyJQJWBL3wRXHJo5SM7zwDf/RiV3y7m/+3Ln6bHH2+cfQp4JxY0d8O2pGJTD4iYMGAL2ls+jM85reQyN+CIw8E9oGGdddi6j0LjUsGf/tFSV3J6uzujiigu2cRfHMlAlYErTC+sMQ1v+Bnv9DdPsG7XgNrq4vfVmff1TbufwVGdnRxNsqz+lDQHgtpXYjftyH6V7wiYj4iCt+txUISi/2SE3RHMarZK4F88BGEu0UuwwcpUgAWnNTexWTeSU7fHxxxJDTqYB8B657F5Dtmk2+bjb5i6JlbIK25FTz+zJIK14x8nxyJNKwIznwwgl54NCxmt0/wHp+QnThgfePos9nRZ5m5s1kax0Wj77tdb4eo5COh/48l2Ovb/8sJe48FfdslvbgUHx2wYHbjQ6XvD474Izz6MEfD+jUwYn9A2C9+oT/5hOyWNrC0rhnNum9V9LJB8rnVqwOIGhrdMwneOSRvyYAVzlaviu+8SNvtG/KLf+hunxC8hrWZU+sNdp6rrVzTyyr7dGJYWlpKpVILCwtFCZyEpK2tjU6n02g03gubmpqoVCp8i86tQafF0Gg0Op0OVwlnQUtLC0qMBiRcUltbC7FWRBQqlYoPrtTZ2clgMCBzXqHRaHV1dfhA4yIOeBTAi0ajoWg2PfKupaUFmqu3jwAENWN7e3teXl5AQIC/v7+fn19wcDCJRELtJkbOHzuwYMiR6l7+GRnzv4iYw2HRB4IjfgkM/8k/bLdfyC6f4B1eQT94Be30DPrBI/B7aQBr0i0zndtmwy48/dmRfbqX+Fr+60lZa0dnYD7FPZMoIbDCqYy4wmL7XMIvbPsde4WUF1hfOXh/Ze/1hYXrbrfAhrb/P19AWoICxUFAblVVVQgH3OPghK7v5OQEEXU1NTXhMDj0nofji4cMGTJw4EAUAA+uSkhIgINq5OXlnZychB/fFBQUJC8vr6ysPHbsWHTAJ/6IdjU1NVURBA5HgIh3AFA6nT569GglJaVB/ERVVXXo0KHTpk3buXOni4sL/vgsUQ77GjNmjIqKCoZh+vr6wlVXqGZAQACGYSoqKuPGjRN+DoigHOh0+rFjxyZNmoQieYIoKirq6uqeOnUKWu9jY5ZEwIJH0NrVdTUp9WBY1JHw6D/DY85GJ1yJTboY/eJidOJ/kQn/RsYfDozY6Rm4xdXvW04Av60SA+uTmybaN03V/n1s8oIdZFLsAwFfHbjCKHFJz/POIXlliw+scCojil4YTKEfi4jdFxi+PyD8ZwHAWm/nucHO83Njx1sxyVJXshCw0BFJR44cEaVbw8j8+uuv4aqhQ4dCqExEEysrKxSsNjs7Gw+suLg49JWOjo4gHQQfSRnDMHV1dQaDAfkAcf755x+UT48CyZ48eYKARaVS0eE9Qi6Eb+fNm4dqIeJhX6hgfE825htMHQ5eRugX5QlCMgsLCzikg7cucq/PcB82bBgc3fxRMUsiYMFgsycW/BoWeSkh2Sg12zWb6JtXEJRPwf9455Ds0nOvx7z4xTt0k5PPZmffza8OofASF1imE2+YaF55PvG6cXZZlXjD/pVTe81Ll/R8r2wim1aSASuGXnT9Rcq+oPCDwRH7BANrg53nWhuPNVbui4wdwiiF0jVm8R6kqqmpic5GFT5IyGQynEoAg4ELWNbW1igsd05ODi+w4MQdDMP++ecfvqMIPvH390dMRCc74IHF94AGQcCCM43hchqNpqamBsHReQU/4KEWo0aNyszMFIIS1GJ6enr4Ch49elRIEHouLg8fPlx0YMG1cP6gvLw8QqSqquqwYcOGDh2KTqZRVFSEVoKI+B8Ps8QHFjAipbLyTGyiTWaef25BYB6ZvcSWQ/LizK3YOgvnxye3wD+PHEygeOWQbsUkb3f13+Dg9Y2j+BqW9k3TCdeNJ143Vj//5Etjl1cna/Vm1EPihrZ272ySeybBUzJghVLosYwiy+y8X0MiD4dE/ioUWOtfA2uZmfNGG8/yRnB/Z/aFhgUj09LSUnifhrF39+5ddAmvhgXAEqJhweHPMJbgDFGuO4oILAzDtLW1Q0NDo6KiIiIiIgVIVFRUaGgoBCmHnBGw4PhYMpmclpaW+Vri4+P9/f0vXLgAp8bDyF+6dCm+3bgEso2OjkakA/ChQzqEXCWGhoViz8NZ0/Ly8gMHDjx48GBERASFQinkCIFAcHV1BUUYnoWqqiqc3vyR2ODFBBY8qdq2NuOMHK8cUmAe2Se3gD3aOT4BXD/enB8gVzCB4pCRt88rZK2tx1evT34WD1haV40mXDNWOvPgUnC8GCuGTCYzmsxwTsvzzCJ6ZokPrFAKPZJW6EOiHI2MPRwWdSgk8tegnoG12pJ9dux8Q7uTgdFSnBjyBRaYXXrs0HD2HxxLIx6w0OVffvklr6FHdGCJft4P11BHwOJ7UgNaIvjuu+9QXSIiIoQb3Q4dOgT1AhxDBW1sbAQpWWIDi/e1gY6rwVeBCTHHb99G2F2+fLnwc1U/JBEXWJzf4dRCT84uFm9+nOL745VNCsgje+cUHPYNW2PjvkESYF0zGnf1+ZjLhur/PokkF4rumQXPlVBR7Zia65lF8MgiSqhhRVAZVxNTDodF/REeLSKw9C3dvrBw/cLcdfZTW+dsorQmhlzAgtElLy+fkZEhaMzgDeeIO2IDCx32aWpqyjWkRQfW9OnTW1tbuQ5z5yv4o1nwwAoKCoKpInKGwp8IX1lZOXr0aEh5+fJlvuiBlqyoqEApv//+ezgbEcOwdevWCW9PMYAFF+7evRsuXLJkCRQMwtUj6Xx9iPz+/fuhwdXV1dEknfWhizjAgmdJqa5ju1lydKte/XjlkPw4V/3iGbzaym2djfjA0rzyXPPKc7V/H897YF3T3Cr68UG1zS3uGQT3DIJHpkTACiHTommFJlk5v3MWSY+E9Q5YK8xc9Iwclxk7kaXk/s4FLGQHOX36tHA9Ag5MRXqEeMCCo0DRvAnl0FtgzZgxA390c4/CCywhJ8hCdTZt2gQp0RnufJvFzMwM1To1NfXGjRvImIVOFZPulHDdunVw4bZt25B5jm/K4uLi+fPnX7x4sbKy8iNRr8QBFrRLfWubX57AOaAozPLPIztn5m928NG3cltj5S42sEZfMtS8bDjg73uHXDmzgB5fMkxmV3d3CIHqnJbHppUEwAoh0yOpDA8C+URM/NGouD97D6zlZs7LTZxnP7H5xS2IXXKJOx0vsAAf2tracJAU33Of6uvrtbW18XYoMYAFTg9HjhxBxwUDC7icht45sODDX375BVIePHiQb0q4NRx6imHYnDlzWCxWdnY2OicZzl7kVc0k1LBQwT799FM46b6jowPcsphvnknxcbq8i6lhxVLZIQ1gF4vYzAomUB/Gpa6ydP3S2n2VhbjAumw46qLBqIsGA/+575RBED4xhAecUVTukJrjkUlwlwxYYWR6UAH1clLK0ei4Y9HiAGuFGbu+S42ddB9YPk1Il3xiyAssNDF0c3MTZAh3dXVFtJJEw8IwLCkp6fvvv4ebysvLR0ZGorv0CljIT4opWCTRsNCJx3BALFdKyDApKQmOtscw7NatW/DVhg0b4EIdHZ2mpiZeqkpowzIwMEDGqa+//rq0tBTdoovjo48/SRAO6fqosNU7YCHrD2cyKD6t8Mz6yz9iqZmzvpVEwBp54dngs48mXDEqrBPo/v7Kqf1lo1NqnltGPntKKAGwgsm0CArDIZ/0V0zc37EJ4mlYACw9I8eFBvZzntgkF5dLyCxeYKHF+C1btggamdu2bQPEqKurSwistLQ0EomEJoZ6enpIOxAdWDNnzpRQwwoIYDsVt7W1db4pwMG0tDRUQnt7e15FCYp69OhRMBINGTKETGaH2WCxWA4ODqgdXF1dBb0DxAAWVLaqqgpOuge7u4aGxt9//x0fHw9n1jPfJNdHhapeA+tVgzY1iz0TxP/45ha4ZRKySitKGho32nquMHf5wtxVbGCN+O/pyAvP5E7c3WrhwRdY8H9bZ5dfdoFzWp57Rr6bBMAKIdMCSZTEwpLmjo576Zl/RsUej44XH1jPHRYZOkx/aPW1tWdjOwxUqTmO6uvrjxgxAta/SSQSfuTAH8jfUlFRcf/+/RICKyYmhsVinT17FqkJDx48ACKIDixdXV0Gg1FWVlZSUlLKT4qLi/HOZbzACg0NFbRKSKPRkJOalpYWr5Ma/F1XVzd+/HhI9sMPP6Dc0PQZw7DNmzfzkkgSx1G0GUBZWRmYBfodTOr37dvn7OwMfvMo/cdgaBdfw+rs7g4voHtKNhkEWnllk4KJtBZOT/UmUD43dlxtIT6wNP57Nuz80xHnn2LHbj+OTuV1f4demEAttk/Occ8guEkGLPipbWG/9Gj1DcfFtWEhYC00sF9oYK992/RCKLhoMKUFrLNnz27ZsgX+vnbtGl6bwLtxYxg2e/Zs2JojCbDi4uJgtE+dOhWyGj58OJVKRfbjHoEFJrChgmXEiBHy8vJgk4YC8ALrwoUL/v7+Li4ubq/F3d3dyMjol19+GT58OILp06dPBalIsBUJ6uvj44M/dPrkyZOgeamqqhKJ7BVePDWk4umemJg4f/58Lk93udfvko0bNxoYGECrSh4Q4sMEFryBskorUQAWCX88s4llDU1oBnQhIuGz5/ZfmLlIAqyh/z4ZfOah2plHqUVvzK1evVqr6xySs13T813T8yUBVkgBzZ9IIdfUolsEMYp+C4s6GhkrCbDmP7Ob98Rm0l3zACJN7IkhL7AuX77s6OjI69+EzEDgxg2DHJnPxQZWfDwbuCwWy93dHc1rdu3a1StgYUIFlA5wLOALLOGO8sgsBWsCfA9YZrFYa9euhfTTpk1D0zG4UVpamoKCAtT3ypUrfL03xAYWStne3h4cHHzixIlZs2YhB3e8KCkpHThwAJYIPx5miQQseISl9Y2e2UTpTAazCFmlsBb7KvPq5patDj7sNX4TZ7GBpX7u8dBzj7HjdxY/tG3v5LjSvS58U1u7RwbBKTVXEmAFkqjBJKo/kZJUVArZQk/vZjIfpWcdDI38IzxGbGDNe2o374mt7j2LpYaO5Y18rLniAev06dPNzc281mjo4i9evEAjPC8vLzIyUirAAgCBaQyY5evrCyUUBVhycnIKgkVJSQnDsI0bN4oOrIEDB8K1gCo1NbXbt2/zXWiDrLKystBq4MWLF6FGKMQVi8Vas2YN3mUM/7AkBxZabUAZ5uTkPHr0aNOmTTC7B2pDXaZMmYJULdZHIKJqWC0dnUGcvTWS08ozmxhJZuD9D0CbiKIXLzS0X2Yivoalfu7xkDOP1M8+xv68ccqHHeSvs/vV5CqKxLBLynZNz5NQwwokUkLJ9EaO7ZaJt+U3NZ+IijscFnU4NEpMDeup3ZzHNnMf22jdMD7sESrJBkk8sGDj2w8//AD/7tmzBz+7OX78OHw+f/58LppIAiy4hEQiIVDOmjULFunRJjshNqwpU6ZQKJSioiIGg1HIT+h0Ot75iHdKuHnz5uPHjx85cuSvv/5av349Wv1UUlJ6/vx5dXU1PoQLXqBGZ86cAfApKysTCARebzJ8a/j7++PnlVIBFlQNFgrwhaypqfH399+zZw9QG37r6em1tUk5Bu97DCxohOTCUvcs9sZmyTUs79yCWh4nTxict2NSZj21WWbiJD6wzj4adPqhyqkH8sfuBOSz3zwsFiu/rMqWTat8lzSJgBVMovoRyBCHi7fwMSWl+4LCj0gGrJkPrWc+tNK8bmSTlifefiMuYP31118sFsvDwwP+HT58eEkJOyg+++zI5mZkP7558ybbmOjtLRVgISBeu3YNjavz58+z46b5+LyFVUJkdIevDA0NUeHBkNfe3s6bOXzS3NwM+w0hPoyent6iN2Xx4sVgtgcdZ+fOnbxEEw9YoMShBQq+HzI5hczKypo1axYyxvHuK/hIgYVCGrBpJY3JoHsWgcg5XpDHg5H9u6m94wcn/3nPbBc/d/jsmZjAUj39UPXUQ+zYbZ0rxvWtbfUtrY4puU4puS5peZIAK4hI9c0np5WwO5+gvm6UmftzQOhvIZH7AsLEBZbV9AeWOnfMpt+3FOMcRl5gHTt2jL3Nu6FhypQp8AlYmvGDavDgwaBHoE8kBxbauIe2s6ioqBQVFYWFhfUIrBkzZoDKAMQRJEKAFRgYCFRCG1l+/fVXtKM4NZW9LCPISd3NzQ353KJFOl4BRzOIk0On01GG0tKw+Eo3bmsOxP+Cu3zzzTcfScwGYcCCgdLY1s7eLSiNyaBHFjGOVgQhlXkFRmZaaeXnz+05Gpa92BqW8j8P2Mz6/foua59IEt32RZZLap6zBMAKJFL8CZRwMqNVwEsMalTX1vZ3VNzeAPYRZ2IDa9p9y+n3Lcdefb7NxruLM6VlSgCs48ePw1enT5+GTxYvXgyf7Ny5Ez4BFy0pTgnxnqIQyg4u3L17d2ho6Fv2dEcbWTQ0NODbTZs28SUIfAKLqmBKw4QK2jh59+5drlqLB6ympqbc3FwnJyfYvC3kknaOUQI2VMHKwEcyK+xZw2Kf0yeNlUHvHJJ/PrkRwmwKuB3MgEySs6c9tFpk6CAJsFT+eYD9dWvObQtnjnrllJorIbD88snlnGVNQV3iFXArKn8OCIUzGcUG1pS75lPvWgy7+OxedHKvIhQKAVZqaipagEtJSamvr1dXV4d/IUyo1IGF/ti7dy+oJMrKyrt370YRbN7a1hz44/79+2gRgDcyKmRCIpEgsijs5rO0tHz27JkhjxgYGJiYmMyYMQNSfvbZZ3A58o/tLbDgqgMHDuBfKkLimnZyHsrVq1ch/YQJE/huvfqIgAU1J1XWSMWPgTMZJDJqe4iHDd90M5n73YOnPbRaaGAv7pTwgcKJu8PPPjaOTXdPz3dMyXGWQMMKJFB88gpyy9mRAoX3B2CWbR5xh3fQPv8wsYGle9d88m1z7ZsmWteMkgrLehuIghdY0L9XrVoFH547dw48tjEMmzhxIpjD+wJYMErpdPrIkSORSwGaSb01YKH46Gh+On36dHw8eJT48uXLaA1OSHg/aJOnT5+iNgkLC8Mb73oLLLjq1q1bgNSBAwempaUJMUu1czSsn3/+Ge6ycOHCV8vWHyewoNY1zS3enNErFdNVCmfg9dieMObJ1XWLjRznPrGZ98S2t8AafOahyj8P5I7d+ccr3CuDYJ+c45SSKzawAggU37yCaGqhKGrOK3/6rq6z0Qk7vYN/8g2B0zfEAJbObXZNR14yXGnoKHr0d0HAgvkChLIESCFv7//9738ogdSBxTu20YKdEGBNnz69paUFPu8UKoLCy/DuJYS/YVUBlKxLly6h4kG7dXR0zJw5E3JYvXo13grGd4tPUVHR0KFDIf3+/fsFAQuiDAqvCxQvNzcX7RnaunUrWivE2/I6OzuhuQgEAmxRwC/+sj50wd6aU3vba8eoHgUmhs5ZxCn3LeY+sZnz2GbGA1GBpX7uMdt6dfzOQcdAz3SCXVI2ez4oAbD8OT81LS0iIgOAS6yp+8k35Mc3zyXsLbC0b5p+etN08LlHp0Q+h1EQsKCLl5WVgSMPfp8zIAZGYF8ACx1ps2zZMnxACCHAkjyAH9/Nz/iNk3JycmpqashlAb9tCHBmZmYmfN0NLtmzZw/cccSIEbBRGeqCgKWhoQFeFD3WBYq3Y8cOtPb3+++/81qmujnJcnJyYEIKpYVFho8UWNA62dJzavfKJr62/oiqr8KwvxeRxFk1s5r10HoG5yBVwcB6Ovz802H/PlH6577KqQeHnQK9OLRy5KhXYgPLP5/slUMqqBIYD5evgFuZB4my1d1/t3ewJMCacN14/DUj9fNP/PKoong5CJkSQm/+8ccf0fYXmErAhTAy+wJY6N/Y2Fj8GQpCgKWpqWloaGhiYmJkZGQsQExMTJ48eQKB63hDJAsBVnZ29qBBg6AMaJMgvnEwDBs9enSPR92gfX+IGs+ePUO6KgALtu/cvXvXcAB9JAAAC79JREFUzMxMeF2qqqpeueDk54PWBnlOmTLl0qVLgYGBeXl5RUVF2dnZ7u7uv/76K0TfB3+RHTt2CDd4fcjAenUKW0OTZ7Y0djjnsSeDWaW9O+YIzRwbW9puBsWvMnbWuWcx+a751HsWunctOCPZZCJnJI+7+nzsFcMxlww50RoeD/zn/tSbplcCYj3S821fZDsk5zgm5ziKCyw2rXJJ8fRiMXoB9J1LsUlb3fx2egZJAqwJ14xHXHg6444F7GQS7uXAewjFiRMn8GMS3KAUFBTgHQ7uV1w7k+Xk5IYPH84XWHAV30MoYLrHF1jok8OHD6NMhg0bxgWsU6dOwSAU+xAKNEHjGyIZfQLnicFoB90E5nfDhg0D7B44cKBHhQVpjuAPhWHYsmXLEPrBPxa5ywsSqKmcnFxSUhKqiLu7O9QOfx4HrEjKvf53wIABQLSlS5cKCTD/gQMLhTQIJlK9skmSTwY9s4kRbzq19/rEw9Lqp2FJ/3MLWW7oMOmO2fgbxuOvG2tdN9a8+nzMFcORlwyG/vd0yLlHauce694032/vb5OY5ZqaZ5OYZZ+UIyGwfPMKAgkU4cuawgtf3ND4s0/Id+4B37kFiA2scVeNtK4aKZ1+sMfeT3RgzZ49G++HhRyjmpubJ02aBF8pKysXFBTwzon4algWFhaiaFixsbFC4uFVVlZqaWnBLdTU1CQ/5gsPLBR2QsgUCUVi+PTTTyHl3LlzYX3tzp07KNvo6GhRZljQMtevX0cXQvWRhiXEjQsPLHl5eTi2AzVpbGws7B7nYrfcm3uhjxw50iKyseJDBBan2imFZVJxE+W4MhTUNIvfoHBRcA7ZNDLVNDrtvG/UT/Z++kbOCx/bzn9oPfeB9dz71kue2H9n6XXWO9IqPtMtJc/uRTaHVtkSAssvr8Azm0TvaVlTiLzaF01lbHL2+V4CYGldNRpz2XDsZcOB/9y3SGKTQsgLAC0Vbdy4cfz48SNHjgTHbryL0OXLl0eNGqWpqfnTTz9xuTtGRkaOGjVKW1t77ty5aO8LfOXu7j569OjJkyePHz8ehSiAr1JSUsaOHaujo6OtrS3IJxPdwtLScsyYMdra2nPmzEHR6WDk37x5c9iwYVOmTPlUBJk8ebKGhoaVlRUCVlFR0ezZsz/55BMtLS1B3MQHYxg9erSuru6IESPgpKytW7eOHTtWS0trw4YNIp7pANWkUCi6uro6OjojRoy4fv06fBUeHq6hoTF58mThtZg0aZK2traOjg7+kES4e0tLi42NzVdffaWpqYlX0xQUFHR0dA4dOoQY95HsIuQGFjwceu1Ljz52ahdd4LKmtnbruEzjyFSbuAy7+CzruEzTmDTTmHTTmHTz2HT7xGyX5Fzn5FzbxCzrhEzbxCy7F9kSAss3r8Ajm5hSxFnWlKBxX+03Skjd6Oi93dX/GwmANfqSwdB/n4y+aECoEMn9vaWlpampqbGxEazpeOns7ISveOOFd3V1NTY2NjU1NTc3cz21zs5O+KqpqYk3AhT6qsdpFJPJbG5ubmxsbG5u5sqnvb0d5SOKoCogvRJ91WMxuru7m5ubIRPQsODWjY2NYITqlbS2tqKS87aJKMLbpKj96+vrCwoK4uLiIiMjExISqFQqaFUfdTwsaJ3GtnZ/aTm1ZxNjqUWSmwFhZFIraw0jkk2jUk2iU82i0yxj0y1jM6zi2D+W8BOfYZOQZZuYJQVgQShUIrW1g7NQJUHhofY1La37fNgnyG5x8hUbWBAGesDf99YZuXYzmZIcV4GeyTuZR/STyYtQZ8Dedds+qhFyaBDyFbN/NOa7ABbndzytWCrqFdupPa8Hp3bRBQZnLKnQIDzJIjbdPCbdIjbdIjbDgoMqq/hM6wT2j02i1IDFjtVVLx2/YSh8QnHZRgfvLZzzrjeIC6wR/z3V+O8Zduz29dCEHr0c+MY+7/ErrlBZYlzVY4uJWDDRRZTCi1IS0asgYqXErgWX4I8p6+KoVB8hp94AFlSfVFUrrR3OHtlESaw/XAJZdHR1uSTnGEWmsFHFARabVlIFllc2ySeH5JZJyOz9smaPzDJIydK3cf/G0UdsDWvEf+wIhUPOPFI99SCRXipJYFKZyOT91rDqWlolN7Ej01Vy4f8f9SEVeRVB8GWDaXQa0rCkDizvHJJHFiG8gC763j2RCs/53dLRecgv/EvOedeSAGvouSdyx+8suGfV/Cr6u4xZMvn4gMXe4ZwthXBXXjmkIGlYfwTpKSn0EsPwZMu4jD4BFlvJIlY3SX+dGAqfU1G9wd5zvZ3nOkk0rLOcCIW/X7sekihGwCyZyOS9B1Z1U4uXNGIf4yO198WbH2b7vhlE46gUsLVLDVhZRO9skmtGPqFCpF0UYns52GblLzd32WDruVoCYA0+81D+xF3ty8/rWz+KiCIykckbwHp1tETvD50X7NTO6guBkVnb1GIVl2Eeky5FYHllE10zCTGUwr4b/BDWqovJPBYUtdzc5Utrd7GBNQgiFP55wyOTfWyXTMmSyccFrPACuoTB2l85tUvb+sMrAJTckgqjqBSreOkAyzOLyA74lVPwOihCXxUeJoa0uvqv7b2+sHBdxTmqXgxgqZ5+OOj0Q+zItTOv49b3VYllIpN+CCypTAa9c0h9Yf3hFcg+JJdiHJVqHZ8pFWC5pOfTaqS2rClEYF3Pi0BeZOKob+kmPrBOPcT+uPGdpZd4Z1XIRCYfL7AgOB+xsq+sP/zd39s7HF5km8emW0sGLM8sonN63gt6yVszBsFdzobGLTRyWGXuusTYUQxgwZRwvZGLDFgy+ahEUmDhndrfWqHhXtTKWtOYNEmA5ZHJPgLaP4/c0gfLmsILX9HYvNnee7Gx4zITcaeEf1zfac05kVjmjSWTjwpYERLYsLxzSH555IZXy1Vvr9ww7GNJhSbRaTZiAcudAyyX9LwSKTm1iy5gJo+gFS187rBULGAN5tiwLgewz4WX2bBk8nEBK7+iWrxVQvZkMJtAq6l7+4vrcLP2zi631HyLuHSbxKzeAssjk+CYlpsOO5zfuhUIvBxuxSTPemKz1Nipt6uEKqceYH/dDBAtqp9MZPJBAetlS5sYG545fgzE107t76Dor45cftloGZfRWw3LPSPfOS0vmEDt6Ho3ox1arLmj43tHv7lPbRcZOszrhR/WI+zYnWnXTdt6E0dYJjL5cDzdk9gHO/dCyWJHas8hBRH6xKlddIGxmkovNY1Js3shKrDcOD+u6flVTc3vcMC/8t0vKV9oaM/WsJ6JCqyhbE/36w+i2OGQZPNBmXyMwGpu7/DPp3jn9CLKqEeW1EIaSCjd3Uy/LBI7NtYLkYDlnpHvkJKTX179zn0CYDZnnJw1+b7F5wb2PQJL/dyT4f8+xY7eWvHEHnTDd974MpHJu4nWUFbfyN5S1xOz4Fv3LAJJsuB80hK4f0Nrm0tKrkVchn1SjhBguXKAZZec/YLOPnnpXZcdys8uxKnAGO27Zgue2s5+ZC0IWBr/PR154ZncibvaV42o1WyvMZkHlkw+NnkjgF9pfaNfHhkOy+HFFnzokc3eKvzqIBlWvxAo/MuWVq8MgllsOuf4CfYJFAhYzim5Lhz1yjElxyElN62orP8M9VdnGXR3nw+J/+S2qe49C46SZcE5SPUVsDSvPB972XD4+afYsTvz7lmJGHRUJjL5oEMkvw46msgo8cwhuWURPLOJ3uC7kEvyzCa5ZxE9solRFEb1OzX98JVXR/t2dqXQSxyTcizi2WZ4OObLMTnHPinbNomNsIBccnHdq/N++0/pUQg37zzyOnO38TeMNa8bfXLTBICleeW52vkniqfuj7locMo3ur6VvX9I5nslk49T+BxCAWc+Z5dWRlEY7IjJnAXBiAJ6Rkl5RWMzvNj703h/JUzmK42vsa09t7QynEDzzCA4Jue4puUH5JCT6CUldQ1gM+qfhYeGbW7v8MojH/EMW2bo+OlN0/HXjafdsdhk4X4nMplazXYfkTA+skxkwnqf5f8Af5HdDnMNu+kAAAAASUVORK5CYII=',
};

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show '+(type||'');
  setTimeout(()=>{ t.className='toast'; },3500);
}

// ── CAPACIDAD POR RUBRO ───────────────────────────────────────────────────────
function capacidadTexto(p){
  const r=((p.rubrosNorm||[]).join(' ')+' '+(p.giros||[]).join(' ')).toLowerCase();
  if(r.includes('aliment')||r.includes('banquet'))
    return 'Colaciones / almuerzos por dia:\n________________________________\n\nDesayunos / cenas:\n________________________________\n\nTipo de servicio (box / buffet / a la carta):\n________________________________';
  if(r.includes('hospedaje')||r.includes('alojamiento'))
    return 'N de habitaciones disponibles:\n________________________________\n\nEstandar: WiFi / TV / Bano privado / A.C.:\n________________________________\n\nCapacidad maxima de huespedes:\n________________________________';
  if(r.includes('construcc')||r.includes('obra')||r.includes('ingenier'))
    return 'Tipo de maquinaria disponible:\n________________________________\n\nN de trabajadores propios:\n________________________________\n\nArea de especializacion y certificaciones:\n________________________________';
  if(r.includes('transporte'))
    return 'N de vehiculos / camiones:\n________________________________\n\nTipos de vehiculo y capacidad:\n________________________________\n\nRutas habituales de operacion:\n________________________________';
  if(r.includes('lavand')||r.includes('aseo'))
    return 'Kg de ropa procesada por dia:\n________________________________\n\nTipo de servicio (industrial / domestico):\n________________________________\n\nEquipamiento disponible:\n________________________________';
  return 'Capacidad operativa maxima:\n________________________________\n\nN de trabajadores:\n________________________________\n\nEquipamiento y areas de cobertura:\n________________________________';
}

// ── EXPORTAR FICHA PPTX v4 — Manual de Marca AMSA ──────────────────────────
async function exportarFichaPPTX(id){
  const p = PROVEEDORES.find(x=>x._id===id);
  if(!p) return;
  showToast('Generando ficha...');

  try {
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE'; // 13.33 × 7.5"
    const W=13.33, H=7.5;
    const SHP=pres.shapes;

    // ── Paleta corporativa Manual de Marca AMSA ──────────────────
    const C={
      white:  'FFFFFF', dark:   '1C2632', gray:   '5F6973',
      grayLt: 'D7DEE4', teal:   '00A399', tealDk: '006973',
      tealLt: 'E4F6F5', gold:   'F2A900',
    };
    const LOGO = 'data:image/png;base64,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xcSCjEIohKxRCAAILIFBYABmBEHNRAAE/Z0JXUihVqiToKSIbcgQMQCAQqjPesXWt+vTS7/19en9a4aj0tx0W+c5zPbda3cA2GfP3VZtMtbecfd9fWXADttt3WkGrocfe+K//3u6r65SKf5+483Lmlu6aj3tqycdfcRnetrnvnvt/vWvntxVaxRFv7vurz3tcyAZyCn3pxv+1U3Y/rfPOO2AfffqaZ9NTY2//+WVnWosrdQWm20yb/6CnvYJAzgsS5d1qYRGDB/ao64O2HevpsaGqVMm7bvX7l856fM/vOj8v/3xmsfvv+2tl55c/fJCA0lFPu6cduwXfvztz+243WZt+RYGTOVqwtgAAAEjxyQRiSACk2JS/S2nLIIgAwACKCbFREIABNorsI01WoX5Uj6T8qEc+hZUjPmSeWnOnPO72J/xjsivn3zr/SBXlCZrMiU2lEYlpKxnSuxRYE0IUiYItYQILKAjUhF6FrVg/843BPAi9C0JWqNtFEDso0Ft2AMLHOcDr5zLNW+7bfZL+zrX4zrLsuaWhx/rZGlpg5EjkiW8ffbcrdO40dVMcrE6ZNLpzx/X+TamS35yRT8FJg8YN/zrpq6aJowfe/rXupSA3fONr508acL4rlr/c+sdPa2VMmAM5JQzxvznlju6at1k442+1Ntw/gnjx64o3zPp9H577/Hzy37wwv8e+Mf1v914ow172uFADgt3XXh26bLmHnWVTqVeeOKBe275x++u/tkF3zrjc8ceudP2247aYGTvqmX2N5X6uKvGsVjb2WfLpvPOOnX+vA8AOJVOF4uldCaDAiicPAA5cQf2q9NxJUjaHwAAwGEcpVK+FWbmmtrafD6vlGILRYNGZ37622u76erZUH5756N5qjNUi+QDQL5UjA03Ngwql8sAoDwtyIJAQiigmJTQAKSyJCHFpBgAjSU2BAaVhQAk8LUPhutzGOUXaJj35c9vv6UrNrOOcvvd93Wa7u6g/fZOfhg8qGnzTTvxPb/0yuuz33u/T2xYuGjxGad9ta62dtWmmW/P+seNXS44Vj+vz5j57uwui8d879yzfH911wdXwvO8751/dletbW35hx55vHc99zcDOeWeff6lblYbv3vumWsicU783LHjxow+5ohD//jrq1568qHf/t9PDz/kwE6n8eowkMNSW1PTVdMzz31KLP9aTaU+7px2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';

    const slide = pres.addSlide();
    slide.background = {color: C.white};

    const fantasia  = (p.nombre_fantasia||p.razon_social||'Sin nombre').trim();
    const razon     = (p.razon_social||'').trim();
    const showRazon = razon.toUpperCase() !== fantasia.toUpperCase();

    // ── Habitaciones: vienen de DB.hoteles[id] ───────────────────
    const hotel = DB.hoteles[id]||{};
    const habS  = Math.max(0, parseInt(hotel.simples)||0);
    const habD  = Math.max(0, parseInt(hotel.dobles)||0);

    // ── LAYOUT ───────────────────────────────────────────────────
    const HDR_H   = 1.32;
    const BODY_Y  = HDR_H + 0.12;
    const BODY_H  = H - BODY_Y - 0.55;
    const COL_L_X = 0.28, COL_L_W = 3.85;
    const COL_R_X = COL_L_X + COL_L_W + 0.22;
    const COL_R_W = W - COL_R_X - 0.28;
    const FOT_Y   = H - 0.50;

    // ── PROPERTY DIAGONAL — 3 franjas zona inferior izquierda ────
    // Franja teal P_325 (fondo grande)
    slide.addShape('rect',{x:0,y:H*0.44,w:0.90,h:H*0.56,
      fill:{color:C.teal},line:{color:C.teal,width:0}});
    // Franja teal oscuro P_3145 (30%)
    slide.addShape('rect',{x:0,y:H*0.72,w:0.48,h:H*0.28,
      fill:{color:C.tealDk},line:{color:C.tealDk,width:0}});
    // Franja dorada P_124
    slide.addShape('rect',{x:0,y:H*0.30,w:0.48,h:H*0.15,
      fill:{color:C.gold},line:{color:C.gold,width:0}});

    // ── SEPARADOR HEADER — línea teal + acento dorado ─────────────
    slide.addShape('rect',{x:0,y:HDR_H-0.022,w:W,h:0.022,
      fill:{color:C.teal},line:{color:C.teal,width:0}});
    slide.addShape('rect',{x:0,y:HDR_H-0.022,w:COL_L_W+0.5,h:0.022,
      fill:{color:C.gold},line:{color:C.gold,width:0}});

    // ── LOGO — superior derecho (manual: zona resguardo) ──────────
    const LW=2.85, LH=2.85/3.13;
    slide.addImage({data:LOGO, x:W-LW-0.28, y:(HDR_H-LH)/2,
      w:LW, h:LH, sizing:{type:'contain',w:LW,h:LH}});

    // ── NOMBRE EMPRESA (Calibri, altas y bajas — manual) ──────────
    const nameW = W-LW-0.28-COL_L_X-0.20;
    if(showRazon){
      slide.addText(fantasia,{x:COL_L_X,y:0.12,w:nameW,h:0.68,
        fontSize:22,bold:true,color:C.tealDk,fontFace:'Calibri',valign:'bottom',wrap:true,margin:0});
      slide.addText(razon,{x:COL_L_X,y:0.84,w:nameW,h:0.30,
        fontSize:9,italic:true,color:C.gray,fontFace:'Calibri',valign:'top',margin:0});
    } else {
      slide.addText(fantasia,{x:COL_L_X,y:0.32,w:nameW,h:0.72,
        fontSize:22,bold:true,color:C.tealDk,fontFace:'Calibri',valign:'middle',wrap:true,margin:0});
    }
    // Numerador (si quieres ocultar, eliminar estas 2 líneas)
    const _idx = PROVEEDORES.findIndex(x=>x._id===id);
    if(_idx>=0) slide.addText((_idx+1)+' / '+PROVEEDORES.length,
      {x:W-1.80,y:HDR_H-0.30,w:1.60,h:0.24,fontSize:7.5,italic:true,
       color:C.gray,fontFace:'Calibri',align:'right',margin:0});

    // ── COLUMNA IZQUIERDA — card blanco + acento teal ─────────────
    slide.addShape('roundRect',{x:COL_L_X,y:BODY_Y,w:COL_L_W,h:BODY_H,
      fill:{color:C.white},line:{color:C.grayLt,width:0.5},rectRadius:0.03});
    slide.addShape('rect',{x:COL_L_X,y:BODY_Y,w:0.052,h:BODY_H,
      fill:{color:C.teal},line:{color:C.teal,width:0}});

    const IX=COL_L_X+0.18, IW=COL_L_W-0.26;
    let cy=BODY_Y+0.20;

    function dato(emoji,label,value,y){
      if(!value||value==='0') return y;
      slide.addText(emoji,{x:IX,y:y+0.02,w:0.20,h:0.22,
        fontSize:9,fontFace:'Segoe UI Emoji',color:C.teal,valign:'middle',margin:0});
      slide.addText(label,{x:IX+0.24,y:y,w:0.90,h:0.20,
        fontSize:6.8,bold:true,color:C.gray,fontFace:'Calibri',valign:'middle',margin:0});
      slide.addText(String(value),{x:IX+1.16,y:y,w:IW-1.18,h:0.27,
        fontSize:8.5,color:C.dark,fontFace:'Calibri',valign:'middle',wrap:true,margin:0});
      return y+0.30;
    }
    function sep(y){
      slide.addShape('rect',{x:IX,y:y,w:IW,h:0.012,
        fill:{color:C.grayLt},line:{color:C.grayLt,width:0}});
      return y+0.13;
    }
    function secTitle(txt,y){
      slide.addText(txt,{x:IX,y:y,w:IW,h:0.22,
        fontSize:7.5,bold:true,color:C.teal,fontFace:'Calibri',margin:0});
      return y+0.28;
    }

    cy = secTitle('Datos de la Empresa', cy);
    cy = dato('🪪','RUT Empresa',   p.rut_empresa||p.rut_persona||'—', cy);
    cy = dato('📍','Localidad',     p.localidad||'—',                  cy);
    cy = dato('🏠','Dirección',     p.direccion||'—',                  cy);
    cy = dato('⭐','Categoría',     p.categoria_sii||'—',              cy);
    cy = dato('📄','Facturación',   p.facturar||'—',                   cy);
    if(p.plataformas) cy = dato('🔗','Plataformas', p.plataformas,     cy);

    cy = sep(cy + 0.07);
    cy = secTitle('Contacto Principal', cy);
    if(p.nombre_contacto){
      slide.addText('👤',{x:IX,y:cy+0.02,w:0.20,h:0.22,fontSize:9,fontFace:'Segoe UI Emoji',color:C.teal,valign:'middle',margin:0});
      slide.addText(p.nombre_contacto,{x:IX+0.24,y:cy,w:IW-0.25,h:0.26,fontSize:9,bold:true,color:C.dark,fontFace:'Calibri',wrap:true,margin:0});
      cy+=0.29;
    }
    if(p.fono){
      slide.addText('📞',{x:IX,y:cy+0.02,w:0.20,h:0.22,fontSize:9,fontFace:'Segoe UI Emoji',color:C.teal,valign:'middle',margin:0});
      slide.addText(p.fono,{x:IX+0.24,y:cy,w:IW-0.25,h:0.24,fontSize:8.5,color:C.dark,fontFace:'Calibri',margin:0});
      cy+=0.27;
    }
    if(p.correo){
      slide.addText('✉️',{x:IX,y:cy+0.02,w:0.20,h:0.22,fontSize:9,fontFace:'Segoe UI Emoji',color:C.teal,valign:'middle',margin:0});
      slide.addText(p.correo,{x:IX+0.24,y:cy,w:IW-0.25,h:0.24,fontSize:8,italic:true,color:C.teal,fontFace:'Calibri',margin:0});
      cy+=0.27;
    }

    cy = sep(cy + 0.07);
    slide.addText('Giros SII',{x:IX,y:cy,w:IW,h:0.20,fontSize:7,bold:true,color:C.gray,fontFace:'Calibri',margin:0});
    cy+=0.22;
    (p.giros||[]).filter(Boolean).slice(0,5).forEach(g=>{
      if(cy>BODY_Y+BODY_H-0.28) return;
      const gs=g.length>52?g.slice(0,50)+'…':g;
      slide.addText('· '+gs,{x:IX,y:cy,w:IW,h:0.20,fontSize:7,italic:true,color:C.gray,fontFace:'Calibri',wrap:false,margin:0});
      cy+=0.20;
    });

    // ── COLUMNA DERECHA ───────────────────────────────────────────
    // Limpiar descripción
    let desc=(p.descripcion||'').trim();
    ['Notas adicionales:','Notas de terreno:','Nota:'].forEach(m=>{
      const mi=desc.indexOf(m); if(mi>-1) desc=desc.slice(0,mi).trim();
    });
    const lineas=desc.split('\n').map(l=>l.trim()).filter(Boolean);
    const HDRS=['Servicio:','Servicios:','Capacidad:','Clientes:','Cliente:','Productos:','Producto:'];
    const isHdr=l=>HDRS.some(h=>l.startsWith(h));

    let ry=BODY_Y;

    if(lineas.length){
      // Estimar altura
      let estH=0.50;
      lineas.forEach(l=>{ estH+=Math.max(1,Math.ceil(l.length/(COL_R_W*12.2)))*(isHdr(l)?0.22:0.26)+0.05; });
      estH=Math.min(estH, BODY_H*0.55);

      slide.addShape('roundRect',{x:COL_R_X,y:ry,w:COL_R_W,h:estH,
        fill:{color:C.white},line:{color:C.grayLt,width:0.5},rectRadius:0.03});
      slide.addShape('rect',{x:COL_R_X,y:ry,w:COL_R_W,h:0.038,
        fill:{color:C.teal},line:{color:C.teal,width:0}});
      slide.addText('Descripción General',{x:COL_R_X+0.20,y:ry+0.09,w:COL_R_W-0.28,h:0.22,
        fontSize:8.5,bold:true,color:C.tealDk,fontFace:'Calibri',margin:0});

      let dy=ry+0.38;
      lineas.forEach(linea=>{
        if(dy>ry+estH-0.18) return;
        const nlines=Math.max(1,Math.ceil(linea.length/(COL_R_W*12.2)));
        const hBox=nlines*0.26+0.04;
        slide.addText(linea,{x:COL_R_X+0.20,y:dy,w:COL_R_W-0.28,h:hBox,
          fontSize:isHdr(linea)?8.5:9.5, bold:isHdr(linea),
          color:isHdr(linea)?C.tealDk:C.dark,
          fontFace:'Calibri',wrap:true,valign:'top',margin:0});
        dy+=hBox+0.04;
      });
      ry+=estH+0.15;
    }

    // Card capacidades — datos reales de habitaciones + descripción
    const caps=[];
    if(habD>0||habS>0){
      const camas=habS*1+habD*2;
      caps.push(['Habitaciones',''+( habS+habD)+(habS>0&&habD>0?` (${habS}S + ${habD}D)`:'')]);
      caps.push(['Camas totales',''+camas+' camas'+(habS>0&&habD>0?` (${habS}×1 + ${habD}×2)`:'')]);
      const dL=desc.toLowerCase();
      if(dL.includes('baño privado'))   caps.push(['Amenidades','Baño privado']);
      if(dL.includes('wifi'))            caps.push(['WiFi','Disponible']);
      if(dL.includes('lavandería'))      caps.push(['Lavandería','Disponible']);
    }
    const actL=(p.actividad_principal||'').toLowerCase();
    if(/aliment|banquet|restaur|cocin|catering/.test(actL)){
      const m=desc.match(/(\d+)\s*personas/i);
      if(m) caps.push(['Comensales',m[0]]);
    }
    if(/transporte/.test(actL)){
      const m=desc.match(/(\d+)\s*(buses?|vehículos?|camiones?)/i);
      if(m) caps.push(['Flota',m[0]]);
    }

    if(caps.length){
      const capH=Math.min(0.44+Math.ceil(caps.length/2)*0.32, H-ry-0.60);
      slide.addShape('roundRect',{x:COL_R_X,y:ry,w:COL_R_W,h:capH,
        fill:{color:C.tealLt},line:{color:C.teal,width:0.6},rectRadius:0.03});
      slide.addShape('rect',{x:COL_R_X,y:ry,w:0.052,h:capH,
        fill:{color:C.gold},line:{color:C.gold,width:0}});
      slide.addText('Capacidades',{x:COL_R_X+0.20,y:ry+0.12,w:COL_R_W-0.28,h:0.22,
        fontSize:8.5,bold:true,color:C.tealDk,fontFace:'Calibri',margin:0});

      const cw=(COL_R_W-0.30)/2;
      caps.forEach(([lbl,val],j)=>{
        const col=j%2, row=Math.floor(j/2);
        const cx_=COL_R_X+0.20+col*(cw+0.06), cy_=ry+0.38+row*0.30;
        slide.addText(lbl,{x:cx_,y:cy_,w:1.5,h:0.20,
          fontSize:7,bold:true,color:C.gray,fontFace:'Calibri',margin:0,wrap:false});
        slide.addText(String(val),{x:cx_+1.55,y:cy_,w:cw-1.60,h:0.27,
          fontSize:9,color:C.dark,fontFace:'Calibri',wrap:true,margin:0});
      });
    }

    // ── FOOTER — badges actividad + pie ──────────────────────────
    const acts=(p.actividad_principal||'').split(',').map(a=>a.trim()).filter(Boolean);
    let bx=COL_R_X;
    acts.slice(0,5).forEach(act=>{
      const bw=Math.max(act.length*0.088+0.38,1.3);
      if(bx+bw>W-0.25) return;
      slide.addShape('roundRect',{x:bx,y:FOT_Y+0.06,w:bw,h:0.30,
        fill:{color:C.tealDk},line:{color:C.tealDk,width:0},rectRadius:0.10});
      slide.addText(act,{x:bx+0.12,y:FOT_Y+0.08,w:bw-0.16,h:0.22,
        fontSize:7.5,bold:true,color:C.white,fontFace:'Calibri',margin:0,wrap:false});
      bx+=bw+0.10;
    });
    slide.addText(
      'Ficha de Proveedor Comunitario  ·  Antofagasta Minerals  ·  '+new Date().getFullYear(),
      {x:COL_R_X,y:FOT_Y+0.42,w:COL_R_W,h:0.20,
       fontSize:7,italic:true,color:C.gray,fontFace:'Calibri',margin:0}
    );

    // ── DESCARGAR ─────────────────────────────────────────────────
    const fname=(p.nombre_fantasia||p.razon_social||'proveedor')
                  .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g,'_').trim().slice(0,40);
    await pres.writeFile({fileName:'Ficha_'+fname+'.pptx'});
    showToast('✅ Ficha exportada: Ficha_'+fname+'.pptx','success');

  } catch(err){
    console.error('Error PPTX v4:',err);
    showToast('Error al generar la ficha: '+err.message,'err');
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// SISTEMA v6 — MÓDULO VISITAS, HOTELERÍA, DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function esRubroHotel(p){
  const s=[...(p.rubrosNorm||[]),...(p.giros||[]),p.actividad_principal||''].join(' ').toLowerCase();
  return /hospedaj|hoteler|hotel|hostal|residenci|arriendo de habitac|alojamiento|caba.a|pensi.n/.test(s);
}

function getDiasSinVisita(id){
  const vs=DB.visitas[id]||[];
  if(!vs.length) return null;
  const ult=vs.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];
  return Math.floor((Date.now()-new Date(ult.fecha).getTime())/(864e5));
}

function fmtFecha(iso){
  if(!iso) return '';
  const d=new Date(iso+'T12:00:00');
  return d.toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'});
}

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── LIGHTBOX ──────────────────────────────────────────────────────────────
async function openLightbox(src){
  const firmada=await resolverUrlFirmada(src);
  document.getElementById('lightboxImg').src=firmada||src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(){
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxImg').src='';
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeLightbox(); });

// ── HOTELERÍA POR PROVEEDOR ───────────────────────────────────────────────

// renderDashboard() vive ahora en proveedores-dashboard.js: el dashboard
// pasó de contar el inventario de la base a medir la gestión del equipo.

// ── HOTELERÍA GLOBAL ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// HABITABILIDAD (antes «Hotelería»)
// Resumen macro del programa MGI + listado en tabla. Cubre los tres rubros:
// hospedaje, lavandería y alimentación.
//
// Solo entran los proveedores del programa MGI (programa_mgi === true). Si
// nadie lo ha marcado todavía, cae en la detección por rubro de siempre, para
// no dejar la pantalla vacía de golpe.
// ═══════════════════════════════════════════════════════════════════════════
let HAB_RUBRO = 'Hotelería';   // pestaña activa

function habEnProgramaMGI(p){
  if(p.programa_mgi === true)  return true;
  if(p.programa_mgi === false) return false;
  return rubrosHabitabilidad(p).length > 0;   // sin decidir: como antes
}
function habProveedores(rubro){
  return PROVEEDORES.filter(p => p.estado !== 'Eliminado'
    && habEnProgramaMGI(p) && rubrosHabitabilidad(p).includes(rubro));
}
function setRubroHab(r){ HAB_RUBRO = r; renderHoteleriaGlobal(); }

function renderHoteleriaGlobal(){
  const el = document.getElementById('hoteleriaContent');
  if(!el) return;
  if(!PROVEEDORES.length){
    el.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted)">Carga proveedores desde el Directorio primero.</div>';
    return;
  }

  const RUBROS = ['Hotelería','Lavandería','Alimentación'];
  const lista  = habProveedores(HAB_RUBRO);

  // ── Macro resumen: solo del programa MGI ──
  const cap = lista.reduce((a,p)=>{
    const h = DB.hoteles[p._id] || {};
    const simples = parseInt(h.simples)||0, dobles = parseInt(h.dobles)||0;
    const habs = (h.total || simples + dobles);
    const ocup = (h.contratos||[]).reduce((s,c)=>s+ctHabs(c),0);
    a.habs += habs;
    a.ocup += ocup;
    // una doble puede ocuparse como simple → el máximo de camas es s + d*2
    a.camas += simples + dobles*2;
    a.camasOcup += (h.contratos||[]).reduce((s,c)=>s+ctCamas(c),0);
    return a;
  }, {habs:0, ocup:0, camas:0, camasOcup:0});

  const conEst = lista.filter(p=>estPctProveedor(p._id, HAB_RUBRO) > 0);
  const pctProm = conEst.length
    ? Math.round(conEst.reduce((a,p)=>a+estPctProveedor(p._id,HAB_RUBRO),0)/conEst.length) : 0;

  el.innerHTML = `
    <div class="dash-title">Habitabilidad · Programa MGI</div>

    <div class="hab-tabs">
      ${RUBROS.map(r=>{
        const n = habProveedores(r).length;
        return `<button class="hab-tab ${r===HAB_RUBRO?'active':''}" onclick="setRubroHab('${r}')">
          ${r==='Hotelería'?'🏨':r==='Lavandería'?'🧺':'🍽'} ${r} <span class="hab-tab-n">${n}</span>
        </button>`;
      }).join('')}
    </div>

    <div class="hab-kpis">
      <div class="hab-kpi"><div class="hab-kpi-n">${lista.length}</div><div class="hab-kpi-l">Proveedores en MGI</div></div>
      ${HAB_RUBRO==='Hotelería' ? `
      <div class="hab-kpi"><div class="hab-kpi-n">${cap.habs}</div><div class="hab-kpi-l">Habitaciones habilitadas</div></div>
      <div class="hab-kpi"><div class="hab-kpi-n" style="color:var(--green)">${Math.max(0,cap.habs-cap.ocup)}</div><div class="hab-kpi-l">Habitaciones libres</div></div>
      <div class="hab-kpi"><div class="hab-kpi-n">${cap.camas}</div><div class="hab-kpi-l">Camas habilitadas</div></div>
      <div class="hab-kpi"><div class="hab-kpi-n" style="color:var(--green)">${Math.max(0,cap.camas-cap.camasOcup)}</div><div class="hab-kpi-l">Camas disponibles</div></div>` : ''}
      <div class="hab-kpi"><div class="hab-kpi-n" style="color:${pctProm>=80?'#1e7e34':pctProm>=50?'#b8860b':'#c0311b'}">${pctProm}%</div><div class="hab-kpi-l">Estandarización promedio</div></div>
    </div>

    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:14px 0 12px">
      <input id="hotBuscar" oninput="renderHoteleriaGlobal()" placeholder="🔍 Buscar…" style="flex:1;min-width:200px;border:1.5px solid var(--border);border-radius:8px;padding:9px 13px;font-size:.9rem">
      <select id="hotOrden" onchange="renderHoteleriaGlobal()" style="border:1.5px solid var(--border);border-radius:7px;padding:8px 10px;font-size:.82rem">
        <option value="camas">Más camas disponibles</option>
        <option value="est">Menor estandarización</option>
        <option value="az">Nombre A → Z</option>
        <option value="loc">Por localidad</option>
      </select>
    </div>
    ${habTablaHTML(lista)}`;
}

// Listado en tabla. Cada fila abre la misma ficha emergente del Directorio.
function habTablaHTML(lista){
  const q = (document.getElementById('hotBuscar')?.value||'').toLowerCase().trim();
  const ord = document.getElementById('hotOrden')?.value || 'camas';
  const esHotel = HAB_RUBRO === 'Hotelería';

  let filas = lista.filter(p => !q ||
    [dispName(p), p.localidad, p.direccion, (p.rubrosNorm||[]).join(' ')].join(' ').toLowerCase().includes(q))
    .map(p => {
      const h = DB.hoteles[p._id] || {};
      const simples = parseInt(h.simples)||0, dobles = parseInt(h.dobles)||0;
      const habs = (h.total || simples + dobles);
      const ocup = (h.contratos||[]).reduce((s,c)=>s+ctHabs(c),0);
      const camas = simples + dobles*2;
      const camasOcup = (h.contratos||[]).reduce((s,c)=>s+ctCamas(c),0);
      return { p, habs, habsLibres: Math.max(0,habs-ocup), camas,
               camasLibres: Math.max(0,camas-camasOcup),
               pct: estPctProveedor(p._id, HAB_RUBRO) };
    });

  filas.sort((a,b)=>
      ord==='camas' ? b.camasLibres-a.camasLibres || dispName(a.p).localeCompare(dispName(b.p),'es')
    : ord==='est'   ? a.pct-b.pct || dispName(a.p).localeCompare(dispName(b.p),'es')
    : ord==='loc'   ? (a.p.localidad||'').localeCompare(b.p.localidad||'','es') || dispName(a.p).localeCompare(dispName(b.p),'es')
    :                 dispName(a.p).localeCompare(dispName(b.p),'es'));

  if(!filas.length) return '<div style="text-align:center;padding:40px;color:var(--text-muted)">Sin proveedores en este rubro dentro del programa MGI.</div>';

  return `<div class="table-wrap"><table class="hab-tabla">
    <thead><tr>
      <th>Proveedor</th><th>Localidad</th>
      ${esHotel?'<th class="num">Hab.<br>libres</th><th class="num">Camas<br>disponibles</th><th class="num">Instaladas</th>':''}
      <th style="min-width:150px">Estandarización</th>
      <th></th>
    </tr></thead>
    <tbody>${filas.map(f=>{
      const col = f.pct>=80?'#1e7e34':f.pct>=50?'#b8860b':'#c0311b';
      return `<tr onclick="abrirDesde('${f.p._id}','datos')" title="Abrir la ficha">
        <td>
          <div class="hab-n">${esc(dispName(f.p))}</div>
          <div class="hab-d">${esc(f.p.direccion||'sin dirección')}</div>
        </td>
        <td>${esc(f.p.localidad||'—')}</td>
        ${esHotel?`
        <td class="num"><b>${f.habsLibres}</b></td>
        <td class="num"><b style="color:var(--green)">${f.camasLibres}</b><div class="hab-sub">de ${f.camas}</div></td>
        <td class="num sec">${f.habs}</td>`:''}
        <td>
          <div class="hab-barra"><div class="hab-barra-in" style="width:${f.pct}%;background:${col}"></div></div>
          <div class="hab-pct" style="color:${col}">${f.pct}%</div>
        </td>
        <td class="num"><button class="mini-btn" onclick="event.stopPropagation();abrirEstandarizacion('${f.p._id}')" title="Ver estandarización">📏</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

// ── NAVEGACIÓN DESDE DASHBOARD ─────────────────────────────────────────────
function abrirDesde(id, tab){
  switchPage('directorio', document.querySelector('[data-page="directorio"]'));
  setTimeout(()=>{
    openModal(id);
    if(tab) setTimeout(()=>switchModalTab(tab),120);
  },60);
}

// ── INIT v6 (consolidado en capa Supabase) ──

// ═══════════════════════════════════════════════════════════════════════════
// SISTEMA v6.1 — PARTE A: Hotelería mejorada + Acuerdos + Google Sheets
// ═══════════════════════════════════════════════════════════════════════════

const AMSA_EMPRESAS = ['Centinela','Antucoya','Zaldívar','Los Pelambres'];

// ── TARIFAS ────────────────────────────────────────────────────────────────
function getTarifas(){ return DB.tarifas || {simple_clp:50000,doble_clp:80000,tc:950}; }
async function guardarTarifas(){
  DB.tarifas = {
    simple_clp: parseInt(document.getElementById('tar_simple')?.value)||50000,
    doble_clp:  parseInt(document.getElementById('tar_doble')?.value)||80000,
    tc:         parseInt(document.getElementById('tar_tc')?.value)||950,
  };
  await saveDB();
  actualizarUSD();
  showToast('Tarifas actualizadas','success');
}
function actualizarUSD(){
  const t=getTarifas();
  const el_s=document.getElementById('tar_usd_simple');
  const el_d=document.getElementById('tar_usd_doble');
  if(el_s) el_s.textContent='USD '+(t.simple_clp/t.tc).toFixed(0);
  if(el_d) el_d.textContent='USD '+(t.doble_clp/t.tc).toFixed(0);
}
function fmtClp(n){ return '$'+Math.round(n).toLocaleString('es-CL'); }
function fmtUsd(n){ return 'USD '+(n).toFixed(0); }

// ── CÁLCULO CAMAS ──────────────────────────────────────────────────────────
function calcCamas(h){
  const s=(h.simples||0), d=(h.dobles||0);
  const total_camas = s*1 + d*2;
  const ocup_s=(h.contratos||[]).reduce((a,c)=>a+ctSimples(c),0);
  const ocup_d=(h.contratos||[]).reduce((a,c)=>a+ctDobles(c),0);
  const ocup_habs=ocup_s+ocup_d, ocup_camas=ocup_s*1+ocup_d*2;
  const lib_s=Math.max(0,s-ocup_s), lib_d=Math.max(0,d-ocup_d);
  return {s,d,total_camas,ocup_s,ocup_d,ocup_habs,ocup_camas,lib_s,lib_d,
          lib_habs:lib_s+lib_d, lib_camas:lib_s*1+lib_d*2};
}

// Helpers de contrato (soportan formato nuevo simples+dobles y el viejo habs+tipo)
function ctSimples(c){ if(c.hab_simples!=null||c.hab_dobles!=null) return parseInt(c.hab_simples)||0; return c.tipo==='doble'?0:(parseInt(c.habs)||0); }
function ctDobles(c){ if(c.hab_simples!=null||c.hab_dobles!=null) return parseInt(c.hab_dobles)||0; return c.tipo==='doble'?(parseInt(c.habs)||0):0; }
function ctHabs(c){ return ctSimples(c)+ctDobles(c); }
function ctCamas(c){ return ctSimples(c)*1 + ctDobles(c)*2; }
function ctMonto(c,dias){ const t=getTarifas(); return (ctSimples(c)*t.simple_clp + ctDobles(c)*t.doble_clp)*(dias||1); }

function calcMontoContrato(c,dias){
  const t=getTarifas();
  const tarifa=c.tipo==='doble'?t.doble_clp:t.simple_clp;
  return (parseInt(c.habs)||0)*tarifa*(dias||1);
}
function diasEntreFechas(desde,hasta){
  if(!desde||!hasta) return 0;
  return Math.max(1,Math.round((new Date(hasta)-new Date(desde))/(864e5)));
}

// ── HOTELERÍA MODAL MEJORADA ───────────────────────────────────────────────
function renderHoteleriaModal(id){
  const el=document.getElementById('hoteleriaPane_'+id);
  if(!el) return;
  const p=PROVEEDORES.find(x=>x._id===id);
  if(!p||!esRubroHotel(p)){el.innerHTML='<div class="no-es-hotel">Este proveedor no es de rubro hotelero.</div>';return;}
  const h=DB.hoteles[id]||{simples:0,dobles:0,contratos:[]};
  const c=calcCamas(h);
  const t=getTarifas();
  const pct_hab=c.s+c.d>0?Math.round(c.ocup_habs/(c.s+c.d)*100):0;
  const pct_cam=c.total_camas>0?Math.round(c.ocup_camas/c.total_camas*100):0;
  const bCls=pct_cam>=90?'full':pct_cam>=65?'warn':'';
  const montoTotal=(h.contratos||[]).reduce((sum,ct)=>{
    const d=diasEntreFechas(ct.desde,ct.hasta);
    return sum+calcMontoContrato(ct,d);
  },0);

  el.innerHTML=`<div style="padding:4px 0 0">
    <div class="hotel-config-row" style="flex-wrap:wrap;gap:14px">
      <div style="display:flex;flex-direction:column;gap:5px">
        <div style="display:flex;align-items:center;gap:8px">
          <label>Hab. Simples (1 cama):</label>
          <input type="number" min="0" value="${h.simples||0}" style="width:64px;border:1px solid var(--border);border-radius:5px;padding:5px 8px;font-size:.9rem;outline:none" onchange="setHabsTipo('${id}','simples',this.value)">
        </div>
        <div style="display:flex;align-items:center;gap:6px;background:#f4f9f9;border:1px dashed var(--border);border-radius:6px;padding:4px 8px">
          <span style="font-size:.72rem;color:var(--text-muted)">🚿 con baño privado:</span>
          <input type="number" min="0" value="${h.simples_banio||0}" title="Cuántas de las simples tienen baño privado" style="width:52px;border:1px solid var(--border);border-radius:5px;padding:4px 6px;font-size:.82rem;outline:none" onchange="setHabBanio('${id}','simples',this.value)">
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <div style="display:flex;align-items:center;gap:8px">
          <label>Hab. Dobles (2 camas):</label>
          <input type="number" min="0" value="${h.dobles||0}" style="width:64px;border:1px solid var(--border);border-radius:5px;padding:5px 8px;font-size:.9rem;outline:none" onchange="setHabsTipo('${id}','dobles',this.value)">
        </div>
        <div style="display:flex;align-items:center;gap:6px;background:#f4f9f9;border:1px dashed var(--border);border-radius:6px;padding:4px 8px">
          <span style="font-size:.72rem;color:var(--text-muted)">🚿 con baño privado:</span>
          <input type="number" min="0" value="${h.dobles_banio||0}" title="Cuántas de las dobles tienen baño privado" style="width:52px;border:1px solid var(--border);border-radius:5px;padding:4px 6px;font-size:.82rem;outline:none" onchange="setHabBanio('${id}','dobles',this.value)">
        </div>
      </div>
    </div>
    <div class="hotel-summary-v2">
      <div class="hstat">
        <div class="hstat-num">${(c.s+c.d)||0}</div>
        <div class="hstat-sub">Habitaciones</div>
        <div class="hstat-camas">${c.total_camas} camas</div>
      </div>
      <div class="hstat">
        <div class="hstat-num" style="color:var(--orange)">${c.ocup_habs}</div>
        <div class="hstat-sub">Ocupadas</div>
        <div class="hstat-camas">${c.ocup_camas} camas</div>
      </div>
      <div class="hstat">
        <div class="hstat-num" style="color:var(--green)">${c.lib_habs}</div>
        <div class="hstat-sub">Disponibles</div>
        <div class="hstat-camas">${c.lib_camas} camas libres</div>
      </div>
    </div>
    <div class="ocupacion-bar"><div class="ocupacion-fill ${bCls}" style="width:${pct_cam}%"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:.73rem;color:var(--text-muted);margin-bottom:10px">
      <span>${pct_cam}% camas ocupadas</span>
      ${montoTotal>0?`<span style="color:var(--green);font-weight:700">${fmtClp(montoTotal)} / ${fmtUsd(montoTotal/t.tc)}</span>`:''}
    </div>
    <div style="font-size:.77rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Contratos activos</div>
    ${(h.contratos||[]).length===0?'<div style="font-size:.82rem;color:var(--text-muted);padding:6px 0 4px">Sin contratos registrados.</div>':''}
    ${(h.contratos||[]).map(ct=>{
      const dias=diasEntreFechas(ct.desde,ct.hasta);
      const monto=calcMontoContrato(ct,dias);
      const isAmsa=AMSA_EMPRESAS.includes(ct.amsa);
      return `<div class="contrato-card ${isAmsa?'amsa':''}">
        <div class="contrato-card-header">
          <div>
            <span class="contrato-card-name">${esc(ct.cliente)}</span>
            <span class="contrato-card-tipo tipo-simple" style="margin-left:5px">${(()=>{const s=ctSimples(ct),d=ctDobles(ct);const parts=[];if(s)parts.push(s+' simple'+(s>1?'s':''));if(d)parts.push(d+' doble'+(d>1?'s':''));return parts.join(' + ')||'—';})()}</span>
            ${isAmsa?`<span class="amsa-badge" style="margin-left:5px">Minera ${esc(ct.amsa)}</span>`:''}${ct.rut?`<span style="font-size:.72rem;color:var(--text-muted);margin-left:6px">${esc(ct.rut)}</span>`:''}
          </div>
          <button class="contrato-del" style="right:34px;color:#5b4fcf" onclick="editarContrato('${id}','${ct.id}')" title="Editar">✎</button>
          <button class="solo-admin contrato-del" onclick="borrarContrato('${id}','${ct.id}')">✕</button>
        </div>
        <div class="contrato-card-meta">
          <span>${ctHabs(ct)} hab. · ${ctCamas(ct)} camas</span>
          ${ct.desde?`<span>${ct.desde}${ct.hasta?' → '+ct.hasta:''}</span>`:''}
          ${dias>0?`<span>${dias} días</span>`:''}
        </div>
        ${monto>0?`<div class="contrato-card-monto">${fmtClp(monto)} · ${fmtUsd(monto/t.tc)}</div>`:''}
      </div>`;
    }).join('')}
    <div id="fc_${id}" style="display:none;background:var(--primary-light);border-radius:8px;padding:14px;margin:8px 0">
      <div style="font-size:.79rem;font-weight:700;color:var(--primary);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">+ Nuevo Contrato</div>
      
      <div style="margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:7px;font-size:.8rem;color:var(--text-muted);margin-bottom:6px;cursor:pointer">
          <input type="checkbox" id="fc_esAmsa_${id}" onchange="toggleAmsaSelect('${id}')"> Es empresa AMSA (Minera)
        </label>
        <div id="fc_amsaRow_${id}" style="display:none;margin-bottom:8px">
          <select id="fc_amsa_${id}" style="width:100%;border:1.5px solid var(--primary);border-radius:6px;padding:7px 10px;font-size:.87rem;outline:none;background:#fff">
            <option value="">Seleccionar empresa AMSA...</option>
            ${AMSA_EMPRESAS.map(e=>`<option value="${e}">Minera ${e}</option>`).join('')}
          </select>
        </div>
        <input type="text" id="fc_cli_${id}" placeholder="Empresa / Cliente" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:7px 10px;font-size:.87rem;margin-bottom:8px;outline:none">
        <input type="text" id="fc_rut_${id}" placeholder="RUT de la empresa (ej: 76.123.456-7)" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:7px 10px;font-size:.87rem;margin-bottom:8px;outline:none">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div><label style="font-size:.72rem;color:var(--text-muted)">🛏 Hab. simples (1 cama)</label><br>
          <input type="number" min="0" id="fc_simples_${id}" placeholder="0" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:.87rem;outline:none" oninput="previewMonto('${id}')">
        </div>
        <div><label style="font-size:.72rem;color:var(--text-muted)">🛏🛏 Hab. dobles (2 camas)</label><br>
          <input type="number" min="0" id="fc_dobles_${id}" placeholder="0" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:.87rem;outline:none" oninput="previewMonto('${id}')">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div><label style="font-size:.72rem;color:var(--text-muted)">Desde</label><br>
          <input type="date" id="fc_desde_${id}" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:.84rem;outline:none" oninput="previewMonto('${id}')">
        </div>
        <div><label style="font-size:.72rem;color:var(--text-muted)">Hasta</label><br>
          <input type="date" id="fc_hasta_${id}" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:.84rem;outline:none" oninput="previewMonto('${id}')">
        </div>
      </div>
      <div id="monto_preview_${id}" style="font-size:.82rem;color:var(--green);font-weight:700;min-height:20px;margin-bottom:8px"></div>
      <div style="display:flex;gap:8px">
        <button onclick="guardarContrato('${id}')" style="flex:1;padding:9px;background:var(--primary);color:#fff;border:none;border-radius:7px;font-family:'Barlow Condensed',sans-serif;font-size:.84rem;font-weight:700;cursor:pointer">GUARDAR</button>
        <button onclick="document.getElementById('fc_${id}').style.display='none'" style="padding:9px 14px;border:1.5px solid var(--border);background:#fff;border-radius:7px;font-size:.82rem;cursor:pointer;color:var(--text-muted)">Cancelar</button>
      </div>
    </div>
    <button class="btn-add-contrato" onclick="document.getElementById('fc_${id}').style.display='block'">+ Agregar contrato de habitaciones</button>
    <div style="margin-top:18px;border-top:1px dashed var(--border);padding-top:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:.79rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.05em">🛎 Servicios del hotel</div>
        <button onclick="toggleServPanel('${id}')" style="background:var(--primary-light);color:var(--primary);border:1px solid var(--primary);border-radius:7px;padding:5px 11px;font-size:.78rem;font-weight:700;cursor:pointer">＋ Seleccionar servicios</button>
      </div>
      <div id="servChips_${id}" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">${renderServChips(id)}</div>
      <div id="servPanel_${id}" style="display:none;background:var(--primary-light);border-radius:9px;padding:13px;margin-top:8px">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 12px">
          ${(()=>{const sel=(h.servicios||[]);const opts=SERVICIOS_HOTEL.concat(sel.filter(x=>!SERVICIOS_HOTEL.includes(x)));return opts.map(sv=>`<label style="display:flex;align-items:center;gap:6px;font-size:.82rem;color:var(--text);cursor:pointer"><input type="checkbox" value="${esc(sv)}" ${sel.includes(sv)?'checked':''} onchange="toggleServicio('${id}',this.value)" style="width:auto"> ${esc(sv)}</label>`).join('');})()}
        </div>
        <div style="display:flex;gap:6px;margin-top:11px">
          <input id="servOtro_${id}" placeholder="Otro servicio..." onkeydown="if(event.key==='Enter'){event.preventDefault();agregarServOtro('${id}')}" style="flex:1;border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:.84rem;outline:none">
          <button onclick="agregarServOtro('${id}')" style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:7px 14px;font-size:.82rem;font-weight:700;cursor:pointer">＋ Agregar</button>
        </div>
      </div>
    </div>
    <div style="margin-top:18px;border-top:1px dashed var(--border);padding-top:14px">
      <div style="font-size:.79rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">👷 Trabajadores del hotel <span id="trabResumen_${id}" style="font-weight:600;color:var(--text-muted);text-transform:none;font-size:.8rem"></span></div>
      <div id="trabList_${id}"><div style="font-size:.78rem;color:var(--text-muted)">Cargando…</div></div>
      <button class="btn-add-contrato" style="margin-top:8px" onclick="abrirFormTrabajador('${id}')">+ Agregar trabajador</button>
    </div>
  </div>`;
  cargarTrabajadores(id);
}

let _tipoHab={}; let _editContratoId=null;
function selTipo(id,tipo){
  _tipoHab[id]=tipo;
  document.getElementById('btn_simple_'+id)?.classList.toggle('active',tipo==='simple');
  document.getElementById('btn_doble_'+id)?.classList.toggle('active',tipo==='doble');
  previewMonto(id);
}
function toggleAmsaSelect(id){
  const chk=document.getElementById('fc_esAmsa_'+id);
  const row=document.getElementById('fc_amsaRow_'+id);
  if(row) row.style.display=chk?.checked?'block':'none';
  const cli=document.getElementById('fc_cli_'+id);
  if(cli) cli.placeholder=chk?.checked?'(se usará la empresa AMSA seleccionada)':'Empresa / Cliente';
}
function previewMonto(id){
  const s=parseInt(document.getElementById('fc_simples_'+id)?.value)||0;
  const d=parseInt(document.getElementById('fc_dobles_'+id)?.value)||0;
  const desde=document.getElementById('fc_desde_'+id)?.value||'';
  const hasta=document.getElementById('fc_hasta_'+id)?.value||'';
  const dias=diasEntreFechas(desde,hasta);
  const t=getTarifas();
  const monto=(s*t.simple_clp + d*t.doble_clp)*(dias||0);
  const camas=s*1+d*2;
  const el=document.getElementById('monto_preview_'+id);
  if(el) el.textContent=monto>0?`${camas} camas · Monto estimado: ${fmtClp(monto)} / ${fmtUsd(monto/t.tc)} (${dias} días)`:(camas>0?`${camas} camas`:'');
}

async function setHabsTipo(id,tipo,val){
  if(!DB.hoteles[id]) DB.hoteles[id]={simples:0,dobles:0,total:0,contratos:[],servicios:[]};
  DB.hoteles[id][tipo]=Math.max(0,parseInt(val)||0);
  // recalcular total a partir de simples + dobles
  DB.hoteles[id].total=(DB.hoteles[id].simples||0)+(DB.hoteles[id].dobles||0);
  await saveDB();
  await gSyncPush(id);
  renderHoteleriaModal(id);
  actualizarBadgeHabs();
  // refrescar la sección global de Hotelería al instante
  if(typeof renderHoteleriaGlobal==='function') renderHoteleriaGlobal();
}

// ── Servicios y baño privado del hotel ──
const SERVICIOS_HOTEL=['WiFi','Aire acondicionado','Calefacción','Cocina equipada','Agua caliente','TV / Cable','Frigobar','Desayuno incluido','Estacionamiento','Lavandería','Ropa de cama y toallas','Limpieza diaria','Caja fuerte','Recepción 24h','Comedor / Casino','Sala de estar'];
function _hotelObj(id){ if(!DB.hoteles[id]) DB.hoteles[id]={simples:0,dobles:0,total:0,contratos:[],servicios:[]}; if(!DB.hoteles[id].servicios) DB.hoteles[id].servicios=[]; return DB.hoteles[id]; }
async function setHabBanio(id,tipo,val){
  const h=_hotelObj(id);
  const key=tipo==='dobles'?'dobles_banio':'simples_banio';
  let n=Math.max(0,parseInt(val)||0);
  const max=tipo==='dobles'?(h.dobles||0):(h.simples||0);
  if(max>0 && n>max) n=max;
  h[key]=n;
  await saveDB(); await gSyncPush(id);
  renderHoteleriaModal(id);
}
function renderServChips(id){
  const h=DB.hoteles[id]||{servicios:[]}; const arr=h.servicios||[];
  if(!arr.length) return '<span style="font-size:.78rem;color:var(--text-muted)">Sin servicios. Pulsa "Seleccionar servicios".</span>';
  return arr.map(s=>`<span class="hot-serv" style="display:inline-flex;align-items:center;gap:5px">${esc(s)} <b data-serv="${esc(s)}" onclick="quitarServicio('${id}',this.getAttribute('data-serv'))" style="cursor:pointer;color:#c0311b">✕</b></span>`).join('');
}
function toggleServPanel(id){ const p=document.getElementById('servPanel_'+id); if(p) p.style.display=p.style.display==='none'?'block':'none'; }
function refreshServUI(id){
  const h=DB.hoteles[id]||{servicios:[]};
  const chips=document.getElementById('servChips_'+id); if(chips) chips.innerHTML=renderServChips(id);
  document.querySelectorAll('#servPanel_'+id+' input[type=checkbox]').forEach(cb=>{ cb.checked=(h.servicios||[]).includes(cb.value); });
}
async function toggleServicio(id,serv){
  const h=_hotelObj(id); const i=h.servicios.indexOf(serv);
  if(i>=0) h.servicios.splice(i,1); else h.servicios.push(serv);
  await saveDB(); await gSyncPush(id); refreshServUI(id);
  if(typeof renderHoteleriaGlobal==='function') renderHoteleriaGlobal();
}
async function quitarServicio(id,serv){
  const h=_hotelObj(id); const i=h.servicios.indexOf(serv);
  if(i>=0) h.servicios.splice(i,1);
  await saveDB(); await gSyncPush(id); refreshServUI(id);
  if(typeof renderHoteleriaGlobal==='function') renderHoteleriaGlobal();
}
async function agregarServOtro(id){
  const inp=document.getElementById('servOtro_'+id); if(!inp) return;
  const v=(inp.value||'').trim(); if(!v) return;
  const h=_hotelObj(id);
  if(!h.servicios.some(s=>s.toLowerCase()===v.toLowerCase())) h.servicios.push(v);
  inp.value='';
  await saveDB(); await gSyncPush(id); refreshServUI(id);
  if(typeof renderHoteleriaGlobal==='function') renderHoteleriaGlobal();
}

async function guardarContrato(id){
  const esAmsa=document.getElementById('fc_esAmsa_'+id)?.checked;
  const amsa=esAmsa?(document.getElementById('fc_amsa_'+id)?.value||''):'';
  let cli=document.getElementById('fc_cli_'+id)?.value||'';
  if(esAmsa && amsa) cli=`Minera ${amsa}`;
  const habSimples=parseInt(document.getElementById('fc_simples_'+id)?.value)||0;
  const habDobles=parseInt(document.getElementById('fc_dobles_'+id)?.value)||0;
  const desde=document.getElementById('fc_desde_'+id)?.value||'';
  const hasta=document.getElementById('fc_hasta_'+id)?.value||'';
  const rut=document.getElementById('fc_rut_'+id)?.value||'';
  if(!cli.trim()||(habSimples+habDobles)===0){showToast('Completa cliente y al menos una habitación','err');return;}
  if(!DB.hoteles[id]) DB.hoteles[id]={simples:0,dobles:0,contratos:[]};
  if(_editContratoId){
    // edición de contrato existente
    const ct=DB.hoteles[id].contratos.find(c=>c.id===_editContratoId);
    if(ct){ Object.assign(ct,{cliente:cli.trim(),rut:rut.trim(),amsa,hab_simples:habSimples,hab_dobles:habDobles,desde,hasta}); }
    _editContratoId=null;
  } else {
    DB.hoteles[id].contratos.push({id:uid(),cliente:cli.trim(),rut:rut.trim(),amsa,hab_simples:habSimples,hab_dobles:habDobles,desde,hasta});
  }
  await saveDB();
  ['fc_simples_'+id,'fc_dobles_'+id,'fc_cli_'+id,'fc_rut_'+id,'fc_desde_'+id,'fc_hasta_'+id].forEach(x=>{const e=document.getElementById(x);if(e)e.value='';});
  document.getElementById('fc_'+id).style.display='none';
  renderHoteleriaModal(id);
  actualizarBadgeHabs();
  if(typeof renderHoteleriaGlobal==='function') renderHoteleriaGlobal();
  showToast('Contrato guardado','success');
  await gSyncPush(id);
}

async function borrarContrato(pid,cid){
  if(!puedeEliminar()) return;
  if(!confirm('¿Eliminar esta reserva?')) return;
  if(DB.hoteles[pid]) DB.hoteles[pid].contratos=(DB.hoteles[pid].contratos||[]).filter(c=>c.id!==cid);
  await saveDB();
  await gSyncPush(pid);
  renderHoteleriaModal(pid);
  actualizarBadgeHabs();
  if(typeof renderHoteleriaGlobal==='function') renderHoteleriaGlobal();
}

function actualizarBadgeHabs(){
  const hotels=PROVEEDORES.filter(p=>esRubroHotel(p));
  let lib=0,tot=0;
  hotels.forEach(p=>{
    const h=DB.hoteles[p._id]||{simples:0,dobles:0,contratos:[]};
    const cv=calcCamas(h);
    tot+=cv.total_camas; lib+=cv.lib_camas;
  });
  const badge=document.getElementById('badgeHabs');
  if(badge) badge.textContent=tot>0?`${lib}/${tot} camas`:'—';
}

// ── ACUERDOS COMERCIALES ───────────────────────────────────────────────────
function diasRestantes(hasta){
  if(!hasta) return null;
  return Math.round((new Date(hasta)-new Date())/(864e5));
}
function acDiasClass(dias){
  if(dias===null) return 'ok';
  if(dias<0) return 'vencido';
  if(dias<=30) return 'danger';
  if(dias<=90) return 'warn';
  return 'ok';
}
function acDiasLabel(dias){
  if(dias===null) return 'Sin fecha';
  if(dias<0) return `Venció hace ${Math.abs(dias)}d`;
  if(dias===0) return 'Vence hoy';
  return `${dias} días restantes`;
}


// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO LICITACIONES — trazabilidad de procesos de licitación por proveedor
// (distinto de "Contratos"/acuerdos, que son las adjudicaciones ya firmadas)
// ═══════════════════════════════════════════════════════════════════════════
const LIC_HITOS = [
  { k:'invitacion', label:'Invitación por ARIBA' },
  { k:'documentacion', label:'Entrega de documentación' },
  { k:'propuesta', label:'Entrega de propuesta técnica y económica' },
  { k:'resultados', label:'Resultados' },
  { k:'final', label:'Estado final: Adjudicado o Perdido' }
];
function licNuevoHitos(){ return LIC_HITOS.map(h=>({k:h.k, hecho:false, comentario:''})); }
function licProvIdReal(pid){ return (PROVEEDORES.find(x=>x._id===pid)||{})._proveedorId||pid; }
function licPuedeEditar(){ return (typeof ES_ADMIN_ACTUAL==='undefined') ? true : (window.ES_EDITOR_ACTUAL!==false); }

// ── Render de la pestaña Licitaciones dentro de la ficha del proveedor ──
function renderLicitacionesModal(id){
  const pane=document.getElementById('licitacionesPane_'+id); if(!pane) return;
  const lics=(DB.licitaciones && DB.licitaciones[id])||[];
  let h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">';
  h+='<div style="font-family:\'Barlow Condensed\',sans-serif;font-size:1.1rem;color:var(--primary);text-transform:uppercase">📜 Licitaciones ('+lics.length+')</div>';
  h+='<button class="btn-edit-modal" onclick="licFormNueva(\''+id+'\')">＋ Nueva licitación</button></div>';
  h+='<div id="licFormWrap_'+id+'"></div>';
  if(!lics.length){ h+='<div class="sin-visitas">Sin licitaciones registradas. Usa "＋ Nueva licitación".</div>'; }
  else { h+=lics.map(l=>licCardHtml(id,l)).join(''); }
  pane.innerHTML=h;
}
function licEstadoColor(l){
  const ef=(l.estado_final||l.estado_proceso||'').toLowerCase();
  if(ef.includes('adjudic')) return '#1e7e34';
  if(ef.includes('perd')) return '#c0311b';
  return '#b8860b';
}
function licCardHtml(pid,l){
  const done=(l.hitos||[]).filter(x=>x.hecho).length;
  const col=licEstadoColor(l);
  let h='<div style="border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;background:#fff">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">';
  h+='<div style="flex:1;min-width:180px"><div style="font-weight:700;font-size:.98rem">'+esc(l.nombre)+'</div>';
  h+='<div style="font-size:.78rem;color:var(--text-muted);margin-top:2px">Avance: '+done+'/'+LIC_HITOS.length+' hitos · <span style="color:'+col+';font-weight:700">'+esc(l.estado_final||l.estado_proceso||'En curso')+'</span></div>';
  // Adjudicada sin contrato: el paso que falta queda a la vista.
  if(licAdjudicada(l)){
    h+= acContratoDeLic(pid,l.id)
      ? '<div class="lt-contrato ok">📄 Contrato cargado</div>'
      : '<button class="lt-contrato falta" onclick="licIrContrato(\''+pid+'\',\''+l.id+'\')">📄 Cargar contrato</button>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:6px"><button class="btn-edit-modal" onclick="licFormEditar(\''+pid+'\',\''+l.id+'\')">✏ Editar</button>';
  h+='<button class="btn-edit-modal solo-admin" style="color:#c0311b" onclick="licEliminar(\''+pid+'\',\''+l.id+'\')">🗑</button></div></div>';
  // ruta de hitos
  h+='<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">';
  (l.hitos||licNuevoHitos()).forEach((ht,i)=>{
    const info=LIC_HITOS[i]||{label:ht.k};
    const chk=ht.hecho?'#1e7e34':'#cfd8dc';
    h+='<div style="display:flex;gap:10px;align-items:flex-start">';
    h+='<div style="width:22px;height:22px;border-radius:50%;background:'+chk+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;flex-shrink:0;margin-top:1px">'+(ht.hecho?'✓':(i+1))+'</div>';
    h+='<div style="flex:1"><div style="font-size:.85rem;font-weight:600">'+esc(info.label)+'</div>';
    if(ht.comentario) h+='<div style="font-size:.78rem;color:var(--text-muted);background:#f5f8f9;border-radius:6px;padding:5px 8px;margin-top:3px">'+esc(ht.comentario)+'</div>';
    h+='</div></div>';
  });
  h+='</div></div>';
  return h;
}

// ── Adjudicada → contrato ────────────────────────────────────────────────
// Cuando una licitación se marca Adjudicado, lo que sigue siempre es cargar
// el contrato. En vez de dejarlo a la memoria de cada uno, el sistema salta
// solo a Contratos con el formulario abierto y el vínculo ya hecho.
let AC_PRE=null;   // {pid, licitacion_id, servicio}

function acContratoDeLic(pid,lid){
  return (DB.acuerdos[pid]||[]).find(a=>a.licitacion_id===lid) || null;
}
// Desde la línea de tiempo: abre la ficha en Contratos listo para cargar.
function licIrContrato(pid,lid){
  const l=(DB.licitaciones[pid]||[]).find(x=>x.id===lid);
  AC_PRE={pid:pid, licitacion_id:lid, servicio:(l&&l.nombre)||''};
  abrirDesde(pid,'acuerdos');
}
// Abre y prellena el formulario de contrato si venimos de una adjudicación.
function acAplicarPrellenado(id){
  if(!AC_PRE || AC_PRE.pid!==id) return;
  const f=document.getElementById('fac_'+id); if(!f) return;
  f.classList.add('open');
  const serv=document.getElementById('fac_serv_'+id);
  if(serv && AC_PRE.servicio) serv.value=AC_PRE.servicio;
  if(!document.getElementById('acPreAviso')){
    const av=document.createElement('div');
    av.id='acPreAviso';
    av.style.cssText='background:#e8f6ec;border:1px solid #b7e0c2;border-radius:8px;'+
                     'padding:9px 11px;font-size:.8rem;color:#1e7e34;margin-bottom:10px;font-weight:600';
    av.textContent='🏆 Licitación adjudicada'+(AC_PRE.servicio?': '+AC_PRE.servicio:'')+
                   ' — completa los datos del contrato. Quedará vinculado a este proceso.';
    f.insertBefore(av,f.firstChild);
  }
  f.scrollIntoView({behavior:'smooth',block:'nearest'});
  const co=document.getElementById('fac_co_'+id); if(co) co.focus();
}

// ── Formulario nueva/editar licitación ──
let LICIT_EDIT=null;
function licFormNueva(pid){ LICIT_EDIT={id:'lic_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), prov_id:pid, nombre:'', estado_proceso:'En curso', estado_final:'', comentario_general:'', hitos:licNuevoHitos(), _nuevo:true}; licRenderForm(pid); }
function licFormEditar(pid,lid){
  const l=(DB.licitaciones[pid]||[]).find(x=>x.id===lid); if(!l) return;
  LICIT_EDIT=JSON.parse(JSON.stringify(l));
  if(!Array.isArray(LICIT_EDIT.hitos)||!LICIT_EDIT.hitos.length) LICIT_EDIT.hitos=licNuevoHitos();
  licRenderForm(pid);
}
function licRenderForm(pid){
  const wrap=document.getElementById('licFormWrap_'+pid); if(!wrap||!LICIT_EDIT) return;
  let h='<div style="border:2px solid var(--primary);border-radius:12px;padding:16px;margin-bottom:14px;background:#f7fcfc">';
  h+='<div style="font-family:\'Barlow Condensed\',sans-serif;font-size:1.05rem;color:var(--primary);text-transform:uppercase;margin-bottom:10px">'+(LICIT_EDIT._nuevo?'Nueva licitación':'Editar licitación')+'</div>';
  h+='<div style="margin-bottom:10px"><label style="font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:3px">Nombre de la licitación *</label>';
  h+='<input id="licNombre" value="'+esc(LICIT_EDIT.nombre)+'" placeholder="Ej: Licitación servicios de alimentación 2026" style="width:100%;border:1.5px solid var(--border);border-radius:8px;padding:9px 11px;font-size:.9rem"></div>';
  h+='<div style="margin-bottom:12px"><label style="font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:3px">Estado del proceso</label>';
  h+='<select id="licEstadoProc" style="width:100%;border:1.5px solid var(--border);border-radius:8px;padding:9px 11px;font-size:.9rem">';
  ['En curso','Adjudicado','Perdido'].forEach(o=>{ h+='<option '+(LICIT_EDIT.estado_proceso===o?'selected':'')+'>'+o+'</option>'; });
  h+='</select></div>';
  // hitos con checkbox + comentario
  h+='<div style="font-size:.75rem;font-weight:700;color:var(--primary);text-transform:uppercase;margin-bottom:6px">Ruta de avance — marca los hitos cumplidos y agrega notas</div>';
  LICIT_EDIT.hitos.forEach((ht,i)=>{
    const info=LIC_HITOS[i]||{label:ht.k};
    h+='<div style="border:1px solid var(--border);border-radius:9px;padding:10px;margin-bottom:8px;background:#fff">';
    h+='<label style="display:flex;align-items:center;gap:8px;font-size:.85rem;font-weight:600;cursor:pointer">';
    h+='<input type="checkbox" '+(ht.hecho?'checked':'')+' onchange="LICIT_EDIT.hitos['+i+'].hecho=this.checked" style="width:auto"> '+(i+1)+'. '+esc(info.label)+'</label>';
    h+='<input value="'+esc(ht.comentario||'')+'" oninput="LICIT_EDIT.hitos['+i+'].comentario=this.value" placeholder="Comentario / nota de este hito..." style="width:100%;border:1px solid var(--border);border-radius:7px;padding:7px 9px;font-size:.82rem;margin-top:6px">';
    h+='</div>';
  });
  h+='<div style="display:flex;gap:8px;margin-top:12px"><button class="btn-edit-modal" style="background:var(--primary);color:#fff" onclick="licGuardar(\''+pid+'\')">💾 Guardar licitación</button>';
  h+='<button class="btn-edit-modal" onclick="LICIT_EDIT=null;renderLicitacionesModal(\''+pid+'\')">Cancelar</button></div>';
  h+='</div>';
  wrap.innerHTML=h;
  wrap.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function licGuardar(pid){
  if(!LICIT_EDIT) return;
  const nombre=(document.getElementById('licNombre').value||'').trim();
  if(!nombre){ showToast('La licitación debe tener nombre','err'); document.getElementById('licNombre').focus(); return; }
  LICIT_EDIT.nombre=nombre;
  LICIT_EDIT.estado_proceso=document.getElementById('licEstadoProc').value;
  // estado_final derivado del último hito o del estado del proceso
  if(LICIT_EDIT.estado_proceso==='Adjudicado'||LICIT_EDIT.estado_proceso==='Perdido') LICIT_EDIT.estado_final=LICIT_EDIT.estado_proceso;
  else LICIT_EDIT.estado_final='';
  const wasNew=LICIT_EDIT._nuevo; delete LICIT_EDIT._nuevo;
  if(!DB.licitaciones[pid]) DB.licitaciones[pid]=[];
  const idx=DB.licitaciones[pid].findIndex(x=>x.id===LICIT_EDIT.id);
  if(idx>=0) DB.licitaciones[pid][idx]=LICIT_EDIT; else DB.licitaciones[pid].push(LICIT_EDIT);
  await saveDB();
  await licitacionesPushSupabase(pid, LICIT_EDIT);
  const guardada=LICIT_EDIT; LICIT_EDIT=null;
  renderLicitacionesModal(pid);
  actualizarBadgeLicitaciones();
  // Adjudicada y sin contrato cargado: se va derecho a cargarlo.
  if(licAdjudicada(guardada) && !acContratoDeLic(pid,guardada.id)){
    AC_PRE={pid:pid, licitacion_id:guardada.id, servicio:guardada.nombre||''};
    showToast('🏆 Adjudicada — carga ahora el contrato','success');
    switchModalTab('acuerdos');
  } else {
    showToast('✅ Licitación guardada','success');
  }
}
async function licEliminar(pid,lid){
  if(typeof ES_ADMIN_ACTUAL!=='undefined' && !ES_ADMIN_ACTUAL){ showToast('Solo un administrador puede eliminar','err'); return; }
  if(!confirm('¿Eliminar esta licitación?')) return;
  DB.licitaciones[pid]=(DB.licitaciones[pid]||[]).filter(x=>x.id!==lid);
  await saveDB();
  try{ if(SUPA.client&&SUPA.session) await SUPA.client.from('licitaciones').update({estado_registro:'Eliminado',updated_at:new Date().toISOString()}).eq('licitacion_id',lid); }catch(e){ showToast('No se pudo eliminar en la nube: '+e.message,'err'); }
  renderLicitacionesModal(pid);
  actualizarBadgeLicitaciones();
}
async function licitacionesPushSupabase(pid, l){
  if(!SUPA.client || !SUPA.session) return;
  const provId=licProvIdReal(pid);
  try{
    await SUPA.client.from('licitaciones').upsert({
      licitacion_id:l.id, proveedor_id:provId, nombre:l.nombre||'',
      estado_proceso:l.estado_proceso||'En curso', estado_final:l.estado_final||'',
      comentario_general:l.comentario_general||'', hitos_json:JSON.stringify(l.hitos||[]),
      estado_registro:'Activo', created_by:l.created_by||miNombre(), updated_by:miNombre(), updated_at:new Date().toISOString()
    },{onConflict:'licitacion_id'});
  }catch(e){ console.warn('licitacionesPush',e); showToast('⚠ No se guardó en la nube: '+e.message,'err'); }
}
function actualizarBadgeLicitaciones(){
  const total=Object.values(DB.licitaciones||{}).flat().length;
  const badge=document.getElementById('badgeLicitaciones');
  if(badge) badge.textContent=total>0?String(total):'—';
}

// ── Directorio buscador de Licitaciones (ventana propia) ──
// ═══════════════════════════════════════════════════════════════════════════
// LICITACIONES · LÍNEA DE TIEMPO
// Un listado vertical no dice en qué etapa va cada proceso. Acá cada
// licitación es una fila que avanza por los hitos de Operaciones Centinela
// (LIC_HITOS), así se ve de un vistazo dónde está cada una y cuáles están
// trancadas en la misma etapa.
// ═══════════════════════════════════════════════════════════════════════════
let LIC_FILTRO = 'activas';   // activas | adjudicadas | perdidas | todas

function licSetFiltro(f){ LIC_FILTRO = f; renderLicitacionesDir(); }

// En qué hito va: el último marcado como hecho.
function licEtapaActual(l){
  const hitos = l.hitos || [];
  let ultimo = -1;
  LIC_HITOS.forEach((h,i)=>{ const x=hitos.find(y=>y.k===h.k); if(x&&x.hecho) ultimo=i; });
  return ultimo;   // -1 = todavía no parte
}
function licCerrada(l){
  const ef=(l.estado_final||'').toLowerCase();
  return ef.includes('adjudic') || ef.includes('perd');
}
function licAdjudicada(l){ return (l.estado_final||'').toLowerCase().includes('adjudic'); }

function renderLicitacionesDir(){
  const cont=document.getElementById('licDirContent'); if(!cont) return;
  const q=(document.getElementById('licDirSearch')?.value||'').toLowerCase().trim();

  // se aplana: cada licitación con su proveedor al lado
  let filas=[];
  PROVEEDORES.forEach(p=>{
    ((DB.licitaciones&&DB.licitaciones[p._id])||[]).forEach(l=>{
      filas.push({p, l, etapa: licEtapaActual(l)});
    });
  });

  const total=filas.length;
  const adjud=filas.filter(f=>licAdjudicada(f.l)).length;
  const perd =filas.filter(f=>!licAdjudicada(f.l) && licCerrada(f.l)).length;
  const activ=filas.filter(f=>!licCerrada(f.l)).length;

  if(LIC_FILTRO==='activas')      filas=filas.filter(f=>!licCerrada(f.l));
  else if(LIC_FILTRO==='adjudicadas') filas=filas.filter(f=>licAdjudicada(f.l));
  else if(LIC_FILTRO==='perdidas')    filas=filas.filter(f=>!licAdjudicada(f.l)&&licCerrada(f.l));

  if(q) filas=filas.filter(f=>((dispName(f.p)||'')+' '+(f.l.nombre||'')).toLowerCase().includes(q));

  // las más atrasadas primero: menos avance arriba
  filas.sort((a,b)=> a.etapa-b.etapa || (dispName(a.p)||'').localeCompare(dispName(b.p)||'','es'));

  const cnt=document.getElementById('licDirCount');
  if(cnt) cnt.textContent = filas.length+(filas.length===1?' licitación':' licitaciones');

  // cuántas hay paradas en cada hito (solo las abiertas)
  const porEtapa = LIC_HITOS.map((h,i)=>
    filas.filter(f=>!licCerrada(f.l) && f.etapa===i-1).length);

  let h=`
    <div class="lt-filtros">
      ${[['activas','En curso',activ],['adjudicadas','Adjudicadas',adjud],['perdidas','Perdidas',perd],['todas','Todas',total]]
        .map(([k,t,n])=>`<button class="lt-f ${LIC_FILTRO===k?'active':''}" onclick="licSetFiltro('${k}')">${t} <span>${n}</span></button>`).join('')}
    </div>`;

  if(!filas.length){
    cont.innerHTML = h + '<div class="sin-visitas">'+(total
      ? 'Sin licitaciones en este filtro.'
      : 'Aún no hay licitaciones registradas. Abre la ficha de un proveedor → pestaña Licitaciones.')+'</div>';
    return;
  }

  // Encabezado: los hitos del proceso, con cuántas están detenidas en cada uno
  h+=`<div class="lt-wrap"><div class="lt-tabla">
    <div class="lt-cab">
      <div class="lt-cab-prov">Licitación</div>
      ${LIC_HITOS.map((x,i)=>`<div class="lt-cab-h">
        <span class="lt-cab-n">${i+1}</span>${esc(x.label)}
        ${porEtapa[i]?`<span class="lt-cab-c" title="en curso, detenidas antes de este hito">${porEtapa[i]}</span>`:''}
      </div>`).join('')}
    </div>`;

  h+=filas.map(({p,l,etapa})=>{
    const cerrada=licCerrada(l), adj=licAdjudicada(l);
    // La línea va del centro del 1er punto al del último, así que el avance
    // se mide en tramos entre puntos, no en quintos.
    const pct = etapa<=0 ? 0 : Math.round(etapa/(LIC_HITOS.length-1)*100);
    const col = adj?'#1e7e34' : (cerrada?'#c0311b':'#F2A900');
    return `<div class="lt-fila ${cerrada?(adj?'adj':'perd'):''}" onclick="abrirDesde('${p._id}','licitaciones')" title="Abrir la ficha">
      <div class="lt-prov">
        <div class="lt-prov-n">${esc(dispName(p))}</div>
        <div class="lt-prov-l">${esc(l.nombre||'Sin nombre')}</div>
        <div class="lt-prov-e" style="color:${col}">${adj?'✓ Adjudicada':cerrada?'✗ Perdida':(etapa<0?'Por iniciar':'En '+esc(LIC_HITOS[etapa].label))}</div>
        ${adj ? (acContratoDeLic(p._id,l.id)
            ? '<div class="lt-contrato ok">📄 Contrato cargado</div>'
            : `<button class="lt-contrato falta" onclick="event.stopPropagation();licIrContrato('${p._id}','${l.id}')">📄 Cargar contrato</button>`)
          : ''}
      </div>
      <div class="lt-pista">
        <div class="lt-linea"><div class="lt-avance" style="width:${pct}%;background:${col}"></div></div>
        ${LIC_HITOS.map((x,i)=>{
          const hecho = etapa>=i;
          const actual = etapa===i && !cerrada;
          const ht=(l.hitos||[]).find(y=>y.k===x.k);
          return `<div class="lt-punto ${hecho?'ok':''} ${actual?'actual':''}"
            style="${hecho?`--c:${col}`:''}"
            title="${esc(x.label)}${ht&&ht.comentario?' — '+esc(ht.comentario):''}">
            ${hecho?'✓':i+1}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');

  h+='</div></div>';
  cont.innerHTML=h;
}
// Ventana emergente con las licitaciones del proveedor (título = nombre proveedor)
function licAbrirProv(pid){
  const p=PROVEEDORES.find(x=>x._id===pid); if(!p) return;
  const lics=DB.licitaciones[pid]||[];
  let h='<div id="licDirModal" onmousedown="licDirMouseDown(event)" onclick="licDirModalClose(event)" style="position:fixed;inset:0;z-index:9997;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px">';
  h+='<div style="background:#fff;border-radius:14px;max-width:760px;width:100%;max-height:90vh;overflow-y:auto;padding:24px" onclick="event.stopPropagation()">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
  h+='<h2 style="font-family:\'Barlow Condensed\',sans-serif;font-size:1.5rem;color:var(--primary);text-transform:uppercase;margin:0">'+esc(dispName(p))+'</h2>';
  h+='<button onclick="document.getElementById(\'licDirModal\').remove()" style="background:none;border:none;font-size:1.5rem;color:#aaa;cursor:pointer">✕</button></div>';
  h+='<div style="font-size:.82rem;color:var(--text-muted);margin-bottom:16px">'+esc(p.localidad||'')+' · '+lics.length+' licitación(es)</div>';
  if(!lics.length){ h+='<div class="sin-visitas">Este proveedor no tiene licitaciones.</div>'; }
  else { h+=lics.map(l=>licCardHtml(pid,l)).join(''); }
  h+='</div></div>';
  const div=document.createElement('div'); div.innerHTML=h; document.body.appendChild(div.firstChild);
}
let _licDmdown=false;
function licDirMouseDown(e){ _licDmdown=(e.target.id==='licDirModal'); }
function licDirModalClose(e){ if(_licDmdown && e.target.id==='licDirModal'){ e.target.remove(); } _licDmdown=false; }


function renderAcuerdos(id){
  const el=document.getElementById('acuerdosPane_'+id);
  if(!el) return;
  LIC_CTX.pid=id;
  // precargar MOLI de las licitaciones de este proveedor (async, refresca al volver)
  (DB.acuerdos[id]||[]).forEach(ac=>{ if(MOLI_CACHE[ac.id]===undefined){ MOLI_CACHE[ac.id]=null; cargarMOLI(ac.id).then(b=>{ MOLI_CACHE[ac.id]=b||[]; if(b&&b.length){ const e=document.getElementById('acuerdosPane_'+id); if(e) renderAcuerdosSoft(id); } }); } });
  const p=PROVEEDORES.find(x=>x._id===id);
  const acs=(DB.acuerdos[id]||[]).slice().sort((a,b)=>(b.fecha_inicio||'').localeCompare(a.fecha_inicio||''));
  const t=getTarifas();

  // Resumen MOLI del proveedor (suma de todas sus licitaciones)
  let _mt=0,_mm=0,_mh=0;
  (DB.acuerdos[id]||[]).forEach(ac=>{ const b=MOLI_CACHE[ac.id]; if(Array.isArray(b)){ _mt+=b.length; _mm+=b.filter(x=>x.sexo==='Mujer').length; _mh+=b.filter(x=>x.sexo==='Hombre').length; } });
  el.innerHTML=`<div style="padding:4px 0 0">
    ${_mt>0?`<div class="moli-badge" style="display:flex;justify-content:space-between">👷 MOLI total del proveedor: <b>${_mt}</b> · ♀ ${_mm} · ♂ ${_mh}</div>`:''}
    <button class="btn-add-ac" onclick="toggleFormAc('${id}')">+ Nueva Licitación Comercial AMSA</button>
    <div class="form-ac" id="fac_${id}">
      <div style="font-size:.8rem;font-weight:800;color:var(--primary);margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em">Nueva Licitación Comercial</div>
      <label class="lbl">Compañía AMSA</label>
      <select id="fac_co_${id}">
        <option value="">Seleccionar...</option>
        ${AMSA_EMPRESAS.map(e=>`<option value="${e}">Minera ${e}</option>`).join('')}
      </select>
      <label class="lbl">Proveedor comunitario</label>
      <input type="text" id="fac_prov_${id}" value="${esc(p?p.nombre_fantasia||p.razon_social||p.nombre_contacto:'')}" readonly style="background:#f5f5f5;cursor:default">
      <label class="lbl">Servicio / Rubro</label>
      <input type="text" id="fac_serv_${id}" value="${esc(p?(p.giros||[]).join(', '):'')}" placeholder="Servicio prestado">
      <label class="lbl">Área AMSA asignada</label>
      <input type="text" id="fac_area_${id}" placeholder="Ej: Operaciones, RRHH, Logística...">
      <label class="lbl">ADC — Administrador de Contrato</label>
      <input type="text" id="fac_adc_${id}" placeholder="Nombre del administrador">
      <label class="lbl">N° Orden de Servicio</label>
      <input type="text" id="fac_os_${id}" placeholder="Ej: OS-2025-00123">
      <div class="form-grid-2" style="margin-top:4px">
        <div>
          <label class="lbl">Monto adjudicado CLP</label>
          <input type="number" min="0" id="fac_mclp_${id}" placeholder="0" oninput="calcAcUsd('${id}')">
        </div>
        <div>
          <label class="lbl">Monto USD (auto)</label>
          <input type="text" id="fac_musd_${id}" placeholder="Calculado..." readonly style="background:#f5f5f5">
        </div>
      </div>
      <div class="form-grid-3" style="margin-top:4px">
        <div>
          <label class="lbl">Período</label>
          <input type="text" id="fac_periodo_${id}" placeholder="Ej: Anual, 6 meses...">
        </div>
        <div>
          <label class="lbl">Fecha inicio</label>
          <input type="date" id="fac_inicio_${id}">
        </div>
        <div>
          <label class="lbl">Fecha término</label>
          <input type="date" id="fac_fin_${id}">
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button onclick="guardarAcuerdo('${id}')" style="flex:1;padding:9px;background:var(--primary);color:#fff;border:none;border-radius:7px;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer">GUARDAR ACUERDO</button>
        <button onclick="toggleFormAc('${id}')" style="padding:9px 14px;border:1.5px solid var(--border);background:#fff;border-radius:7px;font-size:.82rem;cursor:pointer;color:var(--text-muted)">Cancelar</button>
      </div>
    </div>
    ${acs.length===0?'<div class="sin-visitas">Sin licitaciones comerciales registrados.</div>':''}
    ${acs.map(ac=>{
      const dias=diasRestantes(ac.fecha_fin);
      const cls=acDiasClass(dias);
      const t2=getTarifas();
      return `<div class="ac-card ${cls==='warn'||cls==='danger'?'vence-pronto':cls==='vencido'?'vencido':''}">
        <button class="visita-del" onclick="borrarAcuerdo('${id}','${ac.id}')">✕</button>
        <div class="ac-compania">Minera ${esc(ac.compania)}</div>
        <div class="ac-servicio">${esc(ac.servicio||'Sin servicio especificado')}</div>
        ${ac.licitacion_id?`<div class="ac-de-lic">🏆 Viene de la licitación: ${esc(((DB.licitaciones[id]||[]).find(x=>x.id===ac.licitacion_id)||{}).nombre||'proceso adjudicado')}</div>`:''}
        <div class="ac-grid">
          <div class="ac-field"><strong>Proveedor:</strong> ${esc(ac.proveedor)}</div>
          <div class="ac-field"><strong>Área:</strong> ${esc(ac.area||'—')}</div>
          <div class="ac-field"><strong>ADC:</strong> ${esc(ac.adc||'—')}</div>
          <div class="ac-field"><strong>OS:</strong> ${esc(ac.os||'—')}</div>
        </div>
        <div class="ac-monto-row">
          <div class="ac-monto-clp">${ac.monto_clp?fmtClp(ac.monto_clp):'Sin monto'}</div>
          ${ac.monto_clp?`<div class="ac-monto-usd">${fmtUsd(ac.monto_clp/t2.tc)}</div>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px">
          ${ac.periodo?`<span style="font-size:.74rem;color:var(--text-muted)">📅 ${esc(ac.periodo)}</span>`:''}
          ${ac.fecha_inicio?`<span style="font-size:.74rem;color:var(--text-muted)">${ac.fecha_inicio}${ac.fecha_fin?' → '+ac.fecha_fin:''}</span>`:''}
          <span class="ac-dias ${cls}">${acDiasLabel(dias)}</span>
        </div>
        ${ac.descripcion_servicio?`<div style="font-size:.78rem;color:var(--text-muted);margin-top:5px">📝 ${esc(ac.descripcion_servicio)}</div>`:''}
        ${(ac.foto1_url||ac.foto2_url||ac.foto3_url)?`<div style="display:flex;gap:6px;margin-top:6px">${['foto1_url','foto2_url','foto3_url'].filter(k=>ac[k]).map(k=>`<a href="javascript:void(0)" data-firmar-link="${ac[k]}" onclick="return abrirFirmado(this)"><img data-firmar="${ac[k]}" style="width:54px;height:42px;object-fit:cover;border-radius:5px"></a>`).join('')}</div>`:''}
        ${(()=>{ LIC_CTX.pid='${id}'; return moliBadgeHTML(ac.id); })()}
        <div class="lic-mini-actions">
          <button class="mini-btn" style="width:auto;padding:4px 10px" onclick="editarLicitacion('${id}','${ac.id}')">✏ Editar</button>
          ${ac.pdf_url?`<a class="mini-btn" style="width:auto;padding:4px 10px" href="javascript:void(0)" data-firmar-link="${ac.pdf_url}" onclick="return abrirFirmado(this)">📄 PDF</a>`:''}
          <button class="mini-btn" style="width:auto;padding:4px 10px" onclick="vincularVisitasLic('${id}','${ac.id}')">🔗 Visitas${(ac.visitas_json&&ac.visitas_json.length)?' ('+ac.visitas_json.length+')':''}</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
  acAplicarPrellenado(id);
}

function toggleFormAc(id){
  const f=document.getElementById('fac_'+id);
  if(f){ f.classList.toggle('open'); }
}
function calcAcUsd(id){
  const clp=parseInt(document.getElementById('fac_mclp_'+id)?.value)||0;
  const t=getTarifas();
  const el=document.getElementById('fac_musd_'+id);
  if(el) el.value=clp>0?fmtUsd(clp/t.tc):'';
}
async function guardarAcuerdo(id){
  const co=document.getElementById('fac_co_'+id)?.value||'';
  if(!co){showToast('Selecciona la compañía AMSA','err');return;}
  const p=PROVEEDORES.find(x=>x._id===id);
  const ac={
    id:uid(),
    compania:co,
    proveedor:document.getElementById('fac_prov_'+id)?.value||'',
    servicio:document.getElementById('fac_serv_'+id)?.value||'',
    area:document.getElementById('fac_area_'+id)?.value||'',
    adc:document.getElementById('fac_adc_'+id)?.value||'',
    os:document.getElementById('fac_os_'+id)?.value||'',
    monto_clp:parseInt(document.getElementById('fac_mclp_'+id)?.value)||0,
    periodo:document.getElementById('fac_periodo_'+id)?.value||'',
    fecha_inicio:document.getElementById('fac_inicio_'+id)?.value||'',
    fecha_fin:document.getElementById('fac_fin_'+id)?.value||'',
    localidad:p?.localidad||'',
    rubro:(p?.giros||[])[0]||'',
    anio:(document.getElementById('fac_inicio_'+id)?.value||'').slice(0,4),
    descripcion_servicio:'', usd_manual:null, pdf_url:'', foto1_url:'', foto2_url:'', foto3_url:'', visitas_json:[],
    created_by:miNombre(),
    prov_id:id,
    licitacion_id:(AC_PRE&&AC_PRE.pid===id)?AC_PRE.licitacion_id:'',
  };
  if(!DB.acuerdos[id]) DB.acuerdos[id]=[];
  DB.acuerdos[id].push(ac);
  await saveDB();
  if(AC_PRE&&AC_PRE.pid===id) AC_PRE=null;
  const av=document.getElementById('acPreAviso'); if(av) av.remove();
  toggleFormAc(id);
  renderAcuerdos(id);
  actualizarBadgeAcuerdos();
  showToast(ac.licitacion_id?'✅ Contrato guardado y vinculado a la licitación':'✅ Contrato guardado','success');
  await licPushSupabase(id, ac);
}
async function borrarAcuerdo(pid,aid){
  if(!confirm('¿Eliminar este acuerdo?')) return;
  DB.acuerdos[pid]=(DB.acuerdos[pid]||[]).filter(a=>a.id!==aid);
  await saveDB();
  renderAcuerdos(pid);
  actualizarBadgeAcuerdos();
}
function actualizarBadgeAcuerdos(){
  const total=Object.values(DB.acuerdos).flat().filter(a=>{
    const d=diasRestantes(a.fecha_fin); return d===null||d>=0;
  }).length;
  const badge=document.getElementById('badgeAcuerdos');
  if(badge) badge.textContent=total>0?`${total} activos`:'—';
}


// ── CONTRATOS HOTELEROS AMSA COMO ACUERDOS ───────────────────────────────
function getHotelesComoAcuerdos(){
  const items=[];
  PROVEEDORES.forEach(p=>{
    if(!esRubroHotel(p)) return;
    const h=DB.hoteles[p._id]||{simples:0,dobles:0,contratos:[]};
    (h.contratos||[]).forEach(ct=>{
      if(!AMSA_EMPRESAS.includes(ct.amsa)) return;
      const dias=diasEntreFechas(ct.desde,ct.hasta);
      const monto=ctMonto(ct,dias);
      const camas=ctCamas(ct);
      const s=ctSimples(ct), d=ctDobles(ct);
      const detalle=[s?s+' simple'+(s>1?'s':''):'', d?d+' doble'+(d>1?'s':''):''].filter(Boolean).join(' + ');
      items.push({
        id:'hotel_'+ct.id, compania:ct.amsa,
        proveedor:p.nombre_fantasia||p.razon_social||p.nombre_contacto,
        prov_id:p._id, prov:p,
        servicio:'Hospedaje · '+detalle+' · '+camas+' camas',
        rubro:'Hospedaje / Alojamiento', localidad:p.localidad||'',
        area:'', adc:'', os:'',
        monto_clp:monto, periodo:dias+' días',
        fecha_inicio:ct.desde||'', fecha_fin:ct.hasta||'',
        _esHotelero:true, _contratoId:ct.id,
        _habs:ctHabs(ct), _camas:camas,
      });
    });
  });
  return items;
}

function toggleHotelAc(){
  DB._inclHotel = !(DB._inclHotel ?? true);
  renderAcuerdosDash();
}
// ── DASHBOARD ACUERDOS ─────────────────────────────────────────────────────
function renderAcuerdosDash(){
  const el=document.getElementById('acuerdosDashContent');
  if(!el) return;
  const _focusProv=document.activeElement&&document.activeElement.id==='adf_prov';
  const _curProv=document.getElementById('adf_prov')?.value||'';
  const t=getTarifas();
  const inclHotel=DB._inclHotel ?? true;
  const acFormal=Object.entries(DB.acuerdos).flatMap(([pid,acs])=>acs.map(a=>({...a,prov:PROVEEDORES.find(x=>x._id===pid),_esHotelero:false})));
  const hotelesAc=inclHotel?getHotelesComoAcuerdos():[];
  const todos=[...acFormal,...hotelesAc];

  const fComp=document.getElementById('adf_comp')?.value||'';
  const fLoc=document.getElementById('adf_loc')?.value||'';
  const fRubro=document.getElementById('adf_rub')?.value||'';
  const fVig=document.getElementById('adf_vig')?.value||'';
  const fTipo=document.getElementById('adf_tipo')?.value||'';
  const fProv=(document.getElementById('adf_prov')?.value||'').toLowerCase().trim();
  const fAnio=document.getElementById('adf_anio')?.value||'';

  let filtrados=todos.filter(a=>!a.completado);
  const completados=todos.filter(a=>a.completado);
  if(fProv) filtrados=filtrados.filter(a=>{const nm=(a.proveedor||(a.prov&&dispName(a.prov))||'').toLowerCase(); return nm.includes(fProv);});
  if(fAnio) filtrados=filtrados.filter(a=>{const y=(a.anio||(a.fecha_inicio||'').slice(0,4)); return y===fAnio;});
  if(fComp)  filtrados=filtrados.filter(a=>a.compania===fComp);
  if(fLoc)   filtrados=filtrados.filter(a=>a.localidad===fLoc);
  if(fRubro) filtrados=filtrados.filter(a=>a.rubro===fRubro||a.servicio.toLowerCase().includes(fRubro.toLowerCase()));
  if(fTipo==='formal')   filtrados=filtrados.filter(a=>!a._esHotelero);
  if(fTipo==='hotelero') filtrados=filtrados.filter(a=>a._esHotelero);
  if(fVig==='vigente') filtrados=filtrados.filter(a=>{const d=diasRestantes(a.fecha_fin);return d===null||d>=0;});
  if(fVig==='vencer')  filtrados=filtrados.filter(a=>{const d=diasRestantes(a.fecha_fin);return d!==null&&d>=0&&d<=90;});
  if(fVig==='vencido') filtrados=filtrados.filter(a=>{const d=diasRestantes(a.fecha_fin);return d!==null&&d<0;});

  // MOLI agregado de las licitaciones filtradas
  let moliTot=0,moliMuj=0,moliHom=0;
  filtrados.forEach(a=>{ const b=MOLI_CACHE[a.id]; if(Array.isArray(b)){ moliTot+=b.length; moliMuj+=b.filter(x=>x.sexo==='Mujer').length; moliHom+=b.filter(x=>x.sexo==='Hombre').length; } });
  const montoFormal=filtrados.filter(a=>!a._esHotelero).reduce((s,a)=>s+(a.monto_clp||0),0);
  const montoHotel=filtrados.filter(a=>a._esHotelero).reduce((s,a)=>s+(a.monto_clp||0),0);
  const totalMonto=montoFormal+montoHotel;
  const nHotelFiltrado=filtrados.filter(a=>a._esHotelero).length;
  const activos=filtrados.filter(a=>{const d=diasRestantes(a.fecha_fin);return d===null||d>=0;}).length;
  const porVencer=filtrados.filter(a=>{const d=diasRestantes(a.fecha_fin);return d!==null&&d>=0&&d<=90;}).length;
  const vencidos=filtrados.filter(a=>{const d=diasRestantes(a.fecha_fin);return d!==null&&d<0;}).length;

  // Opciones para filtros (universo completo incl. hoteleros)
  const _universo=[...acFormal,...getHotelesComoAcuerdos()];
  const allComps=[...new Set(_universo.map(a=>a.compania).filter(Boolean))].sort();
  const allLocs=[...new Set(_universo.map(a=>a.localidad).filter(Boolean))].sort();
  const allRubros=[...new Set(_universo.map(a=>a.rubro).filter(Boolean))].sort();

  el.innerHTML=`
    <div class="dash-title">Licitaciones Comerciales AMSA</div>
    <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px 18px;margin-bottom:16px">
      <div class="tarifas-title">Tipo de cambio para cálculo USD</div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div class="tarifa-field">
          <label>Tipo de cambio (CLP/USD)</label>
          <input type="number" id="tar_tc" value="${t.tc}" style="width:100px" oninput="guardarTarifas();actualizarUSD()"><button onclick="editarDolarHoy()" style="margin-left:6px;background:linear-gradient(135deg,#00A399,#006973);color:#fff;border:none;border-radius:6px;padding:5px 11px;font-size:.78rem;cursor:pointer;font-weight:700">💲 Valor de hoy</button>
        </div>
        <div class="tarifa-field">
          <label>Hab. Simple CLP/noche</label>
          <input type="number" id="tar_simple" value="${t.simple_clp}" style="width:110px" oninput="guardarTarifas()">
          <div class="tarifa-usd" id="tar_usd_simple">${fmtUsd(t.simple_clp/t.tc)}/noche</div>
        </div>
        <div class="tarifa-field">
          <label>Hab. Doble CLP/noche</label>
          <input type="number" id="tar_doble" value="${t.doble_clp}" style="width:110px" oninput="guardarTarifas()">
          <div class="tarifa-usd" id="tar_usd_doble">${fmtUsd(t.doble_clp/t.tc)}/noche</div>
        </div>
      </div>
    </div>
    <div class="toggle-hotel-wrap ${inclHotel?'on':''}" onclick="toggleHotelAc()">
      <div class="tog-sw ${inclHotel?'on':''}"></div>
      <div>
        <div style="font-size:.82rem;font-weight:700;color:var(--text)">Incluir contratos de hospedaje AMSA</div>
        <div style="font-size:.72rem;color:var(--text-muted)">
          ${hotelesAc.length>0?hotelesAc.length+' contrato(s) hotelero(s) AMSA · '+fmtClp(hotelesAc.reduce((s,a)=>s+a.monto_clp,0)):'Sin contratos hoteleros AMSA aún'}
        </div>
      </div>
      ${montoHotel>0&&inclHotel?`<span class="hotel-ac-badge">&#127976; ${fmtClp(montoHotel)}</span>`:''}
    </div>
    <div class="ac-filter-bar">
      <select class="ac-filter-select" id="adf_comp" onchange="renderAcuerdosDash()">
        <option value="">Todas las compañías</option>
        ${allComps.map(c=>`<option value="${c}" ${fComp===c?'selected':''}>${c}</option>`).join('')}
      </select>
      <input class="ac-filter-select" id="adf_prov" value="${esc(fProv)}" oninput="renderAcuerdosDash()" placeholder="🔍 Nombre proveedor" style="min-width:170px">
      <select class="ac-filter-select" id="adf_anio" onchange="renderAcuerdosDash()">
        <option value="">Todos los años</option>
        ${[...new Set(todos.map(a=>a.anio||(a.fecha_inicio||'').slice(0,4)).filter(Boolean))].sort().reverse().map(y=>`<option value="${y}" ${fAnio===y?'selected':''}>${y}</option>`).join('')}
      </select>
      <select class="ac-filter-select" id="adf_loc" onchange="renderAcuerdosDash()">
        <option value="">Todas las localidades</option>
        ${allLocs.map(l=>`<option value="${l}" ${fLoc===l?'selected':''}>${l}</option>`).join('')}
      </select>
      <select class="ac-filter-select" id="adf_rub" onchange="renderAcuerdosDash()">
        <option value="">Todos los rubros</option>
        ${allRubros.map(r=>`<option value="${r}" ${fRubro===r?'selected':''}>${r}</option>`).join('')}
      </select>
      <select class="ac-filter-select" id="adf_vig" onchange="renderAcuerdosDash()">
        <option value="">Todos los estados</option>
        <option value="vigente" ${fVig==='vigente'?'selected':''}>Vigentes</option>
        <option value="vencer" ${fVig==='vencer'?'selected':''}>Por vencer ≤90 días</option>
        <option value="vencido" ${fVig==='vencido'?'selected':''}>Vencidos</option>
      </select>
      <select class="ac-filter-select" id="adf_tipo" onchange="renderAcuerdosDash()">
        <option value="">Licitaciones + Hospedaje</option>
        <option value="formal" ${fTipo==='formal'?'selected':''}>Solo acuerdos formales</option>
        <option value="hotelero" ${fTipo==='hotelero'?'selected':''}>Solo hospedajes AMSA</option>
      </select>
      <button onclick="document.querySelectorAll('.ac-filter-select').forEach(s=>s.value='');renderAcuerdosDash()" style="padding:6px 12px;border:1px solid var(--border);background:#fff;border-radius:7px;font-size:.8rem;cursor:pointer;color:var(--text-muted)">✕ Limpiar filtros</button>
    </div>
    <div class="ac-kpi-grid">
      <div class="ac-kpi">
        <div class="ac-kpi-num">${filtrados.length}</div>
        <div class="ac-kpi-label">Total ítems</div>
        ${nHotelFiltrado>0?`<div class="kpi-sub">${filtrados.length-nHotelFiltrado} acuerdos + ${nHotelFiltrado} hosp.</div>`:''}
      </div>
      <div class="ac-kpi"><div class="ac-kpi-num" style="color:var(--green)">${activos}</div><div class="ac-kpi-label">Vigentes</div></div>
      <div class="ac-kpi"><div class="ac-kpi-num" style="color:var(--orange)">${porVencer}</div><div class="ac-kpi-label">Por vencer ≤90d</div></div>
      <div class="ac-kpi">
        <div class="ac-kpi-num">${fmtClp(totalMonto).replace('$','')}</div>
        <div class="ac-kpi-label">Monto CLP total</div>
        ${montoHotel>0&&inclHotel?`<div class="kpi-sub">incl. ${fmtClp(montoHotel)} hosp.</div>`:''}
      </div>
      <div class="ac-kpi" style="background:linear-gradient(135deg,#FFF8EC,#fff)">
        <div class="ac-kpi-num" style="color:#b8780a">${moliTot}</div>
        <div class="ac-kpi-label">👷 MOLI beneficiados</div>
        <div class="kpi-sub">♀ ${moliMuj} mujeres · ♂ ${moliHom} hombres</div>
      </div>
    </div>
    ${porVencer>0?`<div style="background:#fff4e0;border:1px solid #f0c070;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:.83rem;color:var(--orange);font-weight:600">
      ⚠️ ${porVencer} acuerdo(s) vencen en los próximos 90 días — evaluar renovación
    </div>`:''}
    <div class="dash-grid">
      <div class="dash-card">
        <div class="dash-card-title">Por Compañía AMSA</div>
        ${AMSA_EMPRESAS.map(co=>{
          const acs=filtrados.filter(a=>a.compania===co);
          if(!acs.length) return '';
          const monto=acs.reduce((s,a)=>s+(a.monto_clp||0),0);
          const pct=totalMonto>0?Math.round(monto/totalMonto*100):0;
          return `<div class="loc-ocu-row">
            <div class="loc-ocu-name" style="cursor:pointer" onclick="document.getElementById('adf_comp').value='${co}';renderAcuerdosDash()">${co}</div>
            <div class="loc-ocu-bar-wrap"><div class="loc-ocu-bar" style="width:${pct}%"></div></div>
            <div class="loc-ocu-pct">${acs.length}</div>
            <div class="loc-ocu-habs">${fmtClp(monto)}</div>
          </div>`;
        }).join('')}
        ${filtrados.length===0?'<div style="color:var(--text-muted);font-size:.83rem;text-align:center;padding:14px">Sin licitaciones para mostrar</div>':''}
      </div>
      <div class="dash-card">
        <div class="dash-card-title">Por Localidad</div>
        ${allLocs.map(loc=>{
          const acs=filtrados.filter(a=>a.localidad===loc);
          if(!acs.length) return '';
          const monto=acs.reduce((s,a)=>s+(a.monto_clp||0),0);
          const pct=totalMonto>0?Math.round(monto/totalMonto*100):0;
          return `<div class="loc-ocu-row">
            <div class="loc-ocu-name" style="cursor:pointer" onclick="document.getElementById('adf_loc').value='${loc}';renderAcuerdosDash()">${loc}</div>
            <div class="loc-ocu-bar-wrap"><div class="loc-ocu-bar" style="width:${pct}%"></div></div>
            <div class="loc-ocu-pct">${acs.length}</div>
            <div class="loc-ocu-habs">${fmtClp(monto)}</div>
          </div>`;
        }).join('')}
        ${allLocs.filter(l=>filtrados.some(a=>a.localidad===l)).length===0?'<div style="color:var(--text-muted);font-size:.83rem;text-align:center;padding:14px">Sin datos</div>':''}
      </div>
    </div>
    ${filtrados.length>0?`
    <div class="dash-card" style="margin-bottom:16px">
      <div class="dash-card-title">Detalle de Licitaciones${fComp||fLoc||fRubro?` — filtrado`:''}  <span style="font-size:.75rem;font-weight:400">${filtrados.length} resultados · ${fmtClp(totalMonto)} total</span></div>
      <div style="overflow-x:auto">
      <table class="ac-table">
        <thead><tr>
          <th>Compañía</th><th>Proveedor</th><th>Servicio</th><th>Localidad</th>
          <th>ADC</th><th>OS</th><th>Monto CLP</th><th>Inicio</th><th>Término</th><th>Estado</th>
        </tr></thead>
        <tbody>
        ${filtrados.map(a=>{
          const dias=diasRestantes(a.fecha_fin);
          const cls=acDiasClass(dias);
          const destTab=a._esHotelero?'hoteleria':'acuerdos';
          return `<tr class="${a._esHotelero?'hotel-ac-row':''}">
            <td><span class="amsa-badge">Minera ${esc(a.compania)}</span></td>
            <td style="cursor:pointer;color:var(--primary)" onclick="abrirDesde('${a.prov_id}','${destTab}')">
              ${a._esHotelero?'<span class="hotel-ac-badge">&#127976; Hospedaje</span>':''}
              ${esc(a.proveedor)}
            </td>
            <td>${esc(a.servicio||'—')}</td>
            <td>${esc(a.localidad||'—')}</td>
            <td>${a._esHotelero?`<span style="font-size:.78rem;color:var(--text-muted)">${a._habs} hab · ${a._camas} camas</span>`:esc(a.adc||'—')}</td>
            <td style="font-family:'Barlow Condensed',sans-serif;font-weight:700">${a._esHotelero?`<span style="font-size:.76rem;color:var(--text-muted)">${esc(a.periodo||'—')}</span>`:esc(a.os||'—')}</td>
            <td style="font-weight:700;color:var(--green)">${a.monto_clp?fmtClp(a.monto_clp):'—'}</td>
            <td>${a.fecha_inicio||'—'}</td>
            <td>${a.fecha_fin||'—'}</td>
            <td><span class="vence-chip ${cls}">${acDiasLabel(dias)}</span>
              ${!a._esHotelero?`<button onclick="completarAcuerdo('${a.prov_id}','${a.id}')" title="Marcar realizado" style="margin-left:5px;border:1px solid #9ad9b8;background:#E4F6EF;color:#0f7a3d;border-radius:5px;padding:2px 7px;font-size:.72rem;cursor:pointer">✓</button>`:''}
            </td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      </div>
    </div>`:''}
    ${renderAcuerdosCompletados(completados)}`;

  if(_focusProv){ const ip=document.getElementById('adf_prov'); if(ip){ ip.focus(); ip.value=_curProv; ip.setSelectionRange(_curProv.length,_curProv.length); } }
}
function renderProgramasModal(id){
  const el=document.getElementById('programasPane_'+id);
  if(!el) return;
  const p=PROVEEDORES.find(x=>x._id===id);
  const entries=DB.programas[id]||[];
  el.innerHTML=`<div style="padding:4px 0 0">
    <button class="btn-add-prog" onclick="toggleFormProg('${id}')">+ Asignar Programa / Iniciativa</button>
    <div class="form-prog" id="fprog_${id}">
      <div style="font-size:.79rem;font-weight:800;color:#5b4fcf;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">Asignar Programa</div>
      <div class="prog-selector">
        ${PROGRAMAS_LIST.map(pr=>{
          const ya=entries.find(e=>e.nombre===pr);
          return `<div class="prog-opt ${ya?'sel':''}" onclick="toggleProgOpt(this,'${id}','${pr.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">&#10003; ${pr}</div>`;
        }).join('')}
      </div>
      <div style="font-size:.77rem;font-weight:700;color:#5b4fcf;margin:10px 0 6px;text-transform:uppercase">Fechas del programa seleccionado</div>
      <div id="fprog_dates_${id}" style="display:none">
        <div style="font-size:.81rem;font-weight:600;color:var(--text);margin-bottom:6px" id="fprog_nombre_${id}"></div>
        <div id="fprog_ctx_${id}" style="display:none;font-size:.78rem;color:var(--text-muted);background:#f4f3fb;border-radius:7px;padding:8px 10px;margin-bottom:8px;line-height:1.5"></div>
        <div style="font-size:.72rem;color:#5b4fcf;margin-bottom:6px">📅 Fechas precargadas del programa — puedes ajustarlas para este proveedor</div>
        <div class="prog-dates">
          <div><label>Fecha inicio</label><input type="date" id="fprog_ini_${id}"></div>
          <div><label>Fecha t\u00e9rmino</label><input type="date" id="fprog_fin_${id}"></div>
        </div>
        <button onclick="guardarPrograma('${id}')" style="margin-top:10px;width:100%;padding:9px;background:#5b4fcf;color:#fff;border:none;border-radius:7px;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer">GUARDAR</button>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button onclick="guardarPrograma('${id}')" style="flex:1;padding:8px;background:#5b4fcf;color:#fff;border:none;border-radius:7px;font-family:'Barlow Condensed',sans-serif;font-size:.84rem;font-weight:700;cursor:pointer" id="fprog_save_${id}">GUARDAR SELECCIONADOS</button>
        <button onclick="toggleFormProg('${id}')" style="padding:8px 13px;border:1.5px solid var(--border);background:#fff;border-radius:7px;font-size:.82rem;cursor:pointer;color:var(--text-muted)">Cancelar</button>
      </div>
    </div>
    ${entries.length===0?'<div class="sin-visitas">Sin programas asignados.</div>':''}
    ${entries.map(e=>{
      const hoy=new Date(); const fin=e.fin?new Date(e.fin):null;
      const activo=!fin||fin>=hoy;
      return `<div class="prog-entry">
        <button class="prog-entry-del" onclick="borrarPrograma('${id}','${e.id}')">&#10005;</button>
        <div class="prog-entry-name">${e.nombre}</div>
        <div class="prog-entry-meta">
          ${e.inicio||e.fin?'&#128197; '+(e.inicio||'?')+' \u2192 '+(e.fin||'indefinido'):''}
          <span class="prog-chip ${activo?'activo':'inactivo'}" style="font-size:.68rem;padding:1px 7px;margin-left:4px">
            ${activo?'Activo':'Finalizado'}
          </span>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

let _progSelActual={};
function toggleFormProg(id){
  const f=document.getElementById('fprog_'+id);
  if(f) f.classList.toggle('open');
  _progSelActual[id]=null;
}
function toggleProgOpt(el,id,nombre){
  // Si ya tiene entrada guardada, no permitir doble seleccion
  const entries=DB.programas[id]||[];
  el.classList.toggle('sel');
  if(el.classList.contains('sel')){
    _progSelActual[id]=nombre;
    const datesEl=document.getElementById('fprog_dates_'+id);
    const nomEl=document.getElementById('fprog_nombre_'+id);
    if(datesEl){datesEl.style.display='block';}
    if(nomEl) nomEl.textContent=nombre;
    const entry=entries.find(e=>e.nombre===nombre);
    const cat=PROGRAMAS_CAT.find(c=>c.titulo===nombre);
    const iniEl=document.getElementById('fprog_ini_'+id);
    const finEl=document.getElementById('fprog_fin_'+id);
    // Precargar con las fechas ya asignadas; si es nueva asignación, usar las del programa
    if(iniEl) iniEl.value = entry?.inicio || (cat&&cat.fecha_inicio) || '';
    if(finEl) finEl.value = entry?.fin || (cat&&cat.fecha_fin) || '';
    // Mostrar contexto del programa como ayuda
    const ctxEl=document.getElementById('fprog_ctx_'+id);
    if(ctxEl){ ctxEl.textContent = cat&&cat.contexto ? cat.contexto : ''; ctxEl.style.display = (cat&&cat.contexto)?'block':'none'; }
  } else {
    _progSelActual[id]=null;
    const datesEl=document.getElementById('fprog_dates_'+id);
    if(datesEl) datesEl.style.display='none';
  }
}
async function guardarPrograma(id){
  if(!requireSession()) return;
  const el=document.getElementById('fprog_'+id);
  const selOpts=[...el.querySelectorAll('.prog-opt.sel')];
  if(selOpts.length===0){showToast('Selecciona al menos un programa','err');return;}
  const ini=document.getElementById('fprog_ini_'+id)?.value||'';
  const fin=document.getElementById('fprog_fin_'+id)?.value||'';
  if(!DB.programas[id]) DB.programas[id]=[];
  selOpts.forEach(opt=>{
    const nombre=opt.textContent.replace(/^\u2713\s*/,'').trim();
    const cat=PROGRAMAS_CAT.find(c=>c.titulo===nombre);
    const existing=DB.programas[id].find(e=>e.nombre===nombre);
    if(existing){ existing.inicio=ini||existing.inicio||(cat&&cat.fecha_inicio)||''; existing.fin=fin||existing.fin||(cat&&cat.fecha_fin)||''; existing.programa_cat_id=cat?cat.programa_cat_id:existing.programa_cat_id; }
    else{ DB.programas[id].push({id:uid(),nombre,inicio:ini||(cat&&cat.fecha_inicio)||'',fin:fin||(cat&&cat.fecha_fin)||'',activo:true,programa_cat_id:cat?cat.programa_cat_id:null}); }
  });
  await saveDB();
  toggleFormProg(id);
  renderProgramasModal(id);
  actualizarBadgeProgramas();
  showToast('✅ Programa asignado al proveedor','success');
  await gSyncPush(id);
}
async function borrarPrograma(pid,eid){
  if(!confirm('\u00bfQuitar este programa del proveedor?')) return;
  DB.programas[pid]=(DB.programas[pid]||[]).filter(e=>e.id!==eid);
  await saveDB();
  await gSyncPush(pid);
  renderProgramasModal(pid);
  actualizarBadgeProgramas();
}
function actualizarBadgeProgramas(){
  const total=Object.values(DB.programas).flat().filter(e=>{
    const fin=e.fin?new Date(e.fin):null;
    return !fin||fin>=new Date();
  }).length;
  const badge=document.getElementById('badgeProgramas');
  if(badge) badge.textContent=total>0?total+'':'—';
}

// ── DASHBOARD PROGRAMAS ────────────────────────────────────────────────────
function renderProgramasDash(){
  const el=document.getElementById('programasDashContent');
  if(!el) return;
  if(!PROGRAMAS_CAT.length && SUPA.session && !window._progCatTried){ window._progCatTried=true; cargarProgramasCatalogo().then(()=>renderProgramasDash()); }
  // Catálogo de programas (crear/editar) — encabezado
  const _catHead=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px">
    <div style="font-family:'Barlow Condensed',sans-serif;font-size:1.3rem;font-weight:800;color:#5b4fcf;text-transform:uppercase">📋 Programas / Iniciativas</div>
    <button class="kb-add" style="background:linear-gradient(135deg,#5b4fcf,#4338ca)" onclick="abrirNuevoPrograma()">➕ Nuevo programa</button>
  </div>`+catalogoProgramasHTML();

  const fProg=document.getElementById('pdf_prog')?.value||'';
  const fLoc=document.getElementById('pdf_loc')?.value||'';
  const fRubro=document.getElementById('pdf_rub')?.value||'';
  const fVig=document.getElementById('pdf_vig')?.value||'';

  // Construir lista plana de asignaciones
  const asign=Object.entries(DB.programas).flatMap(([pid,progs])=>{
    const p=PROVEEDORES.find(x=>x._id===pid);
    if(!p) return [];
    return progs.map(e=>({...e,prov:p,pid}));
  });

  let filtrados=asign;
  if(fProg)  filtrados=filtrados.filter(a=>a.nombre===fProg);
  if(fLoc)   filtrados=filtrados.filter(a=>a.prov.localidad===fLoc);
  if(fRubro) filtrados=filtrados.filter(a=>(a.prov.giros||[]).some(g=>g.toLowerCase().includes(fRubro.toLowerCase())));
  if(fVig==='activo')   filtrados=filtrados.filter(a=>{const f=a.fin?new Date(a.fin):null;return !f||f>=new Date();});
  if(fVig==='finalizado') filtrados=filtrados.filter(a=>{const f=a.fin?new Date(a.fin):null;return f&&f<new Date();});

  const hoy=new Date();
  const activos=filtrados.filter(a=>{const f=a.fin?new Date(a.fin):null;return !f||f>=hoy;}).length;
  const nProvs=[...new Set(filtrados.map(a=>a.pid))].length;
  const nProgs=[...new Set(filtrados.map(a=>a.nombre))].length;

  // Conteos por programa
  const porProg={};
  filtrados.forEach(a=>{ porProg[a.nombre]=(porProg[a.nombre]||0)+1; });
  const maxProg=Math.max(1,...Object.values(porProg));

  // Conteos por localidad
  const porLoc={};
  filtrados.forEach(a=>{ const l=a.prov.localidad||'Sin localidad'; porLoc[l]=(porLoc[l]||0)+1; });
  const maxLoc=Math.max(1,...Object.values(porLoc));

  // Opciones filtros (universo completo)
  const allProgs=[...new Set(asign.map(a=>a.nombre))].sort();
  const allLocs=[...new Set(PROVEEDORES.map(p=>p.localidad).filter(Boolean))].sort();
  const allRubros=[...new Set(PROVEEDORES.flatMap(p=>p.giros||[]).filter(Boolean))].sort();

  el.innerHTML=`${_catHead}
    <!-- KPIs -->
    <div class="prog-kpi-grid">
      <div class="prog-kpi"><div class="prog-kpi-num">${filtrados.length}</div><div class="prog-kpi-label">Asignaciones</div></div>
      <div class="prog-kpi"><div class="prog-kpi-num" style="color:var(--green)">${activos}</div><div class="prog-kpi-label">Activas</div></div>
      <div class="prog-kpi"><div class="prog-kpi-num">${nProvs}</div><div class="prog-kpi-label">Proveedores</div></div>
      <div class="prog-kpi"><div class="prog-kpi-num">${nProgs}</div><div class="prog-kpi-label">Programas distintos</div></div>
    </div>

    <!-- Filtros -->
    <div class="prog-filter-bar">
      <select class="prog-filter-sel" id="pdf_prog" onchange="renderProgramasDash()">
        <option value="">Todos los programas</option>
        ${allProgs.map(pr=>`<option value="${pr}" ${fProg===pr?'selected':''}>${pr}</option>`).join('')}
      </select>
      <select class="prog-filter-sel" id="pdf_loc" onchange="renderProgramasDash()">
        <option value="">Todas las localidades</option>
        ${allLocs.map(l=>`<option value="${l}" ${fLoc===l?'selected':''}>${l}</option>`).join('')}
      </select>
      <select class="prog-filter-sel" id="pdf_rub" onchange="renderProgramasDash()">
        <option value="">Todos los rubros</option>
        ${allRubros.map(r=>`<option value="${r}" ${fRubro===r?'selected':''}>${r}</option>`).join('')}
      </select>
      <select class="prog-filter-sel" id="pdf_vig" onchange="renderProgramasDash()">
        <option value="">Todos los estados</option>
        <option value="activo" ${fVig==='activo'?'selected':''}>Activos</option>
        <option value="finalizado" ${fVig==='finalizado'?'selected':''}>Finalizados</option>
      </select>
      <button onclick="document.querySelectorAll('.prog-filter-sel').forEach(s=>s.value='');renderProgramasDash()" 
        style="padding:6px 12px;border:1px solid var(--border);background:#fff;border-radius:7px;
        font-size:.8rem;cursor:pointer;color:var(--text-muted)">&#10005; Limpiar</button>
    </div>

    <div class="dash-grid">
      <!-- Por programa -->
      <div class="dash-card">
        <div class="dash-card-title">Participaci\u00f3n por Programa</div>
        ${Object.entries(porProg).sort((a,b)=>b[1]-a[1]).map(([pr,n])=>`
          <div class="prog-bar-row">
            <div class="prog-bar-label" onclick="document.getElementById('pdf_prog').value='${pr}';renderProgramasDash()" title="${pr}">${pr}</div>
            <div class="prog-bar-wrap"><div class="prog-bar-fill" style="width:${Math.round(n/maxProg*100)}%"></div></div>
            <div class="prog-bar-count">${n}</div>
          </div>`
        ).join('')}
        ${Object.keys(porProg).length===0?'<div style="color:var(--text-muted);font-size:.83rem;text-align:center;padding:14px">Sin asignaciones para mostrar</div>':''}
      </div>
      <!-- Por localidad -->
      <div class="dash-card">
        <div class="dash-card-title">Participaci\u00f3n por Localidad</div>
        ${Object.entries(porLoc).sort((a,b)=>b[1]-a[1]).map(([loc,n])=>`
          <div class="prog-bar-row">
            <div class="prog-bar-label" onclick="document.getElementById('pdf_loc').value='${loc}';renderProgramasDash()">${loc}</div>
            <div class="prog-bar-wrap"><div class="prog-bar-fill" style="width:${Math.round(n/maxLoc*100)}%"></div></div>
            <div class="prog-bar-count">${n}</div>
          </div>`
        ).join('')}
        ${Object.keys(porLoc).length===0?'<div style="color:var(--text-muted);font-size:.83rem;text-align:center;padding:14px">Sin datos</div>':''}
      </div>
    </div>

    <!-- Tabla detalle -->
    ${filtrados.length>0?`
    <div class="dash-card" style="margin-bottom:16px">
      <div class="dash-card-title">Detalle de Asignaciones 
        <span style="font-size:.75rem;font-weight:400">${filtrados.length} resultados</span>
      </div>
      <div style="overflow-x:auto">
      <table class="prog-table">
        <thead><tr>
          <th>Proveedor</th><th>Localidad</th><th>Rubro</th>
          <th>Programa</th><th>Inicio</th><th>T\u00e9rmino</th><th>Estado</th>
        </tr></thead>
        <tbody>
        ${filtrados.map(a=>{
          const f=a.fin?new Date(a.fin):null;
          const activo=!f||f>=hoy;
          return `<tr>
            <td style="cursor:pointer;color:var(--primary);font-weight:600" onclick="abrirDesde('${a.pid}','programas')">
              ${esc(a.prov.nombre_fantasia||a.prov.razon_social||a.prov.nombre_contacto)}
            </td>
            <td>${esc(a.prov.localidad||'\u2014')}</td>
            <td>${esc((a.prov.giros||[])[0]||'\u2014')}</td>
            <td><span class="prog-dash-chip">${esc(a.nombre)}</span></td>
            <td>${a.inicio||'\u2014'}</td>
            <td>${a.fin||'\u2014'}</td>
            <td><span class="prog-chip ${activo?'activo':'inactivo'}" style="font-size:.68rem;padding:1px 8px;margin:0">${activo?'Activo':'Finalizado'}</span></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      </div>
    </div>`:''}`;
}

function agregarNuevoProg(){
  const nombre=prompt('Nombre del nuevo programa:');
  if(!nombre||!nombre.trim()) return;
  if(PROGRAMAS_LIST.includes(nombre.trim())){showToast('Ya existe ese programa','err');return;}
  PROGRAMAS_LIST.push(nombre.trim());
  saveDB();
  renderProgramasDash();
  showToast('Programa agregado','success');
}
function eliminarProg(idx){
  if(!confirm('\u00bfEliminar este programa de la lista? No elimina asignaciones ya guardadas.')) return;
  PROGRAMAS_LIST.splice(idx,1);
  saveDB();
  renderProgramasDash();
}

// ── CONTACTOS + NORMFONO (preservados) ──
// ── GESTIÓN DE CONTACTOS ──────────────────────────────────────────────────
function getContactos(pid){ return DB.contactos[pid]||[]; }

function renderContactosInline(pid){
  const cs=getContactos(pid);
  if(cs.length===0) return '<div class="sin-visitas">Sin contactos registrados.</div>';
  return cs.map(c=>`
    <div class="contacto-card ${c.principal?'principal':''}">
      <div class="contacto-actions">
        ${!c.principal?`<button class="contacto-btn" onclick="setPrincipal('${pid}','${c.id}')" title="Marcar como principal">⭐</button>`:''}
        <button class="contacto-btn" onclick="editarContacto('${pid}','${c.id}')" title="Editar">✏</button>
        <button class="contacto-btn del" onclick="eliminarContacto('${pid}','${c.id}')" title="Eliminar">✕</button>
      </div>
      <div class="contacto-nombre">${esc(c.nombre||'Sin nombre')}${c.principal?'<span class="contacto-principal-badge">⭐ Principal</span>':''}</div>
      ${c.cargo?`<div class="contacto-cargo">${esc(c.cargo)}</div>`:''}
      <div class="contacto-info">
        ${c.rut?`<span>🪪 ${esc(c.rut)}</span>`:''}
        ${c.fono?`<span>📞 ${esc(c.fono)}</span>`:''}
        ${c.correo?`<span>✉ <a href="mailto:${esc(c.correo)}">${esc(c.correo)}</a></span>`:''}
      </div>
    </div>
    <div class="form-contacto" id="fedit_${pid}_${c.id}">
      <div style="font-size:.78rem;font-weight:800;color:var(--primary);margin-bottom:10px;text-transform:uppercase;letter-spacing:.04em">Editar Contacto</div>
      <div class="form-contacto-grid">
        <div><label>Nombre completo</label><input id="fe_nombre_${pid}_${c.id}" value="${esc(c.nombre)}"></div>
        <div><label>Cargo / Rol</label><input id="fe_cargo_${pid}_${c.id}" value="${esc(c.cargo||'')}"></div>
        <div><label>RUT persona</label><input id="fe_rut_${pid}_${c.id}" value="${esc(c.rut||'')}"></div>
        <div><label>Teléfono</label><input id="fe_fono_${pid}_${c.id}" value="${esc(c.fono||'')}"></div>
        <div class="full"><label>Correo</label><input id="fe_correo_${pid}_${c.id}" value="${esc(c.correo||'')}"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button onclick="guardarContactoEdit('${pid}','${c.id}')" style="flex:1;padding:8px;background:var(--primary);color:#fff;border:none;border-radius:7px;font-family:'Barlow Condensed',sans-serif;font-size:.84rem;font-weight:700;cursor:pointer">GUARDAR</button>
        <button onclick="document.getElementById('fedit_${pid}_${c.id}').classList.remove('open')" style="padding:8px 14px;border:1.5px solid var(--border);background:#fff;border-radius:7px;font-size:.82rem;cursor:pointer">Cancelar</button>
      </div>
    </div>`
  ).join('');
}

function refrescarContactosModal(pid){
  const el=document.getElementById('contactosPane_'+pid);
  if(el) el.innerHTML=renderContactosInline(pid)+`
    <div class="form-contacto" id="fnuevo_${pid}">
      <div style="font-size:.78rem;font-weight:800;color:var(--primary);margin-bottom:10px;text-transform:uppercase;letter-spacing:.04em">Nuevo Contacto</div>
      <div class="form-contacto-grid">
        <div><label>Nombre completo *</label><input id="fn_nombre_${pid}" placeholder="Nombre completo"></div>
        <div><label>Cargo / Rol</label><input id="fn_cargo_${pid}" placeholder="Ej: Gerente, Dueño..."></div>
        <div><label>RUT persona</label><input id="fn_rut_${pid}" placeholder="12.345.678-9"></div>
        <div><label>Teléfono</label><input id="fn_fono_${pid}" placeholder="+56 9..."></div>
        <div class="full"><label>Correo</label><input id="fn_correo_${pid}" placeholder="correo@empresa.cl"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button onclick="guardarNuevoContacto('${pid}')" style="flex:1;padding:8px;background:var(--primary);color:#fff;border:none;border-radius:7px;font-family:'Barlow Condensed',sans-serif;font-size:.84rem;font-weight:700;cursor:pointer">GUARDAR CONTACTO</button>
        <button onclick="toggleFormContacto('${pid}')" style="padding:8px 14px;border:1.5px solid var(--border);background:#fff;border-radius:7px;font-size:.82rem;cursor:pointer">Cancelar</button>
      </div>
    </div>`;
}

function toggleFormContacto(pid){
  refrescarContactosModal(pid);
  const f=document.getElementById('fnuevo_'+pid);
  if(f) f.classList.toggle('open');
}

function editarContacto(pid,cid){
  refrescarContactosModal(pid);
  const f=document.getElementById('fedit_'+pid+'_'+cid);
  if(f) f.classList.add('open');
  f?.scrollIntoView({behavior:'smooth',block:'nearest'});
}

async function guardarNuevoContacto(pid){
  const nombre=(document.getElementById('fn_nombre_'+pid)?.value||'').trim();
  if(!nombre){showToast('El nombre es obligatorio','err');return;}
  if(!DB.contactos[pid]) DB.contactos[pid]=[];
  const esPrimero=DB.contactos[pid].length===0;
  DB.contactos[pid].push({
    id:uid(), nombre,
    cargo:(document.getElementById('fn_cargo_'+pid)?.value||'').trim(),
    rut:(document.getElementById('fn_rut_'+pid)?.value||'').trim(),
    fono:(document.getElementById('fn_fono_'+pid)?.value||'').trim(),
    correo:(document.getElementById('fn_correo_'+pid)?.value||'').trim(),
    principal:esPrimero
  });
  await saveDB(); gSyncPush(currentModalId||"");
  refrescarContactosModal(pid);
  showToast('Contacto guardado','success');
}

async function guardarContactoEdit(pid,cid){
  const cs=DB.contactos[pid]||[];
  const c=cs.find(x=>x.id===cid); if(!c) return;
  c.nombre=(document.getElementById('fe_nombre_'+pid+'_'+cid)?.value||'').trim();
  c.cargo=(document.getElementById('fe_cargo_'+pid+'_'+cid)?.value||'').trim();
  c.rut=(document.getElementById('fe_rut_'+pid+'_'+cid)?.value||'').trim();
  c.fono=(document.getElementById('fe_fono_'+pid+'_'+cid)?.value||'').trim();
  c.correo=(document.getElementById('fe_correo_'+pid+'_'+cid)?.value||'').trim();
  await saveDB(); gSyncPush(currentModalId||"");
  refrescarContactosModal(pid);
  showToast('Contacto actualizado','success');
}

async function eliminarContacto(pid,cid){
  if(!confirm('¿Eliminar este contacto?')) return;
  DB.contactos[pid]=(DB.contactos[pid]||[]).filter(c=>c.id!==cid);
  // Si era el principal, hacer principal al primero que quede
  if(DB.contactos[pid].length>0 && !DB.contactos[pid].find(c=>c.principal)){
    DB.contactos[pid][0].principal=true;
  }
  await saveDB(); gSyncPush(currentModalId||"");
  refrescarContactosModal(pid);
  showToast('Contacto eliminado','success');
}

async function setPrincipal(pid,cid){
  (DB.contactos[pid]||[]).forEach(c=>c.principal=c.id===cid);
  await saveDB(); gSyncPush(currentModalId||"");
  refrescarContactosModal(pid);
  showToast('Contacto principal actualizado','success');
}

// ── NORMALIZAR FONO ───────────────────────────────────────────────────────
function normFono(raw){
  if(!raw) return '';
  // Quitar todo excepto dígitos y +
  let d = raw.replace(/[^\d]/g,'');
  // Si empieza con 56, quitar el 56
  if(d.startsWith('56')) d=d.slice(2);
  // Si empieza con 0, quitar el 0
  if(d.startsWith('0')) d=d.slice(1);
  // Debe tener 9 dígitos para celular chileno
  if(d.length===9 && d.startsWith('9')){
    return `+56 ${d[0]} ${d.slice(1,5)} ${d.slice(5)}`;
  }
  // Si no cumple el patrón, devolver limpio
  return raw.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPA DE DATOS SUPABASE — Sistema AM v2.0
// Reemplaza toda la lógica de Google Sheets / Apps Script
// ═══════════════════════════════════════════════════════════════════════════

// ── CONFIG SUPABASE (se inyecta desde window.SUPA_CFG o localStorage) ──────
const SUPA = {
  url:  (window.SUPA_CFG && window.SUPA_CFG.url) || '',
  key:  (window.SUPA_CFG && window.SUPA_CFG.key) || '',
  client: null,
  session: null
};

// Credenciales SOLO desde config.js (window.SUPA_CFG). Nunca se piden ni se
// muestran en la interfaz. El anon key es público por diseño: la protección
// real son la autenticación (login) + las políticas RLS del lado servidor.
function initSupabase(){
  if(!SUPA.url || !SUPA.key){
    setGSyncStatus('err','Falta config.js con las credenciales de Supabase');
    return false;
  }
  if(!window.supabase){
    setGSyncStatus('err','Librería Supabase no cargada');
    return false;
  }
  if(!SUPA.client){
    SUPA.client = window.supabase.createClient(SUPA.url, SUPA.key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'am_v2_auth' }
    });
  }
  return true;
}

function requireSession(){
  if(!SUPA.session){
    showToast('Debes iniciar sesión','err');
    mostrarLogin();
    return false;
  }
  return true;
}

// ── STATUS BADGE ───────────────────────────────────────────────────────────
function setGSyncStatus(state, msg){
  const dot = document.getElementById('gsyncDot');
  const lbl = document.getElementById('gsyncLabel');
  if(dot) dot.className = 'gsync-dot ' + (state==='ok'?'ok':state==='sync'?'sync':'err');
  if(lbl) lbl.textContent = msg || '';
}

// ── PULL: cargar todo desde Supabase ───────────────────────────────────────
async function cargarDesdeNube(){
  if(!requireSession()) return false;
  if(!SUPA.client && !initSupabase()) {
    showToast('Configura Supabase primero (botón Conectar)','err');
    return false;
  }
  setGSyncStatus('sync','Cargando desde Supabase...');
  const btn = document.getElementById('btnSheetLoad');
  if(btn){ btn.disabled=true; btn.innerHTML='⏳ Cargando...'; }

  try{
    const [prov, cont, hot, acu, prog, lici, visi] = await Promise.all([
      SUPA.client.from('proveedores').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('contactos').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('hoteleria').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('acuerdos').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('programas').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('licitaciones').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('visitas')
        .select('visita_id,proveedor_id,fecha,titulo,resumen,responsable_nombre,fotos_json')
        .neq('estado_registro','Eliminado'),
    ]);
    if(prov.error) throw new Error(prov.error.message);

    hydrateFromSupabase({
      proveedores: prov.data||[],
      contactos:   cont.data||[],
      hoteleria:   hot.data||[],
      acuerdos:    acu.data||[],
      programas:   prog.data||[],
      licitaciones: lici.data||[],
      visitas:      visi.data||[],
    });

    DB._cloudSource = true;
    await saveDB();
    await cargarProgramasCatalogo();
    await cargarCatalogoListas();
    initApp();

    const n = PROVEEDORES.length;
    const badge = document.getElementById('sheetSourceBadge');
    if(badge) badge.style.display='flex';
    document.getElementById('btnDownload').disabled = false;
    const btnES = document.getElementById('btnExportSheet');
    if(btnES) btnES.disabled = false;
    actualizarBadgeHabs(); actualizarBadgeAcuerdos(); actualizarBadgeProgramas(); actualizarBadgeLicitaciones();

    setGSyncStatus('ok','Sincronizado '+new Date().toLocaleTimeString('es-CL')+' · '+n+' proveedores');
    if(n>0) showToast('✅ '+n+' proveedores cargados desde Supabase','success');
    return true;
  }catch(e){
    setGSyncStatus('err','Error: '+e.message);
    showToast('❌ '+e.message,'err');
    return false;
  }finally{
    if(btn){ btn.disabled=false; btn.innerHTML='☁️ Cargar desde la nube'; }
  }
}

// ── HYDRATE: vuelca filas de Supabase al estado interno ───────────────────
function hydrateFromSupabase(b){
  const eliminados = DB._eliminados||[];
  PROVEEDORES = (b.proveedores||[])
    .filter(p=>{ const r=(p.rut_empresa||'').replace(/[^0-9kK]/g,''); return !eliminados.includes(r); })
    .map(mapProvFromSupa);

  DB.contactos={}; DB.hoteles=DB.hoteles||{}; DB.acuerdos={}; DB.programas={}; DB.licitaciones={};

  // ── VISITAS ───────────────────────────────────────────────────────────────
  // Fuente unica: la tabla 'visitas' de Supabase, la misma que usa la pestana
  // Visitas de cada ficha (montarVisitasV3). Antes el dashboard leia un
  // historico local que nadie alimentaba desde la migracion a V3, asi que
  // mostraba datos congelados e ignoraba toda visita nueva.
  // Se mapea a los nombres que ya espera el render (autor/texto/fotos).
  DB.visitas={};
  (b.visitas||[]).forEach(v=>{
    const pid=v.proveedor_id; if(!pid) return;
    (DB.visitas[pid]=DB.visitas[pid]||[]).push({
      id:    v.visita_id,
      fecha: v.fecha||'',
      autor: v.responsable_nombre||'',
      texto: v.resumen||v.titulo||'',
      fotos: (()=>{ try{ const j=JSON.parse(v.fotos_json||'[]'); return Array.isArray(j)?j:[]; }catch(e){ return []; } })()
    });
  });
  (b.contactos||[]).forEach(c=>{
    const pid=c.proveedor_id; if(!pid) return;
    (DB.contactos[pid]=DB.contactos[pid]||[]).push({
      id:c.contacto_id||uid(), nombre:c.nombre||'', cargo:c.cargo||'',
      rut:c.rut_persona||'', correo:c.correo||'', fono:c.fono||'',
      principal:String(c.principal||'').toString().toUpperCase()==='TRUE'||c.principal===true
    });
  });
  (b.hoteleria||[]).forEach(h=>{
    const pid=h.proveedor_id; if(!pid) return;
    if(!DB.hoteles[pid]) DB.hoteles[pid]={simples:0,dobles:0,contratos:[]};
    DB.hoteles[pid].simples=parseInt(h.hab_simples)||0;
    DB.hoteles[pid].dobles =parseInt(h.hab_dobles)||0;
    if(h.contratos_json){ try{ const j=JSON.parse(h.contratos_json); if(Array.isArray(j)){ DB.hoteles[pid].contratos=j; } else if(j&&typeof j==='object'){ DB.hoteles[pid].contratos=j.contratos||[]; DB.hoteles[pid].servicios=j.servicios||[]; DB.hoteles[pid].simples_banio=parseInt(j.simples_banio)||0; DB.hoteles[pid].dobles_banio=parseInt(j.dobles_banio)||0; if(j.total) DB.hoteles[pid].total=j.total; } }catch(e){ DB.hoteles[pid].contratos=[]; } }
    if(!DB.hoteles[pid].total){ DB.hoteles[pid].total=(parseInt(h.hab_simples)||0)+(parseInt(h.hab_dobles)||0); }
  });
  (b.acuerdos||[]).forEach(a=>{
    const pid=a.proveedor_id; if(!pid) return;
    (DB.acuerdos[pid]=DB.acuerdos[pid]||[]).push({
      id:a.acuerdo_id||uid(), compania:a.compania||'', proveedor:a.proveedor||'',
      prov_id:pid, servicio:a.servicio||'', area:a.area||'', adc:a.adc||'',
      os:a.os||'', monto_clp:parseInt(a.monto_clp)||0, periodo:a.periodo||'',
      fecha_inicio:a.fecha_inicio||'', fecha_fin:a.fecha_fin||'',
      localidad:a.localidad||'', rubro:a.rubro||'', licitacion_id:a.licitacion_id||'',
      descripcion_servicio:a.descripcion_servicio||'', anio:a.anio||(a.fecha_inicio||'').slice(0,4),
      usd_manual:a.usd_manual||null, pdf_url:a.pdf_url||'',
      foto1_url:a.foto1_url||'', foto2_url:a.foto2_url||'', foto3_url:a.foto3_url||'',
      visitas_json:a.visitas_json||[], created_by:a.created_by||'',
      completado:!!a.completado, fecha_completado:a.fecha_completado||''
    });
  });
  (b.programas||[]).forEach(pg=>{
    const pid=pg.proveedor_id; if(!pid) return;
    (DB.programas[pid]=DB.programas[pid]||[]).push({
      id:pg.programa_id||uid(), nombre:pg.nombre_programa||'',
      inicio:pg.inicio||'', fin:pg.fin||'', programa_cat_id:pg.programa_cat_id||null,
      activo:String(pg.activo||'TRUE').toString().toUpperCase()==='TRUE'||pg.activo===true
    });
    if(pg.nombre_programa && !PROGRAMAS_LIST.includes(pg.nombre_programa))
      PROGRAMAS_LIST.push(pg.nombre_programa);
  });
  (b.licitaciones||[]).forEach(l=>{
    const pid=l.proveedor_id; if(!pid) return;
    let hitos=[]; try{ hitos=JSON.parse(l.hitos_json||'[]'); if(!Array.isArray(hitos))hitos=[]; }catch(e){ hitos=[]; }
    (DB.licitaciones[pid]=DB.licitaciones[pid]||[]).push({
      id:l.licitacion_id||uid(), prov_id:pid, nombre:l.nombre||'',
      estado_proceso:l.estado_proceso||'En curso', estado_final:l.estado_final||'',
      comentario_general:l.comentario_general||'', hitos:hitos,
      created_by:l.created_by||'', updated_at:l.updated_at||''
    });
  });
}

function mapProvFromSupa(p){
  const giros=String(p.giros_sii||'').split(/[\n;]+/).map(s=>s.trim()).filter(Boolean);
  const rubros=String(p.rubros_norm||'').split('|').map(s=>s.trim()).filter(Boolean);
  return {
    _id: p.proveedor_id || ('re_'+(p.rut_empresa||'').replace(/[^0-9kK]/g,'')),
    _proveedorId: p.proveedor_id||'',
    nombre_contacto:'', cargo:'', rut_persona:'',
    razon_social:p.razon_social||'', nombre_fantasia:p.nombre_fantasia||'',
    rut_empresa:p.rut_empresa||'', localidad:p.localidad||'',
    direccion:p.direccion||'', correo:p.correo_empresa||'', fono:p.fono_empresa||'',
    giros, rubrosNorm:rubros.length?rubros:[...new Set(giros.map(normRubro).filter(Boolean))],
    actividad_principal:p.actividad_principal||'', descripcion:p.descripcion_general||'',
    plataformas:p.plataformas_mineras||'', categoria_sii:p.categoria_sii||'',
    facturar:p.estado_facturacion||'', agrupacion:p.agrupacion_gremial||'',
    servicio_am:p.servicios_am||'', estado:p.estado_registro||'Activo',
    rango_trabajos:p.rango_trabajos||'', acceso_publico:!!p.acceso_publico,
    pub_centinela:!!p.pub_centinela, pub_antucoya:!!p.pub_antucoya, pub_zaldivar:!!p.pub_zaldivar,
    // Programa MGI: se conserva null (= decidir por texto, como siempre)
    programa_mgi:(p.programa_mgi===null||p.programa_mgi===undefined)?null:!!p.programa_mgi,
    programa_mgi_rubro:p.programa_mgi_rubro||null, es_hoteleria:!!p.es_hoteleria,
    // El RUT es de la empresa, no del local: una empresa puede tener varias
    // sucursales. `multi_verificado` marca que ya se revisó que son distintas.
    sucursal:p.sucursal||'', multi_verificado:!!p.multi_verificado,
    flota:(()=>{try{return JSON.parse(p.flota_json||'[]')||[];}catch(e){return [];}})(),
    fotos:(()=>{try{return JSON.parse(p.fotos_json||'[]')||[];}catch(e){return [];}})(),
    notas_ficha:p.notas_ficha||'',
    _editedBy:p.updated_by||'', _createdBy:p.created_by||'', _edited:false
  };
}

// ── PUSH: guardar un proveedor (bundle) en Supabase ───────────────────────
async function gSyncPush(proveedorId){
  if(!SUPA.session) return;
  if(!SUPA.client && !initSupabase()) return;
  const p = PROVEEDORES.find(x=>x._id===proveedorId);
  if(!p) return;
  setGSyncStatus('sync','Guardando...');
  try{
    const pid = p._proveedorId || ('re_'+(p.rut_empresa||'').replace(/[^0-9kK]/g,'')) || p._id;
    p._proveedorId = pid;
    const now = new Date().toISOString();

    await SUPA.client.from('proveedores').upsert({
      proveedor_id: pid,
      rut_empresa: p.rut_empresa||'', razon_social: p.razon_social||'',
      nombre_fantasia: p.nombre_fantasia||'', localidad: p.localidad||'',
      direccion: p.direccion||'', correo_empresa: p.correo||'', fono_empresa: p.fono||'',
      giros_sii: (p.giros||[]).join('\n'), rubros_norm: (p.rubrosNorm||[]).join('|'),
      actividad_principal: p.actividad_principal||'', descripcion_general: p.descripcion||'',
      plataformas_mineras: p.plataformas||'', categoria_sii: p.categoria_sii||'',
      estado_facturacion: p.facturar||'', agrupacion_gremial: p.agrupacion||'',
      servicios_am: p.servicio_am||'', estado_registro: p.estado||'Activo',
      rango_trabajos: p.rango_trabajos||'', acceso_publico: !!p.acceso_publico,
      pub_centinela: !!p.pub_centinela, pub_antucoya: !!p.pub_antucoya, pub_zaldivar: !!p.pub_zaldivar,
      programa_mgi: (p.programa_mgi===null||p.programa_mgi===undefined)?null:!!p.programa_mgi,
      programa_mgi_rubro: p.programa_mgi_rubro||null, es_hoteleria: !!p.es_hoteleria,
      sucursal: p.sucursal||null, multi_verificado: !!p.multi_verificado,
      flota_json: JSON.stringify(p.flota||[]),
      notas_ficha: p.notas_ficha||'',
      fuente:'web_v2', updated_at: now,
      updated_by: (p._editedBy||kbWhoSafe()), created_by: (p._createdBy||p._editedBy||kbWhoSafe())
    }, {onConflict:'proveedor_id'});

    // hijos: borrar y reinsertar
    await SUPA.client.from('contactos').delete().eq('proveedor_id',pid);
    const cs=(DB.contactos[proveedorId]||[]).map((c,i)=>({
      contacto_id:c.id||('cont_'+pid+'_'+i), proveedor_id:pid,
      rut_persona:c.rut||'', nombre:c.nombre||'', cargo:c.cargo||'',
      correo:c.correo||'', fono:c.fono||'',
      principal:(c.principal||i===0)?'TRUE':'FALSE', estado_registro:'Activo', updated_at:now
    }));
    if(cs.length) await SUPA.client.from('contactos').insert(cs);

    // Upsert por hotel_id (evita "duplicate key hoteleria_pkey": el delete no
    // borraba por RLS/trigger y el insert chocaba con la PK existente). Si el
    // hostal quedó sin datos, se guarda una fila en cero en vez de borrarla.
    const h=DB.hoteles[proveedorId]||{};
    await SUPA.client.from('hoteleria').upsert({
      hotel_id:'hot_'+pid, proveedor_id:pid,
      hab_simples:h.simples||0, hab_dobles:h.dobles||0,
      contratos_json:JSON.stringify({total:h.total||0,contratos:h.contratos||[],servicios:h.servicios||[],simples_banio:h.simples_banio||0,dobles_banio:h.dobles_banio||0}), estado_registro:'Activo', updated_at:now
    },{onConflict:'hotel_id'});

    await SUPA.client.from('acuerdos').delete().eq('proveedor_id',pid);
    const acs=(DB.acuerdos[proveedorId]||[]).map((a,i)=>({
      acuerdo_id:a.id||('acu_'+pid+'_'+i), proveedor_id:pid,
      compania:a.compania||'', proveedor:a.proveedor||'', servicio:a.servicio||'',
      area:a.area||'', adc:a.adc||'', os:a.os||'', monto_clp:a.monto_clp||0,
      periodo:a.periodo||'', fecha_inicio:a.fecha_inicio||'', fecha_fin:a.fecha_fin||'',
      localidad:a.localidad||'', rubro:a.rubro||'', licitacion_id:a.licitacion_id||null,
      estado_registro:'Activo', updated_at:now
    }));
    if(acs.length) await SUPA.client.from('acuerdos').insert(acs);

    await SUPA.client.from('programas').delete().eq('proveedor_id',pid);
    const pgs=(DB.programas[proveedorId]||[]).map((pg,i)=>({
      programa_id:pg.id||('prog_'+pid+'_'+i), proveedor_id:pid,
      nombre_programa:pg.nombre||'', inicio:pg.inicio||'', fin:pg.fin||'',
      programa_cat_id:pg.programa_cat_id||null,
      activo:pg.activo!==false?'TRUE':'FALSE', estado_registro:'Activo', updated_at:now
    }));
    if(pgs.length) await SUPA.client.from('programas').insert(pgs);

    setGSyncStatus('ok','Guardado '+new Date().toLocaleTimeString('es-CL'));
  }catch(e){
    setGSyncStatus('err','Error al guardar');
    showToast('❌ '+e.message,'err');
  }
}

// ── DELETE (soft) en Supabase ─────────────────────────────────────────────
async function gSyncDelete(id, rutEmpresa){
  if(!SUPA.client && !initSupabase()) return;
  const p = PROVEEDORES.find(x=>x._id===id);
  const pid = (p&&p._proveedorId) || ('re_'+(rutEmpresa||'').replace(/[^0-9kK]/g,'')) || id;
  const now=new Date().toISOString();
  // .select() fuerza que Supabase devuelva las filas afectadas: sin esto,
  // un update que no coincide con ningun proveedor_id "tiene exito" con 0
  // filas tocadas y sin error -- el proveedor desaparecia de la pantalla
  // (borrado en el estado local) aunque siguiera intacto en la base, y
  // reaparecia al recargar. Ver docs/PENDIENTES.md P-13.
  const {data,error}=await SUPA.client.from('proveedores').update({estado_registro:'Eliminado',deleted_at:now}).eq('proveedor_id',pid).select('proveedor_id');
  if(error) throw new Error(error.message);
  if(!data || !data.length) throw new Error('No se encontró el proveedor en la base (id: '+pid+'). No se eliminó nada.');
  for(const t of ['contactos','hoteleria','acuerdos','programas','visitas','moli_beneficiarios'])
    await SUPA.client.from(t).update({estado_registro:'Eliminado'}).eq('proveedor_id',pid);
}

// ── GUARDAR TODO (botón header) ───────────────────────────────────────────
async function actualizarSheet(){ // mantiene el nombre por compatibilidad onclick
  if(!requireSession()) return;
  if(!PROVEEDORES.length){ showToast('No hay datos para guardar','warning'); return; }
  if(!SUPA.client && !initSupabase()){ showToast('Configura Supabase primero','err'); return; }
  const btn=document.getElementById('btnExportSheet');
  if(btn){ btn.disabled=true; btn.innerHTML='⏳ Guardando...'; }
  setGSyncStatus('sync','Guardando todos...');
  let ok=0,err=0;
  for(const p of PROVEEDORES){
    try{ await gSyncPush(p._id); ok++; }catch(e){ err++; }
  }
  setGSyncStatus('ok','Guardado '+new Date().toLocaleTimeString('es-CL'));
  showToast('✅ '+ok+' proveedores guardados'+(err?' · '+err+' errores':''),'success');
  if(btn){ btn.disabled=false; btn.innerHTML='☁️ Guardar en nube'; }
}

// ── AUTENTICACIÓN ─────────────────────────────────────────────────────────
function mostrarLogin(){
  const g=document.getElementById('loginGate'); if(g) g.style.display='flex';
}
function ocultarLogin(){
  const g=document.getElementById('loginGate'); if(g) g.style.display='none';
}
function loginError(msg){
  const e=document.getElementById('loginError');
  if(e){ e.textContent=msg; e.style.display=msg?'block':'none'; }
}

async function iniciarSesion(){
  loginError('');
  if(!initSupabase()){ loginError('Sistema sin configurar. Falta config.js.'); return; }
  const email=(document.getElementById('loginEmail')||{}).value||'';
  const pass =(document.getElementById('loginPass')||{}).value||'';
  if(!email||!pass){ loginError('Ingresa correo y contraseña'); return; }
  const btn=document.getElementById('loginBtn');
  if(btn){ btn.disabled=true; btn.style.opacity=.6; btn.textContent='Verificando...'; }
  try{
    const {data,error}=await SUPA.client.auth.signInWithPassword({email:email.trim(),password:pass});
    if(error) throw error;
    SUPA.session=data.session;
    const pw=document.getElementById('loginPass'); if(pw) pw.value='';
    await onSesionIniciada();
  }catch(e){
    loginError(e.message==='Invalid login credentials'?'Correo o contraseña incorrectos':e.message);
  }finally{
    if(btn){ btn.disabled=false; btn.style.opacity=1; btn.textContent='Ingresar'; }
  }
}

async function cerrarSesion(){
  try{ if(SUPA.client) await SUPA.client.auth.signOut(); }catch(e){}
  SUPA.session=null;
  // limpiar datos en memoria para no dejar información visible
  PROVEEDORES=[];
  document.getElementById('mainApp').style.display='none';
  document.getElementById('heroStrip').style.display='none';
  document.getElementById('noDataScreen').style.display='flex';
  const ub=document.getElementById('userBadge'); if(ub) ub.style.display='none';
  const lo=document.getElementById('btnLogout'); if(lo) lo.style.display='none';
  const sy=document.getElementById('btnSyncNow'); if(sy) sy.style.display='none';
  const lu=document.getElementById('linkAdminUsuarios'); if(lu) lu.style.display='none';
  mostrarLogin();
}

let MI_PERFIL = { nombre:'', apellido:'', email:'' };

async function onSesionIniciada(){
  // Forzar refresh del JWT para asegurar metadata actualizada
  try{ const {data:ref}=await SUPA.client.auth.refreshSession(); if(ref&&ref.session) SUPA.session=ref.session; }catch(e){ console.warn('[ROL] no se pudo refrescar sesión',e); }
  const md=leerRolActual();
  const email=SUPA.session && SUPA.session.user ? SUPA.session.user.email : '';
  // Bloquear cuentas no aprobadas (salvo admin)
  const estado = md.estado || 'pendiente';
  if(md.rol!=='admin' && estado!=='aprobado'){
    await SUPA.client.auth.signOut();
    SUPA.session=null;
    loginError('Tu cuenta está pendiente de aprobación por el administrador.');
    mostrarLogin(); return;
  }
  // Verificar acceso a la PLATAFORMA PRINCIPAL
  const accesos = Array.isArray(md.accesos)?md.accesos:[];
  if(md.rol!=='admin' && !accesos.includes('principal')){
    await SUPA.client.auth.signOut();
    SUPA.session=null;
    loginError('Tu cuenta no tiene acceso a la plataforma principal. Si necesitas acceso, pídelo al administrador.');
    mostrarLogin(); return;
  }
  if(false){
    await SUPA.client.auth.signOut();
    SUPA.session=null;
    mostrarLogin();
    loginError(estado==='rechazado' ? 'Tu acceso fue rechazado por el administrador.' : 'Tu cuenta está pendiente de aprobación por el administrador.');
    return;
  }
  ocultarLogin();
  // cargar/crear perfil (nombre y apellido)
  await cargarPerfil(email);
  // RESPALDO: si el servidor deja listar solicitudes, es admin real (aunque
  // el JWT local estuviera desactualizado). La gestión de usuarios en sí
  // vive en modules/admin/ (P-7).
  try{
    const {data,error}=await SUPA.client.rpc('listar_solicitudes');
    if(!error && Array.isArray(data) && !ES_ADMIN_ACTUAL){
      ES_ADMIN_ACTUAL=true; document.body.classList.add('is-admin'); document.body.classList.remove('is-user');
    }
  }catch(e){}
  const ub=document.getElementById('userBadge'); const ue=document.getElementById('userEmail');
  if(ue) ue.textContent = (MI_PERFIL.nombre? (MI_PERFIL.nombre+' '+(MI_PERFIL.apellido||'')).trim() : email);
  if(ub) ub.style.display='inline-flex';
  const lo=document.getElementById('btnLogout'); if(lo) lo.style.display='inline-block';
  const sy=document.getElementById('btnSyncNow'); if(sy) sy.style.display='inline-block';
  const lu=document.getElementById('linkAdminUsuarios'); if(lu) lu.style.display=ES_ADMIN_ACTUAL?'inline-block':'none';
  await cargarDesdeNube();
}

async function cargarPerfil(email){
  MI_PERFIL={nombre:'',apellido:'',email:email||''};
  try{
    const uid=SUPA.session.user.id;
    const {data}=await SUPA.client.from('perfiles').select('*').eq('id',uid).maybeSingle();
    if(data && data.nombre){ MI_PERFIL={nombre:data.nombre,apellido:data.apellido||'',email:data.email||email}; }
    else { mostrarModalPerfil(true); }
  }catch(e){ /* si falla, pedirlo igual */ mostrarModalPerfil(true); }
}

function mostrarModalPerfil(obligatorio){
  document.getElementById('perfNombre').value=MI_PERFIL.nombre||'';
  document.getElementById('perfApellido').value=MI_PERFIL.apellido||'';
  document.getElementById('perfModal').style.display='flex';
  document.getElementById('perfCerrar').style.display=obligatorio?'none':'block';
  document.getElementById('perfMsg').style.display=obligatorio?'block':'none';
}
function cerrarModalPerfil(){ document.getElementById('perfModal').style.display='none'; }

async function guardarPerfil(){
  const nombre=document.getElementById('perfNombre').value.trim();
  const apellido=document.getElementById('perfApellido').value.trim();
  if(!nombre){ showToast('Ingresa tu nombre','err'); return; }
  try{
    const u=SUPA.session.user;
    await SUPA.client.from('perfiles').upsert({id:u.id, nombre, apellido, email:u.email, updated_at:new Date().toISOString()},{onConflict:'id'});
    MI_PERFIL={nombre,apellido,email:u.email};
    const ue=document.getElementById('userEmail'); if(ue) ue.textContent=(nombre+' '+apellido).trim();
    cerrarModalPerfil();
    showToast('✅ Perfil guardado','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

// nombre completo del usuario actual (para responsable/logs)
function miNombre(){
  if(MI_PERFIL.nombre) return (MI_PERFIL.nombre+' '+(MI_PERFIL.apellido||'')).trim();
  try{ return (SUPA.session.user.email||'').split('@')[0]; }catch(e){ return ''; }
}

// nombre conservado por compatibilidad de onclick antiguos
async function conectarGSheet(){ await cargarDesdeNube(); }
function syncAhora(){ cargarDesdeNube(); }
function limpiarFuenteSheet(){
  DB._cloudSource=false;
  const badge=document.getElementById('sheetSourceBadge');
  if(badge) badge.style.display='none';
  showToast('Ahora puedes cargar desde Excel','success');
}
function mostrarAyudaSync(){ const m=document.getElementById('syncHelpModal'); if(m) m.style.display='flex'; }

// ── CARGA MASIVA DESDE EXCEL → Supabase ───────────────────────────────────
async function cargaMasivaSupabase(){
  if(!PROVEEDORES.length){ showToast('Primero carga un Excel','warning'); return; }
  if(!SUPA.client && !initSupabase()){ showToast('Configura Supabase primero','err'); return; }
  if(!confirm('¿Subir los '+PROVEEDORES.length+' proveedores cargados a Supabase?\nLos existentes (mismo RUT) se actualizarán.')) return;
  await actualizarSheet();
}

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async ()=>{
  await loadDB();

  actualizarBadgeHabs(); actualizarBadgeAcuerdos(); actualizarBadgeProgramas();
  actualizarUSD();

  // Sin config.js no se puede operar: mostrar login con aviso
  if(!initSupabase()){
    mostrarLogin();
    loginError('Sistema sin configurar: falta config.js con las credenciales.');
    return;
  }

  // Reaccionar a cambios de sesión (refresh token, logout en otra pestaña)
  SUPA.client.auth.onAuthStateChange((event, session)=>{
    SUPA.session = session;
    if(!session){ mostrarLogin(); }
  });

  // ¿Hay sesión activa? (recordada por Supabase)
  const { data } = await SUPA.client.auth.getSession();
  if(data && data.session){
    SUPA.session = data.session;
    // Refrescar token para obtener metadata actualizada
    try{ const {data:ref}=await SUPA.client.auth.refreshSession(); if(ref&&ref.session) SUPA.session=ref.session; }catch(e){}
    await onSesionIniciada();
  } else {
    mostrarLogin();
  }
});





// ── RESET + PLANTILLA ──────────────────────────────────────────────────────
async function resetearDatos(){
  if(!confirm('¿Borrar todos los datos LOCALES del navegador? (No afecta Supabase)')) return;
  try{ localStorage.removeItem(CLAVE_PREFS); }catch(e){}
  try{ localStorage.removeItem('am_v6_db'); }catch(e){}   // historico legacy; ver tambien "Historico local" (P-2), que permite descargar antes de borrar
  PROVEEDORES=[]; DB={visitas:{},hoteles:{},acuerdos:{},programas:{},contactos:{},_eliminados:[],tarifas:{simple_clp:50000,doble_clp:80000,tc:950},gsync:{}};
  location.reload();
}

// ── HISTÓRICO LOCAL ANTIGUO (P-2, docs/PENDIENTES.md) ──────────────────────
// am_v6_db: volcado del sistema anterior a la migracion a Supabase (V3).
// Congelado desde 2026-07-21 -- el sistema ya no escribe ahi ni lo lee para
// nada. Las visitas historicas con fotos en base64 NO tienen copia en
// ninguna tabla, por eso este panel exige descargar un respaldo antes de
// habilitar el borrado (salvo que ya este vacio).
let _histLocalDescargado = false;

function _histLocalLeer(){
  try{ return JSON.parse(localStorage.getItem('am_v6_db')||'{}'); }catch(e){ return {}; }
}

function _histLocalResumen(d){
  const vis = d.visitas||{};
  const todas = Object.values(vis).flat();
  return {
    proveedores: Object.keys(vis).length,
    total: todas.length,
    conFotos: todas.filter(v=>v.fotos && v.fotos.length).length,
    masReciente: todas.map(v=>v.fecha).filter(Boolean).sort().pop() || '—',
  };
}

function abrirHistoricoLocal(){
  _histLocalDescargado = false;
  const r = _histLocalResumen(_histLocalLeer());
  document.getElementById('histLocalResumen').innerHTML =
    `<b>${r.proveedores}</b> proveedores con visitas · <b>${r.total}</b> visitas totales<br>`+
    `<b>${r.conFotos}</b> con fotos · más reciente: <b>${esc(r.masReciente)}</b>`;
  const btn=document.getElementById('histLocalBorrarBtn'), nota=document.getElementById('histLocalNota');
  if(r.total===0){
    btn.disabled=false; btn.style.opacity=1; btn.style.cursor='pointer';
    nota.textContent='No hay visitas guardadas — se puede borrar sin descargar nada.';
  }else{
    btn.disabled=true; btn.style.opacity=.5; btn.style.cursor='not-allowed';
    nota.textContent='Descarga el respaldo primero para poder borrar.';
  }
  document.getElementById('histLocalModal').style.display='flex';
}
function cerrarHistoricoLocal(){ document.getElementById('histLocalModal').style.display='none'; }

function descargarHistoricoLocal(){
  const d=_histLocalLeer();
  const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='respaldo-historico-local-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  _histLocalDescargado=true;
  const btn=document.getElementById('histLocalBorrarBtn');
  btn.disabled=false; btn.style.opacity=1; btn.style.cursor='pointer';
  document.getElementById('histLocalNota').textContent='Respaldo descargado. Ya puedes borrar el histórico local.';
  showToast('📥 Respaldo descargado','success');
}

function borrarHistoricoLocal(){
  const r=_histLocalResumen(_histLocalLeer());
  if(r.total>0 && !_histLocalDescargado){ showToast('Descarga el respaldo primero','err'); return; }
  if(!confirm('¿Borrar el histórico local antiguo de este navegador?'+(r.total>0?' Ya descargaste el respaldo.':'')+' Esta acción no se puede deshacer.')) return;
  try{ localStorage.removeItem('am_v6_db'); }catch(e){}
  showToast('🗑 Histórico local borrado','success');
  abrirHistoricoLocal();
}

function descargarPlantilla(){
  // ⚠️ El ORDEN manda: el lector toma las columnas por posición (row[0],
  // row[5]…), no por su nombre. Si se agrega una al medio, hay que mover
  // también los índices en handleFiles().
  const headers=['NOMBRE CONTACTO','CARGO','RUT PERSONA','RAZÓN SOCIAL','NOMBRE FANTASÍA','RUT EMPRESA','LOCALIDAD','DIRECCIÓN','CORREO','FONO','GIROS SII','ACTIVIDAD PRINCIPAL','DESCRIPCIÓN GENERAL','PLATAFORMAS MINERAS','CATEGORÍA SII','AUTORIZACIÓN PARA FACTURAR','AGRUPACIÓN GREMIAL','SERVICIOS CON AM','HAB SIMPLES','HAB DOBLES','PROGRAMAS / INICIATIVAS','HAB SIMPLES BAÑO PRIVADO','HAB DOBLES BAÑO PRIVADO','HABITACIONES DISPONIBLES'];
  const ejemplo=['Juan Pérez','Gerente','12.345.678-9','Comercial Ejemplo SpA','Hotel Ejemplo','76.123.456-7','Sierra Gorda','Av. Principal 123','contacto@ejemplo.cl','+56 9 1234 5678','Hospedaje\nAlimentación','Servicios de hotelería','Hotel con 10 habitaciones equipadas','Centinela','Primera Categoría','Autorizado','Cámara de Comercio Sierra Gorda','Sí — Contrato vigente','6','4','Programa Formación Proveedores','6','2','3'];
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet([headers,ejemplo]);
  ws['!cols']=headers.map((h,i)=>({wch: i===12?45:i===10?32:20}));
  const range=XLSX.utils.decode_range(ws['!ref']);
  for(let c=range.s.c;c<=range.e.c;c++){
    const a=XLSX.utils.encode_cell({r:0,c});
    if(ws[a]) ws[a].s={font:{bold:true,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'00A399'}}};
  }
  XLSX.utils.book_append_sheet(wb,ws,'Plantilla');
  // hoja instrucciones
  const inst=[['INSTRUCCIONES DE LLENADO'],[''],['• Una fila por contacto. Mismo RUT EMPRESA = mismo proveedor (se agrupan contactos).'],['• GIROS SII: separa varios con salto de línea o ; '],['• AUTORIZACIÓN PARA FACTURAR: Autorizado / No autorizado / Boleta honorario'],['• SERVICIOS CON AM: Sí — Contrato vigente / En proceso de licitación / No'],['• HAB SIMPLES / HAB DOBLES: solo para proveedores de hospedaje'],['• PROGRAMAS: separa varios con |'],['• HAB ... BAÑO PRIVADO: cuántas de esas habitaciones tienen baño propio.'],['• HABITACIONES DISPONIBLES: cuántas quedan libres hoy (solo informativo).'],['• Borra la fila de ejemplo antes de cargar.'],[''],['ESTA PLANTILLA ES PARA CARGAR PROVEEDORES NUEVOS.'],['Para CORREGIR datos que ya están en el sistema, usa el botón «Depurar»:'],['esta carga solo rellena campos vacíos, nunca pisa un dato existente.']];
  const wi=XLSX.utils.aoa_to_sheet(inst); wi['!cols']=[{wch:90}];
  XLSX.utils.book_append_sheet(wb,wi,'Instrucciones');
  XLSX.writeFile(wb,'Plantilla_Proveedores_AM.xlsx');
  showToast('✅ Plantilla descargada','success');
}



// Agenda telefónica + Nuevo proveedor: movido a proveedores-agenda.js
// (P-8, docs/PENDIENTES.md, tercer corte). registrarLog(), de aca abajo,
// se queda -- es una utilidad compartida por 19 sitios del archivo.

// ── LOG DE EDICIONES ───────────────────────────────────────────────────────
async function registrarLog(entidad, entidadId, accion, detalle){
  try{
    if(!SUPA.client || !SUPA.session) return;
    const u=SUPA.session.user||{};
    const nombre=(u.user_metadata && (u.user_metadata.full_name||u.user_metadata.name)) || (u.email||'').split('@')[0];
    await SUPA.client.from('registro_ediciones').insert({
      usuario_email:u.email||'', usuario_nombre:nombre||'',
      entidad:entidad, entidad_id:String(entidadId||''), accion:accion, detalle:detalle||''
    });
  }catch(e){ /* el log no debe romper la operación */ }
}



// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO KANBAN (v2.1) — Operación + Red/Abastecimiento + RCA + Dashboard
// ═══════════════════════════════════════════════════════════════════════════
let KB = { cards: [], contratistas: [], ctraContactos: [], compras: [], board:'proyectos', loaded:false };

const KB_BOARDS = {
  proyectos:    { titulo:'Proyectos / Iniciativas', cols:['Idea','En curso','En pausa','Cerrado'] },
  reuniones:    { titulo:'Reuniones',               cols:['Por agendar','Agendada','Realizada'] },
  compromisos:  { titulo:'Compromisos',             cols:['Pendiente','En progreso','Cumplido','Vencido'] },
  reclamos:     { titulo:'Reclamos',                cols:['Recibido','En gestión','Escalado','Resuelto'] },
  contactos:    { titulo:'Contactos',               cols:['Nuevo','En contacto','Activo','Inactivo'] },
  prov_locales: { titulo:'Proveedores Locales',     cols:['Prospecto','En evaluación','Aprobado','Contratado'] }
};

async function renderKanban(){
  if(!SUPA.session){ document.getElementById('kanbanContent').innerHTML='<div class="kb-empty">Inicia sesión para usar el Kanban.</div>'; return; }
  if(!KB.loaded){ await kbLoadAll(); }
  kbSelect(KB.board);
}

async function kbLoadAll(){
  try{
    const [c, ct, cc, co] = await Promise.all([
      SUPA.client.from('kanban_cards').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('contratistas').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('contratista_contactos').select('*').neq('estado_registro','Eliminado'),
      SUPA.client.from('compras').select('*').neq('estado_registro','Eliminado'),
    ]);
    KB.cards=c.data||[]; KB.contratistas=ct.data||[]; KB.ctraContactos=cc.data||[]; KB.compras=co.data||[];
    KB.loaded=true;
  }catch(e){ showToast('Error al cargar Kanban: '+e.message,'err'); }
}

function kbSelect(board, btn){
  KB.board=board;
  document.querySelectorAll('.kb-nav').forEach(b=>b.classList.toggle('active', b.dataset.board===board));
  if(board==='planer') return giCargarPlaner();   // pendientes del Planer
  if(board==='rca') return renderRCA();
  if(board==='listas') return renderCatalogoListas();
  if(board==='dashboard') return renderKbDashboard();
  if(board==='reclamos') return renderReclamosFiltro();
  renderBoard(board);
}

// ═══ RECLAMOS · FILTRADOR DE EXCEL SEMANAL (TMRC) ═══
// El Excel NO se almacena: se carga en memoria cada vez y el sistema filtra.
let RECL={rows:[],file:'',fMacro:new Set(),fCia:new Set(['Antucoya','Zaldivar','Centinela']),fCat:new Set(),fAnio:new Set(),loaded:false};
const RECL_COL={cod:0,cat:1,sub:2,estado:11,cia:12,titulo:13,monto:15,loc:16,creacion:23,elim:24,macro:25,denunciada:27,montoCorr:28,tgestion:29,provAfect:31,anio:33};
function _rNorm(v){ return String(v==null?'':v).trim(); }
function _rCiaNorm(v){ const c=_rNorm(v).toLowerCase(); if(c.startsWith('antucoya'))return 'Antucoya'; if(c.startsWith('zald'))return 'Zaldivar'; if(c.startsWith('centinela'))return 'Centinela'; return _rNorm(v); }
function renderReclamosFiltro(){
  const cont=document.getElementById('kanbanContent');
  if(!RECL.loaded){
    cont.innerHTML=`<div class="kb-head"><div class="kb-title">📣 Reclamos · Filtrador TMRC</div></div>
      <div style="background:#fff;border:2px dashed var(--border);border-radius:14px;padding:34px;text-align:center;max-width:560px;margin:24px auto">
        <div style="font-size:2rem">📊</div>
        <div style="font-weight:700;margin:8px 0 4px">Carga el Excel semanal de reclamos (tmrc_export...)</div>
        <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:14px">El archivo solo se usa para filtrar en pantalla; no se guarda en el sistema.</div>
        <input type="file" accept=".xlsx,.xls" onchange="cargarExcelReclamos(this.files[0])" style="font-size:.85rem">
      </div>`;
    return;
  }
  // opciones dinámicas
  const macros=[...new Set(RECL.rows.map(r=>_rNorm(r[RECL_COL.macro])).filter(Boolean))].sort();
  const cats=[...new Set(RECL.rows.map(r=>_rNorm(r[RECL_COL.cat])).filter(c=>c&&!c.toLowerCase().includes('tu voz')))].sort();
  const anios=[...new Set(RECL.rows.map(r=>_rNorm(r[RECL_COL.anio])).filter(Boolean))].sort();
  if(!RECL.fCat.size) cats.forEach(c=>RECL.fCat.add(c));
  if(!RECL.fAnio.size) anios.forEach(a=>RECL.fAnio.add(a));
  if(!RECL.fMacro.size) macros.forEach(m=>RECL.fMacro.add(m));
  const chip=(set,val,fn)=>`<label style="display:inline-flex;align-items:center;gap:5px;background:${set.has(val)?'var(--primary-light)':'#f2f2f2'};border:1px solid ${set.has(val)?'var(--primary)':'#ddd'};border-radius:16px;padding:4px 11px;font-size:.78rem;cursor:pointer;margin:2px"><input type="checkbox" ${set.has(val)?'checked':''} onchange="${fn}('${val.replace(/'/g,"\\'")}')" style="width:auto">${esc(val)}</label>`;
  // filtrar filas
  const filtradas=RECL.rows.filter(r=>{
    if(_rNorm(r[RECL_COL.elim])!=='') return false;                               // Col Y: solo vacías
    const cia=_rCiaNorm(r[RECL_COL.cia]); if(!RECL.fCia.has(cia)) return false;    // Col M: solo 3 compañías
    const cat=_rNorm(r[RECL_COL.cat]); if(cat.toLowerCase().includes('tu voz')) return false; if(!RECL.fCat.has(cat)) return false;
    if(!RECL.fMacro.has(_rNorm(r[RECL_COL.macro]))) return false;                  // Col Z
    if(!RECL.fAnio.has(_rNorm(r[RECL_COL.anio]))) return false;                    // Col AH
    return true;
  });
  let h=`<div class="kb-head"><div class="kb-title">📣 Reclamos · Filtrador TMRC</div>
    <div style="font-size:.78rem;color:var(--text-muted)">${esc(RECL.file)} · ${filtradas.length} de ${RECL.rows.length} reclamos
    <button onclick="RECL={rows:[],file:'',fMacro:new Set(),fCia:new Set(['Antucoya','Zaldivar','Centinela']),fCat:new Set(),fAnio:new Set(),loaded:false};renderReclamosFiltro()" style="margin-left:10px;background:none;border:1px solid var(--border);border-radius:6px;padding:3px 10px;font-size:.74rem;cursor:pointer">↻ Cargar otro Excel</button></div></div>`;
  h+=`<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:14px">
    <div style="font-size:.72rem;font-weight:700;color:var(--primary);text-transform:uppercase;margin-bottom:3px">Compañía (col. M)</div>
    <div>${['Centinela','Antucoya','Zaldivar'].map(c=>chip(RECL.fCia,c,'rToggleCia')).join('')}</div>
    <div style="font-size:.72rem;font-weight:700;color:var(--primary);text-transform:uppercase;margin:9px 0 3px">Macro estado (col. Z)</div>
    <div>${macros.map(m=>chip(RECL.fMacro,m,'rToggleMacro')).join('')}</div>
    <div style="font-size:.72rem;font-weight:700;color:var(--primary);text-transform:uppercase;margin:9px 0 3px">Categoría (col. B — Tu Voz excluida)</div>
    <div>${cats.map(c=>chip(RECL.fCat,c,'rToggleCat')).join('')}</div>
    <div style="font-size:.72rem;font-weight:700;color:var(--primary);text-transform:uppercase;margin:9px 0 3px">Año (col. AH)</div>
    <div>${anios.map(a=>chip(RECL.fAnio,a,'rToggleAnio')).join('')}</div>
    <div style="font-size:.7rem;color:var(--text-muted);margin-top:8px">✓ Fecha de eliminación (col. Y): solo registros vacíos · Tiempo de gestión (col. AD): <span style="background:#e02020;color:#fff;padding:1px 6px;border-radius:4px">rojo &gt; 30 días</span></div>
  </div>`;
  ['Centinela','Antucoya','Zaldivar'].filter(c=>RECL.fCia.has(c)).forEach(cia=>{
    const rows=filtradas.filter(r=>_rCiaNorm(r[RECL_COL.cia])===cia);
    if(!rows.length) return;
    // agrupar por empresa denunciada
    rows.sort((a,b)=>_rNorm(a[RECL_COL.denunciada]).localeCompare(_rNorm(b[RECL_COL.denunciada]))||_rNorm(a[RECL_COL.creacion]).localeCompare(_rNorm(b[RECL_COL.creacion])));
    h+=`<div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;color:var(--primary);text-transform:uppercase;margin:16px 0 6px">${cia} <span style="font-weight:400;font-size:.8rem;color:var(--text-muted)">(${rows.length})</span></div>`;
    h+=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.76rem;background:#fff">
      <thead><tr style="background:var(--primary);color:#fff">${['RECLAMO','FECHA INGRESO','ESTADO RECLAMO','DÍAS EN GESTIÓN','COMPAÑÍA','CATEGORÍA','CONCEPTO RECLAMO','MONTO','EMPRESA DENUNCIADA','PROVEEDOR AFECTADO','LOCALIDAD AFECTADO','ESTATUS'].map(t=>'<th style="padding:7px 8px;text-align:left;font-size:.68rem">'+t+'</th>').join('')}</tr></thead><tbody>`;
    let prevDen=null, span=0;
    // calcular rowspans
    const spans=[]; rows.forEach((r,i)=>{ const d=_rNorm(r[RECL_COL.denunciada]); if(i===0||d!==_rNorm(rows[i-1][RECL_COL.denunciada])){ spans.push({i,n:1,d}); } else { spans[spans.length-1].n++; } });
    const spanStart={}; spans.forEach(sp=>{ spanStart[sp.i]=sp.n; });
    rows.forEach((r,i)=>{
      const dias=parseInt(r[RECL_COL.tgestion])||0;
      const diasCell=`<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center"><span style="background:${dias>30?'#e02020':'#28a745'};color:#fff;padding:2px 8px;border-radius:4px;font-weight:700">${dias}</span></td>`;
      const fecha=_rNorm(r[RECL_COL.creacion]).slice(0,10).split('-').reverse().join('-');
      const monto=r[RECL_COL.montoCorr]!=null&&r[RECL_COL.montoCorr]!==''?r[RECL_COL.montoCorr]:r[RECL_COL.monto];
      const montoF=monto?('$ '+Number(monto).toLocaleString('es-CL')):'-';
      h+='<tr>'
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap">${esc(_rNorm(r[RECL_COL.cod]))}</td>`
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap">${esc(fecha)}</td>`
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(_rNorm(r[RECL_COL.macro]))}</td>`
        +diasCell
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(cia)}</td>`
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(_rNorm(r[RECL_COL.cat]))}</td>`
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(_rNorm(r[RECL_COL.sub])||_rNorm(r[RECL_COL.titulo]).slice(0,40))}</td>`
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap">${montoF}</td>`
        +(spanStart[i]?`<td rowspan="${spanStart[i]}" style="padding:6px 8px;border-bottom:1px solid #ccc;border-left:1px solid #eee;vertical-align:middle;text-align:center;font-weight:600">${esc(_rNorm(r[RECL_COL.denunciada])||'-')}</td>`:'')
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(_rNorm(r[RECL_COL.provAfect])||'-')}</td>`
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(_rNorm(r[RECL_COL.loc])||'-')}</td>`
        +`<td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(_rNorm(r[RECL_COL.estado]))}</td>`
        +'</tr>';
    });
    h+='</tbody></table></div>';
  });
  cont.innerHTML=h;
}
function cargarExcelReclamos(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'array',cellDates:false});
      const ws=wb.Sheets['Reclamos']||wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:true});
      RECL.rows=rows.slice(1).filter(r=>r[RECL_COL.cod]);
      RECL.file=file.name; RECL.loaded=true;
      RECL.fMacro=new Set(); RECL.fCat=new Set(); RECL.fAnio=new Set();
      showToast('Excel cargado: '+RECL.rows.length+' reclamos (solo en memoria)','success');
      renderReclamosFiltro();
    }catch(err){ showToast('No se pudo leer el Excel: '+err.message,'err'); }
  };
  reader.readAsArrayBuffer(file);
}
function rToggleCia(v){ RECL.fCia.has(v)?RECL.fCia.delete(v):RECL.fCia.add(v); renderReclamosFiltro(); }
function rToggleMacro(v){ RECL.fMacro.has(v)?RECL.fMacro.delete(v):RECL.fMacro.add(v); renderReclamosFiltro(); }
function rToggleCat(v){ RECL.fCat.has(v)?RECL.fCat.delete(v):RECL.fCat.add(v); renderReclamosFiltro(); }
function rToggleAnio(v){ RECL.fAnio.has(v)?RECL.fAnio.delete(v):RECL.fAnio.add(v); renderReclamosFiltro(); }

// ── TABLEROS KANBAN ─────────────────────────────────────────────────────────
function renderBoard(board){
  const def=KB_BOARDS[board]; const cont=document.getElementById('kanbanContent');
  const cards=KB.cards.filter(c=>c.tablero===board);
  let comunaFilter='';
  if(board==='prov_locales'){
    const comunas=[...new Set(cards.map(c=>c.localidad).filter(Boolean))].sort();
    comunaFilter=`<select id="kbComunaFilter" onchange="renderBoard('prov_locales')" style="border:1.5px solid var(--border);border-radius:7px;padding:6px 10px;font-size:.85rem">
      <option value="">Todas las comunas</option>${comunas.map(x=>`<option ${KB._comuna===x?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
  }
  let html=`<div class="kb-head">
    <div class="kb-title">${def.titulo}</div>
    <div style="display:flex;gap:8px;align-items:center">${comunaFilter}
      ${board==='prov_locales'?`<button class="kb-add" onclick="kbImportarDesdeDirectorio()">⇩ Desde directorio</button>`:''}
      <button class="kb-add" onclick="kbOpenCard('${board}')">➕ Agregar</button>
    </div></div>`;
  html+='<div class="kb-board">';
  const selComuna = board==='prov_locales' ? (document.getElementById('kbComunaFilter')?.value||'') : '';
  KB._comuna=selComuna;
  def.cols.forEach(col=>{
    let colCards=cards.filter(c=>(c.columna||def.cols[0])===col);
    if(board==='prov_locales' && selComuna) colCards=colCards.filter(c=>c.localidad===selComuna);
    html+=`<div class="kb-col" data-col="${esc(col)}" ondragover="kbDragOver(event,this)" ondragleave="this.classList.remove('over')" ondrop="kbDrop(event,'${board}','${esc(col)}',this)">
      <div class="kb-col-head">${esc(col)}<span class="kb-col-count">${colCards.length}</span></div>
      <div class="kb-col-body">
        ${colCards.length?colCards.map(c=>kbCardHTML(c)).join(''):'<div class="kb-empty">—</div>'}
      </div></div>`;
  });
  html+='</div>';
  cont.innerHTML=html;
}

function kbCardHTML(c){
  const pri=(c.prioridad||'media').toLowerCase();
  const d=c.datos||{};
  return `<div class="kb-card" draggable="true" ondragstart="kbDragStart(event,'${c.card_id}')" ondragend="this.classList.remove('drag')" onclick="kbOpenCard('${c.tablero}','${c.card_id}')" style="border-left-color:${pri==='alta'?'#D0311B':pri==='baja'?'#16a34a':'#F2A900'}">
    <div class="kb-card-tit">${esc(c.titulo||'(sin título)')}</div>
    ${c.descripcion?`<div class="kb-card-desc">${esc(c.descripcion).slice(0,120)}</div>`:''}
    <div class="kb-card-meta">
      ${c.responsable?`<span class="kb-chip">👤 ${esc(c.responsable)}</span>`:''}
      ${c.faena?`<span class="kb-chip">⛏ ${esc(c.faena)}</span>`:''}
      ${c.localidad?`<span class="kb-chip">📍 ${esc(c.localidad)}</span>`:''}
      ${c.fecha_limite?`<span class="kb-chip">📅 ${esc(c.fecha_limite)}</span>`:''}
      <span class="kb-chip pri-${pri}">${pri}</span>
    </div>
    ${c.updated_by?`<div class="kb-card-foot"><span>✏ ${esc(c.updated_by)}</span><span>${(c.updated_at||'').slice(0,10)}</span></div>`:''}
  </div>`;
}

// drag & drop
let _kbDragId=null;
function kbDragStart(e,id){ _kbDragId=id; e.target.classList.add('drag'); e.dataTransfer.effectAllowed='move'; }
function kbDragOver(e,el){ e.preventDefault(); el.classList.add('over'); }
async function kbDrop(e,board,col,el){
  e.preventDefault(); el.classList.remove('over');
  if(!_kbDragId) return;
  const card=KB.cards.find(c=>c.card_id===_kbDragId); _kbDragId=null;
  if(!card || card.columna===col) return;
  card.columna=col;
  await kbSaveCard(card,'mover','Movido a "'+col+'"');
  renderBoard(board);
}

// ── MODAL CREAR/EDITAR CARD ─────────────────────────────────────────────────
function kbOpenCard(board, cardId){
  const def=KB_BOARDS[board];
  const c = cardId ? KB.cards.find(x=>x.card_id===cardId) : null;
  const isProv = board==='prov_locales';
  const m=document.getElementById('kbCardModal');
  document.getElementById('kbCardTitle').textContent=(c?'Editar':'Nueva')+' · '+def.titulo;
  document.getElementById('kbCardBoard').value=board;
  document.getElementById('kbCardId').value=cardId||'';
  document.getElementById('kbcTitulo').value=c?c.titulo||'':'';
  document.getElementById('kbcDesc').value=c?c.descripcion||'':'';
  document.getElementById('kbcResp').value=c?c.responsable||'':'';
  document.getElementById('kbcFaena').value=c?c.faena||'':'';
  document.getElementById('kbcLocalidad').value=c?c.localidad||'':'';
  document.getElementById('kbcFechaLim').value=c?c.fecha_limite||'':'';
  document.getElementById('kbcPrioridad').value=c?(c.prioridad||'media'):'media';
  const colSel=document.getElementById('kbcColumna');
  colSel.innerHTML=def.cols.map(x=>`<option ${c&&c.columna===x?'selected':''}>${esc(x)}</option>`).join('');
  document.getElementById('kbcDelBtn').style.display=c?'inline-block':'none';
  m.style.display='flex';
}
function kbCloseCard(){ document.getElementById('kbCardModal').style.display='none'; }

async function kbSaveCardForm(){
  const board=document.getElementById('kbCardBoard').value;
  const id=document.getElementById('kbCardId').value;
  const titulo=document.getElementById('kbcTitulo').value.trim();
  if(!titulo){ showToast('El título es obligatorio','err'); return; }
  let card = id ? KB.cards.find(c=>c.card_id===id) : null;
  const isNew=!card;
  if(isNew){ card={ card_id:'kb_'+board+'_'+Date.now().toString(36), tablero:board, datos:{} }; }
  card.titulo=titulo;
  card.descripcion=document.getElementById('kbcDesc').value.trim();
  card.responsable=document.getElementById('kbcResp').value.trim();
  card.faena=document.getElementById('kbcFaena').value.trim();
  card.localidad=document.getElementById('kbcLocalidad').value.trim();
  card.fecha_limite=document.getElementById('kbcFechaLim').value.trim();
  card.prioridad=document.getElementById('kbcPrioridad').value;
  card.columna=document.getElementById('kbcColumna').value;
  if(isNew) KB.cards.push(card);
  await kbSaveCard(card, isNew?'crear':'editar', (isNew?'Creó':'Editó')+' "'+titulo+'"');
  kbCloseCard(); renderBoard(board);
  showToast('✅ Guardado','success');
}

async function kbDeleteCard(){
  const id=document.getElementById('kbCardId').value; const board=document.getElementById('kbCardBoard').value;
  if(!id) return; if(!confirm('¿Eliminar esta tarjeta?')) return;
  const card=KB.cards.find(c=>c.card_id===id);
  KB.cards=KB.cards.filter(c=>c.card_id!==id);
  try{
    await SUPA.client.from('kanban_cards').update({estado_registro:'Eliminado'}).eq('card_id',id);
    await registrarLog('kanban_'+board, id, 'eliminar', 'Eliminó "'+(card?card.titulo:id)+'"');
  }catch(e){}
  kbCloseCard(); renderBoard(board); showToast('🗑 Eliminado','success');
}

async function kbSaveCard(card, accion, detalle){
  const u=SUPA.session.user; const who=(u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u.email||'').split('@')[0];
  card.updated_by=who; card.updated_at=new Date().toISOString();
  if(!card.created_by) card.created_by=who;
  try{
    await SUPA.client.from('kanban_cards').upsert({
      card_id:card.card_id, tablero:card.tablero, columna:card.columna||'',
      titulo:card.titulo||'', descripcion:card.descripcion||'', responsable:card.responsable||'',
      faena:card.faena||'', localidad:card.localidad||'', prioridad:card.prioridad||'media',
      fecha:card.fecha||'', fecha_limite:card.fecha_limite||'', ref_proveedor:card.ref_proveedor||'',
      datos:card.datos||{}, estado_registro:'Activo',
      created_by:card.created_by, updated_by:who, updated_at:card.updated_at
    }, {onConflict:'card_id'});
    await registrarLog('kanban_'+card.tablero, card.card_id, accion, detalle);
  }catch(e){ showToast('Error al guardar: '+e.message,'err'); }
}

// importar proveedores del directorio a "Proveedores Locales"
async function kbImportarDesdeDirectorio(){
  if(!PROVEEDORES.length){ showToast('No hay proveedores en el directorio','warning'); return; }
  const existentes=new Set(KB.cards.filter(c=>c.tablero==='prov_locales').map(c=>c.ref_proveedor));
  const nuevos=PROVEEDORES.filter(p=>!existentes.has(p._id));
  if(!nuevos.length){ showToast('Todos los proveedores ya están en el tablero','warning'); return; }
  if(!confirm('¿Importar '+nuevos.length+' proveedores del directorio como prospectos?')) return;
  for(const p of nuevos){
    const card={ card_id:'kb_pl_'+p._id, tablero:'prov_locales', columna:'Prospecto',
      titulo:dispName(p), descripcion:(p.rubrosNorm||[]).join(', '),
      localidad:p.localidad||'', ref_proveedor:p._id, prioridad:'media', datos:{rut:p.rut_empresa} };
    KB.cards.push(card);
    await kbSaveCard(card,'crear','Importado del directorio');
  }
  renderBoard('prov_locales'); showToast('✅ '+nuevos.length+' importados','success');
}

// ── CUMPLIMIENTO RCA ────────────────────────────────────────────────────────
let RCA_VIEW='empresas';
function renderRCA(){
  const cont=document.getElementById('kanbanContent');
  cont.innerHTML=`<div class="kb-head"><div class="kb-title">Cumplimiento RCA</div>
    <div style="display:flex;gap:8px">
      <button class="kb-add" onclick="rcaOpenEmpresa()">➕ Empresa contratista</button>
      <button class="kb-add" onclick="rcaOpenCompra()" style="background:linear-gradient(135deg,#5F6973,#7a858f)">➕ Compra</button>
    </div></div>
    <div class="rca-tabs">
      <button class="rca-tab ${RCA_VIEW==='empresas'?'active':''}" onclick="rcaTab('empresas')">🏢 Empresas y contactos</button>
      <button class="rca-tab ${RCA_VIEW==='compras'?'active':''}" onclick="rcaTab('compras')">🧾 Compras de bienes/servicios</button>
    </div>
    <div id="rcaBody"></div>`;
  RCA_VIEW==='compras'?renderRCACompras():renderRCAEmpresas();
}
function rcaTab(v){ RCA_VIEW=v; renderRCA(); }

function renderRCAEmpresas(){
  const body=document.getElementById('rcaBody');
  if(!KB.contratistas.length){ body.innerHTML='<div class="kb-empty">No hay empresas contratistas. Agrega la primera con "➕ Empresa contratista".</div>'; return; }
  body.innerHTML=KB.contratistas.map(emp=>{
    const cts=KB.ctraContactos.filter(c=>c.contratista_id===emp.contratista_id);
    const nCompras=KB.compras.filter(c=>c.contratista_id===emp.contratista_id).length;
    return `<div class="rca-card">
      <div class="rca-card-head">
        <div><div class="rca-emp-name">${esc(emp.nombre)}</div>
          <div class="rca-emp-meta">${emp.rut?'RUT '+esc(emp.rut)+' · ':''}${emp.comuna?'📍 '+esc(emp.comuna):''}${emp.faena?' · ⛏ '+esc(emp.faena):''} · 🧾 ${nCompras} compras</div>
          ${emp.notas?`<div class="rca-emp-meta">📝 ${esc(emp.notas)}</div>`:''}</div>
        <div class="rca-ct-actions">
          <button class="mini-btn" onclick="rcaOpenContacto('${emp.contratista_id}')" title="Agregar contacto">👤➕</button>
          <button class="mini-btn" onclick="rcaOpenEmpresa('${emp.contratista_id}')" title="Editar">✏</button>
          <button class="mini-btn" onclick="rcaDelEmpresa('${emp.contratista_id}')" title="Eliminar">🗑</button>
        </div>
      </div>
      <div class="rca-sub">
        <div class="rca-sub-t">Contactos (${cts.length})</div>
        ${cts.length?cts.map(c=>`<div class="rca-contact">
          <div class="rca-ct-main"><b>${esc(c.nombre||'')}</b>${c.cargo?' · '+esc(c.cargo):''}<br>
            <span style="font-size:.76rem;color:var(--text-muted)">${c.telefono?'📞 '+esc(c.telefono):''} ${c.correo?'· ✉ '+esc(c.correo):''}</span>
            ${c.notas?`<br><span style="font-size:.76rem;color:var(--text-muted)">📝 ${esc(c.notas)}</span>`:''}</div>
          <div class="rca-ct-actions">
            ${c.telefono?`<a class="mini-btn" href="tel:${telLink(c.telefono)}">📞</a>`:''}
            ${c.correo?`<a class="mini-btn" href="mailto:${esc(c.correo)}">✉</a>`:''}
            <button class="mini-btn" onclick="rcaOpenContacto('${emp.contratista_id}','${c.contacto_id}')">✏</button>
            <button class="mini-btn" onclick="rcaDelContacto('${c.contacto_id}')">🗑</button>
          </div></div>`).join(''):'<div class="kb-empty">Sin contactos</div>'}
      </div></div>`;
  }).join('');
}

function renderRCACompras(){
  const body=document.getElementById('rcaBody');
  const fmt=n=>'$'+(n||0).toLocaleString('es-CL');
  // filtros
  const anios=[...new Set(KB.compras.map(c=>c.anio).filter(Boolean))].sort().reverse();
  const comunas=[...new Set(KB.compras.map(c=>c.comuna).filter(Boolean))].sort();
  const fa=RCA_F.anio, fc=RCA_F.comuna;
  let rows=KB.compras.slice();
  if(fa) rows=rows.filter(c=>c.anio===fa);
  if(fc) rows=rows.filter(c=>c.comuna===fc);
  const total=rows.reduce((s,c)=>s+(c.monto_neto||0),0);
  const empById=id=>{const e=KB.contratistas.find(x=>x.contratista_id===id);return e?e.nombre:'—';};
  body.innerHTML=`
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
      <select onchange="RCA_F.anio=this.value;renderRCACompras()" style="border:1.5px solid var(--border);border-radius:7px;padding:6px 10px"><option value="">Todos los años</option>${anios.map(a=>`<option ${fa===a?'selected':''}>${a}</option>`).join('')}</select>
      <select onchange="RCA_F.comuna=this.value;renderRCACompras()" style="border:1.5px solid var(--border);border-radius:7px;padding:6px 10px"><option value="">Todas las comunas</option>${comunas.map(a=>`<option ${fc===a?'selected':''}>${esc(a)}</option>`).join('')}</select>
      <span style="margin-left:auto;font-weight:700;color:var(--primary)">Total neto: ${fmt(total)} · ${rows.length} compras</span>
      <button class="kb-add" onclick="rcaImportCompras()" style="background:linear-gradient(135deg,#5F6973,#7a858f)">⇪ Importar Excel</button>
    </div>
    <div style="overflow-x:auto"><table class="rca-table">
      <thead><tr><th>Año</th><th>Fecha</th><th>Empresa contratista</th><th>Empresa (compra)</th><th>RUT</th><th>Comuna</th><th>N° Factura</th><th>Bien/Servicio</th><th style="text-align:right">Monto neto</th><th></th></tr></thead>
      <tbody>${rows.length?rows.map(c=>`<tr>
        <td>${esc(c.anio||'')}</td><td>${esc(c.fecha||'')}</td><td>${esc(empById(c.contratista_id))}</td>
        <td>${esc(c.nombre_empresa||'')}</td><td>${esc(c.rut||'')}</td><td>${esc(c.comuna||'')}</td>
        <td>${esc(c.num_factura||'')}</td><td>${esc(c.tipo_bien_servicio||'')}</td>
        <td style="text-align:right">${fmt(c.monto_neto)}</td>
        <td><button class="mini-btn" onclick="rcaOpenCompra('${c.compra_id}')">✏</button></td></tr>`).join(''):'<tr><td colspan="10" class="kb-empty">Sin compras registradas</td></tr>'}</tbody>
    </table></div>`;
}
let RCA_F={anio:'',comuna:''};

// modales RCA empresa
function rcaOpenEmpresa(id){
  const e=id?KB.contratistas.find(x=>x.contratista_id===id):null;
  document.getElementById('rcaEmpId').value=id||'';
  document.getElementById('rcaEmpNombre').value=e?e.nombre||'':'';
  document.getElementById('rcaEmpRut').value=e?e.rut||'':'';
  document.getElementById('rcaEmpComuna').value=e?e.comuna||'':'';
  document.getElementById('rcaEmpFaena').value=e?e.faena||'':'';
  document.getElementById('rcaEmpNotas').value=e?e.notas||'':'';
  document.getElementById('rcaEmpModal').style.display='flex';
}
function rcaCloseEmpresa(){ document.getElementById('rcaEmpModal').style.display='none'; }
async function rcaSaveEmpresa(){
  const nombre=document.getElementById('rcaEmpNombre').value.trim();
  if(!nombre){ showToast('Nombre obligatorio','err'); return; }
  const id=document.getElementById('rcaEmpId').value;
  let e=id?KB.contratistas.find(x=>x.contratista_id===id):null; const isNew=!e;
  if(isNew){ e={contratista_id:'ctra_'+Date.now().toString(36)}; }
  e.nombre=nombre; e.rut=document.getElementById('rcaEmpRut').value.trim();
  e.comuna=document.getElementById('rcaEmpComuna').value.trim();
  e.faena=document.getElementById('rcaEmpFaena').value.trim();
  e.notas=document.getElementById('rcaEmpNotas').value.trim();
  if(isNew) KB.contratistas.push(e);
  const who=kbWho();
  try{
    await SUPA.client.from('contratistas').upsert({
      contratista_id:e.contratista_id, nombre:e.nombre, rut:e.rut, comuna:e.comuna, faena:e.faena, notas:e.notas,
      estado_registro:'Activo', created_by:e.created_by||who, updated_by:who, updated_at:new Date().toISOString()
    },{onConflict:'contratista_id'});
    await registrarLog('rca_empresa', e.contratista_id, isNew?'crear':'editar', (isNew?'Creó':'Editó')+' empresa '+nombre);
  }catch(err){ showToast('Error: '+err.message,'err'); }
  rcaCloseEmpresa(); renderRCA(); showToast('✅ Empresa guardada','success');
}
async function rcaDelEmpresa(id){
  if(!confirm('¿Eliminar la empresa y sus contactos/compras?')) return;
  KB.contratistas=KB.contratistas.filter(x=>x.contratista_id!==id);
  try{ await SUPA.client.from('contratistas').update({estado_registro:'Eliminado'}).eq('contratista_id',id);
    await registrarLog('rca_empresa',id,'eliminar','Eliminó empresa contratista'); }catch(e){}
  renderRCA(); showToast('🗑 Eliminada','success');
}

// modales RCA contacto
function rcaOpenContacto(empId, ctId){
  const c=ctId?KB.ctraContactos.find(x=>x.contacto_id===ctId):null;
  document.getElementById('rcaCtEmp').value=empId;
  document.getElementById('rcaCtId').value=ctId||'';
  document.getElementById('rcaCtNombre').value=c?c.nombre||'':'';
  document.getElementById('rcaCtCargo').value=c?c.cargo||'':'';
  document.getElementById('rcaCtTel').value=c?c.telefono||'':'';
  document.getElementById('rcaCtCorreo').value=c?c.correo||'':'';
  document.getElementById('rcaCtNotas').value=c?c.notas||'':'';
  document.getElementById('rcaCtModal').style.display='flex';
}
function rcaCloseContacto(){ document.getElementById('rcaCtModal').style.display='none'; }
async function rcaSaveContacto(){
  const nombre=document.getElementById('rcaCtNombre').value.trim();
  if(!nombre){ showToast('Nombre obligatorio','err'); return; }
  const empId=document.getElementById('rcaCtEmp').value; const id=document.getElementById('rcaCtId').value;
  let c=id?KB.ctraContactos.find(x=>x.contacto_id===id):null; const isNew=!c;
  if(isNew){ c={contacto_id:'cct_'+Date.now().toString(36), contratista_id:empId}; }
  c.nombre=nombre; c.cargo=document.getElementById('rcaCtCargo').value.trim();
  c.telefono=document.getElementById('rcaCtTel').value.trim();
  c.correo=document.getElementById('rcaCtCorreo').value.trim();
  c.notas=document.getElementById('rcaCtNotas').value.trim();
  if(isNew) KB.ctraContactos.push(c);
  const who=kbWho();
  try{
    await SUPA.client.from('contratista_contactos').upsert({
      contacto_id:c.contacto_id, contratista_id:empId, nombre:c.nombre, correo:c.correo,
      telefono:c.telefono, cargo:c.cargo, notas:c.notas, estado_registro:'Activo',
      created_by:c.created_by||who, updated_by:who, updated_at:new Date().toISOString()
    },{onConflict:'contacto_id'});
    await registrarLog('rca_contacto', c.contacto_id, isNew?'crear':'editar', (isNew?'Creó':'Editó')+' contacto '+nombre);
  }catch(err){ showToast('Error: '+err.message,'err'); }
  rcaCloseContacto(); renderRCA(); showToast('✅ Contacto guardado','success');
}
async function rcaDelContacto(id){
  if(!confirm('¿Eliminar contacto?')) return;
  KB.ctraContactos=KB.ctraContactos.filter(x=>x.contacto_id!==id);
  try{ await SUPA.client.from('contratista_contactos').update({estado_registro:'Eliminado'}).eq('contacto_id',id);
    await registrarLog('rca_contacto',id,'eliminar','Eliminó contacto'); }catch(e){}
  renderRCA();
}

// modal RCA compra
function rcaOpenCompra(id){
  const c=id?KB.compras.find(x=>x.compra_id===id):null;
  const sel=document.getElementById('rcaCompEmp');
  sel.innerHTML='<option value="">— Selecciona empresa contratista —</option>'+KB.contratistas.map(e=>`<option value="${e.contratista_id}" ${c&&c.contratista_id===e.contratista_id?'selected':''}>${esc(e.nombre)}</option>`).join('');
  document.getElementById('rcaCompId').value=id||'';
  document.getElementById('rcaCompAnio').value=c?c.anio||'':String(new Date().getFullYear());
  document.getElementById('rcaCompFecha').value=c?c.fecha||'':'';
  document.getElementById('rcaCompEmpNom').value=c?c.nombre_empresa||'':'';
  document.getElementById('rcaCompRut').value=c?c.rut||'':'';
  document.getElementById('rcaCompComuna').value=c?c.comuna||'':'';
  document.getElementById('rcaCompFactura').value=c?c.num_factura||'':'';
  document.getElementById('rcaCompTipo').value=c?c.tipo_bien_servicio||'':'';
  document.getElementById('rcaCompMonto').value=c?c.monto_neto||'':'';
  document.getElementById('rcaCompModal').style.display='flex';
}
function rcaCloseCompra(){ document.getElementById('rcaCompModal').style.display='none'; }
async function rcaSaveCompra(){
  const empId=document.getElementById('rcaCompEmp').value;
  if(!empId){ showToast('Selecciona la empresa contratista','err'); return; }
  const id=document.getElementById('rcaCompId').value;
  let c=id?KB.compras.find(x=>x.compra_id===id):null; const isNew=!c;
  if(isNew){ c={compra_id:'cmp_'+Date.now().toString(36)}; }
  c.contratista_id=empId;
  c.anio=document.getElementById('rcaCompAnio').value.trim();
  c.fecha=document.getElementById('rcaCompFecha').value.trim();
  c.nombre_empresa=document.getElementById('rcaCompEmpNom').value.trim();
  c.rut=document.getElementById('rcaCompRut').value.trim();
  c.comuna=document.getElementById('rcaCompComuna').value.trim();
  c.num_factura=document.getElementById('rcaCompFactura').value.trim();
  c.tipo_bien_servicio=document.getElementById('rcaCompTipo').value.trim();
  c.monto_neto=parseInt(String(document.getElementById('rcaCompMonto').value).replace(/[^0-9]/g,''))||0;
  if(isNew) KB.compras.push(c);
  const who=kbWho();
  try{
    await SUPA.client.from('compras').upsert({
      compra_id:c.compra_id, contratista_id:empId, anio:c.anio, fecha:c.fecha,
      nombre_empresa:c.nombre_empresa, rut:c.rut, comuna:c.comuna, num_factura:c.num_factura,
      tipo_bien_servicio:c.tipo_bien_servicio, monto_neto:c.monto_neto, estado_registro:'Activo',
      created_by:c.created_by||who, updated_by:who, updated_at:new Date().toISOString()
    },{onConflict:'compra_id'});
    await registrarLog('rca_compra', c.compra_id, isNew?'crear':'editar', (isNew?'Registró':'Editó')+' compra '+(c.num_factura||''));
  }catch(err){ showToast('Error: '+err.message,'err'); }
  rcaCloseCompra(); renderRCA(); showToast('✅ Compra guardada','success');
}

// importar compras desde Excel
function rcaImportCompras(){
  if(!KB.contratistas.length){ showToast('Primero crea al menos una empresa contratista','warning'); return; }
  document.getElementById('rcaXlsInput').click();
}
async function rcaProcesarExcelCompras(files){
  if(!files||!files.length) return;
  const f=files[0]; const buf=await f.arrayBuffer();
  const wb=XLSX.read(buf,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
  if(!rows.length){ showToast('Excel vacío','warning'); return; }
  const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const pick=(r,keys)=>{ for(const k of Object.keys(r)){ if(keys.some(x=>norm(k).includes(x))) return r[k]; } return ''; };
  // empresa contratista por defecto: la primera, o match por nombre/rut
  let count=0; const who=kbWho(); const batch=[];
  for(const r of rows){
    const nomEmp=String(pick(r,['nombreempres','empresa','razon'])||'').trim();
    const rut=String(pick(r,['rut'])||'').trim();
    let emp=KB.contratistas.find(e=>norm(e.nombre)===norm(nomEmp)||(rut&&norm(e.rut)===norm(rut)));
    if(!emp) emp=KB.contratistas[0];
    const compra={
      compra_id:'cmp_'+Date.now().toString(36)+'_'+count, contratista_id:emp.contratista_id,
      anio:String(pick(r,['ano','año','anio','year'])||'').trim(),
      fecha:String(pick(r,['fecha','date'])||'').trim(),
      nombre_empresa:nomEmp, rut:rut, comuna:String(pick(r,['comuna'])||'').trim(),
      num_factura:String(pick(r,['factura','nfactura','nrofactura'])||'').trim(),
      tipo_bien_servicio:String(pick(r,['tipo','bien','servicio'])||'').trim(),
      monto_neto:parseInt(String(pick(r,['monto','neto','montoneto'])||'').replace(/[^0-9]/g,''))||0,
      estado_registro:'Activo', created_by:who, updated_by:who
    };
    KB.compras.push(compra); batch.push(compra); count++;
  }
  try{
    await SUPA.client.from('compras').insert(batch.map(({...c})=>c));
    await registrarLog('rca_compra','import','crear','Importó '+count+' compras desde Excel');
  }catch(e){ showToast('Error al subir: '+e.message,'err'); }
  document.getElementById('rcaXlsInput').value='';
  RCA_VIEW='compras'; renderRCA(); showToast('✅ '+count+' compras importadas','success');
}

function kbWho(){ const u=SUPA.session.user; return (u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u.email||'').split('@')[0]; }

// ── DASHBOARD KANBAN ────────────────────────────────────────────────────────
function renderKbDashboard(){
  const cont=document.getElementById('kanbanContent');
  const byBoard=b=>KB.cards.filter(c=>c.tablero===b).length;
  const totalCompras=KB.compras.reduce((s,c)=>s+(c.monto_neto||0),0);
  const fmt=n=>'$'+(n||0).toLocaleString('es-CL');
  // compromisos vencidos / pendientes
  const comp=KB.cards.filter(c=>c.tablero==='compromisos');
  const compPend=comp.filter(c=>c.columna!=='Cumplido').length;
  const reclAbiertos=KB.cards.filter(c=>c.tablero==='reclamos'&&c.columna!=='Resuelto').length;
  // compras por comuna
  const porComuna={};
  KB.compras.forEach(c=>{ const k=c.comuna||'Sin comuna'; porComuna[k]=(porComuna[k]||0)+(c.monto_neto||0); });
  const comunasArr=Object.entries(porComuna).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxC=Math.max(1,...comunasArr.map(x=>x[1]));
  // compras por año
  const porAnio={};
  KB.compras.forEach(c=>{ const k=c.anio||'s/a'; porAnio[k]=(porAnio[k]||0)+(c.monto_neto||0); });
  const aniosArr=Object.entries(porAnio).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));

  cont.innerHTML=`<div class="kb-head"><div class="kb-title">Dashboard Kanban</div></div>
  <div class="kb-dash-grid">
    <div class="kb-kpi"><div class="kb-kpi-n">${byBoard('proyectos')}</div><div class="kb-kpi-l">📁 Proyectos / Iniciativas</div></div>
    <div class="kb-kpi"><div class="kb-kpi-n">${byBoard('reuniones')}</div><div class="kb-kpi-l">🗓️ Reuniones</div></div>
    <div class="kb-kpi"><div class="kb-kpi-n">${compPend}</div><div class="kb-kpi-l">✅ Compromisos pendientes</div></div>
    <div class="kb-kpi"><div class="kb-kpi-n">${reclAbiertos}</div><div class="kb-kpi-l">📣 Reclamos abiertos</div></div>
    <div class="kb-kpi"><div class="kb-kpi-n">${KB.contratistas.length}</div><div class="kb-kpi-l">🏢 Empresas contratistas</div></div>
    <div class="kb-kpi"><div class="kb-kpi-n">${byBoard('prov_locales')}</div><div class="kb-kpi-l">🏪 Proveedores locales</div></div>
    <div class="kb-kpi"><div class="kb-kpi-n" style="font-size:1.4rem">${fmt(totalCompras)}</div><div class="kb-kpi-l">🧾 Compras totales (neto)</div></div>
    <div class="kb-kpi"><div class="kb-kpi-n">${KB.compras.length}</div><div class="kb-kpi-l">📄 N° de compras</div></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">
    <div class="kb-kpi"><div class="rca-sub-t">Compras por comuna (top)</div>
      ${comunasArr.length?comunasArr.map(([k,v])=>`<div style="margin:8px 0">
        <div style="display:flex;justify-content:space-between;font-size:.8rem"><span>${esc(k)}</span><span style="font-weight:700">${fmt(v)}</span></div>
        <div style="background:#eef2f3;border-radius:6px;height:8px;margin-top:3px"><div style="background:linear-gradient(90deg,#00A399,#006973);height:8px;border-radius:6px;width:${(v/maxC*100).toFixed(0)}%"></div></div>
      </div>`).join(''):'<div class="kb-empty">Sin datos de compras</div>'}
    </div>
    <div class="kb-kpi"><div class="rca-sub-t">Compras por año</div>
      ${aniosArr.length?aniosArr.map(([k,v])=>`<div style="margin:8px 0">
        <div style="display:flex;justify-content:space-between;font-size:.8rem"><span>${esc(k)}</span><span style="font-weight:700">${fmt(v)}</span></div>
        <div style="background:#eef2f3;border-radius:6px;height:8px;margin-top:3px"><div style="background:linear-gradient(90deg,#F2A900,#d89400);height:8px;border-radius:6px;width:${(v/Math.max(1,...aniosArr.map(x=>x[1]))*100).toFixed(0)}%"></div></div>
      </div>`).join(''):'<div class="kb-empty">Sin datos</div>'}
    </div>
  </div>`;
}


function kbWhoSafe(){ try{ const u=SUPA.session.user; return (u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u.email||'').split('@')[0]; }catch(e){ return ''; } }


// ═══════════════════════════════════════════════════════════════════════════
// STORAGE (Supabase) + LICITACIONES ampliadas (v3.0)
// ═══════════════════════════════════════════════════════════════════════════

// Subir un archivo al bucket 'documentos' y devolver su URL pública
async function subirArchivo(file, carpeta){
  if(!SUPA.client || !SUPA.session){ showToast('Inicia sesión para subir archivos','err'); return null; }
  const ext=(file.name.split('.').pop()||'bin').toLowerCase();
  const path=(carpeta||'misc')+'/'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)+'.'+ext;
  const {error}=await SUPA.client.storage.from('documentos').upload(path,file,{upsert:false,contentType:file.type||undefined});
  if(error){ showToast('Error al subir: '+error.message,'err'); return null; }
  const {data}=SUPA.client.storage.from('documentos').getPublicUrl(path);
  return data.publicUrl;
}

// ── URLs firmadas (P-1b) ────────────────────────────────────────────────
// El bucket 'documentos' puede volverse privado. Las URLs guardadas en la
// base siguen siendo las "públicas" de siempre: acá se les extrae la ruta
// y se firman al momento de usarlas, no al guardarlas. Si el bucket sigue
// público, createSignedUrl() funciona igual, así que esto no rompe nada
// mientras tanto.
function _rutaDocumento(url){
  if(!url) return null;
  const m=String(url).match(/\/object\/public\/documentos\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : url;
}
async function resolverUrlFirmada(url, ttlSeg){
  if(!url) return null;
  if(!SUPA.client) return url;
  try{
    const {data,error}=await SUPA.client.storage.from('documentos').createSignedUrl(_rutaDocumento(url), ttlSeg||3600);
    if(error||!data) return null;
    return data.signedUrl;
  }catch(e){ return null; }
}
// Abre en pestaña nueva un <a data-firmar-link="..."> firmando la URL antes.
async function abrirFirmado(el){
  const raw=el.getAttribute('data-firmar-link');
  const u=await resolverUrlFirmada(raw);
  window.open(u||raw,'_blank');
  return false;
}
// Firma en el sitio cualquier <img data-firmar="..."> insertado en el DOM.
function _hidratarImgsFirmadas(root){
  const imgs=[];
  if(root.nodeType===1 && root.matches && root.matches('img[data-firmar]')) imgs.push(root);
  if(root.querySelectorAll) imgs.push(...root.querySelectorAll('img[data-firmar]'));
  imgs.forEach(async img=>{
    const raw=img.getAttribute('data-firmar'); if(!raw) return;
    img.removeAttribute('data-firmar');
    const u=await resolverUrlFirmada(raw);
    if(u) img.src=u;
  });
}
(function _iniciarHidratacionImagenes(){
  const start=()=>new MutationObserver(muts=>{
    muts.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType===1) _hidratarImgsFirmadas(n); }));
  }).observe(document.body,{childList:true,subtree:true});
  if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
})();

// ── Valor dólar manual (editable, "valor de hoy") ──
function editarDolarHoy(){
  const t=getTarifas();
  const v=prompt('Valor del dólar de hoy (CLP por USD):', t.tc||950);
  if(v===null) return;
  const num=parseFloat(String(v).replace(/[^0-9.]/g,''));
  if(!num||num<=0){ showToast('Valor inválido','err'); return; }
  DB.tarifas=DB.tarifas||{}; DB.tarifas.tc=num;
  saveDB(); actualizarUSD();
  if(typeof renderLicitacionesGlobal==='function') renderLicitacionesGlobal();
  showToast('💲 Dólar actualizado a $'+num.toLocaleString('es-CL')+' CLP','success');
}

// ── Editar una licitación existente ──
function editarLicitacion(pid, aid){
  const ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid);
  if(!ac) return;
  LIC_EDIT={pid, aid};
  document.getElementById('licEditCo').innerHTML=AMSA_EMPRESAS.map(e=>`<option value="${e}" ${ac.compania===e?'selected':''}>Minera ${e}</option>`).join('');
  document.getElementById('licEditServ').value=ac.servicio||'';
  document.getElementById('licEditDesc').value=ac.descripcion_servicio||'';
  document.getElementById('licEditArea').value=ac.area||'';
  document.getElementById('licEditAdc').value=ac.adc||'';
  document.getElementById('licEditOs').value=ac.os||'';
  document.getElementById('licEditMonto').value=ac.monto_clp||'';
  document.getElementById('licEditInicio').value=ac.fecha_inicio||'';
  document.getElementById('licEditFin').value=ac.fecha_fin||'';
  document.getElementById('licEditUsd').value=ac.usd_manual||'';
  // previews archivos
  document.getElementById('licEditPdfLink').innerHTML=ac.pdf_url?`<a href="javascript:void(0)" data-firmar-link="${ac.pdf_url}" onclick="return abrirFirmado(this)">📄 Ver PDF actual</a>`:'<span style="color:var(--text-muted)">Sin PDF</span>';
  ['1','2','3'].forEach(n=>{
    const u=ac['foto'+n+'_url'];
    document.getElementById('licFotoPrev'+n).innerHTML=u?`<img data-firmar="${u}" style="width:100%;height:70px;object-fit:cover;border-radius:6px">`:'';
  });
  document.getElementById('licEditModal').style.display='flex';
}
function cerrarEditLic(){ document.getElementById('licEditModal').style.display='none'; }
let LIC_EDIT={pid:null,aid:null};

async function guardarEditLicitacion(){
  const {pid,aid}=LIC_EDIT; if(!pid) return;
  const ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid); if(!ac) return;
  ac.compania=document.getElementById('licEditCo').value;
  ac.servicio=document.getElementById('licEditServ').value.trim();
  ac.descripcion_servicio=document.getElementById('licEditDesc').value.trim();
  ac.area=document.getElementById('licEditArea').value.trim();
  ac.adc=document.getElementById('licEditAdc').value.trim();
  ac.os=document.getElementById('licEditOs').value.trim();
  ac.monto_clp=parseInt(String(document.getElementById('licEditMonto').value).replace(/[^0-9]/g,''))||0;
  ac.fecha_inicio=document.getElementById('licEditInicio').value;
  ac.fecha_fin=document.getElementById('licEditFin').value;
  ac.usd_manual=parseFloat(document.getElementById('licEditUsd').value)||null;
  ac.anio=(ac.fecha_inicio||'').slice(0,4);

  // subir PDF si hay
  const pdfF=document.getElementById('licEditPdf').files[0];
  if(pdfF){ const u=await subirArchivo(pdfF,'licitaciones/pdf'); if(u) ac.pdf_url=u; }
  // subir fotos
  for(const n of ['1','2','3']){
    const f=document.getElementById('licEditFoto'+n).files[0];
    if(f){ const u=await subirArchivo(f,'licitaciones/fotos'); if(u) ac['foto'+n+'_url']=u; }
  }
  await saveDB();
  await licPushSupabase(pid, ac);
  await registrarLog('licitacion', ac.id, 'editar', 'Editó licitación '+(ac.os||ac.compania));
  cerrarEditLic();
  renderAcuerdos(pid);
  if(typeof renderLicitacionesGlobal==='function') renderLicitacionesGlobal();
  showToast('✅ Licitación actualizada','success');
}

// Guardar una licitación (acuerdo) individual en Supabase
async function licPushSupabase(pid, ac){
  if(!SUPA.client || !SUPA.session) return;
  const provId=(PROVEEDORES.find(x=>x._id===pid)||{})._proveedorId||pid;
  try{
    await SUPA.client.from('acuerdos').upsert({
      acuerdo_id:ac.id, proveedor_id:provId, compania:ac.compania||'', proveedor:ac.proveedor||'',
      servicio:ac.servicio||'', descripcion_servicio:ac.descripcion_servicio||'', area:ac.area||'',
      adc:ac.adc||'', os:ac.os||'', monto_clp:ac.monto_clp||0, periodo:ac.periodo||'',
      fecha_inicio:ac.fecha_inicio||'', fecha_fin:ac.fecha_fin||'', localidad:ac.localidad||'', rubro:ac.rubro||'',
      anio:ac.anio||(ac.fecha_inicio||'').slice(0,4), usd_manual:ac.usd_manual||null,
      pdf_url:ac.pdf_url||'', foto1_url:ac.foto1_url||'', foto2_url:ac.foto2_url||'', foto3_url:ac.foto3_url||'',
      visitas_json:ac.visitas_json||[], completado:!!ac.completado, fecha_completado:ac.fecha_completado||'', estado_registro:'Activo',
      created_by:ac.created_by||miNombre(), updated_by:miNombre(), updated_at:new Date().toISOString()
    },{onConflict:'acuerdo_id'});
  }catch(e){ console.warn('licPush',e); }
}


// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO VISITAS v3.0 — participantes, compromisos, minuta PDF + firma
// ═══════════════════════════════════════════════════════════════════════════
let VISITA_ACT = null; // visita en edición

// Faena/logo según comuna del proveedor
function faenaPorComuna(comuna){
  const c=(comuna||'').toLowerCase();
  if(c.includes('sierra gorda')||c.includes('michilla')) return 'Centinela';
  if(c.includes('maría elena')||c.includes('maria elena')) return 'Antucoya';
  if(c.includes('san pedro')||c.includes('peine')) return 'Zaldívar';
  return 'Antofagasta Minerals';
}

// Abrir nueva visita estructurada
function nuevaVisitaV3(pid){
  if(!SUPA.session){ showToast('Inicia sesión','err'); return; }
  const p=PROVEEDORES.find(x=>x._id===pid); if(!p) return;
  VISITA_ACT={
    visita_id:'vis_'+Date.now().toString(36), proveedor_id:pid,
    fecha:new Date().toISOString().slice(0,10), titulo:'',
    responsable_nombre:miNombre(), responsable_email:(SUPA.session.user.email||''),
    faena:faenaPorComuna(p.localidad), comuna:p.localidad||'',
    participantes:[], compromisos:[], firma_data:'', resumen:'', fotos:[]
  };
  renderVisitaForm();
  document.getElementById('visitaV3Modal').style.display='flex';
}

function cerrarVisitaV3(){ document.getElementById('visitaV3Modal').style.display='none'; VISITA_ACT=null; }

function renderVisitaForm(){
  const v=VISITA_ACT; if(!v) return;
  document.getElementById('visV3Resp').textContent=v.responsable_nombre+' · '+v.responsable_email;
  document.getElementById('visV3Faena').textContent='Faena: '+v.faena;
  document.getElementById('visV3Fecha').value=v.fecha;
  document.getElementById('visV3Titulo').value=v.titulo;
  if(document.getElementById('visV3Resumen')) document.getElementById('visV3Resumen').value=v.resumen||'';
  if(!v.fotos) v.fotos=[];
  [0,1,2].forEach(i=>{
    const url=v.fotos[i];
    const img=document.getElementById('visFotoImg'+i), th=document.getElementById('visFotoThumb'+i), pl=document.getElementById('visFotoPlaceholder'+i);
    if(img&&th&&pl){ if(url){ resolverUrlFirmada(url).then(u=>{ img.src=u||url; }); th.style.display='block'; pl.style.display='none'; } else { th.style.display='none'; pl.style.display='flex'; } }
  });
  // participantes
  document.getElementById('visV3Parts').innerHTML=v.participantes.map((pt,i)=>`
    <div class="vis-part-row">
      <b>${esc(pt.nombre)}</b> · ${esc(pt.empresa)} ${pt.correo?'· '+esc(pt.correo):''} ${pt.telefono?'· '+esc(pt.telefono):''}
      <button onclick="delParticipante(${i})" class="mini-btn" style="float:right" title="Eliminar">🗑</button>
      <button onclick="editParticipante(${i})" class="mini-btn" style="float:right" title="Editar">✏</button>
    </div>`).join('')||'<div class="kb-empty">Sin participantes</div>';
  // compromisos
  document.getElementById('visV3Comps').innerHTML=v.compromisos.map((c,ci)=>`
    <div class="vis-comp">
      <div class="vis-comp-head"><b>Compromiso ${ci+1}:</b> ${esc(c.descripcion)}
        <button onclick="delCompromiso(${ci})" class="mini-btn" style="float:right">🗑</button></div>
      <div class="vis-resp-list">
        ${(c.responsables||[]).map((r,ri)=>`<div class="vis-resp">👤 ${esc(r.nombre)} · ${esc(r.area||'')} ${r.fecha_limite?'· 📅 '+esc(r.fecha_limite):''}
          <button onclick="delResponsable(${ci},${ri})" class="mini-btn">✕</button></div>`).join('')}
      </div>
      <button class="vis-add-resp" onclick="addResponsable(${ci})">＋ responsable</button>
    </div>`).join('')||'<div class="kb-empty">Sin compromisos</div>';
}

// Vuelca lo que el usuario tiene escrito en los campos del formulario a
// VISITA_ACT ANTES de re-renderizar. Sin esto, agregar un participante o un
// compromiso llamaba a renderVisitaForm(), que reescribe los inputs desde
// VISITA_ACT y borraba el título/resumen recién tipeados.
function _syncVisitaCampos(){
  const v=VISITA_ACT; if(!v) return;
  const t=document.getElementById('visV3Titulo'); if(t) v.titulo=t.value;
  const r=document.getElementById('visV3Resumen'); if(r) v.resumen=r.value;
  const f=document.getElementById('visV3Fecha'); if(f && f.value) v.fecha=f.value;
}

// participantes
function addParticipante(){
  _syncVisitaCampos();
  const n=document.getElementById('vpNombre').value.trim();
  const e=document.getElementById('vpEmpresa').value.trim();
  if(!n||!e){ showToast('Nombre y empresa son obligatorios','err'); return; }
  VISITA_ACT.participantes.push({nombre:n,empresa:e,correo:document.getElementById('vpCorreo').value.trim(),telefono:document.getElementById('vpTel').value.trim()});
  ['vpNombre','vpEmpresa','vpCorreo','vpTel'].forEach(id=>document.getElementById(id).value='');
  renderVisitaForm();
}
// Editar un participante: lo carga de vuelta a los campos y lo saca de la lista,
// para que al corregir y «Agregar» vuelva a quedar bien (arregla nombres mal escritos).
function editParticipante(i){
  _syncVisitaCampos();
  const p=VISITA_ACT.participantes[i]; if(!p) return;
  document.getElementById('vpNombre').value=p.nombre||'';
  document.getElementById('vpEmpresa').value=p.empresa||'';
  document.getElementById('vpCorreo').value=p.correo||'';
  document.getElementById('vpTel').value=p.telefono||'';
  VISITA_ACT.participantes.splice(i,1);
  renderVisitaForm();
  document.getElementById('vpNombre').focus();
}
function delParticipante(i){ _syncVisitaCampos(); VISITA_ACT.participantes.splice(i,1); renderVisitaForm(); }

// compromisos
function addCompromiso(){
  _syncVisitaCampos();
  const d=document.getElementById('vcDesc').value.trim();
  if(!d){ showToast('Describe el compromiso','err'); return; }
  VISITA_ACT.compromisos.push({descripcion:d, responsables:[]});
  document.getElementById('vcDesc').value='';
  renderVisitaForm();
}
function delCompromiso(ci){ _syncVisitaCampos(); VISITA_ACT.compromisos.splice(ci,1); renderVisitaForm(); }
let _respCompIdx=null;
function addResponsable(ci){
  _respCompIdx=ci;
  const parts=VISITA_ACT.participantes||[];
  const sel=document.getElementById('respAsistente');
  sel.innerHTML=parts.map((p,i)=>`<option value="${i}">${esc(p.nombre)} — ${esc(p.empresa||'')}</option>`).join('')+'<option value="__otro">➕ Otros (escribir manual)</option>';
  document.getElementById('respOtroBox').style.display=parts.length?'none':'block';
  if(!parts.length) sel.innerHTML='<option value="__otro">➕ Otros (escribir manual)</option>';
  document.getElementById('respOtroNombre').value='';
  document.getElementById('respArea').value='';
  document.getElementById('respFecha').value='';
  respAsistenteChange();
  document.getElementById('respModal').style.display='flex';
}
function respAsistenteChange(){
  const v=document.getElementById('respAsistente').value;
  document.getElementById('respOtroBox').style.display = v==='__otro'?'block':'none';
}
function cerrarResp(){ document.getElementById('respModal').style.display='none'; _respCompIdx=null; }
function guardarResp(){
  const ci=_respCompIdx; if(ci===null) return;
  const v=document.getElementById('respAsistente').value;
  let nombre='';
  if(v==='__otro'){ nombre=document.getElementById('respOtroNombre').value.trim(); }
  else { const p=VISITA_ACT.participantes[parseInt(v)]; nombre=p?p.nombre:''; }
  if(!nombre){ showToast('Indica el responsable','err'); return; }
  const area=document.getElementById('respArea').value.trim();
  const fl=document.getElementById('respFecha').value;
  VISITA_ACT.compromisos[ci].responsables.push({nombre,area,fecha_limite:fl,origen:v==='__otro'?'otro':'asistente'});
  cerrarResp();
  _syncVisitaCampos();
  renderVisitaForm();
}
function delResponsable(ci,ri){ _syncVisitaCampos(); VISITA_ACT.compromisos[ci].responsables.splice(ri,1); renderVisitaForm(); }

// ═══ ESTANDARIZACIÓN DE HABITABILIDAD v2 (criterios ponderados + hitos, compartida con MGI) ═══
const EST_RUBROS=['Hotelería','Lavandería','Alimentación'];
const EST_ICONOS=['⚡','🐀','📐','🏥','🧯','🚿','🔥','💧','🧺','🍽','🏨','🛠','📄','✅','🔒','♻️','🌡️','🧹'];
let EST2={rubro:'Hotelería',criterios:[],avances:[],loaded:false};
function rubrosHabitabilidad(p){
  const s2=[...(p.rubrosNorm||[]),...(p.giros||[]),p.actividad_principal||''].join(' ').toLowerCase();
  const out=[];
  if(esRubroHotel(p)) out.push('Hotelería');
  if(/lavander/.test(s2)) out.push('Lavandería');
  if(/aliment|gastron|banquete|casino|comida/.test(s2)) out.push('Alimentación');
  return out;
}
function estHitos(c){ try{ const h=JSON.parse(c.hitos_json||'[]'); return Array.isArray(h)?h:[]; }catch(e){ return []; } }
function estAvanceDe(provId,c){
  const av=EST2.avances.find(a=>a.proveedor_id===provId&&a.criterio_id===c.id&&a.estado_registro!=='Eliminado');
  let done=[]; if(av){ try{ done=JSON.parse(av.hitos_done||'[]'); }catch(e){} }
  const hitos=estHitos(c);
  if(!hitos.length) return done.includes(0)?100:0;
  const tot=hitos.reduce((a,h)=>a+(+h.p||0),0)||100;
  const got=hitos.reduce((a,h,i)=>a+(done.includes(i)?(+h.p||0):0),0);
  return Math.round(got/tot*100);
}
function estPctProveedor(provId,rubro){
  const crits=EST2.criterios.filter(c=>c.rubro===rubro&&c.estado_registro!=='Eliminado');
  if(!crits.length) return 0;
  const sumP=crits.reduce((a,c)=>a+(+c.ponderacion||0),0)||100;
  return Math.round(crits.reduce((a,c)=>a+(+c.ponderacion||0)*estAvanceDe(provId,c),0)/sumP);
}
async function estCargar(){
  const [{data:cr},{data:av}]=await Promise.all([
    SUPA.client.from('est_criterios').select('*').neq('estado_registro','Eliminado'),
    SUPA.client.from('est_avance').select('*').neq('estado_registro','Eliminado')
  ]);
  EST2.criterios=cr||[]; EST2.avances=av||[]; EST2.loaded=true;
}
function estProvsRubro(rubro){ return PROVEEDORES.filter(p=>rubrosHabitabilidad(p).includes(rubro)); }
async function renderEstPage(){
  if(!SUPA.session){ document.getElementById('estPageBody').innerHTML='<div style="color:var(--text-muted)">Inicia sesión para ver la estandarización.</div>'; return; }
  if(!EST2.loaded) await estCargar();
  // tabs rubro
  document.getElementById('estRubroTabs').innerHTML=EST_RUBROS.map(r=>{
    const on=EST2.rubro===r;
    const ico={'Hotelería':'🏨','Lavandería':'🧺','Alimentación':'🍽'}[r];
    return `<button onclick="EST2.rubro='${r}';renderEstPage()" style="padding:9px 18px;border-radius:10px;border:2px solid var(--primary);background:${on?'var(--primary)':'#fff'};color:${on?'#fff':'var(--primary)'};font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.95rem;text-transform:uppercase;cursor:pointer">${ico} ${r}</button>`;
  }).join('');
  const rubro=EST2.rubro;
  const provs=estProvsRubro(rubro);
  const crits=EST2.criterios.filter(c=>c.rubro===rubro).sort((a,b)=>a.nombre.localeCompare(b.nombre));
  const pctGlobal=provs.length?Math.round(provs.reduce((a,p)=>a+estPctProveedor(p._proveedorId||p._id,rubro),0)/provs.length):0;
  const colG=pctGlobal>=80?'#1e7e34':pctGlobal>=50?'#b8860b':'#c0311b';
  const sumPond=crits.reduce((a,c)=>a+(+c.ponderacion||0),0);
  let h=`<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px 22px;margin-bottom:16px;display:flex;align-items:center;gap:18px;flex-wrap:wrap">
    <div style="font-size:2.4rem;font-weight:800;color:${colG}">${pctGlobal}%</div>
    <div style="flex:1;min-width:220px">
      <div style="font-size:.78rem;font-weight:700;color:var(--primary);text-transform:uppercase">Estandarización total · ${rubro} <span style="font-weight:400;color:var(--text-muted)">(${provs.length} proveedor${provs.length===1?'':'es'})</span></div>
      <div style="height:11px;background:#e0e0e0;border-radius:6px;margin-top:6px;overflow:hidden"><div style="height:100%;width:${pctGlobal}%;background:${colG}"></div></div>
    </div>
    ${sumPond!==100?`<div style="background:#fff3cd;color:#8a6100;border-radius:8px;padding:6px 12px;font-size:.76rem;font-weight:700">⚠ Ponderaciones suman ${sumPond}% (ideal 100%)</div>`:''}
  </div>`;
  // ── criterios ──
  h+=`<div style="font-family:'Barlow Condensed',sans-serif;font-size:1.08rem;font-weight:800;color:var(--primary);text-transform:uppercase;margin:6px 0 8px">Criterios de ${rubro}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px;margin-bottom:10px">`;
  crits.forEach(c=>{
    const hitos=estHitos(c);
    const icoHtml=(c.icono||'📋').startsWith('data:')?`<img src="${c.icono}" style="width:30px;height:30px;object-fit:contain">`:`<span style="font-size:1.5rem">${c.icono||'📋'}</span>`;
    h+=`<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">${icoHtml}
        <div style="flex:1;font-weight:700;font-size:.92rem">${esc(c.nombre)}</div>
        <b class="solo-admin" onclick="estDelCriterio('${c.id}')" style="cursor:pointer;color:#c0311b" title="Eliminar">✕</b></div>
      <div style="display:flex;align-items:center;gap:7px;font-size:.78rem;color:var(--text-muted);margin-bottom:8px">Ponderación en ${rubro}:
        <input type="number" min="0" max="100" value="${c.ponderacion||0}" onchange="estSetPond('${c.id}',this.value)" style="width:58px;border:1px solid var(--border);border-radius:6px;padding:4px 6px;text-align:center"> %</div>
      <div style="font-size:.72rem;font-weight:700;color:var(--primary);text-transform:uppercase;margin-bottom:4px">Hitos (bloques que suman 100%)</div>
      ${hitos.map((ht,i)=>`<div style="display:flex;align-items:center;gap:6px;font-size:.8rem;margin-bottom:4px">
        <span style="flex:1">${esc(ht.n)}</span>
        <input type="number" min="0" max="100" step="10" value="${ht.p||0}" onchange="estSetHitoPct('${c.id}',${i},this.value)" style="width:54px;border:1px solid var(--border);border-radius:5px;padding:3px 5px;text-align:center;font-size:.78rem"> %
        <b onclick="estDelHito('${c.id}',${i})" style="cursor:pointer;color:#c0311b;font-size:.85rem">✕</b></div>`).join('')}
      <div style="display:flex;gap:5px;margin-top:6px">
        <input id="nh_${c.id}" placeholder="Nuevo hito..." style="flex:1;border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:.78rem">
        <input id="nhp_${c.id}" type="number" min="0" max="100" step="10" placeholder="%" style="width:52px;border:1px solid var(--border);border-radius:6px;padding:5px 5px;font-size:.78rem;text-align:center">
        <button onclick="estAddHito('${c.id}')" style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:.78rem;font-weight:700;cursor:pointer">＋</button></div>
    </div>`;
  });
  // card nuevo criterio
  h+=`<div style="background:var(--primary-light);border:2px dashed var(--primary);border-radius:12px;padding:14px 16px">
    <div style="font-weight:700;font-size:.88rem;color:var(--primary);margin-bottom:8px">＋ Nuevo criterio de ${rubro}</div>
    <input id="estNcNombre" placeholder="Nombre del criterio..." style="width:100%;border:1px solid var(--border);border-radius:7px;padding:7px 10px;font-size:.85rem;margin-bottom:7px">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:7px;flex-wrap:wrap">
      <select id="estNcIcono" style="border:1px solid var(--border);border-radius:7px;padding:6px;font-size:1rem">${EST_ICONOS.map(i=>`<option>${i}</option>`).join('')}</select>
      <label style="font-size:.74rem;color:var(--primary);cursor:pointer;text-decoration:underline">o subir icono<input type="file" accept="image/*" style="display:none" onchange="estIconoArchivo(this)"></label>
      <span id="estNcIconoPrev"></span>
      <input id="estNcPond" type="number" min="0" max="100" placeholder="Pond. %" style="width:80px;border:1px solid var(--border);border-radius:7px;padding:6px;font-size:.82rem;text-align:center">
    </div>
    <button onclick="estAddCriterio()" style="background:var(--primary);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:700;cursor:pointer;font-size:.85rem">＋ Crear criterio</button>
  </div></div>`;
  // ── proveedores ──
  h+=`<div style="font-family:'Barlow Condensed',sans-serif;font-size:1.08rem;font-weight:800;color:var(--primary);text-transform:uppercase;margin:18px 0 8px">Avance por proveedor · ${rubro}</div>`;
  if(!provs.length) h+='<div style="color:var(--text-muted);font-size:.86rem">No hay proveedores de este rubro.</div>';
  provs.sort((a,b)=>dispName(a).localeCompare(dispName(b))).forEach(p=>{
    const pid=p._proveedorId||p._id;
    const pct=estPctProveedor(pid,rubro);
    const c2=pct>=80?'#1e7e34':pct>=50?'#b8860b':'#c0311b';
    h+=`<div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:11px 15px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="const d=document.getElementById('estdet_${pid}');d.style.display=d.style.display==='none'?'block':'none'">
        <div style="flex:1;font-weight:700;font-size:.9rem">${esc(dispName(p))} <span style="font-weight:400;font-size:.76rem;color:var(--text-muted)">· ${esc(p.localidad||'')}</span></div>
        <div style="width:130px;height:9px;background:#e0e0e0;border-radius:5px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${c2}"></div></div>
        <div style="font-weight:800;color:${c2};width:46px;text-align:right">${pct}%</div><span style="color:var(--text-muted)">▾</span></div>
      <div id="estdet_${pid}" style="display:none;border-top:1px dashed var(--border);margin-top:9px;padding-top:9px">
        ${crits.map(c=>{
          const hitos=estHitos(c);
          const av=EST2.avances.find(a=>a.proveedor_id===pid&&a.criterio_id===c.id&&a.estado_registro!=='Eliminado');
          let done=[]; if(av){ try{ done=JSON.parse(av.hitos_done||'[]'); }catch(e){} }
          const pctC=estAvanceDe(pid,c);
          const icoH=(c.icono||'📋').startsWith('data:')?`<img src="${c.icono}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle">`:c.icono||'📋';
          return `<div style="margin-bottom:9px"><div style="font-size:.82rem;font-weight:700">${icoH} ${esc(c.nombre)} <span style="color:${pctC>=80?'#1e7e34':pctC>=50?'#b8860b':'#c0311b'}">· ${pctC}%</span> <span style="font-weight:400;color:var(--text-muted);font-size:.72rem">(pond. ${c.ponderacion||0}%)</span></div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px">
          ${hitos.length?hitos.map((ht,i)=>`<label style="display:inline-flex;align-items:center;gap:5px;background:${done.includes(i)?'#e6f4ea':'#f4f4f4'};border:1px solid ${done.includes(i)?'#1e7e34':'#ddd'};border-radius:14px;padding:4px 10px;font-size:.76rem;cursor:pointer"><input type="checkbox" ${done.includes(i)?'checked':''} onchange="estToggleHito('${pid}','${c.id}',${i})" style="width:auto">${esc(ht.n)} (${ht.p}%)</label>`).join(''):`<label style="display:inline-flex;align-items:center;gap:5px;background:${done.includes(0)?'#e6f4ea':'#f4f4f4'};border:1px solid ${done.includes(0)?'#1e7e34':'#ddd'};border-radius:14px;padding:4px 10px;font-size:.76rem;cursor:pointer"><input type="checkbox" ${done.includes(0)?'checked':''} onchange="estToggleHito('${pid}','${c.id}',0)" style="width:auto">Completado (100%)</label>`}
          </div></div>`;
        }).join('')}
      </div></div>`;
  });
  document.getElementById('estPageBody').innerHTML=h;
  actualizarUISegunRol&&actualizarUISegunRol();
}
let _estIconoData='';
function estIconoArchivo(input){
  const file=input.files[0]; if(!file) return;
  const rd=new FileReader();
  rd.onload=e=>{ const img=new Image(); img.onload=()=>{ const cv=document.createElement('canvas'); const m=64; const sc=Math.min(1,m/Math.max(img.width,img.height)); cv.width=Math.round(img.width*sc); cv.height=Math.round(img.height*sc); cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height); _estIconoData=cv.toDataURL('image/png'); document.getElementById('estNcIconoPrev').innerHTML='<img src="'+_estIconoData+'" style="width:26px;height:26px;vertical-align:middle">'; }; img.src=e.target.result; };
  rd.readAsDataURL(file);
}
async function estAddCriterio(){
  const nom=(document.getElementById('estNcNombre').value||'').trim(); if(!nom){ showToast('Escribe el nombre','err'); return; }
  const icono=_estIconoData||document.getElementById('estNcIcono').value||'📋';
  const pond=Math.max(0,Math.min(100,parseInt(document.getElementById('estNcPond').value)||0));
  const id='ec_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  const {error}=await SUPA.client.from('est_criterios').insert({id,nombre:nom,rubro:EST2.rubro,icono,ponderacion:pond,hitos_json:'[]',updated_by:miNombre(),updated_at:new Date().toISOString()});
  if(error){ showToast('Error: '+error.message,'err'); return; }
  _estIconoData=''; await estCargar(); renderEstPage();
}
async function estSetPond(cid,val){
  const n=Math.max(0,Math.min(100,parseInt(val)||0));
  await SUPA.client.from('est_criterios').update({ponderacion:n,updated_by:miNombre(),updated_at:new Date().toISOString()}).eq('id',cid);
  const c=EST2.criterios.find(x=>x.id===cid); if(c) c.ponderacion=n; renderEstPage();
}
async function estAddHito(cid){
  const c=EST2.criterios.find(x=>x.id===cid); if(!c) return;
  const nom=(document.getElementById('nh_'+cid).value||'').trim(); if(!nom){ showToast('Nombre del hito','err'); return; }
  const p=Math.max(0,Math.min(100,parseInt(document.getElementById('nhp_'+cid).value)||10));
  const hitos=estHitos(c); hitos.push({n:nom,p});
  const suma=hitos.reduce((a,x)=>a+(+x.p||0),0);
  if(suma>100){ showToast('Los hitos superan 100% ('+suma+'%)','err'); return; }
  await SUPA.client.from('est_criterios').update({hitos_json:JSON.stringify(hitos),updated_by:miNombre(),updated_at:new Date().toISOString()}).eq('id',cid);
  c.hitos_json=JSON.stringify(hitos); renderEstPage();
}
async function estSetHitoPct(cid,i,val){
  const c=EST2.criterios.find(x=>x.id===cid); if(!c) return;
  const hitos=estHitos(c); if(!hitos[i]) return;
  hitos[i].p=Math.max(0,Math.min(100,parseInt(val)||0));
  await SUPA.client.from('est_criterios').update({hitos_json:JSON.stringify(hitos),updated_at:new Date().toISOString()}).eq('id',cid);
  c.hitos_json=JSON.stringify(hitos); renderEstPage();
}
async function estDelHito(cid,i){
  const c=EST2.criterios.find(x=>x.id===cid); if(!c) return;
  const hitos=estHitos(c); hitos.splice(i,1);
  await SUPA.client.from('est_criterios').update({hitos_json:JSON.stringify(hitos),updated_at:new Date().toISOString()}).eq('id',cid);
  c.hitos_json=JSON.stringify(hitos); renderEstPage();
}
async function estDelCriterio(cid){
  if(!confirm('¿Eliminar este criterio para todo el rubro?')) return;
  const {error}=await SUPA.client.from('est_criterios').update({estado_registro:'Eliminado',updated_at:new Date().toISOString()}).eq('id',cid);
  if(error){ showToast('Solo admin puede eliminar','err'); return; }
  await estCargar(); renderEstPage();
}
async function estToggleHito(provId,cid,i){
  const avId='av_'+provId+'_'+cid;
  let av=EST2.avances.find(a=>a.id===avId);
  let done=[]; if(av){ try{ done=JSON.parse(av.hitos_done||'[]'); }catch(e){} }
  const ix=done.indexOf(i); if(ix>=0) done.splice(ix,1); else done.push(i);
  const payload={id:avId,proveedor_id:provId,criterio_id:cid,hitos_done:JSON.stringify(done),estado_registro:'Activo',updated_by:miNombre(),updated_at:new Date().toISOString()};
  const {error}=await SUPA.client.from('est_avance').upsert(payload,{onConflict:'id'});
  if(error){ showToast('Error: '+error.message,'err'); return; }
  if(av){ av.hitos_done=JSON.stringify(done); av.estado_registro='Activo'; } else EST2.avances.push(payload);
  if(currentPage==='estandarizacion') renderEstPage(); else renderEstModalProv();
}
// ── modal por proveedor (botón en ficha) ──
let EST_MODAL_PID=null, EST_MODAL_P=null;
async function abrirEstandarizacion(pid){
  if(!SUPA.session){ showToast('Inicia sesión','err'); return; }
  const p=PROVEEDORES.find(x=>x._id===pid); if(!p) return;
  if(!EST2.loaded) await estCargar();
  EST_MODAL_PID=p._proveedorId||pid; EST_MODAL_P=p;
  document.getElementById('estProvNombre').textContent=dispName(p)+' · '+(p.localidad||'');
  document.getElementById('estModal').style.display='flex';
  renderEstModalProv();
}
function cerrarEstandarizacion(){ document.getElementById('estModal').style.display='none'; EST_MODAL_PID=null; }
function renderEstModalProv(){
  if(!EST_MODAL_PID) return;
  const p=EST_MODAL_P, pid=EST_MODAL_PID;
  const rubros=rubrosHabitabilidad(p);
  const cont=document.getElementById('estLista'); const res=document.getElementById('estResumen');
  if(!rubros.length){ cont.innerHTML='<div style="font-size:.85rem;color:var(--text-muted)">Este proveedor no pertenece a los rubros de habitabilidad (Hotelería, Lavandería, Alimentación).</div>'; res.innerHTML=''; return; }
  let resH='', h='';
  rubros.forEach(rubro=>{
    const crits=EST2.criterios.filter(c=>c.rubro===rubro).sort((a,b)=>a.nombre.localeCompare(b.nombre));
    const pct=estPctProveedor(pid,rubro);
    const col=pct>=80?'#1e7e34':pct>=50?'#b8860b':'#c0311b';
    resH+=`<div style="background:var(--primary-light);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:12px;margin-bottom:6px">
      <div style="font-size:1.4rem;font-weight:800;color:${col}">${pct}%</div>
      <div style="flex:1"><div style="font-size:.74rem;font-weight:700;color:var(--primary);text-transform:uppercase">${rubro}</div>
      <div style="height:8px;background:#e0e0e0;border-radius:4px;margin-top:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${col}"></div></div></div></div>`;
    crits.forEach(c=>{
      const hitos=estHitos(c);
      const av=EST2.avances.find(a=>a.proveedor_id===pid&&a.criterio_id===c.id&&a.estado_registro!=='Eliminado');
      let done=[]; if(av){ try{ done=JSON.parse(av.hitos_done||'[]'); }catch(e){} }
      const pctC=estAvanceDe(pid,c);
      const icoH=(c.icono||'📋').startsWith('data:')?`<img src="${c.icono}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle">`:c.icono||'📋';
      h+=`<div style="background:#f7fafa;border-radius:9px;padding:10px 12px;margin-bottom:7px">
        <div style="font-size:.85rem;font-weight:700">${icoH} ${esc(c.nombre)} <span style="color:${pctC>=80?'#1e7e34':pctC>=50?'#b8860b':'#c0311b'}">· ${pctC}%</span> <span style="font-weight:400;font-size:.7rem;color:var(--text-muted)">(${rubro} · pond. ${c.ponderacion||0}%)</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px">
        ${hitos.length?hitos.map((ht,i)=>`<label style="display:inline-flex;align-items:center;gap:5px;background:${done.includes(i)?'#e6f4ea':'#fff'};border:1px solid ${done.includes(i)?'#1e7e34':'#ddd'};border-radius:14px;padding:4px 10px;font-size:.75rem;cursor:pointer"><input type="checkbox" ${done.includes(i)?'checked':''} onchange="estToggleHito('${pid}','${c.id}',${i})" style="width:auto">${esc(ht.n)} (${ht.p}%)</label>`).join(''):`<label style="display:inline-flex;align-items:center;gap:5px;background:${done.includes(0)?'#e6f4ea':'#fff'};border:1px solid ${done.includes(0)?'#1e7e34':'#ddd'};border-radius:14px;padding:4px 10px;font-size:.75rem;cursor:pointer"><input type="checkbox" ${done.includes(0)?'checked':''} onchange="estToggleHito('${pid}','${c.id}',0)" style="width:auto">Completado (100%)</label>`}
        </div></div>`;
    });
  });
  res.innerHTML=resH; cont.innerHTML=h+'<div style="font-size:.72rem;color:var(--text-muted);margin-top:6px">Los criterios y ponderaciones se administran en la pestaña 📏 Estandarización.</div>';
}

// ── Fotos de la visita (se suben de inmediato a Storage, igual que las fotos de ficha) ──
async function agregarVisFoto(input, idx){
  const file = input.files[0]; if(!file) return;
  const v=VISITA_ACT; if(!v){ showToast('Abre una visita primero','err'); return; }
  const provLocal=PROVEEDORES.find(x=>x._id===v.proveedor_id)||{};
  const carpetaId=provLocal._proveedorId||v.proveedor_id||'general';
  showToast('Subiendo foto '+(idx+1)+'...');
  try{
    const comprimida=await _comprimirImagen(file);
    const url=await subirArchivo(comprimida,'visitas/'+carpetaId);
    if(!url) throw new Error('No se pudo subir la foto');
    if(!v.fotos) v.fotos=[];
    v.fotos[idx]=url;
    document.getElementById('visFotoImg'+idx).src=url;
    document.getElementById('visFotoThumb'+idx).style.display='block';
    document.getElementById('visFotoPlaceholder'+idx).style.display='none';
    showToast('✅ Foto '+(idx+1)+' agregada','success');
  }catch(e){
    console.error('[VISITA FOTO] Error:',e);
    showToast('⚠ No se pudo subir la foto: '+e.message,'err');
  }
}
function limpiarVisFotos(){
  const v=VISITA_ACT; if(!v) return;
  v.fotos=[];
  [0,1,2].forEach(i=>{
    const th=document.getElementById('visFotoThumb'+i), pl=document.getElementById('visFotoPlaceholder'+i);
    if(th) th.style.display='none'; if(pl) pl.style.display='flex';
  });
  showToast('Fotos de la visita eliminadas','success');
}

// ── FIRMA (canvas: dedo/lápiz/mouse) ──
let _firmaCtx=null,_firmando=false;
function initFirma(){
  const cv=document.getElementById('firmaCanvas'); if(!cv) return;
  const ctx=cv.getContext('2d'); _firmaCtx=ctx;
  ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.strokeStyle='#1f2a2c';
  const pos=e=>{ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:(t.clientX-r.left)*(cv.width/r.width), y:(t.clientY-r.top)*(cv.height/r.height)}; };
  const start=e=>{ e.preventDefault(); _firmando=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  const move=e=>{ if(!_firmando)return; e.preventDefault(); const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); };
  const end=()=>{ _firmando=false; };
  cv.onmousedown=start; cv.onmousemove=move; cv.onmouseup=end; cv.onmouseleave=end;
  cv.ontouchstart=start; cv.ontouchmove=move; cv.ontouchend=end;
}
function limpiarFirma(){ const cv=document.getElementById('firmaCanvas'); if(cv&&_firmaCtx) _firmaCtx.clearRect(0,0,cv.width,cv.height); }

// ── FINALIZAR VISITA → previsualizar minuta ──
function finalizarVisita(){
  const v=VISITA_ACT; if(!v) return;
  v.titulo=document.getElementById('visV3Titulo').value.trim()||'Visita a proveedor';
  v.resumen=(document.getElementById('visV3Resumen')?.value||'').trim();
  v.fecha=document.getElementById('visV3Fecha').value||v.fecha;
  if(!v.compromisos.length && !confirm('No hay compromisos. ¿Finalizar de todos modos?')) return;
  document.getElementById('minutaPreview').innerHTML=minutaHTML(v);
  montarFirmas(v);
  document.getElementById('minutaModal').style.display='flex';
}

// Lista de firmantes = responsable AM + participantes
function firmantesDe(v){
  const arr=[{nombre:v.responsable_nombre||'Responsable AM', empresa:'Antofagasta Minerals', _am:true}];
  (v.participantes||[]).forEach(p=>arr.push({nombre:p.nombre,empresa:p.empresa||''}));
  return arr;
}
let _firmaCtxs={};
function montarFirmas(v){
  const cont=document.getElementById('firmasContainer');
  const firmantes=firmantesDe(v);
  _firmaCtxs={};
  cont.innerHTML=firmantes.map((f,i)=>`
    <div style="border:1px solid var(--border);border-radius:9px;padding:10px;margin-bottom:10px">
      <div style="font-size:.82rem;font-weight:700;margin-bottom:5px">${esc(f.nombre)} <span style="font-weight:400;color:var(--text-muted)">· ${esc(f.empresa||'')}</span></div>
      <canvas id="firma_${i}" width="540" height="100" style="border:1.5px dashed var(--border);border-radius:8px;width:100%;touch-action:none;background:#fafdfd"></canvas>
      <button onclick="limpiarFirmaN(${i})" style="background:none;border:1px solid var(--border);border-radius:6px;padding:3px 10px;font-size:.74rem;cursor:pointer;margin-top:5px">Limpiar</button>
    </div>`).join('');
  setTimeout(()=>{ firmantes.forEach((f,i)=>initFirmaN(i)); },150);
}
function initFirmaN(i){
  const cv=document.getElementById('firma_'+i); if(!cv) return;
  const ctx=cv.getContext('2d'); _firmaCtxs[i]=ctx;
  ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.strokeStyle='#1f2a2c';
  let dibujando=false;
  const pos=e=>{ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:(t.clientX-r.left)*(cv.width/r.width), y:(t.clientY-r.top)*(cv.height/r.height)}; };
  const st=e=>{ e.preventDefault(); dibujando=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  const mv=e=>{ if(!dibujando)return; e.preventDefault(); const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); };
  const en=()=>{ dibujando=false; };
  cv.onmousedown=st; cv.onmousemove=mv; cv.onmouseup=en; cv.onmouseleave=en;
  cv.ontouchstart=st; cv.ontouchmove=mv; cv.ontouchend=en;
}
function limpiarFirmaN(i){ const cv=document.getElementById('firma_'+i); if(cv&&_firmaCtxs[i]) _firmaCtxs[i].clearRect(0,0,cv.width,cv.height); }
function cerrarMinuta(){ document.getElementById('minutaModal').style.display='none'; }

function minutaHTML(v){
  const p=PROVEEDORES.find(x=>x._id===v.proveedor_id)||{};
  return `<div style="font-family:'Barlow',sans-serif;color:#1f2a2c">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #00A399;padding-bottom:10px;margin-bottom:14px">
      <div><div style="font-family:'Barlow Condensed';font-weight:800;font-size:1.3rem;color:#006973">MINUTA DE VISITA</div>
        <div style="font-size:.8rem;color:#5F6973">${esc(v.faena)} · ${esc(v.fecha)}</div></div>
      <div style="font-family:'Barlow Condensed';font-weight:800;color:#00A399;text-align:right">${esc(v.faena)}<br><span style="font-size:.7rem;color:#5F6973">Antofagasta Minerals</span></div>
    </div>
    <div style="font-size:.85rem;line-height:1.7">
      <b>Proveedor:</b> ${esc(dispName(p))}<br>
      <b>Título:</b> ${esc(v.titulo)}<br>
      <b>Responsable AM:</b> ${esc(v.responsable_nombre)} (${esc(v.responsable_email)})<br>
      <b>Localidad:</b> ${esc(v.comuna)}
    </div>
    <div style="margin-top:14px"><div style="font-weight:800;color:#006973;font-size:.8rem;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:3px">Participantes</div>
      ${v.participantes.map(pt=>`<div style="font-size:.82rem;margin-top:4px">• ${esc(pt.nombre)} — ${esc(pt.empresa)} ${pt.correo?'· '+esc(pt.correo):''} ${pt.telefono?'· '+esc(pt.telefono):''}</div>`).join('')||'<div style="font-size:.8rem;color:#888">—</div>'}
    </div>
    ${(v.fotos&&v.fotos.filter(Boolean).length)?`<div style="margin-top:14px"><div style="font-weight:800;color:#006973;font-size:.8rem;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:3px">Fotografías de la visita</div>
      <div style="display:flex;gap:8px;margin-top:6px">${v.fotos.filter(Boolean).slice(0,3).map(u=>`<img data-firmar="${u}" style="width:31%;aspect-ratio:1.4;object-fit:cover;border-radius:6px;border:1px solid #ddd"/>`).join('')}</div>
    </div>`:''}
    <div style="margin-top:14px"><div style="font-weight:800;color:#006973;font-size:.8rem;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:3px">Acuerdos / Compromisos</div>
      ${v.compromisos.map((c,i)=>`<div style="font-size:.82rem;margin-top:6px"><b>${i+1}.</b> ${esc(c.descripcion)}
        ${(c.responsables||[]).map(r=>`<div style="margin-left:14px;color:#5F6973">↳ ${esc(r.nombre)} · ${esc(r.area||'')} ${r.fecha_limite?'· vence '+esc(r.fecha_limite):''}</div>`).join('')}</div>`).join('')||'<div style="font-size:.8rem;color:#888">—</div>'}
    </div>
  </div>`;
}

// ── GUARDAR + GENERImAR PDF ──
async function emitirMinuta(){
  const v=VISITA_ACT; if(!v) return;
  // recolectar firmas de cada asistente
  const firmantes=firmantesDe(v);
  v.firmas=firmantes.map((f,i)=>{
    const cv=document.getElementById('firma_'+i);
    return { nombre:f.nombre, empresa:f.empresa||'', firma_data:(cv && !canvasVacio(cv))?cv.toDataURL('image/png'):'' };
  });
  // firma del responsable AM (primera) para la portada PDF
  v.firma_data = (v.firmas[0]&&v.firmas[0].firma_data)||'';
  try{
    const doc=await generarMinutaPDF(v);
    const nombre='Minuta_'+(v.titulo||'visita').replace(/[^a-z0-9]/gi,'_')+'.pdf';
    // 1) descargar local SIEMPRE
    doc.save(nombre);
    // 2) subir a Storage y guardar en Supabase
    try{
      const blob=doc.output('blob');
      const file=new File([blob],'minuta_'+v.visita_id+'.pdf',{type:'application/pdf'});
      const url=await subirArchivo(file,'minutas');
      if(url) v.minuta_pdf_url=url;
    }catch(eUp){ console.warn('subida minuta',eUp); }
    const okGuardado=await guardarVisitaSupabase(v);
    cerrarMinuta(); cerrarVisitaV3();
    if(typeof renderVisitasV3==='function') setTimeout(()=>renderVisitasV3(v.proveedor_id),300);
    if(okGuardado){ showToast('✅ Visita guardada y minuta descargada','success'); }
    else { showToast('⚠ La minuta se descargó pero la visita NO se guardó en el sistema. Revisa tu conexión/permisos.','err'); }
  }catch(err){
    console.error('[MINUTA] error:',err);
    showToast('Error al generar PDF: '+err.message,'err');
  }
}

function canvasVacio(cv){
  try{ const ctx=cv.getContext('2d'); const d=ctx.getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<d.length;i+=4){ if(d[i]!==0) return false; } return true; }catch(e){ return false; }
}

// Genera la minuta como PDF con la API nativa de jsPDF (sin html2canvas)
async function generarMinutaPDF(v){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const p=PROVEEDORES.find(x=>x._id===v.proveedor_id)||{};
  const M=16, W=210, maxW=W-M*2;
  let y=16;

  // Encabezado con barra de color
  doc.setFillColor(0,105,115); doc.rect(0,0,W,26,'F');
  doc.setTextColor(255,255,255);
  doc.setFont('helvetica','bold'); doc.setFontSize(17);
  doc.text('MINUTA DE VISITA', M, 13);
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.text((v.faena||'')+'  ·  '+(v.fecha||''), M, 20);
  const _lgF=LOGOS_FAENA[v.faena]||LOGO_AMSA_PDF;
  try{ const _lr=(_lgF===LOGO_AMSA_PDF)?4.51:4.2; const _lw=44,_lh=_lw/_lr; doc.addImage(_lgF,'PNG',W-M-_lw,13-_lh/2,_lw,_lh); }catch(e){
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.text(String(v.faena||'Antofagasta Minerals'), W-M, 13, {align:'right'});
    doc.setFont('helvetica','normal'); doc.setFontSize(7);
    doc.text('Antofagasta Minerals', W-M, 18, {align:'right'});
  }
  y=34;

  doc.setTextColor(31,42,44);
  const linea=(label,val)=>{ doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text(label,M,y);
    const lw=doc.getTextWidth(label); doc.setFont('helvetica','normal');
    const parts=doc.splitTextToSize(String(val||'—'), maxW-lw-2);
    doc.text(parts, M+lw+2, y); y+=parts.length*5+1; };
  linea('Proveedor: ', dispName(p));
  linea('Título: ', v.titulo);
  linea('Responsable AM: ', (v.responsable_nombre||'')+' ('+(v.responsable_email||'')+')');
  linea('Localidad: ', v.comuna);
  y+=3;

  const titulo=(t)=>{ if(y>270){doc.addPage();y=20;} doc.setFillColor(228,246,245); doc.rect(M,y-4,maxW,7,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(0,105,115); doc.text(t,M+2,y); doc.setTextColor(31,42,44); y+=7; };

  // Participantes
  titulo('PARTICIPANTES');
  doc.setFont('helvetica','normal'); doc.setFontSize(9);
  if((v.participantes||[]).length){
    v.participantes.forEach(pt=>{
      if(y>278){doc.addPage();y=20;}
      const t='•  '+pt.nombre+' — '+pt.empresa+(pt.correo?'  ·  '+pt.correo:'')+(pt.telefono?'  ·  '+pt.telefono:'');
      const parts=doc.splitTextToSize(t,maxW-2); doc.text(parts,M+2,y); y+=parts.length*5;
    });
  } else { doc.text('—',M+2,y); y+=5; }
  y+=3;

  // Resumen de la reunión
  if(v.resumen&&v.resumen.trim()){
    titulo('DE QUÉ SE TRATÓ LA REUNIÓN');
    doc.setFont('helvetica','normal'); doc.setFontSize(9);
    const rp=doc.splitTextToSize(v.resumen.trim(),maxW-2);
    rp.forEach(l=>{ if(y>278){doc.addPage();y=20;} doc.text(l,M+2,y); y+=4.8; });
    y+=3;
  }

  // Fotos de la visita
  if(v.fotos&&v.fotos.filter(Boolean).length){
    const fotosB64=await Promise.all(v.fotos.filter(Boolean).slice(0,3).map(u=>_urlToBase64(u).catch(()=>null)));
    const validas=fotosB64.filter(Boolean);
    if(validas.length){
      if(y>240){doc.addPage();y=20;}
      titulo('FOTOGRAFÍAS DE LA VISITA');
      const fw=(maxW-2*6)/3, fh=fw*0.72;
      validas.forEach((b64,i)=>{ try{ doc.addImage(b64,'JPEG',M+i*(fw+6),y,fw,fh); }catch(e){} });
      y+=fh+8;
    }
  }

  // Compromisos
  titulo('ACUERDOS / COMPROMISOS');
  doc.setFontSize(9);
  if((v.compromisos||[]).length){
    v.compromisos.forEach((c,i)=>{
      if(y>272){doc.addPage();y=20;}
      doc.setFont('helvetica','bold');
      const head=doc.splitTextToSize((i+1)+'. '+c.descripcion, maxW-2);
      doc.text(head,M+2,y); y+=head.length*5;
      doc.setFont('helvetica','normal'); doc.setTextColor(95,105,115);
      (c.responsables||[]).forEach(r=>{
        if(y>280){doc.addPage();y=20;}
        const rt='     ↳ '+r.nombre+'  ·  '+(r.area||'')+(r.fecha_limite?'  ·  vence '+r.fecha_limite:'');
        const rp=doc.splitTextToSize(rt,maxW-6); doc.text(rp,M+2,y); y+=rp.length*4.5;
      });
      doc.setTextColor(31,42,44); y+=2;
    });
  } else { doc.text('—',M+2,y); y+=5; }

  // Firmas de los asistentes (grilla 2 columnas)
  const firmas=(v.firmas&&v.firmas.length)?v.firmas:(v.firma_data?[{nombre:v.responsable_nombre,empresa:'Antofagasta Minerals',firma_data:v.firma_data}]:[]);
  if(firmas.length){
    if(y>235){doc.addPage();y=20;}
    y+=6; doc.setFillColor(228,246,245); doc.rect(M,y-4,maxW,7,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(0,105,115); doc.text('FIRMAS',M+2,y); doc.setTextColor(31,42,44); y+=10;
    const colW=maxW/2, fh=22;
    firmas.forEach((f,i)=>{
      const col=i%2, row=Math.floor(i/2);
      if(col===0 && y+fh>285){ doc.addPage(); y=20; }
      const x=M+col*colW, yy=y;
      if(f.firma_data){ try{ doc.addImage(f.firma_data,'PNG',x,yy,48,16); }catch(e){} }
      doc.setDrawColor(150); doc.line(x,yy+17,x+colW-8,yy+17);
      doc.setFontSize(7.5); doc.setTextColor(31,42,44);
      doc.text(String(f.nombre||'').slice(0,38),x,yy+21);
      doc.setTextColor(95,105,115); doc.setFontSize(6.5);
      doc.text(String(f.empresa||'').slice(0,40),x,yy+24);
      doc.setTextColor(31,42,44);
      if(col===1) y+=fh+10;
    });
  }
  return doc;
}

// Re-descargar la minuta de una visita ya guardada (regenera desde Supabase)
async function descargarMinutaVisita(visitaId, pid){
  try{
    const v=await cargarVisitaCompleta(visitaId, pid);
    if(!v){ showToast('No se encontró la visita','err'); return; }
    const doc=await generarMinutaPDF(v);
    doc.save('Minuta_'+(v.titulo||'visita').replace(/[^a-z0-9]/gi,'_')+'.pdf');
    showToast('📄 Minuta descargada','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

// Cargar una visita completa (con participantes y compromisos) desde Supabase
async function cargarVisitaCompleta(visitaId, pid){
  const {data:vis}=await SUPA.client.from('visitas').select('*').eq('visita_id',visitaId).maybeSingle();
  if(!vis) return null;
  const {data:parts}=await SUPA.client.from('visita_participantes').select('*').eq('visita_id',visitaId);
  const {data:comps}=await SUPA.client.from('visita_compromisos').select('*').eq('visita_id',visitaId).order('orden');
  const compromisos=[];
  for(const c of (comps||[])){
    const {data:resp}=await SUPA.client.from('compromiso_responsables').select('*').eq('compromiso_id',c.compromiso_id);
    compromisos.push({_cid:c.compromiso_id, descripcion:c.descripcion, responsables:(resp||[]).map(r=>({nombre:r.nombre,area:r.area,fecha_limite:r.fecha_limite,origen:r.origen||'asistente'}))});
  }
  const {data:firmas}=await SUPA.client.from('visita_firmas').select('*').eq('visita_id',visitaId);
  // localizar pid local
  let localPid=pid;
  if(!localPid){ const pp=PROVEEDORES.find(x=>x._proveedorId===vis.proveedor_id||x._id===vis.proveedor_id); localPid=pp?pp._id:vis.proveedor_id; }
  return {
    visita_id:vis.visita_id, proveedor_id:localPid, fecha:vis.fecha, titulo:vis.titulo,
    responsable_nombre:vis.responsable_nombre, responsable_email:vis.responsable_email,
    faena:vis.faena, comuna:vis.comuna, firma_data:vis.firma_data||'',
    minuta_pdf_url:vis.minuta_pdf_url||'', origen_plataforma:vis.origen_plataforma||'principal',
    resumen:vis.resumen||'',
    fotos:(()=>{try{return JSON.parse(vis.fotos_json||'[]')||[];}catch(e){return [];}})(),
    participantes:(parts||[]).map(p=>({nombre:p.nombre,empresa:p.empresa,correo:p.correo,telefono:p.telefono})),
    firmas:(firmas||[]).map(f=>({nombre:f.nombre,empresa:f.empresa,firma_data:f.firma_data})),
    compromisos
  };
}

// Editar una visita ya guardada
async function editarVisitaGuardada(visitaId, pid){
  try{
    const v=await cargarVisitaCompleta(visitaId, pid);
    if(!v){ showToast('No se encontró la visita','err'); return; }
    VISITA_ACT=v;
    renderVisitaForm();
    document.getElementById('visitaV3Modal').style.display='flex';
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

async function guardarVisitaSupabase(v){
  if(!SUPA.client||!SUPA.session){ showToast('No hay sesión activa para guardar','err'); return false; }
  const provLocal=PROVEEDORES.find(x=>x._id===v.proveedor_id)||{};
  const provId=provLocal._proveedorId||v.proveedor_id;
  try{
    // 0) Asegurar que el proveedor exista en Supabase (evita error de llave foránea silencioso)
    const {data:provChk,error:eChk}=await SUPA.client.from('proveedores').select('proveedor_id').eq('proveedor_id',provId).maybeSingle();
    if(eChk) throw new Error('Verificación proveedor: '+eChk.message);
    if(!provChk){
      // Intentar sincronizar el proveedor automáticamente antes de seguir
      if(typeof gSyncPush==='function' && provLocal._id){ await gSyncPush(provLocal._id); }
      const {data:provChk2,error:eChk2}=await SUPA.client.from('proveedores').select('proveedor_id').eq('proveedor_id',provId).maybeSingle();
      if(eChk2) throw new Error('Verificación proveedor: '+eChk2.message);
      if(!provChk2) throw new Error('El proveedor todavía no está guardado en la nube. Guarda el proveedor (Editar → Guardar cambios) y vuelve a intentar la visita.');
    }
    // 1) Visita principal — con captura de error explícita
    const {error:eVis}=await SUPA.client.from('visitas').upsert({
      visita_id:v.visita_id, proveedor_id:provId, fecha:v.fecha, titulo:v.titulo,
      responsable_email:v.responsable_email||'', responsable_nombre:v.responsable_nombre||'',
      faena:v.faena||'', comuna:v.comuna||'', estado:'Finalizada', minuta_pdf_url:v.minuta_pdf_url||'',
      firma_data: (v.firma_data||'').slice(0,200000), estado_registro:'Activo',
      origen_plataforma: v.origen_plataforma||'principal', resumen:v.resumen||'',
      fotos_json: JSON.stringify((v.fotos||[]).filter(Boolean).slice(0,3)),
      created_by:miNombre(), updated_by:miNombre(), updated_at:new Date().toISOString()
    },{onConflict:'visita_id'});
    if(eVis) throw new Error('Visita: '+eVis.message);

    // 2) Participantes
    await SUPA.client.from('visita_participantes').delete().eq('visita_id',v.visita_id);
    if((v.participantes||[]).length){
      const {error:eP}=await SUPA.client.from('visita_participantes').insert(
        v.participantes.map((pt,i)=>({id:v.visita_id+'_p'+i,visita_id:v.visita_id,nombre:pt.nombre||'',empresa:pt.empresa||'',correo:pt.correo||'',telefono:pt.telefono||''})));
      if(eP) throw new Error('Participantes: '+eP.message);
    }

    // 3) Compromisos + responsables
    await SUPA.client.from('visita_compromisos').delete().eq('visita_id',v.visita_id);
    for(let ci=0;ci<(v.compromisos||[]).length;ci++){
      const c=v.compromisos[ci]; const cid=v.visita_id+'_c'+ci;
      const fls=(c.responsables||[]).map(r=>r.fecha_limite).filter(Boolean).sort();
      const resp0=(c.responsables||[])[0];
      const {error:eC}=await SUPA.client.from('visita_compromisos').insert({compromiso_id:cid,visita_id:v.visita_id,descripcion:c.descripcion||'',cerrado:false,orden:ci,
        fecha_limite:fls[0]||null, responsable:resp0?resp0.nombre:'', estado:'abierto', proveedor_id:provId});
      if(eC) throw new Error('Compromiso: '+eC.message);
      if((c.responsables||[]).length){
        const {error:eR}=await SUPA.client.from('compromiso_responsables').insert(
          c.responsables.map((r,ri)=>({id:cid+'_r'+ri,compromiso_id:cid,nombre:r.nombre||'',area:r.area||'',fecha_limite:r.fecha_limite||'',origen:r.origen||'asistente'})));
        if(eR) throw new Error('Responsables: '+eR.message);
      }
    }

    // 4) Firmas
    await SUPA.client.from('visita_firmas').delete().eq('visita_id',v.visita_id);
    const firmasValidas=(v.firmas||[]).filter(f=>f.firma_data);
    if(firmasValidas.length){
      const {error:eF}=await SUPA.client.from('visita_firmas').insert(
        firmasValidas.map((f,i)=>({firma_id:v.visita_id+'_f'+i,visita_id:v.visita_id,nombre:f.nombre||'',empresa:f.empresa||'',firma_data:(f.firma_data||'').slice(0,200000)})));
      if(eF) throw new Error('Firmas: '+eF.message);
    }

    await registrarLog('visita',v.visita_id,'crear','Visita "'+v.titulo+'" a '+(dispName(PROVEEDORES.find(x=>x._id===v.proveedor_id)||{})));
    return true;
  }catch(e){
    console.error('[VISITA] Error al guardar:',e);
    showToast('⚠ No se guardó la visita: '+e.message,'err');
    return false;
  }
}



// ── Listar visitas de un proveedor (desde Supabase) ──
async function renderVisitasV3(pid){
  const cont=document.getElementById('visitasV3List_'+pid);
  if(!cont) return;
  const provId=(PROVEEDORES.find(x=>x._id===pid)||{})._proveedorId||pid;
  cont.innerHTML='<div class="kb-empty">Cargando…</div>';
  try{
    const {data}=await SUPA.client.from('visitas').select('*').eq('proveedor_id',provId).neq('estado_registro','Eliminado').order('fecha',{ascending:false});
    PROV_VISITAS[pid]=data||[];
    if(!data||!data.length){ cont.innerHTML='<div class="kb-empty">Sin visitas registradas</div>'; return; }
    cont.innerHTML=data.map(v=>`<div class="vis-item">
      <div style="flex:1"><b>${esc(v.fecha)}</b> · ${esc(v.titulo||'')} ${badgeOrigenVisita(v)}<br><span style="font-size:.76rem;color:var(--text-muted)">👤 ${esc(v.responsable_nombre||'')} · ${esc(v.faena||'')}</span>${v.resumen&&v.resumen.trim()?`<div style="margin-top:6px;font-size:.8rem;color:var(--text);background:#FFF9E8;border-left:3px solid var(--dc-gold,#F2A900);border-radius:0 6px 6px 0;padding:6px 10px;white-space:pre-wrap">📝 ${esc(v.resumen)}</div>`:''}</div>
      <div style="display:flex;gap:5px">
        <button class="mini-btn" title="Editar visita" onclick="editarVisitaGuardada('${v.visita_id}','${pid}')">✏</button>
        <button class="mini-btn" title="Descargar PDF" onclick="descargarMinutaVisita('${v.visita_id}','${pid}')">📄</button>
        <button class="mini-btn" title="Enviar por correo" onclick="enviarCorreoVisita('${v.visita_id}','${pid}')">✉</button>
        ${v.minuta_pdf_url?`<a href="javascript:void(0)" data-firmar-link="${v.minuta_pdf_url}" onclick="return abrirFirmado(this)" class="mini-btn" title="PDF guardado">☁️</a>`:''}
        <button class="solo-admin mini-btn" title="Eliminar visita" style="color:#D0311B;border-color:#f1b0a5" onclick="eliminarVisita('${v.visita_id}','${pid}')">🗑</button>
      </div>
    </div>`).join('');
  }catch(e){ cont.innerHTML='<div class="kb-empty">Error: '+esc(e.message)+'</div>'; }
}
let PROV_VISITAS={};


// ═══════════════════════════════════════════════════════════════════════════
// MOLI — Mano de Obra Local Indirecta (v3.0)
// ═══════════════════════════════════════════════════════════════════════════
let MOLI_CACHE={}; // acuerdo_id -> [beneficiarios]

// Descargar plantilla Excel MOLI para una licitación
function descargarPlantillaMOLI(pid, aid){
  try{
    // buscar la licitación de forma robusta (por pid o en cualquier proveedor)
    let ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid);
    let realPid=pid;
    if(!ac){
      for(const k of Object.keys(DB.acuerdos||{})){
        const f=(DB.acuerdos[k]||[]).find(a=>a.id===aid);
        if(f){ ac=f; realPid=k; break; }
      }
    }
    if(!ac){ showToast('No se encontró la licitación','err'); return; }
    const p=PROVEEDORES.find(x=>x._id===realPid)||{};
    if(typeof XLSX==='undefined'){ showToast('Librería Excel no cargada','err'); return; }
    const wb=XLSX.utils.book_new();
    const info=[
      ['FICHA MOLI — Mano de Obra Local Indirecta'],[''],
      ['N° Orden/Contrato', ac.os||''],
      ['Compañía', 'Minera '+(ac.compania||'')],
      ['Proveedor', dispName(p)],
      ['RUT proveedor', p.rut_empresa||''],
      ['Servicio', ac.servicio||''],[''],
      ['Complete una fila por persona beneficiada en la hoja "Beneficiarios". No borre los encabezados.']
    ];
    const wi=XLSX.utils.aoa_to_sheet(info); wi['!cols']=[{wch:24},{wch:42}];
    XLSX.utils.book_append_sheet(wb,wi,'Datos');
    const headers=['Nombre y Apellido','Sexo (Hombre/Mujer)','Tipo de servicio (ej: Limpieza, Mecánico, Ingeniero)','Chileno o Extranjero','Si extranjero: país de origen','Comuna donde vive','Contrato Directo o Subcontrato','Si Subcontrato: nombre de la empresa'];
    const ej=['Juan Pérez González','Hombre','Mecánico','Chileno','','Sierra Gorda','Directo',''];
    const ws=XLSX.utils.aoa_to_sheet([headers,ej]); ws['!cols']=headers.map(()=>({wch:26}));
    XLSX.utils.book_append_sheet(wb,ws,'Beneficiarios');
    XLSX.writeFile(wb,'MOLI_'+String(ac.os||'licitacion').replace(/[^a-z0-9]/gi,'_')+'.xlsx');
    showToast('📥 Plantilla MOLI descargada','success');
  }catch(err){
    showToast('Error al generar plantilla: '+err.message,'err');
  }
}

// Subir Excel MOLI llenado y procesar
function subirMOLI(pid, aid){ MOLI_TARGET={pid,aid}; document.getElementById('moliFileInput').click(); }
let MOLI_TARGET={pid:null,aid:null};

async function procesarMOLI(files){
  if(!files||!files.length) return;
  const {pid,aid}=MOLI_TARGET; if(!aid) return;
  const ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid);
  const provId=(PROVEEDORES.find(x=>x._id===pid)||{})._proveedorId||pid;
  const buf=await files[0].arrayBuffer();
  const wb=XLSX.read(buf,{type:'array'});
  const ws=wb.Sheets['Beneficiarios']||wb.Sheets[wb.SheetNames[wb.SheetNames.length-1]];
  const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
  if(!rows.length){ showToast('La hoja Beneficiarios está vacía','warning'); return; }
  const norm=s=>String(s||'').toLowerCase();
  const pick=(r,keys)=>{ for(const k of Object.keys(r)){ if(keys.some(x=>norm(k).includes(x))) return r[k]; } return ''; };
  const benefs=rows.map((r,i)=>{
    const nac=String(pick(r,['chileno','extranjero','nacional'])||'').trim();
    return {
      moli_id:'moli_'+aid+'_'+Date.now().toString(36)+'_'+i, acuerdo_id:aid, proveedor_id:provId,
      nombre:String(pick(r,['nombre'])||'').trim(),
      sexo:/muj|f/i.test(String(pick(r,['sexo'])))?'Mujer':(/(hom|^m)/i.test(String(pick(r,['sexo'])))?'Hombre':''),
      tipo_servicio:String(pick(r,['tipo','servicio'])||'').trim(),
      nacionalidad:/extr/i.test(nac)?'Extranjero':(/chil/i.test(nac)?'Chileno':nac),
      pais_origen:String(pick(r,['pais','país','origen'])||'').trim(),
      comuna:String(pick(r,['comuna'])||'').trim(),
      tipo_contrato:/sub/i.test(String(pick(r,['contrato','directo','subcontrato'])))?'Subcontrato':'Directo',
      empresa_subcontrato:String(pick(r,['empresa'])||'').trim(),
      created_by:miNombre()
    };
  }).filter(b=>b.nombre);
  if(!benefs.length){ showToast('No se detectaron beneficiarios con nombre','warning'); return; }
  try{
    await SUPA.client.from('moli_beneficiarios').delete().eq('acuerdo_id',aid);
    await SUPA.client.from('moli_beneficiarios').insert(benefs.map(({...b})=>b));
    MOLI_CACHE[aid]=benefs;
    if(ac){ ac._moli=resumenMOLI(benefs); }
    await registrarLog('moli',aid,'crear','Cargó '+benefs.length+' beneficiarios MOLI');
  }catch(e){ showToast('Error al guardar MOLI: '+e.message,'err'); return; }
  document.getElementById('moliFileInput').value='';
  renderAcuerdos(pid);
  if(typeof renderLicitacionesGlobal==='function') renderLicitacionesGlobal();
  showToast('✅ MOLI: '+benefs.length+' beneficiarios cargados','success');
}

function resumenMOLI(benefs){
  const total=benefs.length;
  const muj=benefs.filter(b=>b.sexo==='Mujer').length;
  const hom=benefs.filter(b=>b.sexo==='Hombre').length;
  const porComuna={};
  benefs.forEach(b=>{ const k=b.comuna||'Sin comuna'; porComuna[k]=(porComuna[k]||0)+1; });
  return {total,muj,hom,porComuna};
}

async function cargarMOLI(aid){
  if(Array.isArray(MOLI_CACHE[aid])) return MOLI_CACHE[aid];
  try{
    const {data}=await SUPA.client.from('moli_beneficiarios').select('*').eq('acuerdo_id',aid).neq('estado_registro','Eliminado');
    MOLI_CACHE[aid]=data||[]; return data||[];
  }catch(e){ return []; }
}

// Badge MOLI para mostrar en la licitación (total / N° mujeres / N° hombres)
function moliBadgeHTML(aid){
  const b=MOLI_CACHE[aid];
  if(!b||!Array.isArray(b)||!b.length) return `<button class="mini-btn" style="width:auto;padding:4px 10px" onclick="descargarPlantillaMOLI('${LIC_CTX.pid}','${aid}')">📥 Plantilla MOLI</button>
    <button class="mini-btn" style="width:auto;padding:4px 10px" onclick="subirMOLI('${LIC_CTX.pid}','${aid}')">📤 Cargar MOLI</button>`;
  const r=resumenMOLI(b);
  return `<div class="moli-badge">👷 MOLI: <b>${r.total}</b> · ♀ ${r.muj} · ♂ ${r.hom}
    <button class="mini-btn" style="width:auto;padding:3px 8px" onclick="subirMOLI('${LIC_CTX.pid}','${aid}')">↻</button></div>`;
}
let LIC_CTX={pid:null};

// ── Vincular visitas a una licitación ──
async function vincularVisitasLic(pid, aid){
  LIC_CTX.pid=pid;
  const provId=(PROVEEDORES.find(x=>x._id===pid)||{})._proveedorId||pid;
  let visitas=PROV_VISITAS[pid];
  if(!visitas){
    const {data}=await SUPA.client.from('visitas').select('*').eq('proveedor_id',provId).neq('estado_registro','Eliminado').order('fecha',{ascending:false});
    visitas=data||[]; PROV_VISITAS[pid]=visitas;
  }
  const ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid);
  const ya=(ac.visitas_json||[]).map(x=>x.visita_id||x);
  VINC_TARGET={pid,aid};
  document.getElementById('vincVisitasList').innerHTML = visitas.length? visitas.map(v=>`
    <label class="vinc-row"><input type="checkbox" value="${v.visita_id}" ${ya.includes(v.visita_id)?'checked':''} data-fecha="${esc(v.fecha)}" data-titulo="${esc(v.titulo||'')}">
      <span><b>${esc(v.fecha)}</b> · ${esc(v.titulo||'')}</span></label>`).join('') : '<div class="kb-empty">Este proveedor no tiene visitas registradas</div>';
  document.getElementById('vincVisitasModal').style.display='flex';
}
let VINC_TARGET={pid:null,aid:null};
function cerrarVincVisitas(){ document.getElementById('vincVisitasModal').style.display='none'; }
async function guardarVincVisitas(){
  const {pid,aid}=VINC_TARGET;
  const sel=[...document.querySelectorAll('#vincVisitasList input:checked')].map(c=>({visita_id:c.value,fecha:c.dataset.fecha,titulo:c.dataset.titulo}));
  const ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid); if(!ac) return;
  ac.visitas_json=sel;
  await saveDB(); await licPushSupabase(pid,ac);
  cerrarVincVisitas(); renderAcuerdos(pid);
  showToast('✅ '+sel.length+' visitas vinculadas','success');
}


function renderAcuerdosSoft(id){ try{ renderAcuerdos(id); }catch(e){} }

function montarVisitasV3(id){
  const el=document.getElementById('visitasPane_'+id);
  if(!el) return;
  el.innerHTML=`<div style="padding:4px 0">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <button class="vis-add" onclick="nuevaVisitaV3('${id}')">＋ Nueva visita</button>
      <button class="vis-add" style="background:#fff;color:var(--primary);border:1.5px solid var(--primary)" onclick="abrirSubirMinutaManual('${id}')">📤 Subir minuta PDF manualmente</button>
    </div>
    <div id="visitasV3List_${id}"><div class="kb-empty">Cargando…</div></div>
  </div>`;
  renderVisitasV3(id);
}

async function eliminarVisita(visitaId, pid){
  if(!puedeEliminar()) return;
  if(!confirm('¿Eliminar esta visita? Esta acción no se puede deshacer.')) return;
  try{
    await SUPA.client.from('compromiso_responsables').delete().in('compromiso_id',
      (await SUPA.client.from('visita_compromisos').select('compromiso_id').eq('visita_id',visitaId)).data?.map(c=>c.compromiso_id)||['__none__']);
    await SUPA.client.from('visita_compromisos').delete().eq('visita_id',visitaId);
    await SUPA.client.from('visita_participantes').delete().eq('visita_id',visitaId);
    await SUPA.client.from('visitas').delete().eq('visita_id',visitaId);
    await registrarLog('visita',visitaId,'eliminar','Eliminó visita');
    showToast('🗑 Visita eliminada','success');
    renderVisitasV3(pid);
  }catch(e){ showToast('Error al eliminar: '+e.message,'err'); }
}


// ═══════════════════════════════════════════════════════════════════════════
// GESTIÓN DE USUARIOS (aprobación por admin) v5.0
// ═══════════════════════════════════════════════════════════════════════════
let ES_ADMIN_ACTUAL=false;

let ES_ACCESOS_ACTUAL=[];
function _decodeJwtPayload(token){
  try{ const b=token.split('.')[1]; return JSON.parse(atob(b.replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){ return null; }
}
function leerRolActual(){
  try{
    // Fuente primaria: decodificar el JWT access_token (autoridad real del servidor)
    let md={};
    const token=SUPA.session?.access_token;
    if(token){
      const payload=_decodeJwtPayload(token);
      if(payload && payload.app_metadata) md=payload.app_metadata;
    }
    // Fallback: session.user.app_metadata
    if(!md.rol && SUPA.session?.user?.app_metadata) md=SUPA.session.user.app_metadata;
    console.log('[ROL] app_metadata del JWT:', JSON.stringify(md));
    ES_ADMIN_ACTUAL = md.rol==='admin';
    ES_ACCESOS_ACTUAL = Array.isArray(md.accesos)?md.accesos:[];
    document.body.classList.toggle('is-admin', ES_ADMIN_ACTUAL);
    document.body.classList.toggle('is-user', !ES_ADMIN_ACTUAL);
    return md;
  }catch(e){ console.error('[ROL] Error leyendo rol:', e); ES_ADMIN_ACTUAL=false; ES_ACCESOS_ACTUAL=[]; document.body.classList.add('is-user'); return {}; }
}

// Gestión de usuarios (aprobar/rechazar solicitudes): movida a
// modules/admin/ (P-7, docs/PENDIENTES.md). Antes vivía acá adentro.

// ── REGISTRO (auto-inscripción) en la pantalla de login principal ──
function mostrarRegistro(){ document.getElementById('loginStep')&&(document.getElementById('loginStep').style.display='none'); const r=document.getElementById('registroStep'); if(r) r.style.display='block'; loginError(''); }
function mostrarLoginStep(){ const r=document.getElementById('registroStep'); if(r) r.style.display='none'; const l=document.getElementById('loginStep'); if(l) l.style.display='block'; loginError(''); }

async function registrarseAdmin(){
  loginError('');
  if(!initSupabase()){ loginError('Sistema sin configurar'); return; }
  const nombre=document.getElementById('regNombre').value.trim();
  const apellido=document.getElementById('regApellido').value.trim();
  const email=document.getElementById('regEmail').value.trim().toLowerCase();
  const pass=document.getElementById('regPass').value;
  if(!nombre||!email||!pass){ loginError('Completa nombre, correo y contraseña'); return; }
  if(!email.endsWith('@aminerals.cl')){ loginError('La página principal solo admite correos @aminerals.cl'); return; }
  if(pass.length<6){ loginError('La contraseña debe tener al menos 6 caracteres'); return; }
  const btn=document.getElementById('regBtn'); btn.disabled=true; btn.textContent='Creando…';
  try{
    // origen_registro: lo valida tambien un trigger en la base (P-12), no
    // solo el chequeo de arriba -- ese se puede saltar llamando la API
    // directo, el trigger no.
    const {data,error}=await SUPA.client.auth.signUp({email,password:pass,options:{data:{origen_registro:'principal'}}});
    if(error) throw error;
    const uid=data.user&&data.user.id;
    if(uid){
      // registrar solicitud + auto-confirmar correo (sin enlace a localhost)
      try{ await SUPA.client.rpc('registrar_solicitud',{p_uid:uid,p_nombre:nombre,p_apellido:apellido,p_email:email,p_origen:'principal',p_rol_sol:'admin',p_faena_sol:null}); }catch(e){}
    }
    loginError('');
    mostrarLoginStep();
    showToast('✅ Solicitud enviada. Un administrador debe aprobar tu acceso.','success');
    setTimeout(()=>{ alert('Tu cuenta fue creada y está PENDIENTE de aprobación por el administrador. Cuando te aprueben, podrás iniciar sesión.'); },200);
  }catch(e){
    loginError(e.message.includes('already registered')?'Ese correo ya está registrado':e.message);
  }finally{ btn.disabled=false; btn.textContent='Solicitar acceso'; }
}



// Catálogo de Programas / Iniciativas: movido a proveedores-programas.js
// (P-8, docs/PENDIENTES.md, primer corte).

// Dashboard de Compromisos (cuenta regresiva + seguimiento/llamadas):
// movido a proveedores-compromisos.js (P-8, docs/PENDIENTES.md, segundo
// corte). abrirCorreoMinuta/badgeOrigenVisita/editarContrato, de aca abajo,
// se quedan -- las usa el sistema de visitas activo y el de hoteleria.

// Abre el cliente de correo (Outlook/Mail) con destinatarios, asunto y cuerpo prellenados.
// El PDF ya se descargó; el usuario solo lo adjunta y envía (límite de seguridad del navegador).
function abrirCorreoMinuta(v){
  const p=PROVEEDORES.find(x=>x._id===v.proveedor_id)||{};
  const provNombre=dispName(p);
  // destinatarios = participantes externos (con correo)
  const correos=(v.participantes||[]).map(pt=>pt.correo).filter(c=>c && c.includes('@'));
  const to=correos.join(';');
  const asunto='Visita día '+(v.fecha||'')+' a '+provNombre;
  const cuerpo='Adjunto Minuta de la reunion: "'+(v.titulo||'')+'" realizada el dia '+(v.fecha||'')+'.';
  const mailto='mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(asunto)+'&body='+encodeURIComponent(cuerpo);
  try{ window.location.href=mailto; }catch(e){ try{ window.open(mailto,'_blank'); }catch(_){} }
}

// Distintivo del origen de una visita: MGI (hotelería) vs faena AMSA
function badgeOrigenVisita(v){
  if((v.origen_plataforma||'principal')==='mgi'){
    return '<span style="background:#ede9fb;color:#5b4fcf;border-radius:5px;padding:1px 7px;font-size:.68rem;font-weight:800;letter-spacing:.04em">MGI</span>';
  }
  const fa=(v.faena||'').toLowerCase();
  let sigla='AMSA';
  if(fa.includes('centinela')) sigla='CEN';
  else if(fa.includes('antucoya')) sigla='ANT';
  else if(fa.includes('zald')) sigla='ZAL';
  return '<span style="background:#E4F6F5;color:#006973;border-radius:5px;padding:1px 7px;font-size:.68rem;font-weight:800;letter-spacing:.04em">'+sigla+'</span>';
}

function editarContrato(pid,cid){
  const ct=(DB.hoteles[pid]?.contratos||[]).find(c=>c.id===cid); if(!ct) return;
  _editContratoId=cid;
  const fc=document.getElementById('fc_'+pid); if(fc) fc.style.display='block';
  const set=(s,v)=>{const e=document.getElementById(s+pid);if(e)e.value=v;};
  set('fc_cli_',ct.cliente||''); set('fc_rut_',ct.rut||'');
  set('fc_simples_',ctSimples(ct)||''); set('fc_dobles_',ctDobles(ct)||'');
  set('fc_desde_',ct.desde||''); set('fc_hasta_',ct.hasta||'');
  // AMSA
  const chk=document.getElementById('fc_esAmsa_'+pid);
  if(chk){ chk.checked=!!ct.amsa; const row=document.getElementById('fc_amsaRow_'+pid); if(row)row.style.display=ct.amsa?'block':'none'; const sel=document.getElementById('fc_amsa_'+pid); if(sel)sel.value=ct.amsa||''; }
  previewMonto(pid);
  if(fc) fc.scrollIntoView({behavior:'smooth',block:'nearest'});
}


// ═══════════════════════════════════════════════════════════════════════════
// TRABAJADORES DE HOTELERÍA (por hotel) v9.0
// ═══════════════════════════════════════════════════════════════════════════
let TRAB_CACHE={};
const FUNCIONES_HOTEL=['Mucama','Limpieza','Recepción','Cocina','Mantención','Lavandería','Administración','Seguridad','Garzón/a'];

async function cargarTrabajadores(pid){
  const cont=document.getElementById('trabList_'+pid); if(!cont) return;
  const provId=(PROVEEDORES.find(x=>x._id===pid)||{})._proveedorId||pid;
  try{
    const {data}=await SUPA.client.from('hoteleria_trabajadores').select('*').eq('proveedor_id',provId).neq('estado_registro','Eliminado');
    TRAB_CACHE[pid]=data||[];
    pintarTrabajadores(pid);
  }catch(e){ cont.innerHTML='<div style="font-size:.78rem;color:#c0311b">Error: '+esc(e.message)+'</div>'; }
}

function pintarTrabajadores(pid){
  const cont=document.getElementById('trabList_'+pid); if(!cont) return;
  const ts=TRAB_CACHE[pid]||[];
  const res=document.getElementById('trabResumen_'+pid);
  if(res){ const h=ts.filter(t=>t.sexo==='Hombre').length, m=ts.filter(t=>t.sexo==='Mujer').length; res.textContent=ts.length?`· ${ts.length} (♀ ${m} · ♂ ${h})`:''; }
  if(!ts.length){ cont.innerHTML='<div style="font-size:.78rem;color:var(--text-muted)">Sin trabajadores registrados</div>'; return; }
  cont.innerHTML=ts.map(t=>{
    const funcs=Array.isArray(t.funciones)?t.funciones:(()=>{try{return JSON.parse(t.funciones||'[]');}catch(e){return [];}})();
    return `<div style="display:flex;justify-content:space-between;align-items:center;background:#f4f7f7;border-radius:7px;padding:8px 11px;margin-bottom:5px;font-size:.83rem">
      <div><b>${esc(t.nombre||'')}</b> <span style="color:${t.sexo==='Mujer'?'#d6336c':'#2563eb'};font-size:.75rem">${t.sexo==='Mujer'?'♀':'♂'} ${esc(t.sexo||'')}</span>
        <div style="font-size:.74rem;color:var(--text-muted)">${funcs.map(f=>esc(f)).join(' · ')||'—'}</div></div>
      <button class="solo-admin contrato-del" style="position:static" onclick="eliminarTrabajador('${pid}','${t.trabajador_id}')">✕</button>
    </div>`;
  }).join('');
}

let _trabPid=null, _trabFuncs=[];
function abrirFormTrabajador(pid){
  _trabPid=pid; _trabFuncs=[];
  document.getElementById('trabNombre').value='';
  document.getElementById('trabSexo').value='Mujer';
  renderTrabFuncs();
  document.getElementById('trabModal').style.display='flex';
}
function cerrarTrabModal(){ document.getElementById('trabModal').style.display='none'; _trabPid=null; }
function renderTrabFuncs(){
  const cont=document.getElementById('trabFuncsChips');
  cont.innerHTML=FUNCIONES_HOTEL.map(f=>`<span onclick="toggleTrabFunc('${f}')" style="cursor:pointer;border-radius:16px;padding:4px 12px;font-size:.8rem;border:1.5px solid ${_trabFuncs.includes(f)?'#006973':'var(--border)'};background:${_trabFuncs.includes(f)?'#006973':'#fff'};color:${_trabFuncs.includes(f)?'#fff':'var(--text)'}">${f}</span>`).join('');
  // permitir función personalizada
}
function toggleTrabFunc(f){ const i=_trabFuncs.indexOf(f); if(i>=0)_trabFuncs.splice(i,1); else _trabFuncs.push(f); renderTrabFuncs(); }
function addTrabFuncCustom(){
  const v=document.getElementById('trabFuncCustom').value.trim(); if(!v) return;
  if(!_trabFuncs.includes(v)) _trabFuncs.push(v);
  if(!FUNCIONES_HOTEL.includes(v)) FUNCIONES_HOTEL.push(v);
  document.getElementById('trabFuncCustom').value=''; renderTrabFuncs();
}

async function guardarTrabajador(){
  const pid=_trabPid; if(!pid) return;
  const nombre=document.getElementById('trabNombre').value.trim();
  const sexo=document.getElementById('trabSexo').value;
  if(!nombre){ showToast('Indica el nombre','err'); return; }
  if(!_trabFuncs.length){ showToast('Selecciona al menos una función','err'); return; }
  const provId=(PROVEEDORES.find(x=>x._id===pid)||{})._proveedorId||pid;
  try{
    const id='trab_'+Date.now().toString(36);
    await SUPA.client.from('hoteleria_trabajadores').insert({trabajador_id:id,proveedor_id:provId,nombre,sexo,funciones:_trabFuncs,estado_registro:'Activo',created_by:miNombre()});
    await registrarLog('trabajador_hotel',id,'crear','Agregó trabajador '+nombre);
    cerrarTrabModal();
    cargarTrabajadores(pid);
    showToast('✅ Trabajador agregado','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

async function eliminarTrabajador(pid,tid){
  if(!puedeEliminar()) return;
  if(!confirm('¿Eliminar este trabajador?')) return;
  try{
    await SUPA.client.from('hoteleria_trabajadores').update({estado_registro:'Eliminado'}).eq('trabajador_id',tid);
    cargarTrabajadores(pid);
    showToast('Trabajador eliminado','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}


// Botón opcional: abrir correo con asunto/cuerpo prellenados (el usuario adjunta el PDF y decide si envía)
async function enviarCorreoVisita(visitaId, pid){
  try{
    const v=await cargarVisitaCompleta(visitaId, pid);
    if(!v){ showToast('No se encontró la visita','err'); return; }
    const p=PROVEEDORES.find(x=>x._id===v.proveedor_id)||{};
    const provNombre=dispName(p);
    const correos=(v.participantes||[]).map(pt=>pt.correo).filter(c=>c&&c.includes('@'));
    const to=correos.join(';');
    const asunto='Visita día '+(v.fecha||'')+' a '+provNombre;
    const cuerpo='Adjunto Minuta de la reunion: "'+(v.titulo||'')+'" realizada el dia '+(v.fecha||'')+'.';
    const mailto='mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(asunto)+'&body='+encodeURIComponent(cuerpo);
    // primero descargar el PDF para que lo tenga a mano
    descargarMinutaVisita(visitaId, pid);
    setTimeout(()=>{ window.location.href=mailto; }, 600);
    showToast('Se descargó el PDF y se abrió tu correo. Adjunta el archivo y envía.','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

// ── ACUERDOS COMPLETADOS ──
let _compFiltroAbierto=false;
async function completarAcuerdo(pid, aid){
  if(!confirm('¿Marcar esta licitación como realizada? Pasará al listado de completados.')) return;
  const ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid); if(!ac) return;
  ac.completado=true; ac.fecha_completado=new Date().toISOString().slice(0,10);
  await saveDB();
  if(typeof licPushSupabase==='function') await licPushSupabase(pid, ac);
  await registrarLog('licitacion',aid,'completar','Marcó como realizada');
  renderAcuerdosDash();
  showToast('✅ Licitación marcada como realizada','success');
}
async function reabrirAcuerdo(pid, aid){
  const ac=(DB.acuerdos[pid]||[]).find(a=>a.id===aid); if(!ac) return;
  ac.completado=false; ac.fecha_completado='';
  await saveDB();
  if(typeof licPushSupabase==='function') await licPushSupabase(pid, ac);
  renderAcuerdosDash();
  showToast('Licitación reabierta','success');
}
function toggleCompletados(){ _compFiltroAbierto=!_compFiltroAbierto; renderAcuerdosDash(); }

function renderAcuerdosCompletados(completados){
  if(!completados||!completados.length) return '';
  // filtros
  const fProv=(document.getElementById('compf_prov')?.value||'').toLowerCase().trim();
  const fAnio=document.getElementById('compf_anio')?.value||'';
  let lista=completados.slice();
  if(fProv) lista=lista.filter(a=>(a.proveedor||(a.prov&&dispName(a.prov))||'').toLowerCase().includes(fProv));
  if(fAnio) lista=lista.filter(a=>(a.fecha_completado||'').slice(0,4)===fAnio);
  lista.sort((a,b)=>(b.fecha_completado||'').localeCompare(a.fecha_completado||''));
  const anios=[...new Set(completados.map(a=>(a.fecha_completado||'').slice(0,4)).filter(Boolean))].sort().reverse();
  return `<div style="margin-top:18px;background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden">
    <div onclick="toggleCompletados()" style="display:flex;justify-content:space-between;align-items:center;padding:13px 16px;cursor:pointer;background:#f4f7f7">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;color:var(--primary);text-transform:uppercase">✓ Licitaciones completadas (${completados.length})</div>
      <span style="font-size:1.2rem;color:var(--text-muted)">${_compFiltroAbierto?'▲':'▼'}</span>
    </div>
    ${_compFiltroAbierto?`<div style="padding:14px 16px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <input id="compf_prov" value="${esc(fProv)}" oninput="renderAcuerdosDash()" placeholder="🔍 Proveedor" style="flex:1;min-width:150px;border:1.5px solid var(--border);border-radius:7px;padding:7px 10px;font-size:.84rem">
        <select id="compf_anio" onchange="renderAcuerdosDash()" style="border:1.5px solid var(--border);border-radius:7px;padding:7px 10px;font-size:.84rem">
          <option value="">Todos los años</option>${anios.map(y=>`<option value="${y}" ${fAnio===y?'selected':''}>${y}</option>`).join('')}
        </select>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.84rem">
        <thead><tr style="background:#eef4f4"><th style="text-align:left;padding:7px 10px">Proveedor</th><th style="text-align:left;padding:7px 10px">Servicio</th><th style="text-align:left;padding:7px 10px">Monto</th><th style="text-align:left;padding:7px 10px">Completado</th><th></th></tr></thead>
        <tbody>${lista.map(a=>`<tr style="border-top:1px solid var(--border)">
          <td style="padding:7px 10px"><b>${esc(a.proveedor||(a.prov&&dispName(a.prov))||'')}</b> <span class="amsa-badge">Minera ${esc(a.compania||'')}</span></td>
          <td style="padding:7px 10px">${esc(a.servicio||'—')}</td>
          <td style="padding:7px 10px;color:var(--green);font-weight:700">${a.monto_clp?fmtClp(a.monto_clp):'—'}</td>
          <td style="padding:7px 10px">${esc(a.fecha_completado||'—')}</td>
          <td style="padding:7px 10px"><button onclick="reabrirAcuerdo('${a.prov_id}','${a.id}')" style="border:1px solid var(--border);background:#fff;border-radius:5px;padding:2px 8px;font-size:.74rem;cursor:pointer">↺ Reabrir</button></td>
        </tr>`).join('')}</tbody>
      </table>
      ${lista.length===0?'<div style="text-align:center;color:var(--text-muted);padding:14px;font-size:.84rem">Sin resultados para el filtro</div>':''}
    </div>`:''}
  </div>`;
}

// ── Buscar RUT duplicados ──
function _rutNorm(r){ return String(r||'').toLowerCase().replace(/[^0-9k]/g,''); }
function abrirRutDuplicados(){
  document.getElementById('rutDupModal').style.display='flex';
  const cont=document.getElementById('rutDupContent');
  // agrupar proveedores por RUT normalizado
  const grupos={};
  PROVEEDORES.forEach(p=>{
    const rn=_rutNorm(p.rut||p.rut_empresa);
    if(!rn) return;
    (grupos[rn]=grupos[rn]||[]).push(p);
  });
  const dups=Object.entries(grupos).filter(([k,v])=>v.length>1).sort((a,b)=>b[1].length-a[1].length);
  if(!dups.length){ cont.innerHTML='<div style="text-align:center;padding:30px;color:var(--green)">✓ No hay RUT repetidos. Cada empresa tiene un RUT único.</div>'; return; }
  cont.innerHTML=dups.map(([rut,ps])=>`<div style="border:1px solid var(--border);border-radius:10px;padding:13px;margin-bottom:11px">
    <div style="font-weight:800;color:var(--primary);font-size:.9rem;margin-bottom:8px">RUT ${esc(ps[0].rut||ps[0].rut_empresa||rut)} · ${ps.length} registros</div>
    ${ps.map(p=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#f4f7f7;border-radius:7px;padding:8px 11px;margin-bottom:5px">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:.86rem">${esc(dispName(p))}</div>
        <div style="font-size:.76rem;color:var(--text-muted)">📍 ${esc(p.localidad||'—')}${p.direccion?' · '+esc(p.direccion):''}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="openModal('${p._id}')" style="border:1.5px solid var(--border);background:#fff;border-radius:6px;padding:4px 10px;font-size:.76rem;cursor:pointer">Ver ficha</button>
        <button class="solo-admin" onclick="eliminarProveedorDup('${p._id}')" style="border:1.5px solid #f1b0a5;background:#fdecea;color:#c0311b;border-radius:6px;padding:4px 10px;font-size:.76rem;cursor:pointer">Eliminar</button>
      </div>
    </div>`).join('')}
  </div>`).join('');
}
async function eliminarProveedorDup(pid){
  if(!puedeEliminar()) return;
  const p=PROVEEDORES.find(x=>x._id===pid); if(!p) return;
  if(!confirm('¿Eliminar "'+dispName(p)+'"?\nEsta acción lo quita del directorio. Asegúrate de que es un duplicado real.')) return;
  if(typeof eliminarProveedor==='function'){ await eliminarProveedor(pid); }
  else {
    const provId=p._proveedorId||pid;
    try{ await SUPA.client.from('proveedores').update({estado_registro:'Eliminado'}).eq('proveedor_id',provId); }catch(e){}
    const ix=PROVEEDORES.findIndex(x=>x._id===pid); if(ix>=0) PROVEEDORES.splice(ix,1);
  }
  abrirRutDuplicados();
  if(typeof applyFilters==='function') applyFilters();
}

// Solo el administrador puede eliminar (defensa en profundidad; el RLS también lo impide)
function puedeEliminar(){ if(!ES_ADMIN_ACTUAL){ showToast('Solo el administrador puede eliminar','err'); return false; } return true; }

// ═══ Menú móvil v11 ═══
function toggleMobileNav(){
  document.getElementById('mobileNavPanel').classList.toggle('show');
  document.getElementById('mobileNavOverlay').classList.toggle('show');
}
function mobileGo(page){
  const btn=document.querySelector('.nav-tab[data-page="'+page+'"]');
  if(btn) switchPage(page, btn); else switchPage(page);
  toggleMobileNav();
}
function toggleMobileSidebar(){
  const sb=document.querySelector('.sidebar'); if(sb) sb.classList.toggle('show');
}


// Exportar ficha a PDF: movido a proveedores-pdf.js (P-8, docs/PENDIENTES.md,
// cuarto corte). El bloque "v14 Edición" (maquinaria de la ficha), justo
// abajo, se queda -- pertenece al modal de edicion, usado desde ~987-1107.
// ═══ v14 Edición: rubros dinámicos + maquinaria ═══
const CAT_MAQ=['Transporte carga','Transporte personal','Excavación','Movimiento tierra','Grúa / Izaje','Generación','Bombeo','Aseo industrial','Otro'];
let _efFlota=[];
function efRubrosChange(){
  // La sección de flota/maquinaria está siempre disponible
  const sec=document.getElementById('ef_maq_section');
  if(sec) sec.style.display='block';
}
function efRenderMaq(){
  const tb=document.getElementById('ef_maq_body'); if(!tb) return;
  tb.innerHTML=_efFlota.map((f,i)=>`<tr>
    <td style="padding:4px"><input value="${esc(f.tipo||'')}" oninput="_efFlota[${i}].tipo=this.value" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:5px"></td>
    <td style="padding:4px"><select onchange="_efFlota[${i}].categoria=this.value" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:5px">${CAT_MAQ.map(c=>`<option ${f.categoria===c?'selected':''}>${c}</option>`).join('')}</select></td>
    <td style="padding:4px"><input value="${esc(f.marca||'')}" oninput="_efFlota[${i}].marca=this.value" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:5px"></td>
    <td style="padding:4px"><input value="${esc(f.modelo||'')}" oninput="_efFlota[${i}].modelo=this.value" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:5px"></td>
    <td style="padding:4px"><input value="${esc(f.anio||'')}" oninput="_efFlota[${i}].anio=this.value" style="width:70px;border:1px solid var(--border);border-radius:5px;padding:5px"></td>
    <td style="padding:4px"><input value="${esc(f.cant||'')}" oninput="_efFlota[${i}].cant=this.value" style="width:60px;border:1px solid var(--border);border-radius:5px;padding:5px"></td>
    <td style="padding:4px"><input value="${esc(f.capacidad||'')}" oninput="_efFlota[${i}].capacidad=this.value" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:5px"></td>
    <td style="padding:4px"><button type="button" onclick="efDelMaq(${i})" style="background:#fdecea;border:1px solid #f1b0a5;color:#c0311b;border-radius:5px;padding:5px 9px;cursor:pointer">✕</button></td>
  </tr>`).join('');
}
function efAddMaq(){ _efFlota.push({tipo:'',categoria:CAT_MAQ[0],marca:'',modelo:'',anio:'',cant:'',capacidad:''}); efRenderMaq(); }
function efDelMaq(i){ _efFlota.splice(i,1); efRenderMaq(); }


// Subir minuta manualmente: movido a proveedores-pdf.js (P-8, cuarto corte).
