// The sync pull request's body, written for the host's reader — their HC
// judges from the top half (Chapter 0's dual register, which ships with the
// system). The ask leads; nothing written or skipped is silent.

import type { DriftReport, RetiredFile } from "./drift.ts";
import type { WritePlan } from "./payload.ts";
import type { ReceiptState } from "./receipt.ts";
import type { Reference, ReferenceKind, ReferenceScan } from "./references.ts";

export interface ReportInput {
  deuceCommit: string;
  receiptState: ReceiptState;
  receiptPath: string;
  changeLog: string[]; // one line per upstream commit since the receipt's; empty on first sync
  plan: WritePlan;
  drift: DriftReport;
  retired: RetiredFile[]; // receipt paths the manifest no longer names, each with its host state
  heldBack: string[]; // host-territory receipt paths — dropped from the receipt, never removed
  hostReferences: ReferenceScan; // places in the host still naming a retired path (#122)
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
  );
  if (input.retired.length > 0) {
    lines.push(
      `- **Retired by deuce: ${input.retired.length} path(s)** the manifest no longer names —`,
      "  removed on this branch; the table below names each and what merging does to it.",
    );
    lines.push(...referenceSummary(input));
  }
  lines.push(
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

  if (input.retired.length > 0 || input.heldBack.length > 0) {
    lines.push("## Retired by this sync");
    lines.push("");
    if (input.retired.length > 0) {
      lines.push(
        "A retired path is one the payload manifest no longer names: deuce shipped it once, and",
        "this sync removes it. The removal is a diff line on this branch — merging adopts it, the",
        "same door every update comes through.",
      );
      lines.push("");
      lines.push("| Path | State on the host |");
      lines.push("|---|---|");
      for (const r of input.retired) lines.push(`| \`${r.path}\` | ${retirementLine(r)} |`);
      lines.push(...referenceSection(input));
    }
    if (input.heldBack.length > 0) {
      lines.push("");
      lines.push(
        "Receipt entries under this repository's own territory — never deuce's to remove. Each is",
        "dropped from the receipt without a removal; the file, if present, stays as it is:",
      );
      lines.push("");
      for (const p of input.heldBack) lines.push(`- \`${p}\``);
    }
    lines.push("");
  }

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
    "pull request proposes; only this repository's reviewed merge adopts. The credential a sync",
    "runs under — attended or automated — is declared, with its blast radius, at",
    "[deuce's credential registry](https://github.com/wrburgess/deuce/blob/main/config/credentials.md).",
  );
  lines.push("");
  return lines.join("\n");
}

// Host references to the retired paths (#122). Rendered only where there is
// something to say: no retirement, no section — the same rule the retirement
// table already runs on.

const KIND_ORDER: ReferenceKind[] = ["relative-link", "in-url", "prose", "unparsed"];

const KIND_LABEL: Record<ReferenceKind, string> = {
  "relative-link": "relative link",
  "in-url": "inside a URL",
  prose: "prose",
  unparsed: "mention (not interpreted)",
};

// Distinct places, not distinct references: one line carrying both the label
// and the destination is one place a reader has to look at.
function places(references: readonly Reference[]): Set<string> {
  return new Set(references.map((r) => `${r.file}:${r.line}`));
}

function referenceSummary(input: ReportInput): string[] {
  const { references } = input.hostReferences;
  if (references.length === 0) return [];
  const files = new Set(references.map((r) => r.file));
  const live = places(references.filter((r) => r.kind === "relative-link"));
  return [
    `- **Host references to the retired paths: ${places(references).size} line(s) in ` +
      `${files.size} file(s)** — ${live.size} of them carry a live relative link that merging`,
    "  leaves pointing at nothing. Every file named is this repository's own; the table under",
    "  *Retired by this sync* names each and its lines.",
  ];
}

function referenceSection(input: ReportInput): string[] {
  const { references, unread } = input.hostReferences;
  if (references.length === 0) return [];

  const order: string[] = [];
  const byFile = new Map<string, Map<ReferenceKind, Set<number>>>();
  for (const r of references) {
    let kinds = byFile.get(r.file);
    if (kinds === undefined) {
      kinds = new Map();
      byFile.set(r.file, kinds);
      order.push(r.file);
    }
    const at = kinds.get(r.kind) ?? new Set<number>();
    at.add(r.line);
    kinds.set(r.kind, at);
  }

  const lines = [
    "",
    "### Host references to the retired paths",
    "",
    "A reference is a place in this repository that still names a path this sync removes. deuce",
    "names them and never edits them — every file below is this repository's own.",
    "",
    "| File | Kind | Lines |",
    "|---|---|---|",
  ];
  for (const file of order) {
    const kinds = byFile.get(file)!;
    for (const kind of KIND_ORDER) {
      const at = kinds.get(kind);
      if (at === undefined) continue;
      const numbers = [...at].sort((a, b) => a - b).join(", ");
      lines.push(`| \`${file}\` | ${KIND_LABEL[kind]} | ${numbers} |`);
    }
  }
  lines.push(
    "",
    "- **A dated record naming a retired path is correct as written** — a findings log, a dated",
    "  plan, a review note. That holds for a *relative link* inside one as much as for a plain",
    "  mention, so a row here is never by itself a reason to edit.",
    "- **Every row is a statement, never a task.** These files are this repository's own, and",
    "  deuce has no standing to change them.",
    "- **Not reached, and named on every run:** a mention of a directory with no file name after",
    "  it · a reference assembled at runtime from parts · a mention written relative to its own",
    "  directory · a web address written as plain text rather than as a link · " +
      `${unread} file(s) not read (binary or unreadable).`,
  );
  return lines;
}

function retirementLine(r: RetiredFile): string {
  if (r.state === "intact") return "intact — matches the receipt; removed";
  if (r.state === "edited")
    return "**edited — the host changed it; merging discards the host's edit**";
  return "already absent — nothing to remove; the receipt entry is dropped";
}

function driftSummary(drift: DriftReport): string {
  if (drift.kind === "no-baseline") return "first sync, no baseline — the report below says so plainly.";
  if (drift.drifted.length === 0) return `none — all ${drift.cleanCount} contract files match the receipt.`;
  return `**${drift.drifted.length} contract file(s) locally edited or removed** — the table below names each; merging decides each.`;
}
