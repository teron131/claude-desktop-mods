/**
 * Deals the wardrobe's costumes to a session's subagents so the pane's neighboring rows look apart and every row keeps its costume across redraws.
 */

import type { Costume } from "./claude";
import * as costumes from "./costumes";

type Started = { agentId: string; parentId?: string; startedAt: number };

// Agents draw costumes in start order from shuffled rounds of the whole wardrobe, so costumes seldom repeat before all are out and no fixed sequence shows.
// Each draw passes over the costumes two rows above and below where the agent joins the pane's tree, and the one drawn just before it; the rows that later join between them do the same, so neighbors stay apart.
// The earliest agent's id seeds the shuffles and a draw depends only on agents started earlier, so a row keeps its costume as more agents start.
export function dealCostumes<T extends Started>(
  agents: readonly T[],
): (T & { costume: Costume })[] {
  const byStart = agents.toSorted(
    (a, b) => a.startedAt - b.startedAt || a.agentId.localeCompare(b.agentId),
  );
  const session = byStart[0]?.agentId ?? "";
  const rows: (T & { costume: Costume })[] = [];
  const dealt: (T & { costume: Costume })[] = [];
  let bag: Costume[] = [];
  let rounds = 0;
  for (const agent of byStart) {
    const at = rowFor(agent, rows);
    const avoid = new Set(
      [dealt.at(-1), ...rows.slice(Math.max(0, at - 2), at + 2)].map((one) => one?.costume),
    );
    let costume = bag.find((one) => !avoid.has(one));
    while (costume === undefined) {
      bag = [...bag, ...shuffled(session, rounds++)];
      costume = bag.find((one) => !avoid.has(one));
    }
    bag.splice(bag.indexOf(costume), 1);
    const dressed = { ...agent, costume };
    rows.splice(at, 0, dressed);
    dealt.push(dressed);
  }
  return dealt;
}

// Where the pane's tree puts a newly started agent: one whose parent is listed goes after that parent's descendants, oldest first, and any other above the rest, newest first.
function rowFor(agent: Started, rows: readonly Started[]): number {
  const parentAt = rows.findIndex((row) => row.agentId === agent.parentId);
  if (parentAt === -1) return 0;
  const isUnderParent = (row: Started) => {
    for (
      let id = row.parentId;
      id !== undefined;
      id = rows.find((one) => one.agentId === id)?.parentId
    ) {
      if (id === agent.parentId) return true;
    }
    return false;
  };
  const after = rows.findIndex((row, i) => i > parentAt && !isUnderParent(row));
  return after === -1 ? rows.length : after;
}

function shuffled(session: string, round: number): Costume[] {
  const key = (costume: Costume) => hash(`${session}/${round}/${costume.name}`);
  return Object.values(costumes).toSorted((a, b) => key(a) - key(b));
}

// FNV-1a, then MurmurHash3's finalizer, so keys that differ only in their last characters still sort apart.
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 0x01000193);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}
