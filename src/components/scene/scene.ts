/**
 * Dune scene orchestrator (WebGL). One rAF loop drives:
 *  - the scroll-linked moon (real phase terminator + descent behind dunes),
 *  - the wind (gust envelope -> accumulated wind distance uniform),
 *  - GPU sand, breathing dunes, sky, and the post chain.
 *
 * Lifecycle mirrors the old canvas scene: the loop only runs while the scene
 * is on screen, the tab is visible and the user accepts motion.
 * `prefers-reduced-motion` renders a static frame (full moon, no sand).
 * If WebGL init fails the `data-webgl` attribute is never set and the
 * server-rendered SVG scene stays visible.
 */
import * as THREE from 'three';
import { createSceneUniforms, applyThemeToUniforms } from './theme';
import { createDunes } from './dunes';
import { createSand } from './sand';
import { createMoon } from './moonMesh';
import { createSky } from './sky';
import { createPost } from './post';

const DPR_CAP_DESKTOP = 2;
const DPR_CAP_MOBILE = 1.75;
const MAX_FRAME_DT_S = 0.05;
const MOBILE_MAX_WIDTH_PX = 768;

/** Wind model in world units/s. Gusts accelerate every grain coherently. */
const WIND_BASE_SPEED = 2.1;
const GUST_EVERY_MIN_S = 4;
const GUST_EVERY_MAX_S = 7;
const GUST_DURATION_MIN_S = 1.4;
const GUST_DURATION_MAX_S = 2.4;
const GUST_STRENGTH_MIN = 2.4;
const GUST_STRENGTH_MAX = 3.4;
const SAND_CALM = 0.34;

/**
 * Moon/sun travel (world units) as the user scrolls through the hero.
 * z sits BEHIND the whole terrain (which ends at z = -132), so every dune
 * row occludes the disc as it sets — it can never float over a far dune.
 */
const MOON_START = new THREE.Vector3(18, 21, -136);
const MOON_END = new THREE.Vector3(6, -9, -136);
/** The dune field pivot the moon "lights" from wherever it is. */
const LIGHT_TARGET = new THREE.Vector3(0, 0, -45);

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function initDuneScene(root: HTMLElement): void {
  const hero = root.closest<HTMLElement>('[data-hero]') ?? root.parentElement;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-scene-webgl]');
  if (!hero || !canvas) return;

  const isMobile = window.matchMedia(
    `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`,
  ).matches;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return; // no WebGL: the SVG scene stays
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);

  const uniforms = createSceneUniforms();
  scene.add(createDunes(uniforms, isMobile ? { x: 160, z: 96 } : { x: 280, z: 150 }));
  scene.add(createSand(uniforms, isMobile ? 1600 : 4500));
  scene.add(createSky(uniforms));
  const moon = createMoon(uniforms);
  scene.add(moon.group);

  const post = createPost(renderer, scene, camera);
  post.setNight(applyThemeToUniforms(root, uniforms).night);

  // --- layout / scroll caches ---------------------------------------------
  let heroTop = 0;
  let scrollRange = 1;
  /** False until a measure succeeds (init can happen while display-hidden). */
  let measured = false;

  function measure(): void {
    const rect = root.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    measured = true;
    heroTop = hero!.getBoundingClientRect().top + window.scrollY;
    scrollRange = Math.max(1, hero!.offsetHeight - window.innerHeight);

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      isMobile ? DPR_CAP_MOBILE : DPR_CAP_DESKTOP,
    );
    renderer.setPixelRatio(dpr);
    renderer.setSize(rect.width, rect.height, false);
    post.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    uniforms.uPointScale.value = (rect.height * dpr) / 720;
  }

  function scrollProgress(): number {
    const progress = (window.scrollY - heroTop) / scrollRange;
    return Math.min(1, Math.max(0, progress));
  }

  // --- animation state -----------------------------------------------------
  let rafId = 0;
  let lastTs = 0;
  let running = false;
  let sceneVisible = true;
  let windSpeed = WIND_BASE_SPEED;
  let gustElapsed = 0;
  let gustDuration = 0;
  let gustStrength = 1;
  let gusting = false;
  let nextGustIn = randBetween(GUST_EVERY_MIN_S, GUST_EVERY_MAX_S);
  let pointerX = 0;
  let pointerY = 0;
  let parallaxX = 0;
  let parallaxY = 0;

  function updateWind(dt: number): void {
    let envelope = 0;
    if (gusting) {
      gustElapsed += dt;
      if (gustElapsed >= gustDuration) {
        gusting = false;
        nextGustIn = randBetween(GUST_EVERY_MIN_S, GUST_EVERY_MAX_S);
      } else {
        envelope = Math.sin((gustElapsed / gustDuration) * Math.PI);
      }
    } else {
      nextGustIn -= dt;
      if (nextGustIn <= 0) {
        gusting = true;
        gustElapsed = 0;
        gustDuration = randBetween(GUST_DURATION_MIN_S, GUST_DURATION_MAX_S);
        gustStrength = randBetween(GUST_STRENGTH_MIN, GUST_STRENGTH_MAX);
      }
    }
    windSpeed = WIND_BASE_SPEED * (1 + (gustStrength - 1) * envelope);
    uniforms.uWindDist.value += windSpeed * dt;

    const sandTarget = SAND_CALM + envelope * (0.95 - SAND_CALM);
    const amount = uniforms.uSandAmount.value;
    uniforms.uSandAmount.value = amount + (sandTarget - amount) * Math.min(1, dt * 2.2);
    uniforms.uSandLift.value = 0.22 + envelope * 1.1;
  }

  function updateScroll(progress: number): void {
    uniforms.uPhase.value = progress * 0.96;
    uniforms.uMoonLight.value = 1 - progress * 0.38;
    uniforms.uMoonPos.value.lerpVectors(MOON_START, MOON_END, progress);
    moon.group.position.copy(uniforms.uMoonPos.value);
    moon.group.lookAt(camera.position);
    uniforms.uMoonDir.value
      .copy(uniforms.uMoonPos.value)
      .sub(LIGHT_TARGET)
      .normalize();

    camera.position.set(
      parallaxX * 0.55,
      4.3 - progress * 0.6 + parallaxY * 0.3,
      8 - progress * 1.2,
    );
    camera.lookAt(parallaxX * 0.35, 6.2 - progress * 3.4, -60);
  }

  function frame(ts: number): void {
    if (!running) return;
    if (!measured) measure();
    const dt = Math.min(MAX_FRAME_DT_S, (ts - lastTs) / 1000 || 0);
    lastTs = ts;

    uniforms.uTime.value += dt;
    uniforms.uWindTime.value += dt;
    parallaxX += (pointerX - parallaxX) * Math.min(1, dt * 3);
    parallaxY += (pointerY - parallaxY) * Math.min(1, dt * 3);

    updateWind(dt);
    updateScroll(scrollProgress());
    post.composer.render();

    rafId = requestAnimationFrame(frame);
  }

  /** Static frame for reduced motion: resting full moon, still air. */
  function renderStatic(): void {
    uniforms.uSandAmount.value = 0;
    updateScroll(0);
    post.composer.render();
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
    syncRunning();
    if (reducedMotionQuery.matches) renderStatic();
  }

  // --- wire-up -------------------------------------------------------------
  measure();
  if (reducedMotionQuery.matches) renderStatic();
  root.setAttribute('data-webgl', 'on');

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    running = false;
    cancelAnimationFrame(rafId);
    root.removeAttribute('data-webgl'); // fall back to the SVG scene
  });

  let resizeTimer = 0;
  const resizeObserver = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      if (!running) renderStatic();
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

  // Subtle parallax; pointermove fires only on mouse-ish inputs we care about.
  if (!isMobile) {
    window.addEventListener(
      'pointermove',
      (event) => {
        pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (event.clientY / window.innerHeight - 0.5) * -2;
      },
      { passive: true },
    );
  }

  new MutationObserver(() => {
    post.setNight(applyThemeToUniforms(root, uniforms).night);
    if (!running) renderStatic();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  syncRunning();
}
