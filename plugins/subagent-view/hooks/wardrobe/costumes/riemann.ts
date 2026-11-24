/**
 * Bernhard Riemann as in his 1863 portrait: receding dark hair, oval wire spectacles, a full beard over a white wing collar and black bow tie, and a charcoal frock coat, casting his zeta function along its critical line from his hand.
 */

import { INK, r } from "../claude";
import type { Costume } from "../claude";
import { mirror, SHIRT } from "./paint";

const HAIR = "#4A3D36";
const HAIRL = "#6E5F56";
const BEARD = "#6B4A36";
const BEARDL = "#94704F";
const WIRE = "#D4CEC2";
const COAT = "#3E3D43";
const COATD = "#2C2B30";
const COATL = "#5A5960";
const TROUSER = "#4A4446";
const SHOE = "#2C2829";
const SPELL = "#E8861A";
const SPELLL = "#FFD54A";

// The spell runs from t = 0, where ζ(½) ≈ −1.46 sits by Riemann's hand, to ζ's fifth zero on the critical line, so its tail leaves the hand and every loop closes on the zero above it.
const FIFTH_ZERO = 32.935062;
const ZERO = { x: 61, y: 35 };
// ζ's real axis points up from the zero at 6.2 units of the drawing to one of ζ, which puts ζ(½) at the hand and keeps the widest loop inside the drawing's right edge.
const SCALE = 6.2;

// Borwein's weights for η(s) = Σ (−1)^k (k+1)^−s = (1 − 2^(1−s)) ζ(s): 50 terms hold ζ(½ + it) far below the drawing's resolution up to t = 35, past which the error grows as e^(πt/2).
const ETA_WEIGHTS = (() => {
  const n = 50;
  // Partial sums of n(n+i−1)! 4^i / ((n−i)! (2i)!), whose terms each multiply the last by 4(n+i−1)(n−i+1) / (2i(2i−1)).
  const partials: number[] = [];
  let term = 1;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    if (i > 0) term *= (4 * (n + i - 1) * (n - i + 1)) / (2 * i * (2 * i - 1));
    sum += term;
    partials.push(sum);
  }
  return partials.slice(0, n).map((partial, k) => ((k % 2 ? -1 : 1) * (sum - partial)) / sum);
})();

// ζ(½ + it); zeta(10) → [1.5449, −0.1153].
function zeta(t: number): [re: number, im: number] {
  let re = 0;
  let im = 0;
  ETA_WEIGHTS.forEach((weight, k) => {
    const size = weight / Math.sqrt(k + 1);
    const angle = t * Math.log(k + 1);
    re += size * Math.cos(angle);
    im -= size * Math.sin(angle);
  });
  // η / (1 − 2^(1−s)), where 2^(1−s) = √2 e^(−it ln 2).
  const dr = 1 - Math.SQRT2 * Math.cos(t * Math.LN2);
  const di = Math.SQRT2 * Math.sin(t * Math.LN2);
  const norm = dr ** 2 + di ** 2;
  return [(re * dr + im * di) / norm, (im * dr - re * di) / norm];
}

// Points closer than 0.7 to the last one kept are dropped, which keeps the path short against the pane's budget for drawings.
const SPELL_PATH = (() => {
  const points: [number, number][] = [];
  for (let i = 0; i <= 1600; i++) {
    const [re, im] = zeta((FIFTH_ZERO * i) / 1600);
    const x = ZERO.x - SCALE * im;
    const y = ZERO.y - SCALE * re;
    const last = points.at(-1);
    if (last === undefined || Math.hypot(x - last[0], y - last[1]) > 0.7) points.push([x, y]);
  }
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}`;
})();
const SPELL_MARKUP = `<path d="${SPELL_PATH}" stroke="${SPELL}" stroke-width="2.2" opacity=".55" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${SPELL_PATH}" stroke="${SPELLL}" stroke-width=".8" fill="none" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="${ZERO.x}" cy="${ZERO.y}" rx="5.5" ry=".7" fill="${SPELL}" opacity=".75"/><circle cx="${ZERO.x}" cy="${ZERO.y}" r="2.4" fill="#FFE7A0" opacity=".45"/><circle cx="${ZERO.x}" cy="${ZERO.y}" r="1.1" fill="#FFFDF2"/>`;

const SIDE_HAIR = `<path d="M18 37.2V30.6C19.6 30 21.2 30 22.4 30.6C21.2 31.6 20.8 33.2 20.8 35V37.2Z" fill="${HAIR}"/><path d="M19 35.8V32.2" stroke="${HAIRL}" stroke-width=".6" stroke-linecap="round"/><path d="M18.4 37H20.8L22.2 42H20Z" fill="${BEARD}"/>`;
const HAIR_MARKUP = `<path d="M21.4 30.4C25 29.2 30 28.8 35 29C40 28.8 45.6 29.2 50.6 30.4" stroke="${HAIR}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".55"/>${SIDE_HAIR}${mirror(SIDE_HAIR)}`;
const BEARD_MARKUP = `<path d="M25 41.6C27.6 41.2 30.4 41.4 32 42.2C33.2 41.6 34.6 41.4 36 41.4C37.4 41.4 38.8 41.6 40 42.2C41.6 41.4 44.4 41.2 47 41.6C46.6 44.4 45.2 47 42.8 48.6C40.8 49.8 38.6 50.2 36 50.2C33.4 50.2 31.2 49.8 29.2 48.6C26.8 47 25.4 44.4 25 41.6Z" fill="${BEARD}"/><path d="M29.6 44.4C30.4 46 31.4 47.4 33 48.4M36 44.4V49.4M42.4 44.4C41.6 46 40.6 47.4 39 48.4" stroke="${BEARDL}" stroke-width=".7" fill="none" stroke-linecap="round"/><path d="M30.4 43.2C32 42.6 34.2 42.4 36 42.8C37.8 42.4 40 42.6 41.6 43.2" stroke="${HAIR}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
const SPECTACLES = `<ellipse cx="25.5" cy="39" rx="3.4" ry="2.9" fill="#FFFFFF" fill-opacity=".14" stroke="${WIRE}" stroke-width=".7"/><ellipse cx="46.5" cy="39" rx="3.4" ry="2.9" fill="#FFFFFF" fill-opacity=".14" stroke="${WIRE}" stroke-width=".7"/><path d="M28.9 38.6Q36 36.8 43.1 38.6M22.1 38.4L18 37.6M49.9 38.4L54 37.6" stroke="${WIRE}" stroke-width=".6" fill="none"/>`;

// The sleeve stops short of the arm's end, leaving Claude's own hand bare below a white cuff.
const coatPanel = (fill: string) =>
  `<path d="M22 42H28.6L27.6 47.4L23.6 45.2Z" fill="${SHIRT}"/><path d="M15.4 42H22L23.6 45.2L27.6 47.4L29.4 54H18V48H15.4Z" fill="${fill}"/><path d="M22 42L23.6 45.2L27.6 47.4L29.4 54" stroke="${COATL}" stroke-width=".7" fill="none"/>`;
const COAT_MARKUP = `${r(14.4, 42, 43.2, 6, SHIRT)}${r(18, 48, 36, 6, SHIRT)}${coatPanel(COAT)}${mirror(coatPanel(COATD))}<path d="M33.8 50.6L36 51.8L38.2 50.6V53.4L36 52.2L33.8 53.4Z" fill="${INK}"/>`;

export const riemann: Costume = {
  name: "Riemann",
  front: `${COAT_MARKUP}${HAIR_MARKUP}${BEARD_MARKUP}${SPECTACLES}${SPELL_MARKUP}`,
  legs: [
    [TROUSER, 3.6],
    [SHOE, 2.4],
  ],
};
