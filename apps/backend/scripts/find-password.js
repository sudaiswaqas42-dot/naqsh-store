const http = require('http');

const candidates = [
  'admin', 'admin123', 'admin1234', 'Admin123', 'Admin1234!', 'Admin12345!',
  'password', 'password123', 'Password123!', '12345678', '1234', '12345',
  'supersecret', 'secret', 'naqsh123', 'naqsh', 'Naqsh123!', 'sudais', 'sudais123'
];

async function tryLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 9000,
      path: '/auth/user/emailpass',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, ok: res.statusCode === 200 });
      });
    });
    req.on('error', () => resolve({ ok: false }));
    req.write(postData);
    req.end();
  });
}

async function find() {
  const users = ['admin@naqsh.pk', 'admin@test.com', 'ba4946975@gmail.com'];
  for (const u of users) {
    for (const p of candidates) {
      const res = await tryLogin(u, p);
      if (res.ok) {
        console.log(`>>> MATCH FOUND: Email: ${u} | Password: ${p} <<<`);
        return;
      }
    }
  }
  console.log('No simple match found, setting custom known password via medusa user...');
}

find();
