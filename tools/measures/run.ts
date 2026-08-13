// The measures command, as one named command: `npm run measures -- <pr>`
// (#57; ADR 0028). It computes what the tracker holds and prints the block the
// Delivery Record carries — it never posts, and it decides nothing the Ship
// gate rests on.
//
// This file is the wiring only: fetch once, hand the snapshot to the pure
// modules, print. Every decision lives in the module beside it, where it is
// measurable against a literal input without touching the network (ADR 0014).
// The `--snapshot <file>` argument exists for those measurements; `--issue
// <n>` names the issue when the pull request's own links cannot.

import { readFileSync } from "node:fs";

const EXIT_OK = 0;
const EXIT_CANNOT_RUN = 2;

// An asynchronous EPIPE arrives after the write returns, so no try/catch
// reaches it, and it would replace a classified exit with a crash — the fix
// PR #46 landed for summon.ts.
process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

function cannotRun(message: string): void {
  console.error(`the measures could not be computed — ${message}`);
  process.exitCode = EXIT_CANNOT_RUN;
}

async function main(): Promise<void> {
  // A missing library is the toolchain absent, not a state the repository is
  // in: report it by name with the fix, never a raw module-not-found crash
  // (Chapter 3, *The tooling contract*).
  let snapshotMod: typeof import("./snapshot.ts");
  let qualityMod: typeof import("./quality.ts");
  let throughputMod: typeof import("./throughput.ts");
  let renderMod: typeof import("./render.ts");
  let helpersMod: typeof import("./run-helpers.ts");
  try {
    snapshotMod = await import("./snapshot.ts");
    qualityMod = await import("./quality.ts");
    throughputMod = await import("./throughput.ts");
    renderMod = await import("./render.ts");
    helpersMod = await import("./run-helpers.ts");
  } catch (err) {
    cannotRun(`a library is not installed (${(err as Error).message}); fix: bash bin/setup`);
    return;
  }

  const args = helpersMod.parseArgs(process.argv.slice(2));
  if (args.error !== null) {
    cannotRun(args.error);
    return;
  }

  let snapshot: import("./snapshot.ts").PullRequestSnapshot;
  if (args.snapshotPath !== null) {
    let json: string;
    try {
      json = readFileSync(args.snapshotPath, "utf8");
    } catch (err) {
      cannotRun(`the snapshot file could not be read: ${(err as Error).message}`);
      return;
    }
    try {
      snapshot = snapshotMod.parseSnapshot(json);
    } catch (err) {
      cannotRun((err as Error).message);
      return;
    }
  } else {
    try {
      const { fetchPullRequest } = await import("./fetch.ts");
      snapshot = fetchPullRequest(args.pr!);
    } catch (err) {
      cannotRun((err as Error).message);
      return;
    }
  }

  let declaration: import("./render.ts").MeasureDeclaration;
  try {
    declaration = renderMod.parseMeasureDeclaration(readFileSync("config/measures.md", "utf8"));
  } catch (err) {
    // The capture states are the declaration's; without it the block would
    // assert states nothing declared.
    cannotRun(`config/measures.md could not be read: ${(err as Error).message}`);
    return;
  }

  const chosen = helpersMod.selectIssue(snapshot.closes, args.issue, snapshot.number);
  if (chosen.error !== null) {
    cannotRun(chosen.error);
    return;
  }

  const quality = qualityMod.computeQuality(snapshot.comments);
  const recordPostedAt = throughputMod.findDeliveryRecord(snapshot.comments);

  let throughput: import("./throughput.ts").ThroughputResult;
  try {
    throughput = throughputMod.computeThroughput({
      issue: chosen.issue!,
      recordPostedAt,
      now: new Date().toISOString(),
    });
  } catch (err) {
    cannotRun((err as Error).message);
    return;
  }

  // What was read, named — a computed claim is auditable only if its reader
  // can see the inputs (Chapter 3, *The tooling contract*). It goes to stderr
  // so the block on stdout stays paste-ready.
  console.error(
    `read PR #${snapshot.number}: ${snapshot.comments.length} comments, ${quality.recordsCounted} standing contractor record(s), issue #${chosen.issue!.number}; Delivery Record ${recordPostedAt === null ? "not posted yet — the end stamp is this run" : `posted ${recordPostedAt}`}`,
  );
  console.log(renderMod.renderBlock({ declaration, quality, throughput, prNumber: snapshot.number }));
  process.exitCode = EXIT_OK;
}

await main();
