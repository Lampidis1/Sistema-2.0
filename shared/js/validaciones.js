// ═══════════════════════════════════════════════════════════════════════════
// validaciones.js — Reglas de formato/validación COMPARTIDAS (window.AMForm)
// Sistema AM · Antofagasta Minerals
//
// Un solo lugar para las reglas de RUT, teléfono, correo y fechas, para que
// Recepción (móvil), el CV interno de Empleabilidad y el link externo de CV
// usen EXACTAMENTE lo mismo (CLAUDE.md Regla 8: lo común va a shared/).
// <script src> clásico, nunca type="module": expone window.AMForm global.
// ═══════════════════════════════════════════════════════════════════════════
(function(){
  'use strict';

  // ── RUT chileno ────────────────────────────────────────────────────────────
  function rutLimpio(v){ return String(v==null?'':v).replace(/[^0-9kK]/g,'').toUpperCase(); }
  // Formatea 123456789 → 12.345.678-9 (puntos de miles + guion antes del DV).
  function rutFormat(v){
    const s=rutLimpio(v); if(s.length<2) return s;
    const dv=s.slice(-1); let cuerpo=s.slice(0,-1), out='';
    for(let i=cuerpo.length; i>0; i-=3){ out=cuerpo.slice(Math.max(0,i-3),i)+(out?'.'+out:''); }
    return out+'-'+dv;
  }
  // Valida el dígito verificador (módulo 11; acepta K). Cuerpo de 7 u 8 dígitos.
  function rutValido(v){
    const s=rutLimpio(v);
    if(!/^\d{7,8}[0-9K]$/.test(s)) return false;
    const cuerpo=s.slice(0,-1), dv=s.slice(-1);
    let suma=0, mul=2;
    for(let i=cuerpo.length-1; i>=0; i--){ suma+=parseInt(cuerpo[i],10)*mul; mul = mul===7?2:mul+1; }
    const res=11-(suma%11);
    const dvCalc = res===11?'0' : res===10?'K' : String(res);
    return dvCalc===dv;
  }

  // ── Teléfono chileno móvil (+569XXXXXXXX) ──────────────────────────────────
  function fonoFormat(v){
    let d=String(v==null?'':v).replace(/\D/g,'').replace(/^56/,''); // quitar país
    if(d[0]==='9') d=d.slice(1);                                    // quitar el 9 de móvil
    d=d.slice(-8);                                                  // 8 dígitos finales
    return d.length===8 ? '+569'+d : String(v==null?'':v).trim();
  }
  function fonoValido(v){ return /^\+569\d{8}$/.test(String(v==null?'':v).trim()); }

  // ── Correo ─────────────────────────────────────────────────────────────────
  function emailValido(v){
    const s=String(v==null?'':v).trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  }

  // ── Fechas ───────────────────────────────────────────────────────────────
  function pad2(n){ return String(n).padStart(2,'0'); }
  // 'YYYY-MM-DD' → 'DD/MM/AAAA'
  function fmtFechaDMY(iso){
    const s=String(iso||''); const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[3]+'/'+m[2]+'/'+m[1]) : s;
  }
  // 'YYYY-MM' (o 'MM/AAAA') → 'MM/AAAA'
  function fmtMesAnio(v){
    const s=String(v||''); let m=s.match(/^(\d{4})-(\d{2})$/); if(m) return m[2]+'/'+m[1];
    m=s.match(/^(\d{2})\/(\d{4})$/); if(m) return s; return s;
  }
  function fechaHoyISO(){ const d=new Date(); return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }

  // Selector mes/año (MM/AAAA) para experiencia laboral. Devuelve HTML de dos
  // <select> (mes y año). Valor que produce: 'YYYY-MM' vía AMForm.leerMesAnio(id).
  function selMesAnio(id, valor, opts){
    opts=opts||{};
    const v=String(valor||''); let mm='', yy='';
    let mo=v.match(/^(\d{4})-(\d{2})$/); if(mo){ yy=mo[1]; mm=mo[2]; }
    else { mo=v.match(/^(\d{2})\/(\d{4})$/); if(mo){ mm=mo[1]; yy=mo[2]; } }
    const meses=['01','02','03','04','05','06','07','08','09','10','11','12'];
    const nombres=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const ahora=new Date().getFullYear();
    const desde=(opts.desdeAnio||ahora-60), hasta=(opts.hastaAnio||ahora+1);
    let anios=''; for(let a=hasta;a>=desde;a--) anios+='<option '+(String(a)===yy?'selected':'')+'>'+a+'</option>';
    const dis=opts.disabled?'disabled':'';
    const oc=opts.onchange?(' onchange="'+opts.onchange+'"'):'';
    return '<span class="am-mesanio" data-id="'+id+'">'
      +'<select id="'+id+'_m" '+dis+oc+'><option value="">Mes</option>'+meses.map((mv,i)=>'<option value="'+mv+'" '+(mv===mm?'selected':'')+'>'+nombres[i]+'</option>').join('')+'</select>'
      +'<select id="'+id+'_y" '+dis+oc+'><option value="">Año</option>'+anios+'</select></span>';
  }
  function leerMesAnio(id){
    const m=document.getElementById(id+'_m'), y=document.getElementById(id+'_y');
    if(!m||!y||!m.value||!y.value) return '';
    return y.value+'-'+m.value; // 'YYYY-MM'
  }
  function setMesAnioDisabled(id, dis){
    const m=document.getElementById(id+'_m'), y=document.getElementById(id+'_y');
    if(m) m.disabled=!!dis; if(y) y.disabled=!!dis;
    if(dis){ if(m) m.value=''; if(y) y.value=''; }
  }

  // Texto de un período de experiencia: 'MM/AAAA - MM/AAAA' o 'MM/AAAA - Actualidad'.
  function periodoTexto(inicio, fin, actual){
    const ini=fmtMesAnio(inicio||'');
    if(actual) return ini ? (ini+' - Actualidad') : 'Actualidad';
    const f=fmtMesAnio(fin||'');
    return [ini, f].filter(Boolean).join(' - ');
  }

  window.AMForm={
    rutLimpio, rutFormat, rutValido,
    fonoFormat, fonoValido,
    emailValido,
    fmtFechaDMY, fmtMesAnio, fechaHoyISO, periodoTexto,
    selMesAnio, leerMesAnio, setMesAnioDisabled
  };
})();
