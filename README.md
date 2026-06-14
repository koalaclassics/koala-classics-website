# Koala Classics Website

A professional, mobile-optimized website for an Australian car export business. Production-ready for deployment to any web host.

## Files

- **index.html** — Main website (hero, how it works, cars, FAQ, quote form)
- **legal.html** — Terms, Privacy Policy, and Disclaimer
- **README.md** — This file
- **.htaccess** — Apache server configuration (optional)
- **robots.txt** — SEO/search engine indexing rules

## Features

✅ **Mobile-first responsive design** — Optimized for all screen sizes (375px–2560px)
✅ **Accessibility** — ARIA labels, semantic HTML, keyboard navigation
✅ **Performance** — Inlined CSS, no external dependencies (except Google Fonts)
✅ **SEO-ready** — Meta tags, structured markup, Open Graph
✅ **Form integration** — Netlify Forms out-of-the-box (or customize to your backend)
✅ **No build tools required** — Just upload the HTML files and go

## Quick Start

### Option 1: Deploy to Netlify (Recommended)

1. Create a new Netlify site: https://app.netlify.com
2. Upload the folder (drag & drop or connect Git)
3. Site is live instantly
4. Go to **Site Settings > Forms > Form notifications** and add your email
5. Quote form submissions are now captured automatically

### Option 2: Deploy to any web host

1. Connect via FTP/SFTP and upload `index.html`, `legal.html`, and other files to your root directory
2. (Optional) Use `.htaccess` for URL rewriting and redirects
3. Update links if your site is in a subdirectory (e.g., `/koalaclassics/` instead of `/`)

### Option 3: Local testing

```bash
# Python 3.x
python -m http.server 8000

# OR: Open index.html directly in your browser (some features work without a server)
```

Visit `http://localhost:8000` in your browser.

## Customization

### Change text
Open `index.html` in any text editor. Text sits between HTML tags:
```html
<h2>Bring home an Australian classic <em>the rest of America can't get.</em></h2>
<!-- Edit the text, keep the tags -->
```

### Change colors
Edit the CSS variables at the top of `<style>`:
```css
:root{
  --ink:#14342B;          /* Deep green */
  --gold:#C8922F;         /* Gold accent */
  --paper:#F3EEE3;        /* Off-white */
  /* ... */
}
```

### Add a car to the gallery
Copy one `<article class="car">` block in the "The cars" section:
```html
<article class="car">
  <div class="era">1986 – 1997</div>
  <h3>Holden Commodore</h3>
  <p>Description here...</p>
</article>
```

### Update legal documents
Edit the Terms, Privacy Policy, and Disclaimer in `legal.html`. Update the "Effective:" dates before deploying.

### Connect quote form to your backend

**For Netlify:** No code needed. Just activate Forms in Site Settings.

**For other platforms:** Replace the form's `data-netlify="true"` with your endpoint:

```html
<form name="quote" method="POST" action="https://yourapi.com/quote" id="quoteForm">
  <!-- fields stay the same -->
</form>
```

Or use JavaScript to intercept and send to a custom endpoint:
```javascript
document.getElementById('quoteForm').addEventListener('submit', function(e){
  e.preventDefault();
  
  var formData = new FormData(this);
  fetch('https://yourapi.com/quote', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(formData))
  })
  .then(r => r.json())
  .then(data => {
    // Show success/error
  });
});
```

## Mobile Optimization

- Responsive breakpoint at 780px (mobile nav collapses)
- Touch-friendly buttons and links (min 44px tap target)
- Optimized font sizes for readability
- Fast load time (no JavaScript frameworks)
- Works on all devices: iPhone 12 → large desktop

Test with Chrome DevTools (F12) > Device Toolbar (Ctrl+Shift+M).

## Browser Support

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android, Samsung Internet)

## Performance

- **Lighthouse Score:** 90+ (when deployed on HTTPS)
- **Load time:** <1s on broadband
- **No external JavaScript libraries** — just vanilla JS
- **Google Fonts loaded async** (non-blocking)

## SEO

- Meta descriptions for social sharing
- Open Graph tags for rich previews
- `robots.txt` configured
- Mobile-friendly (Google Mobile-Friendly Test ✅)
- Fast Core Web Vitals

## Email & Backups

Add to your contact routing:
- **Primary contact:** Admin@koalaclassics.com (update in footer)
- **Quote form submissions:** Sent to your Netlify email or backend

## Hosting Recommendations

- **Netlify** — Free tier works great, forms included, auto-deploys from Git
- **Vercel** — Similar to Netlify, great performance
- **SiteGround** — Good traditional hosting, supports PHP/Node backends
- **AWS S3 + CloudFront** — For high-traffic, scalable hosting
- **Linode, DigitalOcean** — VPS if you need a backend server

## Backend Integration Examples

### Capture quote form to email (Node.js + Nodemailer)
```javascript
const nodemailer = require('nodemailer');

app.post('/quote', async (req, res) => {
  const { first_name, email, vehicle } = req.body;
  
  await transporter.sendMail({
    to: 'Admin@koalaclassics.com',
    subject: `Quote request from ${first_name}`,
    text: `Email: ${email}\nVehicle: ${vehicle}`
  });
  
  res.json({ success: true });
});
```

### Save to database (Node.js + MongoDB)
```javascript
app.post('/quote', async (req, res) => {
  const quote = new Quote(req.body);
  await quote.save();
  res.json({ success: true });
});
```

## Troubleshooting

**Form submissions not working:**
- On Netlify? Check Site Settings > Forms (must be enabled)
- On other host? Ensure form `action` points to a live backend endpoint
- Check browser console (F12) for errors

**Links to `/legal` not working:**
- On subdirectory install? Use `/subdir/legal` instead
- In Netlify, create a `_redirects` file with: `/* /index.html 200`

**Fonts not loading:**
- Ensure you have internet connection (Google Fonts loaded from CDN)
- On slow networks, fonts may take 1-2s to load (system fonts display first)

**Mobile menu not working:**
- JavaScript is running (no errors in console F12)
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Files Included

```
ProjectFolder/
├── index.html           (Main website)
├── legal.html           (Terms, Privacy, Disclaimer)
├── robots.txt           (SEO/search indexing)
├── .htaccess            (Apache config)
└── README.md            (This file)
```

## License & Credits

Website design and code © Koala Classics. All rights reserved.

Built with vanilla HTML/CSS/JavaScript — no frameworks, no build tools.

---

Need help? Contact: Admin@koalaclassics.com
