/**
 * Pins the default model and reasoning effort of Claude Code's built-in subagents without an agent file, which would replace the built-in prompt.
 * Each role's defaults come from this mod's settings options, stored in settings.json under `pluginConfigs`; a model or effort the main agent passes on its Agent call wins over them.
 * The model is set as a subagent starts, but effort can only be set per model request, so each started subagent's id is remembered with its role's effort.
 * The remembered ids live in this module, so a reload forgets them for subagents already running; their later requests run at the session's effort.
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
  // The spawn event doesn't carry a requested effort, so Agent calls that passed one are noted here by tool-use id.
  const callsWithEffort = new Set<string>();
  const effortByAgent = new Map<string, Effort>();

  on("tool.call", { tool: "Agent" }, ($, e, next) => {
    if (e.tool_use_id !== undefined && e.effort !== undefined) callsWithEffort.add(e.tool_use_id);
    return next(e);
  });

  on("agent.spawn", async ($, e, next) => {
    const role = roles.get(e.subagentType);
    if (role === undefined) return next(e);
    const started = await next(e.model === undefined ? { ...e, model: role.model } : e);
    const effortRequested = callsWithEffort.delete(e.tool_use_id);
    if (!effortRequested && !started.deny && started.agentId !== undefined)
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
