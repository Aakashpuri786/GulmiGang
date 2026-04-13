// Test script to verify authentication flow using fetch
const API_BASE = 'http://localhost:5007/api';

async function testAuth() {
  console.log('🧪 Testing GulmiGang Authentication Flow...\n');

  try {
    // Test 1: Register a new user with unique credentials
    console.log('1️⃣ Testing Registration...');
    const timestamp = Date.now().toString().slice(-4); // Use last 4 digits
    const registerData = {
      fullName: 'Test User ' + timestamp,
      username: 'test' + timestamp,
      email: 'test' + timestamp + '@example.com',
      password: 'testpassword123',
      location: 'Resunga'
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();

    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${JSON.stringify(registerResult)}`);
    }

    console.log('✅ Registration successful!');
    console.log('   Token received:', registerResult.token ? 'Yes' : 'No');
    console.log('   User ID:', registerResult.user.id);

    // Test 2: Login with the registered user
    console.log('\n2️⃣ Testing Login...');
    const loginData = {
      identifier: 'test' + timestamp,
      password: 'testpassword123'
    };

    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginResult)}`);
    }

    console.log('✅ Login successful!');
    console.log('   Token received:', loginResult.token ? 'Yes' : 'No');
    console.log('   User:', loginResult.user.username);

    const token = loginResult.token;

    // Test 3: Access protected route
    console.log('\n3️⃣ Testing Protected Route...');
    const userResponse = await fetch(`${API_BASE}/auth/user`, {
      method: 'GET',
      headers: { 'x-auth-token': token }
    });

    const userResult = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error(`Protected route failed: ${JSON.stringify(userResult)}`);
    }

    console.log('✅ Protected route accessible!');
    console.log('   User data:', userResult.username);

    console.log('\n🎉 All authentication tests passed! The system is working perfectly.');
    console.log('\n📱 Frontend URL: http://localhost:5175/');
    console.log('🔧 Backend API: http://localhost:5007/api/');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('User already exists')) {
      console.log('   Try running the test again with different credentials.');
    }
  }
}

testAuth();