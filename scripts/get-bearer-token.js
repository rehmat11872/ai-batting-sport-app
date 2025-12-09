/**
 * Script to generate X Bearer Token from API Key and Secret
 * 
 * Usage: node scripts/get-bearer-token.js
 * 
 * Make sure X_API_KEY and X_API_KEY_SECRET are in .env.local
 */

require('dotenv').config({ path: '.env.local' });

const X_API_KEY = process.env.X_API_KEY;
const X_API_KEY_SECRET = process.env.X_API_KEY_SECRET;

if (!X_API_KEY || !X_API_KEY_SECRET) {
  console.error('❌ Missing X_API_KEY or X_API_KEY_SECRET in .env.local');
  process.exit(1);
}

async function getBearerToken() {
  try {
    // Base64 encode credentials
    const credentials = Buffer.from(`${X_API_KEY}:${X_API_KEY_SECRET}`).toString('base64');
    
    console.log('🔑 Requesting bearer token from X API...\n');
    
    const response = await fetch('https://api.x.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get bearer token:', response.status);
      console.error('Response:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('✅ Bearer token generated successfully!\n');
    console.log('📋 Add this to your .env.local:\n');
    console.log(`X_BEARER_TOKEN=${data.access_token}\n`);
    console.log('💡 Copy the line above and add it to .env.local\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getBearerToken();

