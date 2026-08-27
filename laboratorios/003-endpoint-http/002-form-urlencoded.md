# LAB-003.2 — Interpretación de `application/x-www-form-urlencoded`

## Objetivo

Comprender cómo un servidor Node.js puede recibir e interpretar información
enviada mediante el formato `application/x-www-form-urlencoded`.

## Pregunta

¿Cómo podemos transformar el contenido textual de un body HTTP enviado como
`application/x-www-form-urlencoded` en parámetros que puedan ser utilizados
por JavaScript?

## Hipótesis

Si una solicitud HTTP contiene un body con formato
`application/x-www-form-urlencoded`, Node.js puede recibir inicialmente ese
contenido como texto y posteriormente podemos utilizar `URLSearchParams` para
interpretarlo como parámetros.

## Entorno

- Sistema operativo: Arch Linux
- Runtime: Node.js v24.15.0
- Servidor: `node:http`
- Puerto: `3000`
- Cliente: cURL
- Ambiente: local

## Preparación

Se utilizó el servidor HTTP construido en el laboratorio anterior.

El servidor recibe los fragmentos del body mediante el evento `data` y los
acumula hasta recibir el evento `end`.

El contenido recibido inicialmente se representa como texto.

Posteriormente se utiliza:

```js
const params = new URLSearchParams(body);
```

para interpretar los parámetros.

## Procedimiento

### 1. Enviar un único parámetro

Se realizó la siguiente solicitud:

```bash
curl -i \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=LAB-003-TEST" \
  http://localhost:3000/payment-status
```

El servidor recibió:

```text
Body: token=LAB-003-TEST
```

Y posteriormente interpretó el contenido como:

```text
Parámetros: { token: 'LAB-003-TEST' }
```

La respuesta HTTP fue:

```text
HTTP/1.1 200 OK
```

con el contenido:

```text
LAB-003 OK
```

### 2. Enviar múltiples parámetros

Se realizó una segunda solicitud:

```bash
curl -i \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=LAB-003-TEST&status=1&order=12345" \
  http://localhost:3000/payment-status
```

El servidor recibió:

```text
Body: token=LAB-003-TEST&status=1&order=12345
```

Y produjo:

```text
Parámetros: {
  token: 'LAB-003-TEST',
  status: '1',
  order: '12345'
}
```

La respuesta HTTP fue:

```text
HTTP/1.1 200 OK
```

## Observaciones

El body HTTP llega inicialmente como una representación textual:

```text
token=LAB-003-TEST&status=1&order=12345
```

Los parámetros están separados mediante `&` y cada parámetro utiliza la
estructura:

```text
nombre=valor
```

Por ejemplo:

```text
token=LAB-003-TEST
```

representa:

```text
nombre → token
valor  → LAB-003-TEST
```

Cuando existen varios parámetros:

```text
token=LAB-003-TEST&status=1&order=12345
```

cada par se encuentra separado por `&`.

## `URLSearchParams`

La API estándar de JavaScript permite interpretar este formato mediante:

```js
const params = new URLSearchParams(body);
```

Posteriormente se utilizó:

```js
Object.fromEntries(params)
```

para obtener una representación de objeto:

```js
{
  token: 'LAB-003-TEST',
  status: '1',
  order: '12345'
}
```

## Importante: los valores llegan como texto

Aunque algunos valores parezcan números:

```text
status=1
order=12345
```

el resultado obtenido contiene strings:

```js
{
  status: '1',
  order: '12345'
}
```

`URLSearchParams` no determina automáticamente que `1` o `12345` deban ser
tratados como números.

La conversión de tipos tendría que realizarse posteriormente si la aplicación
lo necesitara.

## Resultado

La hipótesis fue confirmada.

El servidor Node.js recibió correctamente un body
`application/x-www-form-urlencoded` y pudo transformarlo en parámetros
utilizables desde JavaScript mediante `URLSearchParams`.

También se comprobó el procesamiento de múltiples parámetros dentro de una
misma solicitud.

## Conclusión

Una solicitud HTTP puede transportar información en el body utilizando
`application/x-www-form-urlencoded`.

El servidor recibe inicialmente ese contenido como texto y puede interpretarlo
utilizando herramientas apropiadas.

En este experimento se comprobó el siguiente flujo:

```text
HTTP POST
    ↓
Body
    ↓
application/x-www-form-urlencoded
    ↓
String
    ↓
URLSearchParams
    ↓
Parámetros
```

Este conocimiento será necesario posteriormente para comprender cómo procesar
datos recibidos por endpoints relacionados con integraciones externas.

## Relación con Flow

Este experimento todavía no procesa información real enviada por Flow.

El objetivo es comprender primero el mecanismo HTTP de forma aislada y
controlada.

Posteriormente se podrá comparar este comportamiento con el formato utilizado
por Flow en sus comunicaciones hacia endpoints de integración.

## Limitaciones

El experimento utiliza datos artificiales:

```text
token=LAB-003-TEST
status=1
order=12345
```

No representan una transacción real ni información proveniente de Flow.

Tampoco se implementó todavía:

* validación de parámetros;
* conversión de tipos;
* autenticación;
* persistencia;
* validación de firma;
* HTTPS;
* exposición pública del endpoint.

## Próximos pasos

1. Comprender el manejo de diferentes rutas HTTP.
2. Diferenciar solicitudes destinadas a distintos endpoints.
3. Implementar validaciones básicas.
4. Estudiar cómo exponer un endpoint local para pruebas externas.
5. Posteriormente investigar el comportamiento de callbacks de Flow Sandbox.
