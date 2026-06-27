# Handoff: CloudFen Website Redesign (Full Site)

## Overview
A complete redesign of the **CloudFen** corporate website — an IT services company offering IT staffing, product development, maintenance & support, infrastructure services, recruitment, outsourcing, industry solutions, careers, and immigration information.

The redesign is a modern, professional, trustworthy B2B technology-services site: white-heavy with black anchors and a cyan accent, soft serif headings + smooth sans body, curved section transitions, scroll/text animations, and an IIC-style "I need to…" three-choice homepage flow. It is fully static (HTML/CSS/JS, no build system), mobile-first, and preserves the original page URLs and form actions.

The site has **25 public pages** sharing one stylesheet (`css/site.css`) and one script (`js/site.js`).

## About the Design Files
The files in `site/` are **design references created in HTML/CSS/JS** — a working static prototype showing the intended look, content, and behavior. They run as-is in a browser.

The task is to **recreate this design in the target codebase's environment** using its established patterns and libraries:
- If the target is a CMS (e.g. WordPress) or templating system, translate the shared header/footer/section components into that system's partials/templates and the page content into pages/posts.
- If the target is a component framework (React/Vue/etc.), build the shared chrome (Header, Footer, Hero, ServiceRow, Card, CtaBand, etc.) as components and compose the 25 pages from them.
- If the site will simply be deployed as static files, the `site/` folder **is** the deliverable and can ship directly.

Do **not** invent company claims. All copy here is either CloudFen's real content or neutral, factual rewrites. There are intentionally **no fake stats, awards, client logos, or case-study numbers.**

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, components, interactions, and copy. Recreate pixel-for-pixel, then swap in the codebase's own conventions where appropriate (e.g. icon system, form backend).

---

## Design Tokens
All tokens are defined as CSS custom properties at the top of `site/css/site.css` (`:root`).

### Colors
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#13202b` | Primary text, black buttons, dark ribbons |
| `--ink-2` | `#23323f` | Slightly lighter ink |
| `--slate` | `#46586a` | Body text |
| `--muted` | `#5d6f80` | Secondary text |
| `--paper` | `#f7f9fb` | Page background |
| `--paper-2` | `#eef3f7` | Alternating section background |
| `--card` | `#ffffff` | Cards / surfaces |
| `--line` | `#e4e9ee` | Hairline borders |
| `--line-2` | `#d4dce3` | Stronger borders / inputs |
| `--accent` | `#0e8aa3` | Primary brand cyan (links, eyebrows, icons) |
| `--accent-deep` | `#0c5d6c` | Hover / darker cyan |
| `--accent-soft` | `#e6f4f7` | Cyan tint (icon chips, pills) |
| `--accent-bright` | `#1bb6cf` | Bright cyan (accents on dark, hover glows) |
| `--gold` | `#b08a3e` | Subtle top-accent on framed photos |
| `--black` | `#10151b` | CTA band & footer background |

### Typography
- **Headings:** `Lora` (Google Fonts), weights 400–700, with italic for accent words. Soft rounded serif. Var: `--serif`.
- **Body / UI:** `Plus Jakarta Sans` (Google Fonts), weights 400–800. Smooth humanist sans. Var: `--sans`.
- Font link (in every page `<head>`):
  `https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap`
- Base body: 17px / line-height 1.62, color `--slate`, antialiased.
- Heading scale (fluid): h1 `clamp(34px,4.6vw,54px)` weight 500; section h2 `clamp(28px,3.6vw,44px)` weight 500; card h3 ~19px weight 600. Letter-spacing −.01 to −.02em on large headings.
- **Eyebrow** (`.ey`): Jakarta, 12px, 600, letter-spacing .22em, uppercase, cyan, with a 26px cyan rule before the text. `.ey.cap` is the muted/grey variant.

### Spacing & Shape
- Content width: `--wrap` = 1180px, side padding 30px.
- Section vertical padding: `.sec` = 90px (`.sec.tight` = 64px).
- Radius: cards 14px, large panels 18–20px, pills/inputs 8–9px, full-round for icon circles.
- Shadows: cards `0 10px 30px rgba(20,40,55,.05)`; hover `0 22px 48px rgba(20,40,55,.12)`; elevated panels `0 22px 50px rgba(20,40,55,.08–.1)`.

### Motion
- Reveal-on-scroll: elements with `.rv` start `opacity:0; translateY(22px)` and transition to visible via an IntersectionObserver that adds `.in` (see `js/site.js`).
- Word-by-word text animation on `.tx` headings (staggered span fade-up).
- Hero 3D parallax: pointer moves the photo, tilts the text block (rotateX/Y), and drifts a cyan sheen — desktop + non-reduced-motion only.
- All motion respects `@media (prefers-reduced-motion: reduce)`.

---

## Global Components (shared across all 25 pages)

### Header (`.hdr`)
- Sticky, white, blurred, hairline bottom border; adds shadow on scroll (`.scrolled`).
- Left: CloudFen logo (`images/logolg-dark.png`, 30px tall) linking to `index.html`.
- Center: primary nav (`.nav`). Items: Home, About, **Services** (dropdown: IT Staffing, Product Development, Maintenance & Support, Infrastructure, Recruitment, Outsourcing), Our Focus, **Industries** (dropdown: Healthcare, Financial Services, Retail, Telecommunications, Manufacturing), **Careers** (dropdown: Job Openings, Referral, **Immigration** → nested: H-1B, PERM, I-140, I-485, CPT, OPT, STEM OPT, E-Verify), Contact.
- Dropdowns: white cards, 12px radius, shadow, hover-reveal on desktop; the active top item gets `.current`.
- Right: black pill CTA "Get in touch" → `contact.html`.
- Mobile (≤1040px): CTA hides, hamburger (`.menu-btn`) toggles a right-side drawer (`body.menu-open`); dropdowns become tap-accordions (`.has.open`).

### Footer (`.ft`) — black (`--black`)
Four columns: (1) small logo `images/logosm.png` + one-line description + social icons (Facebook, LinkedIn, X — real CloudFen URLs); (2) **Company** links; (3) **Services** links; (4) **Offices** = US headquarters address + email. Bottom bar: `© <span data-year>2026</span> CloudFen LLC…` (JS sets the live year) + quick links. **US-only — no India/other locations anywhere.**

### Buttons
- `.btn` base; `.btn-1` = black fill, white text (primary); `.btn-2` = white with border (secondary); `.btn-lg` = larger. Arrow `.ar` nudges right on hover. On dark sections, `.btn-1` inverts to white-on-dark.

### Section header (`.shead`)
Two-column (title left, lead paragraph right-aligned) with a hairline under it; `.shead.ctr` centers it.

### Cards
- `.card` — white, 14px radius, cyan icon chip (`.gi`), title, copy, optional `.more` link; lifts on hover.
- `.svc .row` — homepage service list rows: number + icon+title + description + circular arrow; expands/pads on hover.
- `.info` — compact icon + label + value (contact details).
- `.shot` — image tile with floating `.lab` caption (used in galleries).
- `.frame` / `.frame.gold` — framed photo with a small cyan caption tab and optional gold top accent.

### CTA band (`.ctaband`) — black, with faint grid + cyan glow, headline + white button. Appears near the bottom of most pages.

### Curves
SVG wave dividers (`.curve` / `.curve-b`) sit at the bottom of the homepage hero, the homepage choice/stat area, and **every inner page hero (`.phero`)**, so heroes flow into the content with a soft wave (fill = `--paper`).

---

## Page Templates

### 1. Homepage (`index.html`) — IIC-style flow
Order top → bottom:
1. **Photographic hero (`.hero-c`)** — full-bleed office photo (`images/carousel/2.jpg`) with a left-to-right navy scrim, eyebrow, h1 ("Engineering talent and infrastructure, *delivered with precision.*"), subhead, two CTAs. Bottom wave curve. **Interactive 3D parallax** on pointer move.
2. **Three-choice cards (`.choices`)** — dark rounded panel overlapping the hero, three columns: **"I need to… Hire talent"** → `it.html`, **"…Build a product"** → `product.html`, **"I want to… Find a job"** → `job.html`. Each: small label, serif title + circular arrow, one-line description; hover deepens to a cyan gradient.
3. **Tech marquee (`.marq`)** — auto-scrolling pill row (React & Node, Cloud/AWS, DevOps, Data & Analytics, QA & Testing, Cybersecurity, Java/.NET, Salesforce, AI/ML, Mobile).
4. **Mission (`.mission`)** — centered eyebrow + h2 "Connecting clients with the right talent and technology" + intro paragraph.
5. **Services (`#services`, `.svc`)** — 6 rows (IT Staffing, Product Development, Maintenance & Support, Recruitment, Outsourcing, Infrastructure), each linking to its page.
6. **About split** — framed team photo + "A reliable partner, built on understanding first" + checklist + button to `about.html`.
7. **Industries (`#industries`, `.inds`)** — 5-plate strip (Healthcare, Financial, Retail, Telecom, Manufacturing).
8. **Gallery (`.shot` grid)** — "Inside CloudFen" real photos.
9. **Careers band (`.careers-band`)** — photo + dark overlay, "Ready to find your next opportunity?", Browse openings / Upload your CV.
10. **CTA band** + footer.

### 2. Inner page hero (`.phero`)
Used by every non-home page: light gradient panel + faint grid, eyebrow, h1 (with italic accent word), one-line intro, breadcrumb (`.crumbs`), bottom wave curve.

### 3. Service pages (`it`, `product`, `suppor`, `infra`, `recr`, `outsourcing`)
`.phero` → intro **split** (framed image + copy + feature checklist) → 3-card "what you can expect" grid → CTA band → footer. Content is each service's real description.

### 4. Our Focus (`focus.html`)
`.phero` → capabilities grid of real tech images (DevOps, Cloud, Networking, Big Data, Database, Machine Learning, Data Science, UI/UX) → tech pills → "expertise that delivers" cards → CTA.

### 5. Industry pages (`health`, `financial`, `retail`, `tele`, `manu`)
`.phero` → intro split (sector image + copy + checklist) → "what we bring to the sector" cards → CTA.

### 6. Careers — Job Openings (`job.html`)
`.phero` → live job grid that **fetches from the existing backend API** `hrportal/admin/job_openings.php?action=list` (kept intact) and renders cards; "View description" opens a custom modal (no Bootstrap). Empty/loading/error states included. Falls back to "no open positions" + link to send CV. CTA to send CV.

### 7. Referral (`refferal.html`)
`.phero` → split: 3-step "how it works" + a referral form posting to `include/quickcontact.php` (field names preserved) → CTA.

### 8. Immigration pages (`H1B`, `perm`, `I140`, `I185`, `cpt`, `opt`, `stemotp`, `everify`)
`.phero` → **two-column layout**: left = structured prose (`.prose`, lead + h2 sections + bulleted lists); right = sticky aside with a framed image + a "Key facts" card + "Talk to our team" button. `H1B` and `everify` additionally embed their existing iframes (Google Form / E-Verify gov page) below the intro. Content is accurate, readable explanations (CPT/OPT/STEM OPT were corrected — the originals had PERM text pasted in by mistake).

### 9. About (`about.html`)
`.phero` → intro split → mission/principles cards → environment split → CTA.

### 10. Contact (`contact.html`)
`.phero` → split: full contact form (left) + contact info cards & embedded Google Map of the Alpharetta HQ (right) → quick-message form section. **Both forms preserve original `action`s and field `name`s** (see below).

---

## Forms (preserve exactly — backend depends on these)
- **Main contact form** → `action="include/sendemail.php"`, `enctype="multipart/form-data"`. Fields: `template-contactform-name`, `-email`, `-phone`, `-service`, `-subject`, `-file` (optional CV), `-message`, `-botcheck` (honeypot), submit name `submit`.
- **Quick / referral form** → `action="include/quickcontact.php"`. Fields: `quick-contact-form-name`, `-email`, `-message`, `-botcheck`, submit `quick-contact-form-submit`.
- **Job board** → reads `hrportal/admin/job_openings.php?action=list` (JSON `{success, jobs:[{id,title,employment_type,location,posted_date|created_at,description,status}]}`); only `status==='active'` shown.
- **H-1B** → embeds the existing Google Form iframe; **E-Verify** → embeds the official e-verify.gov page.
> These backend endpoints (`include/`, `hrportal/`) are **not** part of this bundle and must remain untouched in the live environment.

## Interactions & Behavior (`js/site.js`)
- Mobile menu toggle + dropdown accordions; menu closes on real-link tap.
- Sticky header shadow on scroll; floating back-to-top button (`.to-top`) appears past 520px.
- IntersectionObserver reveal for `.rv`; staggered word animation for `.tx` headings.
- Hero 3D parallax (desktop, hover-capable, non-reduced-motion only).
- `[data-year]` is set to the current year on load (currently renders 2026).

## Responsive Behavior
- Mobile-first. Nav collapses to a drawer ≤1040px. Multi-column grids (services, cards, footer, choice cards, immigration two-column) collapse to 1–2 columns at ~860/820/760/560px breakpoints. Hero scrim strengthens on small screens for legibility. Hit targets ≥44px.

## Assets
All under `site/images/`:
- **Logos:** `logolg-dark.png` (dark wordmark for light header), `logosm.png` (white wordmark for dark footer). (Originals `logolg.png`/`logosm.png` are the white-on-transparent source.)
- **Photos:** `carousel/`, `about/`, `services/`, `team/`, `tech/` — real CloudFen photography used in heroes, splits, galleries, and the Focus capability grid.
- **3D renders:** `renders/` — custom isometric illustrations (light + colourful variants: servers, cloud, network, dashboard, data, security, documents) used on some service/industry pages.
- **Icons:** inline SVG (stroke style, `currentColor`) — no icon-font dependency. Swap for the codebase's icon system if it has one.
- **Favicon:** `images/favicon.ico`.
- Fonts: Google Fonts (Lora + Plus Jakarta Sans) via `<link>`.

## SEO
Every page has a unique `<title>`, meta description, one `<h1>`, semantic headings, alt text on images, and breadcrumbs on inner pages. URLs/filenames are unchanged from the original site.

## Files
- `site/` — the complete static site (open `site/index.html` in a browser to view).
  - 25 `.html` pages (listed in §Page Templates)
  - `site/css/site.css` — the entire design system (tokens + every component)
  - `site/js/site.js` — all interactions
  - `site/images/` — logos, photos, renders, favicon
- This `README.md` — self-sufficient spec.

## Notes for implementation
- The shared header/footer are duplicated inline in each HTML file (static prototype). When recreating, extract them into a single reusable component/partial.
- Keep the cyan `--accent` system and the Lora/Jakarta pairing as the brand.
- Preserve all form `action`s, field `name`s, the job-board API call, and the H-1B/E-Verify embeds.
- Keep the site **US-only** — there are deliberately no other office locations in the copy.
