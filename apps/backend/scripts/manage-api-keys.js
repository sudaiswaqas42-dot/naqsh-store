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
  console.log('Authenticating...');
  const loginRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/auth/user/emailpass',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@naqsh.com', password: 'Admin12345!' });

  console.log('Login status:', loginRes.status, loginRes.data);
  const token = loginRes.data?.token;
  if (!token) {
    console.error('Failed to get token!');
    return;
  }

  // 1. List API Keys
  console.log('Fetching API keys...');
  const keysRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/api-keys',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Existing API keys:', JSON.stringify(keysRes.data, null, 2));

  let pubKey = keysRes.data?.api_keys?.find(k => k.type === 'publishable');

  // 2. Fetch Sales Channels
  const scRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/sales-channels',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Sales channels:', JSON.stringify(scRes.data, null, 2));
  const scIds = scRes.data?.sales_channels?.map(s => s.id) || [];

  if (!pubKey) {
    console.log('Creating Publishable API Key...');
    const createRes = await request({
      hostname: 'naqsh-backend-production.up.railway.app',
      path: '/admin/api-keys',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      title: 'Webstore Publishable API Key',
      type: 'publishable'
    });
    console.log('Created key:', JSON.stringify(createRes.data, null, 2));
    pubKey = createRes.data?.api_key;
  }

  if (pubKey && scIds.length > 0) {
    console.log(`Linking sales channels [${scIds.join(', ')}] to API Key ${pubKey.id}...`);
    const linkRes = await request({
      hostname: 'naqsh-backend-production.up.railway.app',
      path: `/admin/api-keys/${pubKey.id}/sales-channels`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      add: scIds
    });
    console.log('Link result status:', linkRes.status, linkRes.data || linkRes.raw);
  }

  // Also check regions
  const regRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/regions',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Regions:', JSON.stringify(regRes.data, null, 2));

  console.log('====================================');
  console.log('FINAL PUBLISHABLE KEY:', pubKey?.token);
  console.log('====================================');
}

run().catch(console.error);
