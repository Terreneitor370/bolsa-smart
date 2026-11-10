import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../lib/theme';

export function Disclaimer() {
  return (
    <Text style={styles.text}>
      Informacion con fines educativos. No es asesoria financiera ni una recomendacion personalizada de inversion.
      Invertir implica riesgo de perdida. Las senales no predicen el futuro.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 16 },
});
