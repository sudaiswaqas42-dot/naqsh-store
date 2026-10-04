const https = require('https');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('Logging in...');
  const loginRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/auth/user/emailpass',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@naqsh.com', password: 'Admin12345!' });

  const token = loginRes.data?.token;
  if (!token) {
    console.error('Failed login:', loginRes.data);
    return;
  }
  console.log('Logged in successfully!');

  console.log('Triggering reset_blueprint to load all 10 homepage sections with cards...');
  const resetRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/homepage-sections',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, { action: 'reset_blueprint' });

  console.log('Reset response status:', resetRes.status);

  // Now fetch sections via store API to verify what storefront gets
  console.log('Fetching from /store/homepage-sections...');
  const storeRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/store/homepage-sections',
    method: 'GET',
    headers: {
      'x-publishable-api-key': 'pk_2fbb7de468fd0bd55aa01e0123f2db1dd9e4dd759d74bccd7dfa739cfa45cfdf'
    }
  });

  const sections = storeRes.data?.sections || [];
  console.log(`Loaded ${sections.length} sections for storefront:`);
  sections.forEach((s, idx) => {
    console.log(` [${idx + 1}] Rank ${s.rank} | Key: ${s.key} | Type: ${s.type} | Title: "${s.title}" | Cards: ${s.settings?.cards?.length || (s.settings?.slides ? s.settings.slides.length + ' slides' : 'none')}`);
  });
}

run().catch(console.error);
