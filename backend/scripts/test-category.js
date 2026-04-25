const https = require('https');
const axios = require('axios');

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function testCategory(category) {
  try {
    const url = `https://hfparty.asia/api/v1/parties/published?page=1&pageSize=10&category=${category}&latitude=36.41968&longitude=114.21302&maxDistance=100`;
    console.log(`\n=== Testing category=${category} ===`);
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

async function main() {
  await testCategory(0);
  await testCategory(1);
  await testCategory(2);
  await testCategory(3);
}

main();
