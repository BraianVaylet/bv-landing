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

  /* Warm scattering halo around the moon, wide and soft. */
  float md = distance(vWorldPos.xy, uMoonPos.xy);
  float scatter = exp(-md * md * 0.00045);
  col += uGlow * scatter * uGlowA * 0.9;

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
