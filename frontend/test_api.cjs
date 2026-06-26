const axios = require('axios');

async function test() {
  try {
    // We need to login first to get the token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mkhe.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    
    const res = await axios.get('http://localhost:5000/api/analytics/revenue', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Revenue Response:");
    console.log(res.data);
    
    const res2 = await axios.get('http://localhost:5000/api/analytics/products-report', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Products Response:");
    console.log(res2.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

test();
