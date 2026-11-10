# Bolsa Smart

App movil + smartwatch (Wear OS) que resume en un puntaje de 0 a 100 si una accion o ETF esta atractivo para entrar, con reglas simples y explicables. No ejecuta operaciones: la compra se hace en la casa de bolsa que elija el usuario (GBM u otra autorizada por la CNBV).

## Estructura

```
bolsa-smart/
  shared/      Logica compartida (se edita SOLO aqui)
    signals.ts   RSI, promedios moviles, descuento vs maximo, puntaje y veredicto
    dca.ts       Simulador de aportaciones mensuales vs aporte unico
    market.ts    Descarga de precios (Yahoo Finance) -> cache -> demostracion
    demo.ts      Datos de demostracion deterministas (para que nunca falle la presentacion)
    catalog.ts   Lista de instrumentos
    theme.ts, format.ts, types.ts
  mobile/      App movil (Expo + React Native + TypeScript)
  watch/       App de reloj (Expo + React Native, pantalla redonda)
  scripts/
    sync-shared.js    Copia shared/ a mobile/src/lib y watch/src/lib
    test-signals.ts   Pruebas del motor de senales
```

`mobile/src/lib` y `watch/src/lib` son copias generadas. Edita en `shared/` y corre `npm run sync`.

## Primeros pasos (PowerShell)

```powershell
cd bolsa-smart
npm install                      # solo para correr las pruebas (tsx)
npm run test                     # debe decir "Todas las pruebas pasaron"
npm --prefix mobile install
npm --prefix watch install
```

### App movil

```powershell
npm run mobile                   # sincroniza shared/ y abre Expo; escanea el QR con Expo Go
```

### App del reloj (Wear OS)

Expo Go no existe en Wear OS, asi que se compila como app Android normal, igual que en "Donde lo deje":

1. En Android Studio crea un emulador Wear OS (Device Manager > Wear OS > Large Round) y enciendelo.
2. Con el emulador abierto:

```powershell
cd watch
npx expo prebuild --platform android
npx expo run:android
```

Si tienes varios dispositivos conectados (telefono + emulador) elige el emulador del reloj cuando lo pida.

Alternativa sin Android Studio: `npx eas-cli build -p android --profile preview` genera un APK instalable con `adb install`.

Controles en el reloj: toque corto = siguiente instrumento, toque largo = actualizar.

### Plan B para la presentacion

- La pestana "Reloj" de la app movil simula el reloj. Sirve si el emulador falla.
- El interruptor "Modo demostracion" fuerza datos de ejemplo (cubren los tres veredictos: verde, ambar y rojo). Activalo si no hay internet en el salon.
- Si la fuente de datos falla sola, la app cae a datos guardados y luego a demostracion, y lo avisa en pantalla.

## Como funciona el puntaje

Parte de 50 y ajusta con cuatro reglas:

| Regla | Efecto |
|---|---|
| RSI 14 dias: menor a 30 / 30-40 / 40-60 / 60-70 / mayor a 70 | +20 / +10 / 0 / -10 / -20 |
| Distancia al maximo de 52 semanas: menos de 3% / 3-10% / 10-25% / mas de 25% | -10 / +5 / +15 / +5 |
| Precio contra promedio de 200 dias: sobre / bajo | +10 / -10 |
| Promedio de 50 contra 200 dias: sobre / bajo | +5 / -5 |

Veredicto: 65 o mas = Buen momento (verde), 40 a 64 = Neutral (ambar), menos de 40 = Esperar (rojo). Cada senal muestra en pantalla las razones que la produjeron.

## Limitaciones conocidas

- La fuente de datos (Yahoo Finance) no es oficial: puede fallar o limitar solicitudes. Para produccion, usar un proveedor con llave (Twelve Data, Finnhub, Alpha Vantage) detras de un backend propio.
- Verifica los simbolos mexicanos (`.MX`) en `shared/catalog.ts` antes de presentar; si alguno no responde, ese instrumento cae a demostracion.
- No hay API publica de GBM para operar; la app solo informa.
- El puntaje es una heuristica educativa, no una prediccion ni asesoria financiera.

## Siguientes pasos sugeridos

1. Alertas: notificacion local cuando un instrumento cruce 65 (se replica en el reloj emparejado).
2. Perfil de riesgo y horizonte (3 preguntas) que ajusten los umbrales.
3. Backend propio (Node) para ocultar llaves de API, guardar historial de senales y enviar notificaciones push.
4. Lista personalizada de instrumentos y busqueda por simbolo.
5. Comparar el puntaje contra aportar mensual en un backtest mas largo (5 a 10 anos).
