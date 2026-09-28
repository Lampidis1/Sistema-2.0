#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# extraer_mapas_osm.py — Descarga puntual de capas OSM para los mapas propios.
# Sistema AM · Antofagasta Minerals
#
# Genera, por localidad, en shared/assets/geo/ :
#   · lugares-<slug>.geojson → etiquetas de CALLES (punto al medio de cada calle
#                              con nombre) y de LUGARES (place=*, plazas, hitos).
#   · poly-<slug>.geojson    → agua (bahías/lagunas) + áreas verdes (polígonos).
#   · costa-<slug>.geojson   → costa + ríos (líneas).
# El estilo/zoom lo aplica el módulo al cargar según "clase"/"tipo".
#
# NO corre en runtime. Es una descarga estática (como la satelital): el mapa se
# dibuja con el motor propio, sin tiles ni servicios externos (Reglas 5 y 6).
#
# REVISIÓN CADA 6 MESES: volver a correr este script para refrescar el plano.
#   python3 tools/extraer_mapas_osm.py
# Overpass público a veces responde 504 (saturado): el script reintenta solo.
# ─────────────────────────────────────────────────────────────────────────────
import urllib.request, urllib.parse, json, time, os, math

HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.normpath(os.path.join(HERE,'..','shared','assets','geo'))
ENDPOINT='https://overpass-api.de/api/interpreter'
UA='SistemaAM-mapa/1.0 (AMSA relaciones comunitarias; extraccion puntual cada 6 meses)'

# slug, lat, lng, half-lat, half-lng
AREAS=[
 ('Antofagasta',-23.6464,-70.3980,0.070,0.045,'antofagasta'),
 ('Calama',     -22.4624,-68.9272,0.055,0.055,'calama'),
 ('Tocopilla',  -22.0920,-70.1979,0.030,0.022,'tocopilla'),
 ('Mejillones', -23.1002,-70.4483,0.028,0.028,'mejillones'),
 ('Taltal',     -25.4079,-70.4838,0.032,0.030,'taltal'),
 ('Sierra Gorda',-22.8915,-69.3202,0.020,0.020,'sierra-gorda'),
 ('Baquedano',  -23.3338,-69.8435,0.014,0.014,'baquedano'),
 ('Peine',      -23.6836,-68.0617,0.014,0.014,'peine'),
]

def overpass(q, intentos=10):
    data=urllib.parse.urlencode({'data':q}).encode()
    for i in range(intentos):
        try:
            req=urllib.request.Request(ENDPOINT,data=data,headers={'User-Agent':UA})
            with urllib.request.urlopen(req,timeout=90) as r:
                if r.status==200:
                    return json.loads(r.read().decode())
        except Exception:
            pass
        time.sleep(12)   # 504/saturado: esperar y reintentar
    return None

def perp(p,a,b):
    if a==b: return math.dist(p,a)
    x0,y0=p;x1,y1=a;x2,y2=b; d=math.hypot(y2-y1,x2-x1)
    return abs((y2-y1)*x0-(x2-x1)*y0+x2*y1-y2*x1)/d if d else 0
def dp(pts,eps):
    if len(pts)<3: return pts
    dmax=0;idx=0
    for i in range(1,len(pts)-1):
        d=perp(pts[i],pts[0],pts[-1])
        if d>dmax: dmax=d;idx=i
    return dp(pts[:idx+1],eps)[:-1]+dp(pts[idx:],eps) if dmax>eps else [pts[0],pts[-1]]
def anillo(coords,cerrado,eps=0.00008):
    c=[[round(x,5),round(y,5)] for x,y in coords]; c=dp(c,eps)
    return c if len(c)>=(3 if cerrado else 2) else None
def punto_medio(coords):
    # punto sobre la línea, a la mitad de su longitud
    if len(coords)==1: return [round(coords[0][0],5),round(coords[0][1],5)]
    d=[0.0]
    for i in range(1,len(coords)): d.append(d[-1]+math.dist(coords[i-1],coords[i]))
    if d[-1]==0: return [round(coords[0][0],5),round(coords[0][1],5)]
    mid=d[-1]/2
    for i in range(1,len(coords)):
        if d[i]>=mid:
            t=(mid-d[i-1])/(d[i]-d[i-1]) if d[i]!=d[i-1] else 0
            x=coords[i-1][0]+t*(coords[i][0]-coords[i-1][0]); y=coords[i-1][1]+t*(coords[i][1]-coords[i-1][1])
            return [round(x,5),round(y,5)]
    return [round(coords[-1][0],5),round(coords[-1][1],5)]
def centroide(coords):
    xs=[p[0] for p in coords]; ys=[p[1] for p in coords]
    return [round(sum(xs)/len(xs),5), round(sum(ys)/len(ys),5)]

def guardar(fc, pref, slug, nombre):
    fc['_meta']={'ciudad':nombre,'fuente':'OpenStreetMap (ODbL) — extracción puntual Overpass'}
    path=os.path.join(OUT,f'{pref}-{slug}.geojson')
    json.dump(fc,open(path,'w'),ensure_ascii=False)
    return round(os.path.getsize(path)/1024)

def run():
    resumen=[]
    for nombre,lat,lng,hl,hw,slug in AREAS:
        s,w,n,e=lat-hl,lng-hw,lat+hl,lng+hw; bb=f'({s},{w},{n},{e})'
        # ── LUGARES (etiquetas de calles + lugares) ──
        q_lug=(f'[out:json][timeout:80];('
               f'way["highway"~"^(primary|secondary|tertiary|residential|unclassified|living_street)$"]["name"]{bb};'
               f'node["place"~"^(city|town|suburb|neighbourhood|quarter|village|hamlet|locality)$"]{bb};'
               f'node["amenity"~"^(hospital|university|townhall)$"]["name"]{bb};'
               f'way["leisure"="park"]["name"]{bb};'
               f');out geom;')
        d=overpass(q_lug)
        lug={'type':'FeatureCollection','features':[]}
        if d:
            vistos=set()
            for el in d.get('elements',[]):
                t=el.get('tags',{}); nm=t.get('name','')
                if not nm: continue
                if el['type']=='node': tipo='place'; pt=[round(el['lon'],5),round(el['lat'],5)]
                elif el['type']=='way' and 'geometry' in el:
                    coords=[[p['lon'],p['lat']] for p in el['geometry']]
                    tipo='calle' if 'highway' in t else 'place'
                    pt=punto_medio(coords) if 'highway' in t else centroide(coords)
                else: continue
                key=(tipo,nm)
                if key in vistos: continue
                vistos.add(key)
                lug['features'].append({'type':'Feature','properties':{'nombre':nm,'tipo':tipo},'geometry':{'type':'Point','coordinates':pt}})
        kb_l=guardar(lug,'lugares',slug,nombre) if d else 'ERR'
        time.sleep(4)
        # ── AGUA + VERDE (polígonos) ──
        q_poly=(f'[out:json][timeout:80];('
                f'way["natural"="water"]{bb};way["landuse"="reservoir"]{bb};'
                f'way["leisure"~"^(park|garden)$"]{bb};way["landuse"~"^(grass|recreation_ground)$"]{bb};way["leisure"="pitch"]{bb};'
                f');out geom;')
        d2=overpass(q_poly)
        poly={'type':'FeatureCollection','features':[]}
        if d2:
            for el in d2.get('elements',[]):
                if el.get('type')!='way' or 'geometry' not in el: continue
                t=el.get('tags',{}); coords=[[p['lon'],p['lat']] for p in el['geometry']]
                r=anillo(coords,True)
                if not r: continue
                if r[0]!=r[-1]: r.append(r[0])
                clase='agua' if (t.get('natural')=='water' or t.get('landuse')=='reservoir') else 'verde'
                poly['features'].append({'type':'Feature','properties':{'clase':clase},'geometry':{'type':'Polygon','coordinates':[r]}})
        kb_p=guardar(poly,'poly',slug,nombre) if d2 else 'ERR'
        time.sleep(4)
        # ── COSTA + ríos (líneas) ──
        q_costa=(f'[out:json][timeout:80];(way["natural"="coastline"]{bb};way["waterway"~"^(river|canal)$"]{bb};);out geom;')
        d3=overpass(q_costa)
        costa={'type':'FeatureCollection','features':[]}
        if d3:
            for el in d3.get('elements',[]):
                if el.get('type')!='way' or 'geometry' not in el: continue
                t=el.get('tags',{}); coords=[[p['lon'],p['lat']] for p in el['geometry']]
                r=anillo(coords,False)
                if not r: continue
                clase='costa' if t.get('natural')=='coastline' else 'rio'
                costa['features'].append({'type':'Feature','properties':{'clase':clase},'geometry':{'type':'LineString','coordinates':r}})
        kb_c=guardar(costa,'costa',slug,nombre) if d3 else 'ERR'
        calles=len([f for f in lug['features'] if f['properties']['tipo']=='calle'])
        places=len([f for f in lug['features'] if f['properties']['tipo']=='place'])
        print(f'{nombre:14} calles:{calles:4} lugares:{places:3} agua/verde:{len(poly["features"]):4} costa/rio:{len(costa["features"]):3}  KB(lug/poly/costa): {kb_l}/{kb_p}/{kb_c}',flush=True)
        time.sleep(4)
    print('LISTO',flush=True)

if __name__=='__main__':
    run()
