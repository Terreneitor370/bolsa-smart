import { Series } from './types';

/**
 * Datos de demostracion deterministas. Se usan cuando no hay internet o
 * cuando la fuente de datos falla, para que la presentacion nunca se caiga.
 * NO son precios reales y la interfaz los marca como "Demostracion".
 */

type Segment = { days: number; drift: number; vol: number };
type Scenario = Segment[];

const SCENARIOS: Record<string, Scenario> = {
  // Subida sostenida y luego correccion fuerte: suele dar "Buen momento"
  dip: [
    { days: 190, drift: 0.0007, vol: 0.008 },
    { days: 62, drift: -0.0042, vol: 0.009 },
  ],
  // Correccion moderada
  mildDip: [
    { days: 200, drift: 0.0006, vol: 0.007 },
    { days: 52, drift: -0.0022, vol: 0.007 },
  ],
  // Subida fuerte constante: suele dar "Esperar"
  rally: [{ days: 252, drift: 0.0022, vol: 0.007 }],
  // Lateral
  flat: [{ days: 252, drift: 0.0002, vol: 0.008 }],
};

const PLAN: Record<string, { scenario: keyof typeof SCENARIOS; base: number; seed: number }> = {
  VOO: { scenario: 'mildDip', base: 480, seed: 11 },
  QQQ: { scenario: 'rally', base: 420, seed: 22 },
  VT: { scenario: 'flat', base: 105, seed: 33 },
  AAPL: { scenario: 'dip', base: 210, seed: 44 },
  'NAFTRACISHRS.MX': { scenario: 'flat', base: 58, seed: 55 },
  'WALMEX.MX': { scenario: 'rally', base: 62, seed: 66 },
  'GFNORTEO.MX': { scenario: 'dip', base: 140, seed: 77 },
  'AMXB.MX': { scenario: 'mildDip', base: 17, seed: 88 },
};

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function businessDaysBack(count: number, end: number): number[] {
  const out: number[] = [];
  const d = new Date(end);
  while (out.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.push(d.getTime());
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

export function demoSeries(symbol: string, now: number = Date.now()): Series {
  const plan = PLAN[symbol] ?? { scenario: 'flat', base: 100, seed: 1 };
  const segments = SCENARIOS[plan.scenario];
  const rand = mulberry32(plan.seed);

  const closes: number[] = [];
  let price = plan.base;
  for (const seg of segments) {
    for (let i = 0; i < seg.days; i++) {
      price = price * (1 + seg.drift + seg.vol * gauss(rand));
      closes.push(price);
    }
  }
  const times = businessDaysBack(closes.length, now);
  return { times, closes };
}
