/**
 * Vision as in the MCU: the yellow Mind Stone set in teal head panels, a teal suit under a cream and gold yoke, and an olive-gold cape.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { GOLDDD } from "./paint";

const VCAPE = "#B59A4C";
const VCAPED = "#857033";
const VCAPEL = "#D8C27A";
const VTEAL = "#4F7486";
const VTEALD = "#344F5C";
const VCREAM = "#EDE2BF";
const VCREAMD = "#C9B98A";
const VGOLD = "#C9A84E";
const VMAR = "#8E2A4E";
const VTEALL = "#7398A8";
const VHEAD = "#8FA9B5";
const VHEADD = "#5E7C8A";
const STONE = "#F6D33C";

export const vision: Costume = {
  name: "Vision",
  back: `<path d="M11.5 41H19.5L19 63L5 64.5Z" fill="${VCAPE}"/><path d="M15.5 41H19.5L19 63L12 64Z" fill="${VCAPED}"/><path d="M52.5 41H60.5L67 64.5L53 63Z" fill="${VCAPE}"/><path d="M52.5 41H56.5L60 64L53 63Z" fill="${VCAPED}"/><path d="M10.5 46L7.5 62M14 46.5L12.5 62.5M61.5 46L64.5 62M58 46.5L59.5 62.5" stroke="${VCAPEL}" stroke-width=".6" opacity=".7"/>`,
  front: `${r(18, 42, 36, 12, VTEAL)}${r(36, 42, 18, 12, VTEALD, 'opacity=".45"')}<path d="M18 42H27L22.4 46.6L18 47.6Z" fill="${VCREAM}"/><path d="M54 42H45L49.6 46.6L54 47.6Z" fill="${VCREAMD}"/><path d="M27 42L35 53.4M45 42L37 53.4M18 47.6L22.4 46.6L27 42M54 47.6L49.6 46.6L45 42" stroke="${VGOLD}" stroke-width=".8" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M34.9 45H37.1L36.8 52.4L36 54L35.2 52.4Z" fill="${VMAR}"/><path d="M24.5 51Q27.5 49.6 29.6 51.4M47.5 51Q44.5 49.6 42.4 51.4" stroke="${VTEALL}" stroke-width=".6" fill="none" stroke-linecap="round"/>${r(11.5, 40.5, 8, 3.4, VCREAM)}${r(11.5, 43.2, 8, 0.7, VGOLD)}${r(52.5, 40.5, 8, 3.4, VCREAMD)}${r(52.5, 43.2, 8, 0.7, VGOLD)}<path d="M18 30H32.6L31.4 32.8C27 33.2 22 34.2 18 35.8Z" fill="${VHEAD}"/><path d="M54 30H39.4L40.6 32.8C45 33.2 50 34.2 54 35.8Z" fill="${VHEADD}"/><path d="M20.5 30.6L22.6 33.6M25.5 30.6L26.6 33M51.5 30.6L49.4 33.6M46.5 30.6L45.4 33" stroke="${VTEALD}" stroke-width=".6" stroke-linecap="round"/><path d="M32.6 30L31.4 32.8L34.2 35M39.4 30L40.6 32.8L37.8 35" stroke="${VGOLD}" stroke-width=".8" fill="none" stroke-linejoin="round"/><circle cx="36" cy="34.2" r="3.6" fill="#FFE98A" opacity=".45"/><path d="M36 31.6L38.4 34.2L36 36.8L33.6 34.2Z" fill="${STONE}" stroke="${GOLDDD}" stroke-width=".5"/><path d="M36 31.6L33.6 34.2L36 34.7Z" fill="#FFF3B0"/><circle cx="35.3" cy="33.3" r=".45" fill="#fff"/>`,
};
