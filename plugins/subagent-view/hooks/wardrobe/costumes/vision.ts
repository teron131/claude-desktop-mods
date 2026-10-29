/**
 * Vision as in the MCU: his red-violet face under steel-blue head panels, a red-violet stripe running down to the yellow Mind Stone in his brow, a steel-blue suit with a cream yoke around a red-violet chest stripe, red-violet gauntlets, and an olive-gold cape.
 */

import { INK, r } from "../claude";
import type { Costume } from "../claude";

const VCAPE = "#BFA052";
const VCAPED = "#8A7236";
const VCAPEL = "#DCC57E";
const VSUIT = "#4F7486";
const VSUITD = "#344F5C";
const VYOKE = "#E8DDB8";
const VYOKED = "#C7B585";
const VGOLD = "#C9A84E";
const VSKIN = "#9C3458";
const VSKIND = "#6E2240";
const VSEAM = "#4A1229";
const VHEAD = "#6F8FA0";
const VHEADD = "#4E6B7A";
const STONE = "#F6D33C";

export const vision: Costume = {
  name: "Vision",
  back: `<path d="M11.5 41H19.5L19 63L5 64.5Z" fill="${VCAPE}"/><path d="M15.5 41H19.5L19 63L12 64Z" fill="${VCAPED}"/><path d="M52.5 41H60.5L67 64.5L53 63Z" fill="${VCAPE}"/><path d="M52.5 41H56.5L60 64L53 63Z" fill="${VCAPED}"/><path d="M10.5 46L7.5 62M14 46.5L12.5 62.5M61.5 46L64.5 62M58 46.5L59.5 62.5" stroke="${VCAPEL}" stroke-width=".6" opacity=".7"/>`,
  front: `${r(18, 42, 36, 12, VSUIT)}${r(36, 42, 18, 12, VSUITD, 'opacity=".45"')}${r(12, 42, 6, 6, VSUIT)}${r(54, 42, 6, 6, VSUITD)}${r(12, 45.6, 6, 2.4, VSKIN)}${r(54, 45.6, 6, 2.4, VSKIND)}<path d="M18 42H54V45.4L36 52.4L18 45.4Z" fill="${VYOKE}"/><path d="M36 42H54V45.4L36 52.4Z" fill="${VYOKED}" opacity=".6"/><path d="M33.4 42H38.6L36 50.4Z" fill="${VSKIN}"/><path d="M18 45.4L36 52.4L54 45.4M33.4 42L36 50.4L38.6 42" stroke="${VGOLD}" stroke-width=".7" fill="none" stroke-linejoin="round"/>${r(11.5, 40.5, 8, 3.4, VYOKE)}${r(11.5, 43.2, 8, 0.7, VGOLD)}${r(52.5, 40.5, 8, 3.4, VYOKED)}${r(52.5, 43.2, 8, 0.7, VGOLD)}${r(18, 30, 36, 12, VSKIN)}${r(36, 30, 18, 12, VSKIND, 'opacity=".5"')}${r(24, 36, 3, 6, INK)}${r(45, 36, 3, 6, INK)}<path d="M20.8 37.4Q21.4 40.2 23.4 42M51.2 37.4Q50.6 40.2 48.6 42M29.4 38.6L32 42M42.6 38.6L40 42" stroke="${VSEAM}" stroke-width=".7" fill="none" stroke-linecap="round"/><path d="M18 30H32.8L32 33.4C27.6 33.6 22.4 34.6 18 36.4Z" fill="${VHEAD}"/><path d="M54 30H39.2L40 33.4C44.4 33.6 49.6 34.6 54 36.4Z" fill="${VHEADD}"/><path d="M21 30.6L22.8 33.6M26 30.6L27 33.2M51 30.6L49.2 33.6M46 30.6L45 33.2" stroke="${VHEADD}" stroke-width=".6" stroke-linecap="round"/><path d="M32.8 30L32 33.4L33.8 35.2M39.2 30L40 33.4L38.2 35.2" stroke="${VGOLD}" stroke-width=".7" fill="none" stroke-linejoin="round"/><circle cx="36" cy="34.6" r="3.2" fill="#FFE98A" opacity=".3"/><path d="M36 31.8L38.5 34.6L36 37.4L33.5 34.6Z" fill="${STONE}" stroke="${VGOLD}" stroke-width=".5"/><path d="M36 31.8L33.5 34.6L36 35.1Z" fill="#FFF3B0"/>`,
  legs: [
    [VSUIT, 2.4],
    [VSKIN, 3.6],
  ],
};
