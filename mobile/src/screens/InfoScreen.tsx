import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Disclaimer } from '../components/Disclaimer';
import { colors } from '../lib/theme';

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: 'Que hace esta app',
    body: 'Resume en un puntaje de 0 a 100 si el precio de una accion o ETF esta atractivo para entrar, comparandolo contra su propio historial del ultimo ano. No ejecuta compras ni vende nada.',
  },
  {
    title: 'Como se calcula el puntaje',
    body: 'Parte de 50 y suma o resta segun cuatro reglas: RSI (si el precio subio o cayo demasiado rapido), distancia al maximo de 52 semanas (descuento), precio contra su promedio de 200 dias (tendencia larga) y promedio de 50 contra 200 dias (tendencia intermedia).',
  },
  {
    title: 'Que significan los colores',
    body: 'Verde, 65 o mas: buen momento para aportar por partes. Ambar, de 40 a 64: neutral. Rojo, menos de 40: conviene esperar o aportar menos.',
  },
  {
    title: 'Limites importantes',
    body: 'Nadie puede predecir el mejor momento exacto para invertir. Las senales usan solo precios pasados y no consideran noticias, resultados de empresas, impuestos, comisiones ni tu situacion personal. Para metas de largo plazo, aportar una cantidad fija cada mes suele ser mas robusto que intentar adivinar el momento.',
  },
  {
    title: 'Origen de los datos',
    body: 'Precios diarios de cierre de Yahoo Finance (fuente no oficial, puede fallar o tener retraso). Si no hay conexion, se usa el ultimo dato guardado y, en su defecto, datos de demostracion claramente marcados.',
  },
  {
    title: 'Para operar',
    body: 'La compra o venta se hace por separado en la casa de bolsa que elijas. Verifica que este autorizada por la CNBV y revisa comisiones, disponibilidad del instrumento y su horario antes de operar.',
  },
];

export function InfoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Acerca de</Text>
      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.card}>
          <Text style={styles.cardTitle}>{s.title}</Text>
          <Text style={styles.body}>{s.body}</Text>
        </View>
      ))}
      <Disclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 10 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  body: { color: colors.text, fontSize: 13, lineHeight: 19 },
});
