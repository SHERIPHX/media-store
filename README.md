# Media Store — Website

Lightweight static site (Arabic + English). Content lives in `content/site.json` and is edited from the dashboard at `/admin/`. The Instagram section pulls your latest posts automatically.

## Files that matter
- `index.html`, `assets/site.css`, `assets/site.js` — the site
- `content/site.json` — all text, images, projects (EN + AR)
- `admin/` — dashboard (Decap CMS)
- `netlify/functions/` + `netlify/lib/` — Instagram auto-feed
- `package.json`, `netlify.toml`

## 1. Put the site files in GitHub
1. Extract this ZIP on your computer.
2. Open the `media-store-site` folder and upload **its contents** to the root of the existing `SHERIPHX/media-store` GitHub repository. `index.html` should appear at the repository root, not inside another nested folder.
3. Commit the files to the `main` branch.

## 2. Connect the existing Netlify site to GitHub
Use the existing Netlify project (`voluble-toffee-106cfd`) so the custom domain stays attached to the same site. In Netlify, open **Project configuration → Developer settings → Continuous deployment → Repository → Link repository**, then select `SHERIPHX/media-store` and branch `main`.
- Build command: leave empty
- Publish directory: `.`

The first Git-based deploy will publish the version in this repository to the existing site. Review the deployment before making further edits. Future CMS publishes commit changes to GitHub and trigger a Netlify deploy.

## 3. Set up the dashboard login
1. In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Homepage URL: `https://mediastoreagency.com`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. In Netlify, open the existing project’s **Project configuration → Access & security → OAuth → Authentication providers → Install provider → GitHub**. Enter the OAuth app's Client ID and Client Secret.
3. Open `https://mediastoreagency.com/admin/` and choose **Login with GitHub**.

Keep the Client Secret private; never put it in this repository or in `admin/config.yml`. Anyone who logs into this GitHub-backed CMS needs write access to the `SHERIPHX/media-store` repository.

## 4. Instagram auto-feed (optional)
Requirements: @mediastore.agency must be a **Business or Creator** account.
1. developers.facebook.com → My Apps → Create app → type "Business".
2. Add product **Instagram** → "API setup with Instagram login".
3. Add the @mediastore.agency account and click **Generate token**. Copy it.
4. Netlify → Site configuration → Environment variables → add `IG_TOKEN` = the token.
5. Redeploy. Open `https://YOUR-SITE.netlify.app/api/instagram` — you should see your posts as JSON.

After that:
- Posts and stats refresh automatically every 7 days.
- The token renews itself on each refresh (never expires as long as the site is live).
- Instagram video links expire, so they're re-signed every 2 days in the background.
- Optional: `IG_LIMIT` env variable = how many posts to show (default 12).

Until the token is added, the section falls back to the links in the dashboard ("Instagram (backup only)").

## SEO (Banha / بنها)
The site includes title and description targeting "marketing agency in Banha / شركة تسويق في بنها", local business schema, `robots.txt`, and `sitemap.xml`.
- Canonical URL, Open Graph URLs, sitemap, and robots sitemap now use `https://mediastoreagency.com`.
- Google Search Console → add your domain → submit `/sitemap.xml`.
- For local search, create or verify a Google Business Profile for Media Store in Banha and add the website link.

## Language
The site opens in Arabic for Arabic browsers, English otherwise. Visitors switch with the ع / EN button. Force with `?lang=ar` or `?lang=en`.
