# LAB-008.1 — Creación de orden e integración con Checkout

## Objetivo

Crear una orden directamente desde Node.js contra Flow Sandbox y obtener los datos necesarios para iniciar el Checkout.

Este laboratorio integra en un único flujo:

```text
parámetros
    ↓
ordenamiento
    ↓
string-to-sign
    ↓
HMAC-SHA256
    ↓
POST /payment/create
    ↓
token + flowOrder + url
    ↓
Checkout
```

---

## Entorno

```text
Ambiente:    Flow Sandbox
Endpoint:    https://sandbox.flow.cl/api/payment/create
Runtime:     Node.js v24.15.0
Lenguaje:    JavaScript
SO:          Arch Linux
```

Dependencias utilizadas:

```text
axios
dotenv
```

Las credenciales se cargan mediante variables de entorno.

No se almacenan `API_KEY` ni `SECRET_KEY` en el código fuente.

---

## Parámetros

La orden se genera con:

```text
apiKey
commerceOrder
urlConfirmation
urlReturn
email
subject
amount
currency
```

Valores utilizados en la prueba:

```text
commerceOrder: UUID generado dinámicamente
subject:       Laboratorio Flow Payment
amount:        350
currency:      PEN
```

`commerceOrder` se genera mediante `crypto.randomUUID()` para evitar reutilizar identificadores entre ejecuciones.

---

## Firma

Los parámetros se ordenan alfabéticamente por nombre antes de generar la firma.

Para esta ejecución:

```text
amount
apiKey
commerceOrder
currency
email
subject
urlConfirmation
urlReturn
```

La cadena utilizada para HMAC se construye concatenando:

```text
nombre + valor
```

sin separadores.

Ejemplo de estructura:

```text
amount350apiKey...commerceOrder...currencyPENemail...subject...urlConfirmation...urlReturn...
```

La firma se genera mediante:

```text
HMAC-SHA256
```

utilizando `SECRET_KEY`.

El resultado se incorpora como:

```text
s=<firma>
```

`SECRET_KEY` nunca forma parte de la solicitud enviada a Flow.

---

## Solicitud

Flow espera la información utilizando:

```text
application/x-www-form-urlencoded
```

La solicitud ejecutada por el laboratorio es:

```text
POST /api/payment/create
```

con los parámetros de la orden y la firma `s`.

---

## Resultado

La ejecución fue aceptada por Flow Sandbox:

```text
HTTP: 200
```

Respuesta obtenida:

```text
{
  token: 'DED4E5...',
  url: 'https://sandbox.flow.cl/app/web/pay.php',
  flowOrder: 9993109
}
```

Los valores sensibles se muestran sanitizados en la evidencia del laboratorio.

---

## Validación

La respuesta se valida antes de continuar.

Se comprueba la existencia de:

```text
token
flowOrder
url
```

Resultado:

```text
✓ token recibido
✓ flowOrder recibido
✓ url recibida
```

En la ejecución registrada:

```text
flowOrder = 9993109
```

---

## Checkout

A partir de la respuesta de Flow se construye:

```text
https://sandbox.flow.cl/app/web/pay.php?token=DED4E5...
```

El `token` real no se almacena en la documentación pública.

La URL permite continuar desde la creación de la orden hacia el Checkout de Flow Sandbox.

---

## Evidencia

Ejecución:

```bash
node laboratorios/008-integracion-checkout/main.js | tee laboratorios/008-integracion-checkout/008-integracion-checkout.log
```

Resultado registrado:

```text
HTTP: 200

Respuesta sanitizada:
{
  token: 'DED4E5...',
  url: 'https://sandbox.flow.cl/app/web/pay.php',
  flowOrder: 9993109
}

Checkout:
https://sandbox.flow.cl/app/web/pay.php?token=DED4E5...

LAB-008 completó la creación de la orden.
```

La evidencia completa se encuentra en:

```text
008-integracion-checkout.log
```

---

## Observaciones

La integración realizada en este laboratorio ya no depende de copiar manualmente una solicitud de ejemplo.

El proceso completo queda reproducible desde Node.js:

```text
Node.js
   │
   ├── genera commerceOrder
   ├── prepara parámetros
   ├── ordena parámetros
   ├── genera string-to-sign
   ├── calcula HMAC-SHA256
   ├── agrega s
   ├── serializa como form-urlencoded
   │
   ▼
Flow Sandbox
   │
   ├── HTTP 200
   ├── token
   ├── flowOrder
   └── url
         │
         ▼
      Checkout
```

Esto permite separar claramente dos etapas:

```text
Creación de orden
        ↓
Inicio de Checkout
```

La respuesta `HTTP 200` confirma que Flow aceptó la solicitud de creación de la orden. No implica que el pago haya sido realizado.

---

## Relación con laboratorios anteriores

LAB-001 permitió validar progresivamente los parámetros necesarios para obtener una creación de orden exitosa.

LAB-005 permitió consultar posteriormente el estado de una orden mediante su `token`.

LAB-007 permitió observar el comportamiento de `checkout_timeout` dentro del Checkout y las transiciones de estado asociadas al proceso de pago.

LAB-008 integra ahora la primera parte de ese flujo desde un único script:

```text
LAB-001
Creación de orden
      │
      ▼
LAB-008
Creación + Checkout
      │
      ├── token
      ├── flowOrder
      └── checkout URL
             │
             ▼
          Checkout
             │
             ▼
LAB-005
Consulta de estado
```

---

## Conclusiones

La integración fue validada correctamente.

El script permite:

* generar una `commerceOrder`;
* preparar los parámetros de la orden;
* ordenar los parámetros;
* generar el `string-to-sign`;
* calcular la firma HMAC-SHA256;
* enviar la solicitud `POST /payment/create`;
* procesar la respuesta de Flow;
* validar `token`, `flowOrder` y `url`;
* construir la URL del Checkout.

Resultado:

```text
LAB-008.1 — OK
HTTP 200
Orden creada
Checkout generado
```

---

## Pendiente

La creación de la orden y la generación de la URL del Checkout ya están validadas.

El siguiente paso es comprobar el comportamiento del Checkout utilizando el `token` generado por esta integración y relacionar el resultado con la consulta posterior de estado.

Flujo a investigar:

```text
payment/create
      ↓
token
      ↓
Checkout
      ↓
selección de medio de pago
      ↓
resultado de la transacción
      ↓
payment/getStatus
```

El pago todavía no forma parte de la validación realizada en este experimento.

---

## Estado

**CERRADO — INTEGRACIÓN DE CREACIÓN VALIDADA**

### Validado

* Creación dinámica de `commerceOrder`.
* Ordenamiento de parámetros.
* Generación de `string-to-sign`.
* Firma HMAC-SHA256.
* Envío `application/x-www-form-urlencoded`.
* `POST /payment/create`.
* Respuesta `HTTP 200`.
* Obtención de `token`.
* Obtención de `flowOrder`.
* Obtención de URL de Checkout.
* Construcción de la URL final del Checkout.
* Sanitización de información sensible en consola y evidencia.

### Pendiente

* Ejecutar una transacción desde el Checkout.
* Determinar el resultado de la transacción.
* Consultar el estado posterior mediante `payment/getStatus`.
* Relacionar el resultado del Checkout con `status` y `paymentData`.
* Continuar la integración con callbacks de confirmación.
