/**
 * Sky backdrop: a large unlit plane far behind the terrain.
 *
 * Vertical theme gradient, analytic warm glow around the moon's position
 * (cheap in-scattering), a twinkling hash-grid star field, and a rare
 * shooting star — the last two fade out entirely in the light theme.
 */
import * as THREE from 'three';
import { NOISE_GLSL } from './glsl';
import type { SceneUniforms } from './theme';

const VERTEX = /* glsl */ `
varying vec3 vWorldPos;

void main() {
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uNight;
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
uniform vec3 uGlow;
uniform float uGlowA;
uniform vec3 uMoonPos;
uniform vec3 uMoonLit;

varying vec3 vWorldPos;

/* Distance from point p to segment ab, for the shooting star trail. */
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float t = clamp((vWorldPos.y + 12.0) / 95.0, 0.0, 1.0);
  vec3 col = mix(uSkyBottom, uSkyTop, smoothstep(0.0, 1.0, t));

  /* Faint drifting haze so the gradient never reads as flat. */
  float haze = fbm(vWorldPos.xy * 0.012 + vec2(uTime * 0.008, 0.0));
  col += (haze - 0.5) * 0.022;

  /* Warm scattering halo around the moon/sun. Night is wide and soft;
     day is tighter and dimmer so the sun disc reads as a focal point
     instead of bleaching the whole sky. */
  float md = distance(vWorldPos.xy, uMoonPos.xy);
  float scatterK = mix(0.0012, 0.00045, uNight);
  float scatter = exp(-md * md * scatterK);
  col += uGlow * scatter * uGlowA * mix(0.65, 0.9, uNight);

  /* Day: wispy clouds drifting downwind (+x), stretched along the wind —
     the daytime counterpart of the night's star field. On a pale sky
     clouds read through their warm shadowed body, not through white. */
  float dayF = 1.0 - uNight;
  vec2 cp = vec2(vWorldPos.x * 0.010 - uTime * 0.004, vWorldPos.y * 0.035);
  float cl = fbm(cp + fbm(cp * 2.1) * 0.35);
  float cloudBand = smoothstep(0.16, 0.5, t);
  float body = smoothstep(0.52, 0.78, cl) * cloudBand * dayF;
  vec3 cloudTone = mix(uSkyTop * 0.9, uGlow, 0.35);
  col = mix(col, cloudTone, body * 0.5);
  /* Sunlit top edge of each wisp. */
  float edge = smoothstep(0.66, 0.80, cl) * cloudBand * dayF;
  col = mix(col, vec3(1.0, 0.99, 0.95), edge * 0.55);

  /* Star field: one candidate star per grid cell, few survive. */
  vec2 cellUv = vWorldPos.xy * 0.16;
  vec2 cell = floor(cellUv);
  vec2 f = fract(cellUv);
  float star = hash12(cell);
  vec2 starPos = vec2(hash12(cell + 7.1), hash12(cell + 3.7));
  float d = length(f - starPos);
  float twinkle = 0.55 + 0.45 * sin(uTime * (1.0 + star * 2.5) + star * 40.0);
  float starMask = step(0.91, star) * smoothstep(0.06, 0.0, d);
  /* Stars only live in the upper sky and at night. */
  float starField = starMask * twinkle * smoothstep(0.25, 0.6, t) * uNight;
  col += uMoonLit * starField * 0.85;

  /* Shooting star: one short streak every ~11s, night only. */
  float period = 11.0;
  float k = floor(uTime / period);
  float lt = fract(uTime / period);
  float r1 = hash12(vec2(k, 1.7));
  float r2 = hash12(vec2(k, 9.3));
  vec2 a = vec2(mix(-90.0, 90.0, r1), mix(55.0, 80.0, r2));
  vec2 dir = normalize(vec2(mix(0.5, 1.0, r2), -mix(0.25, 0.5, r1)));
  float travel = smoothstep(0.0, 0.16, lt);
  vec2 head = a + dir * travel * 70.0;
  vec2 tail = head - dir * 9.0;
  float sd = segDist(vWorldPos.xy, tail, head);
  float alive = step(lt, 0.16) * smoothstep(0.16, 0.10, lt);
  float streak = exp(-sd * sd * 2.2) * alive * uNight;
  col += uMoonLit * streak * 0.8;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createSky(uniforms: SceneUniforms): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(680, 300);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uNight: uniforms.uNight,
      uSkyTop: uniforms.uSkyTop,
      uSkyBottom: uniforms.uSkyBottom,
      uGlow: uniforms.uGlow,
      uGlowA: uniforms.uGlowA,
      uMoonPos: uniforms.uMoonPos,
      uMoonLit: uniforms.uMoonLit,
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 55, -140);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}
