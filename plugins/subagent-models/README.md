# subagent-models

Sets the model and effort of Claude Code's [built-in subagents](https://code.claude.com/docs/en/sub-agents#built-in-subagents), `Explore` and `general-purpose`, while keeping their built-in instructions, which a subagent of your own with the same name would replace.

![The mod's settings give Explore Sonnet at high effort and general-purpose Opus at high effort, and an Explore call that names Haiku still runs on Sonnet](subagent-models.svg)

- Your settings apply to every run, even when the main agent's Agent call names another model or effort.
- Claude Code asks for the four options when you install the mod and saves them in settings.json under `pluginConfigs`; `/config` in a terminal session changes them.

Works in the Claude desktop app and the terminal.

## What it changes

- It sets the model of each `Explore` and `general-purpose` subagent as it starts, and the reasoning effort of each request the subagent makes.
- It reads and writes no files, and sends nothing off your machine.

## Install

```bash
claude plugin marketplace add teron131/claude-desktop-mods
```

```bash
claude plugin install subagent-models@claude-desktop-mods
```

Part of [Claude Desktop Mods](https://github.com/teron131/claude-desktop-mods), licensed MIT.
