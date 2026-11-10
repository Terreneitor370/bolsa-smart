import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { Disclaimer } from '../components/Disclaimer';
import { SignalBadge } from '../components/SignalBadge';
import { Sparkline } from '../components/Sparkline';
import { money, pct, timeAgo } from '../lib/format';
import { colors, verdictColor } from '../lib/theme';
import { Item } from '../item';

interface Props {
  items: Item[];
  loading: boolean;
  demo: boolean;
  onToggleDemo: (value: boolean) => void;
  onRefresh: () => void;
  onSelect: (symbol: string) => void;
}

export function MarketScreen({ items, loading, demo, onToggleDemo, onRefresh, onSelect }: Props) {
  const best = items.length ? items.reduce((a, b) => (b.signal.score > a.signal.score ? b : a)) : null;
  const anyDemo = items.some((i) => i.data.source === 'demo');
  const newest = items.length ? Math.max(...items.map((i) => i.data.fetchedAt)) : 0;

  const header = (
    <View>
      <Text style={styles.title}>Bolsa Smart</Text>
      <Text style={styles.subtitle}>Senal de entrada para acciones y ETFs</Text>

      {anyDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mostrando datos de demostracion (sin conexion o fuente no disponible). No son precios reales.
          </Text>
        </View>
      )}

      {best && (
        <Pressable style={styles.hero} onPress={() => onSelect(best.data.asset.symbol)}>
          <Text style={styles.heroLabel}>MEJOR SENAL HOY</Text>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTicker}>{best.data.asset.ticker}</Text>
              <Text style={styles.heroName}>{best.data.asset.name}</Text>
            </View>
            <Text style={[styles.heroScore, { color: verdictColor(best.signal.verdict) }]}>{best.signal.score}</Text>
          </View>
          <SignalBadge signal={best.signal} />
          <Text style={styles.heroAdvice}>{best.signal.advice}</Text>
        </Pressable>
      )}

      <View style={styles.demoRow}>
        <Text style={styles.demoRowText}>Modo demostracion</Text>
        <Switch value={demo} onValueChange={onToggleDemo} />
      </View>
      <Text style={styles.sectionTitle}>Instrumentos</Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.data.asset.symbol}
      ListHeaderComponent={header}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} /> : undefined}
      ListFooterComponent={
        <View>
          {newest > 0 && <Text style={styles.updated}>Actualizado {timeAgo(newest)}</Text>}
          <Disclaimer />
        </View>
      }
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.accent} />}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => {
        const { data, signal } = item;
        const first = data.closes[0];
        const change = (data.price / first - 1) * 100;
        return (
          <Pressable style={styles.row} onPress={() => onSelect(data.asset.symbol)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ticker}>{data.asset.ticker}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {data.asset.name}
              </Text>
              <View style={{ marginTop: 6 }}>
                <SignalBadge signal={signal} />
              </View>
            </View>
            <View style={styles.spark}>
              <Sparkline values={data.closes.slice(-90)} width={70} height={34} color={verdictColor(signal.verdict)} />
            </View>
            <View style={styles.right}>
              <Text style={styles.price}>{money(data.price, data.asset.currency)}</Text>
              <Text style={[styles.change, { color: change >= 0 ? colors.green : colors.red }]}>{pct(change)} 1a</Text>
              <Text style={styles.score}>Puntaje {signal.score}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginBottom: 14 },
  demoBanner: { backgroundColor: colors.amber + '22', borderColor: colors.amber, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12 },
  demoText: { color: colors.amber, fontSize: 12 },
  hero: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  heroLabel: { color: colors.muted, fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  heroTicker: { color: colors.text, fontSize: 24, fontWeight: '800' },
  heroName: { color: colors.muted, fontSize: 13 },
  heroScore: { fontSize: 44, fontWeight: '800' },
  heroAdvice: { color: colors.text, fontSize: 13, marginTop: 10, lineHeight: 18 },
  demoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  demoRowText: { color: colors.muted, fontSize: 13 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  ticker: { color: colors.text, fontSize: 17, fontWeight: '700' },
  name: { color: colors.muted, fontSize: 12 },
  spark: { marginHorizontal: 8 },
  right: { alignItems: 'flex-end', minWidth: 96 },
  price: { color: colors.text, fontSize: 13, fontWeight: '600' },
  change: { fontSize: 12, marginTop: 2 },
  score: { color: colors.muted, fontSize: 11, marginTop: 2 },
  updated: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 6 },
});
