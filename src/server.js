const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { sendEnquiryEmail } = require('./mailer');

const app = express();

const corsOptions =
  config.allowedOrigins.length > 0
    ? {
        origin(origin, callback) {
          if (!origin || config.allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error('Not allowed by CORS'));
        },
      }
    : undefined;

if (corsOptions) {
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}

app.use(express.json());
app.use(morgan('dev'));

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/enquiry', async (req, res) => {
  const formData = req.body ?? {};
  const { name = '', email = '', message = '', phone = '', serviceType = '', pickupDate = '', pickupTime = '', pickupLocation = '' } = formData;
  const errors = [];

  // Validate required fields - name and email are always required
  if (!String(name).trim()) errors.push('Name is required');
  const emailStr = String(email).trim();
  if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    errors.push('Valid email is required');
  }

  // For booking forms, validate booking-specific required fields
  // If it's a booking (has serviceType or pickupDate), validate booking fields
  const isBooking = serviceType || pickupDate || pickupTime || pickupLocation;
  if (isBooking) {
    if (!String(serviceType).trim()) errors.push('Service type is required');
    if (!String(pickupDate).trim()) errors.push('Pickup date is required');
    if (!String(pickupTime).trim()) errors.push('Pickup time is required');
    if (!String(pickupLocation).trim()) errors.push('Pickup location is required');
  } else {
    // For regular contact forms, message is required
    if (!String(message).trim()) errors.push('Message is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors, error: errors.join(', ') });
  }

  try {
    // Pass all form data (including additional fields) to the email function
    await sendEnquiryEmail(formData);
    res.json({ message: 'Enquiry sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    const errorBody = error.response?.body || {};
    const errorMessage = errorBody.message || error.message || 'Unknown error';
    const errorCode = errorBody.code || error.code;
    
    console.error('Error details:', JSON.stringify(errorBody, null, 2));
    
    // Provide more helpful error messages for common issues
    let userMessage = 'Unable to send email right now. Please try later.';
    if (errorCode === 'unauthorized' || errorMessage.includes('Key not found') || errorMessage.includes('Invalid')) {
      userMessage = 'Email service configuration error. The API key is invalid or expired.';
      console.error('⚠️  Brevo API key is invalid or expired');
      console.error('⚠️  Please update BREVO_API_KEY in your .env file with a valid key from Brevo dashboard');
    } else if (errorCode === 'permission_denied' || errorMessage.includes('not yet activated')) {
      userMessage = 'Email service is not activated. Please verify your sender email in Brevo dashboard.';
      console.error('⚠️  Brevo SMTP/Transactional Email account is not activated');
      console.error('⚠️  Steps to fix:');
      console.error('   1. Go to https://app.brevo.com/settings/senders');
      console.error('   2. Verify your sender email:', config.brevo.senderEmail);
      console.error('   3. Or contact Brevo support at contact@brevo.com');
    } else if (errorCode === 'invalid_parameter') {
      userMessage = 'Email service configuration error. Please check sender email configuration.';
      console.error('⚠️  Brevo sender email may not be verified');
    }
    
    res
      .status(502)
      .json({ 
        error: userMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: errorMessage,
          code: errorCode
        })
      });
  }
});

app.use((_, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Unexpected error occurred' });
});

// Export for Vercel serverless, or start server for local development
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`🚀 Server ready on port ${config.port}`);
    console.log(`📧 Brevo sender: ${config.brevo.senderEmail}`);
    console.log(`📬 Recipient: ${config.clientEmail}`);
    console.log(`🔑 API Key: ${config.brevo.apiKey ? config.brevo.apiKey.substring(0, 20) + '...' : 'MISSING'}`);
  });
}

module.exports = app;

