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
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL,
    senderName: process.env.BREVO_SENDER_NAME || 'Website enquiry bot',
  },
  clientEmail: process.env.CLIENT_EMAIL,
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
};

const requiredVars = [
  ['BREVO_API_KEY', config.brevo.apiKey],
  ['BREVO_SENDER_EMAIL', config.brevo.senderEmail],
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

