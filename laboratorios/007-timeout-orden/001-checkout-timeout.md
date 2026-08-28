# LAB-007 — Timeout de orden

## Objetivo

Experimentar el comportamiento del parámetro `checkout_timeout` al crear una orden en Flow Sandbox y determinar cómo afecta al proceso de pago y al estado de la orden.

El experimento busca diferenciar el tiempo transcurrido desde la creación/apertura del Checkout del tiempo asociado al proceso efectivo de pago.

---

## Hipótesis

`checkout_timeout` permite establecer el tiempo disponible para completar el proceso de pago dentro del Checkout.

Se busca comprobar si el transcurso de este tiempo provoca la expiración de la orden independientemente de la interacción del usuario o si el comportamiento está relacionado con el inicio del proceso de pago mediante la selección de un medio de pago.

---

## Procedimiento

Las órdenes fueron creadas mediante:

```bash
npm run lab:001
```

El estado de las órdenes fue consultado mediante:

```bash
npm run lab:005
```

El experimento fue ejecutado mediante:

```bash
bash laboratorios/007-timeout-orden/main.sh
```

Se utilizaron diferentes valores de `checkout_timeout`, incluyendo:

* 10 segundos
* 50 segundos

Las pruebas se realizaron sobre Flow Sandbox.

---

## Resultados

### Prueba 1 — 10 segundos sin seleccionar medio de pago

Se creó una orden con:

```text
checkout_timeout = 10
```

El Checkout permaneció abierto sin seleccionar ningún medio de pago.

Estado inicial:

```text
status = 1
```

Después de 10 segundos:

```text
status = 4
```

Resultado:

```text
1 → 4
```

La transición fue observada y confirmada mediante una nueva consulta de estado.

---

### Prueba 2 — 50 segundos sin seleccionar medio de pago

Se creó una orden con:

```text
checkout_timeout = 50
```

El Checkout permaneció abierto sin seleccionar ningún medio de pago durante los 50 segundos configurados.

Estado inicial:

```text
status = 1
```

Estado después del período:

```text
status = 1
```

Resultado:

```text
1 → 1
```

No se observó una transición de estado durante este experimento.

---

### Prueba 3 — 50 segundos con Yape

Se creó una orden con:

```text
checkout_timeout = 50
```

Durante el proceso de Checkout se seleccionó Yape como medio de pago.

Posteriormente se observó:

```text
status = 2
```

y la respuesta de estado registró:

```text
paymentData.media = "Pago con YAPE"
paymentData.amount = "350.00"
paymentData.currency = "PEN"
paymentData.fee = "13.05"
```

Resultado:

```text
1 → 2
```

Esto evidencia que la selección del medio de pago inicia una etapa diferente del flujo de la orden, en la que Flow registra información asociada al pago.

---

## Conclusiones

El experimento permite concluir que `checkout_timeout` es un parámetro configurable al crear la orden y está relacionado con el tiempo disponible para completar el proceso de pago en el Checkout.

Las pruebas muestran una diferencia importante entre:

1. Mantener el Checkout abierto sin seleccionar ningún medio de pago.
2. Iniciar el proceso de pago seleccionando un medio como Yape.

Cuando no se selecciona ningún medio de pago, una orden puede permanecer en `status = 1` incluso después de transcurrido el período configurado, como ocurrió en la prueba de 50 segundos.

También se observó que, al seleccionar Yape, la orden pasa a `status = 2` y comienza a registrar información en `paymentData`, demostrando que el flujo de pago ha sido iniciado.

Por tanto, la evidencia experimental indica que el comportamiento de `checkout_timeout` está asociado al proceso de pago iniciado dentro del Checkout y no debe interpretarse simplemente como un TTL que comienza a contar desde la creación de la `flowOrder`.

### Alcance de la evidencia

Las pruebas permiten establecer que el timeout está asociado al proceso de pago y que su duración es configurable.

Sin embargo, estas pruebas no permiten determinar con precisión de milisegundos el instante interno en el que Flow comienza a contabilizar el `checkout_timeout`.

Para demostrar específicamente que el contador comienza exactamente en el momento en que el usuario selecciona el medio de pago, sería necesario realizar una prueba temporal controlada midiendo el intervalo desde la selección del medio hasta la expiración.

---

## Evidencia

La evidencia completa de las pruebas se encuentra en:

```text
007-timeout-orden.log
```

El experimento puede reproducirse mediante:

```bash
bash laboratorios/007-timeout-orden/main.sh
```

---

## Estado del laboratorio

**CERRADO — EXPERIMENTALMENTE VALIDADO**

### Hallazgos confirmados

* `checkout_timeout` es configurable.
* Se validaron valores de 10 y 50 segundos.
* El Checkout puede permanecer en `status = 1` sin seleccionar un medio de pago.
* Se observó la transición `1 → 4` asociada a la expiración.
* Se observó la transición `1 → 2` al iniciar un pago mediante Yape.
* La selección del medio de pago provoca el registro de información en `paymentData`.
* El comportamiento del timeout debe analizarse como parte del flujo de Checkout y no únicamente como un TTL desde la creación de la orden.

### Pendiente / no demostrado

No se ha demostrado experimentalmente el instante exacto en el que Flow comienza a contabilizar internamente el `checkout_timeout`.

Este punto queda fuera del alcance de LAB-007 y puede investigarse en un experimento posterior si resulta necesario.
