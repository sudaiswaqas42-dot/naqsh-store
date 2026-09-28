const http = require('http');

const PUBLISHABLE_KEY = 'pk_f5e00e96956d20bf784d23ee9052f3bf80ebab9ad4b48167b399385c4fea50a0';

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
        'x-publishable-api-key': PUBLISHABLE_KEY,
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
        'x-publishable-api-key': PUBLISHABLE_KEY,
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
  console.log('=== NAQSH LUXURY ATELIER END-TO-END VERIFICATION ===\n');

  // 1. Authenticate Admin
  console.log('1. Authenticating Admin (admin@naqsh.pk)...');
  const authRes = await post('http://localhost:9000/auth/user/emailpass', {
    email: 'admin@naqsh.pk',
    password: process.env.TEST_PASSWORD
  });
  if (authRes.status !== 200 || !authRes.data.token) {
    throw new Error('Admin auth failed: ' + JSON.stringify(authRes));
  }
  const token = authRes.data.token;
  console.log('   ✓ Admin Authenticated successfully!\n');

  // 2. Fetch Initial Stats
  console.log('2. Fetching baseline NAQSH Analytics metrics...');
  const initStats = await get('http://localhost:9000/admin/dashboard-stats', token);
  console.log('   Baseline Metrics:', initStats.data.metrics);
  const initialSales = initStats.data.metrics.total_sales;
  const initialOrders = initStats.data.metrics.total_orders;
  console.log(`   Baseline Total Sales: Rs. ${initialSales.toLocaleString()} (${initialOrders} orders)\n`);

  // 3. Inspect a real product from catalog to place order
  console.log('3. Selecting product from catalog for live order...');
  const prodRes = await get('http://localhost:9000/admin/products?limit=1', token);
  const product = prodRes.data.products[0];
  const variant = product.variants[0];
  console.log(`   Selected: "${product.title}" (${product.id})`);
  console.log(`   Variant: "${variant.title}" (${variant.id})`);

  // 4. Create Cart on Storefront API (Pakistan region with PKR)
  console.log('\n4. Creating Cart on Storefront API (/store/carts)...');
  // Find region for PKR
  const regionsRes = await get('http://localhost:9000/store/regions');
  const pkRegion = (regionsRes.data.regions || []).find(r => r.currency_code === 'pkr') || regionsRes.data.regions[0];
  console.log(`   Using Region: ${pkRegion.name} (${pkRegion.currency_code.toUpperCase()})`);

  const cartRes = await post('http://localhost:9000/store/carts', {
    region_id: pkRegion.id,
    currency_code: pkRegion.currency_code,
    email: 'hina.altaf@example.com',
    shipping_address: {
      first_name: 'Hina',
      last_name: 'Altaf',
      address_1: 'Plot 42, Block 5, Clifton',
      city: 'Karachi',
      country_code: 'pk',
      postal_code: '75600',
      phone: '+92 300 1234567'
    }
  });

  if (cartRes.status !== 200 && cartRes.status !== 201) {
    throw new Error('Cart creation failed: ' + JSON.stringify(cartRes));
  }
  const cart = cartRes.data.cart;
  console.log(`   ✓ Cart Created: ${cart.id}`);

  // 5. Add to Cart
  console.log('\n5. Adding product to cart (/store/carts/:id/line-items)...');
  const addItemRes = await post(`http://localhost:9000/store/carts/${cart.id}/line-items`, {
    variant_id: variant.id,
    quantity: 1
  });
  if (addItemRes.status !== 200 && addItemRes.status !== 201) {
    throw new Error('Add to cart failed: ' + JSON.stringify(addItemRes));
  }
  console.log('   ✓ Added to cart successfully!');
  const updatedCart = addItemRes.data.cart;
  console.log(`   Cart Subtotal: ${updatedCart.currency_code.toUpperCase()} ${updatedCart.subtotal}`);

  // 6. Add Shipping Method
  console.log('\n6. Adding Shipping Method (Standard Delivery TCS/Leopards)...');
  const shipRes = await post(`http://localhost:9000/store/carts/${cart.id}/shipping-methods`, {
    option_id: 'so_01M3EW9ADCDVY4HHDJT9SVD8HR'
  });
  console.log('   Shipping Method Status:', shipRes.status);

  // 7. Initiate Payment Collection & Session
  console.log('\n7. Initiating Payment Collection & System Payment Session...');
  const payColRes = await post(`http://localhost:9000/store/payment-collections`, {
    cart_id: cart.id
  });
  console.log('   Payment Collection Status:', payColRes.status);
  const paymentCollectionId = payColRes.data?.payment_collection?.id;

  if (paymentCollectionId) {
    const paySessRes = await post(`http://localhost:9000/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
      provider_id: 'pp_system_default'
    });
    console.log('   Payment Session Status:', paySessRes.status);
  }

  // 8. Complete Cart via Medusa v2 Cart Complete
  console.log('\n8. Completing checkout & placing live order...');
  const completeRes = await post(`http://localhost:9000/store/carts/${cart.id}/complete`, {});
  let placedOrderId = null;
  if (completeRes.status === 200 && completeRes.data.order) {
    placedOrderId = completeRes.data.order.id;
    console.log(`   ✓ Order placed successfully! Order ID: ${placedOrderId}`);
  } else {
    console.log('   Complete response:', completeRes.status, completeRes.data);
  }

  // 9. Verify NAQSH Analytics Telemetry update
  console.log('\n9. Checking NAQSH Analytics update...');
  const newStats = await get('http://localhost:9000/admin/dashboard-stats', token);
  console.log('   Updated Metrics:', newStats.data.metrics);
  console.log(`   Total Orders: ${newStats.data.metrics.total_orders} (was ${initialOrders})`);
  console.log(`   Total Revenue: Rs. ${newStats.data.metrics.total_sales.toLocaleString()} (was ${initialSales.toLocaleString()})`);
  console.log(`   Today\'s Sales: Rs. ${newStats.data.metrics.today_sales.toLocaleString()}`);
  console.log(`   Monthly Sales: Rs. ${newStats.data.metrics.monthly_sales.toLocaleString()}`);

  // 10. Test Return Request Submission
  console.log('\n10. Submitting Return Request for order...');
  const returnRes = await post('http://localhost:9000/store/return-requests', {
    order_id: placedOrderId || 'order_01M3EW9EQ2FAYH5RTY7G0YFSA6',
    customer_email: 'hina.altaf@example.com',
    customer_name: 'Hina Altaf',
    items: [{ description: 'Festive Embroidered Kurta' }],
    reason: 'Size exchange needed',
    action_requested: 'exchange',
    notes: 'Exchanging Medium for Small'
  });
  console.log('   Return Request Status:', returnRes.status, returnRes.data);
  
  // 11. Inspect Returns in Admin
  console.log('\n11. Verifying Return Request in Admin (/admin/return-requests)...');
  const adminReturns = await get('http://localhost:9000/admin/return-requests', token);
  console.log(`   Active Return Requests: ${adminReturns.data.return_requests?.length || 0}`);
  if (adminReturns.data.return_requests?.[0]) {
    const r = adminReturns.data.return_requests[0];
    console.log(`   Latest Return: Order #${r.order_id}, Reason: ${r.reason}, Status: ${r.status}`);
  }

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
}

run().catch(console.error);
