const fetch = require('node-fetch');

async function testApi() {
  const baseUrl = 'http://localhost:5001/api';
  
  console.log('--- Testing API Endpoints ---');
  
  try {
    // 1. Health Check
    console.log('1. Testing Health Check (/).../');
    const healthResponse = await fetch('http://localhost:5001/');
    const health = await healthResponse.json();
    console.log('   Response:', health);

    // 2. Stories
    console.log('2. Testing Stories (/instagram/stories)...');
    const storiesResponse = await fetch(`${baseUrl}/instagram/stories`);
    const stories = await storiesResponse.json();
    console.log(`   Found ${stories.length} stories.`);

    // 3. Posts
    console.log('3. Testing Posts (/instagram/posts)...');
    const postsResponse = await fetch(`${baseUrl}/instagram/posts`);
    const posts = await postsResponse.json();
    console.log(`   Found ${posts.length} posts.`);

    // 4. User Profile (Testing with a random user if any exist)
    if (posts.length > 0) {
      const userId = posts[0].user._id;
      console.log(`4. Testing User Profile (/instagram/user/profile/${userId})...`);
      const profileResponse = await fetch(`${baseUrl}/instagram/user/profile/${userId}`);
      const profile = await profileResponse.json();
      console.log(`   User found: ${profile.username}`);
    }

    console.log('\n--- API and Database Connection Verified Successfully! ---');
  } catch (err) {
    console.error('\n--- API Test Failed! ---');
    console.error('Error:', err.message);
  }
}

testApi();
