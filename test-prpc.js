// Test script for xandeum-prpc-js
const { PrpcClient } = require('xandeum-prpc');

async function testPrpcConnection() {
  console.log('🔍 Testing Xandeum pRPC Connection...\n');

  // Test all seed IPs from the documentation
  const seedIPs = [
    "173.212.220.65",
    "161.97.97.41",
    "192.190.136.36",
    "192.190.136.38",
    "207.244.255.1",
    "192.190.136.28",
    "192.190.136.29",
    "173.212.203.145"
  ];

  console.log(`Testing ${seedIPs.length} seed IPs...\n`);

  for (const ip of seedIPs) {
    console.log(`\n📡 Testing ${ip}...`);

    try {
      // Create client with 5 second timeout
      const client = new PrpcClient(ip, 5000);

      // Try to get pods
      console.log('  → Calling getPods()...');
      const podsResponse = await client.getPods();
      console.log(`  ✅ SUCCESS! Got ${podsResponse.total_count} pods`);
      console.log(`  📦 Sample response:`, JSON.stringify(podsResponse, null, 2).substring(0, 500));

      // Try to get stats
      console.log('\n  → Calling getStats()...');
      const stats = await client.getStats();
      console.log(`  ✅ Stats received:`, JSON.stringify(stats, null, 2));

      // If we got here, this IP works!
      console.log(`\n✨ WORKING IP FOUND: ${ip}\n`);

      // Try getPodsWithStats for complete data
      console.log('  → Calling getPodsWithStats()...');
      const podsWithStats = await client.getPodsWithStats();
      console.log(`  ✅ Got ${podsWithStats.total_count} pods with stats`);

      // Show first pod details
      if (podsWithStats.pods && podsWithStats.pods.length > 0) {
        console.log('\n  📋 First Pod Details:');
        console.log(JSON.stringify(podsWithStats.pods[0], null, 2));
      }

      // Success! We can stop testing
      return;

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n\n⚠️  All seed IPs failed. The pRPC network might be down or not publicly accessible.');
  console.log('Consider using mock data for development.\n');
}

// Run the test
testPrpcConnection()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
