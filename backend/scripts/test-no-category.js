const https = require('https');
const axios = require('axios');

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function test() {
  try {
    // 不带category参数
    const url = 'https://hfparty.asia/api/v1/parties/published?page=1&pageSize=10&latitude=36.41968&longitude=114.21302&maxDistance=100';
    console.log('=== Testing without category parameter ===');
    console.log('URL:', url);

    const response = await axios.get(url, { httpsAgent: agent });
    const items = response.data.data.items;
    console.log(`Returned ${items.length} parties`);
    items.forEach(p => {
      console.log(`  - ${p.title} (category: ${p.category})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
