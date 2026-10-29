/**
 * Thanos in his Endgame armor: a crested gold helmet, jaw guard and shoulder plates over a navy suit, and the Infinity Gauntlet on his left hand, its back to us with the thumb toward his body.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { gem, mirror } from "./paint";

const TH = "#F2C232";
const THD = "#6B4E12";
const THM = "#D9A21E";
const THL = "#FBE07A";
const THANOS_SUIT = "#2F3A5C";
const THANOS_SUITD = "#222A44";

// The films' slots: Time on the thumb, then Power, Space, Reality and Soul from the index finger out, and Mind on the back of the hand.
const STONES: [x: number, y: number, size: number, color: string][] = [
  [59.7, 47.6, 0.85, "#2FA84F"],
  [62, 41.9, 0.85, "#8E3BD8"],
  [64.2, 41.9, 0.85, "#2F6BE0"],
  [66.4, 41.9, 0.85, "#E0262B"],
  [68.6, 41.9, 0.85, "#F07A1A"],
  [65.1, 45.8, 1.55, "#F5D90A"],
];

const THANOS_PAULDRON = `<path d="M8.6 41.6L19.4 40.4L21.8 46.2L11.8 47.8Z" fill="${TH}" stroke="${THD}" stroke-width=".6" stroke-linejoin="round"/><path d="M8.6 41.6L19.4 40.4L20 41.8L9.6 43.2Z" fill="${THL}"/><path d="M10.6 45.2L20.8 43.6" stroke="${THD}" stroke-width=".7"/>`;

export const thanos: Costume = {
  name: "Thanos",
  front: `${r(12, 42, 48, 6, THANOS_SUIT)}${r(18, 48, 36, 6, THANOS_SUIT)}${r(36, 42, 24, 6, THANOS_SUITD, 'opacity=".6"')}${r(36, 48, 18, 6, THANOS_SUITD, 'opacity=".6"')}<path d="M18.4 49.4L27.6 49.8L29.6 54H18.4Z" fill="${TH}" stroke="${THD}" stroke-width=".6"/><path d="M53.6 49.4L44.4 49.8L42.4 54H53.6Z" fill="${THM}" stroke="${THD}" stroke-width=".6"/><path d="M18.4 51.6H28.4M53.6 51.6H43.6" stroke="${THD}" stroke-width=".6"/>${THANOS_PAULDRON}${mirror(THANOS_PAULDRON)}<path d="M16.6 44L15.6 33L18.4 25L24.6 19.8L30 17.6H42L47.4 19.8L53.6 25L56.4 33L55.4 44H51.6L51 33.4L44 32.4L40 33.6H32L28 32.4L21 33.4L20.4 44Z" fill="${TH}" stroke="${THD}" stroke-width=".7" stroke-linejoin="round"/><path d="M42 17.6L47.4 19.8L53.6 25L56.4 33L55.4 44H51.6L51 33.4L44 32.4L40 33.6Z" fill="${THM}" opacity=".55"/><path d="M30.4 17.6H41.6L40 33.6H32Z" fill="${THL}"/><path d="M36 17.6V33.6" stroke="${THM}" stroke-width="1"/><path d="M30.4 17.6L32 33.6M41.6 17.6L40 33.6" stroke="${THD}" stroke-width="1.2"/><path d="M18.4 25L22.6 30.4L21 33.4M53.6 25L49.4 30.4L51 33.4" stroke="${THD}" stroke-width="1" fill="none" stroke-linejoin="round"/><path d="M21 33.4L28 32.4L32 33.6H40L44 32.4L51 33.4" stroke="${THD}" stroke-width="1.1" fill="none" stroke-linejoin="round"/><path d="M22.4 23L26 20.6" stroke="#FFF6CC" stroke-width="1.4" stroke-linecap="round"/><path d="M20.4 42.4L27 44.6H45L51.6 42.4L52.6 46.4L44 48.4L39.2 48.6L36 51.8L32.8 48.6L28 48.4L19.4 46.4Z" fill="${TH}" stroke="${THD}" stroke-width=".7" stroke-linejoin="round"/><path d="M32.8 44.6H39.2L38.4 48.6L36 51.2L33.6 48.6Z" fill="${THL}"/><path d="M27 44.6L28 48.4M45 44.6L44 48.4" stroke="${THD}" stroke-width=".8"/><path d="M36 44.6H45L51.6 42.4L52.6 46.4L44 48.4L39.2 48.6L36 51.8Z" fill="${THM}" opacity=".4"/><path d="M52.4 41.2H61.2V49.4H52.4Z" fill="${TH}" stroke="${THD}" stroke-width=".7"/><path d="M55.4 41.2V49.4M58.2 41.2V49.4" stroke="${THD}" stroke-width=".8"/><path d="M52.6 42H61" stroke="${THL}" stroke-width=".8"/><rect x="60.4" y="39.4" width="9.4" height="11" rx="2" fill="${TH}" stroke="${THD}" stroke-width=".7"/>${[61, 63.2, 65.4, 67.6].map((x) => `<rect x="${x}" y="38.2" width="2" height="2.6" rx=".8" fill="${TH}" stroke="${THD}" stroke-width=".45"/>`).join("")}<rect x="58.2" y="44.8" width="3" height="5.6" rx="1.3" fill="${TH}" stroke="${THD}" stroke-width=".6"/><path d="M61 40.6H69.2" stroke="${THL}" stroke-width=".7"/>${STONES.map(([x, y, size, color]) => gem(x, y, size, size, color)).join("")}`,
  legs: [
    [THANOS_SUIT, 2.2],
    [TH, 3.2],
    [THD, 0.6],
  ],
};
