// ═══════════════════════════════════════════════════════════════════════════
// shared/js/mapa.js — Motor de mapa vectorial AUTOCONTENIDO (window.MapaAM)
// Sistema AM · Antofagasta Minerals
//
// Dibuja capas GeoJSON (polígonos, líneas) y pines lat/long sobre un <canvas>,
// con pan (arrastrar), zoom (rueda / pinch / botones) y clic en pines. SIN tiles,
// SIN Leaflet/MapLibre, SIN servicios externos ni datos a terceros (Reglas 5 y 6).
//
// Proyección: equirectangular con corrección de latitud (suficiente a escala de
// pueblo/región). Datos GeoJSON en WGS84 lat/long (ver shared/assets/geo/).
//
// Uso:
//   const m = MapaAM.crear(divContenedor, { onPinClick:(pin)=>{...} });
//   m.setBase({ poligonos:[gjEdificios], lineas:[gjCalles], estilos:{...} });
//   m.setPines([{ id, lat, lng, color, label, r, data }]);
//   m.fit();                 // encuadra a los datos
//   m.destroy();
//
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo MapaAM.
// ═══════════════════════════════════════════════════════════════════════════
(function(){
'use strict';

function clamp(v,a,b){ return v<a?a:v>b?b:v; }

function Mapa(cont, opts){
  opts = opts||{};
  this.cont = cont;
  this.onPinClick = opts.onPinClick||null;
  this.onView = opts.onView||null;              // callback tras pan/zoom (para clustering externo)
  this.base = { poligonos:[], lineas:[], estilos:{} };
  this.pines = [];
  this.view = { cx:-69.32, cy:-22.89, ppd:20000 }; // centro + pixeles-por-grado
  this.minppd = 50; this.maxppd = 4_000_000;
  this._raf = null;
  this._mkCanvas();
  this._bind();
}

Mapa.prototype._mkCanvas = function(){
  const c = document.createElement('canvas');
  c.style.width='100%'; c.style.height='100%'; c.style.display='block';
  c.style.cursor='grab'; c.style.touchAction='none';
  this.cont.style.position = this.cont.style.position||'relative';
  this.cont.appendChild(c);
  this.canvas = c; this.ctx = c.getContext('2d');
  // botones zoom
  const zb = document.createElement('div');
  zb.className='mapa-zoom';
  zb.innerHTML = '<button type="button" aria-label="Acercar">+</button><button type="button" aria-label="Alejar">−</button>';
  this.cont.appendChild(zb);
  const [bmas,bmenos] = zb.querySelectorAll('button');
  bmas.onclick = ()=>this._zoomAt(this.canvas.width/2/this._dpr(), this.canvas.height/2/this._dpr(), 1.5);
  bmenos.onclick = ()=>this._zoomAt(this.canvas.width/2/this._dpr(), this.canvas.height/2/this._dpr(), 1/1.5);
  this._resize();
};
Mapa.prototype._dpr = function(){ return Math.min(window.devicePixelRatio||1, 2); };
Mapa.prototype._resize = function(){
  const r = this.cont.getBoundingClientRect(), dpr=this._dpr();
  this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
  this.canvas.width = Math.round(this.w*dpr); this.canvas.height = Math.round(this.h*dpr);
  this.ctx.setTransform(dpr,0,0,dpr,0,0);
  this._draw();
};

// ── proyección ───────────────────────────────────────────────────────────────
Mapa.prototype._latc = function(){ return Math.cos(this.view.cy*Math.PI/180); };
Mapa.prototype.toPx = function(lng,lat){
  const v=this.view;
  return [ this.w/2 + (lng-v.cx)*v.ppd*this._latc(),
           this.h/2 - (lat-v.cy)*v.ppd ];
};
Mapa.prototype.toGeo = function(px,py){
  const v=this.view;
  return [ v.cx + (px-this.w/2)/(v.ppd*this._latc()),
           v.cy - (py-this.h/2)/v.ppd ];
};

// ── datos ─────────────────────────────────────────────────────────────────────
Mapa.prototype.setBase = function(base){ this.base = Object.assign({poligonos:[],lineas:[],estilos:{}}, base||{}); this._draw(); return this; };
Mapa.prototype.setPines = function(pines){ this.pines = pines||[]; this._draw(); return this; };

// Recorre coordenadas de una geometría GeoJSON llamando cb(ring) por anillo/línea.
function eachRing(geom, cb){
  if(!geom) return;
  const t=geom.type, c=geom.coordinates;
  if(t==='LineString') cb(c);
  else if(t==='MultiLineString'||t==='Polygon') c.forEach(cb);
  else if(t==='MultiPolygon') c.forEach(p=>p.forEach(cb));
  else if(t==='Point') cb([c]);
}

Mapa.prototype.bounds = function(){
  let a=[Infinity,Infinity,-Infinity,-Infinity]; // minlng,minlat,maxlng,maxlat
  const grow=(lng,lat)=>{ if(lng<a[0])a[0]=lng; if(lat<a[1])a[1]=lat; if(lng>a[2])a[2]=lng; if(lat>a[3])a[3]=lat; };
  (this.base.poligonos||[]).concat(this.base.lineas||[]).forEach(gj=>{
    (gj&&gj.features||[]).forEach(f=>eachRing(f.geometry,r=>r.forEach(p=>grow(p[0],p[1]))));
  });
  this.pines.forEach(p=>grow(p.lng,p.lat));
  return isFinite(a[0])?a:null;
};
Mapa.prototype.fit = function(padPx){
  const b=this.bounds(); if(!b) return this;
  padPx = padPx==null?36:padPx;
  const cx=(b[0]+b[2])/2, cy=(b[1]+b[3])/2;
  const latc=Math.cos(cy*Math.PI/180);
  const dlng=Math.max(1e-5,(b[2]-b[0])*latc), dlat=Math.max(1e-5,(b[3]-b[1]));
  const ppd=Math.min((this.w-2*padPx)/dlng, (this.h-2*padPx)/dlat);
  this.view.cx=cx; this.view.cy=cy; this.view.ppd=clamp(ppd,this.minppd,this.maxppd);
  this._draw(); return this;
};
Mapa.prototype.centrar = function(lng,lat,ppd){
  this.view.cx=lng; this.view.cy=lat; if(ppd) this.view.ppd=clamp(ppd,this.minppd,this.maxppd);
  this._clamp(); this._draw(); return this;
};

// Limita el zoom y el paneo a un área (bounds = [minLng,minLat,maxLng,maxLat]),
// para que el mapa "no se pierda". minMult<1 permite alejar un poco más allá del
// encuadre; maxPpd fija el acercamiento máximo (nivel calle).
Mapa.prototype.setLimites = function(bounds, o){
  o=o||{}; const pad=o.pad==null?24:o.pad;
  const cx=(bounds[0]+bounds[2])/2, cy=(bounds[1]+bounds[3])/2;
  const latc=Math.cos(cy*Math.PI/180);
  const dlng=Math.max(1e-5,(bounds[2]-bounds[0])*latc), dlat=Math.max(1e-5,(bounds[3]-bounds[1]));
  const fit=Math.min((this.w-2*pad)/dlng,(this.h-2*pad)/dlat);
  this.minppd = fit*(o.minMult||0.85);         // no alejar más que ~el encuadre
  this.maxppd = o.maxPpd || fit*22;            // acercamiento máximo
  this._lim = {b:bounds.slice(), cx:cx, cy:cy};
  this.view.ppd = clamp(this.view.ppd, this.minppd, this.maxppd);
  this._clamp(); this._draw(); return this;
};
// Mantiene el centro dentro del área permitida y el zoom en rango.
Mapa.prototype._clamp = function(){
  this.view.ppd = clamp(this.view.ppd, this.minppd, this.maxppd);
  if(!this._lim) return;
  const L=this._lim, latc=this._latc();
  // Media pantalla en grados: si el área cabe entera, se fija el centro; si no,
  // se limita para que siempre quede mapa a la vista.
  const halfLng=(this.w/2)/(this.view.ppd*latc), halfLat=(this.h/2)/this.view.ppd;
  const loLng=L.b[0]+halfLng, hiLng=L.b[2]-halfLng;
  const loLat=L.b[1]+halfLat, hiLat=L.b[3]-halfLat;
  this.view.cx = loLng<=hiLng ? clamp(this.view.cx,loLng,hiLng) : L.cx;
  this.view.cy = loLat<=hiLat ? clamp(this.view.cy,loLat,hiLat) : L.cy;
};

// ── dibujo ─────────────────────────────────────────────────────────────────────
Mapa.prototype._draw = function(){
  if(this._raf) return;
  this._raf = requestAnimationFrame(()=>{ this._raf=null; this._render(); if(this.onView) this.onView(this); });
};
Mapa.prototype._render = function(){
  const ctx=this.ctx, e=this.base.estilos||{};
  ctx.clearRect(0,0,this.w,this.h);
  ctx.fillStyle = e.fondo||'#eef3f2'; ctx.fillRect(0,0,this.w,this.h);
  // polígonos (edificios / comunas)
  (this.base.poligonos||[]).forEach(gj=>{
    ctx.fillStyle = e.poligonoFill||'rgba(0,163,153,.10)';
    ctx.strokeStyle = e.poligonoStroke||'rgba(0,105,115,.35)';
    ctx.lineWidth = e.poligonoW||1;
    (gj&&gj.features||[]).forEach(f=>{
      eachRing(f.geometry, ring=>{
        ctx.beginPath();
        ring.forEach((p,i)=>{ const q=this.toPx(p[0],p[1]); i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); });
        if(f.geometry.type==='Polygon'||f.geometry.type==='MultiPolygon'){ ctx.closePath(); ctx.fill(); }
        ctx.stroke();
      });
    });
  });
  // líneas (calles)
  ctx.strokeStyle = e.lineaStroke||'#cdd8d6'; ctx.lineWidth = e.lineaW||1.4;
  ctx.lineJoin='round'; ctx.lineCap='round';
  (this.base.lineas||[]).forEach(gj=>{
    (gj&&gj.features||[]).forEach(f=>eachRing(f.geometry, ring=>{
      ctx.beginPath();
      ring.forEach((p,i)=>{ const q=this.toPx(p[0],p[1]); i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); });
      ctx.stroke();
    }));
  });
  // puntos de referencia (ciudades / localidades): punto pequeño + etiqueta
  const lblKey = e.puntoLabelKey||'nombre';
  (this.base.puntos||[]).forEach(gj=>{
    (gj&&gj.features||[]).forEach(f=>{
      if(!f.geometry||f.geometry.type!=='Point') return;
      const c=f.geometry.coordinates, q=this.toPx(c[0],c[1]);
      if(q[0]<-20||q[1]<-20||q[0]>this.w+20||q[1]>this.h+20) return;
      ctx.beginPath(); ctx.arc(q[0],q[1],e.puntoR||2.6,0,Math.PI*2);
      ctx.fillStyle=e.puntoColor||'#5f6973'; ctx.fill();
      const lbl=(f.properties&&f.properties[lblKey])||'';
      // Para no saturar: al alejar (ppd < puntoLabelMinPpd) solo se rotulan las
      // entidades "siempre" (p. ej. Ciudad/Pueblo); al acercar, todas.
      let mostrar=!!lbl;
      if(mostrar && e.puntoLabelMinPpd && this.view.ppd < e.puntoLabelMinPpd){
        const ent=f.properties&&f.properties.entidad;
        mostrar = Array.isArray(e.puntoLabelSiempre) && e.puntoLabelSiempre.indexOf(ent)>=0;
      }
      if(mostrar){
        ctx.font=e.puntoFont||'11px system-ui,sans-serif';
        ctx.textAlign='left'; ctx.textBaseline='middle';
        ctx.lineWidth=3; ctx.strokeStyle=e.puntoHalo||'rgba(255,255,255,.85)';
        ctx.strokeText(lbl,q[0]+5,q[1]); ctx.fillStyle=e.puntoLabelColor||'#3a4550'; ctx.fillText(lbl,q[0]+5,q[1]);
      }
    });
  });
  // pines
  this._pinBoxes = [];
  this.pines.forEach(pin=>{
    const q=this.toPx(pin.lng,pin.lat); if(q[0]<-40||q[1]<-40||q[0]>this.w+40||q[1]>this.h+40) return;
    const r=pin.r||8;
    ctx.beginPath(); ctx.arc(q[0],q[1],r,0,Math.PI*2);
    ctx.fillStyle=pin.color||'#5b4fcf'; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle='#fff'; ctx.stroke();
    if(pin.label!=null){
      ctx.fillStyle='#fff'; ctx.font='bold '+(r*0.95|0)+'px system-ui,sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(pin.label),q[0],q[1]+0.5);
    }
    this._pinBoxes.push({x:q[0],y:q[1],r:Math.max(r,10),pin});
  });
};

// ── interacción ────────────────────────────────────────────────────────────────
Mapa.prototype._zoomAt = function(px,py,factor){
  const g=this.toGeo(px,py);
  this.view.ppd = clamp(this.view.ppd*factor, this.minppd, this.maxppd);
  const g2=this.toGeo(px,py);
  this.view.cx += g[0]-g2[0]; this.view.cy += g[1]-g2[1];
  this._clamp(); this._draw();
};
Mapa.prototype._bind = function(){
  const c=this.canvas; let drag=null, moved=0;
  const pos=ev=>{ const r=c.getBoundingClientRect(); const t=ev.touches?ev.touches[0]:ev; return [t.clientX-r.left, t.clientY-r.top]; };
  const down=ev=>{ drag=pos(ev); moved=0; c.style.cursor='grabbing'; };
  const move=ev=>{
    if(!drag) return; ev.preventDefault();
    const p=pos(ev), dx=p[0]-drag[0], dy=p[1]-drag[1]; moved+=Math.abs(dx)+Math.abs(dy);
    this.view.cx -= dx/(this.view.ppd*this._latc()); this.view.cy += dy/this.view.ppd;
    drag=p; this._clamp(); this._draw();
  };
  const up=ev=>{
    c.style.cursor='grab';
    if(drag && moved<5){ const p=pos(ev.changedTouches?{touches:ev.changedTouches}:ev); this._click(p[0],p[1]); }
    drag=null;
  };
  c.addEventListener('mousedown',down); window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  c.addEventListener('touchstart',down,{passive:false}); c.addEventListener('touchmove',move,{passive:false}); c.addEventListener('touchend',up);
  c.addEventListener('wheel',ev=>{ ev.preventDefault(); const p=pos(ev); this._zoomAt(p[0],p[1], ev.deltaY<0?1.18:1/1.18); },{passive:false});
  // pinch
  let pd=0;
  c.addEventListener('touchmove',ev=>{ if(ev.touches.length===2){ ev.preventDefault();
    const dx=ev.touches[0].clientX-ev.touches[1].clientX, dy=ev.touches[0].clientY-ev.touches[1].clientY, d=Math.hypot(dx,dy);
    if(pd){ const r=c.getBoundingClientRect(); this._zoomAt((ev.touches[0].clientX+ev.touches[1].clientX)/2-r.left,(ev.touches[0].clientY+ev.touches[1].clientY)/2-r.top, d/pd); }
    pd=d; drag=null;
  }},{passive:false});
  c.addEventListener('touchend',()=>{ pd=0; });
  this._ro = new ResizeObserver(()=>this._resize()); this._ro.observe(this.cont);
};
Mapa.prototype._click = function(px,py){
  // pin más cercano dentro de su radio
  let best=null, bd=1e9;
  (this._pinBoxes||[]).forEach(b=>{ const d=Math.hypot(px-b.x,py-b.y); if(d<=b.r+4 && d<bd){ bd=d; best=b.pin; } });
  if(best && this.onPinClick) this.onPinClick(best);
};
Mapa.prototype.destroy = function(){
  try{ this._ro.disconnect(); }catch(e){}
  try{ this.cont.innerHTML=''; }catch(e){}
};

window.MapaAM = {
  crear: function(cont, opts){ return new Mapa(cont, opts); },
  // Carga varios GeoJSON por URL (relativa al sitio). Devuelve {clave:geojson}.
  cargar: async function(mapUrls){
    const out={}; await Promise.all(Object.keys(mapUrls).map(async k=>{
      try{ const r=await fetch(mapUrls[k]); out[k]= r.ok? await r.json() : null; }catch(e){ out[k]=null; }
    })); return out;
  }
};
})();
