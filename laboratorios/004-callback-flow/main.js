const http = require('node:http');

const PORT = 3000;
const CALLBACK_PATH = '/flow/confirmation';

const server = http.createServer((req, res) => {
  console.log('\n--- CALLBACK ---');

  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);

  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    console.log('Body:', body || '(vacío)');

    if (req.method !== 'POST') {
      res.writeHead(405, {
        'Content-Type': 'text/plain; charset=utf-8',
      });

      return res.end('Método no permitido\n');
    }

    if (req.url !== CALLBACK_PATH) {
      res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8',
      });

      return res.end('Endpoint no encontrado\n');
    }

    const contentType = req.headers['content-type'];

    if (contentType !== 'application/x-www-form-urlencoded') {
      res.writeHead(415, {
        'Content-Type': 'text/plain; charset=utf-8',
      });

      return res.end('Content-Type no soportado\n');
    }

    const params = new URLSearchParams(body);

    console.log('Parámetros:', Object.fromEntries(params));

    const token = params.get('token');

    console.log('Token:', token || '(no recibido)');

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
    });

    res.end('CALLBACK RECIBIDO\n');
  });
});

server.listen(PORT, () => {
  console.log(`LAB-004 escuchando en http://localhost:${PORT}`);
  console.log(`Callback: http://localhost:${PORT}${CALLBACK_PATH}`);
});
