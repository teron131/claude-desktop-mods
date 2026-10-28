/**
 * Odin as in the MCU: white hair and beard, a gold eyepatch, gold armor and shoulder plates under a red cape, and the spear Gungnir.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { BELT, GOLD, GOLDD, GOLDDD, GOLDL, RED, REDD } from "./paint";

const BEARD = "#ECE9E2";
const BEARDD = "#C9C5BC";
const ODIN_SLEEVE = "#7A2323";

export const odin: Costume = {
  name: "Odin",
  back: `<path d="M11 41H19L18 60L4 64Z" fill="${RED}"/><path d="M15.5 41H19L18 60L11.5 62Z" fill="${REDD}"/><path d="M53 41H61L68 64L54 60Z" fill="${RED}"/><path d="M53 41H56.5L60.5 62L54 60Z" fill="${REDD}"/>`,
  front: `${r(18, 42, 36, 12, GOLD)}${r(36, 42, 18, 12, GOLDD, 'opacity=".45"')}${r(12, 43, 6, 5, ODIN_SLEEVE)}${r(54, 43, 6, 5, ODIN_SLEEVE)}<path d="M21 43V54M51 43V54M18 47.6H24M48 47.6H54" stroke="${GOLDDD}" stroke-width=".7"/>${r(18, 51.6, 36, 1.6, BELT)}${r(64, 12, 2.6, 49, GOLD)}${r(65.6, 12, 1, 49, GOLDD)}${[22, 32, 42].map((y) => r(63.6, y, 3.4, 1.4, GOLDDD)).join("")}<path d="M65.3 .5L69.5 8.5L65.3 13.5L61.1 8.5Z" fill="${GOLD}"/><path d="M65.3 .5L61.1 8.5L65.3 13.5Z" fill="${GOLDL}"/><path d="M65.3 1.6V12.4" stroke="${GOLDD}" stroke-width=".8"/>${r(62.2, 12, 6.2, 2.6, GOLDD)}${r(62.2, 12, 6.2, 0.7, GOLDL)}<path d="M20 43.5H52L48 57L42 63L36 69L30 63L24 57Z" fill="${BEARD}"/><path d="M29 49L32 61M36 48V66M43 49L40 61" stroke="${BEARDD}" stroke-width="1" fill="none"/><path d="M23.5 43.5Q30 47.5 36 44.6Q42 47.5 48.5 43.5V45.4Q42 49.5 36 46.6Q30 49.5 23.5 45.4Z" fill="#DEDAD2"/><path d="M15 31L19.5 31L19.5 46L14.5 44Z" fill="${BEARD}"/><path d="M57 31L52.5 31L52.5 46L57.5 44Z" fill="${BEARD}"/><path d="M15 33C14 24.5 22 19.5 36 19.5C50 19.5 58 24.5 57 33L54 31C49.5 27 22.5 27 18 31Z" fill="${BEARD}"/><path d="M21 25C27 22.4 33 21.8 38 22M41 22.5C46 23 50 24.4 53 26.5" stroke="${BEARDD}" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M19 28C23 26.5 27 26 31 26" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/>${r(11.5, 40.5, 8, 4, GOLD)}${r(11.5, 40.5, 8, 1, GOLDL)}${r(52.5, 40.5, 8, 4, GOLD)}${r(52.5, 40.5, 8, 1, GOLDL)}<path d="M30.5 36L54 31.5" stroke="${GOLDDD}" stroke-width="1.2"/><path d="M21 35H30.5V40.5L28 43H23.5L21 40.5Z" fill="${GOLD}"/><path d="M21 35H30.5V36.4H21Z" fill="${GOLDL}"/><path d="M28 43L30.5 40.5V36.4" stroke="${GOLDD}" stroke-width="1" fill="none"/>`,
};
