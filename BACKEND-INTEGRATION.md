# Backend Integration Guide

This guide covers connecting the quote form to various backend services and platforms.

## Quick Links

- [Netlify Forms (Recommended)](#netlify-forms-recommended)
- [Custom Node.js Backend](#custom-nodejs-backend)
- [Firebase Cloud Functions](#firebase-cloud-functions)
- [AWS Lambda](#aws-lambda)
- [Email Service (SendGrid, Mailgun, AWS SES)](#email-service)
- [Database Integration (MongoDB, PostgreSQL)](#database-integration)

---

## Netlify Forms (Recommended)

**Simplest option — zero backend required.**

### Setup

1. Deploy your site to Netlify (drag & drop folder)
2. Go to **Site Settings > Forms > Form notifications**
3. Add your email address
4. Quote submissions are automatically captured and emailed

### Form already configured for Netlify

```html
<form name="quote" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <!-- Netlify intercepts this automatically -->
</form>
```

### View submissions

- Dashboard: **Forms > quote > Submissions tab**
- Email: Automatic notifications to your email
- Webhook: Set up Slack/Discord notifications in **Site Settings > Forms > Notifications**

### Cost

- Free tier: 100 submissions/month
- Pro: Unlimited submissions

---

## Custom Node.js Backend

**For full control over form handling.**

### 1. Server setup (Express.js)

```javascript
// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configure email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use 16-char app password, not your real password
  }
});

// Quote form handler
app.post('/api/quote', async (req, res) => {
  const { first_name, last_name, email, phone, location, budget, vehicle, message } = req.body;

  // Validate required fields
  if (!first_name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send email to admin
    await transporter.sendMail({
      to: 'Admin@koalaclassics.com',
      replyTo: email,
      subject: `Quote request from ${first_name} ${last_name}`,
      html: `
        <h2>New quote request</h2>
        <p><strong>Name:</strong> ${first_name} ${last_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Location:</strong> ${location || 'N/A'}</p>
        <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
        <p><strong>Vehicle:</strong> ${vehicle || 'N/A'}</p>
        <p><strong>Message:</strong> ${message || 'N/A'}</p>
      `
    });

    // Optional: Send confirmation email to client
    await transporter.sendMail({
      to: email,
      subject: 'We received your quote request — Koala Classics',
      html: `
        <h2>Thank you!</h2>
        <p>Hi ${first_name},</p>
        <p>We've received your quote request. We'll review it and get back to you within 24 hours.</p>
        <p>In the meantime, feel free to explore our site or call us for urgent inquiries.</p>
        <p>Best regards,<br />Koala Classics</p>
      `
    });

    res.json({ success: true, message: 'Quote submitted successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to submit quote. Please try again.' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 2. Update form action

In `index.html`:

```html
<form name="quote" method="POST" action="https://yourserver.com/api/quote" id="quoteForm">
  <!-- form fields -->
</form>
```

Or use JavaScript to intercept:

```javascript
document.getElementById('quoteForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch('https://yourserver.com/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('formStatus').textContent = 'Thank you! We\'ll be in touch soon.';
      document.getElementById('formStatus').className = 'form-status success';
      this.reset();
    } else {
      document.getElementById('formStatus').textContent = result.error || 'Failed to submit. Try again.';
      document.getElementById('formStatus').className = 'form-status error';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('formStatus').textContent = 'Network error. Please try again.';
    document.getElementById('formStatus').className = 'form-status error';
  }
});
```

### 3. Deployment

**Option A: Heroku (free tier deprecated, use alternatives)**

**Option B: Railway (recommended, free tier)**
```bash
npm install -g railway
railway login
railway init
railway up
```

**Option C: DigitalOcean/Linode/AWS (paid, $5-20/month)**

---

## Firebase Cloud Functions

**Serverless, scales automatically, free tier available.**

### 1. Setup

```bash
npm install -g firebase-tools
firebase init functions
cd functions
npm install nodemailer cors
```

### 2. Function code

```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password
  }
});

exports.submitQuote = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(400).send('POST only');
    }

    const { first_name, last_name, email, vehicle } = req.body;

    try {
      await transporter.sendMail({
        to: 'Admin@koalaclassics.com',
        replyTo: email,
        subject: `Quote: ${vehicle} from ${first_name}`,
        text: `${first_name} ${last_name} is interested in ${vehicle}`
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
```

### 3. Deploy

```bash
firebase deploy --only functions
```

Form action: `https://us-central1-YOUR_PROJECT.cloudfunctions.net/submitQuote`

---

## AWS Lambda

**Serverless, integrates with other AWS services (SES email, RDS database).**

### 1. Create Lambda function (Node.js 18.x)

```javascript
// lambda.js
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { first_name, last_name, email, vehicle } = body;

  const params = {
    Source: 'noreply@koalaclassics.com',
    Destination: { ToAddresses: ['Admin@koalaclassics.com'] },
    Message: {
      Subject: { Data: `Quote: ${vehicle}` },
      Body: { Text: { Data: `From: ${first_name} ${last_name}\nEmail: ${email}` } }
    }
  };

  try {
    await ses.sendEmail(params).promise();
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
```

### 2. Deploy via AWS Console or CLI

Then create an API Gateway endpoint and use its URL as form action.

---

## Email Service

### SendGrid

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'Admin@koalaclassics.com',
  from: 'noreply@koalaclassics.com',
  subject: `Quote from ${first_name}`,
  text: `Vehicle: ${vehicle}`,
  replyTo: email
});
```

### Mailgun

```javascript
const mailgun = require('mailgun-js');
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: 'koalaclassics.com' });

await mg.messages().send({
  from: 'Koala Classics <noreply@koalaclassics.com>',
  to: 'Admin@koalaclassics.com',
  subject: `Quote from ${first_name}`,
  text: `Vehicle: ${vehicle}`
});
```

### AWS SES

```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

await ses.sendEmail({
  Source: 'noreply@koalaclassics.com',
  Destination: { ToAddresses: ['Admin@koalaclassics.com'] },
  Message: {
    Subject: { Data: `Quote from ${first_name}` },
    Body: { Text: { Data: `Vehicle: ${vehicle}` } }
  }
}).promise();
```

---

## Database Integration

### MongoDB (Mongoose)

```javascript
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  location: String,
  budget: String,
  vehicle: String,
  message: String,
  submittedAt: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);

app.post('/api/quote', async (req, res) => {
  try {
    const quote = new Quote(req.body);
    await quote.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### PostgreSQL (Node-postgres)

```javascript
const { Pool } = require('pg');
const pool = new Pool();

app.post('/api/quote', async (req, res) => {
  const { first_name, last_name, email, phone, location, budget, vehicle, message } = req.body;

  try {
    await pool.query(
      'INSERT INTO quotes (first_name, last_name, email, phone, location, budget, vehicle, message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [first_name, last_name, email, phone, location, budget, vehicle, message]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Webhooks & Integrations

### Send quote to Slack

```javascript
const axios = require('axios');

await axios.post(process.env.SLACK_WEBHOOK_URL, {
  text: `New quote from ${first_name} ${last_name}`,
  blocks: [
    { type: 'section', text: { type: 'mrkdwn', text: `*${vehicle}*\n${email}` } }
  ]
});
```

### Send to Zapier/Make.com

Set form action to a Zap URL, then automate: email → Slack → Google Sheet → CRM

---

## Security Checklist

✅ **HTTPS only** — Never send form data over HTTP
✅ **Validate inputs** — Check required fields, sanitize strings
✅ **Rate limiting** — Prevent spam (e.g., max 5 submissions per IP per hour)
✅ **CORS** — Restrict requests to your domain only
✅ **Environment variables** — Never hardcode API keys (use `.env`)
✅ **CSRF tokens** — For form-based submissions (optional for JSON APIs)

---

## Testing Your Backend

### cURL
```bash
curl -X POST https://yourserver.com/api/quote \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","email":"john@example.com","vehicle":"VL Commodore"}'
```

### Postman
1. Create POST request to your endpoint
2. Add JSON body with test data
3. Click Send

### Browser Console
```javascript
fetch('https://yourserver.com/api/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'John',
    email: 'john@example.com',
    vehicle: 'VL Commodore'
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## Need Help?

- **Netlify Forms:** https://docs.netlify.com/forms/setup/
- **Node.js:** https://nodejs.org/
- **Firebase:** https://firebase.google.com/
- **AWS Lambda:** https://aws.amazon.com/lambda/

Good luck!
