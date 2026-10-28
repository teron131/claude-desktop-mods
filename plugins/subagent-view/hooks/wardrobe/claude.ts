/**
 * Claude, the pixel mascot of Claude Code's welcome screen, drawn block for block as the terminal draws it, wearing a costume drawn behind and in front of it.
 */

export type Costume = {
  name: string;
  // Drawn behind Claude, as a cape is.
  back?: string;
  front: string;
  // The genie rises from its lamp on smoke instead of standing.
  legs?: false;
};

export const INK = "#1F1E1D";
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
  const blocks = silhouette().filter(([, y]) => legs !== false || y < 54);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 70">${back}<g shape-rendering="crispEdges">${blocks.map(([x, y, w, h]) => r(x, y, w, h, BODY)).join("")}${r(24, 36, 3, 6, INK)}${r(45, 36, 3, 6, INK)}</g>${front}</svg>`;
}
