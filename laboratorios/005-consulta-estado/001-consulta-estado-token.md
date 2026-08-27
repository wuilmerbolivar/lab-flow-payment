# LAB-005.1 — Consulta de estado mediante token

## Objetivo

Consultar el estado de una orden creada previamente en Flow Sandbox utilizando
el `token` entregado por Flow durante la creación de la orden.

El objetivo de este experimento es comprender cómo una aplicación puede
consultar posteriormente el estado de una transacción mediante la API de Flow.

## Contexto

En LAB-001 se reprodujo exitosamente la creación de una orden mediante:

`POST /payment/create`

La respuesta de Flow proporcionó, entre otros datos:

- `token`
- `url`
- `flowOrder`

En este laboratorio utilizamos el `token` obtenido de una nueva orden para
consultar su estado mediante:

`GET /payment/getStatus`

## Hipótesis

Si disponemos de un `token` válido y generamos correctamente la firma con la
API Key y Secret Key del comercio, Flow Sandbox debería aceptar la solicitud y
devolver información sobre el estado de la orden.

## Endpoint

Ambiente:

`https://sandbox.flow.cl`

Endpoint utilizado:

`GET /api/payment/getStatus`

## Parámetros utilizados

La solicitud utiliza los siguientes parámetros:

- `apiKey`
- `token`
- `s`

El parámetro `s` corresponde a la firma HMAC-SHA256 generada utilizando el
Secret Key.

## Generación de la firma

Se construyó el conjunto de parámetros:

```text
apiKey
token
```

Los parámetros se ordenaron alfabéticamente y posteriormente se concatenaron
para generar la cadena utilizada para la firma.

La firma se generó mediante:

`HMAC-SHA256`

utilizando el Secret Key como clave.

El resultado se envió mediante el parámetro:

`s`

## Preparación de la orden

Antes de realizar la consulta se creó una nueva orden utilizando LAB-001.

Resultado de la creación:

* HTTP: `200`
* `flowOrder`: `9920422`
* `token`: `0578B815FE5D...`
* `commerceOrder`: `92625d9d-6801-4f4e-b994-e954c5cab4be`

El token completo no se documenta por razones de seguridad y trazabilidad.

## Ejecución

La consulta se ejecutó mediante:

```bash
TOKEN="TU_TOKEN" npm run lab:005
```

El token real fue proporcionado mediante una variable de entorno temporal y no
fue almacenado en el código fuente.

## Resultado

Flow Sandbox respondió correctamente:

```text
HTTP: 200
```

Respuesta obtenida, sanitizada:

```text
{
  flowOrder: 9920422,
  commerceOrder: '92625d9d-6801-4f4e-b994-e954c5cab4be',
  requestDate: '2026-08-27 02:02:07',
  status: 1,
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
    date: null,
    media: null,
    conversionDate: null,
    conversionRate: null,
    amount: null,
    currency: null,
    fee: null,
    balance: null,
    transferDate: null
  },
  merchantId: null
}
```

## Observaciones

La consulta demuestra que el `token` obtenido durante la creación de la orden
puede utilizarse posteriormente para obtener información sobre la
transacción.

La respuesta contiene nuevamente el `flowOrder` y el `commerceOrder`, además
de información relacionada con la orden y el pago.

La orden utilizada corresponde a:

* Comercio: `Wuilmer Bolivar`
* Concepto: `Laboratorio Flow Payment`
* Moneda: `PEN`
* Monto: `350`

## Sobre el campo `status`

La respuesta devolvió:

```text
status: 1
```

En este experimento no se establece todavía una interpretación definitiva del
valor numérico.

Aunque la consulta fue realizada correctamente y Flow respondió con HTTP 200,
el significado exacto de los distintos valores de `status` debe comprobarse
contra la documentación oficial y mediante nuevos experimentos controlados.

No se debe asumir que un HTTP 200 significa necesariamente que el pago fue
realizado.

HTTP 200 indica que la solicitud de consulta fue procesada correctamente y que
Flow devolvió una respuesta válida.

## Relación con LAB-004

LAB-004 permitió construir un endpoint HTTP capaz de recibir un callback
mediante:

`POST /flow/confirmation`

Ese callback incluye información de la transacción, entre ella el `token`.

Por lo tanto, los laboratorios comienzan a formar un flujo coherente:

```text
LAB-001
Crear orden
    │
    ├── token
    └── flowOrder
         │
         ▼
LAB-004
Recibir callback
    │
    └── token
         │
         ▼
LAB-005
Consultar estado
    │
    └── GET /payment/getStatus
```

## Aprendizajes

1. La creación de una orden y la consulta de su estado son operaciones
   independientes.
2. El `token` permite identificar la transacción al consultar su estado.
3. La consulta requiere autenticación mediante API Key y firma.
4. La firma HMAC-SHA256 utilizada en LAB-001 puede reutilizarse para esta
   operación.
5. Una respuesta HTTP 200 indica que la consulta fue procesada correctamente.
6. La respuesta contiene información adicional de la orden y del estado del
   pago.
7. Las credenciales y tokens deben mantenerse fuera del repositorio.
8. El callback y la consulta de estado forman parte de un flujo posterior a la
   creación de la orden.

## Limitaciones

Este experimento solamente comprueba la consulta del estado de una orden.

Todavía no se ha comprobado:

* El significado de todos los valores posibles de `status`.
* El comportamiento después de realizar un pago.
* El comportamiento después de rechazar un pago.
* La consulta utilizando `flowOrder`.
* La relación entre el callback y una consulta posterior del estado.
* La validación de la respuesta recibida desde Flow.
* El manejo de errores específicos de la consulta.

Estos aspectos serán investigados en experimentos posteriores.

## Conclusión

El experimento fue exitoso.

Se logró consultar una orden creada previamente en Flow Sandbox utilizando su
`token`, generando correctamente la firma requerida y obteniendo una respuesta
HTTP `200`.

Resultado:

`LAB-005.1 — OK`

La siguiente etapa será estudiar e interpretar los estados de una transacción
y comprobar cómo cambia la respuesta de Flow durante el ciclo de vida de una
orden.

## Evidencia

Resultado principal:

```text
LAB-005 — Consulta de estado
Token: 0578B815FE5D...
Consultando Flow Sandbox...
HTTP: 200
```

La evidencia se encuentra basada en la ejecución local del laboratorio contra
Flow Sandbox.

No se almacenan API Keys, Secret Keys ni tokens completos en el repositorio.
