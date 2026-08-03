---
name: Braian Vaylet — Landing
description: A dark-first warm-earth system where a single ember accent is the only heat on the page.
colors:
  brasa-ember: "oklch(0.66 0.13 39)"
  brasa-ember-strong: "oklch(0.71 0.115 39)"
  brasa-ember-veil: "oklch(0.66 0.13 39 / 0.16)"
  tierra-night: "oklch(0.235 0.008 85)"
  tierra-raised: "oklch(0.291 0.01 85)"
  tierra-lifted: "oklch(0.319 0.011 85)"
  arena-day: "oklch(0.982 0.005 95)"
  ink-primary: "oklch(0.95 0.012 90)"
  ink-secondary: "oklch(0.78 0.015 85)"
  ink-muted: "oklch(0.67 0.015 85)"
  ink-ghost: "oklch(0.55 0.012 85)"
  ink-on-ember: "oklch(0.18 0.012 85)"
  border-subtle: "oklch(0.95 0.02 90 / 0.08)"
  salvia-positive: "oklch(0.74 0.08 150)"
  miel-caution: "oklch(0.78 0.09 90)"
  teja-danger: "oklch(0.72 0.11 30)"
  scene-sky-top: "#17150f"
  scene-sky-bottom: "#201e1a"
  scene-moon-lit: "#f1eee6"
  scene-dune-front: "#c96442"
  scene-sand-bright: "#ebad97"
typography:
  display:
    fontFamily: "'medano Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.2rem, 6vw, 3.6rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'medano Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'medano Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "'medano Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body:
    fontFamily: "'medano Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "'medano Sans', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.08em"
rounded:
  quiet: "0.25rem"
  xs: "0.375rem"
  sm: "0.625rem"
  md: "0.875rem"
  lg: "1.25rem"
  xl: "1.75rem"
  full: "9999px"
spacing:
  3xs: "0.125rem"
  2xs: "0.25rem"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "2.5rem"
  3xl: "3rem"
  4xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.brasa-ember}"
    textColor: "{colors.ink-on-ember}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.brasa-ember-strong}"
    textColor: "{colors.ink-on-ember}"
  button-secondary:
    backgroundColor: "{colors.tierra-lifted}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.25rem"
  card:
    backgroundColor: "{colors.tierra-raised}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  logo-tile:
    backgroundColor: "{colors.tierra-raised}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.lg}"
    padding: "1rem"
    height: "7.5rem"
  logo-tile-hover:
    backgroundColor: "{colors.tierra-lifted}"
  monogram:
    backgroundColor: "{colors.brasa-ember-veil}"
    textColor: "{colors.brasa-ember}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    size: "2.75rem"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
  skip-link:
    backgroundColor: "{colors.brasa-ember}"
    textColor: "{colors.ink-on-ember}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1rem"
---

# Design System: Braian Vaylet — Landing

## Overview

**Creative North Star: "The Night Médano"**

A dune field after dark. The ground is warm, dry earth — every neutral in this system
carries a trace of sand in it (hue 85–95, never a cool gray). The only heat is *brasa*,
the ember accent, and it behaves like an actual coal: it appears where something is alive
— the name in the hero, the primary action, a link you can follow, the crest of the near
dunes — and nowhere else. A moon crosses the sky as you scroll and the sand blows sideways
underneath it. That is the entire show, and it is the only show.

Density is calm and generous. Sections breathe on a 4rem block rhythm inside a 68rem
container; components sit on soft, wind-carved silhouettes with one deliberately squared
corner. Nothing casts a shadow. Depth here is *luminance* — a surface steps up by getting
a fraction lighter, and a hairline of light catches its top edge, the way a dune crest
catches moonlight. Dark is the default state, not an alternate one; the light theme is the
same médano at midday.

The system is deliberately quiet in motion. It rejects the maximalist motion showcase —
scroll-jacking, parallax on every section, entrance animations on everything. One
animated system exists on this page: the dune scene. Everything else moves only in
response to a pointer or a focus, in 120ms, and stops.

**Key Characteristics:**
- Dark-first; light is the same world at midday, not a theme swap.
- Warm neutrals only — every surface and ink sits at hue 85–95. No cool grays.
- One chromatic voice (*brasa*), used sparingly enough that it always means something.
- Zero drop-shadows. Depth is luminance steps plus an inset hairline of light.
- Asymmetric corners: soft everywhere, near-square at the top-left.
- Motion is reserved for the scene; UI motion is 120ms and reactive only.
- OKLCH is the canonical color space for the UI; hex only inside the canvas scene.

## Colors

Warm, low-chroma earth across the whole surface, interrupted by exactly one ember.

### Primary
- **Brasa Ember** (`{colors.brasa-ember}`): The single accent. Carries the hero surname,
  primary buttons, all links, the `BV.` monogram in the header, eyebrow labels, the focus
  ring, the skip link, and the front dune crest in the scene. In the light theme it darkens
  (`oklch(0.52 0.13 38)`) rather than shifting hue — same ember, more contrast on sand.
- **Brasa Ember Strong** (`{colors.brasa-ember-strong}`): Hover state of the primary button
  only. It brightens on dark, deepens on light — hover always moves *toward* the reader.
- **Brasa Ember Veil** (`{colors.brasa-ember-veil}`): 16% ember wash. Sole use: the
  initials-monogram plate behind a missing logo, and text selection.

### Neutral
- **Tierra Night** (`{colors.tierra-night}`): Page ground in dark. The floor everything
  else steps up from.
- **Tierra Raised** (`{colors.tierra-raised}`): First step up — project cards, logo tiles,
  header hover plates. The most common non-page surface.
- **Tierra Lifted** (`{colors.tierra-lifted}`): Second step — secondary buttons, tile
  hover, section rules and the footer's top border.
- **Arena Day** (`{colors.arena-day}`): Page ground in light. Sand, not white — it keeps
  a trace of warmth (chroma 0.005 at hue 95).
- **Ink Primary** (`{colors.ink-primary}`): Headings and the text that must be read.
- **Ink Secondary** (`{colors.ink-secondary}`): Body prose, nav links, card descriptions,
  the "Ver en GitHub" affordance. The workhorse.
- **Ink Muted** (`{colors.ink-muted}`): Tile captions, footer meta. Present, not competing.
- **Ink Ghost** (`{colors.ink-ghost}`): Unused on this surface. It was the colophon until
  measurement put it at 3.18:1 dark / 3.78:1 light — below AA — so the colophon moved to
  `ink-muted`. Nothing legible sits this low.
- **Ink on Ember** (`{colors.ink-on-ember}`): Text sitting on brasa. Near-black warm, never
  pure white on dark ember.
- **Border Subtle** (`{colors.border-subtle}`): 8% warm-white hairline. This is the halo
  edge, not a drawn border.

### Tertiary
Feedback hues exist in the token layer and are unused on this surface: **Salvia**
(`{colors.salvia-positive}`), **Miel** (`{colors.miel-caution}`), **Teja**
(`{colors.teja-danger}`). They are reserved for states — never for decoration or variety.

### The scene palette
The dune scene keeps its own variables (`--scene-*` in `src/styles/global.css`) because the
canvas particle system reads them with `getComputedStyle` and needs a format every canvas
implementation parses. **Scene Sky Top** (`{colors.scene-sky-top}`) to **Scene Sky Bottom**
(`{colors.scene-sky-bottom}`) is the night gradient; **Scene Moon Lit**
(`{colors.scene-moon-lit}`) is the illuminated limb; **Scene Dune Front**
(`{colors.scene-dune-front}`) is the ember crest nearest the reader; **Scene Sand Bright**
(`{colors.scene-sand-bright}`) is a lit grain in flight.

### Named Rules

**The One Ember Rule.** Brasa is the only chromatic voice in the interface. If a second
hue appears anywhere outside a feedback state or the scene, the system is broken. Audit
test: screenshot any section, count non-neutral pixels — if ember covers more than ~10%,
cut something.

**The Warm Neutral Rule.** Every neutral sits at hue 85–95 with chroma ≤0.015. A gray with
hue 240 (or hue 0) does not belong in this system, no matter how neutral it looks in
isolation. Sand is never cool.

**The Three Skies Rule.** The scene palette is defined three times — `:root` (night),
`[data-theme='light']` (day), and `@media (prefers-color-scheme: light) :root:not([data-theme])`
(the no-JS fallback). All three stay in sync. Editing one and not the others ships a
scene that disagrees with its own page.

**The Hex-in-the-Canvas Rule.** Scene variables are literal hex on purpose. Never convert
them to `var()` references or OKLCH — the canvas reads them as strings.

## Typography

**Display Font:** medano Sans (with `ui-sans-serif, system-ui, -apple-system, sans-serif`)
**Body Font:** medano Sans — the same family
**Label/Mono Font:** `--medano-font-mono` exists (`ui-monospace, 'Cascadia Code', 'SF Mono'`)
and is unused on this surface.

**Character:** One sans doing everything, separated purely by weight, size and tracking.
Headings pull tight (-0.02em) and balance their line breaks; body relaxes to 1.5. The
result reads as composed rather than designed — the type is never the loud element,
because the scene already is.

### Hierarchy
- **Display** (650, `clamp(2.2rem, 6vw, 3.6rem)`, 1.1): The hero greeting only. One per
  page. The surname inside it takes the ember.
- **Headline** (650, 1.875rem, 1.25): Section titles — "Experiencia", "Capacitaciones",
  "Proyectos personales". Scales to 2.375rem at ≥48rem via the base sheet.
- **Title** (650, 1.0625rem, 1.25): Project card names. The smallest thing allowed to be
  semibold.
- **Lead** (400, 1.25rem, 1.6): The hero tagline, capped at 36rem. The only oversized body
  text in the system.
- **Body** (400, 0.9375rem, 1.5): Everything else — descriptions, nav, meta, links.
- **Label** (500, 0.9375rem, 1.5, 0.08em, uppercase): The `.eyebrow` above every section
  title, in ember.

### Named Rules

**The Uppercase Belongs to Eyebrows Rule.** Only `.eyebrow` uppercases, and only at 0.08em
tracking. Headings, buttons, nav and labels stay sentence case. Uppercase is a section
marker in this system, not an emphasis tool.

**The Ember Word Rule.** Ember inside running type is reserved for a *proper noun that is
the point* — the surname in the hero. It is not a highlighter; do not tint adjectives.

**The Balanced Heading Rule.** `h1`–`h4` carry `text-wrap: balance` from the base sheet.
Never override it with a manual `<br>`.

## Layout

A single centered column: `width: min(100% - 3rem, 68rem)`, margin-inline auto. Every
section is that container; there is no full-bleed content except the hero scene, which is
absolutely positioned behind it.

**Vertical rhythm.** Sections pad 4rem block. Section titles sit 2rem above their content.
The eyebrow → title → body stack is the invariant section opening; the eyebrow never
appears without a title under it.

**The hero is 175dvh tall with a `position: sticky` 100dvh stage.** The reader scrolls
*through* the hero while the stage stays pinned and the moon wanes and sets; the page then
continues normally. Hero content sits 20dvh from the top of the stage, capped at 42rem.

**Grids are auto-fill, never fixed-column.** Projects: `repeat(auto-fill, minmax(17rem, 1fr))`.
Logo walls: `repeat(auto-fill, minmax(9.5rem, 1fr))`. Both gap at 1rem. Column counts are
a consequence of width, never a breakpoint decision.

**Breakpoints.** The token scale is 40 / 48 / 64 / 80rem. This surface deliberately uses
almost none of it: one rule at 40rem hides the section nav, and the base sheet bumps
heading sizes at 48rem. Everything else is intrinsically responsive.

**Anchors.** Every `[id]` carries `scroll-margin-top: 5rem` so section targets clear the
3.5rem sticky header.

### Named Rules

**The Intrinsic-First Rule.** Reach for `min()`, `clamp()`, and `auto-fill` before a media
query. A new breakpoint needs a reason no intrinsic rule could satisfy.

## Elevation & Depth

**This system has no shadows.** The base sheet states it outright: *"Superficie flotante:
luminancia + filo de luz. Nunca drop-shadow."* Depth is expressed two ways, always
together: a surface steps up the tierra/arena luminance ladder (`surface-0` → `surface-7`,
roughly +2.8% lightness per step), and it catches a hairline of light on its top edge.

The header is the one place depth is also *atmospheric*: it sits at 82% surface-0 with a
10px backdrop blur, so content dissolves under it instead of colliding with it.

### Shadow Vocabulary
- **Halo Edge** (`box-shadow: inset 0 1px 0 0 oklch(0.95 0.03 90 / 0.08)`): The default
  lift. A 1px inner highlight along the top edge — moonlight on a crest. Cards, secondary
  buttons.
- **Halo Glow** (`box-shadow: 0 0 32px 0 oklch(0.85 0.06 80 / 0.04), inset 0 1px 0 0 oklch(0.95 0.03 90 / 0.08)`):
  Reserved for the highest surface tier. Ambient warmth, not a cast shadow — it has no
  offset and no direction.

### Named Rules

**The No-Shadow Rule.** No element casts a shadow onto another element. If something needs
to feel higher, move it up the surface ladder and give it the halo edge. The single
exception is the moon's `drop-shadow(0 0 26px …)`, which is light *emission* from a light
source, not elevation.

## Shapes

Soft, wind-shaped forms with one deliberate cut. The radius scale runs 0.25rem (quiet) →
1.75rem (xl), and the system lives mostly at `sm` (0.625rem) for small controls,
`md` (0.875rem) for buttons, and `lg` (1.25rem) for cards and tiles.

The signature is asymmetric: cards, logo tiles and initials monograms take the full radius
on three corners and drop the **top-left** to `quiet` (0.25rem) via
`border-start-start-radius`. Every container in the system leans the same direction, like
a dune face shaped by a wind that always blows from one side.

Borders are hairlines, and there are only two: the header's bottom rule and the footer's
top rule, both `1px solid surface-3`. Everything else separates by surface color alone.

### Named Rules

**The Wind-Carved Corner Rule.** Any surface at `radius-lg` or above squares its top-left
to `radius-quiet`. Symmetric large radii read as generic; the cut is the fingerprint.

**The No-Line Rule.** Do not add borders to separate content. Step the surface instead.
The two structural hairlines (header bottom, footer top) are the complete list.

## Components

### Buttons
Calm and substantial — soft-cornered, quietly lit, no bounce.
- **Shape:** Softly rounded (`radius-md`, 0.875rem), never pill, never square.
- **Primary:** Ember ground with near-black warm ink (`brasa-ember` / `ink-on-ember`),
  3.25rem tall at `lg`, 1.5rem inline padding. Used exactly once per view, and it is
  always "Contactame" — contact is what this page is for, so the ember means one thing
  everywhere. The hero owns it while the hero is on screen; the sticky header takes it
  over for the rest of the page (see Navigation).
- **Secondary:** Steps up the surface ladder instead of taking color (`tierra-lifted`,
  `ink-primary`) plus the halo edge. Same height and padding. "Ver experiencia" sits
  here: it opens the credibility argument, it does not close it.
- **Ghost:** Transparent with `ink-secondary`, filling to `tierra-raised` on hover. Used
  for the theme toggle at 2.25rem.
- **Hover / Focus / Active:** Background shifts in 120ms on the snap curve; active scales
  to 0.98. Focus is a 2px ember outline at 2px offset, system-wide.

### Cards / Containers
- **Corner Style:** `radius-lg` (1.25rem) with the top-left cut to `radius-quiet`.
- **Background:** `tierra-raised` at elevation 1. Elevation 2 and 3 exist in the library
  and are unused here.
- **Shadow Strategy:** Halo edge only — see Elevation & Depth.
- **Border:** None.
- **Internal Padding:** 1rem, with a 0.75rem gap between head, description and link.
- **Behavior:** The card is a column; the description grows and the GitHub link is pinned
  to the bottom with `margin-top: auto`, so a grid of cards ends on one line no matter how
  uneven the copy.

### Navigation
Sticky, 3.5rem tall, translucent (82% surface-0 + 10px backdrop blur) with a
`surface-3` hairline underneath. Brand monogram `BV.` in ember at the left; section
anchors in `ink-secondary` at body size, brightening to `ink-primary` on hover; social
icons and theme toggle pushed right in 2.25rem square hit areas that fill to
`tierra-raised` on hover. The primary "Contactame" button sits at the head of that right
group: it is hidden while the hero is on screen — the hero is already showing the same
ember action — and revealed for the rest of the page by one IntersectionObserver, fading
in over 160ms with no layout shift. With JavaScript off it is simply always visible.
**Below 40rem the section anchors are removed entirely** — the brand, contact button,
profile links and toggle survive; the page's own scroll is the navigation.

### Role Row
The unit of the Experiencia list. A `surface-2` card with wind-carved corners and the halo
edge, laid out as a 2.5rem logo (monogram fallback) beside a two-line stack: the **role**
in title weight on `ink-primary`, the company under it in `ink-secondary`. The grid is
`repeat(auto-fill, minmax(20rem, 1fr))`. The rows are not links — there are no company
URLs in the data, and a card that looks clickable and is not is worse than a plain one.
The current role, and only it, carries a 6px ember dot with the word "Actualmente": the
data has no dates, so this is the entire chronology the page is entitled to show.

### Logo Tile
The unit of the Capacitaciones wall — that section really is about *where*, so logos are
the content. A 7.5rem-minimum square-ish tile on
`tierra-raised`, wind-carved corners, logo capped at 72% width / 2.75rem height with
`object-fit: contain`, and the entity name beneath in `ink-muted` at 0.8125rem. Linked
tiles lift 2px and step to `tierra-lifted` on hover — and the lift is explicitly disabled
under `prefers-reduced-motion`. There are no roles, dates or
descriptions on the wall.

### Initials Monogram
The honest fallback when a logo file is missing: a 2.75rem plate of `brasa-ember-veil`
with the entity's initials in `brasa-ember`, semibold, 0.02em tracking, wind-carved
corners. It is a *designed absence*, not a broken image — a wall of these still reads as
a wall.

### Dune Scene (signature)
The hero background: a sky gradient, a phase-accurate moon, two SVG dune layers and a
canvas of wind-blown sand between them. It is `aria-hidden` and purely decorative, and it
server-renders a full moon so the scene is correct before hydration and with JavaScript
off. The far layer occupies the bottom 58% in tierra tones, the near layer the bottom 42%
in ember tones, and the sand blows in the gap between them. The moon is `clamp(76px, 14vmin, 148px)`
with a 26px warm glow, and its phase advances with scroll position, quantized to 48 steps.

It pauses on every axis that matters: off-screen (IntersectionObserver), backgrounded tab
(visibility), and `prefers-reduced-motion` (renders static). One `requestAnimationFrame`
loop drives everything; the particle pool is fixed-size with no allocations in the loop.

### Named Rules

**The One Moving System Rule.** The dune scene is the only thing on this page that
animates on its own. Sections do not fade or slide in; numbers do not count up; nothing
parallaxes. UI motion is reactive only — 120ms on the snap curve for hover and state,
200ms for anything larger — and the page must be completely usable with the scene frozen.
One control changes state with scroll: the header's "Contactame" fades in when the hero
leaves. It is a handover of a single ember action between two surfaces, not an entrance
effect, and under `prefers-reduced-motion` it drops the 4px rise and only fades.

**The Reduced-Motion Parity Rule.** Every motion this system adds ships its stationary
equivalent in the same commit. The scene renders static, the tile lift is nulled, smooth
scrolling reverts to auto. A motion feature without its reduced-motion branch is unfinished.

## Do's and Don'ts

### Do:
- **Do** step the surface ladder (`tierra-night` → `tierra-raised` → `tierra-lifted`) to
  create depth, and add `halo-edge` for the lift.
- **Do** cut the top-left corner to `radius-quiet` (0.25rem) on anything at `radius-lg`
  or larger.
- **Do** keep every neutral at hue 85–95. Warm sand, never cool gray.
- **Do** open each section with the eyebrow → title stack, eyebrow in ember uppercase at
  0.08em.
- **Do** reach for `min()`, `clamp()` and `auto-fill` before adding a media query.
- **Do** ship the reduced-motion branch in the same change as the motion.
- **Do** author new UI colors in OKLCH against the `--medano-*` variables, so both themes
  follow automatically.
- **Do** keep the scene's `--scene-*` values as literal hex — the canvas parses them.

### Don't:
- **Don't** cast a drop-shadow. Anywhere. The one exception is the moon's glow, which is
  emission, not elevation.
- **Don't** introduce a second accent hue. Salvia, miel and teja are state colors and
  stay unused until there is a state to report.
- **Don't** animate content on scroll — no entrance transitions, no parallax sections, no
  scroll-jacking. The scene is the page's only self-driven motion.
- **Don't** uppercase anything but `.eyebrow`.
- **Don't** hardcode a hex in UI CSS; that space belongs to the scene alone.
- **Don't** draw borders to separate content. Two structural hairlines exist (header
  bottom, footer top) and that is the whole list.
- **Don't** add a fixed-column grid. Column count follows available width.
- **Don't** edit one scene palette block without editing all three (`:root`,
  `[data-theme='light']`, and the `prefers-color-scheme` fallback).
- **Don't** ship a broken-image state for a missing logo — the initials monogram is the
  designed answer.
