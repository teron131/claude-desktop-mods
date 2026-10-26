# Total

Writes each turn's time, tokens, cache share, output speed and API-equivalent cost under its final answer in the Claude desktop app, and the session's sum in the footer.

![The turn line "Worked for 1m 42s · 412k (96%) in · 7k out · 74 tps · $0.35" with a key explaining each figure, and the footer's Total for the whole session](total.svg)

- Tokens and speed count only the main conversation; the cost is Claude Code's own `/cost` figure, subagents included, so no prices are fetched.
- Past turns' figures come from the session's transcripts, so turns from before you installed `Total` show too, but without a cost, since transcripts keep only the session's total.
- After a rewind, the figures come back a few seconds later, once the app records the session's new transcript.

Works in the Code tab of the Claude desktop app; a terminal session shows only the sum, in its status area.

On macOS, `Total` also makes sure the session you click on opens at once. The app runs each session you click on in its own process, at most `max(6, RAM ÷ 3 GB)` of them, and keeps idle ones running, so it's usually full, and then a session you click on waits until another has idled a minute.

So `Total` ends the process of a session you've clicked away from, and only if nothing is running in it: no turn, background task, subagent or Remote Control. Nothing is lost: the session stays in your sidebar and reopens from its transcript in a second or two. Clicking through 6 sessions past the limit, one every 5 seconds, all 18 opened at once.

**Limitation:** the app treats a process that ends within 30 seconds of starting as a crash, and after 15 it stops reopening that session until you send it a message. So `Total` ends a young process at most 10 times per session per app run; after that it waits until the process is 35 seconds old, and clicking through more sessions than the limit faster than about every 40 seconds can leave one waiting until your next visit.

## What it reads, writes and runs

- It reads the transcripts Claude Code keeps under `~/.claude/projects` and the desktop app's session records, with ripgrep: Claude Code's built-in copy on macOS and Linux, and an installed `rg` on Windows.
- It saves each turn's cost in `~/.claude/total-costs`, one small file per transcript.
- On macOS, to free a session's process, it counts Claude Code processes with `ps`, reads the machine's memory size with `sysctl`, asks the desktop app whether the session is running or reachable through Remote Control, and ends that session's own Claude Code process with `kill -TERM`. Two small files in `~/.claude`, `total-released` and `total-young-releases`, keep sessions from releasing more than one process at a time or more than the crash limit allows.
- It sends nothing off your machine.

## Install

```bash
claude plugin marketplace add teron131/claude-desktop-mods
```

```bash
claude plugin install Total@claude-desktop-mods
```

Part of [Claude Desktop Mods](https://github.com/teron131/claude-desktop-mods), licensed MIT.
