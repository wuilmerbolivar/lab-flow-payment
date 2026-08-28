# LAB-005.2 — Estados de una orden en Flow Sandbox

## Objetivo

Identificar y comprobar mediante experimentación los diferentes estados que
puede presentar una orden de Flow Sandbox al consultar su información mediante
el endpoint:

```text
GET /api/payment/getStatus
```

El objetivo es relacionar el valor numérico de `status` con el estado observado
en el ciclo de vida de una orden.

---

## Contexto

En los laboratorios anteriores se comprobó:

* La creación de órdenes mediante `payment/create`.
* La obtención de `token` y `flowOrder`.
* El acceso al Checkout Sandbox.
* La realización de pagos simulados.
* La consulta del estado mediante `payment/getStatus`.

Durante las pruebas realizadas se observaron diferentes valores para el campo:

```text
status
```

Este experimento reúne esas observaciones para establecer una primera tabla de
referencia de estados.

---

## Entorno

Todas las pruebas se realizaron exclusivamente contra:

```text
Flow Sandbox
https://sandbox.flow.cl/
```

No se utilizaron operaciones de producción.

---

## Método de comprobación

La consulta de estado se realizó utilizando el laboratorio:

```bash
npm run lab:005
```

El `token` de cada orden se proporcionó mediante una variable de entorno:

```bash
TOKEN="TOKEN_DE_PRUEBA" npm run lab:005
```

El laboratorio genera la firma requerida y consulta:

```text
GET /api/payment/getStatus
```

La respuesta obtenida permite observar el valor actual de `status`.

---

# Estado 1 — Pendiente

## Evidencia

Se creó una nueva orden mediante LAB-001 y se consultó su estado antes de
realizar un pago.

Resultado:

```text
HTTP: 200
status: 1
```

Ejemplo observado:

```text
{
  flowOrder: 9959005,
  commerceOrder: '0db4a331-c69b-45cd-b356-2966a7e2d225',
  status: 1,
  currency: 'PEN',
  amount: '350',
  paymentData: {
    date: null,
    media: null,
    amount: null,
    currency: null,
    fee: null,
    balance: null
  }
}
```

## Observación

La orden se encontraba pendiente de completar el proceso de pago.

Los campos principales de `paymentData` relacionados con el pago todavía
aparecían como `null`.

Estado observado:

```text
status: 1 → pendiente
```

---

# Estado 2 — Pagada

## Evidencia

Se creó una nueva orden, se accedió al Checkout Sandbox y se realizó un pago
simulado.

Posteriormente se consultó nuevamente el estado mediante LAB-005.

Resultado:

```text
HTTP: 200
status: 2
```

Ejemplo observado:

```text
{
  flowOrder: 9941858,
  commerceOrder: 'd369e457-3c5e-4d4d-b679-6564ee281451',
  status: 2,
  currency: 'PEN',
  amount: '350',
  paymentData: {
    date: '2026-08-27 14:24:32',
    media: 'TC',
    amount: '350.00',
    currency: 'PEN',
    fee: '13.05',
    balance: 334.59999999999997,
    transferDate: '2026-09-01 00:00:00',
    taxes: 2.35
  }
}
```

## Observación

Después del pago simulado, la orden cambió de:

```text
status: 1
```

a:

```text
status: 2
```

Además, `paymentData` comenzó a contener información relacionada con el pago.

Entre los datos observados:

* Fecha del pago.
* Medio de pago.
* Monto.
* Moneda.
* Comisión.
* Balance.
* Impuestos.
* Fecha de transferencia.

Estado observado:

```text
status: 2 → pagada
```

---

# Estado 3 — Rechazada

## Evidencia

Se utilizó una orden creada en Sandbox y posteriormente se realizó una prueba
de pago que produjo un resultado rechazado.

La consulta posterior mediante LAB-005 respondió:

```text
HTTP: 200
status: 3
```

Resultado observado:

```text
{
  flowOrder: 9959005,
  commerceOrder: '0db4a331-c69b-45cd-b356-2966a7e2d225',
  status: 3,
  currency: 'PEN',
  amount: '350',
  paymentData: {
    date: null,
    media: null,
    amount: null,
    currency: null,
    fee: null,
    balance: null
  }
}
```

## Observación

La API respondió correctamente a la consulta mediante HTTP `200`, pero el
estado de la orden era:

```text
status: 3
```

En consecuencia, es importante diferenciar:

```text
HTTP 200
```

de:

```text
status 2
```

HTTP `200` indica que la consulta fue procesada correctamente.

El valor de `status` representa el estado informado para la orden.

Estado observado:

```text
status: 3 → rechazada
```

---

# Estado 4 — Anulada

## Evidencia

Se utilizó una orden creada en Flow Sandbox que inicialmente se encontraba
pendiente:

```text
status: 1
```

Posteriormente, sin realizar un pago, se volvió a consultar la misma orden.

En una consulta posterior se obtuvo:

```text
HTTP: 200
status: 4
```

Resultado observado:

```text
{
  flowOrder: 9959836,
  commerceOrder: '7467df73-a586-4ec5-a7d8-41d2b1ce4801',
  status: 4,
  currency: 'PEN',
  amount: '350',
  paymentData: {
    date: null,
    media: null,
    conversionDate: null,
    conversionRate: null,
    amount: null,
    currency: null,
    fee: null,
    balance: null,
    transferDate: null
  }
}
```

## Observación

La orden inicialmente presentaba:

```text
status: 1
```

Posteriormente se observó:

```text
status: 4
```

Esto demuestra experimentalmente que una orden pendiente puede terminar
presentando el estado `4` en Sandbox.

Estado observado:

```text
status: 4 → anulada
```

El mecanismo exacto que provocó esta transición todavía será investigado de
forma controlada en un laboratorio posterior.

---

# Tabla de estados observados

| `status` | Estado observado | Evidencia  |
| -------- | ---------------- | ---------- |
| `1`      | Pendiente        | Comprobado |
| `2`      | Pagada           | Comprobado |
| `3`      | Rechazada        | Comprobado |
| `4`      | Anulada          | Comprobado |

---

## Diferencia entre HTTP y `status`

Una observación importante de este experimento es que el código HTTP de la
respuesta no debe confundirse con el estado de la transacción.

Por ejemplo:

```text
HTTP: 200
status: 1
```

significa que la consulta fue procesada correctamente y la orden está
pendiente.

De igual manera:

```text
HTTP: 200
status: 2
```

indica que la consulta fue procesada correctamente y la orden está pagada.

También se observaron:

```text
HTTP: 200
status: 3
```

y:

```text
HTTP: 200
status: 4
```

Por lo tanto:

```text
HTTP 200 ≠ pago aprobado
```

La aplicación debe analizar el campo `status` para determinar el estado de la
orden.

---

## Flujo observado

Los cuatro estados comprobados pueden representarse conceptualmente como:

```text
                 ┌─────────────┐
                 │  Pendiente  │
                 │  status: 1  │
                 └──────┬──────┘
                        │
             ┌──────────┼──────────┐
             │          │          │
             ▼          ▼          ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Pagada   │ │ Rechazada│ │ Anulada  │
       │ status:2 │ │ status:3 │ │ status:4 │
       └──────────┘ └──────────┘ └──────────┘
```

Este diagrama representa los estados observados durante los experimentos y no
pretende establecer todavía todas las posibles transiciones del ciclo de vida
de una orden.

---

## Relación con laboratorios anteriores

Este experimento utiliza directamente los resultados de:

```text
LAB-001
Crear orden
    │
    ▼
LAB-002
Explorar Checkout
    │
    ▼
LAB-005
Consultar estado
    │
    ▼
LAB-005.2
Analizar estados
```

También se relaciona con:

```text
LAB-004
Recibir callback
```

ya que una aplicación real puede recibir una notificación relacionada con una
orden y posteriormente consultar su estado mediante `getStatus`.

---

## Aprendizajes

Este experimento permitió comprobar que:

1. Flow Sandbox utiliza valores numéricos para representar el estado de una
   orden.
2. `status: 1` fue observado en órdenes pendientes.
3. `status: 2` fue observado después de completar un pago.
4. `status: 3` fue observado después de un resultado rechazado.
5. `status: 4` fue observado en una orden anulada.
6. Una consulta exitosa puede devolver HTTP `200` independientemente del estado
   de la transacción.
7. El estado de la orden debe determinarse mediante el campo `status`.
8. `paymentData` puede contener información adicional cuando existe un pago
   registrado.
9. Los estados deben analizarse independientemente de los códigos HTTP.

---

## Limitaciones

Este experimento identifica los cuatro estados observados, pero todavía no
determina completamente:

* Todas las transiciones posibles entre estados.
* Qué eventos provocan exactamente cada transición.
* Cómo reproducir de forma determinista una anulación.
* La diferencia operacional entre anulación y expiración.
* El comportamiento del callback para cada estado.
* Qué ocurre si una orden cambia de estado después de haber sido consultada.
* Cómo debe implementar un comercio la lógica de negocio asociada a cada
  estado.
* Qué otros campos pueden cambiar dependiendo del estado.

Estos puntos serán investigados en experimentos posteriores.

---

## Próximo experimento

El siguiente objetivo será investigar específicamente la transición:

```text
status: 1
    ↓
status: 4
```

Se buscará determinar bajo qué condiciones una orden pendiente pasa a estado
anulado y si dicha transición puede reproducirse de forma controlada en
Sandbox.

El experimento deberá comprobar también si la configuración de tiempos de la
orden, el Checkout o la ausencia de interacción del pagador intervienen en
dicha transición.

---

## Resultado

**EXPERIMENTO EXITOSO**

Se comprobaron experimentalmente cuatro estados de una orden en Flow Sandbox:

```text
1 → pendiente
2 → pagada
3 → rechazada
4 → anulada
```

Estos valores quedan registrados como referencia para los siguientes
laboratorios.

No se considera todavía resuelto el mecanismo que produce cada transición.
Ese análisis corresponde a experimentos posteriores.
