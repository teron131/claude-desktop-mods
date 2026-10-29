/**
 * Claude, the pixel mascot of Claude Code's welcome screen, drawn block for block as the terminal draws it, wearing a costume drawn behind and in front of it.
 */

export type Costume = {
  name: string;
  // Drawn behind Claude, as a cape is.
  back?: string;
  front: string;
  // Clothing down Claude's four legs in bands from the hip, such as trousers over boots, whose heights add up to the legs' 6, or false for no legs, as the genie rises from its lamp on smoke.
  // The legs stand on the pane itself, so a band meant as black takes a lifted charcoal that still shows on a dark pane.
  legs: [fill: string, height: number][] | false;
};

export const INK = "#1F1E1D";
// The silhouette's bottom row: Claude's four legs.
const LEGS_TOP = 54;
// Claude stays orange whatever a subagent's status, which the pane's bar shows instead, so a costume's own reds never read as a failure.
// It is hex since the desktop draws an Svg as an image outside the app's theme.
const BODY = "#D97757";

// The welcome screen's ▐▛███▜▌ / ▝▜█████▛▘ / ▘▘ ▝▝ at quarter-cell resolution; a terminal cell is about twice as tall as wide, so each quarter block is 3 wide and 6 tall.
export const silhouette = (dx = 0) =>
  (
    [
      [18, 30, 36, 6],
      [18, 36, 36, 6],
      [12, 42, 48, 6],
      [18, 48, 36, 6],
      [21, 54, 3, 6],
      [27, 54, 3, 6],
      [42, 54, 3, 6],
      [48, 54, 3, 6],
    ] as const
  ).map(([x, y, w, h]) => [x + dx, y, w, h] as const);

export const r = (x: number, y: number, w: number, h: number, fill: string, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

export function drawClaude({ back = "", front, legs }: Costume): string {
  const blocks = silhouette().filter(([, y]) => legs !== false || y < LEGS_TOP);
  const clothes = legs === false ? "" : dressLegs(legs);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 70">${back}<g shape-rendering="crispEdges">${blocks.map(([x, y, w, h]) => r(x, y, w, h, BODY)).join("")}${r(24, 36, 3, 6, INK)}${r(45, 36, 3, 6, INK)}</g>${clothes}${front}</svg>`;
}

function dressLegs(bands: [fill: string, height: number][]): string {
  let markup = "";
  for (const [x, , width] of silhouette().filter(([, y]) => y === LEGS_TOP)) {
    let top = LEGS_TOP;
    for (const [fill, height] of bands) {
      markup += r(x, top, width, height, fill);
      top += height;
    }
  }
  return markup;
}
