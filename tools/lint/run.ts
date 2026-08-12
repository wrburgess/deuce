// The document lint, as four named commands: `npm run lint:links`,
// `lint:classes`, `lint:gates`, `lint:glossary` (#55; Chapter 3, *The
// configuration lint*).
//
// This file is the wiring only — inventory the tracked documents, hand them
// to the check named on the command line, report. Every decision lives in
// the module for that check, where it can be measured without touching the
// filesystem (ADR 0014).

import { existsSync } from "node:fs";
import { join } from "node:path";

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
  const which = process.argv[2];

  // A missing library is the toolchain absent, not a state the repository is
  // in: report it by name with the fix, never a raw module-not-found crash
  // (Chapter 3, *The tooling contract*).
  let markdown: typeof import("./markdown.ts");
  try {
    markdown = await import("./markdown.ts");
  } catch (err) {
    cannotRun(`a library is not installed (${(err as Error).message}); fix: bash bin/setup`);
    return;
  }

  // The directory argument exists for the empty-input deletion measurements
  // (ADR 0014); the gate always runs the default.
  const dir = process.argv[3] ?? ".";
  let files: import("./markdown.ts").MarkdownFile[];
  try {
    files = markdown.trackedMarkdown(dir);
  } catch (err) {
    cannotRun((err as Error).message);
    return;
  }

  switch (which) {
    case "links": {
      const { checkLinks } = await import("./links.ts");
      const result = checkLinks(files, (path) => existsSync(join(dir, path)));
      if (result.guard !== null) return cannotRun(result.guard);
      const scope = `${result.internalChecked} internal links checked across ${result.filesRead} tracked documents; ${result.externalSkipped} external links not probed; links carried in raw HTML not read`;
      if (result.violations.length > 0) {
        for (const v of result.violations) console.error(v);
        console.error(`links-resolve red — ${scope}`);
        process.exitCode = EXIT_REJECTED;
        return;
      }
      console.log(`links-resolve green — ${scope}`);
      return;
    }
    case "classes": {
      const { checkClasses } = await import("./classes.ts");
      const index = files.find((f) => f.path === "findings/classes.md");
      if (index === undefined) return cannotRun("findings/classes.md is not among the tracked documents");
      const result = checkClasses(index.content);
      if (result.guard !== null) return cannotRun(result.guard);
      if (result.violations.length > 0) {
        for (const v of result.violations) console.error(v);
        console.error(`class-grammar red — ${result.entries} entries read from findings/classes.md`);
        process.exitCode = EXIT_REJECTED;
        return;
      }
      console.log(`class-grammar green — ${result.entries} entries read from findings/classes.md, every count held against its instance lines`);
      return;
    }
    case "gates": {
      const { checkGates } = await import("./gates.ts");
      const result = checkGates(files);
      // The blind spot prints on every run, green or red: a green that does
      // not carry its own limits reads wider than the check (#55).
      for (const line of result.blindSpot) console.log(line);
      if (result.guard !== null) return cannotRun(result.guard);
      if (result.violations.length > 0) {
        for (const v of result.violations) console.error(v);
        console.error(`gate-setting red — ${result.enforcedScanned} enforced documents scanned`);
        process.exitCode = EXIT_REJECTED;
        return;
      }
      console.log(`gate-setting green — ${result.enforcedScanned} enforced documents scanned for setting tokens and unresolved gate names`);
      return;
    }
    case "glossary": {
      const { checkGlossary } = await import("./glossary.ts");
      const glossary = files.find((f) => f.path === "GLOSSARY.md");
      if (glossary === undefined) return cannotRun("GLOSSARY.md is not among the tracked documents");
      const canon = files.filter((f) => f.path.startsWith("sds/"));
      const result = checkGlossary(glossary, canon);
      if (result.guard !== null) return cannotRun(result.guard);
      // Absences report and never fail: staleness signals for the hygiene
      // sweep, not defects (Chapter 3). The forward direction is declared
      // undecidable and stays with review.
      for (const line of result.reports) console.log(line);
      console.log(
        `glossary-reverse green — ${result.terms} entry terms searched across ${canon.length} canon chapters; ${result.reports.length} staleness signals for the hygiene sweep; the forward direction stays with review`,
      );
      return;
    }
    default:
      cannotRun(`unknown check '${which ?? ""}' — one of: links, classes, gates, glossary`);
  }
}

await main();
