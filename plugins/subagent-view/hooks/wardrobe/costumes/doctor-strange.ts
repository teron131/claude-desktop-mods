/**
 * Doctor Strange as in Multiverse of Madness: the Cloak of Levitation's tall collar and lapels over his blue tunic, swept dark hair with grey sides, the winged Eye of Agamotto holding the green Time Stone, and an orange spell circle.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { BELT, GOLDD, mirror, twinkle } from "./paint";

const HAIR = "#2B2220";
const HAIRL = "#4A403B";
const BRONZE = "#A07D46";
const BRONZED = "#6B5230";
const BRONZEL = "#E3C891";
const MANDALA = "#F59E2B";
const MANDALAL = "#FFD58A";
const CLOAK = "#A8282E";
const CLOAKD = "#7C1B21";
const CLOAKL = "#C8434A";
const WING = "#A7ABB0";
const WINGD = "#6F747B";
const GRAYH = "#B9B6B0";
const TUNIC = "#2B3D70";
const TUNICD = "#1D2A4F";

const AGAMOTTO_WING = `<path d="M32.4 49.4L25.4 48.8L23.4 51.2L25.6 51.5L24 53.9L26.6 53.5L25.6 56L28.4 54.8L28.5 57L32.4 52.8Z" fill="${WING}"/><path d="M31.6 50.4L26 50.2M31.4 51.6L26.4 52.6M31.4 52.4L28 55" stroke="${WINGD}" stroke-width=".55" fill="none" stroke-linecap="round"/><path d="M32.4 49.4L25.4 48.8L24.6 49.8L32.4 50.4Z" fill="#D4D7DB"/>`;

const CLOAK_LAPEL = `<path d="M11.5 41.5H21.5L28 48.6L24.4 54H18V48H11.5Z" fill="${CLOAK}"/><path d="M21.5 41.5L28 48.6L24.4 54H22.4L25.6 48.8L19.6 41.5Z" fill="${CLOAKD}"/><path d="M21.5 41.5L28 48.6L24.4 54" stroke="${CLOAKL}" stroke-width=".8" fill="none"/>`;

const GRAY_STREAKS = `<path d="M17.4 33.6C17.1 30.4 17.8 27.4 19.6 25.2M19 32.8C18.8 30 19.4 27.6 21 25.6M20.6 31.8C20.6 29.6 21.2 27.8 22.6 26.4" stroke="${GRAYH}" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M18.2 33.2C18 31 18.4 29 19.4 27.4" stroke="#E2E0DB" stroke-width=".6" fill="none" stroke-linecap="round"/>`;

export const doctorStrange: Costume = {
  name: "Doctor Strange",
  back: `<path d="M11 41H19L18 61L4 64Z" fill="${CLOAK}"/><path d="M15.5 41H19L18 61L11.5 62.5Z" fill="${CLOAKD}"/><path d="M53 41H61L68 64L54 61Z" fill="${CLOAK}"/><path d="M53 41H56.5L60.5 62.5L54 61Z" fill="${CLOAKD}"/><path d="M19 42L18.5 27L6 13.5L8.5 29L11.5 41.5Z" fill="${CLOAK}"/><path d="M19 42L18.5 27L10.5 18.5L12.5 31L15 41.5Z" fill="${CLOAKD}"/><path d="M6 13.5L8.5 29L11.5 41.5" stroke="${CLOAKL}" stroke-width="1" fill="none"/><path d="M9.5 23C11 26 11.5 29 13 31M10.5 33C12 35 13 37 13.5 39.5" stroke="${CLOAKD}" stroke-width=".8" fill="none" stroke-linecap="round"/><path d="M53 42L53.5 27L66 13.5L63.5 29L60.5 41.5Z" fill="${CLOAK}"/><path d="M53 42L53.5 27L61.5 18.5L59.5 31L57 41.5Z" fill="${CLOAKD}"/><path d="M66 13.5L63.5 29L60.5 41.5" stroke="${CLOAKL}" stroke-width="1" fill="none"/><path d="M62.5 23C61 26 60.5 29 59 31M61.5 33C60 35 59 37 58.5 39.5" stroke="${CLOAKD}" stroke-width=".8" fill="none" stroke-linecap="round"/>`,
  front: `${r(12, 42, 48, 6, TUNIC)}${r(18, 48, 36, 6, TUNIC)}${r(36, 42, 24, 6, TUNICD, 'opacity=".5"')}${r(36, 48, 18, 6, TUNICD, 'opacity=".5"')}<path d="M28 42L36 47.4L44 42" stroke="${TUNICD}" stroke-width="1" fill="none"/>${r(18, 52, 36, 2, BELT)}${r(18, 52.6, 36, 0.5, GOLDD)}<path d="M17 35C16 27 18.5 21.5 24 18.5C29 15.8 35 14.4 41 14.6C47.5 15 52.5 18.4 54.5 23.5C55.6 26.5 55.6 30.5 55 35L52.5 32C50 30.8 47 30.4 43 30.4C40 30.4 38 30.8 36 31.4C33.5 30.6 29 30.4 25 30.5C22.5 30.7 20.5 31.4 19.4 32.8Z" fill="${HAIR}"/><path d="M23.5 21.6C29 17.6 37 16.2 44 17.2C48 17.8 51 19.6 52.8 22.4" stroke="${HAIRL}" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M45.5 21C49 22.4 51.6 25 53 28.4" stroke="${HAIRL}" stroke-width=".8" fill="none" stroke-linecap="round"/>${GRAY_STREAKS}${mirror(GRAY_STREAKS)}<path d="M43 16.2C36.6 18.6 30.8 23.6 29 29.6C28 33 29.4 36.4 32.6 36.2C33.6 36.1 34 35.2 33.4 34.4C31.9 33.6 31.6 31.8 32.4 29.8C34 25.6 38 21.6 44.2 18.8Z" fill="${HAIR}"/><path d="M40.5 18.6C36 21 32.6 24.8 31.4 29" stroke="${HAIRL}" stroke-width=".9" fill="none" stroke-linecap="round"/>${CLOAK_LAPEL}${mirror(CLOAK_LAPEL)}${AGAMOTTO_WING}${mirror(AGAMOTTO_WING)}<circle cx="36" cy="51" r="6.2" fill="#5DF08A" opacity=".22"/><circle cx="36" cy="51" r="4.3" fill="${BRONZE}" stroke="${BRONZED}" stroke-width=".8"/><circle cx="36" cy="51" r="2.5" fill="#2FBF5E"/><circle cx="36" cy="51" r="1.5" fill="#6BEA92"/><ellipse cx="36" cy="51" rx="3.3" ry="1.5" transform="rotate(32 36 51)" fill="none" stroke="${BRONZEL}" stroke-width=".7"/><ellipse cx="36" cy="51" rx="3.3" ry="1.5" transform="rotate(-32 36 51)" fill="none" stroke="${BRONZEL}" stroke-width=".7"/><ellipse cx="36" cy="51" rx="1.3" ry="3.3" fill="none" stroke="${BRONZEL}" stroke-width=".6"/><circle cx="35.3" cy="50.2" r=".6" fill="#E4FFEC"/><path d="M33 49.2A3.6 3.6 0 0 1 35.6 47.4" stroke="#F4E2B8" stroke-width=".7" fill="none" stroke-linecap="round"/><circle cx="63" cy="46" r="7.6" fill="${MANDALA}" fill-opacity=".16" stroke="${MANDALA}" stroke-width="1.2"/><circle cx="63" cy="46" r="5.4" fill="none" stroke="${MANDALA}" stroke-width=".7"/><rect x="59.4" y="42.4" width="7.2" height="7.2" fill="none" stroke="${MANDALAL}" stroke-width=".7"/><rect x="59.4" y="42.4" width="7.2" height="7.2" fill="none" stroke="${MANDALAL}" stroke-width=".7" transform="rotate(45 63 46)"/><circle cx="63" cy="46" r="1.2" fill="${MANDALAL}"/>${Array.from(
    { length: 12 },
    (_, i) => {
      const a = (i * Math.PI) / 6;
      return `<line x1="${(63 + Math.cos(a) * 6.3).toFixed(2)}" y1="${(46 + Math.sin(a) * 6.3).toFixed(2)}" x2="${(63 + Math.cos(a) * 7.3).toFixed(2)}" y2="${(46 + Math.sin(a) * 7.3).toFixed(2)}" stroke="${MANDALA}" stroke-width=".6"/>`;
    },
  ).join("")}${twinkle(69, 36, 1.4, MANDALAL)}${twinkle(56.5, 56.5, 1.1, MANDALA)}`,
};
