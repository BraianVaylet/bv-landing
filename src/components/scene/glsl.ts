/**
 * Shared GLSL chunks. `DUNE_GLSL` defines the terrain height field used by
 * BOTH the dune mesh and the sand particles, so grains skim the exact same
 * crests the terrain renders — the two systems can never drift apart.
 */

/** Hash / value-noise / fbm / ridged-fbm toolbox. */
export const NOISE_GLSL = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.13, 9.71);
    a *= 0.5;
  }
  return v;
}

/* Sharp-crested dunes: inverted-abs octaves ("ridged" noise). */
float ridged(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    float n = vnoise(p);
    n = 1.0 - abs(2.0 * n - 1.0);
    n *= n;
    v += a * n;
    p = p * 2.11 + vec2(31.7, 11.3);
    a *= 0.45;
  }
  return v;
}
`;

/**
 * Dune height field. `wt` is the slow wind clock: it drives a domain warp so
 * the whole dune field breathes and migrates imperceptibly downwind (+x).
 * Requires NOISE_GLSL. Height range is [0, DUNE_AMP]-ish.
 */
export const DUNE_GLSL = /* glsl */ `
#define DUNE_AMP 3.1

float duneHeight(vec2 p, float wt) {
  vec2 q = p * vec2(0.052, 0.075); /* dunes elongated along the wind (x) */
  q.x -= wt * 0.012;
  vec2 w = vec2(
    fbm(q * 1.7 + vec2(wt * 0.030, 0.0)),
    fbm(q * 1.7 + vec2(5.2, wt * 0.021))
  );
  q += (w - 0.5) * 0.65;
  float h = ridged(q);
  h += 0.16 * fbm(p * 0.11 + w);
  return h * DUNE_AMP;
}
`;
