// ═══════════════════════════════════════════════════════════════════════════
// buscar.js — Búsqueda pública de bolsas por código (Lavanderías Sierra Gorda)
// Sistema AM · Antofagasta Minerals
//
// Página de LIBRE ACCESO (sin login): usa el anon key y la función pública
// lav_buscar(codigo), que devuelve solo el contenido de esa bolsa. No lee tablas
// directo. El código es aleatorio (no dato personal). Permite exportar a PDF.
//
// <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════
let SBL = null;
let ULTIMO = null;   // último resultado, para el PDF

function _esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function _sb(){ if(!SBL) SBL = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key); return SBL; }
function _fecha(iso){
  if(!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL') + ' · ' + d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
}
const CAT_LABEL = { cama:'Ropa de cama', trabajo:'Ropa de trabajo' };

async function buscar(){
  const cod = (document.getElementById('cod').value || '').trim().toUpperCase();
  const msg = document.getElementById('msg');
  const res = document.getElementById('resultado');
  res.innerHTML = ''; ULTIMO = null;
  if(cod.length < 7){ msg.className='lavp-msg err'; msg.textContent='El código tiene 7 caracteres (3 letras y 4 números).'; return; }
  msg.className='lavp-msg'; msg.textContent='Buscando…';
  try{
    const { data, error } = await _sb().rpc('lav_buscar', { p_codigo: cod });
    if(error) throw error;
    if(!data || data.error){
      msg.className='lavp-msg err';
      msg.textContent = data && data.error==='no_encontrado'
        ? 'No se encontró ninguna bolsa con ese código. Revisa que esté bien escrito.'
        : 'No se pudo buscar. Intenta de nuevo.';
      return;
    }
    msg.textContent=''; ULTIMO = data;
    render(data);
  }catch(e){
    msg.className='lavp-msg err'; msg.textContent='Error al buscar: '+(e.message||e);
  }
}

function render(d){
  const grupos = {};
  (d.items||[]).forEach(it=>{ (grupos[it.categoria]=grupos[it.categoria]||[]).push(it); });
  const seccion = cat => {
    const arr = grupos[cat]; if(!arr || !arr.length) return '';
    const filas = arr.map(it=>`<tr><td>${_esc(it.nombre)}</td><td class="num">${it.cantidad}</td></tr>`).join('');
    const sub = arr.reduce((a,it)=>a+(+it.cantidad||0),0);
    return `<div class="lavr-cat">
      <div class="lavr-cat-t">${_esc(CAT_LABEL[cat]||cat)}</div>
      <table class="lavr-tabla"><thead><tr><th>Prenda</th><th class="num">Cantidad</th></tr></thead>
        <tbody>${filas}</tbody>
        <tfoot><tr><td>Subtotal</td><td class="num">${sub}</td></tr></tfoot></table>
    </div>`;
  };
  document.getElementById('resultado').innerHTML = `
    <div class="lavr-card" id="lavrCard">
      <div class="lavr-head">
        <div>
          <div class="lavr-cod">Código ${_esc(d.codigo)}</div>
          <div class="lavr-lav">🧺 ${_esc(d.lavanderia||'—')}</div>
          <div class="lavr-fecha">Registrada el ${_esc(_fecha(d.creado_at))}</div>
        </div>
        <button class="lavp-btn ghost" onclick="exportarPDF()">📄 Exportar PDF</button>
      </div>
      <div class="lavr-kpis">
        <div><b>${d.total_prendas||0}</b><span>Prendas en total</span></div>
        <div><b>${d.kilogramos!=null?d.kilogramos:'—'}</b><span>Kilogramos del bulto</span></div>
      </div>
      ${seccion('cama')}
      ${seccion('trabajo')}
    </div>`;
}

function exportarPDF(){
  const d = ULTIMO; if(!d) return;
  try{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4' });
    const M = 18; let y = 20;
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(20,20,20);
    doc.text('Trazabilidad de bolsa', M, y); y += 7;
    doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.setTextColor(90,90,90);
    doc.text('Lavanderías Sierra Gorda · Antofagasta Minerals', M, y); y += 10;

    doc.setDrawColor(210); doc.line(M, y, 210-M, y); y += 8;
    doc.setTextColor(20,20,20); doc.setFont('helvetica','bold'); doc.setFontSize(13);
    doc.text('Código: ' + (d.codigo||''), M, y); y += 7;
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(60,60,60);
    doc.text('Lavandería: ' + (d.lavanderia||'—'), M, y); y += 6;
    doc.text('Registrada el: ' + _fecha(d.creado_at), M, y); y += 6;
    doc.text('Kilogramos del bulto: ' + (d.kilogramos!=null?d.kilogramos:'—'), M, y); y += 6;
    doc.text('Prendas en total: ' + (d.total_prendas||0), M, y); y += 10;

    const grupos = {};
    (d.items||[]).forEach(it=>{ (grupos[it.categoria]=grupos[it.categoria]||[]).push(it); });
    ['cama','trabajo'].forEach(cat=>{
      const arr = grupos[cat]; if(!arr || !arr.length) return;
      if(y > 260){ doc.addPage(); y = 20; }
      doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(20,20,20);
      doc.text(CAT_LABEL[cat]||cat, M, y); y += 6;
      doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor(50,50,50);
      arr.forEach(it=>{
        if(y > 275){ doc.addPage(); y = 20; }
        doc.text('• ' + it.nombre, M+2, y);
        doc.text(String(it.cantidad), 210-M, y, { align:'right' });
        y += 5.5;
      });
      const sub = arr.reduce((a,it)=>a+(+it.cantidad||0),0);
      doc.setFont('helvetica','bold');
      doc.text('Subtotal', M+2, y); doc.text(String(sub), 210-M, y, { align:'right' }); y += 9;
    });
    doc.setFontSize(8.5); doc.setTextColor(140,140,140);
    doc.text('Documento generado desde la plataforma de trazabilidad · ' + new Date().toLocaleString('es-CL'), M, 288);
    doc.save('Bolsa_' + (d.codigo||'') + '.pdf');
  }catch(e){
    const msg = document.getElementById('msg');
    msg.className='lavp-msg err'; msg.textContent='No se pudo generar el PDF: '+(e.message||e);
  }
}

// Permite abrir con ?codigo=XXX precargado (p.ej. desde un QR futuro).
(function(){
  const c = new URLSearchParams(location.search).get('codigo');
  if(c){ const i=document.getElementById('cod'); if(i){ i.value=c.toUpperCase().replace(/[^A-Z0-9]/g,''); buscar(); } }
})();
