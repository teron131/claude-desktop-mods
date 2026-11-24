/**
 * Albert Einstein in his later years: a cloud of white hair wrapping a receding hairline, bushy white brows and mustache, and a gray-brown cardigan over a white shirt, with a black hole floating beside his hand, its glowing disk bent over and under its shadow.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { mirror, SHIRT, twinkle } from "./paint";

const HAIR = "#F1EFEA";
const HAIRD = "#C9C5BC";
const HAIRDD = "#A9A397";
const CARDIGAN = "#857B72";
const CARDIGAND = "#6B625A";
const BUTTON = "#4E463F";
const TROUSER = "#4E4A48";
const SHOE = "#3A2E28";
const VOID = "#07070A";
const HOT = "#FFF6DC";
const DISK = "#FFC857";
const FLARE = "#FF8A3D";

// Seen nearly edge-on: the near side of the disk crosses in front of the shadow, while gravity bends the far side's light into a bright arc over the top and a thin one underneath; the whole hole tilts to lean with the drawing's energy.
const HOLE = { x: 62.6, y: 55.4, tilt: -12 };

// A darker edge round the cloud and its wisps keeps the white hair from vanishing on the pane's light theme.
const WISPS =
  "M12.8 31.8C10.6 30.6 9.4 28.4 9.8 26.4M17.4 25.6C16.4 23.6 16.8 21.4 18.4 20M34.6 21.6C34.4 19.4 35.4 17.6 37.2 16.8M52.2 25.6C53.6 23.8 56 23.2 57.8 23.8M57.8 31.6C60 31 62 31.8 62.8 33.4";
const HAIR_CLOUD = `<path d="${WISPS}" stroke="${HAIRDD}" stroke-width="1.9" fill="none" stroke-linecap="round"/><path d="M14.6 40.4C11 38.6 10.4 34.4 12.8 31.8C11.6 28.4 14 25.2 17.4 25.6C18.4 22 22.6 20.4 25.6 22.4C27.6 19.4 32.4 19 34.6 21.6C37 18.8 42 19.2 43.6 22.2C47 20.4 51.4 22.2 52.2 25.6C55.8 25 58.8 28 57.8 31.6C60.6 33.6 60.6 38 57.4 40.4Z" fill="${HAIR}" stroke="${HAIRDD}" stroke-width=".8"/><path d="${WISPS}" stroke="${HAIR}" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M16 36.4C14.4 34.8 14.6 32.4 16.4 31M24 24.6C26 23.4 28.4 23.4 30.2 24.6M41.6 24.4C43.8 23.4 46.2 23.8 47.6 25.4M55.8 31C57.4 32.6 57.4 35 55.8 36.6" stroke="${HAIRD}" stroke-width=".7" fill="none" stroke-linecap="round"/>`;
// White tufts curl over the head's top corners, leaving the receding forehead bare, and a bushy brow sits over each eye.
const TUFT = `<path d="M17.4 37.6C16.6 34.4 17 31.4 19.2 29.6C20.6 28.6 22.6 28.6 24 29.4C22.2 30.4 21.6 32 21.8 33.8C20.4 34.6 20 36 20.4 37.6Z" fill="${HAIR}"/><path d="M18.6 35.4C18.4 33.4 18.8 31.6 20.2 30.4" stroke="${HAIRD}" stroke-width=".6" fill="none" stroke-linecap="round"/><path d="M22.4 34.6Q25.4 32.8 28.6 34.2" stroke="${HAIR}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
const MUSTACHE = `<path d="M27.4 41.2C29.6 40 33 39.8 36 40.8C39 39.8 42.4 40 44.6 41.2C44.8 43.4 43.6 44.8 41.8 44.6C40.2 44.4 38.4 43.4 36 43.2C33.6 43.4 31.8 44.4 30.2 44.6C28.4 44.8 27.2 43.4 27.4 41.2Z" fill="${HAIR}"/><path d="M30 42.2L29.4 43.8M32.6 41.8L32.2 43.4M39.4 41.8L39.8 43.4M42 42.2L42.6 43.8" stroke="${HAIRD}" stroke-width=".5" stroke-linecap="round"/>`;
// The cardigan's sleeves stop at ribbed cuffs, leaving Claude's own hands bare.
const CARDIGAN_MARKUP = `${r(14.4, 42, 43.2, 6, CARDIGAN)}${r(18, 48, 36, 6, CARDIGAN)}${r(36, 42, 21.6, 6, CARDIGAND, 'opacity=".45"')}${r(36, 48, 18, 6, CARDIGAND, 'opacity=".45"')}${r(14.4, 42, 1.2, 6, CARDIGAND)}${r(56.4, 42, 1.2, 6, CARDIGAND)}<path d="M29.6 42H42.4L36 49.4Z" fill="${SHIRT}"/><path d="M29.6 42L36 49.4L42.4 42M36 49.4V54" stroke="${CARDIGAND}" stroke-width=".7" fill="none"/>${[50.8, 52.8].map((y) => `<circle cx="36.9" cy="${y}" r=".55" fill="${BUTTON}"/>`).join("")}`;
const BLACK_HOLE = `<g transform="rotate(${HOLE.tilt} ${HOLE.x} ${HOLE.y})"><circle cx="${HOLE.x}" cy="${HOLE.y}" r="6.6" fill="${FLARE}" opacity=".16"/><circle cx="${HOLE.x}" cy="${HOLE.y}" r="4.4" fill="none" stroke="${DISK}" stroke-width="1.2" opacity=".9"/><path d="M${HOLE.x - 4.4} ${HOLE.y}A4.4 4.4 0 0 1 ${HOLE.x + 4.4} ${HOLE.y}" stroke="${HOT}" stroke-width=".7" fill="none"/><circle cx="${HOLE.x}" cy="${HOLE.y}" r="3.3" fill="${VOID}"/><ellipse cx="${HOLE.x}" cy="${HOLE.y + 0.4}" rx="9" ry="1.7" fill="${FLARE}" opacity=".85"/><ellipse cx="${HOLE.x}" cy="${HOLE.y + 0.4}" rx="7" ry="1.1" fill="${DISK}"/><ellipse cx="${HOLE.x}" cy="${HOLE.y + 0.4}" rx="4.2" ry=".55" fill="${HOT}"/><ellipse cx="${HOLE.x - 4}" cy="${HOLE.y + 0.4}" rx="2.2" ry=".5" fill="#FFFFFF" opacity=".8"/></g>${twinkle(69.6, 46.8, 1.1, HOT)}`;

export const einstein: Costume = {
  name: "Einstein",
  back: HAIR_CLOUD,
  front: `${CARDIGAN_MARKUP}${TUFT}${mirror(TUFT)}${MUSTACHE}${BLACK_HOLE}`,
  legs: [
    [TROUSER, 3.6],
    [SHOE, 2.4],
  ],
};
