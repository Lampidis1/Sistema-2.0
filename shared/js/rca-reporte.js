// ═══════════════════════════════════════════════════════════════════════════
// shared/js/rca-reporte.js — Render del reporte RCA (gerencia / por EECC)
// Sistema AM · Antofagasta Minerals
//
// Funciones PURAS de render, sin depender de variables globales del módulo:
// reciben los datos por parámetro y devuelven un documento HTML autónomo
// (estilos incrustados, sin dependencias). Lo usan DOS páginas:
//   · modules/rca/rca.js        → el reporte descargable (datos ya en memoria)
//   · modules/rca/reporte.js    → la página pública por token (datos del RPC)
// Así el mismo reporte se ve igual en ambos lados sin duplicar la lógica.
//
// <script src> clásico, nunca type="module" — CLAUDE.md §6. Todo cuelga de
// window.RCAReporte; los helpers internos quedan dentro del IIFE para no chocar
// con los globales de rca.js (esc, _clp, rutFmt, fmtDia…).
// ═══════════════════════════════════════════════════════════════════════════
window.RCAReporte = (function(){
  'use strict';

  const esc = s => String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clp = n => '$' + Math.round(+n||0).toLocaleString('es-CL');
  const rutCanon = r => String(r==null?'':r).toUpperCase().replace(/[^0-9K]/g,'');
  function rutFmt(r){ const c=rutCanon(r); if(c.length<2) return c; return c.slice(0,-1)+'-'+c.slice(-1); }
  function fmtDia(iso){ if(!iso) return '—'; const p=String(iso).slice(0,10).split('-'); return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:String(iso).slice(0,10); }
  function hoyISO(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function dias(fecha){ if(!fecha) return null; const a=new Date(hoyISO()+'T00:00:00'), b=new Date(String(fecha).slice(0,10)+'T00:00:00'); if(isNaN(b)) return null; return Math.round((b-a)/86400000); }

  // Cálculo por EECC (misma definición que calcEECC de rca.js).
  function calc(e, facturas, pct){
    pct = +pct || 10;
    const decl = +e.monto_declarado || 0;
    const meta = decl*pct/100;
    const facts = (facturas||[]).filter(f=>f.eecc_id===e.eecc_id);
    const suma = arr => arr.reduce((a,f)=>a+(+f.monto_clp||0),0);
    const fOk     = facts.filter(f=>f.estado_revision==='ok');
    const fPend   = facts.filter(f=>f.estado_revision==='pendiente');
    const fNoReg  = facts.filter(f=>f.estado_revision==='no_regional');
    const fIncomp = facts.filter(f=>f.estado_revision==='incompleta');
    const rep = suma(fOk);
    const avance = meta>0?Math.min(100,Math.round(rep/meta*100)):0;
    return {
      decl, meta, rep, avance,
      faltaPct: Math.max(0,100-avance), faltaClp: Math.max(0,meta-rep),
      dias: dias(e.fecha_hasta),
      nTotal: facts.length, nContadas: fOk.length,
      nPend: fPend.length, nNoReg: fNoReg.length, nIncomp: fIncomp.length,
      montoReportado: suma(facts), montoContado: rep,
      fOk, fPend, fNoReg, fIncomp
    };
  }

  function tablaFact(facts, opts){
    opts = opts||{};
    if(!facts.length) return '<div class="rp-vacio">Sin facturas en esta categoría.</div>';
    const filas = facts.map(f=>`<tr>
      <td>${esc(f.anio||'')}</td><td>${esc(f.mes||'')}</td><td>${esc(f.num_factura||'—')}</td>
      <td>${esc(rutFmt(f.rut_proveedor)||'—')}</td><td>${esc(f.razon_social||'—')}</td>
      <td>${esc(f.comuna||'—')}</td><td class="rp-num">${clp(f.monto_clp)}</td>
      ${opts.motivo?`<td>${esc(f.motivo_descarte||'')}</td>`:''}
    </tr>`).join('');
    return `<table class="rp-tabla">
      <thead><tr><th>Año</th><th>Mes</th><th>N° factura</th><th>RUT</th><th>Proveedor</th>
        <th>Comuna</th><th class="rp-num">Monto CLP</th>${opts.motivo?'<th>Motivo</th>':''}</tr></thead>
      <tbody>${filas}</tbody></table>`;
  }
  function drill(titulo, ico, facts, opts){
    const monto = facts.reduce((a,f)=>a+(+f.monto_clp||0),0);
    return `<details class="rp-drill"${facts.length?'':' data-vacio="1"'}>
      <summary><span>${ico} ${esc(titulo)}</span>
        <span class="rp-drill-n">${facts.length} factura(s) · ${clp(monto)} <b>▸ ver</b></span></summary>
      <div class="rp-drill-body">${tablaFact(facts,opts)}</div></details>`;
  }

  function seccionEECC(e, facturas, pct){
    const c = calc(e, facturas, pct);
    const col = c.avance>=80?'#1e7e34':c.avance>=40?'#b8860b':'#c0311b';
    const periodo = (e.fecha_desde||e.fecha_hasta)
      ? `${e.fecha_desde?fmtDia(e.fecha_desde):'—'} → ${e.fecha_hasta?fmtDia(e.fecha_hasta):'—'}` : 'sin fechas de contrato';
    const diasTxt = c.dias===null?'sin fecha de término'
      : c.dias>0?`${c.dias} día(s) de contrato`
      : c.dias===0?'contrato vence hoy':`contrato vencido hace ${-c.dias} día(s)`;
    return `<section class="rp-eecc">
      <div class="rp-eecc-h">
        <div><h2>${esc(e.nombre)}</h2>
          <div class="rp-sub">${e.rut?'RUT '+esc(rutFmt(e.rut))+' · ':''}Contrato ${esc(e.numero_contrato||'—')}</div></div>
        <div class="rp-eecc-plazo"><div>📅 ${esc(periodo)}</div><div class="rp-dias ${c.dias!==null&&c.dias<=30?'urg':''}">⏳ ${esc(diasTxt)}</div></div>
      </div>

      <div class="rp-bloque">
        <div class="rp-bloque-t">Avance de lo comprometido</div>
        <div class="rp-barra"><div class="rp-barra-in" style="width:${c.avance}%;background:${col}"></div></div>
        <div class="rp-cifras">
          <div><span>Comprometido (meta ${(+pct||10)}%)</span><b>${clp(c.meta)}</b></div>
          <div><span>Reportado que suma</span><b style="color:#1e7e34">${clp(c.rep)}</b></div>
          <div><span>Avance</span><b style="color:${col}">${c.avance}%</b></div>
          <div><span>Falta para la meta</span><b style="color:${col}">${c.avance>=100?'✓ cumplida':clp(c.faltaClp)+' ('+c.faltaPct+'%)'}</b></div>
        </div>
        <div class="rp-nota-decl">Monto declarado por carta formal: <b>${clp(c.decl)}</b>.</div>
      </div>

      <div class="rp-bloque">
        <div class="rp-bloque-t">Gestión de facturas</div>
        <div class="rp-cifras">
          <div><span>Reportadas (total en el Excel)</span><b>${c.nTotal}</b></div>
          <div><span>Contadas (suman al ${(+pct||10)}%)</span><b style="color:#1e7e34">${c.nContadas}</b></div>
          <div><span>No sumaron</span><b style="color:#c0311b">${c.nTotal-c.nContadas}</b></div>
          <div><span>Monto reportado vs contado</span><b>${clp(c.montoReportado)} / <span style="color:#1e7e34">${clp(c.montoContado)}</span></b></div>
        </div>
        <div class="rp-drills">
          ${drill('Contabilizadas · proveedores regionales (suman al '+(+pct||10)+'%)','🟢',c.fOk,{})}
          ${drill('Datos incompletos (N° de factura o fecha)','🟠',c.fIncomp,{motivo:true})}
          ${drill('Pertenecen a otra comuna (fuera de región)','🔴',c.fNoReg,{})}
          ${drill('Por revisar (proveedor no reconocido)','🟡',c.fPend,{})}
        </div>
      </div>
    </section>`;
  }

  function resumen(lista, facturas, pct){
    const tot = lista.reduce((a,e)=>{const c=calc(e,facturas,pct);a.decl+=c.decl;a.meta+=c.meta;a.rep+=c.rep;
      a.nTot+=c.nTotal;a.nOk+=c.nContadas;return a;},{decl:0,meta:0,rep:0,nTot:0,nOk:0});
    const avG = tot.meta>0?Math.min(100,Math.round(tot.rep/tot.meta*100)):0;
    const col = avG>=80?'#1e7e34':avG>=40?'#b8860b':'#c0311b';
    const filas = lista.map(e=>{const c=calc(e,facturas,pct);
      const cc=c.avance>=80?'#1e7e34':c.avance>=40?'#b8860b':'#c0311b';
      return `<tr>
        <td>${esc(e.nombre)}</td><td>${esc(rutFmt(e.rut)||'—')}</td>
        <td class="rp-num">${clp(c.meta)}</td><td class="rp-num" style="color:#1e7e34">${clp(c.rep)}</td>
        <td class="rp-num"><b style="color:${cc}">${c.avance}%</b></td>
        <td class="rp-num">${c.nContadas}/${c.nTotal}</td>
        <td class="rp-num">${c.nIncomp||''}</td><td class="rp-num">${c.nNoReg||''}</td>
        <td>${c.dias===null?'—':c.dias>0?c.dias+' d':c.dias===0?'hoy':'vencido'}</td>
      </tr>`;}).join('');
    return `<section class="rp-resumen">
      <h2>Resumen general · ${lista.length} EECC</h2>
      <div class="rp-kpis">
        <div class="rp-kpi"><b>${clp(tot.meta)}</b><span>Meta comprometida (${(+pct||10)}%)</span></div>
        <div class="rp-kpi"><b style="color:#1e7e34">${clp(tot.rep)}</b><span>Reportado que suma</span></div>
        <div class="rp-kpi"><b style="color:${col}">${avG}%</b><span>Avance global</span></div>
        <div class="rp-kpi"><b>${tot.nOk}/${tot.nTot}</b><span>Facturas contadas / reportadas</span></div>
      </div>
      <table class="rp-tabla rp-resumen-tbl">
        <thead><tr><th>EECC</th><th>RUT</th><th class="rp-num">Meta</th><th class="rp-num">Reportado</th>
          <th class="rp-num">Avance</th><th class="rp-num">Fact. contadas/total</th>
          <th class="rp-num">Incompl.</th><th class="rp-num">Otra comuna</th><th>Contrato</th></tr></thead>
        <tbody>${filas}</tbody></table>
    </section>`;
  }

  function css(){
    return `*{box-sizing:border-box}body{margin:0;font-family:'Inter',system-ui,Arial,sans-serif;color:#1f2a2c;background:#eef2f3}
    .rp-wrap{max-width:1000px;margin:0 auto;padding:24px 20px 60px}
    .rp-head{background:#006973;color:#fff;border-radius:14px;padding:20px 24px;margin-bottom:18px}
    .rp-head h1{margin:0 0 4px;font-size:1.5rem}.rp-head .rp-meta{opacity:.9;font-size:.9rem}
    .rp-tag{display:inline-block;background:rgba(255,255,255,.18);border-radius:20px;padding:3px 12px;font-size:.78rem;margin-top:8px}
    h2{font-size:1.2rem;color:#006973;margin:0 0 12px}
    .rp-resumen,.rp-eecc{background:#fff;border:1px solid #dfe6e7;border-radius:14px;padding:20px 22px;margin-bottom:18px}
    .rp-eecc{border-left:5px solid #006973}
    .rp-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
    .rp-kpi{background:#f6f9f9;border:1px solid #e3ebec;border-radius:10px;padding:12px}
    .rp-kpi b{display:block;font-size:1.15rem}.rp-kpi span{font-size:.72rem;color:#5f6973;text-transform:uppercase}
    .rp-eecc-h{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;border-bottom:1px solid #eef2f3;padding-bottom:12px;margin-bottom:14px}
    .rp-eecc-h h2{margin:0}.rp-sub{font-size:.82rem;color:#5f6973;margin-top:3px}
    .rp-eecc-plazo{text-align:right;font-size:.82rem;color:#5f6973}
    .rp-dias{margin-top:3px;font-weight:700;color:#1e7e34}.rp-dias.urg{color:#b8860b}
    .rp-bloque{margin-top:14px}.rp-bloque-t{font-size:.75rem;font-weight:700;text-transform:uppercase;color:#006973;letter-spacing:.04em;margin-bottom:8px}
    .rp-barra{background:#eef2f3;border-radius:6px;height:11px;overflow:hidden;margin-bottom:10px}
    .rp-barra-in{height:11px;border-radius:6px}
    .rp-cifras{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .rp-cifras>div{display:flex;flex-direction:column;background:#f6f9f9;border:1px solid #e3ebec;border-radius:8px;padding:9px 11px}
    .rp-cifras span{font-size:.68rem;color:#5f6973;text-transform:uppercase}.rp-cifras b{font-size:.98rem;margin-top:2px}
    .rp-nota-decl{font-size:.78rem;color:#5f6973;margin-top:8px}
    .rp-drills{margin-top:12px;display:flex;flex-direction:column;gap:8px}
    .rp-drill{border:1px solid #e3ebec;border-radius:9px;overflow:hidden}
    .rp-drill[data-vacio="1"]{opacity:.55}
    .rp-drill summary{cursor:pointer;display:flex;justify-content:space-between;gap:10px;padding:10px 13px;background:#f6f9f9;font-size:.86rem;font-weight:600;list-style:none}
    .rp-drill summary::-webkit-details-marker{display:none}
    .rp-drill-n{color:#5f6973;font-weight:500}.rp-drill-n b{color:#006973}
    .rp-drill-body{padding:6px 13px 13px;overflow-x:auto}
    .rp-tabla{width:100%;border-collapse:collapse;font-size:.8rem;margin-top:6px}
    .rp-tabla th,.rp-tabla td{border:1px solid #e6ecec;padding:6px 8px;text-align:left}
    .rp-tabla thead th{background:#f0f5f5;color:#006973}
    .rp-num{text-align:right}.rp-vacio{font-size:.82rem;color:#8a949a;padding:8px 0}
    .rp-resumen-tbl{margin-top:6px}
    .rp-foot{text-align:center;color:#8a949a;font-size:.75rem;margin-top:24px}
    @media print{body{background:#fff}.rp-eecc,.rp-resumen{break-inside:avoid;page-break-inside:avoid}.rp-drill[open] summary b{display:none}}
    @media(max-width:640px){.rp-kpis,.rp-cifras{grid-template-columns:repeat(2,1fr)}}`;
  }

  // Solo el cuerpo (resumen + hojas), para inyectarlo en una página ya montada.
  function cuerpo(o){
    const modo = o.modo==='eecc' ? 'eecc' : 'gerencia';
    const pct = +(o.rca&&o.rca.pct_meta) || 10;
    const lista = o.lista||[];
    return (modo==='gerencia' ? resumen(lista, o.facturas, pct) : '')
      + lista.map(e=>seccionEECC(e, o.facturas, pct)).join('');
  }

  function tituloDe(o){
    const r=o.rca||{}, lista=o.lista||[];
    return (o.modo==='eecc')
      ? `Reporte EECC · ${(lista[0]&&lista[0].nombre)||''}`
      : `Reporte gerencia · RCA ${r.codigo||''}`;
  }
  // El contenido de la página (.rp-wrap): cabecera + cuerpo + pie. Sirve tanto
  // para el documento descargable como para inyectarlo en la página pública.
  function pagina(o){
    const r=o.rca||{}, modo=o.modo==='eecc'?'eecc':'gerencia';
    const gen=o.generadoEn || new Date().toLocaleString('es-CL');
    return `<div class="rp-wrap">
      <div class="rp-head">
        <h1>${esc(tituloDe(o))}</h1>
        <div class="rp-meta">RCA ${esc(r.codigo||'')}${r.nombre?' · '+esc(r.nombre):''} · Meta ${(+r.pct_meta||10)}% de lo declarado por cada EECC</div>
        <span class="rp-tag">${modo==='eecc'?'Reporte para la empresa colaboradora':'Reporte para gerencia'} · ${o.enVivo?'actualizado':'generado'} ${esc(gen)}</span>
      </div>
      ${cuerpo(o)}
      <div class="rp-foot">Sistema AM · RCA Cumplimiento · Antofagasta Minerals. Los montos que no suman se listan por su motivo; haz clic en cada lista para ver el detalle.</div>
    </div>`;
  }
  // Documento HTML completo y autónomo (para descargar o abrir en pestaña nueva).
  function documento(o){
    return `<!doctype html><html lang="es"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${esc(tituloDe(o))}</title><style>${css()}</style></head><body>
      ${pagina(o)}</body></html>`;
  }

  return { esc, clp, rutFmt, fmtDia, dias, calc, seccionEECC, resumen, css, cuerpo, pagina, documento, tituloDe };
})();
