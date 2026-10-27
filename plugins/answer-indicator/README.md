# answer-indicator

Draws an orange rail, in the color of the thinking dots, beside each turn's final answer in the Claude desktop app, past turns included, so answers stand out while you scroll. Only the answer's text is marked; progress notes, collapsed commands, widgets, images and the file changes after it are not.

![A turn with progress notes, collapsed commands, a widget, an image and a file changes card; only the final answer has the orange rail](answer-indicator.svg)

Works in the Code tab of the Claude desktop app.

## What it reads and runs

- It finds past answers in the transcripts Claude Code keeps under `~/.claude/projects`, and follows a rewound session to its earlier transcripts through the desktop app's session records.
- It searches them with Claude Code's built-in ripgrep, so nothing needs installing; on Windows, PowerShell finds Claude Code's binary for it.
- It writes nothing and sends nothing off your machine.

## Install

```bash
claude plugin marketplace add teron131/claude-desktop-mods
```

```bash
claude plugin install answer-indicator@claude-desktop-mods
```

Part of [Claude Desktop Mods](https://github.com/teron131/claude-desktop-mods), licensed MIT.
