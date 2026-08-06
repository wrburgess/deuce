import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseReceipt, formatReceipt, writeReceipt } from "./receipt.ts";

const SHA = "a".repeat(64);

test("format then parse round-trips the fields", () => {
  const receipt = {
    commit: "cf3468f0000000000000000000000000deadbeef",
    date: "2026-08-06",
    checksums: [
      { path: "AGENTS.md", sha256: SHA },
      { path: "skills/assess/SKILL.md", sha256: "b".repeat(64) },
    ],
  };
  const parsed = parseReceipt(formatReceipt(receipt));
  assert.deepEqual(parsed, receipt);
});

test("writing the receipt creates its directory — a host with no config/ is the bryce case", () => {
  const host = mkdtempSync(join(tmpdir(), "deuce-receipt-"));
  const receipt = { commit: "abc", date: "2026-08-06", checksums: [{ path: "a", sha256: "c".repeat(64) }] };
  writeReceipt(host, "config/vendoring-receipt.md", receipt);
  const written = readFileSync(join(host, "config/vendoring-receipt.md"), "utf8");
  assert.deepEqual(parseReceipt(written), receipt);
});

test("a receipt without provenance is refused", () => {
  assert.throws(
    () => parseReceipt("---\ndate: 2026-08-06\nchecksums:\n---\n"),
    /no 'commit'\/'date'/,
  );
});

test("a malformed checksum is refused, naming the path", () => {
  const md = `---\ncommit: abc\ndate: x\nchecksums:\n  - path: AGENTS.md\n    sha256: nothex\n---\n`;
  assert.throws(() => parseReceipt(md), /'AGENTS.md' is not a sha256/);
});

test("an unrecognized key is refused by name", () => {
  assert.throws(
    () => parseReceipt(`---\ncommit: abc\ndate: x\nsigned: yes\nchecksums:\n---\n`),
    /unrecognized key 'signed'/,
  );
});

test("a duplicate path is refused", () => {
  const md = `---\ncommit: abc\ndate: x\nchecksums:\n  - path: a\n    sha256: ${SHA}\n  - path: a\n    sha256: ${SHA}\n---\n`;
  assert.throws(() => parseReceipt(md), /'a' twice/);
});
