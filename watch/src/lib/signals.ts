import { Signal, Verdict } from './types';

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  let sum = 0;
  for (let i = values.length - period; i < values.length; i++) sum += values[i];
  return sum / period;
}

/** RSI de Wilder. Devuelve null si no hay suficientes datos. */
export function rsi(closes: number[], period = 14): number | null {
  if (closes.length <= period) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function verdictFor(score: number): { verdict: Verdict; label: string; advice: string } {
  if (score >= 65) {
    return {
      verdict: 'comprar',
      label: 'Buen momento',
      advice: 'Condiciones favorables para aportar. Considera entrar por partes.',
    };
  }
  if (score >= 40) {
    return {
      verdict: 'neutral',
      label: 'Neutral',
      advice: 'Sin ventaja clara. Si inviertes, hazlo con aportaciones periodicas pequenas.',
    };
  }
  return {
    verdict: 'esperar',
    label: 'Esperar',
    advice: 'El precio luce exigente o la tendencia es debil. Conviene esperar o aportar menos.',
  };
}

/**
 * Puntaje de atractivo de entrada, basado en reglas simples y explicables.
 * No predice el futuro: resume si el precio esta caro o barato respecto a su
 * propio historial reciente y si la tendencia larga lo acompana.
 */
export function computeSignal(closes: number[]): Signal {
  const price = closes[closes.length - 1];

  if (closes.length < 30) {
    return {
      score: 50,
      ...verdictFor(50),
      price,
      rsi: null,
      sma50: null,
      sma200: null,
      drawdown: 0,
      reasons: ['Datos insuficientes para calcular indicadores.'],
    };
  }

  let high = -Infinity;
  for (const c of closes) if (c > high) high = c;
  const drawdown = price / high - 1;
  const dd = drawdown * 100;

  const r = rsi(closes);
  const s50 = sma(closes, 50);
  const s200 = sma(closes, 200);

  let score = 50;
  const reasons: string[] = [];

  if (r !== null) {
    if (r < 30) {
      score += 20;
      reasons.push(`RSI ${r.toFixed(0)}: sobrevendido, el precio cayo rapido recientemente.`);
    } else if (r < 40) {
      score += 10;
      reasons.push(`RSI ${r.toFixed(0)}: impulso debil, zona de interes para comprar.`);
    } else if (r <= 60) {
      reasons.push(`RSI ${r.toFixed(0)}: zona neutral, sin exceso en ninguna direccion.`);
    } else if (r <= 70) {
      score -= 10;
      reasons.push(`RSI ${r.toFixed(0)}: impulso fuerte, el precio esta algo exigente.`);
    } else {
      score -= 20;
      reasons.push(`RSI ${r.toFixed(0)}: sobrecomprado, el precio subio demasiado rapido.`);
    }
  }

  if (dd > -3) {
    score -= 10;
    reasons.push('Esta a menos de 3% de su maximo de 52 semanas: poco descuento.');
  } else if (dd > -10) {
    score += 5;
    reasons.push(`Esta ${Math.abs(dd).toFixed(1)}% debajo de su maximo de 52 semanas: descuento ligero.`);
  } else if (dd >= -25) {
    score += 15;
    reasons.push(`Esta ${Math.abs(dd).toFixed(1)}% debajo de su maximo de 52 semanas: descuento relevante.`);
  } else {
    score += 5;
    reasons.push(
      `Caida profunda (${Math.abs(dd).toFixed(1)}% bajo su maximo): puede ser oportunidad, pero el riesgo es mayor.`,
    );
  }

  if (s200 !== null) {
    if (price > s200) {
      score += 10;
      reasons.push('Precio sobre su promedio de 200 dias: tendencia de largo plazo alcista.');
    } else {
      score -= 10;
      reasons.push('Precio bajo su promedio de 200 dias: tendencia de largo plazo bajista.');
    }
  }

  if (s50 !== null && s200 !== null) {
    if (s50 > s200) {
      score += 5;
      reasons.push('Promedio de 50 dias sobre el de 200: tendencia intermedia sana.');
    } else {
      score -= 5;
      reasons.push('Promedio de 50 dias bajo el de 200: tendencia intermedia debil.');
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    ...verdictFor(score),
    price,
    rsi: r,
    sma50: s50,
    sma200: s200,
    drawdown,
    reasons,
  };
}
