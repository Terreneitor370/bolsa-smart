import { Asset } from './types';

/**
 * Catalogo inicial. Para agregar un instrumento basta con anadir una fila.
 * Los simbolos mexicanos llevan sufijo .MX en Yahoo Finance.
 * Verifica cada simbolo antes de la presentacion: si uno falla, la app
 * cae automaticamente a datos de demostracion para ese instrumento.
 */
export const CATALOG: Asset[] = [
  { symbol: 'VOO', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', kind: 'ETF', market: 'EE.UU.', currency: 'USD' },
  { symbol: 'QQQ', ticker: 'QQQ', name: 'Invesco QQQ (Nasdaq 100)', kind: 'ETF', market: 'EE.UU.', currency: 'USD' },
  { symbol: 'VT', ticker: 'VT', name: 'Vanguard Total World ETF', kind: 'ETF', market: 'EE.UU.', currency: 'USD' },
  { symbol: 'AAPL', ticker: 'AAPL', name: 'Apple', kind: 'Accion', market: 'EE.UU.', currency: 'USD' },
  { symbol: 'NAFTRACISHRS.MX', ticker: 'NAFTRAC', name: 'NAFTRAC (IPC Mexico)', kind: 'ETF', market: 'Mexico', currency: 'MXN' },
  { symbol: 'WALMEX.MX', ticker: 'WALMEX', name: 'Walmart de Mexico', kind: 'Accion', market: 'Mexico', currency: 'MXN' },
  { symbol: 'GFNORTEO.MX', ticker: 'GFNORTE', name: 'Banorte', kind: 'Accion', market: 'Mexico', currency: 'MXN' },
  { symbol: 'AMXB.MX', ticker: 'AMX', name: 'America Movil B', kind: 'Accion', market: 'Mexico', currency: 'MXN' },
];
