import { Verdict } from './types';

export const colors = {
  bg: '#0b1220',
  card: '#131c2e',
  border: '#1f2a44',
  text: '#e6edf7',
  muted: '#8a97b1',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  accent: '#38bdf8',
};

export function verdictColor(v: Verdict): string {
  if (v === 'comprar') return colors.green;
  if (v === 'neutral') return colors.amber;
  return colors.red;
}
