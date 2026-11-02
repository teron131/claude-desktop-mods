/**
 * The hooks Total registers to end a desktop session's Claude Code process while the app is at its limit on session processes, so the next session you open gets a process, and with it Total's figures and any other mod's display, at once.
 *
 * At that limit the app starts a newly opened session only by pausing one that has been idle a minute, and never retries one it refused, so while you switch fast the newest session would get no process and no mod would run in it.
 * A session you leave is released soon after; a Remote Control session, which the app never pauses, only once it is the one longest without a turn, since released it can't be reached from your phone until it is opened again.
 * The app reopens a released session from its transcript, as it does one it paused itself.
 * Only on macOS, whose `stat -f` and `sysctl hw.memsize` its commands rely on; on Windows it does nothing.
 */

import type { AgentStatus, EngineInterface, Register, Timer } from "claude-code";

type On = Parameters<Register>[0];

// The app counts a process that ends within 30 s of starting as a crash, so releasing a younger one spends RELEASE's budget.
const CRASH_WINDOW_MS = 35_000;

// Switching straight back within this keeps the process.
const GRACE_MS = 1_000;

// A left session watches for the app filling up until it has been idle this long, when the app's own rule may pause it instead.
const APP_IDLE_MS = 60_000;

const CHECK_MS = 2_000;

// The app pauses any other session after 15 minutes idle.
const STALE_MS = 15 * 60_000;

// A stale Remote Control session waits one check for each staler one, so the stalest goes first and one that can't go holds up no other.
const STALE_CHECK_MS = 5_000;

// Work that outlives the turn that started it and ends with the process.
const LASTING_TOOLS = new Set(["Monitor", "ScheduleWakeup", "CronCreate"]);

const BUSY = new Set<AgentStatus>(["pending", "running", "waiting"]);

// The mod's commands are children of the session's Claude Code process, and every desktop session runs that same binary; prints their count, then the RAM in bytes.
const COUNT_SESSIONS =
  'exe=$(ps -o comm= -p "$PPID"); ps -axo comm= | grep -cxF -- "$exe"; sysctl -n hw.memsize';

// Ends this session's process; $1 is the session's id, and $2 is 1 when the process is young enough to count as a crash.
// Sessions that see the same full app at once would each release, so the first to stamp a file goes and the rest skip for 3 s, freeing one slot per need.
// The app stops reopening a session after 15 crashes in one run of the app, so young releases stop at 10 per session and run, the run keyed by the app's process, two parents above the session's.
const RELEASE = String.raw`
stamp="$HOME/.claude/total-released"
[ -f "$stamp" ] && [ $(($(date +%s) - $(stat -f %m "$stamp"))) -lt 3 ] && exit 0
if [ "$2" = 1 ]; then
  young="$HOME/.claude/total-young-releases"
  run=$(ps -o ppid= -p "$(ps -o ppid= -p "$PPID")" | tr -d ' ')
  [ "$(grep -cx "$run $1" "$young" 2>/dev/null)" -ge 10 ] 2>/dev/null && exit 0
  { grep "^$run " "$young" 2>/dev/null; echo "$run $1"; } > "$young.new" && mv "$young.new" "$young"
fi
touch "$stamp"
kill -TERM "$PPID"
`;

// The fields of the app's get_session and list_sessions answers this mod acts on.
type SessionState = {
  sessionId: string;
  isRunning: boolean;
  remoteControlActive: boolean;
  lastActivityAt: string;
};

export function registerMakeRoom(on: On): void {
  // Hooks register as the session's process loads them, so this dates the process; a hot reload dates it later, which only spends the young-release budget sooner.
  const startedAt = Date.now();
  let hasLastingWork = false;
  let leaving: Timer | undefined;

  on("tool.call", ($, e, next) => {
    if (LASTING_TOOLS.has(e.tool) || ("run_in_background" in e && e.run_in_background === true))
      hasLastingWork = true;
    return next(e);
  });

  // Every session the app runs is non-interactive; the matcher is what lets this sit beside Total's own start hook, as a mod hooks an event once without one.
  on("session.start", { isInteractive: false }, async ($, e, next) => {
    const started = await next(e);
    if (
      (await $.env.get("CLAUDE_CODE_ENTRYPOINT")) !== "claude-desktop" ||
      (await $.env.get("OS")) === "Windows_NT"
    )
      return started;
    let fullSince: number | undefined;
    $.clock.every(STALE_CHECK_MS, () => {
      if (hasLastingWork) return;
      releaseIfStale($, startedAt, fullSince).then(
        (since) => {
          fullSince = since;
        },
        (error: unknown) => $.ui.log(`Total: ${String(error)}`, { to: "debug" }),
      );
    });

    return started;
  });

  on("session.attach", { surface: "desktop" }, ($, e, next) => {
    leaving?.cancel();
    leaving = undefined;
    return next(e);
  });

  on("session.detach", { surface: "desktop" }, async ($, e, next) => {
    const detached = await next(e);
    if (e.reason !== "detach" || hasLastingWork || (await $.env.get("OS")) === "Windows_NT")
      return detached;
    const leftAt = await $.clock.now();
    leaving = $.clock.after(GRACE_MS, () => {
      leaving = $.clock.every(CHECK_MS, () => {
        keepWatching($, startedAt, leftAt).then(
          (watching) => {
            if (!watching) leaving?.cancel();
          },
          (error: unknown) => $.ui.log(`Total: ${String(error)}`, { to: "debug" }),
        );
      });
    });

    return detached;
  });
}

// Resolves false once the session has been left long enough for the app's own rule to cover it, which ends the checks.
async function keepWatching(
  $: EngineInterface,
  startedAt: number,
  leftAt: number,
): Promise<boolean> {
  const now = await $.clock.now();
  if (now - leftAt > APP_IDLE_MS) return false;
  await releaseIfCrowded($, now - startedAt < CRASH_WINDOW_MS);

  return true;
}

async function releaseIfCrowded($: EngineInterface, isYoung: boolean): Promise<void> {
  if (!(await isIdle($)) || !(await isAtLimit($))) return;
  const { sessionId, isRunning, remoteControlActive } = await readSession($);
  if (isRunning || remoteControlActive) return;
  await release($, sessionId, isYoung);
}

// Resolves when this session first saw the app full while it was stale on Remote Control, or undefined while either isn't so.
async function releaseIfStale(
  $: EngineInterface,
  startedAt: number,
  fullSince: number | undefined,
): Promise<number | undefined> {
  if (!(await isIdle($))) return undefined;
  const self = await readSession($);
  const now = await $.clock.now();
  const lastActive = Date.parse(self.lastActivityAt);
  if (self.isRunning || !self.remoteControlActive || now - lastActive < STALE_MS) return undefined;
  if (!(await isAtLimit($))) return undefined;
  const since = fullSince ?? now;
  const staler = (await listSessions($)).filter(
    (other) =>
      other.remoteControlActive &&
      !other.isRunning &&
      Date.parse(other.lastActivityAt) < lastActive,
  ).length;
  if (now - since >= staler * STALE_CHECK_MS)
    await release($, self.sessionId, now - startedAt < CRASH_WINDOW_MS);

  return since;
}

// No surface draws the session, a phone included, and none of its subagents is at work.
async function isIdle($: EngineInterface): Promise<boolean> {
  if ((await $.session.surfaces()).length > 0) return false;

  return !(await $.agent.list()).some(({ status }) => BUSY.has(status));
}

async function release($: EngineInterface, sessionId: string, isYoung: boolean): Promise<void> {
  await $.process.run(["/bin/sh", "-c", RELEASE, "sh", sessionId, isYoung ? "1" : "0"]);
}

async function readSession($: EngineInterface): Promise<SessionState> {
  return JSON.parse(await askApp($, "get_session", { session_id: "self" }));
}

// Every other session, since the default 20 can stop short of the oldest Remote Control ones.
async function listSessions($: EngineInterface): Promise<SessionState[]> {
  return JSON.parse(await askApp($, "list_sessions", { limit: 1000 }));
}

async function askApp(
  $: EngineInterface,
  tool: string,
  args: Record<string, unknown>,
): Promise<string> {
  const { content, isError } = await $.mcp.call("ccd_session_mgmt", tool, args);
  const text = content.find((block) => block.type === "text")?.text;
  if (isError || text === undefined) throw new Error(`${tool} failed: ${text ?? "no text"}`);

  return text;
}

// The app's limit is max(6, RAM / 3 GiB) session processes.
async function isAtLimit($: EngineInterface): Promise<boolean> {
  const { stdout } = await $.process.run(["/bin/sh", "-c", COUNT_SESSIONS]);
  const counted = /^(\d+)\n(\d+)$/.exec(stdout.trim());
  if (counted === null) throw new Error(`could not count sessions: ${stdout}`);
  const limit = Math.max(6, Math.floor(Number(counted[2]) / 3 / 1024 ** 3));

  return Number(counted[1]) >= limit;
}
