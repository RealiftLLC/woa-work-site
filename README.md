# WOA for Work — work.woashoes.com

B2B landing page for Walking On Air's employer programs. A static site with no build step: plain HTML, CSS and JavaScript.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole page |
| `styles.css` | Styles, including the phone and tablet layouts (`@media` blocks at the bottom) |
| `app.js` | Phone menu, break-even calculator, lead form |
| `assets/` | Images, the worn-foam vs. WOA video, the WOA Font (Solid), favicon |
| `amplify.yml` | Tells AWS Amplify there is nothing to build: serve the files as they are |
| `DEPLOY.md` | Step-by-step: GitHub, AWS Amplify, and the `work.woashoes.com` subdomain |

## Preview on your computer

Double-clicking `index.html` works, except the WOA Font, which browsers block on `file://`. For a true preview, run this in the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Editing

- **Text:** edit `index.html` directly. Each section is a `<section id="...">` (`top`, `cost`, `retention`, `productivity`, `break-even`, `shoe`, `doctor`, `partner`, `industries`, `book`, `faqs`).
- **Images:** replace a file in `assets/` with one of the same name, or change the `src` in `index.html`. Keep photos around 1400 px wide, as JPEG.
- **Calculator price or share:** `PAIR_PRICE` and `EMPLOYER_SHARE` at the top of `app.js`.
- **Lead form destination:** `FORM_ENDPOINT` and `LEAD_EMAIL` at the top of `app.js`. With `FORM_ENDPOINT` empty, the form opens a pre-filled email to `LEAD_EMAIL`.

Push to `main` on GitHub and Amplify redeploys automatically within a minute or two.
