import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { expandHome, parseFactoryDeclaration, parseWeekdays } from "./declaration.ts";

const HOME = "/Users/test";

const TRIGGER = [
  "trigger:",
  "  - mechanism: launchd",
  "    label: com.example.factory",
  "    weekdays: 1-5",
  "    hour: 7",
  "    minute: 47",
];

const SCALARS = [
  "date: 2026-08-13",
  "source: the Direction gate on #108",
  "checkout: /repo",
  "kill-switch: ~/.deuce-factory-off",
  "lock: ~/.deuce-factory-lock",
  "log: ~/Library/Logs/deuce-factory.log",
  "keychain-service: deuce-factory-tracker",
  "deadline-seconds: 7200",
  "record-home: 8",
];

const declaration = (lines: string[]) =>
  ["---", ...lines, "---", "", "# A declaration", ""].join("\n");

const full = (overrides: string[] = [], drop: string[] = []) =>
  declaration([...SCALARS.filter((l) => !drop.some((d) => l.startsWith(`${d}:`))), ...overrides, ...TRIGGER]);

test("parses the live declaration", () => {
  const md = readFileSync(new URL("../../config/factory.md", import.meta.url), "utf8");
  const d = parseFactoryDeclaration(md, HOME);
  assert.equal(d.trigger.mechanism, "launchd");
  assert.equal(d.trigger.label, "com.wrburgess.deuce.factory");
  assert.deepEqual(d.trigger.weekdays, [1, 2, 3, 4, 5]);
  assert.equal(d.trigger.hour, 7);
  assert.equal(d.trigger.minute, 47);
  assert.equal(d.killSwitch, `${HOME}/.deuce-factory-off`);
  assert.equal(d.lock, `${HOME}/.deuce-factory-lock`);
  assert.equal(d.recordHome, "8");
  assert.ok(d.deadlineSeconds > 0);
});

test("expands a leading ~ and leaves every other path alone", () => {
  assert.equal(expandHome("~/x", HOME), `${HOME}/x`);
  assert.equal(expandHome("~", HOME), HOME);
  assert.equal(expandHome("/abs/~x", HOME), "/abs/~x");
  assert.equal(expandHome("~notme/x", HOME), "~notme/x");
});

test("an unrecognized top-level key is refused", () => {
  assert.throws(() => parseFactoryDeclaration(full(["cadence: hourly"]), HOME), /unrecognized/);
});

test("a declaration with no trigger key is refused — nothing starts a pass", () => {
  const md = declaration(SCALARS);
  assert.throws(() => parseFactoryDeclaration(md, HOME), /no 'trigger' key/);
});

test("zero triggers and one absent trigger are different refusals", () => {
  const md = declaration([...SCALARS, "trigger:"]);
  assert.throws(() => parseFactoryDeclaration(md, HOME), /zero triggers/);
});

test("a second trigger fails loudly rather than firing the first", () => {
  const md = declaration([
    ...SCALARS,
    ...TRIGGER,
    "  - mechanism: launchd",
    "    label: com.example.other",
    "    weekdays: 6",
    "    hour: 9",
    "    minute: 3",
  ]);
  assert.throws(() => parseFactoryDeclaration(md, HOME), /2 triggers/);
});

test("each missing trigger field is refused by name", () => {
  for (const missing of ["mechanism", "label", "weekdays", "hour", "minute"] as const) {
    const fields: Record<string, string> = {
      mechanism: "launchd",
      label: "com.example.factory",
      weekdays: "1-5",
      hour: "7",
      minute: "47",
    };
    delete fields[missing];
    const lines = ["trigger:"];
    let first = true;
    for (const [key, value] of Object.entries(fields)) {
      lines.push(`${first ? "  - " : "    "}${key}: ${value}`);
      first = false;
    }
    assert.throws(
      () => parseFactoryDeclaration(declaration([...SCALARS, ...lines]), HOME),
      new RegExp(`'${missing}'`),
      `a trigger missing '${missing}' must be refused`,
    );
  }
});

test("a trigger carrying an unrecognized field is refused", () => {
  const md = declaration([...SCALARS, ...TRIGGER, "    jitter: 5"]);
  assert.throws(() => parseFactoryDeclaration(md, HOME), /unrecognized field/);
});

test("a mechanism nothing can render is refused, never defaulted", () => {
  const md = declaration([
    ...SCALARS,
    "trigger:",
    "  - mechanism: systemd",
    "    label: com.example.factory",
    "    weekdays: 1-5",
    "    hour: 7",
    "    minute: 47",
  ]);
  assert.throws(() => parseFactoryDeclaration(md, HOME), /'systemd'/);
});

test("each missing scalar is refused by name", () => {
  for (const key of [
    "checkout",
    "kill-switch",
    "lock",
    "log",
    "keychain-service",
    "deadline-seconds",
    "record-home",
  ]) {
    assert.throws(
      () => parseFactoryDeclaration(full([], [key]), HOME),
      new RegExp(`'${key}'`),
      `a declaration missing '${key}' must be refused`,
    );
  }
});

test("a relative checkout is refused — a pass must know where it runs", () => {
  assert.throws(
    () => parseFactoryDeclaration(full(["checkout: repo"], ["checkout"]), HOME),
    /absolute path/,
  );
});

test("a record home that is not an issue number is refused", () => {
  assert.throws(
    () => parseFactoryDeclaration(full(["record-home: PR 8"], ["record-home"]), HOME),
    /issue number/,
  );
});

test("a deadline that is not a whole number is refused", () => {
  assert.throws(
    () => parseFactoryDeclaration(full(["deadline-seconds: 2h"], ["deadline-seconds"]), HOME),
    /whole number/,
  );
});

test("weekday ranges, lists, and single days all expand", () => {
  assert.deepEqual(parseWeekdays("1-5"), [1, 2, 3, 4, 5]);
  assert.deepEqual(parseWeekdays("1,3,7"), [1, 3, 7]);
  assert.deepEqual(parseWeekdays("2"), [2]);
  assert.deepEqual(parseWeekdays("1-2,5"), [1, 2, 5]);
});

test("0 for Sunday is refused by name — one spelling per day", () => {
  assert.throws(() => parseWeekdays("0"), /7/);
});

test("weekdays outside 1–7 are refused at both ends", () => {
  assert.throws(() => parseWeekdays("8"), /outside/);
  assert.throws(() => parseWeekdays("1-8"), /outside/);
});

test("a backwards range, an empty entry, and a repeated day are each refused", () => {
  assert.throws(() => parseWeekdays("5-1"), /backwards/);
  assert.throws(() => parseWeekdays("1,,3"), /empty/);
  assert.throws(() => parseWeekdays("1,1"), /twice/);
  assert.throws(() => parseWeekdays("1-3,2"), /twice/);
});

test("hour and minute hold at their boundaries and refuse past them", () => {
  const at = (hour: string, minute: string) =>
    parseFactoryDeclaration(
      declaration([
        ...SCALARS,
        "trigger:",
        "  - mechanism: launchd",
        "    label: com.example.factory",
        "    weekdays: 1",
        `    hour: ${hour}`,
        `    minute: ${minute}`,
      ]),
      HOME,
    );
  assert.equal(at("0", "0").trigger.hour, 0);
  assert.equal(at("23", "59").trigger.minute, 59);
  assert.throws(() => at("24", "0"), /'hour'/);
  assert.throws(() => at("7", "60"), /'minute'/);
});
