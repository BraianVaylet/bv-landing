# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **recruiters and hiring managers** screening Braian D. Vaylet for a senior
frontend role. They arrive from LinkedIn, a job application, or a direct link, usually
on a short screening pass, and need to decide fast whether he is senior enough to
advance. Their job: confirm seniority, see the scale of companies he has worked at,
and get a way to contact him.

Secondary: the site is also Braian's **living professional identity page** — the URL he
gives out permanently, not a temporary job-hunt asset. It must stay credible and current
between searches, when no one is converting on anything.

## Product Purpose

A single-page personal landing that presents Braian's professional record — role,
experience, capacitaciones, and personal projects — and makes contacting him trivial.
Success is a recruiter leaving convinced of seniority, and reaching out by email or
LinkedIn.

## Positioning

Three claims a neighboring dev portfolio could not truthfully copy:

1. **Senior UI at scale.** Enterprise frontend for banks and telcos — Globant, Santander
   Argentina, Telecom Argentina, Nera (ex Galicia Agro), gA/Parabolt — not side projects.
2. **Ships his own design system.** `medano-ui` (`@medano-ui/tokens|css|fonts|react`) is
   his own published design system; this site is built on it. He maintains the substrate
   his own work runs on.
3. **Prolific shipper of real apps.** Seven-plus live personal web apps solving actual
   problems in his life — CrossFit tracking, compound-bow sight math, archery tournaments,
   personal finances, investments, wine notes.

Craft of the hero animation was explicitly *not* selected as a positioning claim. It can
carry the work implicitly; it is not a headline argument.

## Operating Context

- Visitors are frequently mid-screen-share or tab-hopping between candidates; the first
  viewport does most of the work.
- Mobile matters: LinkedIn links open in-app on phones.
- Recruiters copy details into ATS systems, so machine-readable data (schema.org/Person
  JSON-LD, already in `src/components/Seo.astro`) is part of the product, not decoration.
- The page is also shared as a link — OG preview quality is part of the first impression.

## Capabilities and Constraints

- **Stack (existing):** Astro 7, `output: 'static'`, no adapter. Deployed on Vercel.
  medano-ui consumed as CSS/tokens/fonts over native Astro markup — **zero React at
  runtime**; `@medano-ui/react` is installed only for its `styles.css`.
- **Client JS is deliberately minimal:** the hero scene and the theme toggle, vanilla TS.
  Keep it that way.
- **Content lives in `src/data/cv.ts`** (typed, single source of truth). Components stay
  dumb. Copy changes go in the data file, never hardcoded into markup.
- **Sections:** Hero, Experiencia, Capacitaciones, Proyectos, Footer. Single route (`/`).
- **Bilingual ES/EN is a committed requirement.** Language is chosen by **auto-detecting
  the browser language**, with a manual override the visitor can set. Open constraint:
  the site is currently pure static output with Spanish-only copy and `og:locale=es_AR`
  — auto-detection needs either edge middleware, a client-side redirect, or prerendered
  `/en` routes. **The mechanism is undecided; the requirement is not.** Until it ships,
  no copy may be hardcoded in markup.
- **Theme:** light/dark toggle exists (`ThemeToggle.astro`); the dune scene reacts to
  theme changes via MutationObserver.
- **Logos:** local SVG/JPG under `public/logos/`, monogram-of-initials fallback when a
  logo is missing. No LinkedIn auto-fetch (signed URLs, ToS) — that path is closed.
- **Domain:** production is **braianvaylet.blog** (Hostinger DNS → Vercel, www primary).
  The `SITE` env var drives canonical/sitemap/OG. `README.md` still names
  `braianvaylet.dev` as the example domain — stale.

## Brand Commitments

- Name and identity: **Braian D. Vaylet** — "Web UI Developer Senior", Bahía Blanca,
  Buenos Aires, Argentina.
- **medano-ui is the design substrate.** Its tokens, fonts, and component classes are the
  binding visual authority for this site; the site doubles as a demo of the system.
- The **dune-and-moon scene** is the existing signature of the page: médanos (a Bahía
  Blanca / medano-ui through-line), moon phases advancing as the visitor scrolls.
- Contact surface is email + GitHub + LinkedIn only. No form, no phone, no Instagram
  despite the icon key existing.

## Evidence on Hand

Real:
- Ten roles with company logos (`src/data/cv.ts` → `experience`).
- Seventeen capacitaciones/credentials including UNS, UBA, Anthropic Academy,
  Cognition/Devin Academy, DeepLearning.ai, Platzi, Cisco (`trainings`).
- Seven personal projects, each with a public GitHub URL and a 512px logo (`projects`).
- Skill inventory across languages, frontend, backend/data, Web3, tooling (`skillGroups`).
- schema.org/Person JSON-LD.

Absent — must not be fabricated:
- **No testimonials, references, client quotes, metrics, or press.** None exist.
- **No dates on any experience or training entry.** The `ExperienceItem` type has no
  date fields, so tenure and chronology cannot be shown. Consequence: `Seo.astro` filters
  on `job.end === PRESENT`, a field that does not exist, so JSON-LD `worksFor` is always
  empty. Either add real dates or drop the filter — do not invent dates.
- `cv.ts` carries `TODO(verify)` markers; unverified facts are not shippable claims.
- `public/og.svg` is an SVG; LinkedIn and X need a 1200×630 PNG for reliable previews.
- `profile.yearsOfExperience` is `5` while `about[0]` says "más de 6 años" — one is wrong.
- `profile.openToWork` is `true`; flip it when that stops being true.

## Product Principles

1. **Seniority is proven by employers and artifacts, not adjectives.** Show where he
   worked and what he shipped; let the reader conclude "senior."
2. **Contact is never more than one action away.** Every section leaves an obvious next
   step; a decided recruiter should never have to scroll to find the email.
3. **Static and fast by default.** New capability justifies its client JS or it does not
   ship. The page must be fully useful with the scene paused.
4. **Content is data.** Everything a recruiter reads lives in `cv.ts`, typed and
   translatable — a precondition for the bilingual requirement.
5. **Never fabricate credibility.** No invented dates, metrics, testimonials, or clients.
   An honest gap beats a plausible fiction on a page a recruiter will verify.

## Accessibility & Inclusion

- `prefers-reduced-motion` is already honored: the dune scene renders static instead of
  animating. This behavior is binding — future motion work must keep an equivalent path.
- The scene also pauses via IntersectionObserver and page-visibility, so the page stays
  usable and cheap on low-power devices.
- `main` carries `id="main"` as a skip-link target; keep the landmark structure intact.
- WCAG is listed among Braian's own practices — the site is a work sample, so a11y
  defects read as a competence signal to the exact audience being persuaded.
