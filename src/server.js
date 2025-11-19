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
  const { name = '', email = '', subject = '', message = '' } = req.body ?? {};
  const errors = [];

  if (!name.trim()) errors.push('Name is required');
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('Valid email is required');
  if (!message.trim()) errors.push('Message is required');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    await sendEnquiryEmail({ name, email, subject, message });
    res.json({ message: 'Enquiry sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    res
      .status(502)
      .json({ error: 'Unable to send email right now. Please try later.' });
  }
});

app.use((_, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Unexpected error occurred' });
});

app.listen(config.port, () => {
  console.log(`🚀 Server ready on port ${config.port}`);
});

