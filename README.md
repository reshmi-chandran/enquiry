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

### Deploying to Vercel

1. **Push your code to GitHub** (make sure `.env` is in `.gitignore` and never committed).

2. **Import the project in Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Node.js settings

3. **Configure Environment Variables in Vercel Dashboard:**
   - In your project settings, go to **Settings → Environment Variables**
   - Add each variable from `env.example`:
     - `BREVO_API_KEY` = your Brevo v3 API key
     - `BREVO_SENDER_EMAIL` = your verified sender email
     - `BREVO_SENDER_NAME` = sender display name
     - `CLIENT_EMAIL` = recipient email address
     - `ALLOWED_ORIGINS` = your static site domain (e.g., `https://www.example.com`)
     - `PORT` = leave empty (Vercel sets this automatically)
   - **Important:** Set these for **Production**, **Preview**, and **Development** environments as needed
   - Click "Save" after adding each variable

4. **Deploy:**
   - Vercel will automatically deploy on every push to your main branch
   - Your API will be available at `https://your-project.vercel.app/api/enquiry`

5. **Update your static site's API URL:**
   - Change the fetch URL in your frontend to point to your Vercel deployment
   - Example: `https://your-project.vercel.app/api/enquiry`

**Benefits of Vercel environment variables:**
- ✅ Secrets never touch GitHub
- ✅ Easy to update without code changes
- ✅ Separate values for production/preview/development
- ✅ Encrypted and secure

### Notes

- The server automatically validates required fields and returns `400` with an array of errors when invalid.
- Messages are delivered via Brevo's transactional email endpoint; ensure your sender domain is verified within Brevo for best deliverability.
- Keep your API key private—only populate it in your untracked local `.env` file or Vercel dashboard.
- For public-facing forms without login, rely on layered defenses instead of static tokens: restrict `ALLOWED_ORIGINS`, add bot protection such as reCAPTCHA/hCaptcha, apply backend rate limiting/throttling, and add honeypot fields or content moderation to reduce spam.

