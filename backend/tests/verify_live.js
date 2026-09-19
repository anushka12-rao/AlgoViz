const http = require('http');

function testEndpoint(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body: body }));
    });
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const r1 = await testEndpoint('/api/health');
  console.log('1. Health check:', r1.status, r1.body);

  const r2 = await testEndpoint('/api/unknown');
  console.log('2. 404 check:', r2.status, r2.body);

  const r3 = await testEndpoint('/api/health', 'POST', '{"bad": json', { 'Content-Type': 'application/json' });
  console.log('3. Malformed JSON check:', r3.status, r3.body);
})();
