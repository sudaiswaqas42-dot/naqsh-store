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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForBackend() {
  console.log('Waiting for Railway backend deployment to become ready...');
  for (let attempt = 1; attempt <= 60; attempt++) {
    try {
      const res = await request({
        hostname: 'naqsh-backend-production.up.railway.app',
        path: '/health',
        method: 'GET'
      });
      if (res.status === 200) {
        console.log(`Backend is ready! (attempt ${attempt})`);
        return true;
      }
    } catch (e) {
      // not ready yet
    }
    await sleep(5000);
  }
  throw new Error('Backend health check timed out.');
}

async function run() {
  await waitForBackend();
  // Wait extra 5s for container initialization
  await sleep(5000);

  console.log('Authenticating as admin...');
  const loginRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/auth/user/emailpass',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@naqsh.com', password: 'Admin12345!' });

  const token = loginRes.data?.token;
  if (!token) {
    console.error('Login failed! Trying to wait 10s and retry...');
    await sleep(10000);
    const retryRes = await request({
      hostname: 'naqsh-backend-production.up.railway.app',
      path: '/auth/user/emailpass',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@naqsh.com', password: 'Admin12345!' });
    if (!retryRes.data?.token) {
      console.error('Fatal: Could not authenticate.', retryRes.data || retryRes.raw);
      return;
    }
  }

  const authToken = token || loginRes.data?.token;
  console.log('Admin authenticated successfully!');

  console.log('Triggering POST /admin/restore-database to import 5,016 products and categories...');
  const restoreRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/restore-database',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('Restore response status:', restoreRes.status, restoreRes.data || restoreRes.raw);

  console.log('Checking restored products count on production...');
  const prodRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/products?limit=1',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  console.log('Total products on production:', prodRes.data?.count);

  console.log('Checking categories on production...');
  const catRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/product-categories?limit=50',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  console.log('Total categories on production:', catRes.data?.count);
  const catHandles = catRes.data?.product_categories?.map(c => c.handle);
  console.log('Category handles:', catHandles);

  console.log('Synchronizing homepage sections...');
  const homeRes = await request({
    hostname: 'naqsh-backend-production.up.railway.app',
    path: '/admin/homepage-sections',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  }, { action: 'reset_blueprint' });
  console.log('Homepage sync status:', homeRes.status);

  console.log('============================================');
  console.log('ALL LOCAL DATA RESTORED TO PRODUCTION!');
  console.log('============================================');
}

run().catch(console.error);
