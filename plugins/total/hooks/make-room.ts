/**
 * The hooks Total registers to end a desktop session's Claude Code process soon after you leave it while the app is at its limit on session processes, so the next session you open gets a process, and with it Total's figures and any other mod's display, at once.
 *
 * At that limit the app starts a newly opened session only by pausing one that has been idle a minute, and never retries one it refused, so while you switch fast the newest session would get no process and no mod would run in it.
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

// Work that outlives the turn that started it and ends with the process.
const LASTING_TOOLS = new Set(["Monitor", "ScheduleWakeup", "CronCreate"]);

const BUSY = new Set<AgentStatus>(["pending", "running", "waiting"]);

// The mod's commands are children of the session's Claude Code process, and every desktop session runs that same binary; prints their count, then the RAM in bytes.
const COUNT_SESSIONS =
  'exe=$(ps -o comm= -p "$PPID"); ps -axo comm= | grep -cxF -- "$exe"; sysctl -n hw.memsize';

// Ends this session's process; $1 is the session's id, and $2 is 1 when the process is young enough to count as a crash.
// Left sessions that see the same full app at once would each release, so the first to stamp a file goes and the rest skip for 3 s, freeing one slot per need.
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

// The fields of the app's get_session answer this mod acts on.
type SessionState = { sessionId: string; isRunning: boolean; remoteControlActive: boolean };

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
  if ((await $.session.surfaces()).length > 0) return;
  if ((await $.agent.list()).some(({ status }) => BUSY.has(status))) return;
  if (!(await isAtLimit($))) return;
  const { sessionId, isRunning, remoteControlActive } = await readSession($);
  // Remote Control keeps a session reachable from your phone only while its process runs.
  if (isRunning || remoteControlActive) return;
  await $.process.run(["/bin/sh", "-c", RELEASE, "sh", sessionId, isYoung ? "1" : "0"]);
}

async function readSession($: EngineInterface): Promise<SessionState> {
  const { content, isError } = await $.mcp.call("ccd_session_mgmt", "get_session", {
    session_id: "self",
  });
  const text = content.find((block) => block.type === "text")?.text;
  if (isError || text === undefined) throw new Error(`get_session failed: ${text ?? "no text"}`);

  return JSON.parse(text);
}

// The app's limit is max(6, RAM / 3 GiB) session processes.
async function isAtLimit($: EngineInterface): Promise<boolean> {
  const { stdout } = await $.process.run(["/bin/sh", "-c", COUNT_SESSIONS]);
  const counted = /^(\d+)\n(\d+)$/.exec(stdout.trim());
  if (counted === null) throw new Error(`could not count sessions: ${stdout}`);
  const limit = Math.max(6, Math.floor(Number(counted[2]) / 3 / 1024 ** 3));

  return Number(counted[1]) >= limit;
}
