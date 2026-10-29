/**
 * The Scarlet Witch: a crimson crown over long auburn hair, a crimson suit and cape, and chaos-magic wisps at her hands.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { mirror } from "./paint";

const WCRIM = "#8E1428";
const WCRIMD = "#5E0D1B";
const AUB = "#8C2F1C";
const AUBD = "#5E1D12";
const WCRIML = "#B52238";
const WSEAM = "#45070F";
const WBLACK = "#463A40";
const AUBL = "#B9502F";
const CROWN = "#A3172F";
const CROWND = "#6E0D1E";
const CROWNL = "#D8394F";
// Chaos magic glows scarlet in the films, where the comics draw it pink.
const HEX = "#D41F3A";
const HEXL = "#FF7A7A";

const HEX_WISP = `<path d="M12 46C7 46.5 3.5 42.5 6 39.5C8.2 37 11.6 39.4 9.6 41.6" stroke="${HEX}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M12 46C7 46.5 3.5 42.5 6 39.5C8.2 37 11.6 39.4 9.6 41.6" stroke="${HEXL}" stroke-width=".8" fill="none" stroke-linecap="round"/><path d="M11.5 49C7.5 51 5 54.5 7.5 57" stroke="${HEX}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="3" cy="47" r="1" fill="${HEX}"/><circle cx="5" cy="51.5" r=".7" fill="${HEXL}"/><circle cx="10" cy="35.5" r=".8" fill="${HEX}"/>`;

export const scarletWitch: Costume = {
  name: "Scarlet Witch",
  back: `<path d="M11 41H19L18 61L3.5 64.5Z" fill="${WCRIM}"/><path d="M15.5 41H19L18 61L11 63Z" fill="${WCRIMD}"/><path d="M53 41H61L68.5 64.5L54 61Z" fill="${WCRIM}"/><path d="M53 41H56.5L61 63L54 61Z" fill="${WCRIMD}"/><path d="M17.5 33C12 40 12.5 52 8.5 61C13.5 60 17 57 19 52Z" fill="${AUB}"/><path d="M17.5 36C14.5 43 14.5 52 12 59C15.5 57.5 17.5 55 19 52Z" fill="${AUBD}"/><path d="M54.5 33C60 40 59.5 52 63.5 61C58.5 60 55 57 53 52Z" fill="${AUB}"/><path d="M54.5 36C57.5 43 57.5 52 60 59C56.5 57.5 54.5 55 53 52Z" fill="${AUBD}"/>`,
  front: `<path d="M12 42H23.6L36 47.6L48.4 42H60V48H54V54H18V48H12Z" fill="${WCRIM}"/><path d="M36 47.6L48.4 42H60V48H54V54H36Z" fill="${WCRIMD}" opacity=".55"/><path d="M23.6 42L36 47.6L48.4 42" stroke="${WCRIML}" stroke-width="1" fill="none" stroke-linejoin="round"/><path d="M36 47.6V54M29 45.2C30.4 48.4 30.2 51.4 28.4 54M43 45.2C41.6 48.4 41.8 51.4 43.6 54" stroke="${WSEAM}" stroke-width=".8" fill="none" stroke-linecap="round"/>${r(12, 42, 6, 6, WCRIMD)}${r(54, 42, 6, 6, WCRIMD)}${r(12, 42, 6, 1, WCRIML)}${r(54, 42, 6, 1, WCRIM)}${r(12, 45.4, 6, 0.8, WSEAM)}${r(54, 45.4, 6, 0.8, WSEAM)}<path d="M17 34C16 25 24 20.5 36 20.5C48 20.5 56 25 55 34L52 31.5C47 28 25 28 20 31.5Z" fill="${AUB}"/><path d="M36 21V27.5" stroke="${AUBD}" stroke-width=".9"/><path d="M21 27C25 23.6 30 22.4 34 22.2M38 22.2C42 22.4 47 23.6 51 27" stroke="${AUBL}" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M17 31C14.5 36 15 42 13.5 47.5L18.5 45.5C18.5 40 19.5 35 20.5 31.5Z" fill="${AUB}"/><path d="M55 31C57.5 36 57 42 58.5 47.5L53.5 45.5C53.5 40 52.5 35 51.5 31.5Z" fill="${AUB}"/><path d="M16.6 33.5C15.6 37.5 16 41.5 15 45.5" stroke="${AUBL}" stroke-width=".8" fill="none" stroke-linecap="round"/><path d="M31 29.5C26.5 26.5 24.5 21 25.5 14.5C28 20 31 23.5 35 26.5Z" fill="${CROWN}"/><path d="M41 29.5C45.5 26.5 47.5 21 46.5 14.5C44 20 41 23.5 37 26.5Z" fill="${CROWN}"/><path d="M41 29.5C45.5 26.5 47.5 21 46.5 14.5C46 20.5 44 24.5 40 27.5Z" fill="${CROWND}"/><path d="M36 12.5L38.8 27.5L36 33.5L33.2 27.5Z" fill="${CROWN}"/><path d="M36 12.5L33.2 27.5L36 33.5Z" fill="${CROWNL}"/><path d="M21.5 29.4Q36 27 50.5 29.4L50.5 31.6Q43 30.6 36 34Q29 30.6 21.5 31.6Z" fill="${CROWN}"/><path d="M21.5 29.4Q36 27 50.5 29.4" stroke="${CROWNL}" stroke-width=".8" fill="none"/><path d="M26.3 17C26.2 20 27.5 22.5 29.5 24.5" stroke="${CROWNL}" stroke-width=".8" fill="none" stroke-linecap="round"/>${HEX_WISP}${mirror(HEX_WISP)}`,
  legs: [
    [WBLACK, 2.8],
    [WCRIM, 0.8],
    [WBLACK, 2.4],
  ],
};
