export type Verdict = 'comprar' | 'neutral' | 'esperar';
export type Source = 'live' | 'cache' | 'demo';

export interface Asset {
  /** Simbolo tal como lo entiende Yahoo Finance (ej. VOO, WALMEX.MX) */
  symbol: string;
  /** Simbolo corto para mostrar en pantalla */
  ticker: string;
  name: string;
  kind: 'ETF' | 'Accion';
  market: 'EE.UU.' | 'Mexico';
  currency: 'USD' | 'MXN';
}

export interface Series {
  /** Marcas de tiempo en milisegundos */
  times: number[];
  /** Precios de cierre diarios */
  closes: number[];
}

export interface MarketData extends Series {
  asset: Asset;
  price: number;
  source: Source;
  fetchedAt: number;
}

export interface Signal {
  /** 0 a 100. Mientras mas alto, mas atractiva la entrada segun las reglas */
  score: number;
  verdict: Verdict;
  label: string;
  advice: string;
  price: number;
  rsi: number | null;
  sma50: number | null;
  sma200: number | null;
  /** Fraccion respecto al maximo de 52 semanas (ej. -0.12 = 12% abajo) */
  drawdown: number;
  reasons: string[];
}

export interface DcaResult {
  buys: number;
  invested: number;
  value: number;
  gainPct: number;
  lumpValue: number;
  lumpGainPct: number;
}
