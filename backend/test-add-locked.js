import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

// Login to get token (use instructor account)
async function login() {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'instructor1@gmail.com',
      password: 'instructor123'
    })
  });
  
  const data = await response.json();
  return data.token;
}

// Add isLocked field
async function addLockedField() {
  try {
    console.log('🔑 Logging in...');
    const token = await login();
    console.log('✅ Logged in successfully');
    
    console.log('\n🔧 Adding isLocked field to attendance records...');
    const response = await fetch(`${API_URL}/attendance/add-locked-field`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('✅ Result:', result);
    
    if (response.ok) {
      console.log(`\n✨ Success! Updated ${result.modified} records`);
    } else {
      console.log('\n❌ Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addLockedField();
