/**
 * Writes each turn's figures under its final answer in the desktop transcript, past turns included, and the session's sum as the mod's status line under the prompt: how long the turn worked, the prompt tokens its requests sent with the cache's share, the tokens they generated, how fast, and what it cost; the desktop shows none of these, and the terminal only a turn's time.
 *
 * A drawn message carries no turn position, so answers are known by text: past ones read from the session's transcripts once per load, each later one taken from its turn's end with the engine's figures and the mod's own timing of its requests.
 * Only the main conversation's requests count toward tokens and speed; a subagent's are its own.
 *
 * Cost is the engine's API-equivalent spend as `/cost` totals it, subagents included: the sum shows the session's, and a turn what that total grew by while the turn ran.
 * Transcripts record no turn's cost, so Total saves each one it measures under `~/.claude/total-costs`, and a turn it never saw run shows none.
 *
 * The manifest name is `Total` because the desktop labels a mod's status line with it and ignores `displayName`, so the sum reads as part of the footer.
 */

import type { EngineInterface, ModelUsage, Register } from "claude-code";

import { registerMakeRoom } from "./make-room";

// Claude Code's binary runs as its embedded ripgrep when started as rg, and the mod's commands are its children: Linux finds the parent's executable under /proc, macOS through ps.
const EMBEDDED_RIPGREP =
  'exe=/proc/$PPID/exe; [ -e "$exe" ] || exe=$(ps -o comm= -p "$PPID"); exec -a rg "$exe" "$@"';
// Windows finds it through PowerShell, which prints it in UTF-8 so a path outside the console's code page arrives whole.
const PARENT_EXECUTABLE =
  "[Console]::OutputEncoding = [Text.Encoding]::UTF8; (Get-Process -Id (Get-CimInstance Win32_Process -Filter ProcessId=$PID).ParentProcessId).Path";

// Only the fields a tally reads, since whole records reach tens of megabytes in a long session.
// Each is matched by its own key because key order differs between records, as between one response's usage and another's.
// Only a response carries a `msg_` id, so an API error's record drops out, as its failed request does from a live count.
// A usage object nests three levels at most: itself, an iteration, and that iteration's cache breakdown.
const FIELDS = String.raw`"type":"(?:user|system|assistant|queue-operation)"|"timestamp":"[^"]+"|"operation":"dequeue"|"id":"msg_[^"]+"|"usage":\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}|"stop_reason":"end_turn"`;

// rg prints a final answer's whole record, line by line, since matching up to its newline would make rg load each transcript whole.
const ANSWERS = `"stop_reason":"end_turn"`;

type System = {
  home: string;
  desktopData: string;
  // Starts ripgrep without user config, which could change its output.
  ripgrep: { argv: readonly string[]; env: Record<string, string> };
};

type UsageCounts = Pick<
  ModelUsage,
  "input_tokens" | "cache_creation_input_tokens" | "cache_read_input_tokens" | "output_tokens"
>;

// User and system records are the sends requests follow, a dequeue starts a turn, and a response's records carry its id and usage, and end_turn when it ends the turn; `at` is in epoch milliseconds.
type TranscriptRecord = {
  type: "user" | "system" | "assistant" | "queue-operation";
  at: number;
  operation?: "dequeue";
  id?: string;
  usage?: UsageCounts;
  stop_reason?: "end_turn";
};

// One record's FIELDS as matched, before the parse requires a type and a time.
type MatchedFields = Partial<Omit<TranscriptRecord, "at"> & { timestamp: string }>;

type AnswerRecord = {
  type: string;
  timestamp: string;
  message: { id: string; stop_reason: string | null; content: { text?: string }[] };
};

// The fields of the app's record of a desktop session that link its transcripts; createdAt is in epoch milliseconds.
type SessionRecord = {
  cliSessionId: string;
  rewindEdges?: { parent: string; child: string }[];
  forkedFromSessionId?: string;
  createdAt: number;
};

type Lineage = { earlier: string[]; ancestors: { ids: string[]; forkedAt: number }[] };

// Input counts every prompt token the requests sent, cached ones included.
type Tokens = { input: number; cached: number; output: number };

// Tokens generated over the time their requests took, from sending each to its last streamed part, so tool runs and waiting stay out of the speed; a live turn counts only the requests the mod timed.
type Pace = { output: number; ms: number };

// Tokens are undefined for a live turn the engine counted nothing for, as one interrupted before a response.
type Figures = { durationMs: number; tokens: Tokens | undefined; pace: Pace };

type Reading = {
  // Every turn of the session, for the sum.
  turns: Turn[];
  // The turns of the session's answers, by text; two answers with the same text share one entry, rare enough to leave.
  answers: Map<string, Turn>;
  // The current transcript's saved turn costs, by answer key, and their file, which each measured turn adds to.
  costs: { path: string; byAnswer: Record<string, number> };
  // Whether the app's record already named the session's current transcript when the turns were read.
  isLinked: boolean;
};

// The start tells one turn's answers from another's: a turn a Stop hook sends back to work ends in two answers.
// Usd is undefined for a turn whose spend Total never measured.
type Turn = Figures & { start: number; usd: number | undefined };

// The app writes a rewind's record several seconds after the new process starts, so a read that finds no record is redone this often, for this long.
const RELINK_MS = 2_000;
const RELINK_FOR_MS = 30_000;

const NO_TOKENS: Tokens = { input: 0, cached: 0, output: 0 };
const NO_PACE: Pace = { output: 0, ms: 0 };

export const register: Register = (on) => {
  registerMakeRoom(on);

  let reading: Promise<Reading> | undefined;
  // Each live turn's timed requests so far, by turn id.
  const paces = new Map<string, Pace>();
  // The session's spend as each live turn started, by turn id.
  const spendAtStart = new Map<string, number>();

  // The app draws a reopened session's history before the figures arrive, so they are read at start and shown again once read.
  // A rewind starts a process whose transcript the app's record names only seconds later, and that transcript copies the answers without the prompts that started their turns, so a read that finds no record counts no turns and is redone until the record appears.
  on("session.start", async ($, e, next) => {
    const first = (reading ??= readTurns($));
    const [started] = await Promise.all([next(e), first.then(({ turns }) => show($, turns))]);
    if ((await first).isLinked) return started;
    const startedAt = await $.clock.now();
    const relinking = $.clock.every(RELINK_MS, () => {
      const read = readTurns($);
      read.then(
        async ({ turns, isLinked }) => {
          if (!isLinked && (await $.clock.now()) - startedAt < RELINK_FOR_MS) return;
          relinking.cancel();
          reading = read;
          await show($, turns);
        },
        (error: unknown) => {
          relinking.cancel();
          $.ui.log(`Total: ${String(error)}`, { to: "debug" });
        },
      );
    });

    return started;
  });

  // A status pinned before the desktop joins, as at a session's start, never reaches it, so the sum is pinned again as each surface attaches.
  on("session.attach", async ($, e, next) => {
    const attached = await next(e);
    await show($, (await (reading ??= readTurns($))).turns);

    return attached;
  });

  // A record still missing once the start's retries end, as for a new session left idle, is looked for again as each turn starts.
  on("turn.start", async ($, e, next) => {
    if (e.agentId !== undefined) return next(e);
    const { cost } = await $.session.usage();
    if (cost !== undefined) spendAtStart.set(e.turnId, cost.usd);
    if ((await (reading ??= readTurns($))).isLinked) return next(e);
    reading = readTurns($);
    const shown = reading.then(({ turns }) => show($, turns));
    const [started] = await Promise.all([next(e), shown]);

    return started;
  });

  on("turn.step", async function* ($, e, next) {
    if (e.agentId !== undefined) return yield* next(e);
    const sent = await $.clock.now();
    const result = yield* next(e);
    const ms = (await $.clock.now()) - sent;
    // A request that brought back no usage, as one that failed, has nothing to pace.
    if (result.usage !== null) {
      const pace = { output: result.usage.output_tokens, ms };
      paces.set(e.turnId, addPace(paces.get(e.turnId) ?? NO_PACE, pace));
    }

    return result;
  });

  on("turn.complete", async ($, e, next) => {
    if (e.agentId === undefined) {
      const { turns, answers, costs } = await (reading ??= readTurns($));
      const before = spendAtStart.get(e.turnId);
      const { cost } = await $.session.usage();
      const answer = e.answer.trim();
      const turn: Turn = {
        start: (await $.clock.now()) - e.durationMs,
        durationMs: e.durationMs,
        tokens: e.usage === undefined ? undefined : countTokens(e.usage),
        pace: paces.get(e.turnId) ?? NO_PACE,
        usd: before === undefined || cost === undefined ? undefined : cost.usd - before,
      };
      turns.push(turn);
      answers.set(answer, turn);
      paces.delete(e.turnId);
      spendAtStart.delete(e.turnId);
      if (turn.usd !== undefined) {
        costs.byAnswer[answerKey(answer)] = turn.usd;
        await $.fs.write(costs.path, JSON.stringify(costs.byAnswer));
      }
      await show($, turns);
    }

    return next(e);
  });

  on("ui.render", { component: "AssistantMessage", surface: "desktop" }, async ($, e, next) => {
    const turn = (await (reading ??= readTurns($))).answers.get(e.props.text.trim());
    if (turn === undefined) return next(e);

    const { Box, Text } = $.ui.resolve(e);

    return (
      <Box flexDirection="column" gap="xs">
        {await next(e)}
        <Text dimColor size="caption" tabular>
          {`Worked for ${formatFigures(turn, turn.usd)}`}
        </Text>
      </Box>
    );
  });
};

// The sum goes to the mod's status line because the desktop draws no mode label a mod adds to the prompt footer.
async function show($: EngineInterface, turns: readonly Turn[]): Promise<void> {
  $.ui.invalidate("ui.render");
  if (turns.length === 0) return;
  const { cost } = await $.session.usage();
  $.ui.status(formatFigures(sumTurns(turns), cost?.usd));
}

// Looked up once per load, since on Windows that starts PowerShell.
let systemLookup: Promise<System> | undefined;

async function readTurns($: EngineInterface): Promise<Reading> {
  const system = await (systemLookup ??= readSystem($));
  const sessionId = await $.session.id();
  const lineage = await readLineage($, system, sessionId);
  const { earlier, ancestors } = lineage ?? { earlier: [], ancestors: [] };
  const transcriptIds = [...earlier, sessionId];
  // Files only grow, so reading answers first finds every answer's response among the records read after.
  const answerRecords = await searchTranscripts($, system, transcriptIds, [
    "--no-filename",
    "--no-line-number",
    "--fixed-strings",
    ANSWERS,
  ]);
  const costsPath = costsFile(system, sessionId);
  const [records, inherited, earlierCosts, ownCosts] = await Promise.all([
    searchRecords($, system, transcriptIds),
    // An ancestor lends only its dequeues from before the fork: its later turns are not the fork's.
    Promise.all(
      ancestors.map(async ({ ids, forkedAt }) =>
        turnStarts(await searchRecords($, system, ids)).filter((started) => started < forkedAt),
      ),
    ),
    // A rewind or fork copies answers whose costs were saved under the transcript they ran in.
    Promise.all(
      [...ancestors.flatMap(({ ids }) => ids), ...earlier].map((id) =>
        readCosts($, costsFile(system, id)),
      ),
    ),
    readCosts($, costsPath),
  ]);
  const costs = Object.fromEntries(
    [...earlierCosts, ownCosts].flatMap((saved) => Object.entries(saved)),
  );

  return {
    ...tallyTurns(records, answerRecords, inherited.flat(), costs),
    costs: { path: costsPath, byAnswer: ownCosts },
    isLinked: lineage !== undefined,
  };
}

// Transcripts store no turn totals, so a turn runs from its prompt's dequeue to the last record of the response that ended it and takes the responses in between, each timed from the latest send before it to its own last record.
function tallyTurns(
  records: readonly TranscriptRecord[],
  answerRecords: string,
  inheritedStarts: readonly number[],
  costs: Readonly<Record<string, number>>,
): Pick<Reading, "turns" | "answers"> {
  // A turn starts at the latest dequeue before its end in time rather than in the file, since a rewind's transcript copies older records after its own first dequeue.
  const starts = [...inheritedStarts, ...turnStarts(records)].sort((a, b) => a - b);
  const sends: number[] = [];
  // A response's records, one per content block, each repeat its usage, but a rewind's copies of them carry zeros, so its tokens are the largest any record holds; its earliest record places it in a turn and its latest ends it.
  const responses = new Map<
    string,
    { first: number; last: number; tokens: Tokens; endsTurn: boolean }
  >();
  for (const { type, at, id, usage, stop_reason } of records) {
    if (type === "user" || type === "system") sends.push(at);
    else if (type === "assistant" && id !== undefined && usage !== undefined) {
      const tokens = countTokens(usage);
      const response = responses.get(id) ?? { first: at, last: at, tokens, endsTurn: false };
      responses.set(id, {
        first: Math.min(response.first, at),
        last: Math.max(response.last, at),
        tokens: maxTokens(response.tokens, tokens),
        endsTurn: response.endsTurn || stop_reason === "end_turn",
      });
    }
  }
  sends.sort((a, b) => a - b);

  const timed = [...responses.values()].map(({ first, last, tokens }) => ({
    first,
    tokens,
    pace: { output: tokens.output, ms: last - (sends.findLast((sent) => sent <= first) ?? first) },
  }));

  // By the id of the response that ended each turn.
  const turns = new Map<string, Turn>();
  for (const [id, { last, endsTurn }] of responses) {
    const start = starts.findLast((started) => started <= last);
    if (!endsTurn || start === undefined) continue;
    const inTurn = timed.filter(({ first }) => first >= start && first <= last);
    turns.set(id, {
      start,
      durationMs: last - start,
      tokens: inTurn.reduce((total, response) => addTokens(total, response.tokens), NO_TOKENS),
      pace: inTurn.reduce((total, response) => addPace(total, response.pace), NO_PACE),
      usd: undefined,
    });
  }

  const answers = new Map<string, Turn>();
  for (const line of answerRecords.split("\n")) {
    if (line === "") continue;
    let record: AnswerRecord;
    try {
      record = JSON.parse(line);
    } catch {
      // A record cut short, as one still being written or one a crash left, holds no answer to show.
      continue;
    }
    if (record.type !== "assistant" || record.message.stop_reason !== "end_turn") continue;
    // Every final answer is a response, so one missing from the records means FIELDS no longer fits the transcripts.
    if (!responses.has(record.message.id))
      throw new Error(`Total: response ${record.message.id} is missing from the transcript fields`);
    const turn = turns.get(record.message.id);
    if (turn === undefined) continue;
    for (const { text } of record.message.content) {
      if (text === undefined) continue;
      const answer = text.trim();
      answers.set(answer, turn);
      turn.usd ??= costs[answerKey(answer)];
    }
  }

  return { turns: [...turns.values()], answers };
}

// A transcript has a file only once Total measures one of its turns.
async function readCosts($: EngineInterface, path: string): Promise<Record<string, number>> {
  return (await $.fs.exists(path)) ? JSON.parse(await $.fs.read(path)) : {};
}

function costsFile(system: System, transcriptId: string): string {
  return `${system.home}/.claude/total-costs/${transcriptId}.json`;
}

// Saved costs are keyed by a 32-bit FNV-1a hash of the answer, short beside the text it stands for; one session's answers are too few to collide.
function answerKey(answer: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < answer.length; i++) hash = Math.imul(hash ^ answer.charCodeAt(i), 0x01000193);
  return (hash >>> 0).toString(36);
}

// `$.fs.read` and `$.process.run` stop at 4 MiB, which a session's response records alone can pass, so rg's matches stream in.
async function searchTranscripts(
  $: EngineInterface,
  system: System,
  transcriptIds: readonly string[],
  search: readonly string[],
): Promise<string> {
  const rg = $.process.spawn({
    argv: [
      ...system.ripgrep.argv,
      ...transcriptIds.flatMap((id) => ["--glob", `${id}.jsonl`]),
      ...search,
      `${system.home}/.claude/projects`,
    ],
    env: system.ripgrep.env,
  });
  let found = "";
  let errors = "";
  for await (const { stream, text } of rg) {
    if (stream === "stdout") found += text;
    else errors += text;
  }
  // rg exits 1 when nothing matches, as for a new session.
  const { code } = await rg.result;
  if (code !== 0 && code !== 1) throw new Error(`Total: rg failed: ${errors}`);

  return found;
}

// rg heads each transcript's matches with its path and leads each match with its record's line number, so a record's fields are the run of matches sharing one.
async function searchRecords(
  $: EngineInterface,
  system: System,
  transcriptIds: readonly string[],
): Promise<TranscriptRecord[]> {
  const found = await searchTranscripts($, system, transcriptIds, [
    "--with-filename",
    "--heading",
    "--line-number",
    "--only-matching",
    FIELDS,
  ]);
  const records: TranscriptRecord[] = [];
  let line: string | undefined;
  let fields: MatchedFields = {};
  let repeats = false;
  for (const output of found.split("\n")) {
    const match = /^(\d+):(.+)$/.exec(output);
    if (match?.[1] !== line) {
      const { type, timestamp, ...rest } = fields;
      // A record that repeats a field, as one nesting another, is left out since its own fields cannot be told apart.
      if (!repeats && type !== undefined && timestamp !== undefined)
        records.push({ type, at: Date.parse(timestamp), ...rest });
      fields = {};
      repeats = false;
      line = match?.[1];
    }
    if (match === null) continue;
    const field: MatchedFields = JSON.parse(`{${match[2]}}`);
    repeats ||= Object.keys(field).some((key) => key in fields);
    Object.assign(fields, field);
  }

  return records;
}

function turnStarts(records: readonly TranscriptRecord[]): number[] {
  return records.flatMap(({ type, operation, at }) =>
    type === "queue-operation" && operation === "dequeue" ? at : [],
  );
}

// The app's session records alone link a session's transcripts: a rewind's new transcript holds history only from the last compaction, so the sum needs the ones before it, and a fork copies its ancestor's history without the dequeues that started those turns.
async function readLineage(
  $: EngineInterface,
  system: System,
  sessionId: string,
): Promise<Lineage | undefined> {
  // Only the desktop app keeps session records; a terminal session has no earlier transcripts.
  if ((await $.env.get("CLAUDE_CODE_ENTRYPOINT")) !== "claude-desktop")
    return { earlier: [], ancestors: [] };
  const folder = `${system.desktopData}/claude-code-sessions`;
  const own = await findSessionRecord($, system, [
    "--files-with-matches",
    "--fixed-strings",
    "--glob",
    "local_*.json",
    "--regexp",
    `"cliSessionId":"${sessionId}"`,
    // A rewind's edge names its new transcript before the session starts, while cliSessionId moves to it only after.
    "--regexp",
    `"child":"${sessionId}"`,
    folder,
  ]);
  // Undefined until the app records the session's current transcript.
  if (own === undefined) return undefined;

  const ancestors: Lineage["ancestors"] = [];
  let child = own;
  while (child.forkedFromSessionId !== undefined) {
    const parent = await findSessionRecord($, system, [
      "--files",
      "--glob",
      `${child.forkedFromSessionId}.json`,
      folder,
    ]);
    if (parent === undefined) break;
    ancestors.push({
      ids: [...transcriptsBefore(parent, parent.cliSessionId), parent.cliSessionId],
      forkedAt: child.createdAt,
    });
    child = parent;
  }

  return { earlier: transcriptsBefore(own, sessionId), ancestors };
}

// The transcripts a session's rewinds left before the given one, oldest first.
function transcriptsBefore(record: SessionRecord, transcriptId: string): string[] {
  const parents = new Map(record.rewindEdges?.map(({ parent, child }) => [child, parent]));
  const earlier: string[] = [];
  for (let id = parents.get(transcriptId); id !== undefined; id = parents.get(id))
    earlier.unshift(id);

  return earlier;
}

async function findSessionRecord(
  $: EngineInterface,
  system: System,
  search: readonly string[],
): Promise<SessionRecord | undefined> {
  const { exitCode, stdout, stderr } = await $.process.run([...system.ripgrep.argv, ...search], {
    env: system.ripgrep.env,
  });
  if (exitCode > 1) throw new Error(`Total: rg failed: ${stderr}`);
  const path = stdout.trimEnd();

  return path === "" ? undefined : JSON.parse(await $.fs.read(path));
}

// Mods have no `process.platform`, so the OS comes from the environment, where only Windows sets OS.
async function readSystem($: EngineInterface): Promise<System> {
  if ((await $.env.get("OS")) === "Windows_NT") {
    const home = await $.env.get("USERPROFILE");
    if (home === undefined) throw new Error("Total: USERPROFILE is unset");
    const { exitCode, stdout, stderr } = await $.process.run([
      "powershell.exe",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      PARENT_EXECUTABLE,
    ]);
    if (exitCode !== 0) throw new Error(`Total: finding Claude Code failed: ${stderr}`);
    const binary = stdout.trim();
    return {
      home,
      // The app's data folder, which holds the session records, also holds the Claude Code it runs, under claude-code; a terminal session runs one from elsewhere and never reads them.
      desktopData: binary.slice(0, binary.lastIndexOf("\\claude-code\\")),
      // Windows has no exec -a, but there the binary takes the name it runs under from ARGV0.
      ripgrep: { argv: [binary, "--no-config"], env: { ARGV0: "rg" } },
    };
  }
  const home = await $.env.get("HOME");
  if (home === undefined) throw new Error("Total: HOME is unset");
  const { stdout: kernel } = await $.process.run(["uname", "-s"]);
  return {
    home,
    desktopData:
      kernel.trim() === "Darwin"
        ? `${home}/Library/Application Support/Claude`
        : `${home}/.config/Claude`,
    ripgrep: { argv: ["/bin/bash", "-c", EMBEDDED_RIPGREP, "rg", "--no-config"], env: {} },
  };
}

function countTokens(usage: UsageCounts): Tokens {
  return {
    input: usage.input_tokens + usage.cache_creation_input_tokens + usage.cache_read_input_tokens,
    cached: usage.cache_read_input_tokens,
    output: usage.output_tokens,
  };
}

function addTokens(a: Tokens, b: Tokens): Tokens {
  return { input: a.input + b.input, cached: a.cached + b.cached, output: a.output + b.output };
}

function maxTokens(a: Tokens, b: Tokens): Tokens {
  return {
    input: Math.max(a.input, b.input),
    cached: Math.max(a.cached, b.cached),
    output: Math.max(a.output, b.output),
  };
}

function addPace(a: Pace, b: Pace): Pace {
  return { output: a.output + b.output, ms: a.ms + b.ms };
}

// Turns that share a start are one turn a Stop hook sent back to work, and the latest covers the earlier ones, so each counts once.
function sumTurns(turns: Iterable<Turn>): Figures {
  const latest = new Map<number, Turn>();
  for (const turn of turns) {
    const kept = latest.get(turn.start);
    if (kept === undefined || turn.durationMs > kept.durationMs) latest.set(turn.start, turn);
  }
  const distinct = [...latest.values()];
  const counted = distinct.flatMap((turn) => turn.tokens ?? []);
  return {
    durationMs: distinct.reduce((total, turn) => total + turn.durationMs, 0),
    tokens: counted.length === 0 ? undefined : counted.reduce(addTokens),
    pace: distinct.reduce((total, turn) => addPace(total, turn.pace), NO_PACE),
  };
}

function formatFigures({ durationMs, tokens, pace }: Figures, usd: number | undefined): string {
  const parts = [formatDuration(durationMs)];
  if (tokens !== undefined)
    parts.push(
      `${formatTokens(tokens.input)} (${Math.round((100 * tokens.cached) / tokens.input)}%) in`,
      `${formatTokens(tokens.output)} out`,
    );
  if (pace.ms > 0) parts.push(`${Math.round(pace.output / (pace.ms / 1000))} tps`);
  if (usd !== undefined) parts.push(`$${usd.toFixed(2)}`);
  return parts.join(" · ");
}

// Matches the terminal's own turn line.
function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds % 60}s`;
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

// Each unit ends where its rounding would reach 1000, so no count reads as 1000k.
function formatTokens(count: number): string {
  if (count < 1000) return String(count);
  if (count < 999_500) return `${Math.round(count / 1e3)}k`;
  if (count < 999_995_000) return `${(count / 1e6).toFixed(2)}M`;
  return `${(count / 1e9).toFixed(2)}B`;
}
