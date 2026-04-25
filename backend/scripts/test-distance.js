const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const axios = require('axios');

async function testAPI() {
  try {
    const url = 'https://hfparty.asia/api/v1/parties/published?page=1&pageSize=10&latitude=36.41968&longitude=114.21302&maxDistance=100';
    console.log('Testing URL:', url);
    
    const response = await axios.get(url, { httpsAgent: agent });
    console.log('Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.items) {
      console.log('\nItems count:', response.data.data.items.length);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAPI();
