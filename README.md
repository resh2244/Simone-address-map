# Simone & Jovita Maps 🚀

> A production-ready address registration and verification suite powered by **React, Vite, Google Maps JavaScript API, Places Autocomplete, Google Address Validation API, Cloud Firestore, and Cloudflare**.

**Type:** Location-based Address Management App  
**Status:** Active Production  
**Map Provider:** Google Maps  
**Tags:** Real Estate, Address Validation, Cadastral Review

---

## ✨ Features

- ⚡ **Lightning-Fast Performance** – Built with Vite and optimized for production
- 🗺️ **Interactive Google Maps** – Drag-and-drop marker placement with satellite/hybrid imagery
- 🔍 **Smart Address Validation** – Google Places Autocomplete & Address Validation API integration
- 📸 **Photo Verification Pipeline** – Multi-photo upload for cadastral and municipal reviews
- 🎫 **Dynamic Certificate Export** – QR codes, PDF dossiers with gold borders, and instant sharing
- 📊 **Admin Portal** – Bulk CSV upload, filtering, and data inspection dashboard
- 🔐 **Secure Authentication** – Cloud Firestore with security rules
- 📱 **Mobile-Friendly** – Fully responsive design with touch optimization
- ☁️ **Multi-Cloud Architecture** – Dual persistence (Firestore + Cloudflare D1 / SQLite)

---

## 🎥 Demo & Screenshots

[📍 Live Demo](YOUR-LIVE-DEMO-URL) – See the interactive address validator in action

### Key Interfaces
- **Main Address Validator** – Interactive map with search, photo upload, and validation
- **Admin Portal** – `/admin.html` for data inspection and CSV management
- **Luxury Splash Screen** – Gold and blue themed onboarding experience

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **Vite** | Lightning-fast build tool & dev server |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Google Maps API** | Interactive mapping & geocoding |
| **Cloudflare Workers** | Serverless backend (`simone-jovita-api`) |
| **Cloudflare D1** | Edge SQL database |
| **Cloud Firestore** | Real-time cloud persistence |
| **PDF Export** | Dynamic certificate generation |
| **Gemini AI** | Address intelligence & analysis |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)
- Google Maps API keys (Places, Validation, Maps JavaScript)
- Firebase/Firestore project

### Installation

```bash
# Clone the repository
git clone https://github.com/resh2244/Simone-address-map.git
cd Simone-address-map

# Install dependencies
npm install

# Start development server
npm run dev
# Opens on http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output in ./dist
```

---

## 💻 Local Development Environment

When running locally, the following endpoints are available:

| Service | URL | Description |
|---|---|---|
| **Main App** | `http://localhost:3000` | Interactive address validator & map interface |
| **Admin Portal** | `http://localhost:3000/admin.html` | Data management & CSV operations |
| **Health Check** | `http://localhost:3000/api/health` | API liveness verification |
| **Address Validation** | `http://localhost:3000/api/validate` | Google Address Validation proxy |
| **Bulk Import** | `http://localhost:3000/api/submissions/bulk` | Batch CSV address import |

Start the server with:
```bash
npm run dev
```

---

## 🌟 Core Capabilities

### 1. **Address Discovery & Validation**
- Google Places Autocomplete search with real-time suggestions
- Component-level address parsing (street, city, postal code, country)
- USPS CASS standardization and deliverability checks
- Sub-premise granularity classification

### 2. **Interactive Mapping**
- Draggable gold pinpoint marker for entrance refinement
- Satellite/hybrid map imagery layers
- Full-screen map toggle
- Location coordinate capture (lat/lng)

### 3. **Photo Verification Pipeline**
- Upload up to 4 high-resolution photos (building, entrance, street number)
- Photo metadata extraction and validation
- Organized storage in cloud & edge databases
- Cadastral and municipal compliance

### 4. **Certification & Sharing**
- **Dynamic QR Code** generation linking to Google Maps location
- **PDF Certificate Export** with:
  - Gold borders and professional formatting
  - Verification metrics and validation status
  - Address components and photos
- **Multi-Platform Sharing**: WhatsApp, Telegram, Facebook, Email

### 5. **Admin Dashboard**
- Filter submissions by status, region, granularity, and date
- Standalone HTML admin page (`/admin.html`) with pure Tailwind styling
- Full CSV export of validated addresses
- Bulk address uploader with automated validation

### 6. **Dual Persistence Architecture**
- **Cloud Firestore**: Real-time syncing, security rules, authentication integration
- **Cloudflare D1**: SQL database on the edge, high-availability persistence
- **Local SQLite**: Development fallback and testing

---

## ☁️ Cloudflare Deployment

### Configuration Details
- **Worker Name:** `simone-jovita-api`
- **D1 Database:** `simone-jovita-db` (ID: `f17132c9-0fe4-48dd-acab-8388d9d03542`)
- **D1 Binding:** `DB`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Deploy Steps

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Apply Database Schema**
   ```bash
   wrangler d1 execute simone-jovita-db --file=./migrations/0001_initial.sql
   ```

4. **Deploy to Cloudflare Pages**
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=simone-jovita-maps
   ```

   Or as a full Worker site:
   ```bash
   wrangler deploy
   ```

---

## 🐙 GitHub & CI/CD

### Push to GitHub

```bash
# Add remote (if not already set)
git remote add origin https://github.com/resh2244/Simone-address-map.git

# Stage and commit
git add .
git commit -m "feat: complete production Google Maps Address Registration app"

# Push to main branch
git push -u origin main
```

### Automated Testing
The repository includes `.github/workflows/deploy.yml` for automatic builds and tests on every push.

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Cloudflare Configuration
CLOUDFLARE_D1_DATABASE_ID=f17132c9-0fe4-48dd-acab-8388d9d03542

# Google Maps API Keys
GOOGLE_MAPS_API_KEY=your_server_side_api_key
VITE_GOOGLE_MAPS_API_KEY=your_frontend_api_key

# API Configuration
VITE_API_BASE_URL=/api

# AI & Intelligence
GEMINI_API_KEY=your_gemini_api_key

# Admin Security
ADMIN_TOKEN=adm-secret-superkey-8899

# Server Configuration
PORT=3000
```

**Security Note:** Never commit `.env.local` to version control. Use GitHub Secrets for CI/CD deployments.

---

## 📁 Project Structure

```
Simone-address-map/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page routes
│   ├── api/              # API endpoints
│   ├── utils/            # Utility functions
│   └── styles/           # Tailwind & CSS
├── public/               # Static assets
├── migrations/           # D1 database schemas
├── .github/workflows/    # CI/CD pipelines
└── wrangler.toml        # Cloudflare Worker config
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 📞 Support & Contact

For issues, feature requests, or questions:
- 📧 Email: support@example.com
- 🐛 GitHub Issues: [Report a Bug](https://github.com/resh2244/Simone-address-map/issues)
- 💬 Discussions: [Ask a Question](https://github.com/resh2244/Simone-address-map/discussions)

---

**Made with ❤️ for precise address verification and cadastral management.**
