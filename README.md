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

**Required fields:**
- `name` (string) - Sender's name
- `email` (string) - Valid email address
- `message` (string) - Main message content

**Optional fields:**
- `subject` (string) - Email subject line
- Any additional fields - The API accepts any extra fields you send and includes them in the email

**Example with basic fields:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Question",
  "message": "Hello!"
}
```

**Example with additional fields (5+ inputs):**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I'm interested in your services",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "budget": "$5000",
  "preferredContact": "email",
  "projectType": "Web Development"
}
```

All additional fields (beyond `name`, `email`, `subject`, `message`) will be automatically included in the email under an "Additional Information" section.

Returns `{ "message": "Enquiry sent successfully" }` when the email is accepted by Brevo.

### Calling the API from a static site

1. Make sure the domain that hosts your static site is listed in `ALLOWED_ORIGINS`. Example: `ALLOWED_ORIGINS=https://www.example.com`.

2. From the frontend form submit handler, send a JSON `POST` request to the API. The API accepts any number of fields—just include all your form fields in the payload.

   **Plain JavaScript example (basic form):**
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

   **Plain JavaScript example (form with 5+ fields):**
   ```js
   async function submitEnquiry(event) {
     event.preventDefault();
     
     // Collect all form fields dynamically
     const formData = new FormData(event.target);
     const payload = Object.fromEntries(formData.entries());
     
     // Or manually build the payload:
     // const payload = {
     //   name: event.target.name.value,
     //   email: event.target.email.value,
     //   subject: event.target.subject.value,
     //   message: event.target.message.value,
     //   phone: event.target.phone.value,
     //   company: event.target.company.value,
     //   budget: event.target.budget.value,
     //   preferredContact: event.target.preferredContact.value,
     //   projectType: event.target.projectType.value,
     // };

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

   **React example:**
   ```jsx
   const handleSubmit = async (e) => {
     e.preventDefault();
     const formData = new FormData(e.target);
     const payload = Object.fromEntries(formData.entries());

     try {
       const response = await fetch('https://api.example.com/api/enquiry', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
       });

       if (!response.ok) {
         const data = await response.json();
         throw new Error(data.errors?.join(', ') || data.error);
       }

       alert('Message sent successfully!');
       e.target.reset();
     } catch (error) {
       alert('Error: ' + error.message);
     }
   };
   ```

3. Handle success/errors in the UI (disable the submit button while the request is running, show validation errors, etc.).

**Important:** The API only validates that `name`, `email`, and `message` are present and valid. All other fields you send will be automatically included in the email.

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

### Troubleshooting

**"Email service is not activated" error:**

If you suddenly get this error after it was working:

1. **Check daily limits**: Free Brevo accounts have daily sending limits (typically 300 emails/day). If you've reached the limit, wait 24 hours or upgrade your plan.

2. **Verify sender email**:
   - Go to https://app.brevo.com/settings/senders
   - Ensure your sender email (`BREVO_SENDER_EMAIL`) is verified/validated
   - If not verified, click "Verify" and complete the verification process

3. **Reactivate account**:
   - Sometimes free accounts need reactivation
   - Contact Brevo support at contact@brevo.com
   - Or check your Brevo dashboard for any pending actions

4. **Check account status**:
   ```bash
   node check-brevo-status.js
   ```

### Notes

- The server automatically validates required fields and returns `400` with an array of errors when invalid.
- Messages are delivered via Brevo's transactional email endpoint; ensure your sender domain is verified within Brevo for best deliverability.
- Keep your API key private—only populate it in your untracked local `.env` file or Vercel dashboard.
- For public-facing forms without login, rely on layered defenses instead of static tokens: restrict `ALLOWED_ORIGINS`, add bot protection such as reCAPTCHA/hCaptcha, apply backend rate limiting/throttling, and add honeypot fields or content moderation to reduce spam.
- Free Brevo accounts have daily sending limits. Monitor your usage in the Brevo dashboard.

