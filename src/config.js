const dotenv = require('dotenv');

dotenv.config();

const parseOrigins = (value) =>
  value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const config = {
  port: Number.parseInt(process.env.PORT ?? '4000', 10),
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    senderEmail: process.env.SENDGRID_SENDER_EMAIL,
    senderName: process.env.SENDGRID_SENDER_NAME || 'Website Enquiry Bot',
  },
  clientEmail: process.env.CLIENT_EMAIL,
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
};

// Check for SendGrid API key
const requiredVars = [
  ['SENDGRID_API_KEY', config.sendgrid.apiKey],
  ['SENDGRID_SENDER_EMAIL', config.sendgrid.senderEmail],
  ['CLIENT_EMAIL', config.clientEmail],
];

const missingVars = requiredVars
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}`
  );
}

module.exports = config;
