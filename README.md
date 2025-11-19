## Brevo enquiry service

Minimal Node.js + Express server that accepts contact-form submissions and forwards them through Brevo's transactional email API. A static frontend is bundled for quick testing.

### Requirements

- Node.js 18+
- Brevo v3 API key with Transactional Email enabled

### Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `env.example` to `.env` and fill in your Brevo API key, sender, and recipient details
3. Run the server
   ```bash
   npm run dev
   ```
4. Open `http://localhost:4000` and submit the form

### Environment variables

| Key               | Description                                        |
| ----------------- | -------------------------------------------------- |
| `PORT`            | Server port (defaults to `4000`)                   |
| `BREVO_API_KEY`   | Brevo v3 API key (Transactional Email access)      |
| `BREVO_SENDER_EMAIL` | Verified Brevo sender email address             |
| `BREVO_SENDER_NAME` | Display name for the sender (defaults provided)  |
| `CLIENT_EMAIL`    | Recipient email that will receive enquiries        |
| `ALLOWED_ORIGINS` | Optional CSV list for CORS (e.g. `http://app.com`) |

### API

`POST /api/enquiry`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Question",
  "message": "Hello!"
}
```

Returns `{ "message": "Enquiry sent successfully" }` when the email is accepted by Brevo.

### Calling the API from a static site

1. Make sure the domain that hosts your static site is listed in `ALLOWED_ORIGINS`. Example: `ALLOWED_ORIGINS=https://www.example.com`.
2. From the frontend form submit handler, send a JSON `POST` request to the API. Plain JavaScript example:
   ```js
   async function submitEnquiry(event) {
     event.preventDefault();
     const payload = {
       name: event.target.name.value,
       email: event.target.email.value,
       subject: event.target.subject.value,
       message: event.target.message.value,
     };

     const response = await fetch('https://api.example.com/api/enquiry', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload),
     });

     if (!response.ok) {
       const data = await response.json();
       throw new Error(data.errors?.join(', ') || data.error);
     }

     alert('Message sent!');
   }
   ```
3. Handle success/errors in the UI (disable the submit button while the request is running, show validation errors, etc.).

### Notes

- The server automatically validates required fields and returns `400` with an array of errors when invalid.
- Messages are delivered via Brevo's transactional email endpoint; ensure your sender domain is verified within Brevo for best deliverability.
- Keep your API key private—only populate it in your untracked local `.env` file.
- For public-facing forms without login, rely on layered defenses instead of static tokens: restrict `ALLOWED_ORIGINS`, add bot protection such as reCAPTCHA/hCaptcha, apply backend rate limiting/throttling, and add honeypot fields or content moderation to reduce spam.

