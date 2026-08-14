// Stores the factory's tracker credential, and refuses to store one that does
// not work: `pbpaste | bash bin/factory-credential`.
//
// Why this exists, with its receipt: storing and validating were separate acts,
// so a bad paste into `security`'s silent double prompt looked identical to a
// good one and stayed hidden until a pass spent its start discovering a 401.
// That happened twice on #108. A credential that is verified at the moment it
// is stored cannot fail that way — the same argument the gate makes for
// declaring its contents where they run.
//
// This file is the wiring only; the classification lives in credential.ts,
// where a test can import it without running the command.
//
// Declared blind spots (Chapter 3, *Every check declares its blind spot*):
// the probe proves this token can READ this repository. It does not prove the
// contents, issues, and pull-requests writes a pass needs — nothing short of
// writing decides that, and a probe that wrote would be a side effect in a
// readiness check. Expiry is not reachable either: GitHub's API does not
// report a fine-grained token's expiry, so config/credentials.md's row stays
// the only record of it.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { classify } from "./credential.ts";
import { parseFactoryDeclaration } from "./declaration.ts";
import { parseRemote } from "./preflight.ts";

const DECLARATION = "config/factory.md";

const EXIT_OK = 0;
const EXIT_REFUSED = 1;
const EXIT_CANNOT_RUN = 2;

process.stdout.on("error", () => {});
process.stderr.on("error", () => {});

function git(args: string[]): string | null {
  const run = spawnSync("git", args, { encoding: "utf8" });
  if (run.error || run.status !== 0) return null;
  return run.stdout;
}

function main(): void {
  let declaration;
  try {
    declaration = parseFactoryDeclaration(readFileSync(DECLARATION, "utf8"), homedir());
  } catch (err) {
    console.error(`nothing stored — ${DECLARATION}: ${(err as Error).message}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  let raw: string;
  try {
    raw = readFileSync(0, "utf8");
  } catch {
    console.error(
      "nothing stored — no token on stdin. Pipe it in:\n" +
        "  pbpaste | bash bin/factory-credential\n" +
        '  op read "op://<vault>/<item>/credential" | bash bin/factory-credential',
    );
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const verdict = classify(raw);
  if (verdict.kind === "empty") {
    console.error("nothing stored — stdin was empty. The paste did not land.");
    process.exitCode = EXIT_REFUSED;
    return;
  }
  if (verdict.kind === "not-a-token") {
    console.error(`nothing stored — ${verdict.why}.`);
    console.error("A fine-grained token is about 93 characters and begins `github_pat_`.");
    process.exitCode = EXIT_REFUSED;
    return;
  }
  const token = raw.trim();

  const remote = git(["remote", "get-url", "origin"]);
  const target = remote === null ? null : parseRemote(remote);
  if (target === null) {
    console.error("nothing stored — this checkout's origin remote could not be read.");
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  const probe = spawnSync("gh", ["api", `repos/${target}`, "--jq", ".full_name"], {
    encoding: "utf8",
    env: { ...process.env, GH_TOKEN: token },
  });
  if (probe.error || probe.status !== 0) {
    console.error(`nothing stored — the token did not work against ${target}.`);
    console.error(probe.stderr?.trim().split("\n").slice(0, 2).join("\n") ?? "");
    process.exitCode = EXIT_REFUSED;
    return;
  }

  // The value rides argv rather than a shell line, so it never reaches shell
  // history — but it is briefly visible to `ps`. Named rather than hidden:
  // `security` takes a password only from argv or its own tty prompt, and the
  // prompt is the silent path this command exists to replace.
  const store = spawnSync(
    "security",
    [
      "add-generic-password",
      "-a",
      process.env["USER"] ?? "",
      "-s",
      declaration.keychainService,
      "-l",
      "deuce factory tracker PAT",
      "-T",
      "/usr/bin/security",
      "-U",
      "-w",
      token,
    ],
    { encoding: "utf8" },
  );
  if (store.error || store.status !== 0) {
    console.error(`the token works, but storing it failed: ${store.stderr?.trim() ?? ""}`);
    process.exitCode = EXIT_CANNOT_RUN;
    return;
  }

  console.log(`stored and verified — ${verdict.prefix}… reads ${probe.stdout.trim()}`);
  console.log(`  keychain service: ${declaration.keychainService}`);
  console.log("  unverified: write reach, and expiry — neither is reachable without writing");
  process.exitCode = EXIT_OK;
}

main();
