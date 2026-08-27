const http = require('node:http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  console.log('\n--- REQUEST ---');
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);

  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    console.log('Body:', body || '(vacío)');

    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      const params = new URLSearchParams(body);

      console.log('Parámetros:', Object.fromEntries(params));
    }

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
    });

    res.end('LAB-003 OK\n');
  });
});

server.listen(PORT, () => {
  console.log(`LAB-003 escuchando en http://localhost:${PORT}`);
});
