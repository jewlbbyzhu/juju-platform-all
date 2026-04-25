const https = require('https');
const axios = require('axios');

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function test() {
  try {
    const partyId = 12;
    console.log(`=== Testing party detail for ID ${partyId} ===\n`);

    // 测试聚会详情
    const partyUrl = `https://hfparty.asia/api/v1/parties/${partyId}`;
    console.log('Party URL:', partyUrl);
    const partyRes = await axios.get(partyUrl, { httpsAgent: agent });
    console.log('\nParty Data:');
    console.log(JSON.stringify(partyRes.data, null, 2));

    // 测试票种
    const ticketsUrl = `https://hfparty.asia/api/v1/parties/${partyId}/tickets`;
    console.log('\n\nTickets URL:', ticketsUrl);
    try {
      const ticketsRes = await axios.get(ticketsUrl, { httpsAgent: agent });
      console.log('\nTickets Data:');
      console.log(JSON.stringify(ticketsRes.data, null, 2));
    } catch (e) {
      console.log('Tickets Error:', e.response?.status, e.response?.data?.message || e.message);
    }

    // 测试参与者
    const participantsUrl = `https://hfparty.asia/api/v1/parties/${partyId}/participants`;
    console.log('\n\nParticipants URL:', participantsUrl);
    try {
      const participantsRes = await axios.get(participantsUrl, { httpsAgent: agent });
      console.log('\nParticipants Data:');
      console.log(JSON.stringify(participantsRes.data, null, 2));
    } catch (e) {
      console.log('Participants Error:', e.response?.status, e.response?.data?.message || e.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
