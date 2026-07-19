/**
 * Dune geometry — single source of truth shared by the SVG markup (build
 * time) and the canvas particle system (client), so painted dunes and sand
 * spawn points always match.
 *
 * Coordinates live in a fixed viewBox; the SVGs stretch to the hero with
 * `preserveAspectRatio="none"` and the client maps viewBox -> pixels from the
 * rendered rects.
 */

export const DUNE_VIEWBOX = { width: 1440, height: 340 } as const;

export interface DuneSpec {
  /** Crest x position in viewBox units. */
  cx: number;
  /** Crest height (y, smaller = taller) in viewBox units. */
  crestY: number;
  /** Horizontal reach of the windward (left, gentle) slope. */
  windwardW: number;
  /** Horizontal reach of the lee (right, steep) slope — wind blows L->R. */
  leeW: number;
  /** Scene CSS variable painting this dune. */
  colorVar: string;
}

export interface Dune extends DuneSpec {
  /** Closed SVG path (`d` attribute). */
  d: string;
  /** Sample points along the windward ridge, in viewBox units. */
  crests: ReadonlyArray<readonly [number, number]>;
}

const BASE_Y = DUNE_VIEWBOX.height;

/** Quadratic bezier point at t for P0 -> C -> P1. */
function quadPoint(
  t: number,
  p0: readonly [number, number],
  c: readonly [number, number],
  p1: readonly [number, number],
): [number, number] {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
    u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
  ];
}

/**
 * Build one dune: gentle quadratic rise to the crest (windward), steeper
 * quadratic drop (lee). Sand lifts off near the crest, so crest samples are
 * taken from the last stretch of the windward curve plus the crest itself.
 */
function buildDune(spec: DuneSpec): Dune {
  const { cx, crestY, windwardW, leeW } = spec;
  const start: [number, number] = [cx - windwardW, BASE_Y];
  const crest: [number, number] = [cx, crestY];
  const end: [number, number] = [cx + leeW, BASE_Y];
  // Control near crest height keeps the top rounded and the base gentle.
  const windCtrl: [number, number] = [
    cx - windwardW * 0.38,
    crestY + (BASE_Y - crestY) * 0.22,
  ];
  const leeCtrl: [number, number] = [
    cx + leeW * 0.42,
    crestY + (BASE_Y - crestY) * 0.52,
  ];

  const d =
    `M ${start[0]} ${start[1]} ` +
    `Q ${windCtrl[0].toFixed(1)} ${windCtrl[1].toFixed(1)} ${crest[0]} ${crest[1]} ` +
    `Q ${leeCtrl[0].toFixed(1)} ${leeCtrl[1].toFixed(1)} ${end[0]} ${end[1]} Z`;

  const crestSampleTs = [0.78, 0.88, 0.96];
  const crests = [
    ...crestSampleTs.map((t) => quadPoint(t, start, windCtrl, crest)),
    crest,
  ] as const;

  return { ...spec, d, crests };
}

/** Background ridge — big, soft, muted earth tones. */
export const FAR_DUNES: readonly Dune[] = [
  { cx: 290, crestY: 150, windwardW: 520, leeW: 420, colorVar: '--scene-dune-far-1' },
  { cx: 860, crestY: 105, windwardW: 560, leeW: 470, colorVar: '--scene-dune-far-2' },
  { cx: 1360, crestY: 165, windwardW: 500, leeW: 380, colorVar: '--scene-dune-far-3' },
].map(buildDune);

/** Foreground dunes — the accent (brasa) family, different sizes. */
export const NEAR_DUNES: readonly Dune[] = [
  { cx: 250, crestY: 130, windwardW: 430, leeW: 270, colorVar: '--scene-dune-near-1' },
  { cx: 830, crestY: 75, windwardW: 530, leeW: 310, colorVar: '--scene-dune-near-2' },
  { cx: 1300, crestY: 150, windwardW: 470, leeW: 290, colorVar: '--scene-dune-near-3' },
].map(buildDune);
