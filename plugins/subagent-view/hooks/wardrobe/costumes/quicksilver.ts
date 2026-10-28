/**
 * Quicksilver: swept-back silver hair, black shades, a blue track top, and the blue afterimages he leaves at speed.
 */

import { INK, r, silhouette } from "../claude";
import type { Costume } from "../claude";

const SILVER = "#D5D8DD";
const SILVERD = "#9AA0A8";
const SILVERL = "#F0F2F4";
const BLUELL = "#85B7EB";
const TRACK_BLUE = "#2D5AA0";
const TRACK_BLUED = "#1F3F73";

const ghost = (dx: number, color: string, opacity: number) =>
  `<g shape-rendering="crispEdges" opacity="${opacity}">${silhouette(dx)
    .map(([x, y, w, h]) => r(x, y, w, h, color))
    .join("")}</g>`;

export const quicksilver: Costume = {
  name: "Quicksilver",
  back: `${ghost(-12, BLUELL, 0.16)}${ghost(-6, BLUELL, 0.3)}`,
  front: `${r(12, 42, 48, 6, TRACK_BLUE)}${r(18, 48, 36, 6, TRACK_BLUE)}${r(36, 42, 24, 6, TRACK_BLUED, 'opacity=".5"')}${r(36, 48, 18, 6, TRACK_BLUED, 'opacity=".5"')}<path d="M38.6 42H42.6L34.6 54H30.6Z" fill="${SILVERL}"/><path d="M44.6 42H46.8L38.8 54H36.6Z" fill="${SILVERL}"/><path d="M54 31.5C55 23.5 52 18.5 46.5 16.5C40 14 31 14.2 24 16.4C17 18.6 10 19 3 18.6C8 21.5 12 22.8 15 23.6C10 25.5 6 27.8 2 30.5C8 31.6 13 31.4 17 31.5Z" fill="${SILVERD}"/><path d="M55 32C56 25 53 20 48 18C42 15.6 33 15.6 26 17.6C20 19.3 14 21 7 21.6C11 23.6 15 24.6 18 25.1C13 26.6 9 28.6 5.5 31C10.5 31.9 14 31.6 17 32Z" fill="${SILVER}"/><path d="M50.5 21.5C42.5 19.2 32 19.4 22 22" stroke="${SILVERL}" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M47.5 25.5C39.5 23.6 30 23.8 20.5 26.2" stroke="${SILVERL}" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M45 29C37.5 27.8 29 28 19.5 29.8" stroke="${SILVERD}" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M53.5 26C54.5 22.5 52.8 20 50 19" stroke="${SILVERL}" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M20 34.5H31.5V40.5L29 43H22.5L20 40.5Z" fill="${INK}"/><path d="M40.5 34.5H52V40.5L49.5 43H43L40.5 40.5Z" fill="${INK}"/>${r(31.5, 35.5, 9, 2, INK)}${r(16.5, 35, 3.5, 1.5, INK)}${r(52, 35, 3.5, 1.5, INK)}<path d="M22.2 35.8H26.4L23.3 41.6H21.8Z" fill="#fff" opacity=".24"/><path d="M42.7 35.8H46.9L43.8 41.6H42.3Z" fill="#fff" opacity=".24"/><path d="M1 45H8M0 50H10M3 55H8" stroke="${BLUELL}" stroke-width="2" stroke-linecap="round"/>`,
};
