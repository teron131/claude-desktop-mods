/**
 * Captain Anthropic: Captain America's suit with Anthropic's A\ on the chest, and the round shield carrying it too.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { BELT, RED, REDD } from "./paint";

const BLUE = "#185FA5";
const WHITE = "#F7F5F0";
const NAVY = "#1F3A68";
const NAVYL = "#3B5C94";
const SRED = "#D0283A";
const BUCKLE = "#C9CED6";

// Anthropic's A\ traced from the logo's 512-unit artwork, scaled to the shield's center.
const anthropic = (cx: number, cy: number, width: number) =>
  `<g fill="#fff" transform="translate(${cx} ${cy}) scale(${width / 273}) translate(-256.5 -256)"><path fill-rule="evenodd" d="M120 352L196 160H240L316 352H272L258 310H178L164 352ZM218 210L244 275H192Z"/><path d="M276 160H318L393 352H351Z"/></g>`;

export const captainAnthropic: Costume = {
  name: "Captain Anthropic",
  front: `${r(18, 42, 36, 6.6, NAVY)}<path d="M19.4 43.2L24.6 43.2L21.6 47Z" fill="${NAVYL}" opacity=".8"/>${anthropic(36, 45.3, 6.8)}${Array.from({ length: 12 }, (_, i) => r(18 + i * 3, 48.6, 3, 2.8, i % 2 ? "#fff" : SRED)).join("")}${r(18, 51.4, 36, 1.7, BELT)}${r(34, 51.1, 4, 2.3, BUCKLE)}${r(35, 51.7, 2, 1.1, BELT)}${r(18, 53.1, 36, 0.9, NAVY)}<g transform="translate(60.4 47) scale(.74) translate(-19 -44)"><circle cx="19" cy="44" r="14" fill="${RED}"/><circle cx="19" cy="44" r="14" fill="none" stroke="${REDD}" stroke-width="1.1"/><circle cx="19" cy="44" r="11" fill="${WHITE}"/><circle cx="19" cy="44" r="8.2" fill="${RED}"/><circle cx="19" cy="44" r="5.8" fill="${BLUE}"/>${anthropic(19, 44, 8)}<path d="M8.2 37.5A12.6 12.6 0 0 1 15.5 31.8" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M29.5 51A12.6 12.6 0 0 1 24 56" stroke="${REDD}" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`,
  legs: [
    [NAVY, 2.4],
    [BELT, 3.6],
  ],
};
