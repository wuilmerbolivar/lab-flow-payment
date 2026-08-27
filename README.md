# Laboratorio Flow Payment

Laboratorio personal de aprendizaje, investigación y experimentación técnica
orientado a comprender la integración, operación, diagnóstico y evolución de
soluciones basadas en plataformas de pago y APIs.

## Objetivo

Este repositorio documenta un proceso progresivo de aprendizaje práctico
utilizando Flow Sandbox como plataforma de experimentación.

El laboratorio comienza desde los fundamentos de una integración de API y
evoluciona progresivamente hacia temas de:

- APIs REST
- HTTP/HTTPS
- Autenticación
- HMAC-SHA256
- Transacciones
- Callbacks y webhooks
- SQL
- QA
- Troubleshooting
- Seguridad
- Automatización
- Observabilidad
- DevOps
- Arquitectura

Flow constituye el entorno práctico de experimentación, mientras que los
conocimientos obtenidos buscan ser aplicables más allá de una plataforma
específica.

## Enfoque

El laboratorio prioriza la experimentación reproducible y la evidencia.

Cada experimento busca documentar:

1. Qué queremos conocer.
2. Nuestra hipótesis.
3. Qué indica la documentación oficial.
4. Cómo reproducimos el escenario.
5. Qué esperamos obtener.
6. Qué ocurrió realmente.
7. Qué evidencia obtuvimos.
8. Por qué ocurrió.
9. Qué aprendimos.
10. Qué limitaciones tiene la conclusión.

Los resultados negativos y experimentos fallidos también forman parte del
aprendizaje.

## Entorno

Las experimentaciones se realizan exclusivamente contra Flow Sandbox.

Producción queda fuera del alcance experimental de este repositorio.

Las credenciales utilizadas por el laboratorio son privadas y nunca deben
publicarse.

## Fuentes oficiales

- [Documentación para desarrolladores de Flow](https://developers.flow.cl/)
- [Primeros pasos](https://developers.flow.cl/docs/intro)
- [Quickstart](https://developers.flow.cl/docs/quick-start)
- [Credenciales de prueba](https://developers.flow.cl/docs/credentials)
- [Flow Sandbox API](https://sandbox.flow.cl/api)

## Estado

Proyecto en fase inicial de fundación.

El primer objetivo técnico será reproducir el Quickstart oficial de Flow
utilizando JavaScript/Node.js contra el ambiente Sandbox.

## Laboratorios

### LAB-001 — Reproducir Quickstart de Flow con Node.js

Estado: **Completado**

Primer laboratorio del proyecto. Se reprodujo el flujo básico de creación de
una orden utilizando Node.js contra Flow Sandbox.

Resultados principales:

- Configuración de credenciales mediante variables de entorno.
- Construcción de parámetros.
- Generación de firma HMAC-SHA256.
- Comunicación con `payment/create`.
- Análisis de respuestas HTTP exitosas y errores.
- Creación de una orden válida en PEN.
- Obtención de `token`, `url` y `flowOrder`.
- Acceso al Checkout Sandbox.
- Exploración de medios de pago.
- Exploración del simulador de pagos.
- Observación del comportamiento de `urlReturn`.

Documentación:

- [Validación de creación de orden](laboratorios/001-quickstart/001-validacion-creacion-orden.md)
- [Exploración del Checkout](laboratorios/002-checkout/002-exploracion-checkout.md)

### LAB-003 — Servidor HTTP local

Estado: **En progreso**

Experimentación inicial con un servidor HTTP construido directamente con las
APIs nativas de Node.js.

Objetivo actual:

- Comprender requests HTTP.
- Comprender responses HTTP.
- Diferenciar métodos HTTP.
- Recibir `POST`.
- Analizar headers.
- Recibir y procesar el body.
- Comprender `application/x-www-form-urlencoded`.

El laboratorio continuará evolucionando hacia la recepción de comunicaciones
relacionadas con Flow Sandbox.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.
