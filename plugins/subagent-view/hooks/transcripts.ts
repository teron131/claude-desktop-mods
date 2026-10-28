/**
 * Reads a session's subagents from the transcripts Claude Code keeps for them, including those of the transcripts a rewind left behind, with Claude Code's built-in ripgrep so nothing needs installing.
 */

import type { AgentStatus, EngineInterface, ModelUsage } from "claude-code";

import type { Subagent, Tokens } from "../types";
import { addTokens, countTokens, maxTokens, NO_TOKENS } from "./tokens";

// Claude Code's binary runs as its embedded ripgrep when started as rg, and the mod's commands are its children: Linux finds the parent's executable under /proc, macOS through ps.
const EMBEDDED_RIPGREP =
  'exe=/proc/$PPID/exe; [ -e "$exe" ] || exe=$(ps -o comm= -p "$PPID"); exec -a rg "$exe" "$@"';
// Windows finds it through PowerShell, which prints it in UTF-8 so a path outside the console's code page arrives whole.
const PARENT_EXECUTABLE =
  "[Console]::OutputEncoding = [Text.Encoding]::UTF8; (Get-Process -Id (Get-CimInstance Win32_Process -Filter ProcessId=$PID).ParentProcessId).Path";

// Only the fields a row reads, since a subagent's transcript reaches tens of megabytes; each is matched by its own key because key order differs between records.
// A usage object nests three levels at most: itself, an iteration, and that iteration's cache breakdown.
const FIELDS = String.raw`"type":"(?:user|system|assistant)"|"timestamp":"[^"]+"|"id":"msg_[^"]+"|"model":"claude-[^"]+"|"effort":"[a-z]+"|"usage":\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}|"stop_reason":"end_turn"|"name":"SubagentHandback"`;

type System = {
  home: string;
  desktopData: string;
  // Starts ripgrep without user config, which could change its output.
  ripgrep: { argv: readonly string[]; env: Record<string, string> };
};

// The fields of the app's record of a desktop session that link its transcripts.
type SessionRecord = { rewindEdges?: { parent: string; child: string }[] };

// What Claude Code writes beside a subagent's transcript as it starts it.
type Meta = { agentType: string; description: string; model: string; parentAgentId?: string };

type MatchedFields = Partial<{
  type: "user" | "system" | "assistant";
  timestamp: string;
  id: string;
  model: string;
  effort: Subagent["effort"];
  usage: ModelUsage;
  stop_reason: "end_turn";
  name: "SubagentHandback";
}>;

// A transcript's span, when each request went out, and its responses by id; times are in epoch milliseconds.
type Tally = { first: number; last: number; sends: number[]; responses: Map<string, Response> };

type Response = {
  first: number;
  last: number;
  model: string | undefined;
  effort: Subagent["effort"];
  tokens: Tokens;
  // Whether it delivered the agent's work: an answer that ends the turn, or the handback call some agents report through instead.
  delivers: boolean;
};

const STATUS_OF: Record<AgentStatus, Subagent["status"]> = {
  pending: "running",
  running: "running",
  waiting: "running",
  idle: "done",
  completed: "done",
  failed: "failed",
  killed: "failed",
};

// `isLinked` is false while the desktop app has yet to record the session's current transcript, which it does seconds after a rewind starts one; until then only that transcript is read.
export async function readSessionSubagents(
  $: EngineInterface,
): Promise<{ subagents: Subagent[]; isLinked: boolean }> {
  const system = await readSystem($);
  const sessionId = await $.session.id();
  const earlier = await readEarlierTranscripts($, system, sessionId);
  const subagents = await readSubagents($, system, [...(earlier ?? []), sessionId]);
  return { subagents, isLinked: earlier !== undefined };
}

async function readSubagents(
  $: EngineInterface,
  system: System,
  transcriptIds: readonly string[],
): Promise<Subagent[]> {
  const [metas, tallies, agents] = await Promise.all([
    readMetas($, system, transcriptIds),
    readTallies($, system, transcriptIds),
    $.agent.list(),
  ]);
  const statuses = new Map(agents.map((agent) => [agent.id, agent.status]));

  return [...metas].flatMap(([agentId, meta]) => {
    // A subagent's prompt is its transcript's first record, written as it starts, so only one starting right now has none, and its spawn hook adds it.
    const tally = tallies.get(agentId);
    if (tally === undefined) return [];
    const responses = [...tally.responses.values()].sort((a, b) => a.last - b.last);
    const latest = responses.at(-1);
    const row = {
      agentId,
      parentId: meta.parentAgentId,
      description: meta.description,
      type: meta.agentType,
      model: latest?.model ?? meta.model,
      effort: latest?.effort,
      startedAt: tally.first,
      respondedAt: latest?.last,
      tokens: responses.reduce((total, response) => addTokens(total, response.tokens), NO_TOKENS),
      responseMs: responseMs(tally),
    };
    // An agent whose last response delivered its work is done whatever its live status, since a nested background agent can stay listed as running after it hands back; one with no live status ended with an earlier process.
    const live = statuses.get(agentId);
    const status = latest?.delivers ? "done" : live === undefined ? "failed" : STATUS_OF[live];
    // A stop writes a record into the transcript, so an agent stopped long after it went quiet ends at its latest response, not its last record.
    return status === "running"
      ? { ...row, status }
      : { ...row, status, endedAt: latest?.last ?? tally.last };
  });
}

async function readMetas(
  $: EngineInterface,
  system: System,
  transcriptIds: readonly string[],
): Promise<Map<string, Meta>> {
  const { exitCode, stdout, stderr } = await $.process.run(
    [
      ...system.ripgrep.argv,
      "--null",
      "--with-filename",
      "--no-line-number",
      ...transcriptIds.flatMap((id) => ["--glob", `**/${id}/subagents/*.meta.json`]),
      // Matches every line, so rg prints each file whole.
      "",
      `${system.home}/.claude/projects`,
    ],
    { env: system.ripgrep.env },
  );
  // rg exits 1 when nothing matches, as for a session without subagents.
  if (exitCode > 1) throw new Error(`subagent-view: rg failed: ${stderr}`);

  const metas = new Map<string, Meta>();
  for (const output of stdout.split("\n")) {
    const [path, json] = output.split("\0");
    const agentId = /agent-(\w+)\.meta\.json$/.exec(path ?? "")?.[1];
    if (agentId !== undefined && json !== undefined) metas.set(agentId, JSON.parse(json));
  }
  return metas;
}

// `$.process.run` stops at 4 MiB, which a long subagent's records can pass, so rg's matches stream in.
// rg heads each transcript's matches with its path and leads each match with its record's line number, so a record's fields are the run of matches sharing one.
async function readTallies(
  $: EngineInterface,
  system: System,
  transcriptIds: readonly string[],
): Promise<Map<string, Tally>> {
  const rg = $.process.spawn({
    argv: [
      ...system.ripgrep.argv,
      ...transcriptIds.flatMap((id) => ["--glob", `**/${id}/subagents/*.jsonl`]),
      "--with-filename",
      "--heading",
      "--line-number",
      "--only-matching",
      FIELDS,
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
  const { code } = await rg.result;
  if (code !== 0 && code !== 1) throw new Error(`subagent-view: rg failed: ${errors}`);

  const tallies = new Map<string, Tally>();
  let agentId: string | undefined;
  let line: string | undefined;
  let fields: MatchedFields = {};
  let repeats = false;
  for (const output of found.split("\n")) {
    const match = /^(\d+):(.+)$/.exec(output);
    if (match?.[1] !== line) {
      // A record that repeats a field, as one nesting another, is left out since its own fields cannot be told apart.
      if (agentId !== undefined && !repeats) addRecord(tallies, agentId, fields);
      fields = {};
      repeats = false;
      line = match?.[1];
    }
    // Each transcript's matches follow a blank line and a heading with its path, which names the agent.
    if (match === null) {
      if (output !== "") agentId = /agent-(\w+)\.jsonl$/.exec(output)?.[1];
      continue;
    }
    const field: MatchedFields = JSON.parse(`{${match[2]}}`);
    repeats ||= Object.keys(field).some((key) => key in fields);
    Object.assign(fields, field);
  }
  return tallies;
}

// A response's records, one per content block, each repeat its usage, so its tokens are the largest any record holds.
function addRecord(
  tallies: Map<string, Tally>,
  agentId: string,
  { type, timestamp, id, model, effort, usage, stop_reason, name }: MatchedFields,
): void {
  if (type === undefined || timestamp === undefined) return;
  const at = Date.parse(timestamp);
  const tally: Tally = tallies.get(agentId) ?? {
    first: at,
    last: at,
    sends: [],
    responses: new Map(),
  };
  tally.first = Math.min(tally.first, at);
  tally.last = Math.max(tally.last, at);
  tallies.set(agentId, tally);
  if (type !== "assistant") tally.sends.push(at);
  if (type !== "assistant" || id === undefined || usage === undefined) return;
  const response = tally.responses.get(id);
  tally.responses.set(id, {
    first: Math.min(response?.first ?? at, at),
    last: Math.max(response?.last ?? at, at),
    model: model ?? response?.model,
    effort: effort ?? response?.effort,
    tokens: maxTokens(response?.tokens ?? NO_TOKENS, countTokens(usage)),
    delivers: response?.delivers === true || stop_reason !== undefined || name !== undefined,
  });
}

// Total's timing: each response from the latest request at or before its first record to its last record.
function responseMs({ sends, responses }: Tally): number {
  const sorted = sends.toSorted((a, b) => a - b);
  return [...responses.values()].reduce(
    (total, { first, last }) => total + last - (sorted.findLast((sent) => sent <= first) ?? first),
    0,
  );
}

// The app's session records alone link a session's transcripts: each rewind starts a new one, and the subagents that ran before it stay with the one it left.
// Undefined until the app records the session's current transcript.
async function readEarlierTranscripts(
  $: EngineInterface,
  system: System,
  sessionId: string,
): Promise<string[] | undefined> {
  // Only the desktop app keeps session records; a terminal session has no earlier transcripts.
  if ((await $.env.get("CLAUDE_CODE_ENTRYPOINT")) !== "claude-desktop") return [];
  const { exitCode, stdout, stderr } = await $.process.run(
    [
      ...system.ripgrep.argv,
      "--files-with-matches",
      "--fixed-strings",
      "--glob",
      "local_*.json",
      "--regexp",
      `"cliSessionId":"${sessionId}"`,
      // A rewind's edge names its new transcript before the session starts, while cliSessionId moves to it only after.
      "--regexp",
      `"child":"${sessionId}"`,
      `${system.desktopData}/claude-code-sessions`,
    ],
    { env: system.ripgrep.env },
  );
  if (exitCode > 1) throw new Error(`subagent-view: rg failed: ${stderr}`);
  const path = stdout.trimEnd();
  if (path === "") return undefined;

  const record: SessionRecord = JSON.parse(await $.fs.read(path));
  const parents = new Map(record.rewindEdges?.map(({ parent, child }) => [child, parent]));
  const earlier: string[] = [];
  for (let id = parents.get(sessionId); id !== undefined; id = parents.get(id)) earlier.unshift(id);
  return earlier;
}

// Looked up once per load, since on Windows that starts PowerShell.
let systemLookup: Promise<System> | undefined;

function readSystem($: EngineInterface): Promise<System> {
  return (systemLookup ??= lookUpSystem($));
}

// Mods have no `process.platform`, so the OS comes from the environment, where only Windows sets OS.
async function lookUpSystem($: EngineInterface): Promise<System> {
  if ((await $.env.get("OS")) === "Windows_NT") {
    const home = await $.env.get("USERPROFILE");
    if (home === undefined) throw new Error("subagent-view: USERPROFILE is unset");
    const { exitCode, stdout, stderr } = await $.process.run([
      "powershell.exe",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      PARENT_EXECUTABLE,
    ]);
    if (exitCode !== 0) throw new Error(`subagent-view: finding Claude Code failed: ${stderr}`);
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
  if (home === undefined) throw new Error("subagent-view: HOME is unset");
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
