const crypto = require('node:crypto');
const querystring = require('node:querystring');
const { execFile } = require('node:child_process');

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({
  path: './.env',
});

const config = {
  apiUrl: 'https://sandbox.flow.cl/api',
  apiKey: process.env.API_KEY,
  secretKey: process.env.SECRET_KEY,
  email: process.env.FLOW_EMAIL || 'wuilmeralexanderbolivar@gmail.com',
  urlConfirmation:
    process.env.FLOW_URL_CONFIRMATION ||
    'https://example.com/confirmation',
  urlReturn:
    process.env.FLOW_URL_RETURN ||
    'https://example.com/payment-status',
};

if (!config.apiKey) {
  throw new Error('Falta API_KEY en .env');
}

if (!config.secretKey) {
  throw new Error('Falta SECRET_KEY en .env');
}

/*
 * Oculta información sensible para consola.
 */
function mask(value, visibleCharacters = 6) {
  if (!value) {
    return '(no disponible)';
  }

  if (value.length <= visibleCharacters) {
    return '***';
  }

  return `${value.slice(0, visibleCharacters)}...`;
}

/*
 * Abre una URL en el navegador predeterminado.
 */
function openBrowser(url) {
  let command;
  let args;

  if (process.platform === 'linux') {
    command = 'xdg-open';
    args = [url];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else if (process.platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    throw new Error(
      `No se puede abrir el navegador automáticamente en ${process.platform}.`,
    );
  }

  execFile(command, args, (error) => {
    if (error) {
      console.error(
        `No fue posible abrir el navegador: ${error.message}`,
      );
    }
  });
}

/*
 * Genera la firma HMAC-SHA256.
 *
 * Flow requiere:
 *
 * 1. ordenar los parámetros alfabéticamente;
 * 2. concatenar nombre + valor;
 * 3. firmar con secretKey;
 * 4. agregar la firma como parámetro "s".
 */
function signParams(params) {
  const sortedParams = Object.entries(params).sort(
    ([keyA], [keyB]) => keyA.localeCompare(keyB),
  );

  const toSign = sortedParams
    .map(([key, value]) => `${key}${value}`)
    .join('');

  const signature = crypto
    .createHmac('sha256', config.secretKey)
    .update(toSign)
    .digest('hex');

  return {
    sortedParams,
    toSign,
    signature,
  };
}

/*
 * Crea una orden en Flow Sandbox.
 */
async function createOrder() {
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

  const {
    sortedParams,
    toSign,
    signature,
  } = signParams(params);

  params.s = signature;

  const encodedBody = querystring.stringify(params);

  console.log('1. CREACION DE ORDEN');
  console.log('----------------------------------------');

  console.log(
    'Endpoint:',
    `${config.apiUrl}/payment/create`,
  );

  console.log('commerceOrder:', params.commerceOrder);
  console.log('subject:', params.subject);
  console.log('amount:', params.amount);
  console.log('currency:', params.currency);

  console.log('\nGeneración de firma');
  console.log('Parámetros ordenados:');

  for (const [key, value] of sortedParams) {
    const displayValue =
      key === 'apiKey' ? mask(value) : value;

    console.log(`  ${key}=${displayValue}`);
  }

  console.log('\nString-to-sign:');

  console.log(
    toSign.replace(
      config.apiKey,
      mask(config.apiKey),
    ),
  );

  console.log('\nFirma HMAC-SHA256:');
  console.log(mask(signature));

  console.log('\nEnviando solicitud a Flow Sandbox...');

  const response = await axios.post(
    `${config.apiUrl}/payment/create`,
    encodedBody,
    {
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',
      },
    },
  );

  console.log('\nRespuesta de Flow');
  console.log('----------------------------------------');
  console.log('HTTP:', response.status);

  const data = response.data;

  console.log('Respuesta sanitizada:', {
    token: mask(data.token),
    url: data.url,
    flowOrder: data.flowOrder,
  });

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

  return data;
}

/*
 * Consulta el estado de una orden.
 *
 * IMPORTANTE:
 *
 * LAB-005 ya validó experimentalmente que
 * payment/getStatus funciona mediante GET
 * enviando los parámetros mediante "params".
 */
async function getStatus(token) {
  const params = {
    apiKey: config.apiKey,
    token,
  };

  const {
    sortedParams,
    toSign,
    signature,
  } = signParams(params);

  const requestParams = {
    ...params,
    s: signature,
  };

  console.log('\n4. CONSULTA DE ESTADO');
  console.log('----------------------------------------');

  console.log(
    'Endpoint:',
    `${config.apiUrl}/payment/getStatus`,
  );

  console.log('token:', mask(token));

  console.log('\nGeneración de firma');

  console.log('Parámetros ordenados:');

  for (const [key, value] of sortedParams) {
    const displayValue =
      key === 'apiKey' || key === 'token'
        ? mask(value)
        : value;

    console.log(`  ${key}=${displayValue}`);
  }

  console.log('\nString-to-sign:');

  console.log(
    toSign
      .replace(config.apiKey, mask(config.apiKey))
      .replace(token, mask(token)),
  );

  console.log('\nFirma HMAC-SHA256:');
  console.log(mask(signature));

  console.log('\nConsultando estado en Flow Sandbox...');

  const response = await axios.get(
    `${config.apiUrl}/payment/getStatus`,
    {
      params: requestParams,
    },
  );

  console.log('\nRespuesta de Flow');
  console.log('----------------------------------------');

  console.log('HTTP:', response.status);

  return response.data;
}

async function main() {
  const shouldOpen = process.argv.includes('--open');

  console.log('LAB-009 — Transacción Checkout');
  console.log('========================================');

  /*
   * 1. Crear orden.
   */
  const data = await createOrder();

  /*
   * 2. Construir Checkout.
   */
  const checkoutUrl = `${data.url}?token=${data.token}`;

  console.log('\n2. CHECKOUT');
  console.log('----------------------------------------');

  console.log('flowOrder:', data.flowOrder);
  console.log('token:', mask(data.token));

  /*
   * Nunca mostrar el token completo.
   */
  console.log(
    'URL:',
    `${data.url}?token=${mask(data.token)}`,
  );

  if (shouldOpen) {
    console.log(
      '\nAbriendo Checkout en el navegador...',
    );

    openBrowser(checkoutUrl);

    console.log(
      '✓ Checkout enviado al navegador.',
    );
  } else {
    console.log(
      '\nPara abrir automáticamente el Checkout:',
    );

    console.log(
      'node laboratorios/009-transaccion-checkout/main.js --open',
    );
  }

  /*
   * 3. Esperar la interacción del usuario.
   */
  console.log('\n3. INTERACCION CON CHECKOUT');
  console.log('----------------------------------------');

  console.log(
    'Realiza la operación correspondiente en Flow Sandbox.',
  );

  console.log(
    'Cuando hayas terminado la interacción con Checkout, presiona ENTER:',
  );

  await new Promise((resolve) => {
    process.stdin.resume();

    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });

  /*
   * 4. Consultar estado.
   */
  const status = await getStatus(data.token);

  console.log('\nEstado de la orden');
  console.log('----------------------------------------');

  console.log('flowOrder:', status.flowOrder);
  console.log('commerceOrder:', status.commerceOrder);
  console.log('status:', status.status);
  console.log('subject:', status.subject);
  console.log('amount:', status.amount);
  console.log('currency:', status.currency);

  /*
   * Mostrar información de pago cuando exista.
   */
  if (status.paymentData) {
    console.log('\nDatos de pago:');
    console.log(
      'date:',
      status.paymentData.date,
    );
    console.log(
      'media:',
      status.paymentData.media,
    );
    console.log(
      'amount:',
      status.paymentData.amount,
    );
    console.log(
      'currency:',
      status.paymentData.currency,
    );
  }

  console.log('\nLAB-009 completado.');
}

main().catch((error) => {
  console.error('\nERROR');
  console.error('----------------------------------------');

  if (error.response) {
    console.error('HTTP:', error.response.status);
    console.error(
      'Respuesta de Flow:',
      error.response.data,
    );
  } else {
    console.error(error.message);
  }

  process.exitCode = 1;
});
