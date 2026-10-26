/**
 * Pins the model and reasoning effort of Claude Code's built-in subagents without an agent file, which would replace the built-in prompt.
 * Each role's model and effort come from this mod's settings options, stored in settings.json under `pluginConfigs`, and override any the main agent names on its Agent call.
 * The model is set as a subagent starts, but effort can only be set per model request, so each started subagent's id is remembered with its role's effort.
 * The remembered ids live in this module, so a reload forgets them for subagents already running; their later requests run at the effort they'd have without this mod.
 */

import type { PluginOptions, Register } from "claude-code";

const efforts = ["low", "medium", "high", "xhigh", "max"] as const;
type Effort = (typeof efforts)[number];
type Role = { model: string; effort: Effort };

export const register: Register = (on, options) => {
  const roles = new Map([
    ["Explore", readRole(options, "explore")],
    ["general-purpose", readRole(options, "general_purpose")],
  ]);
  const effortByAgent = new Map<string, Effort>();

  on("agent.spawn", async ($, e, next) => {
    const role = roles.get(e.subagentType);
    if (role === undefined) return next(e);
    const started = await next({ ...e, model: role.model });
    if (!started.deny && started.agentId !== undefined)
      effortByAgent.set(started.agentId, role.effort);
    return started;
  });

  on("turn.step", async function* ($, e, next) {
    const effort = e.agentId === undefined ? undefined : effortByAgent.get(e.agentId);
    return yield* next(effort === undefined ? e : { ...e, effort });
  });
};

// The manifest marks both options required with fixed choices, so Claude Code refuses to load the mod before a missing or unknown value reaches here.
function readRole(options: PluginOptions, prefix: string): Role {
  const model = options[`${prefix}_model`];
  const effort = efforts.find((level) => level === options[`${prefix}_effort`]);
  if (typeof model !== "string" || effort === undefined)
    throw new Error(`subagent-models: ${prefix}_model and ${prefix}_effort must be set`);
  return { model, effort };
}
