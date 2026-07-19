/**
 * Dune scene orchestrator: one rAF loop drives the scroll-linked moon
 * (phase + position) and the wind-blown sand particles.
 *
 * Lifecycle: the loop only runs while the scene is on screen, the tab is
 * visible and the user accepts motion. `prefers-reduced-motion` renders a
 * static scene (dunes + full moon, no sand, no scroll listener).
 */
import { DUNE_VIEWBOX, FAR_DUNES, NEAR_DUNES } from './geometry';
import { MOON_PHASE_STEPS, moonPathD, quantizePhase } from './moon';
import { SandParticles } from './particles';

const DPR_CAP = 2;
const MAX_FRAME_DT_S = 0.05;
const PARTICLE_CAP_DESKTOP = 120;
const PARTICLE_CAP_MOBILE = 60;
const MOBILE_MAX_WIDTH_PX = 768;

/** Wind model (px/s). Gusts periodically tear sand off a crest. */
const WIND_BASE_SPEED = 34;
const GUST_EVERY_MIN_S = 4;
const GUST_EVERY_MAX_S = 7;
const GUST_DURATION_MIN_S = 1.2;
const GUST_DURATION_MAX_S = 2.0;
const GUST_STRENGTH_MIN = 2.5;
const GUST_STRENGTH_MAX = 3.5;
/** Ambient trickle of sand, always present while animating. */
const AMBIENT_SPAWNS_PER_S = 10;
/** Extra spawns per second at the gusting crest. */
const GUST_SPAWNS_PER_S = 55;

/** Moon travel across the scene, as fractions of the scene box. */
const MOON_START = { x: 0.72, y: 0.18 };
const MOON_END = { x: 0.58, y: 0.94 };

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

interface CrestPoint {
  x: number;
  y: number;
}

export function initDuneScene(root: HTMLElement): void {
  const hero = root.closest<HTMLElement>('[data-hero]') ?? root.parentElement;
  const moonSvg = root.querySelector<SVGSVGElement>('[data-scene-moon]');
  const moonLit = root.querySelector<SVGPathElement>('[data-moon-lit]');
  const canvas = root.querySelector<HTMLCanvasElement>('[data-scene-canvas]');
  const duneLayers = Array.from(
    root.querySelectorAll<SVGSVGElement>('[data-dune-layer]'),
  );
  if (!hero || !moonSvg || !moonLit || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // --- geometry / layout caches (refreshed on resize) ----------------------
  let sceneWidth = 0;
  let sceneHeight = 0;
  let heroTop = 0;
  let scrollRange = 1;
  let moonHalf = 0;
  /** Crest spawn points in scene px; near-dune crests included twice (bias). */
  let crests: CrestPoint[] = [];

  const particles = new SandParticles(
    window.innerWidth <= MOBILE_MAX_WIDTH_PX
      ? PARTICLE_CAP_MOBILE
      : PARTICLE_CAP_DESKTOP,
  );

  let sandColors = readSandColors();

  // --- animation state -----------------------------------------------------
  let rafId = 0;
  let lastTs = 0;
  let running = false;
  let sceneVisible = true;
  let lastPhaseStep = -1;
  let ambientCarry = 0;
  let gustCarry = 0;
  let windSpeed = WIND_BASE_SPEED;
  let gustCrest: CrestPoint | null = null;
  let gustElapsed = 0;
  let gustDuration = 0;
  let gustStrength = 1;
  let nextGustIn = randBetween(GUST_EVERY_MIN_S, GUST_EVERY_MAX_S);

  function readSandColors() {
    const styles = getComputedStyle(root);
    return {
      a: styles.getPropertyValue('--scene-sand-a').trim() || '#de876b',
      b: styles.getPropertyValue('--scene-sand-b').trim() || '#ebad97',
    };
  }

  function measure(): void {
    const sceneRect = root.getBoundingClientRect();
    // Mid-resize (or display:none) the rect can be 0 — keep the last good
    // layout instead of collapsing the canvas; the next resize re-measures.
    if (sceneRect.width === 0 || sceneRect.height === 0) return;
    sceneWidth = sceneRect.width;
    sceneHeight = sceneRect.height;
    heroTop = hero!.getBoundingClientRect().top + window.scrollY;
    scrollRange = Math.max(1, hero!.offsetHeight - window.innerHeight);
    moonHalf = moonSvg!.clientWidth / 2;

    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas!.width = Math.round(sceneWidth * dpr);
    canvas!.height = Math.round(sceneHeight * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    crests = [];
    for (const layer of duneLayers) {
      const rect = layer.getBoundingClientRect();
      const offsetX = rect.left - sceneRect.left;
      const offsetY = rect.top - sceneRect.top;
      const scaleX = rect.width / DUNE_VIEWBOX.width;
      const scaleY = rect.height / DUNE_VIEWBOX.height;
      const isNear = layer.dataset.duneLayer === 'near';
      const dunes = isNear ? NEAR_DUNES : FAR_DUNES;
      for (const dune of dunes) {
        for (const [cx, cy] of dune.crests) {
          const point = { x: offsetX + cx * scaleX, y: offsetY + cy * scaleY };
          crests.push(point);
          if (isNear) crests.push(point); // near crests shed twice as often
        }
      }
    }
  }

  function scrollProgress(): number {
    const progress = (window.scrollY - heroTop) / scrollRange;
    return Math.min(1, Math.max(0, progress));
  }

  function updateMoon(progress: number): void {
    const x = (MOON_START.x + (MOON_END.x - MOON_START.x) * progress) * sceneWidth;
    const y = (MOON_START.y + (MOON_END.y - MOON_START.y) * progress) * sceneHeight;
    moonSvg!.style.transform = `translate3d(${(x - moonHalf).toFixed(1)}px, ${(y - moonHalf).toFixed(1)}px, 0)`;

    const step = Math.round(quantizePhase(progress) * MOON_PHASE_STEPS);
    if (step !== lastPhaseStep) {
      lastPhaseStep = step;
      moonLit!.setAttribute('d', moonPathD(step / MOON_PHASE_STEPS));
    }
  }

  function updateWind(dt: number): void {
    if (gustCrest) {
      gustElapsed += dt;
      if (gustElapsed >= gustDuration) {
        gustCrest = null;
        nextGustIn = randBetween(GUST_EVERY_MIN_S, GUST_EVERY_MAX_S);
      } else {
        // Half-sine envelope: ramps up, peaks mid-gust, dies down.
        const envelope = Math.sin((gustElapsed / gustDuration) * Math.PI);
        windSpeed = WIND_BASE_SPEED * (1 + (gustStrength - 1) * envelope);
        return;
      }
    }
    windSpeed = WIND_BASE_SPEED;
    nextGustIn -= dt;
    if (nextGustIn <= 0 && crests.length > 0) {
      gustCrest = crests[Math.floor(Math.random() * crests.length)];
      gustElapsed = 0;
      gustDuration = randBetween(GUST_DURATION_MIN_S, GUST_DURATION_MAX_S);
      gustStrength = randBetween(GUST_STRENGTH_MIN, GUST_STRENGTH_MAX);
    }
  }

  function spawnSand(dt: number): void {
    if (crests.length === 0) return;
    ambientCarry += AMBIENT_SPAWNS_PER_S * dt;
    while (ambientCarry >= 1) {
      ambientCarry -= 1;
      const crest = crests[Math.floor(Math.random() * crests.length)];
      particles.spawn(crest.x + randBetween(-14, 6), crest.y, windSpeed);
    }
    if (gustCrest) {
      gustCarry += GUST_SPAWNS_PER_S * dt;
      while (gustCarry >= 1) {
        gustCarry -= 1;
        particles.spawn(
          gustCrest.x + randBetween(-24, 10),
          gustCrest.y + randBetween(-3, 3),
          windSpeed,
        );
      }
    }
  }

  function frame(ts: number): void {
    if (!running) return;
    const dt = Math.min(MAX_FRAME_DT_S, (ts - lastTs) / 1000 || 0);
    lastTs = ts;

    updateMoon(scrollProgress());
    updateWind(dt);
    spawnSand(dt);
    particles.step(dt, sceneWidth, sceneHeight);
    ctx!.clearRect(0, 0, sceneWidth, sceneHeight);
    particles.draw(ctx!, sandColors);

    rafId = requestAnimationFrame(frame);
  }

  function syncRunning(): void {
    const shouldRun =
      sceneVisible && !document.hidden && !reducedMotionQuery.matches;
    if (shouldRun && !running) {
      running = true;
      lastTs = performance.now();
      rafId = requestAnimationFrame(frame);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(rafId);
    }
  }

  function applyReducedMotion(): void {
    if (reducedMotionQuery.matches) {
      particles.clear();
      ctx!.clearRect(0, 0, sceneWidth, sceneHeight);
      lastPhaseStep = -1;
      updateMoon(0); // static full moon at the resting position
    }
    syncRunning();
  }

  // --- wire-up -------------------------------------------------------------
  measure();
  updateMoon(reducedMotionQuery.matches ? 0 : scrollProgress());

  let resizeTimer = 0;
  const resizeObserver = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      lastPhaseStep = -1;
      updateMoon(reducedMotionQuery.matches ? 0 : scrollProgress());
    }, 120);
  });
  resizeObserver.observe(root);

  new IntersectionObserver(
    (entries) => {
      sceneVisible = entries[0]?.isIntersecting ?? true;
      syncRunning();
    },
    { threshold: 0.02 },
  ).observe(root);

  document.addEventListener('visibilitychange', syncRunning);
  reducedMotionQuery.addEventListener('change', applyReducedMotion);

  new MutationObserver(() => {
    sandColors = readSandColors();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  syncRunning();
}
