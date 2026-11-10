import { MarketData, Signal } from './lib/types';

/** Un instrumento con sus datos de mercado y su senal ya calculada */
export interface Item {
  data: MarketData;
  signal: Signal;
}
