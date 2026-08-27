# LAB-002 — Exploración inicial del Checkout Sandbox

## Objetivo

Explorar el flujo de checkout generado por Flow Sandbox después de crear
exitosamente una orden mediante la API.

El objetivo es comprender qué ocurre después de `payment/create`, qué
información se presenta al usuario, cómo se selecciona el medio de pago y qué
sucede al simular un pago rechazado.

---

## Pregunta

¿Qué ocurre después de que Flow acepta una solicitud de creación de orden y
devuelve un `token`, una URL de checkout y un `flowOrder`?

---

## Hipótesis

Después de crear una orden mediante `payment/create`, Flow proporciona un
checkout desde el cual el usuario puede seleccionar un medio de pago y
continuar con el proceso de pago.

El comportamiento posterior dependerá del medio de pago seleccionado y de la
acción realizada en el entorno Sandbox.

---

## Documentación oficial relacionada

- https://developers.flow.cl/
- https://developers.flow.cl/docs/quick-start
- https://developers.flow.cl/docs/credentials
- https://sandbox.flow.cl/api

Fecha de consulta y experimentación:

**26 de agosto de 2026**

---

## Entorno

### Plataforma

Flow Sandbox.

### Aplicación

Laboratorio Flow Payment.

### Runtime

```text
Node.js v24.15.0
````

### Ambiente

```text
Sandbox
```

No se realizaron operaciones contra producción.

---

# 1. Creación de la orden

La orden fue creada previamente mediante el laboratorio de creación de
órdenes.

La solicitud utilizó:

```text
amount = 350
currency = PEN
```

y las credenciales privadas configuradas mediante variables de entorno.

Flow respondió exitosamente:

```text
HTTP: 200
```

La respuesta proporcionó:

```text
token
url
flowOrder
```

El valor real del `token` no se documenta por razones de seguridad.

---

# 2. Acceso al Checkout

Utilizando el `token` proporcionado por Flow se accedió al checkout Sandbox.

La URL utilizada sigue el formato:

```text
https://sandbox.flow.cl/app/web/pay.php?token=[REDACTADO]
```

El checkout mostró información relacionada con la operación.

---

## Información presentada

Se observó:

* Identidad del comercio.
* Logo del comercio.
* Identidad visual de Flow.
* Correo electrónico utilizado durante la creación de la orden.
* Nombre del comercio.
* Concepto de la operación.
* Monto.
* Moneda.
* Orden de compra.
* Medios de pago disponibles.
* Términos y condiciones de Flow.
* Información de contacto del comercio.

En esta prueba se mostró:

```text
Comercio:
Wuilmer Bolivar

Concepto:
Laboratorio Flow Payment

Monto:
S/ 350.00 PEN
```

La orden de compra mostrada en el checkout correspondió al valor utilizado
como `commerceOrder` durante la creación de la orden.

---

# 3. Medios de pago observados

El checkout presentó diferentes alternativas de pago.

Entre las opciones observadas se encontraban:

* Tarjetas de crédito y débito.
* Pago con Yape.
* Transferencia bancaria.
* Pago mediante banca móvil.
* Agentes y bodegas.

La disponibilidad de medios de pago puede depender de la configuración del
comercio, país, moneda y ambiente.

Este experimento solamente documenta los medios observados en el Sandbox
utilizado.

---

# 4. Selección de Yape

Como parte de la exploración se seleccionó:

```text
Yape
```

Flow redirigió al simulador de pagos del ambiente Sandbox.

Se observó la siguiente URL:

```text
https://sandbox.flow.cl/app/web/sendMedio.php
```

---

# 5. Simulador de pagos

El Sandbox presentó una interfaz de simulación.

La pantalla mostró nuevamente información de la operación:

```text
Comercio:
Wuilmer Bolivar

Monto:
S/ 350.00 PEN

Orden de Compra:
[valor de commerceOrder]

Concepto:
Laboratorio Flow Payment
```

El simulador permitió seleccionar la acción que se deseaba realizar sobre la
orden.

Las opciones observadas fueron:

```text
Quiero pagar la orden
Quiero rechazar el pago de la orden
```

---

# 6. Simulación de pago rechazado

Se seleccionó:

```text
Quiero rechazar el pago de la orden
```

y posteriormente se confirmó la acción.

---

# 7. Redirección posterior

Después de confirmar el rechazo, Flow redirigió al navegador hacia:

```text
https://example.com/payment-status
```

Esta URL correspondía al valor configurado previamente como:

```text
urlReturn
```

La URL utilizada fue deliberadamente un dominio de ejemplo durante las
primeras pruebas del laboratorio.

Por esta razón, el navegador mostró la página:

```text
Example Domain
```

---

# 8. Observación sobre `urlReturn`

La prueba demuestra que la URL configurada mediante `urlReturn` es utilizada
durante el flujo de retorno hacia el sitio del comercio después de interactuar
con el proceso de pago.

Sin embargo, este experimento todavía no permite determinar:

* Qué parámetros adicionales puede recibir la URL.
* Qué información relacionada con la transacción se entrega.
* Si el estado del pago se incluye directamente en la redirección.
* Cómo debe procesar la aplicación del comercio dicha información.
* Qué diferencia exacta existe entre `urlReturn` y `urlConfirmation`.

Estas cuestiones serán investigadas en experimentos posteriores.

---

# 9. Observación sobre pagos repetidos

Durante la exploración también se observó el siguiente mensaje al intentar
regresar y repetir determinadas acciones sobre una orden ya procesada:

```text
¡Ups! Ha ocurrido un error

Ya existe un pago para la transacción N° [REDACTADO].
```

Este comportamiento demuestra que el Sandbox mantiene estado sobre las
operaciones realizadas y evita determinadas acciones repetidas sobre una
misma transacción.

El identificador real de la transacción se omite de la documentación pública
cuando no sea necesario para reproducir el experimento.

Este comportamiento será investigado posteriormente.

---

# 10. Flujo observado

El comportamiento observado puede representarse de forma simplificada:

```text
Aplicación del laboratorio
        |
        | POST /payment/create
        v
Flow Sandbox API
        |
        | HTTP 200
        | token
        | flowOrder
        | url
        v
Checkout Sandbox
        |
        | selección de medio de pago
        v
Yape
        |
        v
Simulador de pagos
        |
        | "Quiero rechazar el pago"
        v
urlReturn
        |
        v
https://example.com/payment-status
```

---

# 11. Documentación oficial vs observación experimental

## Documentación oficial

La documentación de Flow describe el proceso de integración y creación de
órdenes utilizando su API.

La referencia oficial debe utilizarse para determinar los parámetros y
comportamientos soportados.

## Observación experimental

Durante este laboratorio se observó que:

1. Una orden creada correctamente proporciona un `token`.
2. El `token` permite acceder al checkout Sandbox.
3. El checkout presenta información de la orden.
4. El usuario puede seleccionar un medio de pago.
5. Yape conduce al simulador de pagos Sandbox.
6. El simulador permite representar diferentes resultados.
7. Al seleccionar el rechazo del pago, el navegador fue redirigido a la URL
   configurada mediante `urlReturn`.
8. La URL utilizada fue `https://example.com/payment-status`.
9. El Sandbox mostró un mensaje indicando que determinadas operaciones no
   podían repetirse sobre una transacción que ya tenía un pago.

---

# 12. Interpretación

El experimento permite identificar una separación entre:

```text
Creación de la orden
        ↓
Checkout
        ↓
Selección del medio de pago
        ↓
Procesamiento / simulación
        ↓
Retorno al comercio
```

La aplicación del comercio participa inicialmente en la creación de la orden
y posteriormente proporciona una URL de retorno.

Flow gestiona la interfaz de checkout y el proceso asociado al medio de pago.

Todavía es necesario investigar cómo se comunica el resultado de la
transacción al sistema del comercio y cómo debe verificarse dicho resultado.

---

# 13. Limitaciones

Este experimento no permite concluir todavía:

* Cómo debe implementarse un callback.
* Cómo funciona exactamente `urlConfirmation`.
* Qué parámetros recibe `urlReturn`.
* Cómo verificar de forma segura el estado de una transacción.
* Cómo consultar posteriormente una orden.
* Cómo manejar callbacks duplicados.
* Cómo manejar callbacks fallidos.
* Cómo determinar definitivamente el estado final de una transacción.

Estos aspectos serán estudiados en laboratorios posteriores.

---

# 14. Conclusión

La exploración permitió comprobar exitosamente el flujo posterior a la
creación de una orden.

El proceso observado fue:

```text
payment/create
    ↓
HTTP 200
    ↓
token
    ↓
Checkout Sandbox
    ↓
selección de medio de pago
    ↓
simulador
    ↓
resultado de la operación
    ↓
urlReturn
```

Se comprobó experimentalmente que `urlReturn` es utilizada para devolver al
usuario al sitio configurado por la integración después de la interacción con
el proceso de pago.

La prueba también permitió identificar que el Sandbox mantiene información
de estado sobre las operaciones y puede impedir determinadas acciones
repetidas sobre una transacción.

---

# Estado

**COMPLETADO — Exploración inicial del Checkout Sandbox.**

Se logró observar el flujo desde la creación de la orden hasta el retorno al
sitio configurado por el comercio.

---

# Próximo experimento

El siguiente paso será reemplazar la URL de ejemplo por un endpoint controlado
por el laboratorio.

El objetivo será observar directamente qué recibe nuestra aplicación cuando
Flow realiza el retorno.

Esto permitirá comenzar a estudiar:

* HTTP.
* parámetros.
* requests.
* responses.
* `urlReturn`.
* callbacks.
* procesamiento de resultados.

El endpoint será inicialmente mínimo y local, evitando introducir
infraestructura innecesaria antes de comprender el flujo básico.
