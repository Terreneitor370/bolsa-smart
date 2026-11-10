import { CATALOG } from '../shared/catalog';
import { simulateDca } from '../shared/dca';
import { demoSeries } from '../shared/demo';
import { computeSignal, rsi, sma } from '../shared/signals';

let failed = 0;
function check(name: string, ok: boolean, extra = ''): void {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name} ${extra}`);
  if (!ok) failed++;
}

// SMA
check('sma basico', sma([1, 2, 3, 4, 5], 5) === 3);
check('sma sin datos suficientes', sma([1, 2], 5) === null);

// RSI: serie siempre al alza = 100, siempre a la baja = 0
const up = Array.from({ length: 40 }, (_, i) => 100 + i);
const down = Array.from({ length: 40 }, (_, i) => 200 - i);
check('rsi alza continua = 100', rsi(up) === 100);
check('rsi baja continua = 0', Math.abs((rsi(down) as number) - 0) < 1e-9);
check('rsi pocos datos = null', rsi([1, 2, 3]) === null);

// Datos insuficientes
const few = computeSignal([1, 2, 3]);
check('pocos datos -> neutral 50', few.score === 50 && few.verdict === 'neutral');

// Rango del puntaje y consistencia de veredicto en todo el catalogo demo
const seen = new Set<string>();
for (const a of CATALOG) {
  const s = demoSeries(a.symbol);
  const sig = computeSignal(s.closes);
  seen.add(sig.verdict);
  const okRange = sig.score >= 0 && sig.score <= 100;
  const okVerdict =
    (sig.score >= 65 && sig.verdict === 'comprar') ||
    (sig.score >= 40 && sig.score < 65 && sig.verdict === 'neutral') ||
    (sig.score < 40 && sig.verdict === 'esperar');
  check(
    `demo ${a.ticker}`,
    okRange && okVerdict && s.closes.length === s.times.length,
    `score=${sig.score} ${sig.verdict} rsi=${sig.rsi?.toFixed(0)} dd=${(sig.drawdown * 100).toFixed(1)}%`,
  );
}
check('la demo cubre los 3 veredictos', seen.size === 3, `(${[...seen].join(', ')})`);

// Determinismo de la demo
const a1 = demoSeries('VOO', 1_700_000_000_000);
const a2 = demoSeries('VOO', 1_700_000_000_000);
check('demo determinista', JSON.stringify(a1.closes) === JSON.stringify(a2.closes));

// DCA: precio constante => ganancia 0
const flatTimes: number[] = [];
const flatCloses: number[] = [];
const end = new Date(2026, 10, 6).getTime();
for (let i = 400; i >= 0; i--) {
  flatTimes.push(end - i * 86400000);
  flatCloses.push(100);
}
const dcaFlat = simulateDca({ times: flatTimes, closes: flatCloses }, 1000, 12);
check('dca precio constante: ganancia 0', Math.abs(dcaFlat.gainPct) < 1e-9 && dcaFlat.invested === dcaFlat.buys * 1000);
check('dca compras entre 12 y 13', dcaFlat.buys >= 12 && dcaFlat.buys <= 13, `buys=${dcaFlat.buys}`);

// DCA: precio que se duplica linealmente => DCA rinde menos que aporte unico inicial
const rampCloses = flatTimes.map((_, i) => 100 + i);
const dcaRamp = simulateDca({ times: flatTimes, closes: rampCloses }, 1000, 12);
check('dca en tendencia alcista < aporte unico', dcaRamp.gainPct < dcaRamp.lumpGainPct && dcaRamp.gainPct > 0);

if (failed > 0) {
  console.error(`\n${failed} prueba(s) fallaron`);
  process.exit(1);
}
console.log('\nTodas las pruebas pasaron');
