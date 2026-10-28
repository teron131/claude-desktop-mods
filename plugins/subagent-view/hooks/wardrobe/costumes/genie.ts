/**
 * A genie rising from a golden oil lamp on purple smoke in place of legs, with a black topknot, a gold earring and gold cuffs.
 */

import { INK, r } from "../claude";
import type { Costume } from "../claude";
import { GOLD, GOLDD, GOLDDD, GOLDL, twinkle } from "./paint";

const SMOKE = "#A79CE6";
const SMOKEL = "#CFC8F4";

export const genie: Costume = {
  name: "Genie",
  legs: false,
  front: `<path d="M30 53C25 60 35 60 32 64" stroke="${SMOKE}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M29.6 54.5C27 58.6 33 58.8 32 62" stroke="${SMOKEL}" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="26.6" cy="59" r="2.2" fill="${SMOKE}"/><circle cx="35.2" cy="57.6" r="1.7" fill="${SMOKE}"/>${twinkle(24, 63, 1.8, GOLD)}${twinkle(64, 55, 1.4, GOLDL)}<path d="M45 70H55L53.5 67.5H46.5Z" fill="${GOLDD}"/><path d="M37 67.5Q49 55 61 67.5Z" fill="${GOLD}"/><path d="M37 67.5Q49 64.5 61 67.5Z" fill="${GOLDD}"/><path d="M40.5 63.5Q49 59.5 57.5 63.5" stroke="${GOLDDD}" stroke-width="1" fill="none"/><path d="M42 61.6Q46 58.4 50 58.1" stroke="${GOLDL}" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M38.5 65.5C34.5 65.5 32.5 63.5 30.5 60.5L32.5 59.5C34.5 61.5 36.5 63.5 39.5 64Z" fill="${GOLD}"/><path d="M59.5 61.5C65 59.5 66 66 59.5 66.5" stroke="${GOLD}" stroke-width="2.2" fill="none"/><circle cx="49" cy="57" r="1.8" fill="${GOLD}"/><path d="M34.5 30C31.5 24 37 21.5 35 15.5C40.5 18 40.5 25.5 37.5 30Z" fill="${INK}"/>${r(34, 27.6, 4, 2, GOLD)}<circle cx="55.6" cy="40.4" r="1.9" fill="none" stroke="${GOLD}" stroke-width="1.1"/>${r(13, 42, 3, 6, GOLD)}${r(13, 42, 3, 1, GOLDL)}${r(56, 42, 3, 6, GOLD)}${r(56, 42, 3, 1, GOLDL)}`,
};
