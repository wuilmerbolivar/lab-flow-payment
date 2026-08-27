# LAB-006.1 — Pago en Sandbox y consulta posterior del estado

## Objetivo

Comprobar qué ocurre con una orden de Flow Sandbox después de realizar un pago
simulado y consultar nuevamente su estado mediante el endpoint
`payment/getStatus`.

El objetivo principal es observar la transición de una orden pendiente a una
orden pagada y analizar los datos que Flow incorpora en `paymentData`.

---

## Contexto

En los laboratorios anteriores se comprobó:

- La creación de una orden mediante `payment/create`.
- La generación del Checkout.
- La recepción de solicitudes HTTP.
- El funcionamiento básico de un callback.
- La consulta del estado de una orden mediante `payment/getStatus`.

En LAB-005 se observó una orden con:

```text
status: 1
```

y `paymentData` sin información de pago.

En este laboratorio se realizará un pago simulado sobre una nueva orden y se
consultará nuevamente su estado.

---

## Entorno

Todas las pruebas se realizan exclusivamente contra:

```text
Flow Sandbox
https://sandbox.flow.cl/
```

No se utilizan credenciales ni operaciones de producción.

---

## Paso 1 — Crear una nueva orden

Se utilizó el laboratorio de creación de órdenes:

```bash
npm run lab:001
```

Resultado:

```text
LAB-001 — Quickstart Flow
Orden: d369e457-3c5e-4d4d-b679-6564ee281451
Enviando solicitud a Flow Sandbox...
HTTP: 200
Respuesta: {
  token: '4207C7B0CA8F932BA325F3B2439A4BB9945XXXXX',
  url: 'https://sandbox.flow.cl/app/web/pay.php',
  flowOrder: 9941858
}
```

El token completo se omite de esta documentación.

La creación de la orden fue exitosa:

```text
HTTP: 200
```

La orden generada fue:

```text
flowOrder: 9941858
```

---

## Paso 2 — Estado inicial

Antes de realizar el pago, la orden se encontraba en estado pendiente.

El estado inicial observado en las pruebas anteriores corresponde a:

```text
status: 1
```

En este laboratorio el objetivo es comprobar qué ocurre después de completar
el pago.

---

## Paso 3 — Acceso al Checkout

A partir de la respuesta de `payment/create` se obtuvo la URL del Checkout:

```text
https://sandbox.flow.cl/app/web/pay.php?token=...
```

Se abrió esta URL en el navegador para acceder al flujo de pago de Flow
Sandbox.

El Checkout mostró la información correspondiente a la orden y permitió
seleccionar un medio de pago.

---

## Paso 4 — Pago simulado

Se realizó un pago utilizando el entorno de simulación de Flow Sandbox.

El pago fue procesado correctamente por el entorno de pruebas.

No se utilizaron datos financieros reales.

---

## Paso 5 — Consulta posterior

Después de completar el pago se consultó nuevamente el estado utilizando el
token de la orden:

```bash
TOKEN="TOKEN_SANITIZADO" npm run lab:005
```

Resultado:

```text
LAB-005 — Consulta de estado
Token: 4207C7B0CA8F...
Consultando Flow Sandbox...
HTTP: 200
```

La consulta fue procesada correctamente.

---

## Respuesta obtenida

Respuesta sanitizada:

```text
{
  flowOrder: 9941858,
  commerceOrder: 'd369e457-3c5e-4d4d-b679-6564ee281451',
  requestDate: '2026-08-27 14:22:26',
  status: 2,
  subject: 'Laboratorio Flow Payment',
  currency: 'PEN',
  amount: '350',
  payer: 'wuilmeralexanderbolivar@gmail.com',
  optional: null,
  pending_info: {
    media: null,
    date: null
  },
  paymentData: {
    date: '2026-08-27 14:24:32',
    media: 'TC',
    conversionDate: null,
    conversionRate: null,
    amount: '350.00',
    currency: 'PEN',
    fee: '13.05',
    balance: 334.59999999999997,
    transferDate: '2026-09-01 00:00:00',
    taxes: 2.35
  },
  merchantId: null
}
```

---

## Resultado principal

La orden pasó de un estado pendiente a un estado pagado.

```text
ANTES DEL PAGO

status: 1
```

Después del pago:

```text
DESPUÉS DEL PAGO

status: 2
```

Esto demuestra que el estado de la orden cambia como consecuencia del pago
realizado en Sandbox.

---

## Cambios observados en `paymentData`

Antes del pago, los campos relacionados con el pago no contenían información:

```text
paymentData:
  date: null
  media: null
  amount: null
  currency: null
  fee: null
  balance: null
  transferDate: null
```

Después del pago, Flow proporcionó información sobre la operación:

```text
paymentData:
  date: '2026-08-27 14:24:32'
  media: 'TC'
  amount: '350.00'
  currency: 'PEN'
  fee: '13.05'
  balance: 334.59999999999997
  transferDate: '2026-09-01 00:00:00'
  taxes: 2.35
```

---

## Observaciones

### Medio de pago

El campo:

```text
media: 'TC'
```

indica el medio utilizado durante la simulación.

En este experimento se utilizó una tarjeta de crédito/débito del entorno
Sandbox.

---

### Fecha del pago

Flow informó:

```text
date: '2026-08-27 14:24:32'
```

Este campo permite identificar cuándo fue registrado el pago.

---

### Monto pagado

El monto registrado fue:

```text
amount: '350.00'
```

y la moneda:

```text
currency: 'PEN'
```

Esto coincide con la orden creada originalmente.

---

### Comisión

La respuesta incluye:

```text
fee: '13.05'
```

Este valor aparece como información asociada al pago.

En este laboratorio no se analiza todavía cómo Flow calcula este importe.

---

### Impuestos

La respuesta también contiene:

```text
taxes: 2.35
```

El significado y cálculo detallado de este valor quedan fuera del alcance
actual.

---

### Balance

Flow informó:

```text
balance: 334.59999999999997
```

Este valor resulta especialmente interesante porque representa un número
decimal con una gran cantidad de posiciones después del punto.

No se realizará todavía un análisis sobre precisión numérica, representación
de números decimales o manejo monetario.

Ese comportamiento será investigado en un laboratorio posterior dedicado al
manejo de valores monetarios.

---

### Fecha de transferencia

La respuesta incluye:

```text
transferDate: '2026-09-01 00:00:00'
```

Este valor es diferente de la fecha en la que se registró el pago.

Por el momento solamente registramos la diferencia observada.

El significado operativo de esta fecha y su relación con la liquidación de
fondos se investigará posteriormente.

---

## Comparación

| Elemento                   | Antes del pago | Después del pago      |
| -------------------------- | -------------- | --------------------- |
| `status`                   | `1`            | `2`                   |
| `paymentData.date`         | `null`         | Fecha del pago        |
| `paymentData.media`        | `null`         | `TC`                  |
| `paymentData.amount`       | `null`         | `350.00`              |
| `paymentData.currency`     | `null`         | `PEN`                 |
| `paymentData.fee`          | `null`         | `13.05`               |
| `paymentData.balance`      | `null`         | `334.59999999999997`  |
| `paymentData.transferDate` | `null`         | `2026-09-01 00:00:00` |
| `paymentData.taxes`        | `null`         | `2.35`                |

---

## Flujo completo observado

El flujo construido durante los laboratorios puede representarse de forma
simplificada:

```text
1. Crear orden
      |
      v
payment/create
      |
      v
Token + Checkout
      |
      v
2. Abrir Checkout
      |
      v
Flow Sandbox
      |
      v
3. Realizar pago simulado
      |
      v
4. Consultar estado
      |
      v
payment/getStatus
      |
      v
status: 2
      |
      v
paymentData disponible
```

---

## Relación con laboratorios anteriores

Este experimento utiliza componentes desarrollados y comprobados previamente.

```text
LAB-001
Creación de orden
        |
        v
LAB-002
Exploración del Checkout
        |
        v
LAB-005
Consulta de estado
        |
        v
LAB-006
Pago + consulta posterior
```

Esto permite comprobar que los experimentos anteriores no son pruebas
aisladas, sino componentes que pueden combinarse para construir un flujo más
completo.

---

## Resultado

**EXPERIMENTO EXITOSO**

Se consiguió:

* Crear una nueva orden en Flow Sandbox.
* Obtener correctamente su `token`.
* Obtener su `flowOrder`.
* Acceder al Checkout.
* Realizar un pago simulado.
* Consultar nuevamente la orden.
* Obtener una respuesta HTTP `200`.
* Observar `status: 2`.
* Comprobar que `paymentData` se completa después del pago.
* Identificar el medio de pago utilizado.
* Observar monto, moneda, comisión, impuestos y balance.
* Observar una fecha de transferencia diferente de la fecha del pago.

---

## Aprendizajes

La principal conclusión del experimento es que consultar una orden antes y
después del pago permite observar cambios en su información.

El flujo básico comprobado es:

```text
Crear → Pagar → Consultar
```

También se comprobó que `paymentData` proporciona información adicional una vez
que el pago ha sido registrado.

---

## Observaciones para futuros laboratorios

Durante el experimento aparecieron varios elementos que serán investigados
posteriormente:

### 1. Precisión de valores monetarios

Se obtuvo:

```text
334.59999999999997
```

Será necesario investigar por qué aparece este valor y cómo deben manejarse
correctamente los importes monetarios en una aplicación.

### 2. Comisión e impuestos

Se observaron:

```text
fee: 13.05
taxes: 2.35
```

Todavía no se conoce mediante este experimento cómo se calculan estos valores.

### 3. Transferencia

Se observó:

```text
transferDate: '2026-09-01 00:00:00'
```

Será necesario investigar posteriormente el concepto de liquidación o
transferencia asociado a este campo.

### 4. Estados de una orden

Hasta este momento se han observado:

```text
1 → pendiente
2 → pagada
```

Los demás estados serán investigados posteriormente mediante experimentos
controlados.

---

## Limitaciones

Este laboratorio no pretende determinar:

* La fórmula utilizada para calcular `fee`.
* La fórmula utilizada para calcular `taxes`.
* El cálculo exacto de `balance`.
* El significado completo de `transferDate`.
* Todos los estados posibles de una orden.
* El funcionamiento completo de callbacks.
* La validación criptográfica de callbacks.
* Idempotencia.
* Persistencia en una base de datos.
* Manejo avanzado de errores.
* Integración con un sistema real de comercio.

Estos temas quedan para laboratorios posteriores.

---

## Seguridad

No se almacenan en este documento:

* API Key.
* Secret Key.
* Token completo.
* Datos financieros reales.
* Credenciales de pago.

Todas las pruebas fueron realizadas utilizando Flow Sandbox.

---

## Estado

**Completado**

LAB-006.1 demuestra exitosamente el flujo básico:

```text
Crear orden → realizar pago Sandbox → consultar estado → obtener status 2
```

Además, permitió comprobar que `paymentData` cambia después de que el pago es
registrado.
