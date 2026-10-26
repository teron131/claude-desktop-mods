# Claude Desktop Mods

Mods for the Code tab of the Claude desktop app: Claude Code plugins that change what the app draws or how a session behaves, without touching the app itself. Each installs on its own, and none sends anything off your machine.

They're made to share, so clone them and have your Claude customize them to how you work.

![A desktop session where the final answer has an orange rail and a "Worked for 4m 17s · 8.17M (99%) in · 23k out · 92 tps · $3.10" line, and the footer reads "Total 20h 51m 9s · 1.73B (99%) in · 5.90M out · 98 tps · $702.46"](docs/screenshot.png)

The orange rail marks the final answer (`answer-indicator`); the line under it and the footer's Total are `Total`'s figures.

## Install

```bash
claude plugin marketplace add teron131/claude-desktop-mods
```

```bash
claude plugin install answer-indicator@claude-desktop-mods
claude plugin install Total@claude-desktop-mods
claude plugin install retitle@claude-desktop-mods
claude plugin install subagent-models@claude-desktop-mods
```

## Mods

Each mod's README covers what it does, what it reads, writes and runs, and how to install it on its own.

### [answer-indicator](plugins/answer-indicator/README.md)

Marks each turn's final answer with an orange rail. Works in the desktop app.

![A turn with progress notes, collapsed commands, a widget, an image and a file changes card; only the final answer has the orange rail](plugins/answer-indicator/answer-indicator.svg)

### [Total](plugins/total/README.md)

Shows each turn's time, tokens, speed and cost, and the session's sum. Works in the desktop app; the terminal shows the sum.

![The turn line "Worked for 1m 42s · 412k (96%) in · 7k out · 74 tps · $0.35" with a key explaining each figure, and the footer's Total for the whole session](plugins/total/total.svg)

### [retitle](plugins/retitle/README.md)

Lets the main agent name the session and rename it as the work moves on. Works in the desktop app.

![Seven turns of one session: the first prompt names it "Mobile Revenue Chart", a side question and more chart work keep it, and once two requests in a row are about a PDF export the main agent renames it "Dashboard PDF Export"](plugins/retitle/retitle.svg)

### [subagent-models](plugins/subagent-models/README.md)

Sets the model and effort of the built-in subagents. Works in the desktop app and the terminal.

![The mod's settings give Explore Sonnet at high effort and general-purpose Opus at high effort, and an Explore call that names Haiku still runs on Sonnet](plugins/subagent-models/subagent-models.svg)
