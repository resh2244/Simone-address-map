# Ace’s Address Changer 🏠📍🚀

> A polished location workspace for publishing, editing, sharing and attaching house structures to map records.

**Status:** MVP built · **Frontend:** React + Vite + TypeScript · **Map:** Google Maps (optional API key) · **Storage:** local browser persistence in MVP

## ✨ Built now

- 📍 Create, edit, publish and unpublish location records
- 🗺️ Google Maps integration when `VITE_GOOGLE_MAPS_API_KEY` is configured
- 🔎 Search saved locations
- 🧭 Browser geolocation / “Locate me” control
- 🏠 House structures with bedrooms, bathrooms, floors and property type
- 🧊 Public `.glb` URL support through `<model-viewer>` for 3D previews
- 🔗 Shareable location links
- 📤 JSON export and import for moving data between devices during the MVP stage
- 🔄 Cross-tab synchronization through browser storage events
- 👁️ Public/private visibility and draft/published status
- 📱 Responsive mobile, tablet and desktop UI
- ♿ Clear controls, keyboard-friendly forms and readable contrast

> **Important:** “Change address” means changing a location record owned by this app. It does **not** alter an official postal, municipal, or Google Maps address.

## 🧭 Product concept

```text
Create account
     ↓
Search / add a location
     ↓
Set exact coordinates
     ↓
Add property details
     ↓
Attach photos + 3D house model
     ↓
Publish
     ↓
Share / view
     ↓
Authorized edit + audit history
```

## 🔐 Production architecture

The current MVP deliberately works without a backend so the interface can be tested immediately. The next production layer should move persistence and permissions to the server:

| Layer | Recommended role |
|---|---|
| React + Vite + TypeScript | Web application |
| Google Maps | Maps, Places and geocoding |
| Cloudflare Workers | API and authorization boundary |
| Cloudflare D1 | Locations, properties, users and audit records |
| Cloudflare R2 | Property photos and `.glb` files |
| Durable Objects / WebSockets | True multi-user live updates |
| Firebase Auth or another identity provider | Sign-in and account management |
| Model Viewer / Three.js | 3D house presentation |

## 🛡️ Security model to add before public production

- Owner / Editor / Viewer / Admin roles
- Server-side authorization for every create, update and delete operation
- Private locations never returned to unauthorized clients
- Signed R2 upload URLs for photos and GLB files
- Audit log recording **who changed what and when**
- Rate limiting and abuse protection
- Input validation and coordinate sanity checks
- No API secrets committed to GitHub
- Moderation workflow for public locations
- Soft delete + recovery instead of immediate destructive deletion

## 💡 Ideas added to the roadmap

### Property intelligence
- 📸 Multiple property photos with cover image
- 🏷️ Tags such as home, office, landmark, rental or venue
- 🛏️ Amenities and room information
- 📐 Lot size, building size and floor plans
- 🧊 Multiple 3D models for exterior/interior structures
- 📅 Last verified date and verification status

### Location control
- 📌 Drag-to-adjust coordinates
- 🧭 GPS accuracy indicator
- 🗺️ Map/list split view
- 📍 Nearby-location discovery
- 🧱 Geofences for properties or venues
- 🕘 Location history with restore points

### Sharing
- 🔗 Public property pages
- 📱 QR codes for each location
- 🖨️ Printable property/location cards
- 👥 Share with specific editors
- 🔒 Expiring private links

### Trust & moderation
- ✅ Verified-location badge
- 🧾 Change history
- 🚩 Report incorrect location
- 🛡️ Admin review queue
- 🔍 Duplicate-location detection
- 📊 Basic usage analytics

## 🗂️ Suggested data model

```text
users
  id, email, display_name, role, created_at

locations
  id, owner_id, name, address, lat, lng, visibility,
  status, description, created_at, updated_at

properties
  id, location_id, property_type, bedrooms, bathrooms,
  floors, building_area, lot_area

assets
  id, property_id, type, storage_key, public_url,
  mime_type, created_at

location_history
  id, location_id, actor_id, action, before_json,
  after_json, created_at

location_members
  location_id, user_id, role
```

## 🧪 MVP setup

1. Clone the repository.
2. Install dependencies with your preferred package manager.
3. Start Vite with `npm run dev`.
4. Add a Google Maps browser key as `VITE_GOOGLE_MAPS_API_KEY` when you want the real map.
5. Use **Publish** to create a location and **Edit** to change it.
6. Add a public `.glb` URL to preview a 3D house.

Never put private server credentials in `VITE_*` variables. Browser-exposed variables are public by design.

## 🚀 Recommended next build stages

**Stage 1 — Real persistence:** Cloudflare D1 API + migrations.  
**Stage 2 — Accounts:** sign-in plus owner/editor/viewer permissions.  
**Stage 3 — Media:** R2 photo and GLB uploads.  
**Stage 4 — True live mode:** Durable Objects/WebSockets and presence.  
**Stage 5 — Trust:** audit history, verification, moderation and reports.  
**Stage 6 — Public discovery:** SEO-friendly property pages, QR codes and sharing.

## 🤝 Contributing

Ideas, improvements, bug reports and pull requests are welcome. Please keep secrets out of commits and include tests or clear reproduction steps for behavior changes.

## 📄 License

License information should be selected before the first public production release.

---

**Ace’s Address Changer — publish it, locate it, update it. 📍🏠**
