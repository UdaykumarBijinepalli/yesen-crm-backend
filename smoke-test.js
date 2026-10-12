/* eslint-disable no-console */
// Full end-to-end smoke test. Needs a real MongoDB reachable at MONGO_URI —
// uses mongodb-memory-server to spin one up automatically if none is given.
// Run with: pnpm test:smoke
//
// Note: env vars are set below BEFORE any app code is imported. In ESM,
// static `import` statements are hoisted and evaluated before any other
// top-level code runs, so if we statically imported ./src/app.js at the
// top of this file it would read process.env before these lines execute.
// Dynamic import() is a normal function call evaluated in place, so it
// runs *after* the env vars are set — that's why app/User below are
// loaded with `await import(...)` rather than a top-level `import`.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_at_least_16_chars';
process.env.FORMS_API_KEY = 'test_forms_key_123';
process.env.CORS_ORIGINS = '';
process.env.LOG_LEVEL = 'silent';

function assert(cond, msg) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

async function main() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongoose = (await import('mongoose')).default;
  const request = (await import('supertest')).default;

  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);

  const { default: app } = await import('./src/app.js');
  const { default: User } = await import('./src/models/User.js');

  // 1. bootstrap admin user directly (mirrors seed script)
  const passwordHash = await User.hashPassword('Passw0rd!');
  await User.create({ name: 'Admin', username: 'admin', passwordHash, role: 'admin' });

  // 2. login
  let res = await request(app).post('/api/v1/auth/login').send({ username: 'admin', password: 'Passw0rd!' });
  assert(res.status === 200, `login failed: ${res.status} ${JSON.stringify(res.body)}`);
  let { token } = res.body;
  console.log('✓ login works');

  // 3. product-page form submission -> should auto-tag with product name
  res = await request(app).post('/api/v1/forms/product').set('x-forms-key', 'test_forms_key_123').send({
    clientName: 'Jane Doe',
    email: 'jane@example.com',
    productOrServiceName: 'Industrial Chiller X200',
    sourcePage: '/products/chiller-x200',
  });
  assert(res.status === 201, `product intake failed: ${res.status} ${JSON.stringify(res.body)}`);
  assert(res.body.inquiry.tags.includes('Industrial Chiller X200'), 'product tag missing');
  assert(res.body.inquiry.stage === 'Inquired', 'default stage wrong');
  const inquiryId = res.body.inquiry._id;
  console.log('✓ product form intake + auto-tag works');

  // 4. contact-page form -> should tag "Open"
  res = await request(app)
    .post('/api/v1/forms/contact')
    .set('x-forms-key', 'test_forms_key_123')
    .send({ clientName: 'General Inquirer', phone: '+911234567890' });
  assert(res.status === 201, `contact intake failed: ${res.status} ${JSON.stringify(res.body)}`);
  assert(res.body.inquiry.tags.includes('Open'), 'contact tag should be Open');
  console.log('✓ contact form intake + Open tag works');

  // 5. validation: missing name/email/phone should 400 via Joi, not 500
  res = await request(app).post('/api/v1/forms/contact').set('x-forms-key', 'test_forms_key_123').send({});
  assert(res.status === 400, `expected 400 for invalid payload, got ${res.status}`);
  console.log('✓ Joi validation rejects malformed intake payloads');

  // 5b. product form without productOrServiceName must 400 (MOM auto-tag)
  res = await request(app)
    .post('/api/v1/forms/product')
    .set('x-forms-key', 'test_forms_key_123')
    .send({ clientName: 'No Product', email: 'noprod@example.com' });
  assert(res.status === 400, `product without productOrServiceName should 400, got ${res.status}`);
  console.log('✓ product/service forms require productOrServiceName');

  // 5c. service form intake + auto-tag
  res = await request(app)
    .post('/api/v1/forms/service')
    .set('x-forms-key', 'test_forms_key_123')
    .send({
      clientName: 'Service Client',
      phone: '+919988776655',
      productOrServiceName: 'AMC Maintenance',
    });
  assert(res.status === 201, `service intake failed: ${res.status}`);
  assert(res.body.inquiry.tags.includes('AMC Maintenance'), 'service tag missing');
  console.log('✓ service form intake + auto-tag works');

  // 6. wrong forms key should be rejected
  res = await request(app)
    .post('/api/v1/forms/contact')
    .set('x-forms-key', 'wrong')
    .send({ clientName: 'X', phone: '1' });
  assert(res.status === 401, 'forms key auth not enforced');
  console.log('✓ forms key auth enforced');

  // 7. unauthenticated board fetch should be rejected
  res = await request(app).get('/api/v1/inquiries?board=true');
  assert(res.status === 401, 'inquiries route should require auth');
  console.log('✓ inquiries route requires auth');

  // 8. authenticated Kanban board fetch -> 6 hard-coded columns in order
  res = await request(app).get('/api/v1/inquiries?board=true').set('Authorization', `Bearer ${token}`);
  assert(res.status === 200, `board fetch failed: ${res.status}`);
  const stages = res.body.columns.map((c) => c.stage);
  const expectedStages = ['Inquired', 'Contacted', 'Quotation Provided', 'Negotiation', 'Completed', 'Lost'];
  assert(JSON.stringify(stages) === JSON.stringify(expectedStages), `pipeline stages wrong: ${stages}`);
  const inquiredCol = res.body.columns.find((c) => c.stage === 'Inquired');
  assert(inquiredCol.cards.length === 3, `expected 3 cards in Inquired, got ${inquiredCol.cards.length}`);
  console.log('✓ Kanban board returns fixed 6-stage columns with cards');

  // 9. move a card's stage (drag/drop)
  res = await request(app)
    .patch(`/api/v1/inquiries/${inquiryId}/stage`)
    .set('Authorization', `Bearer ${token}`)
    .send({ stage: 'Contacted' });
  assert(res.status === 200 && res.body.inquiry.stage === 'Contacted', 'stage move failed');
  console.log('✓ stage move (drag/drop) works');

  // 10. invalid/custom stage should be rejected by Joi before it hits the service
  res = await request(app)
    .patch(`/api/v1/inquiries/${inquiryId}/stage`)
    .set('Authorization', `Bearer ${token}`)
    .send({ stage: 'Made Up Stage' });
  assert(res.status === 400, 'invalid stage should be rejected');
  console.log('✓ invalid/custom pipeline stage rejected');

  // 11. get full drawer detail -> inquiry + logs + documents
  res = await request(app).get(`/api/v1/inquiries/${inquiryId}`).set('Authorization', `Bearer ${token}`);
  assert(res.status === 200, 'drawer detail fetch failed');
  assert(
    Array.isArray(res.body.logs) && res.body.logs.length >= 2,
    'expected system logs (intake + stage change)'
  );
  assert(Array.isArray(res.body.documents), 'documents array missing');
  console.log('✓ slide-in drawer detail (inquiry + logs + documents) works');

  // 12. malformed ObjectId should 400, not crash as an unhandled CastError
  res = await request(app).get('/api/v1/inquiries/not-a-valid-id').set('Authorization', `Bearer ${token}`);
  assert(res.status === 400, `malformed id should 400, got ${res.status}`);
  console.log('✓ malformed ObjectId handled cleanly');

  // 13. add manual tag
  res = await request(app)
    .post(`/api/v1/inquiries/${inquiryId}/tags`)
    .set('Authorization', `Bearer ${token}`)
    .send({ tag: 'VIP' });
  assert(res.status === 200 && res.body.inquiry.tags.includes('VIP'), 'manual tag add failed');
  console.log('✓ manual tag add works');

  // 14. add a conversation log entry
  res = await request(app)
    .post(`/api/v1/inquiries/${inquiryId}/logs`)
    .set('Authorization', `Bearer ${token}`)
    .send({ type: 'call', message: 'Called client, discussed pricing.' });
  assert(res.status === 201, 'log add failed');
  console.log('✓ conversation log entry works');

  // 15. mark quotation as sent
  res = await request(app)
    .patch(`/api/v1/inquiries/${inquiryId}/quotation`)
    .set('Authorization', `Bearer ${token}`)
    .send({ sent: true });
  assert(res.status === 200 && res.body.inquiry.quotation.sent === true, 'quotation mark-sent failed');
  console.log('✓ mark quotation as sent works');

  // 16. upload a document (invoice) into the inquiry
  res = await request(app)
    .post(`/api/v1/inquiries/${inquiryId}/documents`)
    .set('Authorization', `Bearer ${token}`)
    .field('type', 'invoice')
    .attach('file', Buffer.from('%PDF-1.4 fake pdf content'), {
      filename: 'invoice.pdf',
      contentType: 'application/pdf',
    });
  assert(res.status === 201, `document upload failed: ${res.status} ${JSON.stringify(res.body)}`);
  console.log('✓ document upload works');

  res = await request(app)
    .get(`/api/v1/inquiries/${inquiryId}/documents`)
    .set('Authorization', `Bearer ${token}`);
  assert(res.status === 200 && res.body.documents.length === 1, 'document listing failed');
  console.log('✓ document listing works');

  // 17. rate limiting headers present (sanity check limiter is wired up)
  res = await request(app).get('/api/v1/inquiries?board=true').set('Authorization', `Bearer ${token}`);
  assert(res.headers['ratelimit-limit'] !== undefined, 'rate limit headers missing');
  console.log('✓ rate limiting middleware active');

  // 18. unversioned /api alias should serve the same routes as /api/v1
  res = await request(app).get('/api/meta/pipeline').set('Authorization', `Bearer ${token}`);
  assert(res.status === 200 && Array.isArray(res.body.stages), 'unversioned /api alias not working');
  res = await request(app).get('/api/v1/meta/pipeline').set('Authorization', `Bearer ${token}`);
  assert(res.status === 200 && Array.isArray(res.body.stages), 'versioned /api/v1 route not working');
  console.log('✓ /api/v1 versioned route and /api backward-compatible alias both work');

  // 19. self-service password change (Settings page) - wrong current
  // password rejected, correct one works and old password stops working
  // (run BEFORE the brute-force limiter test so login isn't 429'd)
  res = await request(app)
    .patch('/api/v1/auth/password')
    .set('Authorization', `Bearer ${token}`)
    .send({ currentPassword: 'wrong', newPassword: 'NewPassw0rd!' });
  assert(res.status === 401, 'wrong current password should be rejected');

  res = await request(app)
    .patch('/api/v1/auth/password')
    .set('Authorization', `Bearer ${token}`)
    .send({ currentPassword: 'Passw0rd!', newPassword: 'NewPassw0rd!' });
  assert(res.status === 200, `change-password failed: ${res.status}`);

  res = await request(app).post('/api/v1/auth/login').send({ username: 'admin', password: 'NewPassw0rd!' });
  assert(res.status === 200, 'login with new password should work');
  console.log('✓ self-service password change works end-to-end');

  // 20. auth brute-force limiter: exceeding AUTH_RATE_LIMIT_MAX failed
  // attempts should 429, independent of the general API limiter.
  let lastLoginRes;
  for (let i = 0; i < 6; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    lastLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'wrong-password' });
  }
  assert(
    lastLoginRes.status === 429,
    `expected 429 after repeated failed logins, got ${lastLoginRes.status}`
  );
  console.log('✓ auth brute-force rate limiter blocks repeated failed logins');

  // 21. inquiry `value` field - settable at intake and editable after
  // Re-auth after limiter may still be hot; use a fresh admin token from
  // earlier password-change login response if available.
  token = res.body.token;
  res = await request(app)
    .post('/api/v1/forms/product')
    .set('x-forms-key', 'test_forms_key_123')
    .send({ clientName: 'Value Test', phone: '1112223333', productOrServiceName: 'Widget', value: 50000 });
  assert(res.status === 201 && res.body.inquiry.value === 50000, 'value not stored on intake');
  const valueInquiryId = res.body.inquiry._id;
  res = await request(app)
    .patch(`/api/v1/inquiries/${valueInquiryId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ value: 75000 });
  assert(res.status === 200 && res.body.inquiry.value === 75000, 'value not editable via PATCH');
  console.log('✓ inquiry value field works on intake and edit');

  console.log('\nALL SMOKE TESTS PASSED');
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
