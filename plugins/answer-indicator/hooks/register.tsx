/**
 * Draws an accent rail beside each turn's final answer in the desktop transcript, past turns included, so an answer stands out from any part of it while scrolling; only the drawing changes, never the transcript.
 *
 * A drawn message carries no turn position, so answers are known by text: past ones read from the session's transcripts once per load, each later one taken from its turn's end.
 */

import type { EngineInterface, Register } from "claude-code";

// The desktop's --clay token, the color of its thinking dots; the `claude` theme key is the terminal's slightly different rgb(215,119,87).
const RAIL_COLOR = "#D97757";
// In cells, since Box widths take no pixels; under the thinking dots' 3/8-cell diameter because a full-height bar looks wider than a dot.
const RAIL_WIDTH = 0.25;

// Claude Code's binary runs as its embedded ripgrep when started as rg, and the mod's commands are its children: Linux finds the parent's executable under /proc, macOS through ps.
const EMBEDDED_RIPGREP =
  'exe=/proc/$PPID/exe; [ -e "$exe" ] || exe=$(ps -o comm= -p "$PPID"); exec -a rg "$exe" "$@"';

type System = {
  home: string;
  desktopData: string;
  // Starts ripgrep without user config, which could change its output.
  ripgrep: readonly string[];
};

// Whether the app's record already named the session's current transcript when the answers were read.
type Reading = { answers: Set<string>; isLinked: boolean };

type TranscriptRecord = {
  type: string;
  message: { stop_reason: string | null; content: { text?: string }[] };
};

export const register: Register = (on) => {
  let reading: Promise<Reading> | undefined;

  // The app draws a reopened session's history before the answers arrive, so they are read at start and drawn again once read.
  on("session.start", async ($, e, next) => {
    const redrawn = (reading ??= readAnswers($)).then(() => $.ui.invalidate("ui.render"));
    const [started] = await Promise.all([next(e), redrawn]);

    return started;
  });

  // The app's record can name a session's transcript only after the session starts, as for a new session, so a read made before then is repeated as each turn starts.
  on("turn.start", async ($, e, next) => {
    if (e.agentId !== undefined || (await (reading ??= readAnswers($))).isLinked) return next(e);
    reading = readAnswers($);
    const redrawn = reading.then(() => $.ui.invalidate("ui.render"));
    const [started] = await Promise.all([next(e), redrawn]);

    return started;
  });

  on("turn.complete", async ($, e, next) => {
    if (e.agentId === undefined) {
      (await (reading ??= readAnswers($))).answers.add(e.answer.trim());
      $.ui.invalidate("ui.render");
    }

    return next(e);
  });

  on("ui.render", { component: "AssistantMessage", surface: "desktop" }, async ($, e, next) => {
    if (!(await (reading ??= readAnswers($))).answers.has(e.props.text.trim())) {
      return next(e);
    }

    const { Box } = $.ui.resolve(e);

    return (
      <Box flexDirection="row" alignItems="stretch" gap="sm">
        <Box width={RAIL_WIDTH} flexShrink={0} backgroundColor={RAIL_COLOR} />
        {await next(e)}
      </Box>
    );
  });
};

async function readAnswers($: EngineInterface): Promise<Reading> {
  const system = await readSystem($);
  const sessionId = await $.session.id();
  const prior = await priorTranscriptIds($, system, sessionId);
  const transcriptIds = [...(prior ?? []), sessionId];
  // `$.fs.read` and `$.process.run` stop at 4 MiB, which a session's answer records alone can pass, so rg's matches stream in.
  const search = $.process.spawn({
    argv: [
      ...system.ripgrep,
      "--no-filename",
      "--no-line-number",
      "--fixed-strings",
      ...transcriptIds.flatMap((id) => ["--glob", `${id}.jsonl`]),
      // rg prints a final answer's whole record, line by line, since matching up to its newline would make rg load each transcript whole.
      `"stop_reason":"end_turn"`,
      `${system.home}/.claude/projects`,
    ],
  });
  let records = "";
  let errors = "";
  for await (const { stream, text } of search) {
    if (stream === "stdout") records += text;
    else errors += text;
  }
  // rg exits 1 when nothing matches, as for a new session.
  const { code } = await search.result;
  if (code !== 0 && code !== 1) throw new Error(`answer-indicator: rg failed: ${errors}`);

  const answers = new Set<string>();
  for (const line of records.split("\n")) {
    if (line === "") continue;
    let record: TranscriptRecord;
    try {
      record = JSON.parse(line);
    } catch {
      // A record cut short, as one still being written or one a crash left, holds no answer to show.
      continue;
    }
    if (record.type !== "assistant" || record.message.stop_reason !== "end_turn") continue;
    for (const { text } of record.message.content) if (text !== undefined) answers.add(text.trim());
  }

  return { answers, isLinked: prior !== undefined };
}

// Answers are read from every transcript a session's rewinds left, not just the ones the desktop loads now, so a rail never depends on how far back its view reaches; only the app's session record names those transcripts.
async function priorTranscriptIds(
  $: EngineInterface,
  system: System,
  sessionId: string,
): Promise<string[] | undefined> {
  // Only the desktop app keeps session records; a terminal session has no earlier transcripts.
  if ((await $.env.get("CLAUDE_CODE_ENTRYPOINT")) !== "claude-desktop") return [];
  const records = `${system.desktopData}/claude-code-sessions`;
  const { exitCode, stdout, stderr } = await $.process.run([
    ...system.ripgrep,
    "--files-with-matches",
    "--fixed-strings",
    "--glob",
    "local_*.json",
    "--regexp",
    `"cliSessionId":"${sessionId}"`,
    // A rewind's edge names its new transcript before the session starts, while cliSessionId moves to it only after.
    "--regexp",
    `"child":"${sessionId}"`,
    records,
  ]);
  if (exitCode > 1) throw new Error(`answer-indicator: rg failed: ${stderr}`);
  // Undefined until the app records the session's current transcript.
  const path = stdout.trimEnd();
  if (path === "") return undefined;
  const record: { rewindEdges?: { parent: string; child: string }[] } = JSON.parse(
    await $.fs.read(path),
  );
  const parents = new Map(record.rewindEdges?.map(({ parent, child }) => [child, parent]));
  const prior: string[] = [];
  for (let id = parents.get(sessionId); id !== undefined; id = parents.get(id)) prior.unshift(id);

  return prior;
}

// Mods have no `process.platform`, so the OS comes from the environment, where only Windows sets OS.
async function readSystem($: EngineInterface): Promise<System> {
  if ((await $.env.get("OS")) === "Windows_NT") {
    const home = await $.env.get("USERPROFILE");
    const appData = await $.env.get("APPDATA");
    if (home === undefined || appData === undefined)
      throw new Error("answer-indicator: USERPROFILE or APPDATA is unset");
    // Starting the binary as rg takes a spawn option mods lack or a POSIX shell, so Windows uses an installed rg.
    return { home, desktopData: `${appData}/Claude`, ripgrep: ["rg", "--no-config"] };
  }
  const home = await $.env.get("HOME");
  if (home === undefined) throw new Error("answer-indicator: HOME is unset");
  const { stdout: kernel } = await $.process.run(["uname", "-s"]);
  return {
    home,
    desktopData:
      kernel.trim() === "Darwin"
        ? `${home}/Library/Application Support/Claude`
        : `${home}/.config/Claude`,
    ripgrep: ["/bin/bash", "-c", EMBEDDED_RIPGREP, "rg", "--no-config"],
  };
}
