const https = require('https');
const axios = require('axios');

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function test() {
  try {
    const partyId = 12;
    console.log(`=== Testing party detail for ID ${partyId} ===\n`);

    const partyUrl = `https://hfparty.asia/api/v1/parties/${partyId}`;
    console.log('Party URL:', partyUrl);
    const partyRes = await axios.get(partyUrl, { httpsAgent: agent });
    console.log('\nParty Data:');
    console.log('coverImage:', partyRes.data.data.coverImage);
    console.log('Full response:', JSON.stringify(partyRes.data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
