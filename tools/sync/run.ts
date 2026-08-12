// The sync, orchestrated — readiness, manifest, payload at a pinned commit,
// drift, receipt, branch, pull request — as one command, so it cannot be
// half-run silently (the summon.ts precedent). Exit codes, each a different
// caller decision:
//   0 synced (or a clean dry-run)
//   2 unreachable — gh unauthenticated, or the host cannot be cloned
//   3 nonconforming input — manifest, receipt, or tree disagreement, named
//   4 host-side rejection — branch exists, write or push failed
//   5 the pull request could not be opened; the composed body is saved to a
//     file and stderr names it — the file is the delivery (the record.ts
//     lesson from PR #46)

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { parseManifest, shipSet } from "./manifest.ts";
import { parseReceipt, writeReceipt, type ReceiptState } from "./receipt.ts";
import {
  readPayloadAtCommit,
  planWrites,
  applyWrites,
  applyRetirements,
  type MaterializedFile,
} from "./payload.ts";
import { mergeReceiptChecksums, planRetirements } from "./run-helpers.ts";
import { assessRetirements, computeDrift, sha256Hex } from "./drift.ts";
import { composeReport } from "./report.ts";
import {
  cloneHost,
  createSyncBranch,
  commitAndPush,
  openPullRequest,
  HostRejection,
  run as exec,
} from "./host.ts";

const REJECTION_EXIT: Record<HostRejection["state"], number> = {
  unreachable: 2,
  "branch-exists": 4,
  "push-failed": 4,
  "post-failed": 5,
};

function main(): void {
  const { values } = parseArgs({
    options: {
      host: { type: "string" },
      "receipt-path": { type: "string", default: "config/vendoring-receipt.md" },
      system: { type: "string", multiple: true, default: [] },
      commit: { type: "string" },
      base: { type: "string", default: "main" },
      "dry-run": { type: "boolean", default: false },
    },
  });

  if (!values.host) {
    console.error("usage: node tools/sync/run.ts --host <owner/repo> [--system <s>]... [--commit <sha>] [--dry-run]");
    process.exitCode = 1;
    return;
  }
  const hostRepo = values.host;
  const receiptPath = values["receipt-path"]!;
  const systems = values.system ?? [];
  const dryRun = values["dry-run"] ?? false;

  if (receiptPath.startsWith("/") || receiptPath.split("/").includes("..")) {
    console.error(`sync: --receipt-path '${receiptPath}' is not a repository-relative path (exit 3)`);
    process.exitCode = 3;
    return;
  }

  // Readiness, side-effect-free, before anything is touched.
  try {
    execFileSync("gh", ["auth", "status"], { stdio: "pipe" });
  } catch {
    console.error("sync: gh is not authenticated — nothing was attempted (exit 2)");
    process.exitCode = 2;
    return;
  }

  const deuceRoot = process.cwd();
  const commit =
    values.commit ??
    execFileSync("git", ["-C", deuceRoot, "rev-parse", "origin/main"], { encoding: "utf8" }).trim();

  let manifest, entries;
  try {
    manifest = parseManifest(readFileSync(join(deuceRoot, "config/payload.md"), "utf8"));
    entries = shipSet(manifest, systems);
  } catch (e) {
    console.error(`sync: ${(e as Error).message} (exit 3)`);
    process.exitCode = 3;
    return;
  }

  try {
    // A dry run still clones: the receipt, the drift, and the seed-skip plan
    // are all facts about the host as it stands, unknowable without it.
    const hostRoot = cloneHost(`https://github.com/${hostRepo}.git`);

    // Receipt state, read from the host before anything is written.
    const receiptFile = join(hostRoot, receiptPath);
    let receiptState: ReceiptState;
    try {
      receiptState = existsSync(receiptFile)
        ? { kind: "receipt", receipt: parseReceipt(readFileSync(receiptFile, "utf8")) }
        : { kind: "first-sync" };
    } catch (e) {
      console.error(`sync: ${(e as Error).message} (exit 3)`);
      process.exitCode = 3;
      return;
    }
    const priorReceipt = receiptState.kind === "receipt" ? receiptState.receipt : undefined;

    // Retirements are planned before the receipt merge can forget the path —
    // the removal and the checksum's drop happen in the same run, structurally
    // (#117, the correction on the issue).
    const retirement = planRetirements(priorReceipt, manifest);

    // Drift is computed against the host as it stands, before this sync
    // writes; a retired path's story belongs to the retirement table.
    const drift = computeDrift(hostRoot, priorReceipt, new Set(retirement.retired));
    const retired =
      priorReceipt === undefined ? [] : assessRetirements(hostRoot, priorReceipt, retirement.retired);

    // The payload, at the pinned commit — never the working tree. A manifest
    // path the tree does not carry is nonconforming input, a different
    // outcome from a crash.
    let files: MaterializedFile[];
    try {
      files = readPayloadAtCommit(deuceRoot, commit, entries);
    } catch (e) {
      console.error(`sync: ${(e as Error).message} (exit 3)`);
      process.exitCode = 3;
      return;
    }
    const plan = planWrites(files, hostRoot);

    // Upstream change log over shipped paths since the receipt's commit.
    const changeLog =
      priorReceipt === undefined
        ? []
        : execFileSync(
            "git",
            ["-C", deuceRoot, "log", "--oneline", `${priorReceipt.commit}..${commit}`, "--", ...entries.map((e) => e.path)],
            { encoding: "utf8" },
          )
            .trim()
            .split("\n")
            .filter((l) => l !== "");

    // The new receipt: this sync's contract checksums, computed from the
    // materialized content — the same bytes the branch carries — merged over
    // the prior receipt so a selected-system sync never shrinks the baseline
    // (canon: a checksum per contract file).
    const shippedContract = files
      .filter((f) => f.entry.class === "contract")
      .map((f) => ({ path: f.entry.path, sha256: sha256Hex(f.content) }));
    const newReceipt = {
      commit,
      date: new Date().toISOString().slice(0, 10),
      checksums: mergeReceiptChecksums(priorReceipt, manifest, shippedContract),
    };

    const report = composeReport({
      deuceCommit: commit,
      receiptState,
      receiptPath,
      changeLog,
      plan,
      drift,
      retired,
      heldBack: retirement.heldBack,
      systems,
    });

    console.log(`sync: read config/payload.md (${manifest.date}), receipt state '${receiptState.kind}', ` +
      `payload at ${commit.slice(0, 7)} — ${plan.writes.length} to write, ${plan.skippedSeed.length} seed skipped, ` +
      `${retirement.retired.length} retired`);

    if (dryRun) {
      const out = join(mkdtempSync(join(tmpdir(), "deuce-sync-dry-")), "report.md");
      writeFileSync(out, report);
      console.log(`sync: dry run — nothing written to the host. Report: ${out}`);
      return;
    }

    const branch = `deuce/sync-${commit.slice(0, 7)}`;
    createSyncBranch(hostRoot, branch);
    // A refused write or removal — a symlinked route, a path that escapes, a
    // directory where a retired file was — is the host's state rejecting the
    // sync, not a defect in it: classified 4, named.
    try {
      applyRetirements(hostRoot, retirement.retired);
      applyWrites(hostRoot, plan);
      writeReceipt(hostRoot, receiptPath, newReceipt);
    } catch (e) {
      console.error(`sync: ${(e as Error).message} (exit 4)`);
      process.exitCode = 4;
      return;
    }
    commitAndPush(
      hostRoot,
      branch,
      `chore(deuce): sync to ${commit.slice(0, 7)} — payload, drift report, receipt\n\n` +
        `Composed by deuce's sync (Chapter 5). The pull request body carries the report.\n\n` +
        // The sync is the author; naming whatever model happens to invoke it
        // would misattribute machine output (PR #92's Verification).
        `Co-Authored-By: deuce sync <noreply@anthropic.com>`,
    );

    const bodyFile = join(mkdtempSync(join(tmpdir(), "deuce-sync-body-")), "body.md");
    writeFileSync(bodyFile, report);
    try {
      const url = openPullRequest({
        hostRepo,
        branch,
        base: values.base!,
        title: `deuce sync: ${receiptState.kind === "first-sync" ? "first payload" : "update"} at ${commit.slice(0, 7)}`,
        bodyFile,
      });
      console.log(`sync: pull request opened — ${url}`);
    } catch (e) {
      if (e instanceof HostRejection && e.state === "post-failed") {
        console.error(`sync: branch '${branch}' is pushed; the pull request body is saved at ${bodyFile} — ` +
          `open it by hand (exit 5). ${(e as Error).message}`);
        process.exitCode = 5;
        return;
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof HostRejection) {
      console.error(`sync: ${e.message} (exit ${REJECTION_EXIT[e.state]})`);
      process.exitCode = REJECTION_EXIT[e.state];
      return;
    }
    // Anything else is a crash, and a crash crashes: dressing an unclassified
    // state in a classified exit is how a caller reads "nonconforming input"
    // where the truth was a defect (the tooling contract; PR #92's
    // Verification).
    throw e;
  }
}

main();
