require('dotenv').config();
const Brevo = require('sib-api-v3-sdk');

const client = Brevo.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

console.log('🔍 Checking Brevo Account Status...\n');

// Check account
const accountApi = new Brevo.AccountApi();
accountApi.getAccount()
  .then(account => {
    console.log('✅ Account Information:');
    console.log('   Email:', account.email);
    console.log('   Plan:', account.plan?.[0]?.type || 'Unknown');
    console.log('   Credits:', account.plan?.[0]?.credits || 'N/A');
    console.log('');
    
    // Check senders
    const sendersApi = new Brevo.SendersApi();
    return sendersApi.getSenders()
      .then(senders => {
        console.log('📧 Verified Senders:');
        if (senders.senders && senders.senders.length > 0) {
          senders.senders.forEach(s => {
            console.log(`   - ${s.email} (Status: ${s.status})`);
          });
        } else {
          console.log('   ⚠️  No verified senders found');
          console.log('   💡 You need to verify your sender email in Brevo dashboard');
        }
        console.log('');
        
        // Check current sender email
        const currentSender = process.env.BREVO_SENDER_EMAIL;
        console.log('📬 Current Sender Email (from .env):', currentSender);
        const isVerified = senders.senders?.some(s => s.email === currentSender && s.status === 'validated');
        if (isVerified) {
          console.log('   ✅ Sender email is verified');
        } else {
          console.log('   ⚠️  Sender email may not be verified');
        }
      })
      .catch(err => {
        console.error('❌ Error checking senders:', err.response?.body || err.message);
      });
  })
  .catch(err => {
    console.error('❌ Error checking account:', err.response?.body || err.message);
  });

