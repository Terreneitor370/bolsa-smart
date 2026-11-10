import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { verdictColor } from '../lib/theme';
import { Signal } from '../lib/types';

export function SignalBadge({ signal, large = false }: { signal: Signal; large?: boolean }) {
  const color = verdictColor(signal.verdict);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '22' }, large && styles.large]}>
      <Text style={[styles.text, { color }, large && styles.textLarge]}>{signal.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  large: { paddingHorizontal: 16, paddingVertical: 6 },
  text: { fontSize: 12, fontWeight: '700' },
  textLarge: { fontSize: 16 },
});
