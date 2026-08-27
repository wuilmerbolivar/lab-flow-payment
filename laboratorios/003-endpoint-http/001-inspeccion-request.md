# LAB-003.1 — Inspección de una solicitud HTTP

## Objetivo

Comprender qué información recibe un servidor HTTP cuando un cliente realiza
una solicitud.

## Pregunta

¿Qué información puede observar un servidor HTTP de una solicitud realizada
por un cliente?

## Hipótesis

Una solicitud HTTP contiene, como mínimo, un método y una URL, y puede incluir
headers y un body dependiendo del tipo de solicitud y de lo que envíe el
cliente.

## Entorno

- Sistema operativo: Arch Linux
- Runtime: Node.js
- Versión de Node.js: v24.15.0
- Servidor: `node:http`
- Puerto: `3000`
- Ambiente: local

## Preparación

Se utilizó un servidor HTTP mínimo construido con la API nativa de Node.js.

El servidor registra:

- Método HTTP.
- URL solicitada.
- Headers.
- Body.

Posteriormente responde con `HTTP 200`.

## Procedimiento

### 1. Iniciar el servidor

```bash
npm run lab:003
```

Resultado esperado:

```text
LAB-003 escuchando en http://localhost:3000
```

### 2. Realizar una solicitud GET desde el navegador

Se accedió a:

```text
http://localhost:3000/
```

El servidor recibió una solicitud similar a:

```text
Método: GET
URL: /
Headers: {
  ...
}
Body: (vacío)
```

El navegador también realizó una solicitud adicional para:

```text
/favicon.ico
```

Esto permitió observar que una página cargada desde un navegador puede
generar más de una solicitud HTTP.

### 3. Realizar una solicitud GET mediante cURL

```bash
curl -i http://localhost:3000/
```

Resultado observado:

```text
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
...
LAB-003 OK
```

El servidor registró:

```text
Método: GET
URL: /
Headers: {
  host: 'localhost:3000',
  'user-agent': 'curl/8.21.0',
  accept: '*/*'
}
Body: (vacío)
```

### 4. Realizar una solicitud POST

```bash
curl -i \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=LAB-003-TEST" \
  http://localhost:3000/payment-status
```

Resultado observado:

```text
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
...
LAB-003 OK
```

El servidor recibió:

```text
Método: POST
URL: /payment-status
Headers: {
  ...
  'content-type': 'application/x-www-form-urlencoded',
  'content-length': '18'
}
Body: token=LAB-003-TEST
```

## Observaciones

### Método

El método HTTP indica qué tipo de operación solicita el cliente.

En las pruebas se observaron:

```text
GET
POST
```

### URL

El servidor puede identificar la ruta solicitada mediante:

```js
req.url
```

Se observaron:

```text
/
```

y:

```text
/payment-status
```

### Headers

Los headers proporcionan información adicional sobre la solicitud.

Entre los valores observados se encuentran:

```text
host
user-agent
accept
content-type
content-length
```

El contenido exacto de los headers depende del cliente utilizado.

### Body

La solicitud `GET` realizada en este experimento no contenía body:

```text
Body: (vacío)
```

La solicitud `POST` sí contenía información:

```text
token=LAB-003-TEST
```

### Content-Type

La solicitud `POST` utilizó:

```text
application/x-www-form-urlencoded
```

Esto indica el formato utilizado para transportar los datos del body.

### Content-Length

En la solicitud `POST` se observó:

```text
content-length: 18
```

Este header indica la longitud del contenido enviado en el body.

## Resultado

El servidor HTTP local pudo recibir y observar correctamente:

* Método HTTP.
* URL.
* Headers.
* Body.
* `Content-Type`.
* `Content-Length`.

También se comprobó que diferentes clientes pueden generar solicitudes
distintas.

El navegador generó headers adicionales respecto a cURL y realizó una
solicitud adicional para `/favicon.ico`.

## Conclusión

La hipótesis inicial fue confirmada.

Una solicitud HTTP proporciona al servidor información estructurada que permite
identificar el método, recurso solicitado, headers y, cuando corresponde, el
contenido del body.

Esta observación constituye una base fundamental para comprender posteriormente
cómo un servidor puede recibir comunicaciones provenientes de una integración
externa.

## Relación con Flow

Este experimento todavía no realiza ninguna comunicación con Flow.

Su objetivo es comprender primero el protocolo HTTP utilizando un servidor
local controlado.

Posteriormente estos conocimientos serán utilizados para estudiar callbacks y
otras comunicaciones relacionadas con Flow Sandbox.

## Limitaciones

Este experimento utiliza un servidor HTTP local y no representa todavía un
servidor accesible desde Internet.

Tampoco se ha implementado:

* HTTPS.
* validación de datos.
* procesamiento real del body.
* autenticación.
* persistencia.
* integración con Flow.

## Próximos pasos

1. Comprender cómo interpretar el body recibido.
2. Analizar `application/x-www-form-urlencoded`.
3. Convertir el body en parámetros utilizables por JavaScript.
4. Diferenciar correctamente rutas HTTP.
5. Posteriormente estudiar cómo exponer un endpoint para recibir una
   comunicación externa.
