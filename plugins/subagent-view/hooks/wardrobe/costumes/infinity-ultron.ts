/**
 * Infinity Ultron from What If...?: a gunmetal helmet with Ultron's swept fins and the Mind Stone, ribbed armor holding the other five Stones, a red cape and his double-headed spear.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { gem, IGOLDD, mirror } from "./paint";

const IGOLD = "#F2C230";
const ICAPE = "#C8202B";
const ICAPED = "#8C141C";
const GUND = "#33373D";
const GUNL = "#8E949C";
const GUNDD = "#1E2125";
const GUNLL = "#C9CDD2";
const GUN = "#4C5158";

const INFINITY_FIN = `<path d="M17.6 45.8C15 41.2 14 35.2 14.5 30C15 24.8 18.2 18.8 23.8 14.4L26.6 19.8L20.6 24.4L17.6 31Z" fill="${GUNL}" stroke="${GUNDD}" stroke-width=".6" stroke-linejoin="round"/><path d="M16.8 42.4C15.6 38 15.4 33.4 16 29.4C16.6 25.4 18.6 21.8 21.8 18.6" stroke="${GUND}" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M15.4 38.6C14.8 35.6 14.8 32.4 15.3 29.6C15.8 26.6 17.2 23.4 19.4 20.6" stroke="${GUNLL}" stroke-width=".7" fill="none" stroke-linecap="round"/>`;

const INFINITY_PAULDRON = `<path d="M8.8 42.6C9.2 39.8 13.2 38.8 20.4 39.2L22 45.2L12 47.2C10 46.6 8.8 45.2 8.8 42.6Z" fill="${GUN}" stroke="${GUNDD}" stroke-width=".6" stroke-linejoin="round"/><path d="M9.8 41.6C11 40.2 14.4 39.8 19.6 40.2" stroke="${GUNLL}" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M12 47.2L22 45.2" stroke="${IGOLD}" stroke-width="1"/>`;

const INFINITY_CAPE = `<path d="M11 42H19L18 61.4L3.4 64.8Z" fill="${ICAPE}"/><path d="M15.4 42H19L18 61.4L11.4 63Z" fill="${ICAPED}"/><path d="M11 42L3.4 64.8L18 61.4" stroke="${IGOLD}" stroke-width="1.2" fill="none" stroke-linejoin="round"/>`;

export const infinityUltron: Costume = {
  name: "Infinity Ultron",
  back: `${INFINITY_CAPE}${mirror(INFINITY_CAPE)}`,
  front: `${r(6.6, 10, 1.6, 51, GUND)}${r(6.6, 10, 0.6, 51, GUNL)}${r(6.2, 29, 2.4, 1.2, IGOLD)}${r(6.2, 31.6, 2.4, 1.2, IGOLD)}<path d="M7.4 .8L10.2 9.4L7.4 12.2L4.6 9.4Z" fill="${GUNL}" stroke="${GUNDD}" stroke-width=".5"/><path d="M7.4 .8L4.6 9.4L7.4 12.2Z" fill="${GUNLL}"/><path d="M7.4 69.6L10.2 61L7.4 58.2L4.6 61Z" fill="${GUNL}" stroke="${GUNDD}" stroke-width=".5"/><path d="M7.4 69.6L4.6 61L7.4 58.2Z" fill="${GUNLL}"/><path d="M18 42H54V54H18Z" fill="${GUN}"/><path d="M36 42H54V54H36Z" fill="${GUNDD}" opacity=".35"/><path d="M22 50.6Q36 52.8 50 50.6M23 52.8Q36 54.4 49 52.8M36 49.6V54" stroke="${GUND}" stroke-width=".7" fill="none"/><path d="M18.4 42.6L36 49.4L53.6 42.6" stroke="${IGOLD}" stroke-width="1.2" fill="none" stroke-linejoin="round"/>${gem(24.4, 45.2, 1.1, 1.4, "#F07A1A")}${gem(29.8, 47.4, 1.1, 1.4, "#E0262B")}${gem(42.2, 47.4, 1.1, 1.4, "#8E3BD8")}${gem(47.6, 45.2, 1.1, 1.4, "#2F6BE0")}${gem(36, 51.2, 1.3, 1.7, "#2FA84F")}<path d="M17.6 44.6V31L20.6 24.4L26.6 19.8L36 17.4L45.4 19.8L51.4 24.4L54.4 31V44.6L52 46.2L50.6 33.8L36 39L21.4 33.8L20 46.2Z" fill="${GUN}" stroke="${GUNDD}" stroke-width=".6" stroke-linejoin="round"/><path d="M36 17.4L45.4 19.8L51.4 24.4L54.4 31V44.6L52 46.2L50.6 33.8L36 39Z" fill="${GUNDD}" opacity=".35"/><path d="M33.8 18L36 15.2L38.2 18L37.6 30.4H34.4Z" fill="${GUNL}"/><path d="M33.8 18L36 15.2V30.4H34.4Z" fill="${GUNLL}"/><path d="M23.4 22.4L27.6 20.4" stroke="${GUNLL}" stroke-width="1.1" stroke-linecap="round"/><path d="M21.4 33.8L36 39L50.6 33.8" stroke="${IGOLD}" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M36 30.4L38.6 32V35.2L36 36.8L33.4 35.2V32Z" fill="#F7D23A" stroke="${IGOLDD}" stroke-width=".7"/><path d="M36 30.4L33.4 32V35.2L36 33.6Z" fill="#FFF0A0"/>${INFINITY_FIN}${mirror(INFINITY_FIN)}${INFINITY_PAULDRON}${mirror(INFINITY_PAULDRON)}`,
};
