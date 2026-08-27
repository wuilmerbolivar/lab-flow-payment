# LAB-005.1 — Consulta de estado mediante token

## Objetivo

Comprender cómo consultar el estado de una orden previamente creada en Flow
Sandbox utilizando el endpoint `payment/getStatus` y el `token` obtenido durante
la creación de la orden.

Este experimento busca comprender la relación básica entre la creación de una
orden y su posterior consulta.

---

## Contexto

En LAB-001 se creó correctamente una orden mediante el endpoint
`payment/create`.

La respuesta de Flow proporcionó, entre otros datos:

- `token`
- `url`
- `flowOrder`

En este experimento utilizamos el `token` obtenido para consultar nuevamente
la información de la orden.

---

## Endpoint utilizado

```text
GET https://sandbox.flow.cl/api/payment/getStatus
```

La consulta se realiza contra Flow Sandbox.

---

## Parámetros

Para realizar la consulta se utilizaron:

```text
apiKey
token
s
```

Donde:

* `apiKey` identifica al comercio.
* `token` identifica la transacción que queremos consultar.
* `s` corresponde a la firma HMAC-SHA256 generada utilizando el `Secret Key`.

El `Secret Key` nunca se envía directamente en la solicitud.

---

## Preparación de la solicitud

El laboratorio utiliza las credenciales almacenadas en `.env`:

```text
API_KEY=
SECRET_KEY=
```

El token se proporciona temporalmente mediante una variable de entorno:

```bash
TOKEN="TOKEN_OBTENIDO_EN_LAB-001" npm run lab:005
```

De esta forma no es necesario guardar el token directamente dentro del código.

---

## Firma

Los parámetros utilizados para la solicitud se ordenan alfabéticamente y se
concatenan para generar la cadena que será firmada.

Posteriormente se genera una firma HMAC-SHA256 utilizando el `SECRET_KEY`.

El resultado se envía mediante el parámetro:

```text
s
```

---

## Primera prueba

Se utilizó el token obtenido durante una ejecución exitosa de LAB-001.

Comando:

```bash
TOKEN="0578B815FE5DA5FD099B47B4472E37CC896XXXXX" npm run lab:005
```

El token completo no se documenta para evitar exponer información innecesaria.

### Resultado

```text
LAB-005 — Consulta de estado
Token: 0578B815FE5D...
Consultando Flow Sandbox...
HTTP: 200
```

La API respondió correctamente.

---

## Respuesta obtenida

Respuesta sanitizada:

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

---

## Observaciones

La respuesta HTTP `200` indica que la solicitud de consulta fue aceptada y
procesada correctamente por Flow Sandbox.

La respuesta permite observar nuevamente información asociada a la orden.

### `flowOrder`

Identificador interno de la orden dentro de Flow.

En esta prueba:

```text
9920422
```

### `commerceOrder`

Identificador de la orden generado por nuestro comercio al momento de crear
la transacción.

En esta prueba corresponde al UUID generado durante LAB-001.

### `status`

La respuesta contiene:

```text
status: 1
```

Este valor representa el estado actual informado por Flow para la orden.

En este experimento todavía no estamos estudiando todos los posibles estados;
ese análisis se realizará posteriormente.

### `currency`

La moneda registrada para esta orden es:

```text
PEN
```

Esto coincide con la moneda utilizada durante LAB-001.

### `amount`

El monto registrado es:

```text
350
```

correspondiente a:

```text
S/ 350.00 PEN
```

### `paymentData`

El objeto `paymentData` existe en la respuesta, pero sus campos relacionados
con el pago todavía aparecen como `null`.

Por ejemplo:

```text
date: null
media: null
amount: null
currency: null
fee: null
```

Esto es consistente con que la orden todavía no ha completado un pago.

---

## Relación entre LAB-001 y LAB-005

El flujo observado hasta este punto es:

```text
LAB-001
    |
    | payment/create
    v
Flow Sandbox
    |
    | token + flowOrder
    v
LAB-005
    |
    | payment/getStatus
    | token
    v
Información actual de la orden
```

Esto permite comprobar que el `token` obtenido durante la creación de la
orden puede utilizarse posteriormente para consultar su estado.

---

## Resultado

**EXPERIMENTO EXITOSO**

Se consiguió:

* Consultar una orden previamente creada.
* Utilizar el `token` como identificador de la transacción.
* Generar correctamente la firma HMAC-SHA256.
* Comunicarse con `payment/getStatus`.
* Obtener una respuesta HTTP `200`.
* Recuperar información de la orden.
* Observar el estado actual de la transacción.
* Confirmar la moneda y el monto registrados.
* Observar la estructura de `paymentData`.

---

## Aprendizajes

Este experimento permitió comprender el flujo básico:

```text
Crear orden → obtener token → consultar estado
```

También permitió diferenciar dos identificadores importantes:

* `commerceOrder`: identificador generado por nuestro comercio.
* `flowOrder`: identificador asociado a la orden dentro de Flow.

El `token` funciona como elemento necesario para realizar posteriormente la
consulta del estado de la transacción.

---

## Limitaciones

Este experimento todavía no analiza:

* Todos los valores posibles de `status`.
* Estados de una orden después de realizar un pago.
* Diferencias entre pago aprobado, rechazado o pendiente.
* Contenido de `paymentData` después de un pago.
* Verificación de callbacks.
* Idempotencia.
* Manejo avanzado de errores.
* Seguridad avanzada de la consulta.

Estos temas serán abordados en experimentos posteriores.

---

## Evidencia

Resultado principal:

```text
HTTP: 200
```

Respuesta obtenida correctamente desde:

```text
https://sandbox.flow.cl/api/payment/getStatus
```

No se almacenan API Keys, Secret Keys ni tokens completos en la
documentación del repositorio.

---

## Estado

**Completado**

LAB-005.1 demuestra que una orden creada previamente puede ser consultada
correctamente mediante su `token` utilizando Flow Sandbox.
