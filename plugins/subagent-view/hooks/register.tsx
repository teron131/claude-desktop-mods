/**
 * Lists the session's subagents in a pane as a tree, each with its task, model, effort and type, Total's figures for how long it ran, its tokens and pace, and a bar on a clock zoomed to the rows on screen.
 * In the terminal a row's button opens its transcript, and in the desktop app one button opens the app's Background tasks list.
 * The pane opens only when asked: on the desktop a button under each Agent call opens it, and `/subagents` shows or hides it anywhere.
 *
 * Subagents started before the mod loaded, in this process, an earlier one, or a transcript the session left at a rewind, are read from the transcripts Claude Code keeps for them, and the hooks follow every start, request and end after that.
 * The effort shown is what each request was sent with, read where the request leaves the hook chain, so another mod's rewrite, such as subagent-models', counts whichever mod's hook runs first.
 */

import { atom, read, update } from "claude-code";
import type { EngineInterface, Register } from "claude-code";

import type { Subagent } from "../types";
import { busyAxis } from "./axis";
import { formatCounts, formatFigures, formatSetup } from "./format";
import { addTokens, countTokens, NO_TOKENS } from "./tokens";
import { readSessionSubagents } from "./transcripts";
import { dealCostumes, drawClaude } from "./wardrobe";
import type { Costume } from "./wardrobe";

const PANE = "subagent-view";
const TITLE = "Subagents";
// Color is kept for what needs attention: Claude's color while an agent works, red when one fails, and gray once one is done.
const MARKS = {
  running: { glyph: "●", color: "claude", label: "Running" },
  done: { glyph: "✓", color: "inactive", label: "Done" },
  failed: { glyph: "✗", color: "error", label: "Failed" },
} as const;
// A translucent gray reads the same on light and dark panes.
const TRACK = "#8080802e";
// The desktop refuses a pane drawing of over 2000 elements, so the list draws at most this many rows, leaving out the oldest.
const LIST_ROWS = 80;
// It also refuses one past 262144 characters, Svg markup included, and a costumed Claude runs to thousands, so only the rows nearest the window wear costumes, up to this much markup, and the rest draw Claude plain.
const COSTUME_BUDGET = 150_000;
const PLAIN = drawClaude({ name: "Claude", front: "" });
// The pane's rows the header and each subagent's row take, fixed so the pane's scroll position says exactly which rows are on screen.
// Both hold their lines and a blank after: on the terminal whole lines, on the desktop lines of the pane's text, where the header's button stands taller than one.
const HEADER_ROWS = { terminal: 3, drawn: 4 } as const;
// A row holds its title and bar, then its setup and figures side by side on one line or stacked on two.
const ROW_ROWS = { inline: 4, stacked: 5 } as const;
// Columns a row's text gives up to the status mark beside it: the terminal's glyph, or the drawn Claude.
const MARK_COLUMNS = { terminal: 2, drawn: 6 } as const;
// The cells a character of caption text takes where the pane is drawn, whose proportional face sets a row's setup and figures at 0.6 to 0.65 a character; the margin keeps a line judged to fit from truncating.
const CAPTION_CELLS = 0.75;
// Remix Icon's robot-3-line (https://remixicon.com, Apache-2.0), the icon react-icons calls RiRobot3Line.
// The desktop draws an Svg as an image, so the icon follows the system's dark mode rather than the page's colors.
const ROBOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><style>path{fill:#73726c}@media (prefers-color-scheme:dark){path{fill:#a3a29b}}</style><path d="M11 1V2H7C5.34315 2 4 3.34315 4 5V8C4 10.7614 6.23858 13 9 13H15C17.7614 13 20 10.7614 20 8V5C20 3.34315 18.6569 2 17 2H13V1H11ZM6 5C6 4.44772 6.44772 4 7 4H17C17.5523 4 18 4.44772 18 5V8C18 9.65685 16.6569 11 15 11H9C7.34315 11 6 9.65685 6 8V5ZM9.5 9C10.3284 9 11 8.32843 11 7.5C11 6.67157 10.3284 6 9.5 6C8.67157 6 8 6.67157 8 7.5C8 8.32843 8.67157 9 9.5 9ZM14.5 9C15.3284 9 16 8.32843 16 7.5C16 6.67157 15.3284 6 14.5 6C13.6716 6 13 6.67157 13 7.5C13 8.32843 13.6716 9 14.5 9ZM6 22C6 18.6863 8.68629 16 12 16C15.3137 16 18 18.6863 18 22H20C20 17.5817 16.4183 14 12 14C7.58172 14 4 17.5817 4 22H6Z"/></svg>`;

const RELINK_MS = 2_000;
const RELINK_FOR_MS = 30_000;

const subagents = atom({ plugin: "subagent-view", key: "subagents" } as const, []);

export const register: Register = (on) => {
  on("session.start", async ($, e, next) => {
    const started = await next(e);
    await $.command.register({
      name: "subagents",
      description: "Show or hide the list of this session's subagents",
    });
    // Redraws each second while a subagent runs, so its time counts up.
    $.clock.every(1000, () => void redrawWhileRunning($));
    // A rewind starts a process whose transcript the app's record names only seconds later, so a read that finds no record is redone until it appears.
    if (await addFromDisk($)) return started;
    const startedAt = await $.clock.now();
    const relinking = $.clock.every(RELINK_MS, () => {
      addFromDisk($).then(
        async (isLinked) => {
          if (isLinked || (await $.clock.now()) - startedAt >= RELINK_FOR_MS) relinking.cancel();
        },
        (error: unknown) => {
          relinking.cancel();
          $.ui.log(`subagent-view: ${String(error)}`, { to: "debug" });
        },
      );
    });
    return started;
  });

  on("command.run", { command: "subagents" }, async ($) => {
    if ((await $.ui.panes()).some((pane) => pane.id === PANE)) {
      await $.ui.close({ id: PANE });
      return { text: "Subagents pane closed." };
    }
    await $.ui.open({ id: PANE, title: TITLE });
    return { text: "Subagents pane opened." };
  });

  on("agent.spawn", async ($, e, next) => {
    const started = await next(e);
    if (started.agentId === undefined) return started;
    const agentId = started.agentId;
    const startedAt = await $.clock.now();
    // A resumed agent spawns again under its id and runs on in its row, keeping its first start, latest response, and the tokens and response time so far.
    await update($, subagents, (list) => {
      const resumed = list.find((one) => one.agentId === agentId);
      const subagent: Subagent =
        resumed === undefined
          ? {
              agentId,
              parentId: e.parentAgentId,
              description: e.description,
              type: e.subagentType,
              model: started.model,
              startedAt,
              tokens: NO_TOKENS,
              responseMs: 0,
              status: "running",
            }
          : {
              agentId,
              parentId: resumed.parentId,
              description: resumed.description,
              type: resumed.type,
              model: resumed.model,
              effort: resumed.effort,
              startedAt: resumed.startedAt,
              respondedAt: resumed.respondedAt,
              tokens: resumed.tokens,
              responseMs: resumed.responseMs,
              status: "running",
            };
      return [...list.filter((one) => one.agentId !== agentId), subagent];
    });
    return started;
  });

  on("turn.step", async function* ($, e, next) {
    const sentAt = await $.clock.now();
    const step = yield* next(e);
    if (e.agentId === undefined) return step;
    // The deepest link received the request as every hook above it left it, which is the request sent.
    const sent = next.trace.at(-1)?.received ?? e;
    const respondedAt = await $.clock.now();
    const { usage } = step;
    const tokens = usage === null ? undefined : countTokens(usage);
    await update($, subagents, (list) =>
      list.map((one) =>
        one.agentId !== e.agentId
          ? one
          : {
              ...one,
              respondedAt,
              model: usage?.model ?? sent.model,
              effort: sent.effort,
              ...(tokens !== undefined && {
                tokens: addTokens(one.tokens, tokens),
                responseMs: one.responseMs + respondedAt - sentAt,
              }),
            },
      ),
    );
    return step;
  });

  on("turn.complete", async ($, e, next) => {
    if (e.agentId !== undefined) {
      const now = await $.clock.now();
      const status = e.reason === "answer" ? "done" : "failed";
      // A row ends at its latest response, since an agent stopped long after it went quiet would otherwise stretch to the stop.
      await update($, subagents, (list) =>
        list.map((one) =>
          one.agentId === e.agentId ? { ...one, status, endedAt: one.respondedAt ?? now } : one,
        ),
      );
    }
    return next(e);
  });

  on("ui.render", { component: "Pane", requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e);
    const list = await read($, subagents);
    if (list.length === 0) return <Text dimColor>No subagents yet.</Text>;

    const at = await $.clock.now();
    const endOf = (one: Subagent) => (one.status === "running" ? at : one.endedAt);
    const spanOf = (one: Subagent) => [one.startedAt, endOf(one)] as const;
    const viewed = e.props.view.agentId;
    const rows = inTreeOrder(dealCostumes(list))
      .slice(0, LIST_ROWS)
      .map((row) => ({
        ...row,
        setup: formatSetup(row.one),
        figures: formatFigures(
          endOf(row.one) - row.one.startedAt,
          row.one.tokens,
          row.one.responseMs,
        ),
      }));

    const isTerminal = e.surface === "terminal";
    const headerRows = isTerminal ? HEADER_ROWS.terminal : HEADER_ROWS.drawn;
    // Setup and figures share a line, two cells apart, only when every row's pair fits, so the rows keep one height and their figures one column.
    const cells = (text: string) => (isTerminal ? text.length : text.length * CAPTION_CELLS);
    const textColumns =
      e.props.bodyColumns - (isTerminal ? MARK_COLUMNS.terminal : MARK_COLUMNS.drawn);
    const isInline = rows.every(
      ({ setup, figures }) => cells(setup) + 2 + cells(figures) <= textColumns,
    );
    const rowRows = isInline ? ROW_ROWS.inline : ROW_ROWS.stacked;

    const { offset, bodyRows } = e.props.scroll;
    const rowAt = (paneRow: number) =>
      Math.min(rows.length - 1, Math.max(0, Math.floor((paneRow - headerRows) / rowRows)));
    const first = rowAt(offset);
    const last = Math.max(first, rowAt(offset + bodyRows - 1));
    const partly = rows.slice(first, last + 1);
    // The bars' clock zooms to the rows whose bar is on screen, so the bars in view fill the width wherever the list is scrolled; a row showing only its title or figures doesn't count, and a pane too short for a whole bar zooms to the rows partly in view.
    const barLine = (i: number) => headerRows + (first + i) * rowRows + 1;
    const withBar = partly.filter((_, i) => barLine(i) >= offset && barLine(i) < offset + bodyRows);
    const { place, span } = busyAxis(
      (withBar.length > 0 ? withBar : partly).map(({ one }) => spanOf(one)),
    );

    const bar = (one: Subagent) => {
      const before = place(one.startedAt);
      const during = place(endOf(one)) - before;
      const after = span - before - during;
      const color = MARKS[one.status].color;
      if (e.surface !== "desktop") {
        const width = Math.max(8, e.props.bodyColumns - 4);
        const lead = Math.round((width * before) / span);
        const run = Math.max(1, Math.round((width * during) / span));
        return (
          <Text>
            <Text dimColor>{"─".repeat(lead)}</Text>
            <Text color={color}>{"━".repeat(run)}</Text>
            <Text dimColor>{"─".repeat(Math.max(0, width - lead - run))}</Text>
          </Text>
        );
      }
      // Flex shares place the bar on a thin track that stretches with the pane, in thousandths since the app caps a share at 10000; the bar is at least two cells long, so a seconds-long run still reads as a dash rather than a tick.
      const share = (ms: number) => Math.round((1000 * ms) / span);
      return (
        <Box flexDirection="row" alignItems="center" height={0.4}>
          <Box flexGrow={share(before)} height={0.15} backgroundColor={TRACK} />
          <Box flexGrow={share(during)} minWidth={2} height={0.4} backgroundColor={color} />
          <Box flexGrow={share(after)} height={0.15} backgroundColor={TRACK} />
        </Box>
      );
    };

    // The rows nearest the middle of the screen take their costumes first, while the budget lasts.
    const middle = (first + last) / 2;
    const dressed = new Map<string, string>();
    let budget = COSTUME_BUDGET;
    const nearestFirst = rows
      .map(({ one }, i) => ({ one, distance: Math.abs(i - middle) }))
      .toSorted((a, b) => a.distance - b.distance);
    for (const { one } of nearestFirst) {
      const drawing = drawClaude(one.costume);
      budget -= drawing.length;
      if (budget < 0) break;
      dressed.set(one.agentId, drawing);
    }

    const mark = ({ agentId, status, costume }: Subagent & { costume: Costume }) => {
      const { glyph, color, label } = MARKS[status];
      if (e.surface !== "desktop") return <Text color={color}>{glyph}</Text>;
      const { Svg } = $.ui.resolve(e);
      const drawing = dressed.get(agentId);
      return (
        <Svg
          source={drawing ?? PLAIN}
          alt={drawing === undefined ? `${label}, Claude` : `${label}, Claude as ${costume.name}`}
          width={36}
          height={35}
        />
      );
    };

    const open = async (agentId: string | undefined) => {
      const { deny } = await $.ui.view(agentId === undefined ? {} : { agentId });
      if (deny !== undefined) $.ui.toast(`Couldn't open that transcript: ${deny}`);
    };

    // The desktop app's own view tool, which it gives every session it runs, is the one way a mod reaches its Background tasks list; it takes no agent, so the list opens and the person picks the transcript there.
    const showTasks = async () => {
      const { isError, content } = await $.mcp.call("ccd_view", "show_pane", { pane: "tasks" });
      if (isError)
        $.ui.toast(
          `Couldn't open Background tasks: ${content.map((block) => block.text ?? "").join(" ")}`,
        );
    };

    // Every line truncates rather than wraps, so a row keeps its fixed height in a pane too narrow for it.
    return (
      <Box flexDirection="column">
        <Box height={headerRows} overflow="hidden" flexDirection="column" gap="xs">
          <Text dimColor size="caption" wrap="truncate-end">
            {formatCounts(list)}
          </Text>
          <Text dimColor size="caption" tabular wrap="truncate-end">
            {formatFigures(
              busyAxis(list.map(spanOf)).busy,
              list.reduce((total, one) => addTokens(total, one.tokens), NO_TOKENS),
              list.reduce((total, one) => total + one.responseMs, 0),
            )}
          </Text>
          {e.surface === "desktop" && (
            <Box flexDirection="row">
              <Button
                key="background-tasks"
                label="Open Background tasks"
                plain
                onPress={() => void showTasks()}
              />
            </Box>
          )}
        </Box>
        {rows.map(({ one, branch, setup, figures }) => (
          <Box key={`row-${one.agentId}`} height={rowRows} flexDirection="row" gap="sm">
            {mark(one)}
            <Box flexDirection="column" gap="xs" flexGrow={1} minWidth={0}>
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Box flexGrow={1} minWidth={0}>
                  <Text weight="semibold" wrap="truncate-end">
                    {branch !== "" && (
                      <Text weight="regular" dimColor>
                        {branch}
                      </Text>
                    )}
                    {one.description || one.type}
                  </Text>
                </Box>
                {/* Claude Code can switch only the terminal's own transcript view; the desktop app draws its own, and there the view call answers "no main view here". The row in view goes back to the main conversation, every other row opens its own transcript. */}
                {e.surface === "terminal" && (
                  <Button
                    key={`open-${one.agentId}`}
                    label={one.agentId === viewed ? "‹" : "›"}
                    plain
                    onPress={() => void open(one.agentId === viewed ? undefined : one.agentId)}
                  />
                )}
              </Box>
              {bar(one)}
              <Box
                flexDirection={isInline ? "row" : "column"}
                justifyContent="space-between"
                gap={isInline ? "sm" : "xs"}
              >
                <Text dimColor size="caption" wrap="truncate-end">
                  {setup}
                </Text>
                <Text dimColor size="caption" tabular wrap="truncate-end">
                  {figures}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}
        {list.length > LIST_ROWS && (
          <Text dimColor size="caption">
            {`${list.length - LIST_ROWS} older subagents are left out.`}
          </Text>
        )}
      </Box>
    );
  });

  // The desktop gives a mod no place in its own panels, so the way to the pane sits under each subagent's Agent call.
  on("ui.render", { component: "ToolUse", surface: "desktop" }, async ($, e, next) => {
    if (e.props.tool !== "Agent") return next(e);
    const { Box, Button, Svg } = $.ui.resolve(e);
    // A Button holds only text, so the icon sits beside it and only the label is pressable.
    return (
      <Box flexDirection="column" gap="xs">
        {await next(e)}
        <Box flexDirection="row" alignItems="center" gap={0}>
          <Svg source={ROBOT} alt="Robot" width={18} height={18} />
          <Button label={TITLE} plain onPress={() => void $.ui.open({ id: PANE, title: TITLE })} />
        </Box>
      </Box>
    );
  });
};

// Each top-level agent is followed by the agents it started, oldest first, so a parent's bar sits above the bars inside its span; an agent whose parent isn't listed counts as top-level.
function inTreeOrder<T extends Subagent>(list: readonly T[]): { one: T; branch: string }[] {
  const listed = new Set(list.map((one) => one.agentId));
  const isChild = (one: Subagent) => one.parentId !== undefined && listed.has(one.parentId);
  const rows: { one: T; branch: string }[] = [];
  const add = (one: T, depth: number, isLast: boolean) => {
    rows.push({
      one,
      branch: depth === 0 ? "" : `${"  ".repeat(depth - 1)}${isLast ? "└" : "├"} `,
    });
    const children = list
      .filter((child) => child.parentId === one.agentId)
      .sort((a, b) => a.startedAt - b.startedAt);
    children.forEach((child, i) => add(child, depth + 1, i === children.length - 1));
  };
  list
    .filter((one) => !isChild(one))
    .sort(
      (a, b) =>
        Number(b.status === "running") - Number(a.status === "running") ||
        b.startedAt - a.startedAt,
    )
    .forEach((one) => add(one, 0, false));
  return rows;
}

async function redrawWhileRunning($: EngineInterface): Promise<void> {
  if ((await read($, subagents)).some((one) => one.status === "running"))
    $.ui.invalidate("ui.render");
}

// Rows read from disk replace the ones held for the same agents, since the transcripts hold every request made so far, and a row held from an earlier load of the mod may be out of date.
// Resolves whether the session's earlier transcripts could be found, which the session's start retries until they are.
async function addFromDisk($: EngineInterface): Promise<boolean> {
  const { subagents: found, isLinked } = await readSessionSubagents($);
  const ids = new Set(found.map((one) => one.agentId));
  await update($, subagents, (list) => [...found, ...list.filter((one) => !ids.has(one.agentId))]);
  return isLinked;
}
