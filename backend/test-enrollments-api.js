// Test script to check class enrollments API
// Run this in Node.js or use in Postman

const testEnrollmentsAPI = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  
  // Replace with your actual token and class ID
  const TOKEN = 'YOUR_TOKEN_HERE';
  const CLASS_ID = 'YOUR_CLASS_ID_HERE';
  
  try {
    console.log('🧪 Testing Class Enrollments API...');
    console.log('📍 URL:', `${BASE_URL}/classes/${CLASS_ID}/enrollments`);
    
    const response = await fetch(`${BASE_URL}/classes/${CLASS_ID}/enrollments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Status Text:', response.statusText);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('📚 Number of enrollments:', data.length);
      console.log('👤 Sample enrollment:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('❌ Error!');
      console.log('Error data:', data);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Instructions for testing:
console.log(`
📋 INSTRUCTIONS TO TEST:

1. Get your auth token:
   - Login via mobile app or web
   - Check AsyncStorage (mobile) or localStorage (web)
   - Copy the token

2. Get a class ID:
   - Open the class list in mobile app
   - Check console logs for class IDs
   - Or query MongoDB directly

3. Run the test:
   - Replace TOKEN and CLASS_ID above
   - Run: node backend/test-enrollments-api.js
   - Or copy to browser console and run testEnrollmentsAPI()

4. Check the output:
   - ✅ Success = enrollments loaded correctly
   - ❌ Error = check error message for details
`);

// Uncomment to run immediately:
// testEnrollmentsAPI();

export default testEnrollmentsAPI;
