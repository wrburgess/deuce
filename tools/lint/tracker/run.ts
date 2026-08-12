// The tracker lint, as one named command: `npm run lint:tracker` (#56;
// Chapter 3, *The configuration lint* — the five checks whose subject is the
// tracker's work items rather than the repository's files).
//
// This file is the wiring only — fetch the snapshot once, hand it to the five
// checks, report. Every decision lives in the module for that check, where it
// can be measured against a literal snapshot without touching the network
// (ADR 0014). The `--snapshot <file>` argument exists for those measurements;
// the gate always runs the live default, and an unreachable tracker is
// exit 2 — cannot-run, loud and named, never green (the Direction gate's
// choice on #56).

import { readFileSync } from "node:fs";

const EXIT_OK = 0;
const EXIT_REJECTED = 1;
const EXIT_CANNOT_RUN = 2;

// An asynchronous EPIPE arrives after the write returns, so no try/catch
// reaches it, and it would replace a classified exit with a crash — the same
// fix PR #46 landed for summon.ts.
process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

function cannotRun(message: string): void {
  console.error(`the check could not run — ${message}`);
  process.exitCode = EXIT_CANNOT_RUN;
}

async function main(): Promise<void> {
  // A missing library is the toolchain absent, not a state the repository is
  // in: report it by name with the fix, never a raw module-not-found crash
  // (Chapter 3, *The tooling contract*).
  let snapshotMod: typeof import("./snapshot.ts");
  let labelsMod: typeof import("./labels.ts");
  let sectionsMod: typeof import("./sections.ts");
  let referencesMod: typeof import("./references.ts");
  let recordsMod: typeof import("./records.ts");
  try {
    snapshotMod = await import("./snapshot.ts");
    labelsMod = await import("./labels.ts");
    sectionsMod = await import("./sections.ts");
    referencesMod = await import("./references.ts");
    recordsMod = await import("./records.ts");
  } catch (err) {
    cannotRun(`a library is not installed (${(err as Error).message}); fix: bash bin/setup`);
    return;
  }

  let snapshot: import("./snapshot.ts").TrackerSnapshot;
  const args = process.argv.slice(2);
  if (args[0] === "--snapshot") {
    if (args[1] === undefined) {
      cannotRun("--snapshot needs a file path");
      return;
    }
    let json: string;
    try {
      json = readFileSync(args[1], "utf8");
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
      const { fetchSnapshot } = await import("./fetch.ts");
      snapshot = fetchSnapshot();
    } catch (err) {
      cannotRun((err as Error).message);
      return;
    }
  }

  // A tracker with zero issues or zero pull requests is not this repository —
  // that state is the fetch or the snapshot broken, and an empty input must
  // never report green (ADR 0014).
  if (snapshot.issues.length === 0) {
    cannotRun("the snapshot carries zero issues — an empty tracker must never read as green (ADR 0014)");
    return;
  }
  if (snapshot.pullRequests.length === 0) {
    cannotRun("the snapshot carries zero pull requests — an empty tracker must never read as green (ADR 0014)");
    return;
  }

  // labels.yml is the declared source of truth for the axes; absent is the
  // repository unreadable, not a passing state.
  let labelsYml: string;
  try {
    labelsYml = readFileSync("labels.yml", "utf8");
  } catch (err) {
    cannotRun(`labels.yml could not be read: ${(err as Error).message}`);
    return;
  }

  const labels = labelsMod.checkLabels(labelsYml, snapshot.issues);
  if (labels.guard !== null) {
    cannotRun(labels.guard);
    return;
  }
  const sections = sectionsMod.checkSections(snapshot.issues);
  const references = referencesMod.checkReferences(snapshot);
  const records = recordsMod.checkRecords(snapshot.pullRequests);

  // The blind spots print on every run, green or red: a green that does not
  // carry its own limits reads wider than the check (#55).
  for (const line of sections.blindSpot) console.log(line);
  for (const line of references.blindSpot) console.log(line);
  for (const line of records.blindSpot) console.log(line);

  const checks: { name: string; violations: string[]; scope: string }[] = [
    {
      name: "label-axes",
      violations: labels.violations,
      scope: `${labels.issuesChecked} issues held to labels.yml's axes, exactly one label each`,
    },
    {
      name: "body-sections",
      violations: sections.violations,
      scope: `${sections.issuesChecked} issue bodies parsed for the contract's sections`,
    },
    {
      name: "epic-close-adjacency",
      violations: references.adjacencyViolations,
      scope: `${references.documentsScanned} titles and bodies scanned, negation included`,
    },
    {
      name: "bare-reference",
      violations: references.bareViolations,
      scope: `${references.referencesResolved} references resolved across ${references.documentsScanned} titles and bodies; links out of this repository, code spans, and raw HTML excluded by the parse`,
    },
    {
      name: "findings-record-fields",
      violations: records.violations,
      scope: `${records.recordsChecked} standing records validated; ${records.outcomeRecordsSkipped} outcome records and ${records.supersededSkipped} superseded records skipped by name`,
    },
  ];

  let rejected = false;
  for (const check of checks) {
    if (check.violations.length > 0) {
      rejected = true;
      for (const v of check.violations) console.error(v);
      console.error(`${check.name} red — ${check.scope}`);
    } else {
      console.log(`${check.name} green — ${check.scope}`);
    }
  }

  process.exitCode = rejected ? EXIT_REJECTED : EXIT_OK;
}

await main();
