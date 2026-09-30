// ═══════════════════════════════════════════════════════════════════════════
// reclamos-imagen.js — genera un PNG de la tabla del informe dibujándola a mano
// sobre un <canvas>. Sin dependencias (Regla 6) y sin foreignObject (que
// "contamina" el canvas en Chrome e impide exportarlo). Se carga en
// index.html y en ver.html. window.recImagenPNG(filas, filename).
//
// Usa Arial/Helvetica (fuentes del sistema) para no depender de webfonts al
// rasterizar. Respeta el rowspan de "EMPRESA DENUNCIADA" y el color de DÍAS.
// ═══════════════════════════════════════════════════════════════════════════
(function(){
  const COLS=[
    {k:'cod',       t:'RECLAMO',            w:82,  align:'left'},
    {k:'fecha',     t:'FECHA INGRESO',      w:82,  align:'left'},
    {k:'estado',    t:'ESTADO RECLAMO',     w:82,  align:'left'},
    {k:'dias',      t:'DÍAS EN GESTIÓN',    w:54,  align:'center'},
    {k:'cia',       t:'COMPAÑÍA',           w:74,  align:'left'},
    {k:'cat',       t:'CATEGORÍA',          w:92,  align:'left'},
    {k:'monto',     t:'MONTO',              w:94,  align:'right'},
    {k:'denunciada',t:'EMPRESA DENUNCIADA', w:150, align:'center'},
    {k:'provAfect', t:'PROVEEDOR AFECTADO', w:130, align:'left'},
    {k:'loc',       t:'LOCALIDAD AFECTADO', w:92,  align:'left'},
    {k:'estatus',   t:'ESTATUS',            w:230, align:'center'}
  ];
  const PAD=6, LH=15, HLH=13, FONT='12px Arial, Helvetica, sans-serif',
        BFONT='bold 12px Arial, Helvetica, sans-serif', HFONT='bold 11px Arial, Helvetica, sans-serif',
        SCALE=2, TEAL='#006973', LINE='#cdd7d8', OUT='#9fb3b5', TXT='#1C2632';
  const _m=document.createElement('canvas').getContext('2d');
  const inner=c=>c.w-PAD*2;

  function wrapSeg(text,w,font){
    _m.font=font; const words=String(text==null?'':text).split(/\s+/).filter(Boolean); const lines=[]; let cur='';
    words.forEach(word=>{ const test=cur?cur+' '+word:word;
      if(_m.measureText(test).width<=w||!cur){cur=test;} else {lines.push(cur);cur=word;} });
    if(cur) lines.push(cur); return lines.length?lines:[''];
  }
  function wrap(text,w,font){ return String(text==null?'':text).split('\n').reduce((a,seg)=>a.concat(wrapSeg(seg,w,font)),[]); }

  function recImagenPNG(filas, filename){
    filas=filas||[];
    if(!filas.length){ if(window.toast) toast('No hay filas para la imagen','err'); return; }
    const headLines=COLS.map(c=>wrapSeg(c.t,inner(c),HFONT));
    const headH=Math.max.apply(null,headLines.map(l=>l.length))*HLH+PAD*2;
    const cellLines=filas.map(r=>{ const o={}; COLS.forEach(c=>{ if(c.k!=='denunciada') o[c.k]=wrap(r[c.k],inner(c),FONT); }); return o; });
    const rowH=cellLines.map(o=>Math.max.apply(null,COLS.filter(c=>c.k!=='denunciada').map(c=>o[c.k].length))*LH+PAD*2);
    const span={}; filas.forEach((r,i)=>{ const key=(r.cia||'')+'|'+(r.denunciada||'');
      if(i===0||key!==((filas[i-1].cia||'')+'|'+(filas[i-1].denunciada||''))){
        let n=1; for(let j=i+1;j<filas.length&&((filas[j].cia||'')+'|'+(filas[j].denunciada||''))===key;j++)n++; span[i]=n; } });

    const W=COLS.reduce((s,c)=>s+c.w,0), H=headH+rowH.reduce((a,b)=>a+b,0);
    const cv=document.createElement('canvas'); cv.width=W*SCALE; cv.height=H*SCALE;
    const ctx=cv.getContext('2d'); ctx.scale(SCALE,SCALE); ctx.textBaseline='top';
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);

    // Cabecera
    ctx.fillStyle=TEAL; ctx.fillRect(0,0,W,headH);
    ctx.fillStyle='#fff'; ctx.font=HFONT; ctx.textAlign='center';
    let x=0; COLS.forEach((c,ci)=>{ const l=headLines[ci], ty=(headH-l.length*HLH)/2;
      l.forEach((ln,li)=>ctx.fillText(ln,x+c.w/2,ty+li*HLH)); x+=c.w; });

    // Filas
    let y=headH;
    filas.forEach((r,i)=>{
      const h=rowH[i]; let cx=0;
      COLS.forEach(c=>{
        if(c.k==='denunciada'){
          if(span[i]!==undefined){
            let sh=0; for(let k=i;k<i+span[i];k++) sh+=rowH[k];
            ctx.fillStyle='#fafbfb'; ctx.fillRect(cx,y,c.w,sh);
            ctx.strokeStyle=LINE; ctx.strokeRect(cx,y,c.w,sh);
            const dl=wrap(r.denunciada||'-',inner(c),BFONT);
            ctx.fillStyle=TXT; ctx.font=BFONT; ctx.textAlign='center';
            const ty=y+(sh-dl.length*LH)/2; dl.forEach((ln,li)=>ctx.fillText(ln,cx+c.w/2,ty+li*LH));
          }
          cx+=c.w; return;
        }
        if(c.k==='dias'){ ctx.fillStyle=(r.dias>30)?'#D0311B':'#1a7a38'; ctx.fillRect(cx,y,c.w,h); ctx.fillStyle='#fff'; ctx.font=BFONT; }
        else { ctx.font=FONT; ctx.fillStyle=TXT; }
        ctx.strokeStyle=LINE; ctx.strokeRect(cx,y,c.w,h);
        const lines=cellLines[i][c.k]; ctx.textAlign=c.align;
        const tx = c.align==='center'? cx+c.w/2 : c.align==='right'? cx+c.w-PAD : cx+PAD;
        const ty = y+(h-lines.length*LH)/2;
        lines.forEach((ln,li)=>ctx.fillText(ln,tx,ty+li*LH));
        cx+=c.w;
      });
      y+=h;
    });
    ctx.strokeStyle=OUT; ctx.strokeRect(0,0,W,H);

    cv.toBlob(function(b){
      if(!b){ if(window.toast) toast('No se pudo generar la imagen','err'); return; }
      const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=filename||'informe.png';
      document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },100);
      if(window.toast) toast('Imagen descargada','ok');
    },'image/png');
  }
  window.recImagenPNG=recImagenPNG;
})();
