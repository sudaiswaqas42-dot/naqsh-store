const http = require('http');

function post(url, data, token = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-publishable-api-key': 'pk_f5e00e96956d20bf784d23ee9052f3bf80ebab9ad4b48167b399385c4fea50a0',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, token = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('=== TESTING CUSTOMER CARE SUBMISSION FROM STOREFRONT TO BACKEND ===\n');

  // 1. Submit contact message from Storefront
  console.log('1. Submitting customer support message from storefront (/store/contact)...');
  const submitRes = await post('http://localhost:9000/store/contact', {
    name: 'Ayesha Malik',
    email: 'ayesha.malik@example.com',
    phone: '+92 321 9876543',
    subject: 'Custom Bridal Fitting Inquiry',
    message: 'I would like to inquire about booking a bespoke fitting appointment at your Lahore atelier for an upcoming wedding.'
  });
  console.log('   Submission Status:', submitRes.status);
  console.log('   Response ID:', submitRes.data?.id);

  if (submitRes.status !== 200 && submitRes.status !== 201) {
    throw new Error('Contact submission failed: ' + JSON.stringify(submitRes));
  }

  // 2. Authenticate Admin
  console.log('\n2. Authenticating Admin (admin@naqsh.pk)...');
  const authRes = await post('http://localhost:9000/auth/user/emailpass', {
    email: 'admin@naqsh.pk',
    password: process.env.TEST_PASSWORD
  });
  const token = authRes.data.token;

  // 3. Verify in Admin Customer Care
  console.log('\n3. Fetching Customer Care messages in Admin (/admin/customer-care)...');
  const adminRes = await get('http://localhost:9000/admin/customer-care?offset=0', token);
  console.log('   Admin Fetch Status:', adminRes.status);
  console.log(`   Total Messages in Admin: ${adminRes.data.count}`);
  console.log('   Messages List:', adminRes.data.messages);

  const matched = (adminRes.data.messages || []).find(m => m.email === 'ayesha.malik@example.com');
  if (matched) {
    console.log(`\n   ✓ VERIFIED: Message from "${matched.name}" with subject "${matched.subject}" is present in Admin panel!`);
  } else {
    console.log('   Could not find matching message in admin response.');
  }

  console.log('\n=== CUSTOMER CARE TEST COMPLETED! ===');
}

run().catch(console.error);
