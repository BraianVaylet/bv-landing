/**
 * Post-processing chain: render -> bloom (moon, glints, halo) -> sRGB output
 * -> final grade (film grain + gradient dithering, vignette, whisper of
 * chromatic aberration at the edges).
 *
 * Grain doubles as a dither, killing the banding a slow sky gradient would
 * otherwise show on 8-bit displays.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uGrain: { value: 0.045 },
    uVignette: { value: 0.32 },
    uCA: { value: 0.0016 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;
    uniform float uCA;
    varying vec2 vUv;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec2 fromCenter = vUv - 0.5;
      float r = length(fromCenter);

      /* Edge-weighted chromatic aberration. */
      vec2 shift = fromCenter * uCA * r;
      vec3 col = vec3(
        texture2D(tDiffuse, vUv - shift).r,
        texture2D(tDiffuse, vUv).g,
        texture2D(tDiffuse, vUv + shift).b
      );

      /* Animated grain, centered on zero so brightness is preserved. */
      float g = hash(vUv * vec2(1013.0, 771.0) + fract(uTime) * 17.0) - 0.5;
      col += g * uGrain;

      /* Vignette. */
      col *= 1.0 - smoothstep(0.42, 0.86, r) * uVignette;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export interface PostChain {
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  grade: ShaderPass;
  setSize(width: number, height: number): void;
  setNight(night: number): void;
}

export function createPost(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): PostChain {
  // NOTE: no MSAA (`samples`) on the composer target — the multisample
  // resolve of a HalfFloat target is buggy on some ANGLE/D3D drivers and
  // intermittently poisons the frame (full-screen black flashes once bloom
  // smears it). FXAA below covers the aliasing instead.
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);

  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(size.clone(), 0.75, 0.65, 0.82);
  composer.addPass(bloom);

  composer.addPass(new OutputPass());

  const fxaa = new ShaderPass(FXAAShader);
  composer.addPass(fxaa);

  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);

  return {
    composer,
    bloom,
    grade,
    setSize(width, height) {
      composer.setSize(width, height);
      bloom.resolution.set(width, height);
      const dpr = renderer.getPixelRatio();
      (fxaa.material.uniforms['resolution']!.value as THREE.Vector2).set(
        1 / (width * dpr),
        1 / (height * dpr),
      );
    },
    setNight(night) {
      // Day gets a real bloom too: the sun disc is pushed into HDR.
      bloom.strength = night > 0.5 ? 0.75 : 0.45;
      bloom.threshold = night > 0.5 ? 0.82 : 0.85;
      grade.uniforms.uGrain!.value = night > 0.5 ? 0.05 : 0.028;
      grade.uniforms.uVignette!.value = night > 0.5 ? 0.34 : 0.2;
    },
  };
}
