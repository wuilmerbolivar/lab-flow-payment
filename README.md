# Laboratorio Flow Payment

Laboratorio personal de aprendizaje, investigación y experimentación técnica orientado a comprender la integración, operación, diagnóstico y evolución de soluciones basadas en plataformas de pago y APIs.

El proyecto utiliza **Flow Sandbox** como entorno de experimentación y reproduce progresivamente escenarios de integración que permiten estudiar el comportamiento de una pasarela de pagos desde la perspectiva de un desarrollador y de soporte técnico.

> **Entorno:** Flow Sandbox
> **Lenguaje principal:** JavaScript / Node.js
> **Documentación:** Español
> **Estado:** En desarrollo
> **Propósito:** Formación técnica, experimentación reproducible y documentación

---

## 1. Objetivo

El objetivo del laboratorio es construir conocimiento práctico sobre una integración de pagos mediante experimentos controlados y reproducibles.

El proyecto no busca únicamente demostrar cómo consumir una API. Busca comprender **qué ocurre en cada etapa del flujo de pago**, cómo interactúan sus componentes y cómo diagnosticar fallos cuando una transacción no se comporta como se espera.

El enfoque evoluciona progresivamente desde:

```text
API
 │
 ├── HTTP
 ├── autenticación
 ├── firma HMAC
 ├── creación de órdenes
 ├── Checkout
 ├── callbacks
 └── consulta de estados
```

hacia:

```text
Integración
 │
 ├── flujo completo de pago
 ├── observabilidad
 ├── diagnóstico
 ├── reproducción de incidentes
 ├── análisis de estados
 └── troubleshooting
```

---

# 2. Alcance

El laboratorio cubre progresivamente los siguientes componentes:

* Consumo de APIs HTTP.
* Métodos `GET` y `POST`.
* Parámetros `application/x-www-form-urlencoded`.
* Autenticación mediante `apiKey`.
* Firma HMAC-SHA256.
* Creación de órdenes.
* Generación y utilización de tokens.
* Checkout.
* Consulta de estado de órdenes.
* Callbacks de confirmación.
* URLs de retorno.
* Estados de transacciones.
* Timeouts del Checkout.
* Validación de respuestas.
* Manejo de errores HTTP y errores funcionales.
* Registro de evidencias.
* Reproducción de incidentes.
* Diagnóstico de problemas de integración.

El laboratorio se mantiene deliberadamente orientado a **Sandbox** y no pretende representar una integración productiva.

---

# 3. Filosofía del laboratorio

Cada laboratorio debe responder una pregunta técnica concreta.

No se trata simplemente de ejecutar código y obtener una respuesta `HTTP 200`.

El proceso utilizado es:

```text
Hipótesis
    │
    ▼
Implementación
    │
    ▼
Ejecución
    │
    ▼
Observación
    │
    ▼
Evidencia
    │
    ▼
Conclusión
```

Cuando un comportamiento no coincide con la hipótesis inicial, el resultado también se considera válido.

De esta manera, un error puede convertirse en una evidencia útil para comprender el sistema.

---

# 4. Arquitectura conceptual

El flujo de integración estudiado por el proyecto puede representarse inicialmente así:

```text
┌─────────────────────┐
│ Aplicación comercio │
└──────────┬──────────┘
           │
           │ payment/create
           ▼
┌─────────────────────┐
│     Flow API        │
└──────────┬──────────┘
           │
           │ token + url
           ▼
┌─────────────────────┐
│   Flow Checkout     │
└──────────┬──────────┘
           │
           │ interacción
           │ con medio de pago
           ▼
┌─────────────────────┐
│ Resultado operación │
└──────────┬──────────┘
           │
           ├──────────────► urlConfirmation
           │
           ▼
┌─────────────────────┐
│ Aplicación comercio │
└──────────┬──────────┘
           │
           │ payment/getStatus
           ▼
┌─────────────────────┐
│     Flow API        │
└─────────────────────┘
```

Posteriormente el laboratorio incorpora otros componentes como:

* callbacks;
* retorno del usuario;
* validación de estados;
* errores de comunicación;
* problemas de disponibilidad;
* problemas de firma;
* problemas de configuración.

---

# 5. Estructura del proyecto

La estructura actual está organizada por laboratorios independientes:

```text
laboratorios/
├── 001-quickstart/
│   ├── 001-validacion-creacion-orden.md
│   └── main.js
│
├── 002-checkout/
│   └── 002-exploracion-checkout.md
│
├── 003-endpoint-http/
│   ├── 001-inspeccion-request.md
│   ├── 002-form-urlencoded.md
│   ├── 003-metodos-http.md
│   └── main.js
│
├── 004-callback-flow/
│   ├── 001-callback-basico.md
│   ├── 002-contrato-url-confirmation.md
│   └── main.js
│
├── 005-consulta-estado/
│   ├── 001-consulta-estado-token.md
│   ├── 002-estados-orden.md
│   └── main.js
│
├── 006-pago-sandbox/
│   └── 001-pago-y-consulta-estado.md
│
├── 007-timeout-orden/
│   ├── 001-checkout-timeout.md
│   ├── 007-timeout-orden.log
│   └── main.sh
│
└── 008-integracion-checkout/
    ├── 001-creacion-orden.md
    ├── 008-integracion-checkout.log
    └── main.js
```

El siguiente laboratorio continúa esta evolución:

```text
laboratorios/
└── 009-transaccion-checkout/
    ├── 001-transaccion-checkout.md
    └── main.js
```

---

# 6. Estado actual de los laboratorios

## LAB-001 — Quickstart

Primera aproximación a Flow Sandbox.

Se estudió:

* creación de órdenes;
* parámetros básicos;
* firma;
* respuesta de Flow;
* token;
* `flowOrder`.

---

## LAB-002 — Checkout

Exploración del Checkout generado a partir de la orden.

Objetivo:

```text
Orden
  ↓
token
  ↓
Checkout
```

---

## LAB-003 — Endpoint HTTP

Investigación del comportamiento HTTP utilizado por Flow.

Se estudiaron:

* requests;
* métodos HTTP;
* `POST`;
* `GET`;
* `application/x-www-form-urlencoded`;
* estructura de parámetros.

---

## LAB-004 — Callback Flow

Estudio conceptual y experimental del mecanismo de confirmación.

Se analizó:

* `urlConfirmation`;
* comportamiento del callback;
* contrato HTTP;
* relación entre callback y consulta posterior;
* `payment/getStatus`.

---

## LAB-005 — Consulta de estado

Implementación de consulta mediante:

```text
GET /api/payment/getStatus
```

Se estudió la firma de la petición y los estados de una orden.

Estados observados/documentados:

| Estado | Significado       |
| -----: | ----------------- |
|    `1` | Pendiente de pago |
|    `2` | Pagada            |
|    `3` | Rechazada         |
|    `4` | Anulada           |

---

## LAB-006 — Pago Sandbox

Experimentación con un flujo de pago utilizando Sandbox y posterior consulta del estado.

Flujo:

```text
Crear orden
    ↓
Checkout
    ↓
Pago Sandbox
    ↓
getStatus
    ↓
Estado
```

---

## LAB-007 — Timeout de orden

Experimento específico sobre:

```text
checkout_timeout
```

Se investigó el comportamiento de una orden cuando el usuario no selecciona un medio de pago dentro del tiempo configurado.

Este laboratorio permitió diferenciar:

```text
timeout del Checkout
```

de:

```text
tiempo total de vida de una orden
```

El experimento también permitió relacionar el comportamiento observado con el estado de una orden.

---

## LAB-008 — Integración básica de Checkout

Primer laboratorio con orientación explícita hacia una **integración realista desde el punto de vista del comercio**.

Se dejó de depender de los laboratorios anteriores como cajas negras y se implementó directamente:

```text
Configuración
    ↓
parámetros
    ↓
ordenamiento
    ↓
firma HMAC-SHA256
    ↓
POST /payment/create
    ↓
token + flowOrder + url
    ↓
Checkout
```

Además se incorporó:

* validación de variables de entorno;
* validación de respuesta;
* sanitización de credenciales;
* sanitización del token;
* apertura opcional del navegador;
* manejo de errores;
* registro reproducible.

---

## LAB-009 — Transacción Checkout

Primer laboratorio orientado al **flujo transaccional completo básico**.

El objetivo es conectar las piezas estudiadas anteriormente:

```text
Crear orden
    ↓
Obtener token
    ↓
Abrir Checkout
    ↓
Realizar operación
    ↓
Consultar estado
    ↓
Interpretar resultado
```

La implementación utiliza:

```text
POST /payment/create
```

y posteriormente:

```text
GET /payment/getStatus
```

Durante la ejecución se registra:

* `commerceOrder`;
* `flowOrder`;
* token sanitizado;
* endpoint;
* parámetros utilizados;
* string de firma;
* firma HMAC;
* respuesta HTTP;
* estado de la orden;
* datos del pago.

Un resultado exitoso observado en Sandbox permitió verificar:

```text
status: 2
```

con datos de pago asociados a:

```text
media: Pago con YAPE
```

Este laboratorio representa el punto de transición desde experimentos individuales hacia una **integración funcional reproducible**.

---

# 7. Flujo de una transacción

El flujo implementado actualmente puede representarse así:

```text
                LAB-009
                   │
                   ▼
        ┌────────────────────┐
        │ Generar orden      │
        │ commerceOrder      │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ Firmar parámetros  │
        │ HMAC-SHA256        │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ payment/create      │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ token              │
        │ flowOrder          │
        │ url                │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ Checkout           │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ Operación Sandbox  │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ payment/getStatus  │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ Estado transacción │
        └────────────────────┘
```

---

# 8. Seguridad

Las credenciales utilizadas por Flow **nunca deben almacenarse directamente en el código fuente**.

El proyecto utiliza variables de entorno:

```text
API_KEY
SECRET_KEY
```

Ejemplo conceptual:

```env
API_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

El archivo `.env` debe permanecer fuera del control de versiones.

Se recomienda mantener un archivo `.env.example` sin credenciales reales:

```env
API_KEY=
SECRET_KEY=
```

### Nunca publicar

* API Key real.
* Secret Key real.
* Tokens completos.
* Credenciales de usuario.
* Información sensible de transacciones.

Los logs del laboratorio deben sanitizar los valores sensibles.

---

# 9. Firma HMAC

Una parte fundamental del laboratorio es comprender cómo se construye la firma.

Conceptualmente:

```text
parámetros
    ↓
orden alfabético
    ↓
nombre + valor
    ↓
concatenación
    ↓
HMAC-SHA256
    ↓
s
```

Ejemplo conceptual:

```text
amount350
apiKeyXXXX
commerceOrderXXXX
currencyPEN
...
```

Se concatena:

```text
amount350apiKeyXXXXcommerceOrder...
```

y se genera:

```text
HMAC-SHA256(secretKey, stringToSign)
```

La firma resultante se incorpora como:

```text
s=<firma>
```

Comprender esta etapa es fundamental para diagnosticar errores de autenticación y solicitudes rechazadas.

---

# 10. Variables de entorno

La configuración local esperada es:

```env
API_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Las credenciales reales deben mantenerse únicamente en el entorno local.

El proyecto utiliza `dotenv` para cargarlas durante la ejecución.

---

# 11. Dependencias

El proyecto utiliza actualmente:

* Node.js;
* npm;
* Axios;
* dotenv.

Instalación:

```bash
npm install
```

---

# 12. Ejecución

Los laboratorios pueden ejecutarse directamente con Node.js.

Ejemplo:

```bash
node laboratorios/008-integracion-checkout/main.js
```

Para el laboratorio transaccional:

```bash
node laboratorios/009-transaccion-checkout/main.js
```

Cuando el laboratorio soporte apertura automática del Checkout:

```bash
node laboratorios/009-transaccion-checkout/main.js --open
```

---

# 13. Registro de evidencias

Los laboratorios pueden generar registros de ejecución para documentar resultados.

Ejemplo:

```bash
node laboratorios/008-integracion-checkout/main.js \
  | tee laboratorios/008-integracion-checkout/008-integracion-checkout.log
```

Los logs sirven como evidencia experimental y permiten comparar diferentes ejecuciones.

No deben contener:

```text
SECRET_KEY completa
API_KEY completa
TOKEN completo
```

---

# 14. Enfoque de diagnóstico

A partir de LAB-008/LAB-009, el laboratorio comienza a incorporar una perspectiva de troubleshooting.

Ante un problema de pago, no se debe asumir inmediatamente que el problema pertenece a Flow.

La investigación debe determinar **en qué componente se rompe el flujo**.

Conceptualmente:

```text
Cliente
  │
  ▼
Aplicación del comercio
  │
  ▼
Request
  │
  ▼
Flow API
  │
  ▼
Checkout
  │
  ▼
Medio de pago
  │
  ▼
Resultado
  │
  ▼
Callback
  │
  ▼
Consulta de estado
```

Cada frontera representa un posible punto de fallo.

---

# 15. Modelo de diagnóstico

Para una incidencia se buscará identificar:

```text
1. ¿La orden fue creada?
2. ¿La API respondió correctamente?
3. ¿Existe flowOrder?
4. ¿Existe token?
5. ¿El Checkout puede abrirse?
6. ¿El usuario pudo interactuar?
7. ¿La operación fue procesada?
8. ¿Se recibió confirmación?
9. ¿El estado fue consultado?
10. ¿El estado coincide con la operación?
```

Esto permite pasar de:

> "El pago no funciona"

a:

> "La orden fue creada correctamente, el Checkout fue generado, la operación fue procesada y `getStatus` devuelve `status=2`; el problema se encuentra posteriormente en la aplicación del comercio."

Ese cambio de precisión es uno de los objetivos principales del proyecto.

---

# 16. Casos de diagnóstico futuros

Los siguientes laboratorios estarán orientados progresivamente a reproducir problemas de integración.

Entre ellos:

```text
Pago realizado pero estado pendiente
```

```text
Callback no recibido
```

```text
Callback devuelve HTTP 500
```

```text
Callback tarda demasiado
```

```text
Callback inaccesible
```

```text
Firma inválida
```

```text
API Key incorrecta
```

```text
Secret Key incorrecta
```

```text
Checkout no disponible
```

```text
Orden anulada
```

```text
Pago rechazado
```

```text
Estado diferente al esperado
```

```text
Sandbox vs producción
```

```text
Problemas de red / DNS / TLS
```

---

# 17. Roadmap

La evolución prevista del laboratorio es:

```text
LAB-001
Quickstart
   │
   ▼
LAB-002
Checkout
   │
   ▼
LAB-003
HTTP
   │
   ▼
LAB-004
Callbacks
   │
   ▼
LAB-005
Estados
   │
   ▼
LAB-006
Pago Sandbox
   │
   ▼
LAB-007
Timeout
   │
   ▼
LAB-008
Integración Checkout
   │
   ▼
LAB-009
Transacción Checkout
   │
   ▼
LAB-010
Callback de confirmación
   │
   ▼
LAB-011
Consulta de estado integrada
   │
   ▼
LAB-012
Retorno del cliente
   │
   ▼
LAB-013
Flujo end-to-end
   │
   ▼
LAB-014+
Escenarios de fallo
   │
   ▼
Diagnóstico de incidentes
```

La numeración futura puede evolucionar conforme los experimentos descubran nuevas dependencias o sea necesario dividir determinados temas.

---

# 18. Tecnologías

### Actualmente

```text
Node.js
JavaScript
npm
Axios
dotenv
HTTP/HTTPS
HMAC-SHA256
cURL
Flow Sandbox
```

### Tecnologías previstas

```text
Python
SQL
PostgreSQL
TypeScript
Testing
Docker
Observabilidad
```

Estas tecnologías se incorporarán progresivamente cuando sean necesarias para responder preguntas concretas del laboratorio.

---

# 19. Principios del proyecto

El laboratorio sigue algunos principios:

### 19.1 Experimentación reproducible

Cada comportamiento importante debe poder reproducirse.

### 19.2 Evidencia antes que suposición

Las conclusiones deben basarse preferentemente en:

* respuestas HTTP;
* logs;
* estados;
* documentación;
* comportamiento observable.

### 19.3 Separación de componentes

Siempre que sea posible se debe identificar si el problema pertenece a:

```text
Aplicación
API
Checkout
Medio de pago
Callback
Red
Configuración
```

### 19.4 Seguridad

Las credenciales y tokens no deben publicarse.

### 19.5 Documentación

Cada experimento debe dejar registrado:

```text
Objetivo
Hipótesis
Preparación
Implementación
Ejecución
Resultado
Evidencia
Conclusión
```

### 19.6 Progresión

Los laboratorios posteriores deben aprovechar los conocimientos obtenidos en los anteriores.

---

# 20. Qué representa este proyecto

Este repositorio no pretende ser un SDK de Flow ni una implementación productiva.

Es un **entorno de experimentación técnica**.

Su valor está en documentar el proceso mediante el cual se comprende una integración:

```text
¿Qué envía la aplicación?
        ↓
¿Cómo lo firma?
        ↓
¿Qué responde Flow?
        ↓
¿Qué representa el token?
        ↓
¿Cómo funciona el Checkout?
        ↓
¿Qué ocurre después del pago?
        ↓
¿Cómo se determina el estado?
        ↓
¿Qué ocurre cuando algo falla?
        ↓
¿Cómo se diagnostica?
```

El objetivo final es poder observar una transacción no solamente desde el punto de vista de "funciona / no funciona", sino desde el punto de vista de **componentes, estados, evidencias y puntos de fallo**.

---

# 21. Referencias

Documentación oficial de Flow:

* API de Flow.
* Tutorial de integración.
* Creación de órdenes.
* Checkout.
* Confirmación de órdenes.
* Consulta de estado.
* Estados de las órdenes.

El laboratorio utiliza exclusivamente **Flow Sandbox** para las pruebas.

---

# 22. Licencia

Este proyecto se distribuye bajo licencia MIT.

Consulta el archivo [`LICENSE`](LICENSE) para conocer los términos completos.
