# Nike "Try the Look." — Runway & Streetwear Collection 2026

An exact recreation and multi-page editorial expansion of the Shopify **"Try the Look."** runway section. Built with **vanilla HTML5, CSS3, and modern JavaScript (zero frameworks, zero external npm runtime dependencies)**.

---

## 🌟 Pages & Key Features

1. **Home (`index.html` / `home.html`)**
   - High-impact editorial landing page with display typography.
   - Interactive 6-model lineup ribbon with hover focus effects and direct links into the 3D ring.
   - Innovation feature block highlighting the 3D ring geometry and depth blur.
   - 3-Piece Look Spotlight cards with complete bundle calculations.
   - Hand Rail Pro teaser banner.

2. **Runway (`runway.html`)**
   - Exact recreation of the flagship `<runway-section>` custom element.
   - Arranged on an elliptical 3D depth-ring with simulated depth blur on outer figures.
   - 5-second automatic progression with animated tick bars (01–06), manual arrows, and pause toggle.
   - Interactive "View look" lightbox with numbered product pins (1–3).
   - Right-side "In this look" panel with item sizing selectors, stock validation, and a 10% bundle price incentive ($547.00 $\rightarrow$ $492.30).
   - Custom dynamic "Drag / View" cursor with spring physics.

3. **All Looks Lookbook (`looks.html`)**
   - Clean, high-fashion **2-column per row** editorial spread.
   - Filter pills for each look theme (*The City Edit*, *Gallery Opening*, *Studio Day*).
   - Complete look details: full-body cut-out, numbered 3-piece inventory, bundle math, and one-click bag additions.

4. **Shop the Pieces (`shop.html`)**
   - Direct shopping catalog featuring all 8 signature apparel and footwear pieces.
   - Live category filter pills (*All*, *Footwear*, *Hoodies*, *Sweatshirts*, *Tees*).
   - Real-time price sorting and size picker dropdowns with instant bag additions.

5. **Hand Rail Pro (`rail.html`)**
   - Continuous horizontal scene rail showcasing all 6 runway figures in sequence.
   - Smooth pointer/mouse drag physics with kinetic inertia and rubber-banding.
   - Interactive bottom scrubber bar.
   - Slide-out model inspection drawer with head-to-toe piece breakdowns.

6. **About (`about.html`)**
   - Narrative overview of the Winter 2026 runway concept and design philosophy.
   - Material spotlights (450 GSM heavyweight French Terry, double-washed denim, full-grain tumbled leather).

7. **Shared Styling Bag (`shared-bag.js`)**
   - Unified persistent bag across all pages synced in real time via `localStorage`.
   - Add individual pieces or entire bundles from any page.
   - Live cart badge counter, item breakdown with size/price tags, removal controls, and text export.

---

## 🚀 How to Deploy on Vercel

### Option 1: Via GitHub (Recommended)

1. **Initialize Git & Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nike Try the Look Runway complete project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** $\rightarrow$ **"Project"**.
   - Select your GitHub repository.
   - In **Project Settings**:
     - **Framework Preset**: *Other*
     - **Root Directory**: `./` (default)
     - **Build Command**: `npm run build` (or leave default, static HTML is ready to serve)
     - **Output Directory**: `./` (default)
   - Click **Deploy**. Your site will be live within seconds!

### Option 2: Direct via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the terminal prompts; select default options.

---

## 🛠 Local Development

You can run this project locally without any dependencies:

```bash
# Optional: re-build all static pages from source templates
npm run build

# Start local dev server (Node.js)
npm start
# Open http://localhost:3000 in your browser
```

Or open `index.html` directly in any web browser.

---

## 📁 Repository Structure

```
try-the-look/
├── index.html            # Landing page (Vercel entry point)
├── home.html             # Mirror of landing page
├── runway.html           # Flagship 3D depth-ring carousel
├── looks.html            # 2-column editorial lookbook
├── shop.html             # 8-piece shopping catalog
├── rail.html             # Hand Rail Pro horizontal drag rail
├── about.html            # Narrative & material philosophy
├── catalog.json          # Shared catalog definitions & products
├── build-all.mjs         # Master compiler script (Node.js)
├── inter.woff2           # Embedded Inter font binary
├── package.json          # Project metadata & npm scripts
├── vercel.json           # Vercel deployment routing & clean URLs
├── .gitignore            # Git ignore rules
├── README.md             # Documentation & setup guide
└── src/
    ├── styles.css        # Base typography, header, dialog & bag styles
    ├── runway.js         # Flagship <runway-section> custom element
    ├── shared-bag.js     # Universal styling bag controller
    ├── home.css          # Landing page styles
    ├── looks.css         # 2-column lookbook styles
    ├── looks.js          # Lookbook filtering & bag logic
    ├── shop.css          # Shop catalog styles
    ├── shop.js           # Shop catalog filtering & sorting
    ├── rail.css          # Hand Rail Pro styles
    └── rail.js           # Hand Rail Pro drag physics & drawer logic
```
