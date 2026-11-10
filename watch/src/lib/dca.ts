import { DcaResult, Series } from './types';

/**
 * Simula aportaciones mensuales iguales (DCA / costo promedio) durante los
 * ultimos `months` meses y las compara contra invertir todo el dinero el
 * primer dia del periodo.
 */
export function simulateDca(series: Series, monthlyAmount: number, months = 12): DcaResult {
  const { times, closes } = series;
  const last = closes.length - 1;
  const lastPrice = closes[last];

  const cutoff = new Date(times[last]);
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffMs = cutoff.getTime();

  let shares = 0;
  let invested = 0;
  let buys = 0;
  let lastKey = '';
  let firstPrice: number | null = null;

  for (let i = 0; i <= last; i++) {
    if (times[i] < cutoffMs) continue;
    if (firstPrice === null) firstPrice = closes[i];
    const d = new Date(times[i]);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key !== lastKey) {
      lastKey = key;
      shares += monthlyAmount / closes[i];
      invested += monthlyAmount;
      buys++;
    }
  }

  if (invested === 0 || firstPrice === null) {
    return { buys: 0, invested: 0, value: 0, gainPct: 0, lumpValue: 0, lumpGainPct: 0 };
  }

  const value = shares * lastPrice;
  const lumpValue = (invested / firstPrice) * lastPrice;

  return {
    buys,
    invested,
    value,
    gainPct: (value / invested - 1) * 100,
    lumpValue,
    lumpGainPct: (lumpValue / invested - 1) * 100,
  };
}
