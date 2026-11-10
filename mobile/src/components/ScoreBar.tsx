import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, verdictColor } from '../lib/theme';
import { Signal } from '../lib/types';

export function ScoreBar({ signal }: { signal: Signal }) {
  const color = verdictColor(signal.verdict);
  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.score, { color }]}>{signal.score}</Text>
        <Text style={styles.outOf}> / 100</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${signal.score}%`, backgroundColor: color }]} />
        {/* Marcas de los umbrales 40 y 65 */}
        <View style={[styles.mark, { left: '40%' }]} />
        <View style={[styles.mark, { left: '65%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  score: { fontSize: 40, fontWeight: '800' },
  outOf: { color: colors.muted, fontSize: 14 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  mark: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.bg },
});
