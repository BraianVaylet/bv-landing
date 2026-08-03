/**
 * Dune terrain: one continuous plane displaced in the vertex shader by the
 * shared `duneHeight` field (ridged fbm + wind-driven domain warp).
 *
 * Fragment shading is fully stylised and moonlit: a 6-stop depth ramp built
 * from the theme's dune colors, wrap-diffuse keyed to the moon direction,
 * crest highlights, twinkling sand glints, a wind-blown sand veil sweeping
 * the crests, and exponential fog into the sky horizon.
 */
import * as THREE from 'three';
import { DUNE_GLSL, NOISE_GLSL } from './glsl';
import type { SceneUniforms } from './theme';

/** World-space extents shared with the sand particle system. */
export const TERRAIN = {
  width: 300,
  depth: 150,
  /** Nearest z edge (behind the camera) and farthest z edge. */
  zNear: 18,
  zFar: -132,
  fogDensity: 0.0135,
} as const;

const VERTEX = /* glsl */ `
${NOISE_GLSL}
${DUNE_GLSL}

uniform float uWindTime;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vHeight;
varying float vDist;

void main() {
  vec3 p = position;
  float h = duneHeight(p.xz, uWindTime);
  p.y = h;

  /* Forward-difference normal from the same height field. */
  float e = 1.1;
  float hx = duneHeight(p.xz + vec2(e, 0.0), uWindTime);
  float hz = duneHeight(p.xz + vec2(0.0, e), uWindTime);
  vNormal = normalize(vec3(h - hx, e, h - hz));

  vWorldPos = (modelMatrix * vec4(p, 1.0)).xyz;
  vHeight = h / DUNE_AMP;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uWindDist;
uniform float uSandAmount;
uniform vec3 uMoonDir;
uniform float uMoonLight;
uniform float uNight;
uniform vec3 uFog;
uniform vec3 uSandA;
uniform vec3 uSandB;
uniform vec3 uDuneStops[6];

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vHeight;
varying float vDist;

vec3 depthRamp(float t) {
  vec3 c = mix(uDuneStops[0], uDuneStops[1], smoothstep(0.00, 0.14, t));
  c = mix(c, uDuneStops[2], smoothstep(0.14, 0.30, t));
  c = mix(c, uDuneStops[3], smoothstep(0.30, 0.52, t));
  c = mix(c, uDuneStops[4], smoothstep(0.52, 0.74, t));
  c = mix(c, uDuneStops[5], smoothstep(0.74, 0.95, t));
  return c;
}

void main() {
  vec3 n = normalize(vNormal);
  /* Fine surface grain perturbs the normal just enough to feel like sand. */
  float grain = vnoise(vWorldPos.xz * 6.0) - 0.5;
  n = normalize(n + vec3(grain * 0.16, 0.0, grain * 0.12));

  float depthT = clamp((18.0 - vWorldPos.z) / 150.0, 0.0, 1.0);
  vec3 base = depthRamp(depthT);

  /* Moonlit wrap diffuse: harsher contrast at night, flatter by day. */
  float diff = clamp(dot(n, uMoonDir), 0.0, 1.0);
  float wrap = diff * 0.65 + 0.35;
  float ambient = mix(0.78, 0.44, uNight);
  float direct = mix(0.42, 0.92, uNight);
  vec3 col = base * (ambient + direct * wrap * uMoonLight);

  /* Lee slopes (facing away from the wind, -x normals) fall into shadow. */
  float lee = smoothstep(0.15, 0.7, -n.x);
  col *= 1.0 - lee * mix(0.10, 0.22, uNight);

  /* Crest light: ridge tops catch the moon. */
  float crest = smoothstep(0.68, 0.98, vHeight) * (0.35 + 0.65 * diff);
  col = mix(col, uSandA, crest * 0.30);

  /* Sand glitter: sparse cells twinkling in discrete time steps. */
  float cell = hash12(floor(vWorldPos.xz * 9.0) + floor(uTime * 2.5) * 0.371);
  float glint = step(0.9982, cell) * diff * smoothstep(60.0, 12.0, vDist);
  col += uSandB * glint * mix(0.6, 1.6, uNight);

  /* Wind veil: streaks of airborne sand raking over the crests, pulsing
     with the gusts. Stretched along x = the wind direction. */
  float streak = fbm(vec2(
    vWorldPos.x * 0.055 - uWindDist * 0.055,
    vWorldPos.z * 0.45
  ));
  streak = smoothstep(0.52, 0.95, streak);
  float veil = streak * smoothstep(0.45, 0.95, vHeight) * uSandAmount;
  col = mix(col, uSandA, veil * 0.42);

  /* Exponential distance fog into the horizon. */
  float fog = 1.0 - exp(-vDist * ${TERRAIN.fogDensity.toFixed(4)});
  col = mix(col, uFog, fog);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createDunes(
  uniforms: SceneUniforms,
  segments: { x: number; z: number },
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    TERRAIN.width,
    TERRAIN.depth,
    segments.x,
    segments.z,
  );
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, (TERRAIN.zNear + TERRAIN.zFar) / 2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uWindTime: uniforms.uWindTime,
      uWindDist: uniforms.uWindDist,
      uSandAmount: uniforms.uSandAmount,
      uMoonDir: uniforms.uMoonDir,
      uMoonLight: uniforms.uMoonLight,
      uNight: uniforms.uNight,
      uFog: uniforms.uFog,
      uSandA: uniforms.uSandA,
      uSandB: uniforms.uSandB,
      uDuneStops: uniforms.uDuneStops,
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; // one draw call, always in view
  return mesh;
}
