/**
 * The bars' clock over a set of runs: from the first start to the last end, with each idle stretch between bursts of work cut to a small gap, so runs side by side line up even when the set spans days.
 */

type Axis = {
  // A time's position on the clock, from 0 to `span`.
  place: (at: number) => number;
  span: number;
  // How long some subagent was running, overlaps counted once.
  busy: number;
};

export function busyAxis(spans: readonly (readonly [number, number])[]): Axis {
  const bursts: [number, number][] = [];
  for (const [start, end] of [...spans].sort((a, b) => a[0] - b[0])) {
    const last = bursts.at(-1);
    if (last !== undefined && start <= last[1]) last[1] = Math.max(last[1], end);
    else bursts.push([start, end]);
  }
  const busy = bursts.reduce((total, [start, end]) => total + end - start, 0);
  const gap = Math.max(1, busy * 0.03);
  const place = (at: number) => {
    let position = 0;
    for (const [start, end] of bursts) {
      if (at <= end) return position + Math.max(0, at - start);
      position += end - start + gap;
    }
    return position - gap;
  };
  return { place, span: Math.max(1, busy + gap * (bursts.length - 1)), busy };
}
