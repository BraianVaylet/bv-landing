/**
 * Sand particle system — fixed-size pool over flat typed arrays.
 *
 * No allocations inside the frame loop: dead particles are removed by
 * swapping with the last active slot. Rendering batches by color (two sand
 * tones) so each frame does at most two fillStyle changes.
 */

export interface SandColors {
  a: string;
  b: string;
}

/** Wind speeds in px/s; sizes in px (already DPR-scaled by the context). */
const UPWARD_KICK_MIN = 14;
const UPWARD_KICK_MAX = 42;
const GRAVITY = 26;
const DRAG_JITTER = 0.55;
const LIFE_MIN_S = 1.4;
const LIFE_MAX_S = 3.0;
const SIZE_MIN = 1;
const SIZE_MAX = 2.4;

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class SandParticles {
  private readonly x: Float32Array;
  private readonly y: Float32Array;
  private readonly vx: Float32Array;
  private readonly vy: Float32Array;
  private readonly age: Float32Array;
  private readonly ttl: Float32Array;
  private readonly size: Float32Array;
  private readonly tone: Uint8Array;
  private active = 0;

  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.age = new Float32Array(capacity);
    this.ttl = new Float32Array(capacity);
    this.size = new Float32Array(capacity);
    this.tone = new Uint8Array(capacity);
  }

  get activeCount(): number {
    return this.active;
  }

  /** Spawn one grain at (px, py); silently ignored when the pool is full. */
  spawn(px: number, py: number, windSpeed: number): void {
    if (this.active >= this.capacity) return;
    const i = this.active++;
    this.x[i] = px;
    this.y[i] = py;
    // Grains ride the wind with individual spread, kicked slightly upward.
    this.vx[i] = windSpeed * randBetween(1 - DRAG_JITTER, 1 + DRAG_JITTER);
    this.vy[i] = -randBetween(UPWARD_KICK_MIN, UPWARD_KICK_MAX);
    this.age[i] = 0;
    this.ttl[i] = randBetween(LIFE_MIN_S, LIFE_MAX_S);
    this.size[i] = randBetween(SIZE_MIN, SIZE_MAX);
    this.tone[i] = Math.random() < 0.5 ? 0 : 1;
  }

  /** Advance physics by dt seconds. Frees expired/off-screen grains. */
  step(dt: number, width: number, height: number): void {
    let i = 0;
    while (i < this.active) {
      this.age[i] += dt;
      if (
        this.age[i] >= this.ttl[i] ||
        this.x[i] > width + 8 ||
        this.y[i] > height + 8
      ) {
        this.release(i);
        continue; // the swapped-in particle re-runs at index i
      }
      this.vy[i] += GRAVITY * dt;
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;
      i++;
    }
  }

  /** Draw all grains, batched per tone. Caller sets ctx transform/clear. */
  draw(ctx: CanvasRenderingContext2D, colors: SandColors): void {
    for (let toneIndex = 0; toneIndex < 2; toneIndex++) {
      ctx.fillStyle = toneIndex === 0 ? colors.a : colors.b;
      for (let i = 0; i < this.active; i++) {
        if (this.tone[i] !== toneIndex) continue;
        // Fade out over the last 40% of the grain's life.
        const lifeLeft = 1 - this.age[i] / this.ttl[i];
        ctx.globalAlpha = Math.min(1, lifeLeft / 0.4);
        const s = this.size[i];
        ctx.fillRect(this.x[i], this.y[i], s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.active = 0;
  }

  private release(i: number): void {
    const last = --this.active;
    if (i === last) return;
    this.x[i] = this.x[last];
    this.y[i] = this.y[last];
    this.vx[i] = this.vx[last];
    this.vy[i] = this.vy[last];
    this.age[i] = this.age[last];
    this.ttl[i] = this.ttl[last];
    this.size[i] = this.size[last];
    this.tone[i] = this.tone[last];
  }
}
