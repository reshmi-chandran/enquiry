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

### Notes

- The server automatically validates required fields and returns `400` with an array of errors when invalid.
- Messages are delivered via Brevo's transactional email endpoint; ensure your sender domain is verified within Brevo for best deliverability.
- Keep your API key private—only populate it in your untracked local `.env` file.

