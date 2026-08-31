# LAB-009 — Transacción Checkout

## Objetivo

Construir y validar una integración básica de una transacción mediante el Checkout de Flow Sandbox, utilizando Node.js y las credenciales configuradas localmente.

El laboratorio integra en un único flujo las siguientes etapas:

1. Crear una orden mediante `payment/create`.
2. Obtener el `token`, `flowOrder` y URL del Checkout.
3. Abrir el Checkout.
4. Interactuar con el Checkout en Flow Sandbox.
5. Realizar una operación de pago.
6. Consultar posteriormente el estado de la orden mediante `payment/getStatus`.
7. Validar que la orden haya quedado registrada como pagada.

El objetivo principal es pasar de experimentos aislados realizados en laboratorios anteriores a una **integración funcional de extremo a extremo**.

---

# 1. Contexto

Hasta LAB-008 se estudiaron de forma progresiva diferentes componentes de la integración con Flow:

* creación de órdenes;
* estructura de requests HTTP;
* `application/x-www-form-urlencoded`;
* firma HMAC-SHA256;
* callbacks;
* consulta de estado;
* estados de las órdenes;
* ejecución de pagos en Sandbox;
* comportamiento de `checkout_timeout`;
* construcción del Checkout.

LAB-009 reúne varios de estos conocimientos en un único flujo.

La idea ya no es únicamente comprobar que un endpoint responde correctamente, sino reproducir el comportamiento básico que tendría una aplicación que integra Flow como plataforma de pagos.

El flujo implementado es:

```text
Aplicación
    │
    │ POST /payment/create
    ▼
Flow Sandbox
    │
    │ token + flowOrder + url
    ▼
Aplicación
    │
    │ Checkout
    ▼
Flow Checkout
    │
    │ Pago
    ▼
Flow Sandbox
    │
    │ GET /payment/getStatus
    ▼
Aplicación
    │
    ▼
Estado de la orden
```

---

# 2. Hipótesis

Si una aplicación:

1. utiliza credenciales válidas;
2. construye correctamente los parámetros de la orden;
3. genera correctamente la firma HMAC-SHA256;
4. envía la solicitud `payment/create` con el formato esperado;
5. construye correctamente la URL del Checkout utilizando el `token`;
6. permite completar una operación de pago en Sandbox; y
7. consulta posteriormente `payment/getStatus` utilizando el `token` y una firma válida;

entonces debería ser posible obtener el estado actualizado de la orden y comprobar que la transacción fue procesada correctamente.

En el caso de una operación exitosa, se espera obtener:

```text
HTTP 200
status: 2
```

donde `status = 2` representa una orden pagada.

---

# 3. Alcance

Este laboratorio cubre:

* Node.js;
* `axios`;
* `dotenv`;
* variables de entorno;
* generación de identificadores únicos;
* firma HMAC-SHA256;
* `POST /payment/create`;
* construcción del Checkout;
* interacción manual con Sandbox;
* `GET /payment/getStatus`;
* interpretación básica del estado de una orden;
* sanitización de información sensible;
* diagnóstico básico de errores de integración.

Este laboratorio **no implementa todavía**:

* un servidor HTTP propio;
* `urlConfirmation` accesible públicamente;
* procesamiento automático del callback;
* `urlReturn` real;
* persistencia en base de datos;
* manejo de múltiples órdenes;
* idempotencia;
* reintentos automáticos;
* logging estructurado;
* despliegue en producción.

Esos aspectos serán abordados progresivamente en laboratorios posteriores.

---

# 4. Prerrequisitos

Se requiere:

* Node.js;
* npm;
* acceso a Internet;
* una cuenta/configuración de Flow Sandbox;
* `API_KEY`;
* `SECRET_KEY`.

Dependencias utilizadas:

```text
axios
dotenv
```

La versión utilizada del proyecto se encuentra definida en:

```text
package.json
```

---

# 5. Configuración

El proyecto utiliza un archivo `.env` ubicado en la raíz del repositorio.

Ejemplo:

```env
API_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Los valores reales **no deben publicarse en el repositorio**.

El archivo `.env` debe permanecer incluido en `.gitignore`.

La aplicación carga las variables mediante:

```js
dotenv.config({
  path: './.env',
});
```

Posteriormente:

```js
const config = {
  apiUrl: 'https://sandbox.flow.cl/api',
  apiKey: process.env.API_KEY,
  secretKey: process.env.SECRET_KEY,
};
```

Las credenciales no deben aparecer directamente en el código fuente.

---

# 6. Estructura del laboratorio

La estructura utilizada es:

```text
laboratorios/
└── 009-transaccion-checkout/
    ├── 001-transaccion-checkout.md
    └── main.js
```

El archivo ejecutable es:

```text
main.js
```

La documentación del experimento es:

```text
001-transaccion-checkout.md
```

---

# 7. Flujo implementado

El laboratorio se divide en cuatro etapas:

```text
1. CREACIÓN DE ORDEN
        │
        ▼
2. CHECKOUT
        │
        ▼
3. INTERACCIÓN CON CHECKOUT
        │
        ▼
4. CONSULTA DE ESTADO
```

---

# 8. Etapa 1 — Creación de la orden

La aplicación utiliza:

```text
POST /payment/create
```

El endpoint completo es:

```text
https://sandbox.flow.cl/api/payment/create
```

Los parámetros utilizados son:

```js
const params = {
  apiKey: config.apiKey,
  commerceOrder: crypto.randomUUID(),
  urlConfirmation: config.urlConfirmation,
  urlReturn: config.urlReturn,
  email: config.email,
  subject: 'LAB-009 Transaccion Checkout',
  amount: 350,
  currency: 'PEN',
};
```

Entre ellos se encuentran:

* `apiKey`;
* `commerceOrder`;
* `urlConfirmation`;
* `urlReturn`;
* `email`;
* `subject`;
* `amount`;
* `currency`.

---

# 9. Generación de `commerceOrder`

Para cada ejecución se genera un identificador único mediante:

```js
crypto.randomUUID()
```

Ejemplo obtenido durante la prueba:

```text
6d266d1d-135b-4119-8feb-2bc05ab71f06
```

Esto permite diferenciar cada orden creada durante los experimentos.

La relación observada durante la prueba fue:

```text
commerceOrder
6d266d1d-135b-4119-8feb-2bc05ab71f06

flowOrder
10027846
```

`commerceOrder` corresponde al identificador generado por la aplicación, mientras que `flowOrder` es el identificador asignado por Flow.

---

# 10. Generación de la firma

Flow requiere que los parámetros sean firmados.

El proceso implementado es:

```text
Parámetros
    │
    ▼
Ordenamiento alfabético
    │
    ▼
nombre + valor
    │
    ▼
Concatenación
    │
    ▼
HMAC-SHA256
    │
    ▼
s
```

El código utiliza:

```js
const sortedParams = Object.entries(params).sort(
  ([keyA], [keyB]) => keyA.localeCompare(keyB),
);
```

Posteriormente:

```js
const toSign = sortedParams
  .map(([key, value]) => `${key}${value}`)
  .join('');
```

Por ejemplo, conceptualmente:

```text
amount350
apiKeyXXXXXXXX
commerceOrderXXXXXXXX
currencyPEN
emailXXXXXXXX
subjectLAB-009 Transaccion Checkout
urlConfirmationhttps://example.com/confirmation
urlReturnhttps://example.com/payment-status
```

El resultado se concatena sin separadores.

Posteriormente se genera:

```js
const signature = crypto
  .createHmac('sha256', config.secretKey)
  .update(toSign)
  .digest('hex');
```

Finalmente:

```js
params.s = signature;
```

---

# 11. Envío de `payment/create`

Flow espera los parámetros utilizando:

```text
application/x-www-form-urlencoded
```

Por esta razón se utiliza:

```js
const encodedBody = querystring.stringify(params);
```

La solicitud se realiza mediante:

```js
axios.post(
  `${config.apiUrl}/payment/create`,
  encodedBody,
  {
    headers: {
      'Content-Type':
        'application/x-www-form-urlencoded',
    },
  },
);
```

---

# 12. Resultado de la creación de la orden

Durante la ejecución validada se obtuvo:

```text
Respuesta de Flow
----------------------------------------
HTTP: 200

Respuesta sanitizada: {
  token: '83849B...',
  url: 'https://sandbox.flow.cl/app/web/pay.php',
  flowOrder: 10027846
}
```

Esto demuestra que:

```text
payment/create
       │
       └── HTTP 200
              │
              ├── token
              ├── url
              └── flowOrder
```

La creación de la orden fue exitosa.

---

# 13. Validación de la respuesta

El código valida que la respuesta contenga:

```text
token
flowOrder
url
```

Se comprueba primero que la respuesta sea un objeto:

```js
if (!data || typeof data !== 'object') {
  throw new Error(
    'La respuesta de Flow no tiene el formato esperado.',
  );
}
```

Después:

```js
if (!data.token) {
  throw new Error(
    'La respuesta no contiene token.',
  );
}
```

```js
if (!data.flowOrder) {
  throw new Error(
    'La respuesta no contiene flowOrder.',
  );
}
```

```js
if (!data.url) {
  throw new Error(
    'La respuesta no contiene url.',
  );
}
```

Esto evita continuar con una respuesta incompleta.

---

# 14. Etapa 2 — Construcción del Checkout

Una vez creada la orden, Flow devuelve:

```text
url
token
flowOrder
```

La aplicación construye la URL del Checkout:

```js
const checkoutUrl = `${data.url}?token=${data.token}`;
```

Conceptualmente:

```text
https://sandbox.flow.cl/app/web/pay.php?token=<token>
```

Durante la ejecución se mostró la versión sanitizada:

```text
URL: https://sandbox.flow.cl/app/web/pay.php?token=83849B...
```

El token completo no se muestra en la salida normal de la aplicación.

---

# 15. Apertura automática del Checkout

El laboratorio admite:

```bash
node laboratorios/009-transaccion-checkout/main.js --open
```

Cuando se utiliza `--open`, el programa intenta abrir el Checkout mediante el navegador predeterminado.

En Linux utiliza:

```text
xdg-open
```

En macOS:

```text
open
```

En Windows:

```text
cmd /c start
```

El token completo solamente se utiliza localmente para construir la URL que se entrega al sistema operativo.

No se imprime completo en stdout.

---

# 16. Etapa 3 — Interacción con Checkout

Después de abrir el Checkout, el programa espera la interacción del usuario.

La consola muestra:

```text
3. INTERACCION CON CHECKOUT
----------------------------------------
Realiza la operación correspondiente en Flow Sandbox.
Cuando hayas terminado la interacción con Checkout, presiona ENTER:
```

Esto permite completar manualmente la operación dentro de Flow Sandbox.

La ejecución validada utilizó:

```text
Pago con YAPE
```

Una vez finalizada la operación, se presiona ENTER para continuar.

---

# 17. Etapa 4 — Consulta del estado

Una vez terminada la interacción con Checkout, el laboratorio consulta:

```text
GET /payment/getStatus
```

Endpoint:

```text
https://sandbox.flow.cl/api/payment/getStatus
```

La consulta utiliza:

```js
const params = {
  apiKey: config.apiKey,
  token,
};
```

Estos parámetros también deben firmarse.

---

# 18. Firma de `getStatus`

Los parámetros utilizados son:

```text
apiKey
token
```

Se ordenan alfabéticamente:

```text
apiKey
token
```

El `string-to-sign` resultante tiene la forma:

```text
apiKey<API_KEY>token<TOKEN>
```

Posteriormente se genera nuevamente una firma HMAC-SHA256 utilizando `SECRET_KEY`.

Finalmente se construye:

```js
const requestParams = {
  ...params,
  s: signature,
};
```

---

# 19. Consulta mediante HTTP GET

La consulta se realiza utilizando:

```js
axios.get(
  `${config.apiUrl}/payment/getStatus`,
  {
    params: requestParams,
  },
);
```

Esto genera conceptualmente una solicitud:

```text
GET /payment/getStatus
    ?apiKey=...
    &token=...
    &s=...
```

Este punto es importante porque la implementación fue contrastada con el comportamiento previamente validado en LAB-005.

---

# 20. Incidencia encontrada durante el laboratorio

Durante las primeras ejecuciones de LAB-009 se obtuvo:

```text
ERROR
----------------------------------------
HTTP: 400
Respuesta de Flow:
{
  code: 105,
  message: 'No services available'
}
```

Inicialmente esto parecía indicar un problema con la disponibilidad del servicio.

Sin embargo, se realizó una prueba adicional utilizando exactamente el mismo `token` mediante LAB-005.

La orden correspondiente era:

```text
flowOrder: 10027845
```

La consulta mediante LAB-005 produjo:

```text
HTTP: 200
status: 1
```

Posteriormente, después de completar el pago, la misma orden produjo:

```text
HTTP: 200
status: 2
```

Por lo tanto, se comprobó que:

```text
El token era válido
La orden existía
getStatus estaba disponible
```

La diferencia estaba en la implementación de la consulta utilizada por LAB-009.

---

# 21. Diagnóstico de la incidencia

La comparación con LAB-005 permitió identificar que el patrón validado era:

```js
axios.get(API_URL, {
  params: requestParams,
});
```

LAB-009 fue corregido para utilizar exactamente este mecanismo.

Después de la corrección se volvió a ejecutar el laboratorio completo.

El resultado fue:

```text
payment/create
        ↓
HTTP 200
        ↓
Checkout
        ↓
Pago
        ↓
payment/getStatus
        ↓
HTTP 200
        ↓
status 2
```

La incidencia quedó resuelta.

---

# 22. Resultado final

La ejecución definitiva produjo:

```text
LAB-009 — Transacción Checkout
========================================

1. CREACION DE ORDEN
----------------------------------------
Endpoint:
https://sandbox.flow.cl/api/payment/create

commerceOrder:
6d266d1d-135b-4119-8feb-2bc05ab71f06

HTTP:
200
```

Flow devolvió:

```text
token: 83849B...
url: https://sandbox.flow.cl/app/web/pay.php
flowOrder: 10027846
```

Posteriormente se abrió el Checkout y se realizó una operación de pago.

Finalmente:

```text
4. CONSULTA DE ESTADO
----------------------------------------

Endpoint:
https://sandbox.flow.cl/api/payment/getStatus

HTTP:
200
```

Resultado:

```text
flowOrder: 10027846
commerceOrder: 6d266d1d-135b-4119-8feb-2bc05ab71f06
status: 2
subject: LAB-009 Transaccion Checkout
amount: 350
currency: PEN
```

Datos del pago:

```text
date: 2026-08-31 01:19:12
media: Pago con YAPE
amount: 350.00
currency: PEN
```

---

# 23. Resultado de la hipótesis

La hipótesis se considera **confirmada para el escenario probado**.

Se comprobó que una aplicación puede:

```text
Crear orden
    ↓
Obtener token
    ↓
Construir Checkout
    ↓
Abrir Checkout
    ↓
Realizar pago
    ↓
Consultar estado
    ↓
Obtener status = 2
```

La prueba se realizó utilizando Flow Sandbox.

---

# 24. Estado `status = 2`

La respuesta final indicó:

```text
status: 2
```

Este estado corresponde a una orden pagada.

Además, la respuesta proporcionó información consistente con el pago:

```text
paymentData.date
paymentData.media
paymentData.amount
paymentData.currency
```

En la prueba:

```text
media:
Pago con YAPE

amount:
350.00

currency:
PEN
```

Por lo tanto, no solamente se obtuvo un código de estado exitoso, sino también información asociada a la transacción.

---

# 25. Relación entre `commerceOrder` y `flowOrder`

El laboratorio permite observar dos identificadores diferentes:

```text
commerceOrder:
6d266d1d-135b-4119-8feb-2bc05ab71f06

flowOrder:
10027846
```

La aplicación genera:

```text
commerceOrder
```

mientras Flow proporciona:

```text
flowOrder
```

En un escenario real de soporte, ambos identificadores pueden ser útiles para localizar y correlacionar una transacción.

Por ejemplo:

```text
Cliente
   │
   │ indica commerceOrder
   ▼
Comercio
   │
   │ relaciona con flowOrder
   ▼
Flow
```

Esto será especialmente relevante en laboratorios posteriores orientados a diagnóstico.

---

# 26. Seguridad de la información

Durante el laboratorio se aplicó una política básica de sanitización.

Los siguientes valores no se muestran completos:

```text
API_KEY
SECRET_KEY
token
firma
```

Por ejemplo:

```text
API_KEY:
1F1542...

token:
83849B...

firma:
4a8416...
```

El token completo solamente se utiliza internamente para:

* construir la URL del Checkout;
* realizar la consulta de estado.

Las credenciales reales permanecen en `.env`.

Nunca deben incluirse en:

* código fuente;
* documentación pública;
* commits;
* logs públicos;
* capturas de pantalla;
* mensajes de soporte.

---

# 27. Diagnóstico desde la perspectiva N2

Este laboratorio introduce una metodología importante para soporte técnico.

Cuando un usuario informa:

> "El pago no aparece en mi sistema."

no debería asumirse inmediatamente que existe un problema en Flow.

Debe determinarse primero **en qué etapa del flujo se produjo el problema**.

Una investigación inicial podría dividirse así:

```text
1. ¿Se creó la orden?
        │
        ├── NO → revisar payment/create
        │
        └── SÍ
             │
             ▼
2. ¿Existe token?
             │
             ▼
3. ¿El Checkout abre?
             │
             ▼
4. ¿El usuario completó el pago?
             │
             ▼
5. ¿Qué devuelve getStatus?
             │
             ▼
6. ¿Cuál es el status?
```

Esto permite evitar diagnósticos basados únicamente en el mensaje del usuario.

---

# 28. Matriz de responsabilidad

El flujo permite separar diferentes componentes:

| Componente                  | Participante principal           |
| --------------------------- | -------------------------------- |
| Credenciales                | Comercio / Flow                  |
| Construcción del request    | Aplicación del comercio          |
| Firma HMAC                  | Aplicación del comercio          |
| `payment/create`            | Comercio → Flow                  |
| Creación de orden           | Flow                             |
| Checkout                    | Flow                             |
| Selección del medio de pago | Usuario                          |
| Procesamiento del pago      | Flow / proveedor correspondiente |
| `urlConfirmation`           | Flow → comercio                  |
| `getStatus`                 | Comercio → Flow                  |
| Interpretación del estado   | Aplicación del comercio          |
| `urlReturn`                 | Flow → comercio                  |

Esta separación permite establecer dónde investigar cuando ocurre una incidencia.

---

# 29. Qué aprendimos

LAB-009 permitió integrar conocimientos obtenidos en varios laboratorios anteriores.

### API

Se reforzó el uso de:

```text
POST /payment/create
GET /payment/getStatus
```

### HTTP

Se comprobó que:

```text
payment/create
→ POST
→ application/x-www-form-urlencoded
```

mientras:

```text
payment/getStatus
→ GET
→ parámetros mediante query string
```

### Seguridad

Se reforzó:

```text
HMAC-SHA256
```

y el uso de:

```text
API_KEY
SECRET_KEY
```

mediante variables de entorno.

### Checkout

Se comprobó que el resultado de `payment/create` proporciona la información necesaria para construir el Checkout.

### Estado

Se comprobó experimentalmente el cambio:

```text
status = 1
```

a:

```text
status = 2
```

después del pago.

### Diagnóstico

Se comprobó la importancia de comparar una implementación nueva contra una implementación previamente validada.

---

# 30. Lección principal del laboratorio

La lección más importante de LAB-009 no es únicamente:

```text
"Cómo hacer un pago."
```

Es:

```text
"Cómo seguir una transacción a través de sus diferentes etapas."
```

Una transacción no debe considerarse un único request.

El flujo completo es:

```text
Orden
  ↓
Checkout
  ↓
Interacción
  ↓
Pago
  ↓
Confirmación
  ↓
Consulta de estado
  ↓
Resultado
```

Por esta razón, ante un incidente es fundamental determinar:

> **¿En qué etapa exacta del flujo se encuentra el problema?**

---

# 31. Limitaciones

Este laboratorio utiliza:

```text
urlConfirmation = https://example.com/confirmation
urlReturn       = https://example.com/payment-status
```

Estas URLs son valores de prueba y no representan todavía endpoints implementados por nuestra aplicación.

Por lo tanto, LAB-009 demuestra:

```text
crear orden
→ Checkout
→ pago
→ consulta de estado
```

pero todavía no demuestra:

```text
Flow
  │
  │ POST callback
  ▼
Aplicación real
```

Ese comportamiento será implementado en laboratorios posteriores.

---

# 32. Reproducción

Desde la raíz del proyecto:

```bash
node laboratorios/009-transaccion-checkout/main.js --open
```

El flujo esperado es:

```text
1. Crear orden
2. Obtener token
3. Abrir Checkout
4. Completar operación en Sandbox
5. Presionar ENTER
6. Consultar estado
7. Obtener HTTP 200
8. Revisar status
```

Para verificar solamente la sintaxis:

```bash
node --check laboratorios/009-transaccion-checkout/main.js
```

Resultado esperado:

```text
0
```

---

# 33. Evidencia de ejecución

Ejecución validada:

```text
commerceOrder:
6d266d1d-135b-4119-8feb-2bc05ab71f06

flowOrder:
10027846

payment/create:
HTTP 200

payment/getStatus:
HTTP 200

status:
2

medio:
Pago con YAPE

amount:
350.00 PEN
```

La prueba confirma una transacción completada correctamente en Flow Sandbox.

---

# 34. Conclusión

LAB-009 logró construir y validar la primera integración funcional de Checkout del proyecto.

Se comprobó el flujo:

```text
Aplicación
    │
    │ payment/create
    ▼
Flow Sandbox
    │
    │ token + flowOrder
    ▼
Checkout
    │
    │ pago
    ▼
Flow
    │
    │ payment/getStatus
    ▼
Aplicación
    │
    ▼
status = 2
```

El laboratorio también permitió reproducir una incidencia durante la implementación y resolverla mediante comparación con una implementación previamente validada.

Esto marca una transición importante en el proyecto:

```text
LAB-001 → LAB-007
Experimentación de componentes

LAB-008
Primera integración de creación de orden

LAB-009
Integración funcional de Checkout

LAB-010+
Integración y diagnóstico de callbacks,
retornos y escenarios de error
```

El siguiente paso será implementar y observar el comportamiento real de `urlConfirmation`, permitiendo que Flow comunique a nuestra aplicación el resultado de una transacción.

---

# 35. Próximo laboratorio

## LAB-010 — Callback de confirmación de pago

El siguiente laboratorio estará orientado a implementar un endpoint HTTP real para recibir:

```text
POST urlConfirmation
```

El flujo evolucionará hacia:

```text
Checkout
    │
    │ pago
    ▼
Flow
    │
    │ POST urlConfirmation
    ▼
Servidor del comercio
    │
    │ token
    ▼
payment/getStatus
    │
    ▼
Estado real de la orden
```

Esto permitirá comenzar a estudiar problemas de integración como:

* callback no accesible;
* HTTP 400;
* HTTP 500;
* timeout;
* callback lento;
* parámetros incorrectos;
* consulta posterior del estado;
* diferencias entre confirmación y estado;
* procesamiento duplicado.

Con LAB-010 comenzará la siguiente etapa del laboratorio: **diagnóstico de la comunicación entre Flow y la aplicación del comercio**.
