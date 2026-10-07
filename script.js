/* Data Fútbol Colombia - lógica, gráficos y pantallas de la página. */
'use strict';

let EQUIPOS = [
  [1,'Atlético Nacional','Medellín'],[2,'Millonarios','Bogotá'],[3,'América de Cali','Cali'],
  [4,'Deportivo Cali','Cali'],[5,'Junior','Barranquilla'],[6,'Independiente Medellín','Medellín'],
  [7,'Santa Fe','Bogotá'],[8,'Once Caldas','Manizales']
].map(([id,nombre,ciudad]) => ({id,nombre,ciudad}));

let JUGADORES = [
  [1,1,'Andrés Mosquera','Delantero'],[2,1,'Camilo Zapata','Mediocampista'],
  [3,2,'Felipe Ospina','Delantero'],[4,2,'Sebastián Rincón','Mediocampista'],
  [5,3,'Jhon Caicedo','Delantero'],[6,3,'Mateo Lozano','Defensa'],
  [7,4,'Brayan Arboleda','Delantero'],[8,4,'Kevin Payán','Mediocampista'],
  [9,5,'Luis Barrios','Delantero'],[10,5,'Yeison Mejía','Mediocampista'],
  [11,6,'Julián Rodríguez','Delantero'],[12,6,'Esteban Vélez','Mediocampista'],
  [13,7,'Dubán Herrera','Delantero'],[14,7,'Nicolás Pardo','Mediocampista'],
  [15,8,'Carlos Giraldo','Delantero'],[16,8,'Tomás Ríos','Defensa']
].map(([id,equipo,nombre,posicion]) => ({id,equipo,nombre,posicion}));

// [id, jornada, fecha, local, visitante, golesLocal, golesVisitante]  (null = por jugar)

let PARTIDOS = [
  [1,1,'2026-09-05',1,2,2,1],[2,1,'2026-09-05',3,4,0,0],[3,1,'2026-09-06',5,6,1,1],[4,1,'2026-09-06',7,8,3,0],
  [5,2,'2026-09-12',1,3,1,0],[6,2,'2026-09-12',2,4,2,2],[7,2,'2026-09-13',5,7,0,1],[8,2,'2026-09-13',6,8,2,0],
  [9,3,'2026-09-19',1,4,3,1],[10,3,'2026-09-19',2,3,1,0],[11,3,'2026-09-20',5,8,2,2],[12,3,'2026-09-20',6,7,0,1],
  [13,4,'2026-10-03',1,5,null,null],[14,4,'2026-10-03',2,6,null,null],
  [15,4,'2026-10-04',3,7,null,null],[16,4,'2026-10-04',4,8,null,null]
].map(([id,jornada,fecha,local,visita,gl,gv]) => ({id,jornada,fecha,local,visita,gl,gv}));

// [partido, jugador, goles, asistencias, minutos]

let STATS = [
  [1,1,2,0,90],[1,2,0,1,90],[1,3,1,0,90],[3,9,1,0,90],[3,11,1,0,88],[4,13,2,0,90],[4,14,1,2,90],
  [5,2,1,0,90],[5,1,0,1,85],[6,3,1,0,90],[6,4,1,1,90],[6,7,1,0,90],[6,8,1,0,90],[7,13,0,0,90],[7,14,1,0,90],
  [8,11,1,0,90],[8,12,1,1,90],[9,1,2,0,90],[9,2,1,2,90],[9,7,1,0,90],[10,4,1,0,90],[10,3,0,1,90],
  [11,9,1,0,90],[11,10,1,1,90],[11,15,2,0,90],[12,13,1,0,90],[12,14,0,1,90]
].map(([partido,jugador,goles,asist,min]) => ({partido,jugador,goles,asist,min}));

let ALERTAS = [
  {tipo:'lesion', equipo:6, texto:'Lesión de J. Rodríguez'},
  {tipo:'sancion',equipo:2, texto:'S. Rincón sancionado por acumulación de tarjetas'},
  {tipo:'racha',  equipo:1, texto:'Suma 3 victorias seguidas'}
];

const MUESTRA = {EQUIPOS, JUGADORES, PARTIDOS, STATS, ALERTAS};   // datos de ejemplo de respaldo

const ALERTA_UI = {lesion:['hospital','Lesión','mal'], sancion:['block','Sanción','aviso'], racha:['fire','Racha','ok'], bajon:['cancel','Mala racha','mal']};
// Íconos: símbolos <symbol id="i-..."> definidos en index.html

const ic = (n, c='') => `<svg class="ico ${c}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;

const FORMA = {G:['ok','check','Ganó'],E:['aviso','equal','Empató'],P:['mal','cancel','Perdió']};

/* Pruebas de integridad (diagrama de flujo: datos faltantes y errores de carga) */

const COLS = [['Pos','pos'],['Equipo','nombre'],['PJ','pj','Partidos jugados'],['G','g','Ganados'],['E','e','Empatados'],
  ['P','p','Perdidos'],['GF','gf','Goles a favor'],['GC','gc','Goles en contra'],['DG','dg','Diferencia de gol'],['Puntos','pts']];

const COMPACTO = ['pos','nombre','pj','dg','pts'];

const tablaPos = (filas, titulo, compacto) => {
  const cols = COLS.filter(c => !compacto || COMPACTO.includes(c[1]));
  const celda = (r,k) => k==='nombre' ? esc(r.nombre)+(r.pos===1?' '+ic('trophy'):'') : k==='dg' ? (r.dg>0?'+':'')+r.dg
    : k==='pts' ? `<strong>${r.pts}</strong>` : r[k];
  return `<div class="scroll" tabindex="0"><table class="${compacto?'compacta':''}"><caption>${titulo}</caption><thead><tr>${cols.map(c =>
    `<th scope="col">${c[2] ? `<abbr title="${c[2]}">${c[0]}</abbr>` : c[0]}</th>`).join('')}</tr></thead><tbody>${filas.map(r =>
    `<tr class="${r.pos===1?'lider':''}">${cols.map(c => `<td>${celda(r,c[1])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
};

/* ---- Gráficos (SVG/HTML propios, sin librerías) ---- */

const SILUETA = `<svg class="foto" viewBox="0 0 100 100" role="img" aria-label="Foto no disponible"><rect width="100" height="100" class="foto-fondo"/><circle cx="50" cy="38" r="18" class="foto-fig"/><path d="M14 100c0-24 16-38 36-38s36 14 36 38z" class="foto-fig"/></svg>`;

const listaProximos = f => {
  const l = PARTIDOS.filter(p => !jugado(p) && (!f || p.local===f || p.visita===f)).slice(0,4);
  return l.length ? `<ul class="partidos">${l.map(p => `<li><div class="vs"><strong>${esc(eq(p.local).nombre)}</strong><span>vs</span>
    <strong>${esc(eq(p.visita).nombre)}</strong></div><span class="fecha">${ic('event')}${fmtFecha(p.fecha)} · Jornada ${p.jornada}</span></li>`).join('')}</ul>`
    : '<p>No hay partidos programados para este equipo.</p>';
};

const tablaJug = (l, titulo) => `<div class="scroll" tabindex="0"><table><caption>${titulo}</caption>
  <thead><tr><th scope="col">Pos</th><th scope="col">Jugador</th><th scope="col">Equipo</th><th scope="col">Posición</th>
  <th scope="col">Goles</th><th scope="col">Asistencias</th><th scope="col">Minutos</th></tr></thead><tbody>
  ${l.map((j,i) => `<tr><td>${i+1}</td><td>${esc(j.nombre)}</td><td>${esc(eq(j.equipo).nombre)}</td><td>${j.posicion}</td>
  <td><strong>${j.goles}</strong></td><td>${j.asist ?? '—'}</td><td>${j.min ?? '—'}</td></tr>`).join('')}</tbody></table></div>`;

const KPI = (icono, valor, etiqueta) => `<div class="kpi"><span class="chip-ico">${ic(icono)}</span><div><strong>${valor}</strong><span>${etiqueta}</span></div></div>`;

const tit = (icono, texto, sub) => `<div class="tit"><span class="tit-ico">${ic(icono)}</span><div><h2 tabindex="-1">${texto}</h2>${sub ? `<p class="sub-h">${sub}</p>` : ''}</div></div>`;

const cab = (icono, texto) => `<div class="card-h"><span class="chip-ico">${ic(icono)}</span><h3>${texto}</h3></div>`;

const estado = (ok, texto) => `<span class="etq ${ok ? 'ok' : 'mal'}">${ic(ok ? 'check' : 'error')}${texto}</span>`;

const dato = (v, t) => `<div><strong>${v}</strong><span>${t}</span></div>`;

const $ = s => document.querySelector(s);

const eq = id => EQUIPOS.find(e => e.id === id) || {id, nombre:'Equipo '+id, ciudad:'', abrev:''};

const jug = id => JUGADORES.find(j => j.id === id);

const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const jugado = p => p.gl !== null && p.gv !== null;

const fmtFecha = f => new Date(f + 'T00:00:00').toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'});

function tabla() {
  const t = Object.fromEntries(EQUIPOS.map(e => [e.id,{id:e.id,nombre:e.nombre,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}]));
  PARTIDOS.filter(jugado).forEach(p => {
    [[p.local,p.gl,p.gv],[p.visita,p.gv,p.gl]].forEach(([id,f,c]) => {
      const r = t[id]; r.pj++; r.gf += f; r.gc += c;
      if (f > c) { r.g++; r.pts += 3; } else if (f === c) { r.e++; r.pts += 1; } else r.p++;
    });
  });
  return Object.values(t).map(r => ({...r, dg:r.gf-r.gc}))
    .sort((a,b) => b.pts-a.pts || b.dg-a.dg || b.gf-a.gf || a.nombre.localeCompare(b.nombre));
}

function statsJugadores(filtro) {
  return JUGADORES.filter(j => !filtro || j.equipo === filtro).map(j => {
    if (j.goles !== undefined) return {...j, pj:null, asist:j.asist ?? null, min:j.min ?? null};   // datos de la API: solo goles de temporada
    const s = STATS.filter(x => x.jugador === j.id);
    return {...j, pj:s.length, goles:s.reduce((a,x) => a+x.goles,0), asist:s.reduce((a,x) => a+x.asist,0), min:s.reduce((a,x) => a+x.min,0)};
  });
}

function jugadorSemana() {
  if (!STATS.length) {   // sin estadísticas por partido (API): se muestra el goleador del torneo
    const top = [...JUGADORES].filter(j => j.goles > 0).sort((a,b) => b.goles-a.goles || a.nombre.localeCompare(b.nombre))[0];
    return top ? {jugador:top, goles:top.goles, asist:null, min:null, torneo:true} : null;
  }
  const ult = Math.max(...PARTIDOS.filter(jugado).map(p => p.jornada));
  const ids = PARTIDOS.filter(p => p.jornada === ult && jugado(p)).map(p => p.id), pts = {};
  STATS.filter(s => ids.includes(s.partido)).forEach(s => {
    const r = pts[s.jugador] ??= {goles:0,asist:0,min:0}; r.goles += s.goles; r.asist += s.asist; r.min += s.min; });
  const top = Object.entries(pts).sort((a,b) => (b[1].goles*3+b[1].asist*2)-(a[1].goles*3+a[1].asist*2) || b[1].min-a[1].min)[0];
  return top ? {jugador:jug(+top[0]), ...top[1], jornada:ult} : null;
}

function forma(id) {
  return PARTIDOS.filter(p => jugado(p) && (p.local===id || p.visita===id)).slice(-5).map(p => {
    const [f,c] = p.local===id ? [p.gl,p.gv] : [p.gv,p.gl];
    return f>c ? 'G' : f===c ? 'E' : 'P';
  });
}

function integridad() {
  const errores = [], manual = [];
  PARTIDOS.forEach(p => {
    const ref = `Partido ${p.id} (${eq(p.local).nombre} vs ${eq(p.visita).nombre})`;
    if ((p.gl === null) !== (p.gv === null)) errores.push(`${ref}: marcador incompleto`);
    if (p.local === p.visita) errores.push(`${ref}: un equipo juega contra sí mismo`);
    if (!jugado(p)) return;
    const sts = STATS.filter(s => s.partido === p.id);
    if (STATS.length && p.gl + p.gv > 0 && !sts.length) manual.push(`${ref}: faltan estadísticas de jugadores`);
    [[p.local,p.gl],[p.visita,p.gv]].forEach(([id,g]) => {
      const suma = sts.filter(s => jug(s.jugador).equipo === id).reduce((a,s)=>a+s.goles,0);
      if (suma > g) errores.push(`${ref}: jugadores de ${eq(id).nombre} suman ${suma} goles y el equipo hizo ${g}`);
    });
    sts.forEach(s => { const e = jug(s.jugador).equipo;
      if (e !== p.local && e !== p.visita) errores.push(`${ref}: ${jug(s.jugador).nombre} no jugó este partido`); });
  });
  return {errores, manual, ok: !errores.length && !manual.length};
}

const asistEq = id => STATS.filter(s => jug(s.jugador).equipo === id).reduce((a,s) => a+s.asist, 0);

const serieEquipo = id => PARTIDOS.filter(p => jugado(p) && (p.local===id || p.visita===id)).map((p,i) => ({
  n:i+1, rival:eq(p.local===id ? p.visita : p.local).nombre, gf:p.local===id ? p.gl : p.gv,
  asist:STATS.filter(s => s.partido===p.id && jug(s.jugador).equipo===id).reduce((a,s) => a+s.asist, 0)})).slice(-8);

const ordenar = l => [...l].sort((a,b) => b.goles-a.goles || b.asist-a.asist || a.nombre.localeCompare(b.nombre));

const conPos = t => t.map((r,i) => ({...r,pos:i+1}));

let FUENTE = {tipo:'muestra', texto:'Datos de ejemplo (ficticios)'};

function usarDatos(d) { EQUIPOS = d.EQUIPOS; JUGADORES = d.JUGADORES; PARTIDOS = d.PARTIDOS; STATS = d.STATS; ALERTAS = d.ALERTAS; FUENTE = d.fuente || FUENTE; }

function calcularAlertas() {   // alertas "inteligentes" calculadas con los resultados
  const out = [];
  EQUIPOS.forEach(e => {
    const r = PARTIDOS.filter(p => jugado(p) && (p.local === e.id || p.visita === e.id)).sort((a,b) => a.fecha.localeCompare(b.fecha))
      .map(p => { const [f,c] = p.local === e.id ? [p.gl,p.gv] : [p.gv,p.gl]; return f > c ? 'G' : f === c ? 'E' : 'P'; });
    let g = 0, s = 0;
    for (let i = r.length-1; i >= 0 && r[i] === 'G'; i--) g++;
    for (let i = r.length-1; i >= 0 && r[i] !== 'G'; i--) s++;
    if (g >= 3) out.push({tipo:'racha', equipo:e.id, texto:`Suma ${g} victorias seguidas`, n:g});
    else if (s >= 4) out.push({tipo:'bajon', equipo:e.id, texto:`Lleva ${s} partidos sin ganar`, n:s});
  });
  return out.sort((a,b) => b.n - a.n).slice(0, 6);
}

const barras = items => { const m = Math.max(1, ...items.map(i => i.valor));
  return `<div class="barras">${items.map(i => `<div class="bar-fila"><span>${esc(i.etq)}</span>
  <span class="pista" aria-hidden="true"><i style="width:${Math.round(i.valor/m*100)}%"></i></span><strong>${i.valor}</strong></div>`).join('')}</div>`; };

const lineas = serie => {
  const W=440, H=270, l=44, r=18, t=16, b=44, ymax=Math.max(3, ...serie.map(s => Math.max(s.gf, s.asist)));
  const X = i => serie.length < 2 ? (l+W-r)/2 : l + i*(W-l-r)/(serie.length-1);
  const Y = v => H-b - v/ymax*(H-t-b);
  const pts = k => serie.map((s,i) => `${X(i)},${Y(s[k])}`).join(' ');
  const rej = Array.from({length:ymax+1}, (_,v) => `<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" class="g-rej"/><text x="${l-8}" y="${Y(v)+5}" text-anchor="end">${v}</text>`).join('');
  const ejeX = serie.map((s,i) => `<text x="${X(i)}" y="${H-b+24}" text-anchor="middle">P${s.n}</text>`).join('');
  return `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de líneas de goles y asistencias en los últimos ${serie.length} partidos. Los valores están en la tabla siguiente.">
    ${rej}${ejeX}<polyline points="${pts('gf')}" class="l-gol"/><polyline points="${pts('asist')}" class="l-asi"/>
    ${serie.map((s,i) => `<circle cx="${X(i)}" cy="${Y(s.gf)}" r="7" class="m-gol"/><rect x="${X(i)-6}" y="${Y(s.asist)-6}" width="12" height="12" class="m-asi"/>`).join('')}</svg>
    <p class="leyenda"><span class="etq"><i class="leg leg-gol"></i>Goles: línea continua</span> <span class="etq"><i class="leg leg-asi"></i>Asistencias: línea punteada</span></p>
    <div class="scroll" tabindex="0"><table class="compacta"><caption class="solo-lectores">Datos del gráfico</caption><thead><tr><th scope="col">Partido</th><th scope="col">Rival</th><th scope="col">Goles</th><th scope="col">Asistencias</th></tr></thead><tbody>
    ${serie.map(s => `<tr><td>P${s.n}</td><td>${esc(s.rival)}</td><td>${s.gf}</td><td>${s.asist}</td></tr>`).join('')}</tbody></table></div>`;
};

const radar = id => {
  const T = tabla(), me = T.find(r => r.id===id), mx = k => Math.max(1, ...T.map(r => r[k]));
  const maxA = Math.max(1, ...EQUIPOS.map(e => asistEq(e.id))), maxGc = Math.max(1, ...T.map(r => r.gc));
  const ej = [['Puntos',me.pts/mx('pts')],['Goles a favor',me.gf/mx('gf')],(STATS.length ? ['Asistencias',asistEq(id)/maxA] : ['Dif. de gol',(me.dg-Math.min(...T.map(r => r.dg)))/Math.max(1,Math.max(...T.map(r => r.dg))-Math.min(...T.map(r => r.dg)))]),
              ['Defensa',(maxGc-me.gc)/maxGc],['Victorias',me.g/mx('g')]];
  const cx=190, cy=120, R=70, ang = i => (-90+i*72)*Math.PI/180;
  const xy = (i,f) => [cx+Math.cos(ang(i))*R*f, cy+Math.sin(ang(i))*R*f];
  const P = (i,f) => xy(i,f).map(v => v.toFixed(1)).join(',');
  const anillo = f => `<polygon points="${ej.map((_,i) => P(i,f)).join(' ')}" class="g-rej"/>`;
  const etq = ej.map((e,i) => { const c = Math.cos(ang(i)), [x,y] = xy(i,(R+14)/R);
    return `<text x="${x.toFixed(1)}" y="${(y+5).toFixed(1)}" text-anchor="${Math.abs(c)<0.2?'middle':c>0?'start':'end'}">${e[0]}</text>`; }).join('');
  const desc = ej.map(e => `${e[0]} ${Math.round(e[1]*100)} %`).join(', ');
  return `<svg class="grafico radar" viewBox="0 0 380 240" role="img" aria-label="Perfil del equipo comparado con el mejor de la liga: ${desc}">
    ${anillo(1)}${anillo(.66)}${anillo(.33)}${ej.map((_,i) => `<line x1="${cx}" y1="${cy}" x2="${xy(i,1)[0].toFixed(1)}" y2="${xy(i,1)[1].toFixed(1)}" class="g-rej"/>`).join('')}
    <polygon points="${ej.map((e,i) => P(i,e[1])).join(' ')}" class="r-area"/>${etq}</svg>`;
};

const VISTAS = {
  panel(f) {
    const js = jugadorSemana(), ig = integridad(), ps = PARTIDOS.filter(jugado);
    const tot = ps.reduce((a,p) => a+p.gl+p.gv, 0);
    const gol = ordenar(statsJugadores(f)).filter(j => j.goles>0).slice(0,5);
    const al = ALERTAS.filter(a => !f || a.equipo===f);
    const idR = f || tabla()[0].id;
    return `${tit('home','Panel principal','Resumen de la Liga BetPlay 2026')}
    <div class="kpis">${KPI('event',ps.length,'Partidos jugados')}${KPI('ball',tot,'Goles marcados')}${KPI('bar',(ps.length ? tot/ps.length : 0).toFixed(1),'Goles por partido')}</div>
    <div class="panel-grid">
      <section class="tarjeta g-stats">${cab('ball','Máximos goleadores')}${gol.length ?
        barras(gol.map(j => ({etq:`${j.nombre} (${eq(j.equipo).nombre})`, valor:j.goles}))) : '<p>Sin goles registrados.</p>'}</section>
      <section class="tarjeta g-liga">${cab('trophy','Resumen de la liga')}<h4>Próximos partidos</h4>${listaProximos(f)}
        <h4>Tabla de posiciones</h4>${tablaPos(conPos(tabla()),'Posiciones de la Liga BetPlay',true)}</section>
      <section class="tarjeta hero g-semana">${cab('star', js && js.torneo ? 'Goleador del torneo' : 'Jugador de la semana')}${js ? `<div class="jug">${SILUETA}<div>
        <p class="grande">${esc(js.jugador.nombre)}</p><p>${esc(eq(js.jugador.equipo).nombre)} · ${js.torneo ? 'Temporada actual' : 'Jornada '+js.jornada}</p>
        <div class="datos">${dato(js.goles,'Goles')}${dato(js.asist ?? '—','Asistencias')}${dato(js.min ?? '—','Minutos')}</div></div></div>` : '<p>Sin datos.</p>'}</section>
      <section class="tarjeta verde g-rend">${cab('trending','Rendimiento últimos partidos: '+esc(eq(idR).nombre))}${lineas(serieEquipo(idR))}</section>
      <section class="tarjeta g-alertas">${cab('bell','Alertas inteligentes')}${al.length ? `<ul class="alertas">${al.map(a => { const [i,t,c] = ALERTA_UI[a.tipo];
        return `<li class="alerta ${c}"><span class="alerta-ico">${ic(i)}</span><div><strong>${t}: ${esc(eq(a.equipo).nombre)}</strong><span>${esc(a.texto)}</span></div></li>`; }).join('')}</ul>`
        : '<p>Sin alertas para este equipo.</p>'}</section>
      <section class="tarjeta g-verif">${cab('verified','Verificación de datos')}${ig.ok
        ? `<p>${estado(true,'Correcto')} Los datos pasaron todas las pruebas de integridad.</p>`
        : `<p>${estado(false,'Revisar')}</p><ul>${[...ig.errores,...ig.manual].map(x => `<li>${esc(x)}</li>`).join('')}</ul>`}</section>
    </div>`;
  },
  jugadores(f) {
    const l = ordenar(statsJugadores(f)), top = l.filter(j => j.goles>0).slice(0,8);
    return `${tit('person','Jugadores', f ? eq(f).nombre : 'Todos los equipos')}<div class="apilado">
      <section class="tarjeta">${cab('ball','Máximos goleadores')}${top.length ?
        barras(top.map(j => ({etq:`${j.nombre} (${eq(j.equipo).nombre})`, valor:j.goles}))) : '<p>Sin goles registrados.</p>'}</section>
      <section class="tarjeta verde">${tablaJug(l, f ? 'Jugadores de '+eq(f).nombre : 'Todos los jugadores (ordenados por goles)')}</section></div>`;
  },
  equipos(f) {
    const T = Object.fromEntries(tabla().map((r,i) => [r.id,{...r,pos:i+1}]));
    return `${tit('shield','Equipos','Rendimiento y perfil de cada club')}<div class="rejilla">${EQUIPOS.filter(e => !f || e.id===f).map(e => { const r = T[e.id]; return `
      <section class="tarjeta"><div class="card-h"><span class="chip-ico">${ic('shield')}</span><div><h3>${esc(e.nombre)}</h3><span class="muted">${esc(e.ciudad || e.abrev || '')}</span></div>
        <span class="puesto" aria-label="Puesto ${r.pos}">${r.pos}º</span></div>
      <div class="datos">${dato(r.pts,'Puntos')}${dato(r.gf,'Goles a favor')}${dato(r.gc,'Goles en contra')}${dato(STATS.length ? asistEq(e.id) : '—','Asistencias')}</div>
      <h4>Perfil del equipo</h4>${radar(e.id)}
      <h4>Últimos partidos</h4><div class="forma">${forma(e.id).map(x => { const [c,i,t] = FORMA[x]; return `<span class="etq ${c}">${ic(i)}${t}</span>`; }).join('')}</div>${f ? '' : `<p style="margin:1rem 0 0"><button type="button" class="sec" data-eq="${e.id}">Ver detalle</button></p>`}</section>`; }).join('')}</div>${f ? detalleEquipo(f) : ''}`;
  },
  liga(f) {
    const jornadas = [...new Set(PARTIDOS.map(p => p.jornada))], T = tabla();
    return `${tit('trophy','Liga BetPlay 2026','Categoría Primera A')}<div class="apilado">
    <section class="tarjeta">${cab('leaderboard','Tabla de posiciones')}${tablaPos(conPos(T),'Posiciones')}</section>
    <section class="tarjeta">${cab('bar','Goles a favor por equipo')}${barras([...T].sort((a,b) => b.gf-a.gf).map(r => ({etq:r.nombre, valor:r.gf})))}</section>
    <div class="rejilla">${jornadas.map(j => { const ps = PARTIDOS.filter(p => p.jornada===j && (!f || p.local===f || p.visita===f));
      return ps.length ? `<section class="tarjeta verde">${cab('event','Jornada '+j)}<ul class="partidos">${ps.map(p => `<li><div class="vs">${esc(eq(p.local).nombre)}
        <strong>${jugado(p) ? `${p.gl} - ${p.gv}` : 'vs'}</strong> ${esc(eq(p.visita).nombre)}</div>
        <span class="fecha">${jugado(p) ? 'Finalizado' : ic('event')+fmtFecha(p.fecha)}</span></li>`).join('')}</ul></section>` : ''; }).join('')}</div></div>`;
  },
  predicciones() {
    const op = (sel) => EQUIPOS.map(e => `<option value="${e.id}" ${e.id===sel?'selected':''}>${esc(e.nombre)}</option>`).join('');
    const prox = PARTIDOS.filter(p => !jugado(p)).slice(0,6), t = tabla();
    const a = t[0] ? t[0].id : EQUIPOS[0].id, b = t[1] ? t[1].id : EQUIPOS[1].id;
    return `${tit('trending','Predicciones','Modelo estadístico con datos actualizados')}<div class="apilado">
      <section class="tarjeta">${cab('event','Pronóstico de los próximos partidos')}${prox.length ? tablaPron(prox) : '<p>No hay partidos programados.</p>'}</section>
      <section class="tarjeta">${cab('trending','Simula un partido')}
        <p class="nota">${ic('info')}<span>La probabilidad no depende solo de los partidos ganados: combina ataque, defensa, ventaja de local, forma reciente, fuerza acumulada (Elo) y descanso. <strong>Es orientativa, no es consejo de apuestas.</strong></span></p>
        <div class="form-pred" style="margin-top:1.25rem"><div><label for="p-local">Equipo local</label><select id="p-local">${op(a)}</select></div>
        <div><label for="p-visita">Equipo visitante</label><select id="p-visita">${op(b)}</select></div>
        <button type="button" id="p-calc" class="primario">${ic('play')}Calcular</button></div>
        <div id="p-res" aria-live="polite"></div></section>
      <section class="tarjeta">${cab('star','Tu marcador de aciertos')}${vistaMarcador()}</section>
      <section class="tarjeta verde">${cab('verified','¿Qué tan confiable es el modelo?')}${fiabilidad()}</section></div>`;
  }
};

const tablaPron = ps => `<div class="scroll" tabindex="0"><table class="compacta tabla-pron"><caption class="solo-lectores">Pronóstico de los próximos partidos</caption>
  <thead><tr><th scope="col">Partido</th><th scope="col">Gana local</th><th scope="col">Empate</th><th scope="col">Gana visitante</th><th scope="col">Detalle</th></tr></thead><tbody>
  ${ps.map(p => { const nom = `${esc(eq(p.local).nombre)} vs ${esc(eq(p.visita).nombre)}`, r = prediccion(p.local, p.visita, p.fecha);
    if (!r) return `<tr><td>${nom}</td><td colspan="4">Faltan datos para estimar</td></tr>`;
    const v = [r.local, r.empate, r.visita], m = v.indexOf(Math.max(...v));
    return `<tr><td>${nom}<br><span class="muted">${fmtFecha(p.fecha)}</span></td>${v.map((x,i) => `<td>${i===m ? `<strong>${x.toFixed(0)} %</strong>` : x.toFixed(0)+' %'}</td>`).join('')}
      <td><button type="button" class="sec" data-l="${p.local}" data-v="${p.visita}" data-f="${p.fecha}" aria-label="Ver detalle de ${nom}">Ver</button></td></tr>`; }).join('')}</tbody></table></div>`;

function fiabilidad() {
  const e = evaluarModelo();
  if (!e || e.n < 5) return `<p class="nota">${ic('info')}<span>Aún hay pocos partidos jugados para medir la precisión del modelo. Se mostrará cuando haya más datos.</span></p>`;
  const f = x => x.toFixed(0) + ' %';
  return `<p>Probamos el modelo con <strong>${e.n}</strong> partidos ya jugados. Para cada uno solo usó los partidos anteriores a esa fecha, como en un pronóstico real.</p>
    <div class="datos">${dato(f(e.acc),'Aciertos del modelo')}${dato(f(e.accGanados),'Elegir al que más ha ganado')}${dato(f(e.accLocal),'Elegir siempre al local')}</div>
    <p>Error de probabilidad (Brier, menor es mejor): modelo <strong>${e.brier.toFixed(3)}</strong> frente a <strong>${e.brierRef.toFixed(3)}</strong> de una referencia que no conoce a los equipos${e.brier < e.brierRef ? ` (mejora del ${e.mejora.toFixed(0)} %)` : ''}.</p>
    <p class="muted">${e.acc >= e.accGanados ? 'El modelo supera a la regla simple de partidos ganados.' : 'Con los datos actuales el modelo aún no supera la regla simple; mejorará con más partidos.'} El fútbol tiene mucho azar, por eso se muestran probabilidades y no certezas.</p>`;
}

function calcularPrediccion(fecha) {
  const l = +$('#p-local').value, v = +$('#p-visita').value, out = $('#p-res');
  if (l === v) { out.innerHTML = `<p>${estado(false,'Elija dos equipos distintos.')}</p>`; return; }
  const r = prediccion(l, v, typeof fecha === 'string' ? fecha : undefined);
  if (!r) { out.innerHTML = `<p>${estado(false,'Faltan datos')} Se necesitan más partidos jugados para estimar.</p>`; return; }
  const fila = (t, x) => `<div class="fila-prob"><strong>${t}: ${x.toFixed(0)} %</strong><div class="pista" aria-hidden="true"><i style="width:${x.toFixed(0)}%"></i></div></div>`;
  const cc = {Alta:'ok', Media:'aviso', Baja:'mal'}[r.confianza];
  out.innerHTML = fila('Gana '+esc(eq(l).nombre), r.local) + fila('Empate', r.empate) + fila('Gana '+esc(eq(v).nombre), r.visita) +
    `<div class="forma"><span class="etq ${cc}">${ic(r.confianza==='Alta'?'check':'info')}Confianza ${r.confianza}</span>
     <span class="etq">Goles esperados ${r.lamL.toFixed(1)} - ${r.lamV.toFixed(1)}</span><span class="etq">Más de 2,5 goles: ${r.over25.toFixed(0)} %</span>
     <span class="etq">Ambos anotan: ${r.btts.toFixed(0)} %</span></div>
     <h4>Marcadores más probables</h4><div class="forma">${r.marcadores.map(m => `<span class="etq info">${m.m} · ${m.p.toFixed(0)} %</span>`).join('')}</div>
     <h4>Por qué sale este resultado</h4><ul class="lista">${r.factores.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

function enlazarPrediccion() {
  $('#p-calc').addEventListener('click', () => calcularPrediccion());
  document.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => {
    $('#p-local').value = b.dataset.l; $('#p-visita').value = b.dataset.v; calcularPrediccion(b.dataset.f);
    $('#p-res').scrollIntoView({behavior:'smooth', block:'center'}); }));
}

let vista = 'panel';

const filtro = () => +$('#filtro-equipo').value || 0;

function mostrar() {
  $('#contenido').innerHTML = VISTAS[vista](filtro());
  document.querySelectorAll('.menu button').forEach(b =>
    b.dataset.vista === vista ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current'));
  $('.filtro').hidden = vista === 'predicciones';
  if (vista === 'predicciones') enlazarPrediccion();
  document.querySelectorAll('[data-eq]').forEach(b => b.addEventListener('click', () => { $('#filtro-equipo').value = b.dataset.eq; mostrar(); $('#contenido h2').focus(); }));
}

function llenarFiltro() {
  const sel = $('#filtro-equipo'), prev = sel.value;
  sel.innerHTML = '<option value="0">Todos los equipos</option>' + EQUIPOS.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
  if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
}

function pintarEstado() {
  const el = $('#estado'), b = $('#refrescar'); if (!el) return;
  const hora = t => new Date(t).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'});
  let cls = 'info', ico = 'info', txt = FUENTE.texto;
  if (FUENTE.cargando) txt = 'Actualizando datos…';
  else if (FUENTE.tipo === 'vivo') { cls = 'ok'; ico = 'check'; txt = `${FUENTE.texto} · ${hora(FUENTE.t)}`; }
  else if (FUENTE.tipo === 'cache') { cls = 'aviso'; txt = `${FUENTE.texto} (${hora(FUENTE.t)})`; }
  else if (FUENTE.error) cls = 'aviso';
  el.innerHTML = `<span class="etq ${cls}">${ic(ico)}${esc(txt)}</span>${FUENTE.detalle ? `<small class="detalle">Detalle: ${esc(FUENTE.detalle)}</small>` : ''}`;
  b.disabled = !!FUENTE.cargando; b.classList.toggle('cargando', !!FUENTE.cargando);
}

async function iniciarDatos(forzar) {
  FUENTE = {...FUENTE, cargando:true}; pintarEstado();
  try {
    const d = await API.cargar({forzar}); const manuales = d.ALERTAS || []; d.ALERTAS = []; usarDatos(d); ALERTAS = alertasFinales(manuales); MARCADOR.registrar();
  } catch (err) {
    console.warn('[datos]', err);
    FUENTE = {tipo:'muestra', texto:mensajeAmable(err), detalle:String((err && err.message) || err), error:true};
  }
  FUENTE.cargando = false; llenarFiltro(); mostrar(); pintarEstado();
}

const guardar = (k,v) => { try { localStorage.setItem(k,v); } catch {} };

const leer = k => { try { return localStorage.getItem(k); } catch { return null; } };

const aplicarTema = t => { document.documentElement.dataset.tema = t; $('#tema').setAttribute('aria-pressed', t==='oscuro'); guardar('df-tema', t); };

document.addEventListener('DOMContentLoaded', () => {
  $('#filtro-equipo').innerHTML = '<option value="0">Todos los equipos</option>' +
    EQUIPOS.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
  $('#filtro-equipo').addEventListener('change', mostrar);
  document.querySelectorAll('.menu button').forEach(b => b.addEventListener('click', () => {
    vista = b.dataset.vista; mostrar(); $('#contenido h2').focus(); }));
  $('#tema').addEventListener('click', () => aplicarTema(document.documentElement.dataset.tema === 'claro' ? 'oscuro' : 'claro'));
  const preferido = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  aplicarTema(leer('df-tema') || preferido); mostrar(); pintarEstado();
  $('#refrescar').addEventListener('click', () => iniciarDatos(true));
  iniciarDatos(false);
});

/* ================= 5. DATOS EN VIVO (API de ESPN) ================= */
/* Consume la API pública de ESPN (sin clave) para la Liga BetPlay. Sin conexión usa lo último guardado; si no hay nada, los datos de ejemplo. */
const API = {
  liga: 'col.1',                       // código de la Primera A colombiana en ESPN
  bases: ['https://site.api.espn.com/apis/site/v2/sports/soccer/', 'https://site.web.api.espn.com/apis/site/v2/sports/soccer/'],
  diasAtras: 120, diasAmplio: 400, diasAdelante: 21,   // ventanas de fechas que se consultan
  vigenciaMin: 15, timeoutMs: 10000, claveCache: 'df-cache-v1',
  urlBD: 'api/datos.php', urlActualizar: 'api/actualizar.php',   // base de datos propia (XAMPP)

  /* ESPN ya no acepta rangos de fechas (dates=AAAAMMDD-AAAAMMDD) y responde 400.
     Sí acepta un mes (AAAAMM) o un día (AAAAMMDD), y con limit mayor a 500 recorta la lista en silencio. */
  meses(dias) {
    const h = Date.now(), ini = new Date(h - dias*864e5), fin = new Date(h + this.diasAdelante*864e5), lista = [];
    for (let d = new Date(ini.getFullYear(), ini.getMonth(), 1); d <= fin; d = new Date(d.getFullYear(), d.getMonth() + 1, 1))
      lista.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
    return lista;
  },
  url(base, fecha) { return `${base}${this.liga}/scoreboard?dates=${fecha}&limit=500`; },

  async pedir(base, fecha) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      const r = await fetch(this.url(base, fecha), {signal: ctl.signal});
      if (!r.ok) throw new Error('el servidor respondió ' + r.status);
      return await r.json();
    } catch (e) { throw new Error(e.name === 'AbortError' ? 'tiempo de espera agotado' : (e.message || 'sin conexión')); }
    finally { clearTimeout(t); }
  },

  /* Pide un mes completo; si ESPN lo rechaza (400) o llega al tope de 500, pide día por día. */
  async pedirMes(base, ym) {
    try { const j = await this.pedir(base, ym); if ((j.events || []).length < 500) return j; }
    catch (e) { if (!/400/.test(e.message)) throw e; }
    const y = Number(ym.slice(0, 4)), m = Number(ym.slice(4)) - 1, desde = Date.now() - 60*864e5, hasta = Date.now() + this.diasAdelante*864e5, dias = [];
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) { const t = new Date(y, m, d); if (t >= desde && t <= hasta) dias.push(`${ym}${String(d).padStart(2, '0')}`); }
    const resp = await Promise.all(dias.map(f => this.pedir(base, f).catch(() => ({events: []}))));
    return {events: resp.flatMap(r => r.events || [])};
  },
  async traerEventos(base, dias) {
    const meses = await Promise.all(this.meses(dias).map(ym => this.pedirMes(base, ym)));
    return {events: meses.flatMap(r => r.events || [])};
  },

  /* Convierte la respuesta de ESPN al formato interno de la página. */
  normalizar(json) {
    const num = v => (v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v))) ? Number(v) : null;
    const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const equipos = new Map(), lider = new Map(), vistos = new Set(), crudos = [];
    (json.events || []).forEach(e => {
      const c = e.competitions && e.competitions[0]; if (!c || vistos.has(e.id)) return;
      const tipo = (c.status && c.status.type) || {};
      if (/POSTPONED|CANCEL|SUSPEND|ABANDON/.test(tipo.name || '')) return;
      const h = (c.competitors || []).find(x => x.homeAway === 'home'), a = (c.competitors || []).find(x => x.homeAway === 'away');
      if (!h || !a || !h.team || !a.team) return;
      vistos.add(e.id);
      [h, a].forEach(x => {
        const id = Number(x.team.id);
        equipos.set(id, {id, nombre: x.team.displayName || x.team.name, ciudad: '', abrev: x.team.abbreviation || '', logo: x.team.logo || ''});
        const g = (x.leaders || []).find(l => l.name === 'goals'), top = g && g.leaders && g.leaders[0];
        if (top && top.athlete) { const p = lider.get(id); if (!p || e.date > p.fecha) lider.set(id, {fecha: e.date, top}); }
      });
      const fin = tipo.state === 'post' && tipo.completed === true && num(h.score) !== null && num(a.score) !== null;
      crudos.push({id: Number(e.id), orden: String(e.date), fecha: ymd(new Date(e.date)), local: Number(h.team.id), visita: Number(a.team.id),
        gl: fin ? num(h.score) : null, gv: fin ? num(a.score) : null, enVivo: tipo.state === 'in'});
    });
    crudos.sort((x, y) => x.orden.localeCompare(y.orden) || x.id - y.id);
    const cont = {};   // la API no trae la jornada: se estima como el nº de partido del equipo con más partidos
    const PARTIDOS = crudos.map(p => { cont[p.local] = (cont[p.local]||0)+1; cont[p.visita] = (cont[p.visita]||0)+1;
      return {id:p.id, jornada: Math.max(cont[p.local], cont[p.visita]), fecha:p.fecha, local:p.local, visita:p.visita, gl:p.gl, gv:p.gv, enVivo:p.enVivo}; });
    if (!PARTIDOS.some(p => p.gl !== null)) throw new Error('la API no devolvió partidos jugados en el rango de fechas');
    const POS = {F:'Delantero', M:'Mediocampista', D:'Defensa', G:'Portero'};
    // El goleador de cada equipo (la API lo entrega con sus goles de la temporada). El máximo goleador de la liga siempre es líder de su equipo.
    const JUGADORES = [...lider.entries()].filter(([, v]) => num(v.top.value) > 0).map(([equipo, v]) => ({
      id: Number(v.top.athlete.id), equipo, nombre: v.top.athlete.displayName, goles: num(v.top.value),
      posicion: POS[(v.top.athlete.position || {}).abbreviation] || 'Jugador'}));
    return {EQUIPOS: [...equipos.values()].sort((x, y) => x.nombre.localeCompare(y.nombre)), JUGADORES, PARTIDOS, STATS: [], ALERTAS: []};
  },

  /* Prueba cada servidor y, si no hay partidos, amplía las fechas. Junta los motivos de los fallos. */
  async traer() {
    const fallos = [];
    for (const base of this.bases) {
      const host = new URL(base).host;
      for (const dias of [this.diasAtras, this.diasAmplio]) {
        try { return this.normalizar(await this.traerEventos(base, dias)); }
        catch (e) { fallos.push(`${host}: ${e.message}`); if (!/no devolvi/.test(e.message)) break; }
      }
    }
    throw new Error(fallos.join(' | '));
  },

  leerCache() { try { return JSON.parse(localStorage.getItem(this.claveCache)); } catch { return null; } },
  guardarCache(datos, fuente) { try { localStorage.setItem(this.claveCache, JSON.stringify({t: Date.now(), datos, fuente})); } catch {} },

  /* Base de datos propia (api/datos.php): solo existe si la página se abrió desde XAMPP (http://localhost/...). */
  hayServidor() { return typeof location !== 'undefined' && /^https?:$/.test(location.protocol); },
  async pedirJSON(url, ms) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, {signal: ctl.signal, cache: 'no-store'});
      let cuerpo = null; try { cuerpo = await r.json(); } catch {}
      if (!r.ok) throw new Error((cuerpo && (cuerpo.error || cuerpo.mensaje)) || 'respondió ' + r.status);
      if (cuerpo === null) throw new Error('la respuesta no es válida (¿Apache y PHP están encendidos?)');
      return cuerpo;
    } catch (e) { throw new Error(e.name === 'AbortError' ? 'tiempo de espera agotado' : (e.message || 'sin conexión')); }
    finally { clearTimeout(t); }
  },
  async traerBD(forzar) {
    if (forzar) { try { await this.pedirJSON(this.urlActualizar, 30000); } catch {} }   // le pide a la base que se ponga al día con ESPN
    const d = await this.pedirJSON(this.urlBD, this.timeoutMs);
    if (!Array.isArray(d.PARTIDOS) || !d.PARTIDOS.some(p => p.gl !== null)) throw new Error('la base de datos no tiene partidos jugados');
    return d;
  },

  async cargar({forzar = false} = {}) {
    const c = this.leerCache();
    if (c && !forzar && Date.now() - c.t < this.vigenciaMin*60000)
      return {...c.datos, fuente: c.fuente || {tipo:'vivo', texto:'Datos en vivo (ESPN)', t:c.t}};
    let aviso = null;
    try {
      let datos = null, fuente = null;
      if (this.hayServidor()) {
        try { datos = await this.traerBD(forzar); fuente = {tipo:'vivo', texto:'Base de datos propia', t: datos.actualizado || Date.now()}; }
        catch (e) { aviso = 'Base de datos no disponible: ' + e.message; }
      }
      if (!datos) {
        try { datos = await this.traer(); }
        catch (e2) { throw new Error(aviso ? `${aviso} | ${e2.message}` : e2.message); }
        fuente = {tipo:'vivo', texto:'Datos en vivo (ESPN)', t:Date.now()};
        if (aviso) fuente.detalle = aviso;
      }
      this.guardarCache(datos, fuente);
      return {...datos, fuente};
    } catch (e) {
      if (c) return {...c.datos, fuente: {tipo:'cache', texto:'Sin conexión: datos guardados', t:c.t}};
      throw e;
    }
  }
};

/* ================= 6. MOTOR DE PREDICCIÓN ================= */
const MODELO = {vidaMediaDias: 90, prior: 4, rho: -0.1, ventajaElo: 60, kElo: 24, pesoElo: 0.2, maxGoles: 8};
const _fin = p => p.gl !== null && p.gv !== null;
const diasEntre = (a, b) => (new Date(a + 'T00:00:00Z') - new Date(b + 'T00:00:00Z')) / 864e5;
const sumaDia = (f, n = 1) => new Date(new Date(f + 'T00:00:00Z').getTime() + n*864e5).toISOString().slice(0, 10);
const _nom = id => (typeof eq === 'function' && eq(id)) ? eq(id).nombre : String(id);
const _fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const _pois = (l, k) => Math.exp(-l) * Math.pow(l, k) / _fact(k);

function entrenar(partidos, fechaRef) {
  const ps = partidos.filter(p => _fin(p) && p.fecha < fechaRef).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id);
  if (ps.length < 4) return null;
  const w = ps.map(p => Math.pow(0.5, Math.max(0, diasEntre(fechaRef, p.fecha)) / MODELO.vidaMediaDias));
  const W = w.reduce((a, b) => a + b, 0);
  const mL = ps.reduce((a, p, i) => a + w[i]*p.gl, 0) / W, mV = ps.reduce((a, p, i) => a + w[i]*p.gv, 0) / W;
  const base = Math.max(0.3, mV), ha = Math.max(0.5, mL / base);
  const ids = [...new Set(ps.flatMap(p => [p.local, p.visita]))];
  const att = {}, def = {}, nEf = {};
  ids.forEach(i => { att[i] = 1; def[i] = 1; nEf[i] = 0; });
  ps.forEach((p, k) => { nEf[p.local] += w[k]; nEf[p.visita] += w[k]; });
  for (let it = 0; it < 30; it++) {           // ajuste iterativo de ataque y defensa
    const gf = {}, ea = {}, gc = {}, ed = {};
    ids.forEach(i => { gf[i] = ea[i] = gc[i] = ed[i] = 0; });
    ps.forEach((p, k) => {
      gf[p.local] += w[k]*p.gl;  ea[p.local]  += w[k]*base*ha*def[p.visita];
      gf[p.visita] += w[k]*p.gv; ea[p.visita] += w[k]*base*def[p.local];
      gc[p.local] += w[k]*p.gv;  ed[p.local]  += w[k]*base*att[p.visita];
      gc[p.visita] += w[k]*p.gl; ed[p.visita] += w[k]*base*ha*att[p.local];
    });
    ids.forEach(i => { att[i] = Math.max(0.1, ea[i] ? gf[i]/ea[i] : 1); def[i] = Math.max(0.1, ed[i] ? gc[i]/ed[i] : 1); });
    const ma = ids.reduce((a, i) => a + att[i], 0) / ids.length, md = ids.reduce((a, i) => a + def[i], 0) / ids.length;
    ids.forEach(i => { att[i] /= ma; def[i] /= md; });
  }
  ids.forEach(i => { const s = nEf[i] / (nEf[i] + MODELO.prior); att[i] = 1 + (att[i]-1)*s; def[i] = 1 + (def[i]-1)*s; });
  const elo = {}, ultima = {}, res = {};
  ids.forEach(i => { elo[i] = 1500; res[i] = []; });
  ps.forEach(p => {
    const esp = 1 / (1 + Math.pow(10, -(elo[p.local] + MODELO.ventajaElo - elo[p.visita]) / 400));
    const real = p.gl > p.gv ? 1 : p.gl === p.gv ? 0.5 : 0;
    const k = MODELO.kElo * (1 + 0.5*Math.log(1 + Math.abs(p.gl - p.gv)));
    elo[p.local] += k*(real - esp); elo[p.visita] -= k*(real - esp);
    ultima[p.local] = ultima[p.visita] = p.fecha;
    res[p.local].push(real === 1 ? 'G' : real === 0.5 ? 'E' : 'P'); res[p.visita].push(real === 0 ? 'G' : real === 0.5 ? 'E' : 'P');
  });
  const forma = {}; ids.forEach(i => { forma[i] = res[i].slice(-5); });
  return {base, ha, att, def, nEf, elo, ultima, forma, mL, mV, n: ps.length};
}

function predecir(m, idL, idV, fechaRef) {
  if (!m) return null;
  const g = (o, i, d) => (o[i] !== undefined ? o[i] : d);
  let lh = m.base*m.ha*g(m.att, idL, 1)*g(m.def, idV, 1), la = m.base*g(m.att, idV, 1)*g(m.def, idL, 1);
  const dElo = g(m.elo, idL, 1500) + MODELO.ventajaElo - g(m.elo, idV, 1500), aj = dElo/400*MODELO.pesoElo;
  lh *= Math.exp(aj/2); la *= Math.exp(-aj/2);
  const desc = id => m.ultima[id] ? diasEntre(fechaRef, m.ultima[id]) : 7, fd = d => d < 4 ? 0.97 : d >= 7 ? 1.01 : 1;
  const dL = desc(idL), dV = desc(idV); lh *= fd(dL); la *= fd(dV);
  lh = Math.min(4, Math.max(0.15, lh)); la = Math.min(4, Math.max(0.15, la));
  const rho = MODELO.rho, tau = (a, b) => a === 0 && b === 0 ? 1 - lh*la*rho : a === 0 && b === 1 ? 1 + lh*rho : a === 1 && b === 0 ? 1 + la*rho : a === 1 && b === 1 ? 1 - rho : 1;
  const M = []; let tot = 0;
  for (let a = 0; a <= MODELO.maxGoles; a++) for (let b = 0; b <= MODELO.maxGoles; b++) { const p = _pois(lh, a)*_pois(la, b)*tau(a, b); M.push([a, b, p]); tot += p; }
  let pl = 0, pe = 0, pv = 0, o25 = 0, btts = 0;
  M.forEach(x => { const p = x[2]/tot; if (x[0] > x[1]) pl += p; else if (x[0] === x[1]) pe += p; else pv += p;
    if (x[0] + x[1] > 2) o25 += p; if (x[0] > 0 && x[1] > 0) btts += p; });
  const marcadores = [...M].sort((x, y) => y[2] - x[2]).slice(0, 3).map(x => ({m: `${x[0]}-${x[1]}`, p: x[2]/tot*100}));
  const nMin = Math.min(g(m.nEf, idL, 0), g(m.nEf, idV, 0)), confianza = nMin >= 6 ? 'Alta' : nMin >= 3 ? 'Media' : 'Baja';
  const pc = x => `${x >= 1 ? '+' : '−'}${Math.abs(Math.round((x - 1)*100))} %`, L = _nom(idL), V = _nom(idV);
  const factores = [
    `Ataque de ${L}: ${pc(g(m.att, idL, 1))} en goles respecto al promedio de la liga. Ataque de ${V}: ${pc(g(m.att, idV, 1))}.`,
    `Defensa: ${L} concede ${pc(g(m.def, idL, 1))} goles frente al promedio; ${V}, ${pc(g(m.def, idV, 1))} (menos es mejor).`,
    `Ventaja de local: en esta liga los locales marcan ${m.mL.toFixed(2)} goles por partido y los visitantes ${m.mV.toFixed(2)}.`,
    `Forma reciente (G ganó, E empató, P perdió): ${L} ${(m.forma[idL] || []).join(' ') || 's/d'} · ${V} ${(m.forma[idV] || []).join(' ') || 's/d'}.`,
    `Fuerza acumulada (Elo): ${L} ${Math.round(g(m.elo, idL, 1500))} · ${V} ${Math.round(g(m.elo, idV, 1500))}.`];
  if (dL < 4) factores.push(`${L} llega con solo ${Math.round(dL)} días de descanso.`);
  if (dV < 4) factores.push(`${V} llega con solo ${Math.round(dV)} días de descanso.`);
  factores.push(`Se usaron ${m.n} partidos jugados; los más recientes pesan más.`);
  return {local: pl*100, empate: pe*100, visita: pv*100, lamL: lh, lamV: la, over25: o25*100, btts: btts*100, marcadores, confianza, factores};
}

function refPorDefecto(partidos) {
  const f = partidos.filter(_fin).map(p => p.fecha).sort().pop(), hoy = new Date().toISOString().slice(0, 10);
  return f ? [hoy, sumaDia(f)].sort().pop() : hoy;
}
function prediccion(idL, idV, fechaRef) {
  const ref = fechaRef || refPorDefecto(PARTIDOS);
  return predecir(entrenar(PARTIDOS, ref), idL, idV, ref);
}

/* Prueba "hacia adelante": para cada partido jugado el modelo solo ve partidos anteriores. */
function evaluarModelo() {
  const fin = PARTIDOS.filter(_fin).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id);
  let n = 0, ok = 0, okG = 0, okL = 0, brier = 0, brierRef = 0;
  fin.forEach(p => {
    const prev = fin.filter(q => q.fecha < p.fecha), cnt = id => prev.filter(q => q.local === id || q.visita === id).length;
    if (prev.length < 6 || cnt(p.local) < 1 || cnt(p.visita) < 1) return;
    const r = predecir(entrenar(PARTIDOS, p.fecha), p.local, p.visita, p.fecha); if (!r) return;
    const real = p.gl > p.gv ? 0 : p.gl === p.gv ? 1 : 2, pr = [r.local, r.empate, r.visita].map(x => x/100);
    const fr = [0, 1, 2].map(k => prev.filter(q => (q.gl > q.gv ? 0 : q.gl === q.gv ? 1 : 2) === k).length / prev.length);
    const tasa = id => { const j = prev.filter(q => q.local === id || q.visita === id);
      return j.length ? j.filter(q => (q.local === id ? q.gl > q.gv : q.gv > q.gl)).length / j.length : 0; };
    const tL = tasa(p.local), tV = tasa(p.visita), baseG = tL > tV ? 0 : tL < tV ? 2 : 1;
    n++; ok += pr.indexOf(Math.max(...pr)) === real; okG += baseG === real; okL += real === 0;
    brier += pr.reduce((a, x, k) => a + Math.pow(x - (k === real ? 1 : 0), 2), 0);
    brierRef += fr.reduce((a, x, k) => a + Math.pow(x - (k === real ? 1 : 0), 2), 0);
  });
  if (!n) return {n: 0};
  return {n, acc: ok/n*100, accGanados: okG/n*100, accLocal: okL/n*100, brier: brier/n, brierRef: brierRef/n, mejora: (brierRef - brier)/brierRef*100};
}

/* ================= 7. MARCADOR, DETALLE Y MENSAJES ================= */
/* Marcador de aciertos: guarda el pronóstico de cada partido antes de jugarse y, cuando termina, lo compara con el resultado real. */
const MARCADOR = {
  clave: 'df-marcador-v1',
  leer() { try { return JSON.parse(localStorage.getItem(this.clave)) || {}; } catch { return {}; } },
  guardar(o) { try { localStorage.setItem(this.clave, JSON.stringify(o)); } catch {} },
  registrar() {
    if (!['vivo','cache'].includes(FUENTE.tipo)) return 0;
    const o = this.leer(); let n = 0;
    PARTIDOS.filter(p => !jugado(p) && !p.enVivo).forEach(p => {
      if (o[p.id]) return;                                   // solo vale el primer pronóstico, hecho antes del partido
      const r = prediccion(p.local, p.visita, p.fecha); if (!r) return;
      o[p.id] = {pr: [r.local, r.empate, r.visita].map(x => Math.round(x*10)/10), t: Date.now()}; n++;
    });
    if (n) this.guardar(o);
    return n;
  },
  resumen() {
    const o = this.leer(), filas = []; let pendientes = 0;
    Object.entries(o).forEach(([id, v]) => {
      const p = PARTIDOS.find(q => q.id === +id); if (!p) return;
      if (!jugado(p)) { pendientes++; return; }
      const real = p.gl > p.gv ? 0 : p.gl === p.gv ? 1 : 2, pred = v.pr.indexOf(Math.max(...v.pr));
      filas.push({p, v, pred, ok: real === pred});
    });
    filas.sort((a, b) => b.p.fecha.localeCompare(a.p.fecha));
    return {total: filas.length, aciertos: filas.filter(f => f.ok).length, pendientes, ultimos: filas.slice(0, 6)};
  }
};

function vistaMarcador() {
  if (!['vivo','cache'].includes(FUENTE.tipo))
    return `<p class="nota">${ic('info')}<span>El marcador se llena con datos en vivo: cada vez que abres la página guardamos el pronóstico de los próximos partidos y, cuando se juegan, los comparamos con el resultado real.</span></p>`;
  const r = MARCADOR.resumen(), nom = id => esc(eq(id).nombre), et = ['Gana local', 'Empate', 'Gana visitante'];
  if (!r.total) return `<p class="nota">${ic('info')}<span>Todavía no hay partidos terminados con pronóstico guardado. Pronósticos esperando resultado: <strong>${r.pendientes}</strong>. Vuelve después de los próximos partidos.</span></p>`;
  return `<div class="datos">${dato(`${r.aciertos} de ${r.total}`,'Aciertos')}${dato(Math.round(r.aciertos/r.total*100)+' %','Porcentaje')}${dato(r.pendientes,'Esperando resultado')}</div>
    <ul class="lista" style="margin-top:1rem">${r.ultimos.map(f => `<li><span class="etq ${f.ok?'ok':'mal'}">${ic(f.ok?'check':'cancel')}${f.ok?'Acertó':'Falló'}</span> ${nom(f.p.local)} ${f.p.gl} - ${f.p.gv} ${nom(f.p.visita)}
    <br><span class="muted">Pronóstico: ${et[f.pred]} (${f.v.pr[f.pred].toFixed(0)} %)</span></li>`).join('')}</ul>`;
}

function detalleEquipo(id) {
  const mios = PARTIDOS.filter(p => p.local === id || p.visita === id).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ult = mios.filter(jugado).slice(-5).reverse(), prox = mios.find(p => !jugado(p));
  const res = p => { const casa = p.local === id, [f, c] = casa ? [p.gl, p.gv] : [p.gv, p.gl], k = f > c ? 'G' : f === c ? 'E' : 'P', [cl, i, t] = FORMA[k];
    return `<li><span class="etq ${cl}">${ic(i)}${t}</span> ${casa ? 'Local' : 'Visitante'} vs ${esc(eq(casa ? p.visita : p.local).nombre)}: <strong>${f} - ${c}</strong><br><span class="muted">${fmtFecha(p.fecha)}</span></li>`; };
  let pr = '<p>No hay próximo partido programado.</p>';
  if (prox) { const r = prediccion(prox.local, prox.visita, prox.fecha);
    pr = `<p class="grande">${esc(eq(prox.local).nombre)} vs ${esc(eq(prox.visita).nombre)}</p><p class="muted">${fmtFecha(prox.fecha)}</p>` +
      (r ? `<div class="datos">${dato(r.local.toFixed(0)+' %','Gana local')}${dato(r.empate.toFixed(0)+' %','Empate')}${dato(r.visita.toFixed(0)+' %','Gana visitante')}</div><p class="muted">Confianza ${r.confianza}. Más detalle en Predicciones.</p>` : '<p>Faltan datos para estimar.</p>'); }
  return `<div class="rejilla" style="margin-top:1.25rem"><section class="tarjeta verde">${cab('event','Próximo partido y pronóstico')}${pr}</section>
    <section class="tarjeta">${cab('leaderboard','Últimos resultados')}${ult.length ? `<ul class="lista">${ult.map(res).join('')}</ul>` : '<p>Aún no hay partidos jugados.</p>'}</section></div>`;
}

function mensajeAmable(err) {
  const m = String((err && err.message) || err || '');
  if (/no devolvi/.test(m)) return 'El servicio respondió, pero sin partidos de la liga en estas fechas. Mostramos datos de ejemplo.';
  return 'No pudimos conectar con el servicio de datos. Mostramos datos de ejemplo; revisa tu internet y pulsa "Actualizar".';
}

/* Alertas escritas a mano en la base de datos (lesiones, sanciones) primero y, después, las calculadas con los resultados. */
function alertasFinales(manuales) { return [...(manuales || []), ...calcularAlertas()].slice(0, 8); }
