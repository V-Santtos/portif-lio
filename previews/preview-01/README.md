# Preview 01 - EcoScape Hero Teardown

**URL:** https://eco-scape.framer.website/  
**Date analyzed:** 2026-05-28  
**Scope:** Hero only  
**Confidence level:** Mixed  
**Likely platform:** Framer

## 1. Summary

This folder contains a focused extraction and generated local preview for the first Hero of the EcoScape Framer site. The portfolio itself is not linked to this preview yet.

Confirmed from source:

- Framer-built page.
- Hero nav text: `Home`, `About Us`, `Services`, `Blog`, `Pages`, `Get Started`.
- Hero category: `Lawn Mowing`.
- Hero headline parts: `Healthy Lawns`, `Every`, `Season-Long`.
- Hero body copy and CTA: `Book Now`.
- Typography clues: Geist, Playfair Display italic, Inter.
- Color tokens including dark green/black `rgb(2, 9, 8)` and lime `rgb(209, 252, 113)`.
- Desktop reveal clues using `opacity:0` and `translateY(100px)`.

Generated scaffold:

- `index.html`
- `styles.css`

The scaffold is an interpretation for our carousel preview, not a byte-for-byte clone.

## 2. Package Overview

- `index.html` - isolated Portuguese Hero preview.
- `styles.css` - isolated CSS for the preview.
- `assets/` - downloaded public assets that appeared near the Hero source range.
- `extraction/raw/eco-scape-home.html` - saved source HTML.
- `extraction/data/hero-evidence.json` - source contexts for key Hero terms and asset URLs.
- `data/hero-summary.json` - compact structured summary for later porting.

## 3. Tech Stack Clues

| Technology | Status | Evidence | Notes |
|---|---|---|---|
| Framer | Confirmed | `Made in Framer`, `generator Framer e8a9766` | Site is hosted/exported by Framer. |
| Geist | Confirmed | Inline `@font-face` blocks | Main sans font. |
| Playfair Display italic | Confirmed | Inline `@font-face` and italic span styles | Used for editorial italic word treatment. |
| Framer appear animations | Confirmed | `data-framer-appear`, `opacity:0`, `transform:translateY(100px)` | Source suggests entrance reveals. |

## 4. Hero Structure

Confirmed content order:

- Header/nav.
- Category label `// Lawn Mowing`.
- Large headline split across multiple text nodes.
- Short paragraph.
- CTA button.
- Social proof/stat block.
- Large garden/landscaping imagery.

Portuguese adaptation in the generated preview:

- `// Manutencao de gramado`
- `Jardins saudaveis / em todas / as estacoes`
- `Cuidado especializado e manutencao sob medida...`
- `Agendar agora`
- `1.2K+ jardins cuidados`

## 5. Design Evidence

### Colors

| Usage | Value | Status |
|---|---|---|
| Dark ink/background | `rgb(2, 9, 8)` | Confirmed |
| Lime accent | `rgb(209, 252, 113)` | Confirmed |
| Light cards/surface | `rgb(248, 248, 248)` | Confirmed |
| Muted dark text | `rgba(2, 9, 8, 0.8)` | Confirmed |

### Typography

| Role | Font | Status |
|---|---|---|
| Main sans | Geist | Confirmed |
| Italic emphasis | Playfair Display italic | Confirmed |
| Fallback/body | Inter | Confirmed |

## 6. Generated Preview Notes

The generated preview is intentionally simplified for a carousel card:

- One 16:9 frame.
- Large photographic background.
- Dark overlay for text contrast.
- Nav + CTA.
- Big stacked title with italic middle line.
- CTA and avatar cluster.
- Glassy stat card.

Differences from the source are expected because the final use case is a lightweight carousel preview, not a full page rebuild.

## 7. Gaps and Blockers

- Visual validation still needs to be done manually in browser.
- Framer class names are generated and not useful as stable implementation APIs.
- Some exact layout dimensions are inferred from source clues and visual intent, not fully verified by screenshot tooling.
- Downloaded `hero-garden.png` is large and should be optimized or replaced before production use.

## 8. Next Phase

Review `index.html` visually. If the direction is approved:

- adjust copy/style to fit the portfolio carousel frame;
- reduce or replace large assets;
- convert this preview to a React component;
- only then connect it to `LandingPages.jsx`.
