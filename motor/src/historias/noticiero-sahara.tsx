// Escenas a medida: «MINURSO, 30 de octubre de 2026» — estilo noticiero (sin personas ni imágenes falsas)
import React from 'react';
import {amiri, sans, serif} from '../tema';
import {ALTO_MAPA, CIUDADES, TIERRA_NO} from './mapa-noroeste';
import {EscenaProps, FondoVideoCtx, Lienzo, ease, easeIO, mix, p} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';

const AZUL = ['#0a1930', '#143055'];
const ROJO = '#e2392b';
const VERDE = '#1f8a56';
const ORO = '#f2c165';
const CREMA = '#fbf3e6';

const Fondo: React.FC<{f: number}> = ({f}) => {
  const conVideo = React.useContext(FondoVideoCtx);
  return (
  <g>
    <defs>
      <linearGradient id="ns-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={AZUL[0]} />
        <stop offset="1" stopColor={AZUL[1]} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#ns-fondo)" opacity={conVideo ? 0.58 : 1} />
    {Array.from({length: 20}).map((_, i) => (
      <line key={`h${i}`} x1={0} x2={1080} y1={i * 100} y2={i * 100} stroke="#8fb4e8" strokeWidth={1.5} opacity={0.08} />
    ))}
    {Array.from({length: 12}).map((_, i) => (
      <line key={`v${i}`} y1={0} y2={1920} x1={i * 100} x2={i * 100} stroke="#8fb4e8" strokeWidth={1.5} opacity={0.08} />
    ))}
    {/* barras de noticiero */}
    <rect x={0} y={1640} width={1080} height={8} fill={ROJO} />
    <rect x={0} y={1648} width={1080} height={70} fill="#06101f" />
    <text x={(1080 - ((f * 3) % 2200)) + 1080} y={1698} fontFamily={sans} fontWeight={800} fontSize={34} fill={CREMA} opacity={0.85}>
      MINURSO · CONSEJO DE SEGURIDAD · 30 OCTUBRE 2026 · MINURSO · CONSEJO DE SEGURIDAD · 30 OCTUBRE 2026 ·
    </text>
  </g>
  );
};

const UltimaHora: React.FC<{f: number}> = ({f}) => (
  <g transform="translate(130 290)">
    <rect width={330} height={64} rx={6} fill={ROJO} />
    <circle cx={34} cy={32} r={11} fill="#fff" opacity={Math.floor(f / 15) % 2 ? 1 : 0.35} />
    <text x={58} y={44} fontFamily={sans} fontWeight={800} fontSize={34} fill="#fff">
      ÚLTIMA HORA
    </text>
  </g>
);

const Texto: React.FC<{x: number; y: number; t: string; s?: number; c?: string; w?: number; a?: 'start' | 'middle'}> = ({x, y, t, s = 44, c = CREMA, w = 800, a = 'middle'}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={sans} fontWeight={800} fontSize={s} fill={c} style={{maxWidth: w}}>
    {t}
  </text>
);

/** Sello de goma */
const Sello: React.FC<{x: number; y: number; t: string; rot?: number; e: number; c?: string; s?: number}> = ({x, y, t, rot = -8, e, c = ROJO, s = 1}) => {
  if (e <= 0) return null;
  const w = t.length * 38 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1.8 - 0.8 * e)})`} opacity={Math.min(1, e * 1.6)}>
      <rect x={-w / 2} y={-52} width={w} height={104} rx={12} fill="none" stroke={c} strokeWidth={9} />
      <rect x={-w / 2 + 10} y={-42} width={w - 20} height={84} rx={8} fill="none" stroke={c} strokeWidth={3} />
      <text y={20} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={58} fill={c}>
        {t}
      </text>
    </g>
  );
};

const Doc: React.FC<{x: number; y: number; w?: number; h?: number; titulo: string; sub?: string; rot?: number; lineas?: number}> = ({x, y, w = 400, h = 540, titulo, sub, rot = 0, lineas = 7}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={10} fill="#000" opacity={0.3} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#f7f3ea" />
    <rect x={-w / 2} y={-h / 2} width={w} height={86} rx={10} fill="#1c3b6b" />
    <text y={-h / 2 + 56} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={36} fill="#fff">
      {titulo}
    </text>
    {sub && (
      <text y={-h / 2 + 140} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={30} fill="#1c3b6b">
        {sub}
      </text>
    )}
    {Array.from({length: lineas}).map((_, i) => (
      <rect key={i} x={-w / 2 + 40} y={-h / 2 + 180 + i * 42} width={w - 80 - (i % 3) * 50} height={14} rx={7} fill="#c9c2b2" />
    ))}
  </g>
);

// ───────────────────────── escenas ─────────────────────────

const Fecha: React.FC<EscenaProps> = ({f, k}) => {
  const e = ease(p(f, 0, 14));
  const flip = ease(p(f, 6, 14));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g transform={`translate(540 ${690 + (1 - e) * -500}) rotate(${(1 - e) * -8})`}>
        <rect x={-330 + 10} y={-330 + 16} width={660} height={700} rx={26} fill="#000" opacity={0.35} />
        <rect x={-330} y={-330} width={660} height={700} rx={26} fill="#fbf7ee" />
        <path d="M-330,-304 a26,26 0 0 1 26,-26 h608 a26,26 0 0 1 26,26 v140 h-660 z" fill={ROJO} />
        <text y={-210} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={64} fill="#fff" letterSpacing={6}>
          OCTUBRE 2026
        </text>
        {[-230, 230].map((x) => (
          <circle key={x} cx={x} cy={-330} r={16} fill="#2a2a2a" />
        ))}
        <text y={110} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={320} fill={AZUL[0]} transform={`scale(1 ${mix(0.05, 1, flip)})`}>
          30
        </text>
        <text y={250} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={72} fill={AZUL[1]}>
          VIERNES
        </text>
      </g>
      <Sello x={690} y={1080} t="DÍA HISTÓRICO" e={ease(p(f, k, 8))} s={0.9} />
    </Lienzo>
  );
};

const Consejo: React.FC<EscenaProps> = ({f, k}) => {
  const seats = Array.from({length: 15}).map((_, i) => {
    const a = Math.PI * (0.08 + (0.84 * i) / 14);
    return {x: 540 - Math.cos(a) * 380, y: 800 - Math.sin(a) * 300};
  });
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <Texto x={540} y={420} t="CONSEJO DE SEGURIDAD" s={58} c={ORO} />
      <Texto x={540} y={480} t="15 miembros · votación del 30 de octubre" s={34} c="#bcd0ee" />
      {seats.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`} opacity={ease(p(f, i * 1.2, 8))}>
          <circle r={40} fill="#1c3b6b" stroke="#8fb4e8" strokeWidth={5} />
          <circle r={14} fill="#8fb4e8" />
        </g>
      ))}
      <Doc x={540} y={900} w={440} h={400} titulo="MINURSO" sub="Prórroga del mandato" rot={-2} lineas={4} />
      <Sello x={540} y={940} t="NO PRORROGADA" e={ease(p(f, k, 8))} rot={-10} s={0.95} />
    </Lienzo>
  );
};

const Proyectos: React.FC<EscenaProps> = ({f, k}) => (
  <Lienzo>
    <Fondo f={f} />
    <UltimaHora f={f} />
    <Texto x={540} y={430} t="DOS PROYECTOS" s={58} c={ORO} />
    <Doc x={300} y={760} w={400} h={500} titulo="Proyecto" sub="Estados Unidos" rot={-3} />
    <Doc x={780} y={760} w={400} h={500} titulo="Proyecto" sub="Rusia" rot={3} />
    {[300, 780].map((x, i) => {
      const e = ease(p(f, k + i * 14, 8));
      return (
        <g key={x} opacity={e} transform={`translate(${x} 780) scale(${1.5 - 0.5 * e})`}>
          <path d="M-120,-120 L120,120 M120,-120 L-120,120" stroke={ROJO} strokeWidth={34} strokeLinecap="round" />
        </g>
      );
    })}
    <Sello x={540} y={1100} t="NINGUNO ADOPTADO" e={ease(p(f, k + 30, 8))} rot={-4} s={0.82} />
  </Lienzo>
);

const Anos: React.FC<EscenaProps> = ({f, d}) => {
  const t = easeIO(p(f, 4, d * 0.6));
  const n = Math.round(35 * t);
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <text x={540} y={760} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={400} fill={CREMA}>
        {n}
      </text>
      <Texto x={540} y={860} t="AÑOS DE MISIÓN" s={64} c={ORO} />
      {/* línea de tiempo 1991 → 2026 */}
      <line x1={140} x2={940} y1={990} y2={990} stroke="#3e5f93" strokeWidth={14} strokeLinecap="round" />
      <line x1={140} x2={140 + 800 * t} y1={990} y2={990} stroke={ORO} strokeWidth={14} strokeLinecap="round" />
      <circle cx={140} cy={990} r={22} fill={ORO} />
      <circle cx={140 + 800 * t} cy={990} r={26} fill={CREMA} stroke={ORO} strokeWidth={8} />
      <Texto x={140} y={1080} t="1991" s={46} a="middle" />
      <Texto x={940} y={1080} t="2026" s={46} a="middle" />
    </Lienzo>
  );
};

const Comunicado: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 14));
  const lineas = ['«…un paso de gran significado', 'hacia el cierre definitivo', 'del expediente del Sáhara', 'marroquí en la ONU.»'];
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g transform={`translate(540 ${700 + (1 - e) * 400})`} opacity={e}>
        <rect x={-440 + 10} y={-400 + 16} width={880} height={800} rx={14} fill="#000" opacity={0.3} />
        <rect x={-440} y={-400} width={880} height={800} rx={14} fill="#f7f3ea" />
        <rect x={-440} y={-400} width={880} height={150} rx={14} fill={ROJO} />
        <text y={-340} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={32} fill="#fff" opacity={0.9}>
          COMUNICADO
        </text>
        <text y={-282} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={48} fill="#fff">
          GABINETE REAL · 30 OCT
        </text>
        {lineas.map((l, i) => (
          <text key={i} x={0} y={-120 + i * 84} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={52} fill={AZUL[0]} opacity={ease(p(f, 10 + i * 8, 10))}>
            {l}
          </text>
        ))}
        <line x1={-340} x2={340} y1={290} y2={290} stroke="#c9c2b2" strokeWidth={3} />
        <text y={348} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={30} fill="#6a6a6a">
          Fuente: prensa marroquí (Akhbarona)
        </text>
      </g>
    </Lienzo>
  );
};

const Autonomia: React.FC<EscenaProps> = ({f}) => {
  const ondea = (x: number) => Math.sin(f * 0.18 + x * 0.012) * 14;
  const xs = Array.from({length: 21}).map((_, i) => i * 28);
  const b = (dy: number) => xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ondea(x) + dy}`).join(' ');
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g transform="translate(240 470)">
        <path d={`${b(0)} L560,${ondea(560) + 380} ${xs.map((x) => x).reverse().map((x) => `L${x},${ondea(x) + 380}`).join(' ')} Z`} fill="#c1272d" />
        <g transform={`translate(280 ${190 + ondea(280)})`}>
          <path d="M0,-90 L26,-28 L90,-24 L40,16 L56,80 L0,44 L-56,80 L-40,16 L-90,-24 L-26,-28 Z" fill="none" stroke={VERDE} strokeWidth={12} strokeLinejoin="round" />
        </g>
        <rect x={-14} y={-20} width={16} height={520} fill="#cfd6dc" />
      </g>
      <Texto x={540} y={990} t="INICIATIVA DE AUTONOMÍA" s={48} c={ORO} />
      <Texto x={540} y={1060} t="bajo soberanía marroquí" s={42} />
    </Lienzo>
  );
};


const NOMBRES: Record<string, string> = {Laayoune: 'العيون', Smara: 'السمارة', Boujdour: 'بوجدور', Dakhla: 'الداخلة'};
const SUR = ['Laayoune', 'Smara', 'Boujdour', 'Dakhla'] as const;
const ES: Record<string, string> = {Laayoune: 'Laâyoune', Smara: 'Smara', Boujdour: 'Boujdour', Dakhla: 'Dakhla'};

/** Mapa de la costa atlántica del noroeste de África con las ciudades del sur (solo costa y ciudades, sin fronteras) */
const Mapa: React.FC<EscenaProps> = ({f}) => {
  const E = 0.74; // escala del mapa en el lienzo
  const ox = 140, oy = 395;
  const e = ease(p(f, 0, 14));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <defs>
        <linearGradient id="ns-mar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c4f7c" />
          <stop offset="1" stopColor="#123a5e" />
        </linearGradient>
        <linearGradient id="ns-tierra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa56a" />
          <stop offset="0.45" stopColor="#d9b97f" />
          <stop offset="1" stopColor="#e6c890" />
        </linearGradient>
        <clipPath id="ns-recorte">
          <rect x={ox} y={oy} width={1080 * E} height={ALTO_MAPA * E} rx={22} />
        </clipPath>
      </defs>
      <g opacity={e}>
        <rect x={ox} y={oy} width={1080 * E} height={ALTO_MAPA * E} rx={22} fill="url(#ns-mar)" />
        <g clipPath="url(#ns-recorte)">
          <g transform={`translate(${ox} ${oy}) scale(${E})`}>
            <path d={TIERRA_NO} fill="url(#ns-tierra)" stroke="#efe3c6" strokeWidth={3} />
            {/* ciudades de contexto */}
            {['Agadir', 'Casablanca', 'Rabat'].map((c) => (
              <g key={c} transform={`translate(${CIUDADES[c][0]} ${CIUDADES[c][1]})`}>
                <circle r={9} fill="#3b2a18" />
                <text x={16} y={8} fontFamily={sans} fontWeight={800} fontSize={30} fill="#3b2a18" opacity={0.8}>
                  {c}
                </text>
              </g>
            ))}
            {/* ciudades del sur: aparecen una a una */}
            {SUR.map((c, i) => {
              const t = ease(p(f, 14 + i * 12, 10));
              const [x, y] = CIUDADES[c];
              const lado = c === 'Dakhla' || c === 'Smara' ? 1 : -1;
              return (
                <g key={c} transform={`translate(${x} ${y})`} opacity={t}>
                  <circle r={26 + 18 * Math.sin(f * 0.15 + i)} fill={ROJO} opacity={0.25} />
                  <circle r={14 * t + 2} fill={ROJO} stroke="#fff" strokeWidth={4} />
                  <g transform={`translate(${lado > 0 ? 28 : -28} -24)`}>
                    <text textAnchor={lado > 0 ? 'start' : 'end'} fontFamily={amiri} fontWeight={700} fontSize={50} fill="#3b0f0a">
                      {NOMBRES[c]}
                    </text>
                    <text y={40} textAnchor={lado > 0 ? 'start' : 'end'} fontFamily={sans} fontWeight={800} fontSize={34} fill="#3b0f0a">
                      {ES[c]}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </g>
        <text x={540} y={oy + ALTO_MAPA * E + 46} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={28} fill="#bcd0ee" opacity={0.85}>
          Mapa orientativo: costa y ciudades
        </text>
      </g>
    </Lienzo>
  );
};

/** Tres tarjetas de ciudad: Laâyoune, Smara, Dakhla */
const Ciudades: React.FC<EscenaProps> = ({f}) => {
  const datos = [
    {c: 'Laayoune', ar: 'العيون', es: 'Laâyoune', dato: 'La mayor ciudad del sur'},
    {c: 'Smara', ar: 'السمارة', es: 'Smara', dato: 'Ciudad histórica, fundada en 1898'},
    {c: 'Dakhla', ar: 'الداخلة', es: 'Dakhla', dato: 'Bahía del Atlántico'},
  ];
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      {datos.map((d, i) => {
        const e = ease(p(f, i * 14, 14));
        const y = 450 + i * 235;
        return (
          <g key={d.c} transform={`translate(${(1 - e) * (i % 2 ? 500 : -500)} 0)`} opacity={e}>
            <rect x={110} y={y - 100} width={860} height={205} rx={22} fill="#0f2547" stroke="#3e5f93" strokeWidth={4} />
            <rect x={110} y={y - 100} width={16} height={205} rx={8} fill={i === 1 ? ORO : i === 2 ? VERDE : ROJO} />
            {/* icono de papel: edificios / minarete / ola */}
            <g transform={`translate(215 ${y + 5})`}>
              <circle r={70} fill="#16345f" />
              {i === 0 && (
                <g fill={CREMA}>
                  <rect x={-44} y={-10} width={26} height={50} />
                  <rect x={-12} y={-40} width={26} height={80} />
                  <rect x={20} y={-22} width={26} height={62} />
                </g>
              )}
              {i === 1 && (
                <g fill={CREMA}>
                  <rect x={-14} y={-46} width={28} height={92} />
                  <path d="M-22,-46 h44 l-22,-26 z" fill={ORO} />
                  <rect x={-44} y={30} width={88} height={16} />
                </g>
              )}
              {i === 2 && (
                <g fill="none" stroke={CREMA} strokeWidth={9} strokeLinecap="round">
                  <path d={`M-48,-6 q16,-24 32,0 t32,0 t32,0`} />
                  <path d={`M-48,22 q16,-24 32,0 t32,0 t32,0`} />
                </g>
              )}
            </g>
            <text x={320} y={y - 10} fontFamily={amiri} fontWeight={700} fontSize={70} fill={ORO}>
              {d.ar}
            </text>
            <text x={320} y={y + 38} fontFamily={sans} fontWeight={800} fontSize={44} fill={CREMA}>
              {d.es}
            </text>
            <text x={320} y={y + 82} fontFamily={sans} fontWeight={800} fontSize={30} fill="#bcd0ee">
              {d.dato}
            </text>
          </g>
        );
      })}
    </Lienzo>
  );
};

/** Tarjeta grande con título y líneas, reutilizable */
const Tarjeta: React.FC<{y: number; w?: number; h: number; titulo: string; c?: string; e: number; children?: React.ReactNode}> = ({y, w = 860, h, titulo, c = ROJO, e, children}) => (
  <g transform={`translate(540 ${y + (1 - e) * 120})`} opacity={e}>
    <rect x={-w / 2 + 10} y={12} width={w} height={h} rx={20} fill="#000" opacity={0.3} />
    <rect x={-w / 2} y={0} width={w} height={h} rx={20} fill="#0f2547" stroke="#3e5f93" strokeWidth={4} />
    <rect x={-w / 2} y={0} width={w} height={90} rx={20} fill={c} />
    <text y={62} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={40} fill="#fff">
      {titulo}
    </text>
    {children}
  </g>
);

const Rey: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 14));
  const pilares = ['Diplomacia activa', 'Alianzas internacionales', 'Plan de autonomía'];
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      {/* corona dibujada (adorno, sin retrato) */}
      <g transform={`translate(540 ${480 + (1 - e) * -200}) scale(${e})`}>
        <path d="M-120,60 L-150,-40 L-70,10 L0,-70 L70,10 L150,-40 L120,60 Z" fill={ORO} stroke="#b98420" strokeWidth={8} strokeLinejoin="round" />
        <rect x={-120} y={64} width={240} height={28} rx={8} fill="#d89c2f" stroke="#b98420" strokeWidth={6} />
        {[-150, 0, 150].map((x) => (
          <circle key={x} cx={x} cy={x === 0 ? -76 : -46} r={14} fill={ROJO} stroke="#fff" strokeWidth={4} />
        ))}
      </g>
      <Texto x={540} y={650} t="Rey Mohammed VI" s={60} c={ORO} />
      <Texto x={540} y={715} t="Unidad territorial = prioridad exterior" s={36} c="#bcd0ee" />
      {pilares.map((t, i) => {
        const a = ease(p(f, 14 + i * 10, 10));
        return (
          <g key={t} transform={`translate(${(1 - a) * 400} ${800 + i * 110})`} opacity={a}>
            <rect x={130} y={0} width={820} height={90} rx={16} fill="#0f2547" stroke="#3e5f93" strokeWidth={4} />
            <circle cx={190} cy={45} r={22} fill={[ROJO, VERDE, ORO][i]} />
            <text x={240} y={58} fontFamily={sans} fontWeight={800} fontSize={42} fill={CREMA}>
              {t}
            </text>
          </g>
        );
      })}
    </Lienzo>
  );
};

const Giro: React.FC<EscenaProps> = ({f, k}) => {
  const a = ease(p(f, 0, 12));
  const b = ease(p(f, k, 14));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <Tarjeta y={430} h={230} titulo="ANTES" c="#4a5f82" e={a}>
        <text y={170} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={56} fill={CREMA}>
          Gestionar el conflicto
        </text>
      </Tarjeta>
      <g opacity={b} transform={`translate(540 ${760 + Math.sin(f * 0.2) * 8})`}>
        <path d="M-60,-40 v50 h-40 l100,80 l100,-80 h-40 v-50 z" fill={ORO} />
      </g>
      <Tarjeta y={900} h={230} titulo="AHORA" c={VERDE} e={b}>
        <text y={170} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={56} fill={CREMA}>
          Buscar la solución final
        </text>
      </Tarjeta>
    </Lienzo>
  );
};

const Agenda: React.FC<EscenaProps> = ({f, k}) => {
  const e = ease(p(f, 0, 12));
  const sale = easeIO(p(f, k, 18));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <Texto x={540} y={440} t="AGENDA DEL CONSEJO" s={50} c={ORO} />
      <g opacity={e}>
        <rect x={140} y={500} width={800} height={560} rx={18} fill="#f7f3ea" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(0 ${560 + i * 115})`}>
            <circle cx={210} cy={30} r={16} fill="#1c3b6b" />
            <rect x={250} y={18} width={560 - (i % 2) * 90} height={24} rx={12} fill="#c9c2b2" />
          </g>
        ))}
        {/* el punto «Sáhara» sale de la lista */}
        <g transform={`translate(${sale * 900} ${0})`} opacity={1 - sale * 0.4}>
          <rect x={170} y={905} width={700} height={104} rx={14} fill={ROJO} />
          <text x={520} y={972} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={48} fill="#fff">
            Sáhara marroquí
          </text>
        </g>
      </g>
    </Lienzo>
  );
};

const Despues: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 12));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <text x={540} y={760} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={460} fill={ORO} opacity={e} transform={`rotate(${Math.sin(f * 0.1) * 3} 540 640)`}>
        ?
      </text>
      <Texto x={540} y={900} t="¿Y ahora, qué?" s={72} />
      <g opacity={ease(p(f, 20, 12))}>
        <Texto x={540} y={990} t="Después del 30 de octubre" s={44} c="#bcd0ee" />
      </g>
    </Lienzo>
  );
};

const Patria: React.FC<EscenaProps> = ({f}) => {
  const items = [
    {t: 'IDENTIDAD', c: ROJO},
    {t: 'HISTORIA', c: ORO},
    {t: 'UNIDAD TERRITORIAL', c: VERDE},
  ];
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <Texto x={540} y={450} t="Para los marroquíes" s={56} c={ORO} />
      <Texto x={540} y={510} t="no es solo un expediente diplomático" s={34} c="#bcd0ee" />
      {items.map((it, i) => {
        const a = ease(p(f, 10 + i * 12, 12));
        return (
          <g key={it.t} transform={`translate(${(i % 2 ? 1 : -1) * (1 - a) * 500} ${620 + i * 170})`} opacity={a}>
            <rect x={110} y={0} width={860} height={130} rx={20} fill="#0f2547" stroke={it.c} strokeWidth={6} />
            <rect x={110} y={0} width={24} height={130} rx={12} fill={it.c} />
            <text x={540} y={86} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={58} fill={CREMA}>
              {it.t}
            </text>
          </g>
        );
      })}
    </Lienzo>
  );
};

const Frase: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 16));
  const palabras = ['decisiones', 'trabajo', 'paciencia', 'estrategia'];
  return (
    <Lienzo>
      <Fondo f={f} />
      <text x={150} y={560} fontFamily={serif} fontWeight={700} fontSize={300} fill={ORO} opacity={0.5 * e}>
        “
      </text>
      <g opacity={e}>
        <Texto x={540} y={640} t="La historia no la hacen" s={54} />
        <Texto x={540} y={710} t="solo los eslóganes…" s={54} />
      </g>
      {palabras.map((w, i) => {
        const a = ease(p(f, 22 + i * 10, 10));
        return (
          <g key={w} opacity={a} transform={`translate(0 ${(1 - a) * 40})`}>
            <rect x={200} y={800 + i * 100} width={680} height={78} rx={39} fill={[ROJO, VERDE, ORO, '#4a7fc9'][i]} />
            <text x={540} y={856 + i * 100} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={46} fill={i === 2 ? AZUL[0] : '#fff'}>
              {w.toUpperCase()}
            </text>
          </g>
        );
      })}
    </Lienzo>
  );
};

const Matiz: React.FC<EscenaProps> = ({f, k}) => {
  const a = ease(p(f, 0, 12));
  const b = ease(p(f, k, 12));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g opacity={a} transform={`translate(0 ${(1 - a) * 80 - 80})`}>
        <rect x={110} y={420} width={860} height={330} rx={22} fill="#3a1218" stroke={ROJO} strokeWidth={6} />
        <circle cx={220} cy={585} r={62} fill={ROJO} />
        <path d="M195,560 L245,610 M245,560 L195,610" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        <Texto x={310} y={560} t="NO es un fallo" s={52} a="start" />
        <Texto x={310} y={625} t="definitivo de la ONU" s={52} a="start" />
        <Texto x={310} y={690} t="sobre la soberanía" s={44} a="start" c="#f0b8b0" />
      </g>
      <g opacity={b} transform={`translate(0 ${(1 - b) * 80 - 80})`}>
        <rect x={110} y={830} width={860} height={330} rx={22} fill="#0d2e22" stroke={VERDE} strokeWidth={6} />
        <circle cx={220} cy={995} r={62} fill={VERDE} />
        <path d="M190,995 L212,1020 L252,968" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Texto x={310} y={970} t="SÍ es una" s={52} a="start" />
        <Texto x={310} y={1035} t="nueva etapa" s={52} a="start" />
        <Texto x={310} y={1100} t="política y diplomática" s={44} a="start" c="#b8e8cc" />
      </g>
    </Lienzo>
  );
};

const Pregunta: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 12));
  return (
    <Lienzo>
      <Fondo f={f} />
      <g transform={`translate(540 ${620 + Math.sin(f * 0.1) * 8}) scale(${0.6 + 0.4 * e})`} opacity={e}>
        <path d="M-380,-190 h760 q40,0 40,40 v280 q0,40 -40,40 h-300 l-90,110 l-20,-110 h-350 q-40,0 -40,-40 v-280 q0,-40 40,-40 z" fill="#fff6dc" stroke={ORO} strokeWidth={8} />
        <text y={30} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={96} fill={AZUL[0]}>
          ¿Y tú, qué
        </text>
        <text y={140} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={96} fill={ROJO}>
          piensas?
        </text>
      </g>
      <g opacity={ease(p(f, 20, 12))}>
        <Texto x={540} y={1040} t="Fuentes" s={36} c={ORO} />
        <Texto x={540} y={1090} t="The Arab Weekly · Yabiladi · Akhbarona" s={32} c="#bcd0ee" />
        <Texto x={540} y={1136} t="WSRW · Atalayar" s={32} c="#bcd0ee" />
      </g>
    </Lienzo>
  );
};

export const NOTICIERO_SAHARA: Record<string, React.FC<EscenaProps>> = {
  fecha: Fecha,
  consejo: Consejo,
  proyectos: Proyectos,
  anos: Anos,
  comunicado: Comunicado,
  autonomia: Autonomia,
  mapa: Mapa,
  ciudades: Ciudades,
  rey: Rey,
  giro: Giro,
  agenda: Agenda,
  despues: Despues,
  patria: Patria,
  frase: Frase,
  matiz: Matiz,
  pregunta: Pregunta,
};

export const FOCOS_NOTICIERO_SAHARA: Record<string, FocoEscena> = {
  fecha: {x: 540, y: 760},
  consejo: {x: 540, y: 800},
  proyectos: {x: 540, y: 880},
  anos: {x: 540, y: 880},
  comunicado: {x: 540, y: 820},
  autonomia: {x: 540, y: 780},
  mapa: {x: 440, y: 800},
  ciudades: {x: 540, y: 800},
  rey: {x: 540, y: 760},
  giro: {x: 540, y: 780},
  agenda: {x: 540, y: 780},
  despues: {x: 540, y: 760},
  patria: {x: 540, y: 800},
  frase: {x: 540, y: 780},
  matiz: {x: 540, y: 800},
  pregunta: {x: 540, y: 760},
};
