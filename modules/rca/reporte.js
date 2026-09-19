// ═══════════════════════════════════════════════════════════════════════════
// reporte.js — Página PÚBLICA del reporte RCA (por token)
// Sistema AM · Antofagasta Minerals
//
// Sin login: usa el anon key y la función SECURITY DEFINER rca_reporte_publico,
// que dado un token válido devuelve SOLO el reporte de ese token (todas las EECC
// si es de gerencia, o una si es de EECC). El render lo hace window.RCAReporte,
// el mismo que arma el reporte descargable, así se ve idéntico y se actualiza
// solo (el link de gerencia refleja los datos cada vez que se abre).
//
// El token es un UUID aleatorio, no un dato personal (no viaja RUT ni nombre en
// la URL) — Regla 5. <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════
(async function(){
  const estado = document.getElementById('estado');
  const cont   = document.getElementById('rep');
  const fin = (ico, titulo, msg) => {
    estado.innerHTML = `<img src="../../shared/assets/logo-amsa-873.png" alt="Antofagasta Minerals">
      <div class="ico">${ico}</div><h1>${titulo}</h1><p>${msg||''}</p>`;
    estado.style.display = '';
  };

  const token = new URLSearchParams(location.search).get('t');
  if(!token){ fin('🔒','Link inválido','Falta el código del reporte en el enlace.'); return; }

  let SB;
  try{ SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key); }
  catch(e){ fin('⚠️','No se pudo iniciar','Recarga la página en un momento.'); return; }

  let data;
  try{
    const { data: res, error } = await SB.rpc('rca_reporte_publico', { p_token: token });
    if(error) throw error;
    data = res;
  }catch(e){
    fin('⚠️','No se pudo cargar el reporte', 'Intenta de nuevo más tarde.');
    return;
  }

  if(!data || data.error){
    fin('🔒','Reporte no disponible',
        'El enlace no es válido, fue desactivado o ya caducó. Pide uno nuevo a quien te lo compartió.');
    return;
  }

  // Inyecta los estilos del reporte y pinta el contenido (mismo render que la app).
  try{
    const style = document.createElement('style');
    style.textContent = window.RCAReporte.css();
    document.head.appendChild(style);
    cont.innerHTML = window.RCAReporte.pagina({
      rca: data.rca,
      lista: data.eecc || [],
      facturas: data.facturas || [],
      modo: data.tipo === 'eecc' ? 'eecc' : 'gerencia',
      enVivo: true
    });
    estado.style.display = 'none';
    document.title = window.RCAReporte.tituloDe({
      rca: data.rca, lista: data.eecc || [], modo: data.tipo
    }) + ' · Antofagasta Minerals';
  }catch(e){
    fin('⚠️','No se pudo mostrar el reporte', e.message||'');
  }
})();
