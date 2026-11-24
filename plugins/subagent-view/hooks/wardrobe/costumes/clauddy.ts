/**
 * Clauddy, a smart pistol's AI rising from the gun as Claude, on light rays fanning from the emitter at the rear of its slide in place of legs: a stepped pixel scowl for eyes and no mouth, and a blocky finger gun with a spark at its fingertip; the whole figure leans with the pistol it stands on. The pistol is Claude's own, a charcoal slide with Claude-orange accents and its spark mark, a vented muzzle, status lights and scuffs.
 */

import { BODY, INK, r } from "../claude";
import type { Costume } from "../claude";
import { mirror, twinkle } from "./paint";

const SLIDE = "#363841";
const SLIDED = "#2A2C33";
const TOP = "#5C606C";
const TOPL = "#9AA0AD";
const SCUFF = "#6E727E";
const END = "#24262C";
const FRAME = "#6A7080";
const FRAMEL = "#8E95A3";
const GRIP = "#2E3139";
const GRIPL = "#484D58";
const BORE = "#0F1013";
const ORANGE = "#F08A5D";
const ORANGED = "#B85A3E";
const RAY = "#FFE9A0";
const GLOW = "#FFC93C";
const FLARE = "#FF8A3D";

// The whole drawing leans this far muzzle-up, so Claude stands square on the pistol's slide; everything below is drawn level.
const TILT = 8;
const EMITTER = { x: 41.6, y: 57.6 };

// Each eye's base block is painted over in Claude's orange, a little past its edges so none of it bleeds through when scaled, then redrawn as a scowl on Claude's block grid: a raised outer block and a wider inner one stepping down toward the nose.
const EYE = `${r(21, 37.5, 3, 3, INK)}${r(24, 39, 6, 3, INK)}`;
const EYES = `${r(23.6, 35.6, 3.8, 6.8, BODY)}${r(44.6, 35.6, 3.8, 6.8, BODY)}${EYE}${mirror(EYE)}`;

// The left hand makes a finger gun on Claude's own grid of 3-unit blocks: the index finger runs two blocks out from the top half of the arm and the thumb stands one block up from the arm's end.
const FINGER_GUN = `${r(6, 42, 6, 3, BODY)}${r(12, 39, 3, 3, BODY)}${twinkle(4.2, 43.5, 1.6, GLOW)}`;

const GRIP_MARKUP = `<path d="M37.4 65H47.4L51.4 71H41.6Z" fill="${GRIP}"/><path d="M37.4 65H39L43 71H41.6Z" fill="${GRIPL}"/><path d="M40.6 66.2H45.8L48.8 70.6H43.6Z" fill="${ORANGED}"/><path d="M42 66.8L44.6 70.2M43.6 66.8L46.2 70.2M45.2 66.8L47.4 69.8" stroke="${ORANGE}" stroke-width=".4" opacity=".7"/>`;
const TRIGGER = `<path d="M27 65H37.4L36 69.4H30.4Q27 69.4 27 66.4Z M28.8 65.9V66.6Q28.8 68 30.6 68H34.6L35.2 65.9Z" fill="${FRAME}" fill-rule="evenodd"/><path d="M33.2 65.9Q32.4 66.8 33 67.8" stroke="${GRIPL}" stroke-width=".7" fill="none" stroke-linecap="round"/>`;
// Claude's spark: eight rays round a point, etched in orange on the slide.
const SPARK_MARK = `<path d="${Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return `M${(33.4 + Math.cos(a) * 0.4).toFixed(2)} ${(61.4 + Math.sin(a) * 0.4).toFixed(2)}L${(33.4 + Math.cos(a) * 1.4).toFixed(2)} ${(61.4 + Math.sin(a) * 1.4).toFixed(2)}`;
}).join("")}" stroke="${ORANGE}" stroke-width=".55" stroke-linecap="round"/>`;
const SLIDE_MARKUP = `${r(11, 63.6, 37.6, 1.8, FRAME)}${r(11, 63.6, 37.6, 0.5, FRAMEL)}<path d="M9 59H48.6V63.6H9Z" fill="${SLIDE}"/>${r(9, 62, 39.6, 1.6, SLIDED)}<path d="M9 59L6.6 56.4H46.2L48.6 59Z" fill="${TOP}"/><path d="M9 59H48.6" stroke="${TOPL}" stroke-width=".5"/>${r(9, 60.2, 21, 0.9, ORANGE)}${SPARK_MARK}<path d="M14.6 61L16.4 60.6M19.4 62.6L20.6 62.3M44.6 59.6L46 59.4" stroke="${SCUFF}" stroke-width=".45" stroke-linecap="round"/>${r(22.4, 58.7, 6.8, 1.4, BORE)}${r(23, 59.1, 5.6, 0.5, END)}<path d="M40.6 59.6V62.8M41.8 59.6V62.8M43 59.6V62.8M44.2 59.6V62.8M45.4 59.6V62.8" stroke="${END}" stroke-width=".5"/>${[36.2, 37.6, 39].map((x) => `<circle cx="${x}" cy="60" r=".4" fill="${GLOW}"/>`).join("")}`;
// A compensator on the muzzle: its own end face with the bore, and vents cut through its top.
const MUZZLE = `<path d="M9 59L6.6 56.4V61L9 63.6Z" fill="${END}"/><ellipse cx="7.8" cy="59.6" rx=".9" ry="1.3" fill="${BORE}"/><path d="M9.8 57.8H11.4L10.6 57H9Z M12.6 57.8H14.2L13.4 57H11.8Z" fill="${BORE}"/><path d="M14.8 56.4V59M14.8 59V63.6" stroke="${END}" stroke-width=".5"/><path d="M9.2 55.4H10.6L11 56.4H8.8Z" fill="${END}"/><path d="M43.6 55.2H46.4L46.8 56.4H43.2Z" fill="${END}"/><ellipse cx="${EMITTER.x}" cy="${EMITTER.y}" rx="1.8" ry=".7" fill="${GLOW}" stroke="${END}" stroke-width=".4"/>`;
const PISTOL = `${GRIP_MARKUP}${TRIGGER}${SLIDE_MARKUP}${MUZZLE}`;

// Rays fan from the emitter to Claude's bottom edge and a little into the body, with the core, its glow and a lens streak drawn over the slide.
const RAYS = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
  .map((x, i) => `M${EMITTER.x} ${EMITTER.y}L${x} ${i % 2 ? 50.6 : 52.6}`)
  .join("");
const LIGHT = `<path d="M${EMITTER.x - 1.4} ${EMITTER.y}L18 54H54L${EMITTER.x + 1.4} ${EMITTER.y}Z" fill="${GLOW}" opacity=".16"/>${r(18, 51, 36, 3, GLOW, 'opacity=".22"')}${r(18, 53, 36, 1, RAY, 'opacity=".5"')}<path d="${RAYS}" stroke="${RAY}" stroke-width=".45" opacity=".75"/>`;
const EMITTER_GLOW = `<ellipse cx="${EMITTER.x}" cy="${EMITTER.y}" rx="8" ry=".7" fill="${FLARE}" opacity=".7"/><circle cx="${EMITTER.x}" cy="${EMITTER.y}" r="3.6" fill="${GLOW}" opacity=".3"/><circle cx="${EMITTER.x}" cy="${EMITTER.y}" r="2" fill="${GLOW}" opacity=".6"/><circle cx="${EMITTER.x}" cy="${EMITTER.y}" r="1.1" fill="#FFFFFF"/>`;
const SPARKS = [
  [22, 48.6, 0.5],
  [31.4, 46.4, 0.4],
  [49.6, 47.8, 0.45],
  [57.4, 50.6, 0.4],
  [14.6, 52.4, 0.35],
]
  .map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${s}" fill="${RAY}"/>`)
  .join("");

export const clauddy: Costume = {
  name: "Clauddy",
  legs: false,
  tilt: TILT,
  front: `${FINGER_GUN}${EYES}${LIGHT}${SPARKS}${PISTOL}${EMITTER_GLOW}`,
};
