import AsyncStorage from '@react-native-async-storage/async-storage';
import { demoSeries } from './demo';
import { Asset, MarketData, Series } from './types';

const TIMEOUT_MS = 8000;
const CACHE_PREFIX = 'bolsa-smart:md:';

async function fetchLive(asset: Asset): Promise<Series> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(asset.symbol)}` +
    `?range=1y&interval=1d`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const stamps: number[] = result?.timestamp ?? [];
    const closeRaw: Array<number | null> = result?.indicators?.quote?.[0]?.close ?? [];

    const times: number[] = [];
    const closes: number[] = [];
    for (let i = 0; i < stamps.length; i++) {
      const c = closeRaw[i];
      if (typeof c === 'number' && isFinite(c)) {
        times.push(stamps[i] * 1000);
        closes.push(c);
      }
    }
    if (closes.length < 30) throw new Error('Datos insuficientes');
    return { times, closes };
  } finally {
    clearTimeout(timer);
  }
}

function build(asset: Asset, series: Series, source: MarketData['source'], fetchedAt: number): MarketData {
  return {
    asset,
    times: series.times,
    closes: series.closes,
    price: series.closes[series.closes.length - 1],
    source,
    fetchedAt,
  };
}

/**
 * Carga un instrumento. Orden: internet -> ultimo dato guardado -> demostracion.
 * Nunca lanza error, para que una falla de un simbolo no tire toda la pantalla.
 */
export async function loadAsset(asset: Asset, forceDemo = false): Promise<MarketData> {
  if (!forceDemo) {
    try {
      const series = await fetchLive(asset);
      const now = Date.now();
      AsyncStorage.setItem(CACHE_PREFIX + asset.symbol, JSON.stringify({ series, at: now })).catch(() => {});
      return build(asset, series, 'live', now);
    } catch {
      // continua al cache
    }
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + asset.symbol);
      if (raw) {
        const parsed = JSON.parse(raw) as { series: Series; at: number };
        if (parsed?.series?.closes?.length >= 30) return build(asset, parsed.series, 'cache', parsed.at);
      }
    } catch {
      // continua a demostracion
    }
  }
  return build(asset, demoSeries(asset.symbol), 'demo', Date.now());
}

export function loadAll(assets: Asset[], forceDemo = false): Promise<MarketData[]> {
  return Promise.all(assets.map((a) => loadAsset(a, forceDemo)));
}
