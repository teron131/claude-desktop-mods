/**
 * Token figures counted as Total counts a turn's: every prompt token the requests sent, the share the cache served, and the tokens they generated.
 */

import type { ModelUsage } from "claude-code";

import type { Tokens } from "../types";

export const NO_TOKENS: Tokens = { input: 0, cached: 0, output: 0 };

export function countTokens(usage: ModelUsage): Tokens {
  return {
    input: usage.input_tokens + usage.cache_creation_input_tokens + usage.cache_read_input_tokens,
    cached: usage.cache_read_input_tokens,
    output: usage.output_tokens,
  };
}

export function addTokens(a: Tokens, b: Tokens): Tokens {
  return { input: a.input + b.input, cached: a.cached + b.cached, output: a.output + b.output };
}

export function maxTokens(a: Tokens, b: Tokens): Tokens {
  return {
    input: Math.max(a.input, b.input),
    cached: Math.max(a.cached, b.cached),
    output: Math.max(a.output, b.output),
  };
}
