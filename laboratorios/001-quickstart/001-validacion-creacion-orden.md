# LAB-001.1 — Validación de creación de una orden

## Objetivo

Reproducir de forma progresiva el proceso de creación de una orden utilizando
la API de Flow Sandbox mediante JavaScript/Node.js.

El objetivo de este experimento es identificar las condiciones necesarias para
obtener una respuesta exitosa (`HTTP 200`) desde el endpoint de creación de
órdenes.

Este laboratorio forma parte de la primera etapa del proyecto **Laboratorio
Flow Payment**, cuyo propósito es aprender mediante experimentación,
observación y evidencia.

---

## Pregunta

¿Qué parámetros y condiciones son necesarios para que una solicitud de
creación de orden sea aceptada por Flow Sandbox?

---

## Hipótesis inicial

Si se reproducen los parámetros indicados por la documentación oficial de
Flow y se utilizan credenciales válidas de Sandbox, la API debería aceptar la
solicitud y devolver los datos necesarios para iniciar el checkout.

Durante el experimento se comprobarán progresivamente las validaciones que
realiza la API.

---

## Documentación oficial relacionada

- [Documentación para desarrolladores de Flow](https://developers.flow.cl/)
- [Quickstart](https://developers.flow.cl/docs/quick-start)
- [Credenciales de prueba](https://developers.flow.cl/docs/credentials)
- [Flow Sandbox API](https://sandbox.flow.cl/api)

La documentación oficial consultada corresponde a la fecha del experimento:

**26 de agosto de 2026**

---

## Entorno

### Plataforma

Flow Sandbox.

### Endpoint

```text
https://sandbox.flow.cl/api/payment/create
````

### Lenguaje

JavaScript.

### Runtime

```text
Node.js v24.15.0
```

### Gestor de paquetes

```text
npm 11.16.0
```

### Sistema operativo

Arch Linux.

### Dependencias iniciales

* axios
* dotenv

### Credenciales

Se utilizan credenciales propias del ambiente Sandbox.

Las credenciales reales se almacenan exclusivamente de forma local mediante
variables de entorno.

No se incluyen API Keys ni Secret Keys en este documento.

---

# Experimento 001 — Solicitud inicial

## Preparación

Se reprodujo inicialmente el flujo básico de creación de una orden mediante
Node.js.

Los parámetros utilizados incluían:

```text
apiKey
commerceOrder
urlConfirmation
urlReturn
email
subject
amount
```

La firma de los parámetros se genera utilizando HMAC-SHA256 y la Secret Key
proporcionada por Flow Sandbox.

Los valores sensibles no forman parte de la documentación pública.

---

## Resultado esperado

Se esperaba obtener una respuesta exitosa de Flow con información de la orden
creada y los datos necesarios para continuar hacia el checkout.

---

## Resultado observado

La solicitud fue rechazada.

```text
HTTP: 400
```

Respuesta:

```json
{
  "code": 1901,
  "message": "The minimum amount is 350 CLP"
}
```

---

## Análisis

La API rechazó la solicitud porque el monto utilizado estaba por debajo del
mínimo indicado por la respuesta.

El experimento permitió identificar una primera condición de validación:

```text
amount >= 350
```

Sin embargo, esta observación se refiere al comportamiento observado durante
este experimento y no debe interpretarse automáticamente como una regla
universal para todas las monedas o configuraciones de Flow.

---

## Conclusión

El monto utilizado inicialmente no era suficiente para continuar con la
creación de la orden.

Se decidió utilizar `350` como monto para el siguiente experimento, sin
modificar inicialmente los demás parámetros.

---

# Experimento 002 — Validación del correo electrónico

## Cambio realizado

Se modificó únicamente el monto:

```text
amount = 350
```

El resto de parámetros permaneció sin cambios.

---

## Resultado esperado

Se esperaba que la solicitud superara la validación del monto y permitiera
observar la siguiente validación realizada por la API.

---

## Resultado observado

La solicitud fue rechazada.

```text
HTTP: 400
```

Respuesta:

```json
{
  "code": 1620,
  "message": "The userEmail: laboratorio@example.com is not valid."
}
```

---

## Análisis

Al modificar el monto, la API dejó de devolver el error relacionado con el
monto mínimo.

La solicitud avanzó hasta una validación relacionada con `userEmail`.

Esto demuestra que Flow realiza múltiples validaciones sobre la solicitud y
que las respuestas de error permiten identificar progresivamente las
condiciones que deben cumplirse.

---

## Conclusión

El correo utilizado inicialmente no fue aceptado por Flow Sandbox.

Para el siguiente experimento se utilizó el correo electrónico asociado a la
cuenta Sandbox.

---

# Experimento 003 — Correo asociado a la cuenta Sandbox

## Cambio realizado

Se sustituyó únicamente el valor de `userEmail` por el correo utilizado para
registrar la cuenta Sandbox.

El monto se mantuvo:

```text
amount = 350
```

---

## Resultado observado

La solicitud fue rechazada nuevamente, pero con un error diferente:

```text
HTTP: 400
```

Respuesta:

```json
{
  "code": 1990,
  "message": "Commerce has not this currency pay 'CLP'"
}
```

---

## Análisis

La API dejó de devolver el error `1620` relacionado con el correo electrónico
y avanzó hasta una validación relacionada con la moneda.

Esto demuestra experimentalmente que el correo utilizado en esta prueba fue
aceptado hasta una etapa posterior del procesamiento.

La respuesta también permitió identificar que la operación estaba siendo
procesada utilizando `CLP`.

---

## Hipótesis adicional

Inicialmente se consideró la posibilidad de que `userEmail` tuviera que
corresponder al correo de la cuenta Sandbox.

Sin embargo, todavía no existía suficiente evidencia para confirmar esta
hipótesis.

Por este motivo se realizó una prueba adicional utilizando un correo
diferente y no asociado a la cuenta.

---

# Experimento 004 — Correo diferente al de la cuenta

## Cambio realizado

Se utilizó un correo electrónico diferente al registrado en la cuenta
Sandbox.

Ejemplo utilizado durante la prueba:

```text
github@gmail.com
```

El monto se mantuvo:

```text
amount = 350
```

No se modificaron las credenciales de API.

---

## Resultado observado

La respuesta volvió a ser:

```text
HTTP: 400
```

con:

```json
{
  "code": 1990,
  "message": "Commerce has not this currency pay 'CLP'"
}
```

---

## Análisis

El comportamiento observado fue equivalente al experimento anterior.

El correo utilizado no estaba asociado a la cuenta Sandbox, pero Flow no
devolvió nuevamente el error `1620`.

En consecuencia, los experimentos realizados no proporcionan evidencia de que
`userEmail` deba coincidir con el correo utilizado para registrar la cuenta
Sandbox.

Lo que sí se puede afirmar a partir de las pruebas realizadas es que Flow
realiza una validación sobre el correo electrónico antes de continuar con el
procesamiento de la orden.

---

## Conclusión

La hipótesis de que el correo necesariamente debe pertenecer a la cuenta
Sandbox no queda respaldada por la evidencia obtenida.

La investigación se centró entonces en la moneda de la operación.

---

# Experimento 005 — Especificación explícita de PEN

## Hipótesis

El comercio Sandbox utilizado para este laboratorio corresponde a Perú y no
tiene habilitada la moneda `CLP`.

Si se especifica explícitamente:

```text
currency = PEN
```

la solicitud debería poder continuar utilizando la moneda correspondiente al
entorno de prueba.

---

## Cambio realizado

Se añadió únicamente el parámetro:

```js
currency: 'PEN'
```

El monto se mantuvo:

```text
amount = 350
```

Los demás parámetros permanecieron sin cambios.

---

## Resultado observado

La solicitud fue aceptada.

```text
HTTP: 200
```

Flow devolvió:

```json
{
  "token": "[REDACTADO]",
  "url": "https://sandbox.flow.cl/app/web/pay.php",
  "flowOrder": 9914808
}
```

---

## Análisis

La incorporación explícita de:

```text
currency = PEN
```

permitió superar la validación anterior relacionada con `CLP`.

La respuesta `HTTP 200` demuestra que la solicitud de creación de la orden fue
aceptada por Flow Sandbox.

La respuesta proporcionó tres elementos relevantes:

### `token`

Token generado por Flow para continuar el proceso de pago.

El valor real se considera información sensible y no se publica en este
laboratorio.

### `url`

URL correspondiente al checkout de Flow Sandbox:

```text
https://sandbox.flow.cl/app/web/pay.php
```

### `flowOrder`

Identificador de la orden generado por Flow.

En esta ejecución se obtuvo:

```text
9914808
```

---

# Evidencia del resultado exitoso

La ejecución final produjo:

```text
LAB-001 — Quickstart Flow
Orden: 191e09e6-a4b6-4384-9408-5854e95c3a82
Enviando solicitud a Flow Sandbox...
HTTP: 200
Respuesta: {
  token: '[REDACTADO]',
  url: 'https://sandbox.flow.cl/app/web/pay.php',
  flowOrder: 9914808
}
Checkout: https://sandbox.flow.cl/app/web/pay.php?token=[REDACTADO]
```

El token real fue omitido deliberadamente de esta evidencia.

---

# Resultados consolidados

| Experimento | Cambio principal                         | Resultado              |
| ----------- | ---------------------------------------- | ---------------------- |
| 001         | `amount` por debajo del mínimo observado | `HTTP 400 / code 1901` |
| 002         | `amount = 350`                           | `HTTP 400 / code 1620` |
| 003         | Correo de la cuenta Sandbox              | `HTTP 400 / code 1990` |
| 004         | Correo diferente a la cuenta             | `HTTP 400 / code 1990` |
| 005         | `currency = PEN`                         | **`HTTP 200`**         |

---

# Hallazgos

A partir de los experimentos realizados se observaron los siguientes
comportamientos:

1. Un monto de `100` fue rechazado por Flow Sandbox.
2. La respuesta indicó un mínimo de `350 CLP`.
3. Al utilizar `350`, la solicitud avanzó hasta una validación del correo.
4. El correo inicialmente utilizado fue rechazado con el código `1620`.
5. Al utilizar un correo diferente, Flow permitió avanzar hasta la validación
   de moneda.
6. El correo utilizado en las pruebas no tuvo que coincidir necesariamente con
   el correo de la cuenta Sandbox según la evidencia obtenida.
7. La solicitud fue evaluada inicialmente utilizando `CLP`.
8. El comercio Sandbox utilizado para este laboratorio no acepta `CLP`.
9. Al especificar explícitamente `currency: 'PEN'`, la solicitud fue aceptada.
10. Flow devolvió un `token`, una URL de checkout y un `flowOrder`.
11. La creación de la orden terminó exitosamente con `HTTP 200`.

---

# Documentación oficial vs observación experimental

## Documentación oficial

Flow proporciona documentación específica para la integración mediante su API,
incluyendo el proceso de creación de órdenes y el uso de credenciales de
prueba.

Consultar siempre la documentación oficial vigente antes de reproducir este
experimento, ya que los parámetros, reglas y comportamientos pueden cambiar.

## Observación experimental

Durante este laboratorio se observó:

```text
amount = 100
→ 400 / 1901

amount = 350
→ 400 / 1620

email diferente
→ 400 / 1990

currency = PEN
→ 200
```

## Interpretación

La API procesa diferentes validaciones antes de aceptar la creación de una
orden.

Modificar un parámetro puede permitir avanzar hacia una validación posterior,
por lo que los errores sucesivos no necesariamente representan problemas
independientes de la integración.

## Conclusión

Se logró reproducir exitosamente la creación de una orden en Flow Sandbox
utilizando Node.js y una moneda aceptada por el comercio de prueba.

---

# Limitaciones

Este experimento no permite afirmar que:

* `350` sea el monto mínimo universal para todas las monedas.
* `PEN` sea la única moneda disponible para el comercio.
* Todos los comercios de Flow tengan las mismas monedas habilitadas.
* Todos los ambientes Sandbox tengan exactamente el mismo comportamiento.
* `userEmail` pueda ser arbitrario.
* Los códigos observados representen todas las validaciones posibles.
* Una respuesta `HTTP 200` implique que el pago haya sido completado.

Las conclusiones se limitan al comportamiento observado durante las pruebas
realizadas contra el ambiente Sandbox.

---

# Estado

**ÉXITO — Orden creada correctamente en Flow Sandbox.**

Se logró superar la etapa de creación de la orden y obtener los datos
necesarios para continuar hacia el checkout.

---

# Próximo paso

El siguiente experimento estudiará el comportamiento del checkout generado a
partir del `token` devuelto por Flow.

Se investigará progresivamente:

```text
payment/create
      ↓
token
      ↓
checkout
      ↓
transacción Sandbox
      ↓
resultado
```

El checkout no forma parte todavía de este experimento.

---

# Fecha

26 de agosto de 2026

