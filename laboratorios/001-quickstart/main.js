const crypto = require('node:crypto');
const axios = require('axios');
const dotenv = require('dotenv');
const querystring = require('node:querystring');

dotenv.config({
  path: './.env',
});

const config = {
  apiUrl: 'https://sandbox.flow.cl/api',
  apiKey: process.env.API_KEY,
  secretKey: process.env.SECRET_KEY,
};

if (!config.apiKey || !config.secretKey) {
  throw new Error('Faltan API_KEY o SECRET_KEY en .env');
}

const checkoutTimeout = process.env.CHECKOUT_TIMEOUT;

if (
  checkoutTimeout !== undefined &&
  checkoutTimeout !== 'none' &&
  (!/^\d+$/.test(checkoutTimeout) || Number(checkoutTimeout) <= 0)
) {
  throw new Error(
    'CHECKOUT_TIMEOUT debe ser un número entero positivo o "none".',
  );
}

const params = {
  apiKey: config.apiKey,
  commerceOrder: crypto.randomUUID(),
  urlConfirmation: 'https://example.com/confirmation',
  urlReturn: 'https://example.com/payment-status',
  email: 'wuilmeralexanderbolivar@gmail.com',
  subject: 'Laboratorio Flow Payment',
  amount: 350,
  currency: 'PEN',

  ...(checkoutTimeout !== 'none'
    ? {
        checkout_timeout: Number(checkoutTimeout ?? 30),
      }
    : {}),
};

const sortedParams = Object.entries(params)
  .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

const toSign = sortedParams
  .map(([key, value]) => `${key}${value}`)
  .join('');

const signature = crypto
  .createHmac('sha256', config.secretKey)
  .update(toSign)
  .digest('hex');

params.s = signature;

const encodedBody = querystring.stringify(params);

async function main() {
  console.log('LAB-001 — Quickstart Flow');
  console.log(`Orden: ${params.commerceOrder}`);

  if (checkoutTimeout === 'none') {
    console.log('Checkout timeout: no configurado');
  } else {
    console.log(
      `Checkout timeout: ${params.checkout_timeout} segundos`,
    );
  }

  console.log('Enviando solicitud a Flow Sandbox...');

  const response = await axios.post(
    `${config.apiUrl}/payment/create`,
    encodedBody,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  console.log('HTTP:', response.status);
  console.log('Respuesta:', response.data);

  if (response.data.url && response.data.token) {
    console.log(
      'Checkout:',
      `${response.data.url}?token=${response.data.token}`,
    );
  }
}

main().catch((error) => {
  if (error.response) {
    console.error('HTTP:', error.response.status);
    console.error('Respuesta:', error.response.data);
  } else {
    console.error('Error:', error.message);
  }

  process.exitCode = 1;
});
