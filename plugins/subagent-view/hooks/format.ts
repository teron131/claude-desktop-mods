/**
 * How the pane's figures read: counts, durations, models, effort, tokens and pace.
 */

import type { Subagent, Tokens } from "../types";

export function formatCounts(list: readonly Subagent[]): string {
  return (["running", "done", "failed"] as const)
    .map((status) => [status, list.filter((one) => one.status === status).length] as const)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${count} ${status}`)
    .join(" · ");
}

// Model and effort lead, so a line cut short for room keeps them, and the type, much the same from row to row, goes last.
export function formatSetup({ type, model, effort }: Subagent): string {
  return [formatModel(model), ...(effort === undefined ? [] : [String(effort)]), type].join(" · ");
}

// A model id reads as the app names it, its family capitalized and its version dotted, dropping any date; an alias or other id shows as given.
function formatModel(model: string): string {
  const match = /(fable|opus|sonnet|haiku)-(\d+)(?:-(\d{1,2}))?(?!\d)/.exec(model);
  if (match === null) return model.replace(/^claude-/, "");
  const [, family = "", major = "", minor] = match;
  const version = minor === undefined ? major : `${major}.${minor}`;
  return `${family.charAt(0).toUpperCase()}${family.slice(1)} ${version}`;
}

// Total's line for a turn, short of its cost: how long it ran, then once it has sent requests, the prompt tokens with the cache's share, the tokens generated, and tokens generated a second while responses were coming.
export function formatFigures(
  durationMs: number,
  { input, cached, output }: Tokens,
  responseMs: number,
): string {
  const parts = [formatDuration(durationMs)];
  if (input > 0)
    parts.push(
      `${formatCount(input)} (${Math.round((100 * cached) / input)}%) in`,
      `${formatCount(output)} out`,
    );
  if (responseMs > 0) parts.push(`${Math.round(output / (responseMs / 1000))} tps`);
  return parts.join(" · ");
}

// Total's duration and count formats, so the same figure reads the same in both mods.
function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds % 60}s`;
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

function formatCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 999_500) return `${Math.round(count / 1e3)}k`;
  if (count < 999_995_000) return `${(count / 1e6).toFixed(2)}M`;
  return `${(count / 1e9).toFixed(2)}B`;
}
