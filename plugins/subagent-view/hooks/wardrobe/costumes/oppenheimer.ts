/**
 * J. Robert Oppenheimer as in his photographs: a wide-brimmed tan porkpie hat with a dark band, and a gray suit over a white shirt and navy tie, holding a smoking pipe in front of a blast of fire.
 */

import { r } from "../claude";
import type { Costume } from "../claude";
import { mirror, SHIRT } from "./paint";

const HAT = "#A39380";
const HATD = "#7E7062";
const HATL = "#C2B4A0";
const BAND = "#3B332C";
const SUIT = "#5B5654";
const SUITD = "#47423F";
const SUITL = "#77726E";
const TIE = "#2E3A52";
const PIPE = "#3E2416";
const PIPED = "#21130B";
const PIPEL = "#7A4E2E";
const SMOKE = "#D9D4CC";
const TROUSER = "#55504D";
const SHOE = "#2F2A27";
const FIRE_DARK = "#8E2A1A";
const FIRE = "#D9552A";
const FIRE_BRIGHT = "#F28A36";
const GLOW = "#FFC24D";
const CORE = "#FFF1C9";

// The blast is rings of flame tongues around a point behind his face, each ring hotter and smaller than the one outside it. Tongues reach out on an ellipse wider than tall and shorter below, so the fire fills the drawing above his arms and stops before his feet, and each tip curls clockwise as if the fire swirls.
const BLAST = { x: 36, y: 31, across: 36, up: 31, down: 23 };
// A fixed spread of tongue lengths keeps the edge ragged and the same on every deal.
const REACH = [1, 0.84, 0.96, 0.8, 1, 0.86, 0.94, 0.82, 1, 0.85, 0.97, 0.81];
// The notches between tongues sit at this share of a ring's reach; lower makes longer, thinner tongues.
const NOTCH = 0.68;
const blastPoint = (angle: number, reach: number) => {
  const x = BLAST.x + Math.cos(angle) * BLAST.across * reach;
  const y = BLAST.y + Math.sin(angle) * (Math.sin(angle) < 0 ? BLAST.up : BLAST.down) * reach;
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
};
// A ring turned by half a tongue sets its tongues between those of the ring behind it.
function flames(scale: number, turn: number, fill: string): string {
  const step = (2 * Math.PI) / REACH.length;
  const tongues = REACH.map((reach, i) => {
    const angle = (i + turn) * step;
    const tip = angle + step * 0.35;
    return `C${blastPoint(angle - step * 0.35, scale * 0.82)} ${blastPoint(tip - step * 0.15, scale * reach * 0.92)} ${blastPoint(tip, scale * reach)}C${blastPoint(tip - step * 0.05, scale * reach * 0.8)} ${blastPoint(angle + step * 0.45, scale * 0.75)} ${blastPoint(angle + step / 2, scale * NOTCH)}`;
  });
  return `<path d="M${blastPoint((turn - 0.5) * step, scale * NOTCH)}${tongues.join("")}Z" fill="${fill}"/>`;
}
const BLAST_MARKUP = `${flames(1, 0, FIRE_DARK)}${flames(0.88, 0.5, FIRE)}${flames(0.76, 0.25, FIRE_BRIGHT)}${flames(0.62, 0.75, GLOW)}${flames(0.46, 0, CORE)}`;

// A porkpie: a flat brim wider than the head, and a low crown with a flat, pinched top and a dark band.
const HAT_MARKUP = `<path d="M20.6 29.6L21.8 20.8C22 19.6 23 19 24.4 19H47.6C49 19 50 19.6 50.2 20.8L51.4 29.6Z" fill="${HAT}"/><path d="M36 19H47.6C49 19 50 19.6 50.2 20.8L51.4 29.6H36Z" fill="${HATD}" opacity=".4"/><path d="M23.4 20.8H48.6" stroke="${HATL}" stroke-width=".7" stroke-linecap="round"/><path d="M21.2 26H50.8L51.2 29H20.8Z" fill="${BAND}"/><path d="M11 30.6C11 28.8 20 27.6 36 27.6C52 27.6 61 28.8 61 30.6C61 32.2 52 32.8 36 32.8C20 32.8 11 32.2 11 30.6Z" fill="${HAT}"/><path d="M12.4 31.4C17 32.4 26 32.8 36 32.8C46 32.8 55 32.4 59.6 31.4" stroke="${HATD}" stroke-width=".8" fill="none"/><path d="M14 29.4C20 28.4 28 28 36 28" stroke="${HATL}" stroke-width=".6" fill="none" stroke-linecap="round"/>`;
// He holds the pipe by its stem in his right hand, the bowl just past his fingertips with smoke curling up from it. It is dark briar and larger than life, which is what keeps it from melting into the fire behind it at the pane's size.
const PIPE_MARKUP = `<path d="M57.1 44.6L62.8 43.3" stroke="${PIPED}" stroke-width="1.4" stroke-linecap="round"/><path d="M61.8 37.8H67.8L67 44.1C66.7 45.4 65.7 46.2 64.6 46.2C63.6 46.2 62.6 45.4 62.3 44.1Z" fill="${PIPE}"/><path d="M63.2 39.2L63.6 44" stroke="${PIPEL}" stroke-width=".8" stroke-linecap="round"/><path d="M61.8 37.8H67.8" stroke="${PIPED}" stroke-width=".9"/><path d="M64.9 36.3C63.1 33.9 66.7 32.1 64.9 29.5C63.9 28 64.9 26.9 65.9 26.4" stroke="${SMOKE}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".8"/>`;
// The jacket's sleeves stop at white cuffs, leaving Claude's own hands bare, and its lapels open on the shirt and tie.
const jacketPanel = (fill: string) =>
  `<path d="M15.4 42H27.6L33.6 54H18V48H15.4Z" fill="${fill}"/><path d="M27.6 42L33.6 54" stroke="${SUITL}" stroke-width=".7" fill="none"/>`;
const SUIT_MARKUP = `${r(14.4, 42, 43.2, 6, SHIRT)}${r(18, 48, 36, 6, SHIRT)}${jacketPanel(SUIT)}${mirror(jacketPanel(SUITD))}<path d="M34.8 42H37.2L37.8 44L37 52L36 53.4L35 52L34.2 44Z" fill="${TIE}"/>`;

export const oppenheimer: Costume = {
  name: "Oppenheimer",
  back: BLAST_MARKUP,
  front: `${SUIT_MARKUP}${HAT_MARKUP}${PIPE_MARKUP}`,
  legs: [
    [TROUSER, 3.6],
    [SHOE, 2.4],
  ],
};
