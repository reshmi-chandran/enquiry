const Brevo = require('sib-api-v3-sdk');
const config = require('./config');

const client = Brevo.ApiClient.instance;
client.authentications['api-key'].apiKey = config.brevo.apiKey;

const transactionalApi = new Brevo.TransactionalEmailsApi();

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildEmailBody = ({ name = '', email = '', subject = '', message = '' }) => {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();

  const safeName = trimmedName || 'Website enquiry';
  const safeSubject = trimmedSubject
    ? `New enquiry: ${trimmedSubject}`
    : 'New enquiry received';
  const safeMessage = trimmedMessage;

  const lines = [
    `You received a new enquiry from ${safeName}.`,
    trimmedEmail ? `Email: ${trimmedEmail}` : null,
    trimmedSubject ? `Subject: ${trimmedSubject}` : null,
    '---',
    safeMessage,
  ].filter(Boolean);

  const textContent = lines.join('\n');
  const htmlContent = lines
    .map((line) => `<p>${line ? escapeHtml(line) : '&nbsp;'}</p>`)
    .join('');

  return { safeSubject, textContent, htmlContent, trimmedEmail };
};

const sendEnquiryEmail = async ({ name, email, subject, message }) => {
  const { safeSubject, textContent, htmlContent, trimmedEmail } = buildEmailBody({
    name,
    email,
    subject,
    message,
  });

  const payload = {
    sender: {
      email: config.brevo.senderEmail,
      name: config.brevo.senderName,
    },
    to: [{ email: config.clientEmail }],
    subject: safeSubject,
    textContent,
    htmlContent,
  };

  if (trimmedEmail) {
    payload.replyTo = { email: trimmedEmail };
  }

  return transactionalApi.sendTransacEmail(payload);
};

module.exports = {
  sendEnquiryEmail,
};

