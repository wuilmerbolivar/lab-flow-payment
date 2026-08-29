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
};

if (!config.apiKey) {
  throw new Error('Falta API_KEY en .env');
}

if (!config.secretKey) {
  throw new Error('Falta SECRET_KEY en .env');
}

/*
 * Parámetros de la orden.
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
 * Ordenamiento alfabético de parámetros.
 */
const sortedParams = Object.entries(params).sort(
  ([keyA], [keyB]) => keyA.localeCompare(keyB),
);

/*
 * String utilizado para generar la firma.
 *
 * nombre + valor
 *
 * Sin separadores.
 */
const toSign = sortedParams
  .map(([key, value]) => `${key}${value}`)
  .join('');

/*
 * Firma HMAC-SHA256.
 */
const signature = crypto
  .createHmac('sha256', config.secretKey)
  .update(toSign)
  .digest('hex');

/*
 * La firma se agrega a los parámetros enviados.
 */
params.s = signature;

/*
 * Flow espera application/x-www-form-urlencoded.
 */
const encodedBody = querystring.stringify(params);

/*
 * Sanitización para consola/log.
 *
 * Se utiliza únicamente para mostrar información.
 * Los valores originales permanecen intactos para la solicitud.
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
 *
 * Linux:
 * xdg-open
 *
 * macOS:
 * open
 *
 * Windows:
 * cmd /c start
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

async function main() {
  const shouldOpen = process.argv.includes('--open');

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
   * No imprimir la respuesta completa porque contiene
   * el token necesario para acceder al Checkout.
   */
  console.log('Respuesta sanitizada:', {
    token: mask(data.token),
    url: data.url,
    flowOrder: data.flowOrder,
  });

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
   * Construcción del Checkout.
   *
   * Esta URL contiene el token completo y solamente debe
   * utilizarse localmente para abrir el Checkout.
   */
  const checkoutUrl = `${data.url}?token=${data.token}`;

  console.log('\nValidación');
  console.log('----------------------------------------');
  console.log('✓ token recibido:', mask(data.token));
  console.log('✓ flowOrder recibido:', data.flowOrder);
  console.log('✓ url recibida:', data.url);

  console.log('\nCheckout');
  console.log('----------------------------------------');

  /*
   * Nunca mostrar el token completo en stdout.
   *
   * Esto mantiene el log sanitizado cuando se utiliza:
   *
   * node main.js | tee archivo.log
   */
  console.log(
    `${data.url}?token=${mask(data.token)}`,
  );

  if (shouldOpen) {
    console.log('\nAbriendo Checkout en el navegador...');

    /*
     * El token completo se utiliza únicamente como argumento
     * local para xdg-open/open/cmd.
     *
     * No se imprime en consola.
     */
    openBrowser(checkoutUrl);

    console.log('✓ Checkout enviado al navegador.');
  } else {
    console.log('\nPara abrir el Checkout:');
    console.log('node laboratorios/008-integracion-checkout/main.js --open');
  }

  console.log('\nLAB-008 completó la creación de la orden.');
}

main().catch((error) => {
  console.error('\nERROR');
  console.error('----------------------------------------');

  if (error.response) {
    console.error('HTTP:', error.response.status);
    console.error('Respuesta de Flow:', error.response.data);
  } else {
    console.error(error.message);
  }

  process.exitCode = 1;
});

