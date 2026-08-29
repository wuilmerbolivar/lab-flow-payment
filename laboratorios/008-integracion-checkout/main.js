const crypto = require('node:crypto');
const querystring = require('node:querystring');

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({
  path: './.env',
});

const config = {
  apiUrl: 'https://sandbox.flow.cl/api',
  apiKey: process.env.API_KEY,
  secretKey: process.env.SECRET_KEY,
};

if (!config.apiKey) {
  throw new Error('Falta API_KEY en .env');
}

if (!config.secretKey) {
  throw new Error('Falta SECRET_KEY en .env');
}

/*
 * Parámetros de la orden.
 *
 * Estos son los datos que serán enviados a:
 *
 * POST /payment/create
 */
const params = {
  apiKey: config.apiKey,
  commerceOrder: crypto.randomUUID(),
  urlConfirmation: 'https://example.com/confirmation',
  urlReturn: 'https://example.com/payment-status',
  email: 'wuilmeralexanderbolivar@gmail.com',
  subject: 'Laboratorio Flow Payment',
  amount: 350,
  currency: 'PEN',
};

/*
 * Flow requiere ordenar los parámetros
 * alfabéticamente antes de generar la firma.
 */
const sortedParams = Object.entries(params).sort(
  ([keyA], [keyB]) => keyA.localeCompare(keyB),
);

/*
 * Construcción de la cadena que será firmada:
 *
 * nombre + valor
 *
 * Sin separadores.
 */
const toSign = sortedParams
  .map(([key, value]) => `${key}${value}`)
  .join('');

/*
 * Firma HMAC-SHA256 utilizando SECRET_KEY.
 *
 * secretKey NO se envía a Flow.
 */
const signature = crypto
  .createHmac('sha256', config.secretKey)
  .update(toSign)
  .digest('hex');

/*
 * La firma se agrega al conjunto final
 * de parámetros como "s".
 */
params.s = signature;

/*
 * Flow espera:
 *
 * application/x-www-form-urlencoded
 */
const encodedBody = querystring.stringify(params);

/*
 * Ocultamos información sensible antes
 * de mostrarla en consola o almacenarla
 * como evidencia.
 */
function mask(value, visibleCharacters = 6) {
  if (!value) {
    return '(no disponible)';
  }

  const stringValue = String(value);

  if (stringValue.length <= visibleCharacters) {
    return '***';
  }

  return `${stringValue.slice(0, visibleCharacters)}...`;
}

/*
 * Genera una representación segura de la respuesta
 * de Flow para utilizarla como evidencia.
 *
 * El token completo nunca debe aparecer en el log.
 */
function sanitizeResponse(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  return {
    ...data,
    token: data.token ? mask(data.token) : undefined,
  };
}

async function main() {
  console.log('LAB-008 — Primera integración');
  console.log('----------------------------------------');

  console.log('Endpoint:', `${config.apiUrl}/payment/create`);
  console.log('commerceOrder:', params.commerceOrder);
  console.log('subject:', params.subject);
  console.log('amount:', params.amount);
  console.log('currency:', params.currency);

  console.log('\nGeneración de firma');
  console.log('Parámetros ordenados:');

  for (const [key, value] of sortedParams) {
    /*
     * No mostrar API_KEY completa.
     */
    const displayValue =
      key === 'apiKey' ? mask(value) : value;

    console.log(`  ${key}=${displayValue}`);
  }

  console.log('\nString-to-sign:');
  console.log(
    toSign.replace(config.apiKey, mask(config.apiKey)),
  );

  console.log('\nFirma HMAC-SHA256:');
  console.log(mask(signature));

  console.log('\nEnviando solicitud a Flow Sandbox...');

  const response = await axios.post(
    `${config.apiUrl}/payment/create`,
    encodedBody,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  console.log('\nRespuesta de Flow');
  console.log('----------------------------------------');
  console.log('HTTP:', response.status);

  const data = response.data;

  /*
   * Validación mínima de la respuesta.
   */
  if (!data || typeof data !== 'object') {
    throw new Error(
      'La respuesta de Flow no tiene el formato esperado.',
    );
  }

  if (!data.token) {
    throw new Error(
      'La respuesta no contiene token.',
    );
  }

  if (!data.flowOrder) {
    throw new Error(
      'La respuesta no contiene flowOrder.',
    );
  }

  if (!data.url) {
    throw new Error(
      'La respuesta no contiene url.',
    );
  }

  /*
   * Mostrar únicamente una versión sanitizada
   * de la respuesta.
   */
  console.log(
    'Respuesta sanitizada:',
    sanitizeResponse(data),
  );

  /*
   * Construcción del Checkout.
   *
   * checkoutUrl contiene el token real porque será
   * utilizado posteriormente por la integración.
   */
  const checkoutUrl = `${data.url}?token=${data.token}`;

  /*
   * Versión segura para consola y logs.
   */
  const safeCheckoutUrl = `${data.url}?token=${mask(data.token)}`;

  console.log('\nValidación');
  console.log('----------------------------------------');
  console.log('✓ token recibido:', mask(data.token));
  console.log('✓ flowOrder recibido:', data.flowOrder);
  console.log('✓ url recibida:', data.url);

  console.log('\nCheckout');
  console.log('----------------------------------------');
  console.log(safeCheckoutUrl);

  /*
   * Verificación interna:
   *
   * checkoutUrl se construye utilizando el token real.
   *
   * No mostramos checkoutUrl porque contiene
   * información que no debe almacenarse en logs.
   */
  if (!checkoutUrl.includes(data.token)) {
    throw new Error(
      'No fue posible construir correctamente la URL del Checkout.',
    );
  }

  console.log('\nLAB-008 completó la creación de la orden.');
}

main().catch((error) => {
  console.error('\nERROR');
  console.error('----------------------------------------');

  if (error.response) {
    console.error('HTTP:', error.response.status);
    console.error(
      'Respuesta de Flow:',
      sanitizeResponse(error.response.data),
    );
  } else {
    console.error(error.message);
  }

  process.exitCode = 1;
});

