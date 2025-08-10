const { createClient } = require('redis');

// --- IMPORTANT ---
// Make sure this is the same Redis URL from your server.js
const redisUrl = 'redis://default:c8PSfM0nmnBDWCUVGqz5tWBPWDQ4jgm6@redis-12382.c16.us-east-1-2.ec2.redns.redis-cloud.com:12382';

async function clearData() {
  console.log('Connecting to Redis to clear old data...');
  const client = createClient({ url: redisUrl });

  try {
    await client.connect();

    // Delete the keys that hold the old data
    await client.del('chat_history');
    await client.del('online_users');

    console.log('✅ Successfully cleared old chat data from Redis.');
    
    await client.quit();
  } catch (err) {
    console.error('❌ Could not clear data:', err);
  }
}

clearData();