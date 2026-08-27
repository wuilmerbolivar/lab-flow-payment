# LAB-003.3 — Métodos HTTP

## Objetivo

Observar cómo un servidor HTTP recibe diferentes métodos y comprobar que el
método HTTP forma parte de la información de una solicitud.

En esta etapa no se implementa todavía lógica específica para Flow.

El objetivo es comprender el comportamiento básico de HTTP antes de utilizar
el servidor como endpoint para recibir comunicaciones relacionadas con una
transacción.

---

## Hipótesis

Una solicitud HTTP contiene, entre otros elementos:

- método HTTP;
- URL;
- headers;
- body, cuando corresponde.

El servidor puede identificar el método utilizado mediante `req.method`.

---

## Implementación

El servidor LAB-003 utiliza la API nativa `node:http` de Node.js.

La implementación actual registra:

- método;
- URL;
- headers;
- body;
- parámetros recibidos mediante `application/x-www-form-urlencoded`.

Por ahora el servidor responde `HTTP 200 OK` independientemente del método
recibido.

---

## Prueba 1 — GET

Solicitud:

```bash
curl -i http://localhost:3000/
````

Resultado esperado:

```text
HTTP/1.1 200 OK
```

Resultado observado:

```text
Método: GET
URL: /
```

El servidor identifica correctamente la solicitud como `GET`.

---

## Prueba 2 — POST

Solicitud:

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
```

El servidor registra:

```text
Método: POST
URL: /payment-status
```

Y recibe el body:

```text
token=LAB-003-TEST
```

---

## Prueba 3 — POST con múltiples parámetros

Solicitud:

```bash
curl -i \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=LAB-003-TEST&status=1&order=12345" \
  http://localhost:3000/payment-status
```

Resultado observado:

```text
HTTP/1.1 200 OK
```

El servidor registra:

```text
Método: POST
URL: /payment-status
```

Body recibido:

```text
token=LAB-003-TEST&status=1&order=12345
```

Después de procesar `application/x-www-form-urlencoded`:

```text
Parámetros: {
  token: 'LAB-003-TEST',
  status: '1',
  order: '12345'
}
```

---

## Observación

El servidor recibe información diferente dependiendo de la solicitud.

En una solicitud `GET` observamos principalmente:

```text
Método + URL + Headers
```

Mientras que en una solicitud `POST` podemos recibir además información en
el body.

Por ejemplo:

```text
POST /payment-status

Content-Type: application/x-www-form-urlencoded

token=LAB-003-TEST&status=1&order=12345
```

Esto permite distinguir entre:

* dónde se realiza la solicitud (`URL`);
* qué operación HTTP se utiliza (`Método`);
* información adicional sobre la solicitud (`Headers`);
* datos enviados al servidor (`Body`).

---

## Relación con Flow

Durante LAB-002 observamos que Flow puede utilizar una URL de retorno definida
por el comercio.

LAB-003 comienza a reproducir localmente el componente necesario para
comprender qué ocurre cuando un cliente o servicio realiza una solicitud HTTP
contra una URL determinada.

Todavía no estamos implementando un callback real de Flow.

Estamos construyendo primero el conocimiento fundamental necesario para poder
interpretarlo correctamente.

---

## Resultado

**LAB-003.3 — OK**

Se comprobó que el servidor HTTP puede:

* recibir solicitudes `GET`;
* recibir solicitudes `POST`;
* identificar el método HTTP;
* identificar la URL solicitada;
* inspeccionar headers;
* recibir un body;
* procesar datos `application/x-www-form-urlencoded`;
* convertir los parámetros recibidos en una estructura utilizable por
  JavaScript.

---

## Conclusión

Una comunicación HTTP no debe analizarse únicamente observando el body.

Para comprender correctamente una solicitud es necesario considerar como
mínimo:

```text
Método
URL
Headers
Body
```

Este conocimiento será necesario para los siguientes experimentos, donde el
servidor dejará de ser únicamente una herramienta de inspección y comenzará a
procesar solicitudes según reglas específicas.
