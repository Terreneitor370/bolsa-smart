import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Disclaimer } from '../components/Disclaimer';
import { ScoreBar } from '../components/ScoreBar';
import { SignalBadge } from '../components/SignalBadge';
import { Sparkline } from '../components/Sparkline';
import { simulateDca } from '../lib/dca';
import { money, pct } from '../lib/format';
import { colors, verdictColor } from '../lib/theme';
import { Item } from '../item';

const AMOUNTS = [500, 1000, 2000];

export function DetailScreen({ item, onBack }: { item: Item; onBack: () => void }) {
  const { data, signal } = item;
  const { width } = useWindowDimensions();
  const [amount, setAmount] = useState(1000);
  const cur = data.asset.currency;

  const dca = useMemo(() => simulateDca(data, amount, 12), [data, amount]);
  const color = verdictColor(signal.verdict);

  const indicators: Array<[string, string]> = [
    ['RSI (14 dias)', signal.rsi !== null ? signal.rsi.toFixed(0) : 'n/d'],
    ['Promedio 50 dias', signal.sma50 !== null ? money(signal.sma50, cur) : 'n/d'],
    ['Promedio 200 dias', signal.sma200 !== null ? money(signal.sma200, cur) : 'n/d'],
    ['Vs. maximo 52 sem.', pct(signal.drawdown * 100)],
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>Volver</Text>
      </Pressable>

      <Text style={styles.ticker}>{data.asset.ticker}</Text>
      <Text style={styles.name}>
        {data.asset.name} · {data.asset.kind} · {data.asset.market}
      </Text>
      <Text style={styles.price}>{money(data.price, cur)}</Text>
      {data.source !== 'live' && (
        <Text style={styles.source}>
          {data.source === 'demo' ? 'Datos de demostracion, no son precios reales.' : 'Ultimo dato guardado en el telefono.'}
        </Text>
      )}

      <View style={styles.card}>
        <SignalBadge signal={signal} large />
        <View style={{ height: 12 }} />
        <ScoreBar signal={signal} />
        <Text style={styles.advice}>{signal.advice}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ultimo ano</Text>
        <Sparkline values={data.closes} width={width - 32 - 32} height={120} color={color} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Indicadores</Text>
        <View style={styles.grid}>
          {indicators.map(([label, value]) => (
            <View key={label} style={styles.cell}>
              <Text style={styles.cellLabel}>{label}</Text>
              <Text style={styles.cellValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Por que esta senal</Text>
        {signal.reasons.map((r, i) => (
          <Text key={i} style={styles.reason}>
            · {r}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Simulador: aportar cada mes</Text>
        <Text style={styles.cellLabel}>Que habria pasado en los ultimos 12 meses</Text>
        <View style={styles.chips}>
          {AMOUNTS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setAmount(a)}
              style={[styles.chip, a === amount && { borderColor: colors.accent, backgroundColor: colors.accent + '22' }]}
            >
              <Text style={[styles.chipText, a === amount && { color: colors.accent }]}>{money(a, cur).replace('.00', '')}</Text>
            </Pressable>
          ))}
        </View>
        {dca.buys > 0 ? (
          <View>
            <Text style={styles.reason}>Aportaciones: {dca.buys}, total invertido {money(dca.invested, cur)}</Text>
            <Text style={styles.reason}>
              Aportando cada mes: {money(dca.value, cur)} ({pct(dca.gainPct)})
            </Text>
            <Text style={styles.reason}>
              Todo el primer dia: {money(dca.lumpValue, cur)} ({pct(dca.lumpGainPct)})
            </Text>
            <Text style={styles.note}>
              Resultado pasado, no garantiza nada. Aportar por partes reduce el riesgo de entrar justo en un mal momento.
            </Text>
          </View>
        ) : (
          <Text style={styles.reason}>No hay suficiente historial para simular.</Text>
        )}
      </View>

      <Disclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  back: { color: colors.accent, fontSize: 15, marginBottom: 10 },
  ticker: { color: colors.text, fontSize: 30, fontWeight: '800' },
  name: { color: colors.muted, fontSize: 13, marginTop: 2 },
  price: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  source: { color: colors.amber, fontSize: 12, marginBottom: 4 },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 12 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  advice: { color: colors.text, fontSize: 13, lineHeight: 18, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '50%', paddingVertical: 6 },
  cellLabel: { color: colors.muted, fontSize: 12 },
  cellValue: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 2 },
  reason: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 6 },
  chips: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  note: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 10 },
});
