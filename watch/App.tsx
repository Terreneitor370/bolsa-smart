import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CATALOG } from './src/lib/catalog';
import { money } from './src/lib/format';
import { loadAll } from './src/lib/market';
import { computeSignal } from './src/lib/signals';
import { verdictColor } from './src/lib/theme';
import { MarketData, Signal } from './src/lib/types';

interface Item {
  data: MarketData;
  signal: Signal;
}

/**
 * App de reloj (Wear OS). Una sola pantalla redonda:
 * - Toque corto: siguiente instrumento (ordenados de mejor a peor puntaje)
 * - Toque largo: actualizar datos
 */
export default function App() {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height);
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loadAll(CATALOG));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items: Item[] = useMemo(
    () =>
      data
        .map((d) => ({ data: d, signal: computeSignal(d.closes) }))
        .sort((a, b) => b.signal.score - a.signal.score),
    [data],
  );

  const current = items.length ? items[index % items.length] : null;
  const color = current ? verdictColor(current.signal.verdict) : '#8a97b1';

  return (
    <View style={[styles.root, { width, height }]}>
      <StatusBar hidden />
      <Pressable
        style={[styles.face, { width: size, height: size, borderRadius: size / 2, paddingHorizontal: size * 0.14 }]}
        onPress={() => setIndex((i) => i + 1)}
        onLongPress={load}
      >
        {loading && !current ? (
          <ActivityIndicator color="#38bdf8" />
        ) : current ? (
          <>
            <Text style={styles.ticker}>{current.data.asset.ticker}</Text>
            <Text style={[styles.verdict, { color }]} numberOfLines={1} adjustsFontSizeToFit>
              {current.signal.label}
            </Text>
            <Text style={styles.score}>{current.signal.score}</Text>
            <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit>
              {money(current.data.price, current.data.asset.currency)}
            </Text>
            <Text style={styles.meta}>
              {current.data.source === 'demo' ? 'DEMO' : current.data.source === 'cache' ? 'GUARDADO' : 'EN VIVO'}
              {'  '}
              {(index % items.length) + 1}/{items.length}
            </Text>
          </>
        ) : (
          <Text style={styles.ticker}>Sin datos</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  face: { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  ticker: { color: '#8a97b1', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  verdict: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  score: { color: '#e6edf7', fontSize: 52, fontWeight: '800', lineHeight: 58 },
  price: { color: '#8a97b1', fontSize: 13 },
  meta: { color: '#5b6781', fontSize: 10, marginTop: 6, letterSpacing: 1 },
});
