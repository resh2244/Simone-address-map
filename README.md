# Simone & Jovita Maps • Google Maps Address Registration

A production-ready address registration and verification suite powered by **React, Vite, Google Maps JavaScript API, Places Autocomplete, Google Address Validation API, Cloud Firestore, Cloudflare Workers & Cloudflare D1**.

---

## 💻 Local Host Website & Running Environments

When developing or running locally on your workstation:

| Website / Service | Address | Description |
|---|---|---|
| **Main App (Local Host)** | `http://localhost:3000` | Full interactive address validator, satellite mapping, photo uploader & PDF export |
| **Standalone Admin Website** | `http://localhost:3000/admin.html` | Pure HTML + Tailwind administrative portal for direct SQLite inspections |
| **Health API** | `http://localhost:3000/api/health` | API liveness check endpoint |
| **Google Address Validation** | `http://localhost:3000/api/validate` | Google Address Validation proxy endpoint |
| **Bulk CSV Import API** | `http://localhost:3000/api/submissions/bulk` | Bulk address import endpoint into SQLite & Cloudflare D1 |

To start the local host server:
```bash
npm run dev
# Starts server on http://localhost:3000
```

---

## 🌟 Key Capabilities

1. **Local Host Integration & Quick Switcher**:
   - Live navigation button `Local Host :3000` with pulse indicator in the header.
   - Interactive modal providing direct links, copyable URLs, and CLI `curl` health commands.
2. **Luxury Splash Screen**: High-aesthetic onboarding featuring gold, blue, and white themes with animated iconography.
3. **Interactive Maps Engine**:
   - Google Places Autocomplete search.
   - Draggable custom gold pinpoint marker on satellite/hybrid imagery for sub-meter entrance refinement.
4. **Google Address Validation API**:
   - Deliverability checks, USPS CASS standardization, sub-premise granularity classification, and component-level audits.
5. **Photo Upload Pipeline**:
   - Upload up to 4 high-resolution building exterior, entrance, and street-number photos required for cadastral and municipal reviews.
6. **Dual Persistence Architecture**:
   - **Cloud Firestore**: Real-time cloud documents with authentication security rules.
   - **Local / Edge Database**: Dual storage in SQLite and Cloudflare D1.
7. **Certified Dossier Export & Sharing**:
   - Instant dynamic **QR Code generation** pointing to Google Maps.
   - Formal **PDF Certificate / Dossier** generator formatted with gold borders and verification metrics.
   - One-touch multi-platform sharing (**WhatsApp, Telegram, Facebook, Email**).
8. **Admin Portal & Bulk CSV Uploader**:
   - Filter by validation granularity, deliverability status, region ISO codes, and date sorting.
   - Standalone `/admin.html` page, full CSV dossier export, and bulk CSV address uploader with automated validation.

---

## 🚀 Cloudflare Deployment (Workers & Pages)

### 1. Cloudflare Configuration Details
- **Worker Name:** `simone-jovita-api`
- **D1 Database Name:** `simone-jovita-db`
- **D1 Database ID:** `f17132c9-0fe4-48dd-acab-8388d9d03542`
- **D1 Binding Name:** `DB`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 2. Steps to Deploy on Cloudflare

1. **Install Wrangler CLI (if not already installed):**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Apply the Schema Migration to your D1 Database:**
   ```bash
   wrangler d1 execute simone-jovita-db --file=./migrations/0001_initial.sql
   ```

4. **Deploy Cloudflare Pages / Worker:**
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=simone-jovita-maps
   ```
   Or deploy as a full Worker site:
   ```bash
   wrangler deploy
   ```

---

## 🐙 GitHub Push & CI/CD Setup

To push this codebase to your own GitHub repository:

1. **Initialize Git & Add Remote:**
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   ```

2. **Stage and Commit:**
   ```bash
   git add .
   git commit -m "feat: complete production Google Maps Address Registration app with Cloudflare D1 and Firestore"
   ```

3. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

4. **GitHub Actions Workflow:**
   The repository includes `.github/workflows/deploy.yml` which automatically builds and tests on every push.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `CLOUDFLARE_D1_DATABASE_ID` | Cloudflare D1 database ID (`f17132c9-0fe4-48dd-acab-8388d9d03542`) |
| `GOOGLE_MAPS_API_KEY` | Server-side Google Maps Platform API key (Validation & Places) |
| `VITE_GOOGLE_MAPS_API_KEY` | Frontend Google Maps Platform API key |
| `VITE_API_BASE_URL` | Frontend API base URL (empty for relative `/api/*`) |
| `GEMINI_API_KEY` | Gemini AI API key for address intelligence |
| `ADMIN_TOKEN` | Token for admin portal access (default: `adm-secret-superkey-8899`) |
| `PORT` | Local dev / production port (default: `3000`) |
