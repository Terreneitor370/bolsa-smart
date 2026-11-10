import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { money } from '../lib/format';
import { colors, verdictColor } from '../lib/theme';
import { Item } from '../item';

/**
 * Simulacion de la pantalla del reloj dentro del telefono. Sirve para
 * presentar aunque no haya emulador o reloj fisico disponible.
 * La app real del reloj vive en la carpeta /watch y muestra lo mismo.
 */
export function WatchPreviewScreen({ items }: { items: Item[] }) {
  const sorted = [...items].sort((a, b) => b.signal.score - a.signal.score);
  const [index, setIndex] = useState(0);
  const current = sorted[index % Math.max(sorted.length, 1)];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Vista de reloj</Text>
      <Text style={styles.subtitle}>
        Asi se ve en el smartwatch. Toca la pantalla del reloj para cambiar de instrumento (ordenados por puntaje).
      </Text>

      {current && (
        <Pressable onPress={() => setIndex((i) => i + 1)} style={styles.bezel}>
          <View style={styles.face}>
            <Text style={styles.wTicker}>{current.data.asset.ticker}</Text>
            <Text style={[styles.wVerdict, { color: verdictColor(current.signal.verdict) }]}>{current.signal.label}</Text>
            <Text style={styles.wScore}>{current.signal.score}</Text>
            <Text style={styles.wPrice}>{money(current.data.price, current.data.asset.currency)}</Text>
            <Text style={styles.wDots}>
              {sorted.map((_, i) => (i === index % sorted.length ? '●' : '○')).join(' ')}
            </Text>
          </View>
        </Pressable>
      )}

      <Text style={styles.hint}>
        Instrumento {sorted.length ? (index % sorted.length) + 1 : 0} de {sorted.length}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, alignItems: 'center', paddingBottom: 40 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', alignSelf: 'flex-start' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 24, alignSelf: 'flex-start' },
  bezel: { width: 250, height: 250, borderRadius: 125, backgroundColor: '#1b2437', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#2b3858' },
  face: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  wTicker: { color: colors.muted, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  wVerdict: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  wScore: { color: colors.text, fontSize: 48, fontWeight: '800', lineHeight: 54 },
  wPrice: { color: colors.muted, fontSize: 12 },
  wDots: { color: colors.muted, fontSize: 9, marginTop: 8, letterSpacing: 2 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 20 },
});
