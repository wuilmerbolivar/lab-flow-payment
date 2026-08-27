const axios = require('axios');
const crypto = require('node:crypto');
require('dotenv').config();

const API_URL = 'https://sandbox.flow.cl/api/payment/getStatus';

const { API_KEY, SECRET_KEY, TOKEN } = process.env;

if (!API_KEY || !SECRET_KEY) {
  console.error('Faltan API_KEY o SECRET_KEY en .env');
  process.exit(1);
}

if (!TOKEN) {
  console.error('Falta TOKEN.');
  console.error(
    'Ejemplo: TOKEN=TU_TOKEN npm run lab:005'
  );
  process.exit(1);
}

const params = {
  apiKey: API_KEY,
  token: TOKEN,
};

const orderedParams = Object.keys(params)
  .sort()
  .map((key) => `${key}${params[key]}`)
  .join('');

const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(orderedParams)
  .digest('hex');

const requestParams = {
  ...params,
  s: signature,
};

console.log('LAB-005 — Consulta de estado');
console.log('Token:', `${TOKEN.slice(0, 12)}...`);
console.log('Consultando Flow Sandbox...');

axios
  .get(API_URL, {
    params: requestParams,
  })
  .then((response) => {
    console.log('HTTP:', response.status);
    console.log('Respuesta:', response.data);
  })
  .catch((error) => {
    if (error.response) {
      console.log('HTTP:', error.response.status);
      console.log('Respuesta:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }

    process.exitCode = 1;
  });
