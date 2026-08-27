# LAB-004.2 — Contrato de urlConfirmation de Flow

## Objetivo

Investigar la documentación oficial de Flow para determinar cómo se realiza
la comunicación entre Flow y el comercio mediante `urlConfirmation`.

El objetivo es comparar el comportamiento documentado por Flow con el endpoint
HTTP construido durante LAB-004.1.

---

## Fuente de información

La investigación se realizó utilizando la documentación oficial de
desarrolladores de Flow.

Fuente principal:

https://developers.flow.cl/en/docs/tutorial-basics/order-confirmation

También se consultó:

https://developers.flow.cl/api

---

## Descubrimiento

Flow utiliza el parámetro `urlConfirmation` durante la creación de una orden.

Esta URL corresponde al endpoint donde Flow notificará al comercio el resultado
del pago.

La documentación indica que, una vez realizado el pago, Flow realiza una
solicitud HTTP mediante el método `POST` hacia esta URL.

---

## Estructura de la notificación

Según la documentación oficial, la solicitud de confirmación utiliza:

```text
Método:
POST

Content-Type:
application/x-www-form-urlencoded
````

El body contiene:

```text
token=<token-de-la-transacción>
```

Por lo tanto, una notificación simplificada puede representarse como:

```text
POST /confirmation

Content-Type: application/x-www-form-urlencoded

token=TOKEN_DE_LA_TRANSACCION
```

---

## Relación con LAB-004.1

El endpoint experimental construido anteriormente utiliza:

```text
POST /flow/confirmation
```

y espera:

```text
Content-Type: application/x-www-form-urlencoded
```

con un parámetro:

```text
token
```

Por lo tanto, la estructura experimental coincide con el contrato documentado
por Flow.

La implementación local no es todavía un callback real de Flow, pero reproduce
los elementos fundamentales del protocolo.

---

## El token

El token recibido por `urlConfirmation` identifica la transacción.

Flow indica que el comercio debe utilizar este token para consultar el estado
real de la transacción mediante:

```text
/payment/getStatus
```

Por lo tanto, el callback no debe interpretar el token como si fuera por sí
mismo el estado del pago.

El flujo conceptual es:

```text
Flow
 │
 │ POST
 │ token
 ▼
urlConfirmation
 │
 │ token
 ▼
payment/getStatus
 │
 ▼
Estado real de la transacción
```

---

## Confirmación HTTP

La documentación oficial establece que la URL de confirmación debe responder
con código HTTP:

```text
200 OK
```

Además, la respuesta debe producirse en menos de 15 segundos.

Flow recomienda mantener un tiempo de respuesta entre 1 y 10 segundos.

Esto significa que el endpoint de confirmación debe ser rápido y no debería
realizar operaciones innecesariamente lentas antes de responder.

---

## Errores en la respuesta

La documentación indica que si la URL de confirmación:

* responde con un código diferente de `200`; o
* demora más de 15 segundos;

Flow puede notificar el problema de integración mediante correo electrónico.

Sin embargo, un error en la respuesta del callback no cambia por sí mismo el
estado de una transacción que ya fue pagada correctamente.

Esto es importante:

```text
Callback HTTP
      ≠
Estado del pago
```

El callback permite notificar al comercio que debe consultar el estado.

---

## Flujo completo documentado

El flujo de una orden puede representarse de la siguiente manera:

```text
1. Comercio
      │
      │ payment/create
      ▼
2. Flow
      │
      │ token + checkout URL
      ▼
3. Cliente
      │
      │ realiza el pago
      ▼
4. Flow
      │
      │ POST token
      ▼
5. urlConfirmation
      │
      │ payment/getStatus
      ▼
6. Flow
      │
      │ estado de la transacción
      ▼
7. Comercio
```

---

## urlConfirmation vs urlReturn

Durante LAB-002 observamos que Flow también utiliza `urlReturn`.

La documentación confirma que `urlReturn` tiene una función diferente.

### urlConfirmation

Está orientada a la comunicación de Flow con el comercio.

```text
Flow
  │
  │ POST token
  ▼
Servidor del comercio
```

### urlReturn

Está relacionada con el retorno del navegador del cliente después del
proceso de pago.

```text
Flow
  │
  │ POST mediante browser
  ▼
Navegador del cliente
  │
  ▼
urlReturn
```

Por lo tanto, no deben tratarse como equivalentes.

---

## Comparación experimental

| Característica     | LAB-004              | Flow `urlConfirmation`   |
| ------------------ | -------------------- | ------------------------ |
| Método             | POST                 | POST                     |
| Content-Type       | form-urlencoded      | form-urlencoded          |
| Parámetro          | token                | token                    |
| Respuesta esperada | HTTP 200             | HTTP 200                 |
| Endpoint           | `/flow/confirmation` | Definido por el comercio |
| Origen             | curl/local           | Flow                     |
| Consulta posterior | No implementada      | `payment/getStatus`      |

---

## Conclusión

La investigación confirma que el modelo utilizado durante LAB-004.1 coincide
con la estructura básica del callback real de `urlConfirmation` documentado
por Flow.

La principal diferencia actual es que nuestro endpoint todavía no recibe
notificaciones desde Flow y tampoco utiliza el token para consultar el estado
de una transacción.

Por lo tanto, el siguiente paso será implementar la consulta de estado de una
orden utilizando:

```text
/payment/getStatus
```

antes de intentar exponer nuestro servidor a Internet.

---

## Resultado

**LAB-004.2 — OK**

Se identificó y documentó el contrato oficial de `urlConfirmation`:

```text
POST
Content-Type: application/x-www-form-urlencoded
token=<transaction-token>
HTTP 200
```

También se determinó que:

* `urlConfirmation` y `urlReturn` cumplen funciones diferentes;
* el token recibido por el callback no representa directamente el estado del
  pago;
* el comercio debe consultar `payment/getStatus`;
* la respuesta del callback debe producirse rápidamente;
* un error HTTP en el callback no modifica por sí mismo el estado de una
  transacción ya procesada.
