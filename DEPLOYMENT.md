# Simone & Jovita Maps - GitHub Pages Deployment

This frontend is designed for GitHub Pages static hosting.

## Important
The app includes backend API routes in `server.ts` and some features require a live server. Those features will not work on GitHub Pages alone. This deployment only publishes the static frontend.

## Required secrets
Add these in GitHub repository settings -> Secrets and variables -> Actions:

- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_WOOSMAP_API_KEY` (if you use Woosmap embedding/features)

## Pages setup
1. Open the repository in GitHub.
2. Go to Settings -> Pages.
3. Set Source to `GitHub Actions`.
4. Push to the `main` branch or run the workflow manually.

## Public URL
After deployment, GitHub Pages will generate a URL like:

https://resh2244.github.io/Simone-address-map/

## Notes
- `VITE_API_BASE_URL` is intentionally left empty for static hosting.
- This static build is best for public map display and frontend-only use.
- If you want the validation form, admin APIs, or AI/backend features active on the public URL, you must deploy the backend separately (for example Render, Cloudflare Workers, or another server host).
