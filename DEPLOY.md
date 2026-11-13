# Deploying work.woashoes.com

Three parts: put the code on GitHub, host it with AWS Amplify, point `work.woashoes.com` at it. About 30 minutes of clicking, plus up to 24 hours for the SSL certificate.

**Before you start, one warning.** When you add a domain in Amplify, it pre-fills entries for the root domain (`woashoes.com`) and `www`. If you leave them, Amplify will try to take over the main store from Shopify. In Part 3 you delete those two and keep only `work`.

---

## Part 1 — GitHub

1. Go to https://github.com/new.
2. **Owner:** your account or your company organization. **Repository name:** `woa-work-site`. **Private** is fine; Amplify can read private repos.
3. Leave "Add a README" unchecked (the project already has one). Click **Create repository**.
4. Upload the files. Either:
   - **No command line:** on the new repo page click **uploading an existing file**, drag in everything from the unzipped `woa-work-site` folder (including the `assets` folder), and click **Commit changes**. Note: GitHub's web upload skips hidden files like `.gitignore`; that's fine.
   - **Command line** (the zip already contains a git repo with one commit):
     ```
     cd woa-work-site
     git remote add origin https://github.com/YOUR-ACCOUNT/woa-work-site.git
     git branch -M main
     git push -u origin main
     ```

## Part 2 — AWS Amplify

1. Sign in to the AWS console and open **AWS Amplify** (search "Amplify" in the top bar). Use the same AWS account that holds your `woashoes.com` Route 53 hosted zone.
2. Click **Create new app** (or **Deploy an app**).
3. Choose **GitHub** and click **Next**. Authorize AWS Amplify on GitHub. When GitHub asks which repositories, pick **Only select repositories** and choose `woa-work-site`.
4. Select the repository and the `main` branch. Click **Next**.
5. **App name:** `woa-work-site`. Amplify will find `amplify.yml` in the repo and use it (no build step). Click **Next**, then **Save and deploy**.
6. Wait for the deploy to finish (about a minute). Amplify gives you a temporary address like `https://main.d1abc2xyz.amplifyapp.com`. Open it on your phone and computer and check the page.

## Part 3 — work.woashoes.com

1. In the Amplify app, in the left menu choose **Hosting** → **Custom domains** → **Add domain**.
2. Type `woashoes.com`. It should appear in the list as a Route 53 domain; select it and click **Configure domain**.
3. **This is the important step.** Amplify shows subdomain rows. Remove the rows for the root (`woashoes.com`) and `www`, and also turn off any "redirect root to www" option. Then add one subdomain:
   - **Subdomain:** `work` → **Branch:** `main`
   The only address listed should be `https://work.woashoes.com`.
4. **Certificate:** choose **Amplify managed certificate**.
5. Click **Add domain**.
6. Because the domain is in Route 53 in the same AWS account, Amplify adds the DNS records for you: a validation record for the SSL certificate and a record for `work`. Status moves through *SSL creation* → *SSL configuration* → *Domain activation* → **Available**. AWS says this can take up to 24 hours; it's usually under an hour.
7. Open https://work.woashoes.com.

### Check that the main store is untouched

In **Route 53** → **Hosted zones** → `woashoes.com`, the Shopify records for `woashoes.com` and `www` should be unchanged. The only new records should be for `work.woashoes.com` and an ACM validation record (a long name starting with `_`).

### If the domain is in a different AWS account, or DNS isn't in Route 53

Choose **Manual configuration** in step 2. Amplify shows two records (a validation CNAME and a CNAME for `work`); add them wherever your DNS lives.

---

## After launch

- **Updates:** edit the files, push to `main` (or upload through GitHub's web page), and Amplify redeploys on its own.
- **Lead form:** right now the form opens a pre-filled email to `ron@tailorstep.co`. To capture leads without relying on the visitor's email app, set `FORM_ENDPOINT` at the top of `app.js` to a form service URL (for example Formspree, or a Klaviyo or HubSpot form endpoint) and push.
- **Analytics:** add your GA4 tag and Meta Pixel to `index.html` before `</head>` if you want this page tracked with the main site. Use the same GA4 property, and add `work.woashoes.com` to GA4's cross-domain list so visits that move between the two sites stay one session.
- **Cost:** Amplify Hosting bills on build minutes, storage and data served. A single static page is cheap to host; check the current numbers on the AWS Amplify pricing page.
