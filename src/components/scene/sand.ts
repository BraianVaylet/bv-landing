/**
 * GPU sand: thousands of grains as a single THREE.Points draw call with a
 * fully procedural vertex shader — zero per-frame CPU work per grain.
 *
 * Each grain owns a random seed; its position is a closed-form function of
 * the accumulated wind distance (uWindDist), so gusts accelerate every grain
 * coherently. Height rides the SAME duneHeight field as the terrain, so
 * grains hug real crests, hop in saltation arcs, and lift higher in gusts.
 * uSandAmount hides/reveals grains by seed threshold: calm air shows a
 * trickle, gusts unleash the swarm.
 */
import * as THREE from 'three';
import { DUNE_GLSL, NOISE_GLSL } from './glsl';
import type { SceneUniforms } from './theme';
import { TERRAIN } from './dunes';

const VERTEX = /* glsl */ `
${NOISE_GLSL}
${DUNE_GLSL}

attribute vec4 aSeed;
attribute float aSize;

uniform float uTime;
uniform float uWindTime;
uniform float uWindDist;
uniform float uSandAmount;
uniform float uSandLift;
uniform float uPointScale;

varying float vFade;
varying float vTone;

void main() {
  float span = ${TERRAIN.width.toFixed(1)};
  float speed = 0.75 + 0.55 * aSeed.w;
  float xNorm = fract(aSeed.x + uWindDist * speed / span);
  float x = mix(-span * 0.5, span * 0.5, xNorm);
  /* Lanes biased toward the camera so the foreground feels alive. */
  float z = mix(${TERRAIN.zFar.toFixed(1)} + 30.0, ${TERRAIN.zNear.toFixed(1)} - 4.0, pow(aSeed.y, 1.6));

  float h = duneHeight(vec2(x, z), uWindTime);

  /* Saltation: grains arc as they bounce downwind; gusts lift them higher. */
  float hop = abs(sin(x * 0.35 + aSeed.z * 6.2832));
  float lift = (0.12 + 1.7 * fract(aSeed.z * 7.31)) * uSandLift;
  float bob = sin(uTime * (1.2 + 2.6 * aSeed.w) + aSeed.z * 6.2832) * 0.12;
  vec3 p = vec3(x, h + 0.14 + hop * lift + bob, z);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = -mv.z;
  gl_PointSize = clamp(uPointScale * aSize / dist, 1.0, 7.0);

  /* Visibility: population threshold + wrap fade + distance fade. */
  float vis = step(fract(aSeed.w * 13.73), uSandAmount);
  float wrapFade = smoothstep(0.0, 0.05, xNorm) * smoothstep(1.0, 0.95, xNorm);
  float distFade = exp(-dist * 0.012);
  vFade = vis * wrapFade * distFade;
  vTone = fract(aSeed.x * 9.17);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uSandA;
uniform vec3 uSandB;
uniform float uNight;

varying float vFade;
varying float vTone;

void main() {
  if (vFade < 0.004) discard;
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.12, d) * vFade * mix(0.68, 0.8, uNight);
  vec3 col = mix(uSandA, uSandB, step(0.5, vTone));
  gl_FragColor = vec4(col, alpha);
}
`;

export function createSand(
  uniforms: SceneUniforms,
  count: number,
): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3); // required by three, unused
  const seeds = new Float32Array(count * 4);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seeds[i * 4] = Math.random();
    seeds[i * 4 + 1] = Math.random();
    seeds[i * 4 + 2] = Math.random();
    seeds[i * 4 + 3] = Math.random();
    sizes[i] = 26 + Math.random() * 44;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uWindTime: uniforms.uWindTime,
      uWindDist: uniforms.uWindDist,
      uSandAmount: uniforms.uSandAmount,
      uSandLift: uniforms.uSandLift,
      uPointScale: uniforms.uPointScale,
      uSandA: uniforms.uSandA,
      uSandB: uniforms.uSandB,
      uNight: uniforms.uNight,
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}
