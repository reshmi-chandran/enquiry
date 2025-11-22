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

const formatFieldLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const buildEmailBody = (formData) => {
  const { name = '', email = '', subject = '', message = '', ...additionalFields } = formData;
  
  const trimmedName = (name || '').trim();
  const trimmedEmail = (email || '').trim();
  const trimmedSubject = (subject || '').trim();
  const trimmedMessage = (message || '').trim();

  const safeName = trimmedName || 'Website enquiry';
  const safeSubject = trimmedSubject
    ? `New enquiry: ${trimmedSubject}`
    : 'New enquiry received';

  // Collect all fields for display
  const fields = [];
  
  // Required fields
  if (trimmedName) fields.push({ label: 'Name', value: trimmedName });
  if (trimmedEmail) fields.push({ label: 'Email', value: trimmedEmail });
  if (trimmedSubject) fields.push({ label: 'Subject', value: trimmedSubject });

  // Additional fields
  const reservedFields = ['name', 'email', 'subject', 'message'];
  Object.entries(additionalFields).forEach(([key, value]) => {
    if (!reservedFields.includes(key.toLowerCase()) && value != null && String(value).trim()) {
      fields.push({ label: formatFieldLabel(key), value: String(value).trim() });
    }
  });

  // Build plain text version
  const textLines = [
    `You received a new enquiry from ${safeName}.`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    ...fields.map(f => `${f.label}: ${f.value}`),
    ...(trimmedMessage ? ['', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '', 'Message:', '', trimmedMessage] : []),
  ];

  const textContent = textLines.join('\n');

  // Build professional HTML version
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Enquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                📧 New Enquiry Received
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                You have received a new ${trimmedSubject ? 'booking request' : 'contact form'} submission
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px;">
                Hello,
              </p>
              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px;">
                You have received a new enquiry from <strong style="color: #667eea;">${escapeHtml(safeName)}</strong>.
              </p>

              <!-- Details Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #f8f9fa; border-radius: 6px; overflow: hidden;">
                <tr>
                  <td style="padding: 25px;">
                    ${fields.map(field => `
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 15px;">
                        <tr>
                          <td style="padding: 0; width: 140px; vertical-align: top;">
                            <p style="margin: 0; color: #667eea; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              ${escapeHtml(field.label)}
                            </p>
                          </td>
                          <td style="padding: 0; vertical-align: top;">
                            <p style="margin: 0; color: #333333; font-size: 15px; word-break: break-word;">
                              ${escapeHtml(field.value)}
                            </p>
                          </td>
                        </tr>
                      </table>
                      ${fields.indexOf(field) < fields.length - 1 ? '<div style="height: 1px; background-color: #e0e0e0; margin: 15px 0;"></div>' : ''}
                    `).join('')}
                  </td>
                </tr>
              </table>

              ${trimmedMessage ? `
              <!-- Message Section -->
              <div style="margin: 30px 0; padding: 25px; background-color: #fff9e6; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0 0 15px 0; color: #667eea; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Message
                </p>
                <p style="margin: 0; color: #333333; font-size: 15px; white-space: pre-wrap; word-break: break-word;">
                  ${escapeHtml(trimmedMessage).replace(/\n/g, '<br>')}
                </p>
              </div>
              ` : ''}

              <!-- Action Button -->
              ${trimmedEmail ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <a href="mailto:${escapeHtml(trimmedEmail)}?subject=Re: ${escapeHtml(safeSubject)}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Reply to ${escapeHtml(trimmedName)}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 13px;">
                This is an automated email from your enquiry form.
              </p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                Sent at ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { safeSubject, textContent, htmlContent, trimmedEmail };
};

const sendEnquiryEmail = async (formData) => {
  const { safeSubject, textContent, htmlContent, trimmedEmail } = buildEmailBody(formData);

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

