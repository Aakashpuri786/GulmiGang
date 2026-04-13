const axios = require('axios');

const API_BASE = 'http://localhost:5007/api';

async function testLogin() {
  try {
    console.log('Testing login...');
    const loginData = {
      identifier: 'test@example.com',
      password: 'password123'
    };

    const loginRes = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('Login successful:', loginRes.data);

    const token = loginRes.data.token;
    const userRes = await axios.get(`${API_BASE}/auth/user`, {
      headers: { 'x-auth-token': token }
    });
    console.log('User data retrieved:', userRes.data);

    console.log('✅ Login test passed!');
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
  }
}

testLogin();