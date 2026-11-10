import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Item } from './src/item';
import { CATALOG } from './src/lib/catalog';
import { loadAll } from './src/lib/market';
import { computeSignal } from './src/lib/signals';
import { colors } from './src/lib/theme';
import { MarketData } from './src/lib/types';
import { DetailScreen } from './src/screens/DetailScreen';
import { InfoScreen } from './src/screens/InfoScreen';
import { MarketScreen } from './src/screens/MarketScreen';
import { WatchPreviewScreen } from './src/screens/WatchPreviewScreen';

type Tab = 'mercado' | 'reloj' | 'info';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'mercado', label: 'Mercado' },
  { key: 'reloj', label: 'Reloj' },
  { key: 'info', label: 'Acerca de' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('mercado');
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loadAll(CATALOG, demo));
    } finally {
      setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    load();
  }, [load]);

  // Boton atras de Android: cierra el detalle en lugar de salir de la app
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selected) {
        setSelected(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [selected]);

  const items: Item[] = useMemo(() => data.map((d) => ({ data: d, signal: computeSignal(d.closes) })), [data]);
  const selectedItem = items.find((i) => i.data.asset.symbol === selected) ?? null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.body}>
          {selectedItem ? (
            <DetailScreen item={selectedItem} onBack={() => setSelected(null)} />
          ) : tab === 'mercado' ? (
            <MarketScreen
              items={items}
              loading={loading}
              demo={demo}
              onToggleDemo={setDemo}
              onRefresh={load}
              onSelect={setSelected}
            />
          ) : tab === 'reloj' ? (
            <WatchPreviewScreen items={items} />
          ) : (
            <InfoScreen />
          )}
        </View>

        {!selectedItem && (
          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
                <Text style={[styles.tabText, tab === t.key && styles.tabActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  tabActive: { color: colors.accent },
});
