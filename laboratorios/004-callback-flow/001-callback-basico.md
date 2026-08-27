# LAB-004.1 — Callback HTTP básico

## Objetivo

Construir un endpoint HTTP local capaz de recibir una solicitud `POST` y
procesar los datos enviados mediante `application/x-www-form-urlencoded`.

El objetivo es comprender la estructura básica de un callback antes de
conectarlo con Flow Sandbox.

---

## Hipótesis

Un callback HTTP puede ser implementado como un endpoint que:

1. recibe una solicitud HTTP;
2. identifica el método;
3. identifica la URL;
4. valida los headers relevantes;
5. procesa el body;
6. extrae los parámetros;
7. responde con un código HTTP apropiado.

Para este experimento se utilizará:

```text
POST /flow/confirmation
```

con:

```text
Content-Type: application/x-www-form-urlencoded
```

---

## Implementación

El servidor fue construido utilizando exclusivamente la API nativa
`node:http`.

No se utilizan frameworks ni servicios externos.

Endpoint:

```text
http://localhost:3000/flow/confirmation
```

Puerto:

```text
3000
```

---

## Prueba 1 — Callback válido

Solicitud:

```bash
curl -i \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=LAB-004-TEST" \
  http://localhost:3000/flow/confirmation
```

Resultado:

```text
HTTP/1.1 200 OK
```

Respuesta:

```text
CALLBACK RECIBIDO
```

El servidor recibió:

```text
Método: POST
URL: /flow/confirmation
```

Body:

```text
token=LAB-004-TEST
```

Después de procesar el formulario:

```text
Parámetros: { token: 'LAB-004-TEST' }
```

Token extraído:

```text
LAB-004-TEST
```

### Resultado

**OK**

El endpoint acepta correctamente una solicitud que cumple el contrato
experimental.

---

## Prueba 2 — Content-Type incorrecto

Se envió el mismo parámetro utilizando JSON:

```bash
curl -i \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"LAB-004-TEST"}' \
  http://localhost:3000/flow/confirmation
```

Resultado:

```text
HTTP/1.1 415 Unsupported Media Type
```

Respuesta:

```text
Content-Type no soportado
```

El servidor recibió correctamente la solicitud:

```text
Método: POST
URL: /flow/confirmation
```

pero detectó:

```text
Content-Type: application/json
```

en lugar de:

```text
application/x-www-form-urlencoded
```

### Resultado

**OK**

El endpoint rechaza correctamente una solicitud cuyo formato no coincide con
el contrato definido.

---

## Contrato experimental

Después de las pruebas, el endpoint tiene el siguiente comportamiento:

```text
POST /flow/confirmation
        │
        ├── application/x-www-form-urlencoded
        │       │
        │       ├── procesar body
        │       ├── extraer parámetros
        │       └── HTTP 200
        │
        └── otro Content-Type
                │
                └── HTTP 415
```

---

## Observaciones

El callback no consiste simplemente en recibir una URL.

El servidor debe interpretar correctamente la solicitud HTTP completa.

En este experimento se identificaron como elementos relevantes:

* método HTTP;
* URL;
* headers;
* `Content-Type`;
* body;
* parámetros;
* código de respuesta HTTP.

También se comprobó que el body recibido inicialmente es una cadena de texto:

```text
token=LAB-004-TEST
```

y posteriormente puede transformarse mediante `URLSearchParams` en parámetros
utilizables por JavaScript.

---

## Relación con Flow

Este experimento todavía no recibe comunicaciones reales desde Flow.

El endpoint únicamente reproduce localmente el concepto de un receptor HTTP.

La siguiente etapa consistirá en estudiar la estructura de una notificación
real de Flow y determinar qué parámetros debe esperar el comercio.

No se debe asumir que todos los parámetros utilizados en este experimento
representan todavía una notificación real de Flow.

---

## Resultado final

**LAB-004.1 — OK**

Se construyó y validó un endpoint HTTP local capaz de:

* recibir `POST`;
* validar la ruta;
* validar el método HTTP;
* validar `Content-Type`;
* recibir un body;
* procesar `application/x-www-form-urlencoded`;
* extraer el parámetro `token`;
* responder `HTTP 200` cuando la solicitud cumple el contrato;
* responder `HTTP 415` cuando el formato recibido no es compatible.

---

## Próximo paso

Investigar la estructura real de las notificaciones de Flow Sandbox y comparar
sus parámetros con el endpoint construido en este laboratorio.
