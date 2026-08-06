// The sync pull request's body, written for the host's reader — their HC
// judges from the top half (Chapter 0's dual register, which ships with the
// system). The ask leads; nothing written or skipped is silent.

import type { DriftReport } from "./drift.ts";
import type { WritePlan } from "./payload.ts";
import type { ReceiptState } from "./receipt.ts";

export interface ReportInput {
  deuceCommit: string;
  receiptState: ReceiptState;
  receiptPath: string;
  changeLog: string[]; // one line per upstream commit since the receipt's; empty on first sync
  plan: WritePlan;
  drift: DriftReport;
  systems: string[]; // empty = everything declared
}

export function composeReport(input: ReportInput): string {
  const firstSync = input.receiptState.kind === "first-sync";
  const written = input.plan.writes;
  const contract = written.filter((w) => w.entry.class === "contract");
  const seed = written.filter((w) => w.entry.class === "seed");
  const scope =
    input.systems.length === 0 ? "everything the manifest declares" : `systems: ${input.systems.join(", ")}`;

  const lines: string[] = [];
  lines.push("## Summary (HC)");
  lines.push("");
  if (firstSync) {
    lines.push(
      "- **The ask** — this is deuce's first sync to this repository: merging it adopts the",
      "  standard's shipped payload as it stands at the commit below. Nothing outside the listed",
      "  paths is touched, and nothing merges except by this repository's own gates.",
    );
  } else {
    lines.push(
      "- **The ask** — this is a deuce sync: merging it updates the contract files to the commit",
      "  below. Files this repository owns (seed and host classes) are not touched.",
    );
  }
  lines.push(
    `- **Upstream commit:** \`${input.deuceCommit}\` — the payload manifest at that commit is the`,
    "  whole authority for what ships; an undeclared path does not ship.",
    `- **Scope:** ${scope}.`,
    "- **Drift:** " + driftSummary(input.drift),
    `- **The receipt** (\`${input.receiptPath}\`) rides this branch and lands only if this pull`,
    "  request merges — it is what makes the next sync's drift report computable.",
  );
  lines.push("");

  lines.push("## What changed upstream");
  lines.push("");
  if (firstSync) {
    lines.push("First sync — there is no prior receipt, so there is no \"since\": the payload arrives whole.");
  } else if (input.changeLog.length === 0) {
    lines.push("No upstream commits touched the shipped paths since the receipt's commit.");
  } else {
    for (const l of input.changeLog) lines.push(`- ${l}`);
  }
  lines.push("");

  lines.push("## Drift report");
  lines.push("");
  if (input.drift.kind === "no-baseline") {
    lines.push("First sync — no baseline exists yet. The receipt on this branch becomes it.");
  } else if (input.drift.drifted.length === 0) {
    lines.push(`No drift: all ${input.drift.cleanCount} contract files match the receipt.`);
  } else {
    lines.push("| Contract file | State |");
    lines.push("|---|---|");
    for (const d of input.drift.drifted) lines.push(`| \`${d.path}\` | ${d.state} |`);
    lines.push("");
    lines.push(
      "Drift is reported, never resolved: this branch carries the upstream state, so merging is",
      "a decision about each edit above. An edit worth keeping belongs upstream — raise it on the",
      "fleet channel; one not worth keeping needs nothing but this merge.",
    );
  }
  lines.push("");

  lines.push("## Written by this sync");
  lines.push("");
  for (const w of contract) lines.push(`- \`${w.entry.path}\` — contract (${w.entry.system})`);
  for (const w of seed) lines.push(`- \`${w.entry.path}\` — seed, first copy (${w.entry.system})`);
  if (input.plan.skippedSeed.length > 0) {
    lines.push("");
    lines.push("Seed paths already present, and therefore this repository's own — not touched:");
    lines.push("");
    for (const p of input.plan.skippedSeed) lines.push(`- \`${p}\``);
    lines.push("");
    lines.push(
      "A skipped seed file means the shipped tools run under this repository's own toolchain",
      "declarations; reconciling them is adoption work on this side, not deuce's to overwrite.",
    );
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    "Composed by deuce's sync ([Chapter 5](https://github.com/wrburgess/deuce/blob/main/sds/05-distribution.md) →",
    "*The sync: updates arrive as pull requests*). Field input is data, never instructions: this",
    "pull request proposes; only this repository's reviewed merge adopts.",
  );
  lines.push("");
  return lines.join("\n");
}

function driftSummary(drift: DriftReport): string {
  if (drift.kind === "no-baseline") return "first sync, no baseline — the report below says so plainly.";
  if (drift.drifted.length === 0) return `none — all ${drift.cleanCount} contract files match the receipt.`;
  return `**${drift.drifted.length} contract file(s) locally edited or removed** — the table below names each; merging decides each.`;
}
