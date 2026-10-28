/**
 * Colors and drawing helpers more than one costume uses; a costume's own colors stay in its file.
 */

export const RED = "#E24B4A";
export const REDD = "#B83A39";
export const GOLD = "#E8B931";
export const GOLDD = "#B8862B";
export const GOLDDD = "#8E6418";
export const GOLDL = "#F7DE7A";
export const BELT = "#5A3A22";
export const IGOLDD = "#C4921C";

export const twinkle = (x: number, y: number, s: number, fill: string) =>
  `<path d="M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${fill}"/>`;

export const gem = (cx: number, cy: number, rx: number, ry: number, fill: string) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${IGOLDD}" stroke-width=".5"/><circle cx="${cx - rx * 0.35}" cy="${cy - ry * 0.35}" r="${Math.min(rx, ry) * 0.32}" fill="#fff" opacity=".85"/>`;

export const mirror = (markup: string) =>
  `<g transform="translate(72 0) scale(-1 1)">${markup}</g>`;
