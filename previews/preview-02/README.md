# Site Teardown: Nexous Hero

**URL:** https://nexous.framer.website/  
**Date analyzed:** 2026-05-28  
**Confidence level:** Mixed  
**Likely platform:** Framer

## 1. Summary

- Confirmed: Hero text, nav labels, CTA labels, Framer platform metadata, main background image URL and embedded Hero thumbnail image URLs were extracted from the source HTML.
- Generated Scaffold: `index.html` and `styles.css` rebuild only the first Hero as an isolated Portuguese preview for the carousel experiment.
- Partial: original Framer animation timelines and exact responsive variants were not fully reconstructed.
- Proprietary / Platform-Locked: Framer class structure, bundled runtime and editor-specific behavior remain platform-generated.

## 2. Package Overview

- `index.html` - generated Hero preview in Portuguese.
- `styles.css` - generated CSS for the isolated Hero.
- `assets/` - downloaded public Hero images used by the preview.
- `data/` - structured summary for later review.
- `extraction/raw/` - preserved raw HTML snapshot.
- `extraction/data/` - visible text and source evidence collected from the page.

## 3. Confirmed Hero Content

| Element | Original | Portuguese preview | Status |
|---|---|---|---|
| Logo | NEXOUS™ | NEXOUS™ | Confirmed / Adapted |
| Nav | Home, About, Services, Projects, All Pages, Contact | Início, Sobre, Serviços, Projetos, Todas as páginas, Contato | Confirmed / Translated |
| Badge | Digital Creative Agency | Agência criativa digital | Confirmed / Translated |
| Headline | Innovative solutions to elevate your brand | Soluções inovadoras para elevar sua marca | Confirmed / Adapted |
| CTA | Book A Call | Agendar conversa | Confirmed / Translated |

## 4. Design Evidence

- Confirmed: dominant orange token appears in source as `rgb(244, 60, 0)`.
- Confirmed: serif display font is `Playfair Display`.
- Confirmed: Hero uses a dark visual field, centered typography, rounded CTA pills and multiple small rounded images inside the headline.
- Generated Scaffold: exact Framer layout classes were not reused; the preview recreates the Hero using semantic HTML/CSS.

## 5. Asset Inventory

- `hero-bg.png` - confirmed Hero background image.
- `thumb-innovative-left.png` - confirmed title thumbnail image.
- `thumb-title-small.png` - confirmed title thumbnail image.
- `thumb-brand-left.png` - confirmed title thumbnail image.
- `thumb-brand-right.png` - confirmed title thumbnail image.

## 6. Gaps and Next Review

- Visual timing and entrance animations are not replicated yet.
- The current deliverable is for carousel preview testing only and is not linked to the official portfolio.
- Next phase should be manual visual inspection in the browser before any integration.
