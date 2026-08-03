/**
 * Bridge between the site theme (CSS custom properties on the scene root)
 * and the WebGL scene. All materials share the SAME uniform objects returned
 * by `createSceneUniforms`, so a theme swap only rewrites values in place and
 * every shader picks it up on the next frame.
 */
import * as THREE from 'three';

export interface SceneUniforms {
  uTime: { value: number };
  uWindTime: { value: number };
  uWindDist: { value: number };
  uSandAmount: { value: number };
  uSandLift: { value: number };
  uMoonDir: { value: THREE.Vector3 };
  uMoonPos: { value: THREE.Vector3 };
  uPhase: { value: number };
  uMoonLight: { value: number };
  uNight: { value: number };
  uSkyTop: { value: THREE.Color };
  uSkyBottom: { value: THREE.Color };
  uFog: { value: THREE.Color };
  uMoonLit: { value: THREE.Color };
  uMoonDark: { value: THREE.Color };
  uMoonDarkA: { value: number };
  uGlow: { value: THREE.Color };
  uGlowA: { value: number };
  uSandA: { value: THREE.Color };
  uSandB: { value: THREE.Color };
  uDuneStops: { value: THREE.Color[] };
  uPointScale: { value: number };
}

export function createSceneUniforms(): SceneUniforms {
  return {
    uTime: { value: 0 },
    uWindTime: { value: 0 },
    uWindDist: { value: 0 },
    uSandAmount: { value: 0.4 },
    uSandLift: { value: 0.3 },
    uMoonDir: { value: new THREE.Vector3(0.3, 0.5, 0.8).normalize() },
    uMoonPos: { value: new THREE.Vector3(14, 15, -95) },
    uPhase: { value: 0 },
    uMoonLight: { value: 1 },
    uNight: { value: 1 },
    uSkyTop: { value: new THREE.Color('#17150f') },
    uSkyBottom: { value: new THREE.Color('#201e1a') },
    uFog: { value: new THREE.Color('#201e1a') },
    uMoonLit: { value: new THREE.Color('#f1eee6') },
    uMoonDark: { value: new THREE.Color('#f1eee6') },
    uMoonDarkA: { value: 0.09 },
    uGlow: { value: new THREE.Color('#ebad97') },
    uGlowA: { value: 0.28 },
    uSandA: { value: new THREE.Color('#de876b') },
    uSandB: { value: new THREE.Color('#ebad97') },
    uDuneStops: {
      value: [
        new THREE.Color('#c96442'),
        new THREE.Color('#a5492b'),
        new THREE.Color('#8e3a22'),
        new THREE.Color('#3d3933'),
        new THREE.Color('#35322c'),
        new THREE.Color('#2e2b26'),
      ],
    },
    uPointScale: { value: 1 },
  };
}

interface ParsedColor {
  color: THREE.Color;
  alpha: number;
}

/** Parse `#hex` or `rgb()/rgba()` into working-space color + alpha. */
function parseColor(raw: string, fallback: string): ParsedColor {
  const value = raw.trim() || fallback;
  const rgba = value.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/,
  );
  const color = new THREE.Color();
  if (rgba) {
    color.setRGB(
      Number(rgba[1]) / 255,
      Number(rgba[2]) / 255,
      Number(rgba[3]) / 255,
      THREE.SRGBColorSpace,
    );
    return { color, alpha: rgba[4] === undefined ? 1 : Number(rgba[4]) };
  }
  color.set(value);
  return { color, alpha: 1 };
}

export interface ThemeInfo {
  /** 1 = dark/night theme, 0 = light/day. Drives stars, bloom, contrast. */
  night: number;
}

/** Read the scene CSS variables into the shared uniforms. */
export function applyThemeToUniforms(
  root: HTMLElement,
  u: SceneUniforms,
): ThemeInfo {
  const styles = getComputedStyle(root);
  const read = (name: string, fallback: string) =>
    parseColor(styles.getPropertyValue(name), fallback);

  const skyTop = read('--scene-sky-top', '#17150f');
  u.uSkyTop.value.copy(skyTop.color);
  u.uSkyBottom.value.copy(read('--scene-sky-bottom', '#201e1a').color);
  u.uFog.value.copy(u.uSkyBottom.value);
  u.uMoonLit.value.copy(read('--scene-moon-lit', '#f1eee6').color);
  const moonDark = read('--scene-moon-dark', 'rgba(241, 238, 230, 0.09)');
  u.uMoonDark.value.copy(moonDark.color);
  u.uMoonDarkA.value = moonDark.alpha;
  const glow = read('--scene-moon-glow', 'rgba(235, 173, 151, 0.28)');
  u.uGlow.value.copy(glow.color);
  u.uGlowA.value = glow.alpha;
  u.uSandA.value.copy(read('--scene-sand-a', '#de876b').color);
  u.uSandB.value.copy(read('--scene-sand-b', '#ebad97').color);

  const stops = u.uDuneStops.value;
  stops[0]!.copy(read('--scene-dune-near-3', '#c96442').color);
  stops[1]!.copy(read('--scene-dune-near-2', '#a5492b').color);
  stops[2]!.copy(read('--scene-dune-near-1', '#8e3a22').color);
  stops[3]!.copy(read('--scene-dune-far-3', '#3d3933').color);
  stops[4]!.copy(read('--scene-dune-far-2', '#35322c').color);
  stops[5]!.copy(read('--scene-dune-far-1', '#2e2b26').color);

  // Perceived luminance of the sky decides night vs day styling.
  const hsl = { h: 0, s: 0, l: 0 };
  skyTop.color.getHSL(hsl);
  const night = hsl.l < 0.5 ? 1 : 0;
  u.uNight.value = night;
  return { night };
}
