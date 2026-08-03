/**
 * The celestial body: a camera-facing disc whose fragment shader lights a
 * virtual sphere. At night it is the MOON — a real terminator (soft phase
 * boundary that rotates with scroll), procedural craters, translucent
 * earthshine. In the light theme (day) it is the SUN — no phases, a smooth
 * warm disc with a golden limb, bright enough to bloom.
 *
 * A second additive disc renders the wide halo. Both are depth-tested and
 * placed BEHIND the whole terrain, so every dune occludes them as they set.
 */
import * as THREE from 'three';
import { NOISE_GLSL } from './glsl';
import type { SceneUniforms } from './theme';

export const MOON_WORLD_RADIUS = 7.6;
const HALO_SCALE = 3.4;

const VERTEX = /* glsl */ `
varying vec2 vLocal;

void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MOON_FRAGMENT = /* glsl */ `
${NOISE_GLSL}

uniform float uPhase;
uniform float uNight;
uniform vec3 uMoonLit;
uniform vec3 uMoonDark;
uniform float uMoonDarkA;
uniform vec3 uGlow;

varying vec2 vLocal;

void main() {
  vec2 d = vLocal / ${MOON_WORLD_RADIUS.toFixed(2)};
  float r2 = dot(d, d);
  if (r2 > 1.0) discard;

  /* Reconstruct the sphere normal from the disc. */
  vec3 n = vec3(d, sqrt(max(0.0, 1.0 - r2)));

  float day = 1.0 - uNight;

  /* Phase 0 = full (sun behind viewer), 1 = new (sun behind moon).
     By day the disc IS the sun: fully lit, no terminator. */
  float ang = uPhase * 3.14159265;
  vec3 sunDir = normalize(vec3(sin(ang), 0.10, cos(ang)));
  float lit = smoothstep(-0.06, 0.14, dot(n, sunDir));
  lit = mix(lit, 1.0, day);

  /* Procedural maria + craters darken the lit surface (moon only —
     the sun stays a smooth disc). */
  float maria = fbm(n.xy * 2.6 + 4.7);
  float craters = fbm(n.xy * 7.0 + 13.1);
  float surface =
    1.0 - (maria * 0.22 + smoothstep(0.62, 0.9, craters) * 0.12) * uNight;

  vec3 litCol = uMoonLit * surface;
  /* Night: warm tint right on the terminator, like low-angle sunlight. */
  float edgeGlow = smoothstep(0.0, 0.35, lit) * (1.0 - smoothstep(0.35, 1.0, lit));
  litCol = mix(litCol, uGlow, edgeGlow * 0.25 * uNight);
  /* Day: golden body + limb darkening, pushed well into HDR — the golden
     tint is what keeps the disc readable against the pale beige sky, and
     the HDR excess feeds the bloom ring. */
  litCol = mix(litCol, uGlow, day * (0.28 + pow(1.0 - n.z, 2.0) * 0.55));
  litCol *= 1.0 + day * 0.75;

  /* Earthshine: the dark side is a faint translucent ghost disc (the sky
     and stars show through), the lit side is opaque. */
  float ghostA = uMoonDarkA * mix(1.0, 2.2, uNight) * (0.6 + 0.4 * surface);
  vec3 col = mix(uMoonDark, litCol, lit);
  float bodyA = mix(ghostA, 1.0, lit);

  /* Soft limb so the disc never aliases against the sky. */
  float limb = smoothstep(1.0, 0.972, r2);
  gl_FragColor = vec4(col, bodyA * limb);
}
`;

const HALO_FRAGMENT = /* glsl */ `
uniform float uPhase;
uniform float uNight;
uniform vec3 uGlow;
uniform float uGlowA;

varying vec2 vLocal;

void main() {
  float r = length(vLocal) / ${(MOON_WORLD_RADIUS * HALO_SCALE).toFixed(2)};
  if (r > 1.0) discard;
  /* Night: the lit fraction of the disc scales the halo down as the moon
     wanes. Day: the sun always glows at full strength. */
  float litFrac = clamp(cos(uPhase * 3.14159265) * 0.5 + 0.5, 0.0, 1.0);
  litFrac = mix(litFrac, 1.0, 1.0 - uNight);
  float falloff = pow(1.0 - r, 2.6);
  float a = falloff * uGlowA * (0.25 + 0.75 * litFrac);
  gl_FragColor = vec4(uGlow * a, a);
}
`;

export interface MoonMeshes {
  group: THREE.Group;
  disc: THREE.Mesh;
  halo: THREE.Mesh;
}

export function createMoon(uniforms: SceneUniforms): MoonMeshes {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(MOON_WORLD_RADIUS, 56),
    new THREE.ShaderMaterial({
      uniforms: {
        uPhase: uniforms.uPhase,
        uNight: uniforms.uNight,
        uMoonLit: uniforms.uMoonLit,
        uMoonDark: uniforms.uMoonDark,
        uMoonDarkA: uniforms.uMoonDarkA,
        uGlow: uniforms.uGlow,
      },
      vertexShader: VERTEX,
      fragmentShader: MOON_FRAGMENT,
      transparent: true,
      depthWrite: false,
    }),
  );

  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(MOON_WORLD_RADIUS * HALO_SCALE, 48),
    new THREE.ShaderMaterial({
      uniforms: {
        uPhase: uniforms.uPhase,
        uNight: uniforms.uNight,
        uGlow: uniforms.uGlow,
        uGlowA: uniforms.uGlowA,
      },
      vertexShader: VERTEX,
      fragmentShader: HALO_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  halo.position.z = -0.5; // just behind the disc

  const group = new THREE.Group();
  group.add(halo);
  group.add(disc);
  return { group, disc, halo };
}
