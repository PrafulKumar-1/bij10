# Praful Exports Website

Premium classic merchant exporter business website for **Praful Suthar (Mumbai, India)** built with modern HTML5, CSS3, and vanilla JavaScript.

## Stack
- HTML5
- CSS3 (custom utility-style architecture, Tailwind-equivalent rapid classes not required)
- Vanilla JavaScript
- localStorage for backend simulation (product catalog CRUD)

## Features
- Sticky luxury navigation with mobile hamburger menu
- Cinematic hero with parallax background, particle effects, and typewriter text
- Dynamic product showcase
- Real-time search, category/region filters, and sorting
- Product CRUD with localStorage persistence
- Per-card drag/drop image updates with client-side image compression
- Upload portal with multi-image drag/drop, previews, preview modal, and catalog submission
- About, certifications, contact + Mumbai map embed, newsletter form, footer
- Responsive mobile-first design
- SEO metadata and schema markup
- Accessibility: keyboard nav, labels, ARIA, skip link, focus states

## Project Structure
```text
.
├── index.html
├── style.css
├── app.js
├── package.json
├── README.md
└── assets
    └── images
        ├── hero.jpg
        ├── about.jpg
        ├── product-1.jpg
        ├── product-2.jpg
        ├── product-3.jpg
        ├── product-4.jpg
        ├── product-5.jpg
        └── product-6.jpg
        ├── showcase-1.jpg
        ├── showcase-2.jpg
        ├── showcase-3.jpg
        └── showcase-4.jpg
```

## Local Run
```bash
npm run dev
```
Then open `http://localhost:5173`.

## Deploy to Netlify
1. Push this folder to a Git repository.
2. In Netlify, choose **Add new site -> Import an existing project**.
3. Select your repo.
4. Build settings:
- Build command: *(leave empty)*
- Publish directory: `.`
5. Deploy.

Alternative drag-and-drop deployment:
1. Zip the project.
2. Go to Netlify dashboard.
3. Drag the zip into **Sites** page.

## Deploy to Vercel
1. Push this folder to GitHub/GitLab/Bitbucket.
2. In Vercel, click **New Project**.
3. Import the repository.
4. Framework preset: **Other**
5. Build command: *(empty)*
6. Output directory: `.`
7. Deploy.

## Data Persistence
- Product data is saved in browser localStorage under key: `prafulExportsCatalogV1`.
- Clearing browser storage resets product state to default seed products.

## Notes
- Replace placeholder phone/social links with production values.
- Replace placeholder certification cards with official logos/documents.
