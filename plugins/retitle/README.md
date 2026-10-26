# retitle

Gives a Claude desktop session's title to the main agent, the model already working the session, so the title follows the work.

![Seven turns of one session: the first prompt names it "Mobile Revenue Chart", a side question and more chart work keep it, and once two requests in a row are about a PDF export the main agent renames it "Dashboard PDF Export"](retitle.svg)

- **Why the main agent:** the app's own title is set once from your first message, and a separate titling model would need the whole conversation or drift without it. The main agent already has the session, so a check costs a short note per prompt, plus a rename call when one is due.
- **When:** it names the session before its first reply, then renames it once your last several requests have moved past the title. The whole session would anchor a long one to its start, and the latest message alone would flip on a side question.
- **Form:** 3–6 words in Title Case, subject first, no emoji.
- **No approval card:** `retitle` approves the app's rename card itself.

Works in the Code tab of the Claude desktop app.

## What it adds and approves

- It adds a short note to each prompt you send, with the session's current title and the rules above, which the main agent reads along with your message.
- It approves the desktop app's card for the session-title tool, `mcp__ccd_session_mgmt__set_session_title`, so a rename doesn't wait for you. It approves no other tool.
- It reads and writes no files, and sends nothing off your machine.

## Install

```bash
claude plugin marketplace add teron131/claude-desktop-mods
```

```bash
claude plugin install retitle@claude-desktop-mods
```

Part of [Claude Desktop Mods](https://github.com/teron131/claude-desktop-mods), licensed MIT.
