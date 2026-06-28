# Site Teardown: Roofora Hero

**URL:** https://roofora.framer.website/  
**Date analyzed:** 2026-05-28  
**Confidence level:** Mixed  
**Likely platform:** Framer

## 1. Summary

- Confirmed: nav text, Hero headline, subtitle, CTA text, main Hero image, logo image and design tokens were extracted from source HTML.
- Generated Scaffold: `index.html` and `styles.css` rebuild only the first Hero as an isolated Portuguese preview.
- Partial: exact Framer entrance animations and template badge behavior were not rebuilt.
- Proprietary / Platform-Locked: Framer runtime, generated classes and paid template overlay are platform-specific.

## 2. Package Overview

- `index.html` - generated Hero preview in Portuguese.
- `styles.css` - generated CSS for the isolated Hero.
- `assets/` - downloaded public logo and Hero image.
- `data/` - structured summary for later review.
- `extraction/raw/` - preserved raw HTML snapshot.
- `extraction/data/` - source evidence collected from the page.

## 3. Confirmed Hero Content

| Element | Original | Portuguese preview | Status |
|---|---|---|---|
| Logo | Roofora | Roofora | Confirmed |
| Nav | Home, Pricing, About Us, Service, Projects, Blog, Get In Touch | Início, Preços, Sobre, Serviços, Projetos, Blog, Entrar em contato | Confirmed / Translated |
| Headline | Trusted Experts for Home Repairs | Especialistas confiáveis para reparos em casa | Confirmed / Translated |
| Subtitle | Reliable roofing solutions built to last... | Soluções para telhados feitas para durar... | Confirmed / Translated |
| CTAs | Get a Free Estimate, Call Us Today | Solicitar orçamento, Ligar hoje | Confirmed / Translated |

## 4. Design Evidence

- Confirmed: dark nav/background token `#0e1201`.
- Confirmed: accent lime token `#cdf660`.
- Confirmed: main font family is `Urbanist`.
- Confirmed: Hero image is `dyUVy700DwPm1498uwEGVq8ZdA.png`, alt text `man wiring`.
- Generated Scaffold: glass cards and icons are rebuilt in semantic HTML/CSS rather than copied from Framer components.

## 5. Asset Inventory

- `hero-worker.png` - confirmed Hero background image.
- `roofora-logo.png` - confirmed logo image.

## 6. Gaps and Next Review

- Entrance effects are not reproduced.
- The current deliverable is for carousel preview testing only and is not linked to the official portfolio.
- Manual visual inspection should confirm crop, title scale and card spacing.
