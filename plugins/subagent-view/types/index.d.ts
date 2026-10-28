/**
 * The subagent rows subagent-view keeps in the session's plugin state, where its pane reads them while drawing and a hot reload of the mod's code leaves them in place.
 */

export type Subagent = {
  agentId: string;
  /** The agent that started it; absent when the main conversation did. */
  parentId?: string;
  description: string;
  type: string;
  /** The model of its latest response, or the one it started on before it has one. */
  model: string;
  /** The effort its latest request was sent with; absent before its first request and for a model without effort. */
  effort?: "low" | "medium" | "high" | "xhigh" | "max" | number;
  startedAt: number;
  /** When its latest response arrived; absent before its first. */
  respondedAt?: number;
  tokens: Tokens;
  /** How long its responses took, each from the request before it to its last record, summed, so time spent running tools and waiting stays out of its pace. */
  responseMs: number;
} & ({ status: "running" } | { status: "done" | "failed"; endedAt: number });

export type Tokens = {
  /** Every prompt token its requests sent, cache reads included. */
  input: number;
  cached: number;
  output: number;
};

declare module "claude-code" {
  interface PluginState {
    "subagent-view": { subagents: Subagent[] };
  }
}
