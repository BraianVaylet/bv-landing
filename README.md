# bv-landingpage

Landing page / portfolio de Braian Vaylet. Astro estático + [medano-ui](https://github.com/BraianVaylet/bv-medano-ui), desplegado en Vercel.

## Stack

- **Astro 7** (`output: 'static'`, sin adapter — Vercel autodetecta).
- **medano-ui** desde npm (`@medano-ui/tokens|css|fonts|react`). Cero React en runtime: se usan los tokens, la fuente y las clases CSS (`.medano-button`, `.medano-card`, …) sobre markup Astro nativo. `@medano-ui/react` se instala solo por su `styles.css`.
- Único JS cliente: la animación del hero y el toggle de tema (vanilla TS).

## Desarrollo

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm check     # astro check (types)
pnpm build     # build estático en dist/
pnpm preview
```

## Contenido

- `src/data/cv.ts` — perfil, redes, experiencia, capacitaciones y proyectos. Tiene marcas `TODO(verify)` que conviene revisar antes de publicar.
- **Proyectos**: lista hecha a mano en `cv.ts` (array `projects`). Cada entrada tiene `title`, `description` (opcional), `url` (link a GitHub) y `logo` (opcional, path bajo `public/`; sin logo se muestra un monograma de iniciales). Agregar/quitar proyectos editando el array.
- **Logos** (Experiencia y Capacitaciones): grilla minimalista de logos. Sin logo cargado se muestra un monograma de iniciales (genérico interino). Para usar el logo real: subir el SVG a `public/logos/` y setear el campo `logo` en la entrada de `cv.ts` (ej. `logo: '/logos/globant.svg'`).

  Nombres sugeridos: `globant.svg`, `galicia-agro.svg`, `telecom.svg`, `coderhouse.svg`, `parabolt.svg`, `eycon.svg`, `nexosmart.svg`, `knowbe4.svg`, `platzi.svg`, `educacionit.svg`, `buildspace.svg`, `justjavascript.svg`, `cisco.svg`, `comunidad-it.svg`, `uns.svg`. (Freelance y secundaria no tienen marca → quedan en genérico.)

  **Auto-actualización desde LinkedIn: no es posible** (URLs firmadas que expiran, sin CDN público, contra ToS). Alternativa que sí auto-actualiza: [logo.dev](https://logo.dev) — setear `logo` a `https://img.logo.dev/globant.com?token=TU_TOKEN`. Suma requests externos; los SVGs locales son más rápidos y privados.

## La animación del hero

Escena de médanos con luna que sigue las fases lunares al scrollear (`src/components/scene/`):

- `geometry.ts` — geometría de médanos (paths SVG + puntos de cresta), única fuente de verdad para el SVG y el spawn de partículas.
- `moon.ts` — path SVG de la fase lunar (técnica del terminador elíptico), cuantizado a 48 pasos.
- `particles.ts` — pool fijo de partículas de arena sobre canvas (sin allocations en el loop).
- `scene.ts` — orquestador: un solo rAF, viento con ráfagas, pausa por IntersectionObserver / visibilidad / `prefers-reduced-motion` (escena estática), cambio de tema vía MutationObserver.

## Deploy (Vercel)

Build estático autodetectado. Setear la env var `SITE` con el dominio real (ej. `https://braianvaylet.dev`) para canonical/sitemap/OG correctos; sin ella cae a `https://bv-landingpage.vercel.app`. Actualizar `public/robots.txt` si cambia el dominio.

Pendiente: reemplazar `public/og.svg` por un PNG 1200×630 para previews confiables en LinkedIn/X.
