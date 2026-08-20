// Reads config/factory.md's frontmatter — what starts a pass, where it runs,
// and the two paths that stop it (Chapter 6, *The factory pass* and *The kill
// switch*). The declaration stays the single source: the launchd agent is
// rendered from this entry rather than written beside it, so the schedule a
// reader sees and the schedule that fires cannot drift.
//
// This is a parser, not a scan (Chapter 3, *Parse, never pattern-match*): the
// frontmatter grammar is the shared one, and every key it yields is either
// consumed below or refused by name. A declaration whose shape changed under
// this reader breaks here loudly rather than starting a pass on half a
// declaration.

import { parseFrontmatter } from "../gate/declaration.ts";

export interface Trigger {
  mechanism: string;
  label: string;
  weekdays: number[];
  hour: number;
  minute: number;
}

export interface FactoryDeclaration {
  date: string;
  source: string;
  checkout: string;
  killSwitch: string;
  lock: string;
  logPath: string;
  keychainService: string;
  deadlineSeconds: number;
  recordHome: string;
  trigger: Trigger;
}

const TOP_LEVEL = new Set([
  "date",
  "source",
  "checkout",
  "kill-switch",
  "lock",
  "log",
  "keychain-service",
  "deadline-seconds",
  "record-home",
  "trigger",
]);
const TRIGGER_FIELDS = new Set(["mechanism", "label", "weekdays", "hour", "minute"]);

// The only mechanism anything here can render. An unrecognized value is
// refused rather than defaulted: rendering a launchd agent from a declaration
// that named something else is the fail-open this whole file is shaped against.
const MECHANISMS = new Set(["launchd"]);

// A leading '~' is the declaration's own shorthand for the HC's home. It is
// expanded at read time and never stored expanded, so the declaration stays
// readable on a machine whose home is somewhere else.
export function expandHome(value: string, home: string): string {
  if (value === "~") return home;
  if (value.startsWith("~/")) return `${home}/${value.slice(2)}`;
  return value;
}

function required(scalars: Map<string, string>, key: string): string {
  const value = scalars.get(key);
  if (value === undefined || value === "") {
    throw new Error(`the factory declaration carries no '${key}'`);
  }
  return value;
}

function absolute(value: string, key: string): string {
  if (!value.startsWith("/")) {
    throw new Error(`the factory declaration's '${key}' is not an absolute path: ${value}`);
  }
  return value;
}

function wholeNumber(raw: string, what: string): number {
  if (!/^\d+$/.test(raw)) {
    throw new Error(`${what} is not a whole number: ${raw}`);
  }
  return Number(raw);
}

// The watchdog's own bound, and the only reason it is not just `wholeNumber`:
// node reads `timeout: 0` as no timeout at all, so a zero here parses cleanly
// and silently removes the deadline it declares. Measured rather than assumed —
// `spawnSync('sleep', ['2'], {timeout: 0})` runs the full two seconds and
// returns signal null. A pass that then hangs holds the lock forever, and every
// later pass reports busy with nobody able to tell why (#108).
function atLeastOne(raw: string, what: string): number {
  const value = wholeNumber(raw, what);
  if (value < 1) {
    throw new Error(`${what} must be at least 1 second: ${raw}`);
  }
  return value;
}

function bounded(raw: string, what: string, low: number, high: number): number {
  const value = wholeNumber(raw, what);
  if (value < low || value > high) {
    throw new Error(`${what} is outside ${low}–${high}: ${raw}`);
  }
  return value;
}

// launchd numbers weekdays 1 (Monday) through 7 (Sunday) and also accepts 0
// for Sunday. Both spellings of Sunday in one vocabulary is a trap for a reader
// counting from the other end, so 0 is refused by name rather than accepted as
// a synonym.
export function parseWeekdays(raw: string): number[] {
  const days: number[] = [];
  for (const part of raw.split(",")) {
    const piece = part.trim();
    if (piece === "") {
      throw new Error(`'weekdays' carries an empty entry: ${raw}`);
    }
    const range = /^(\d+)-(\d+)$/.exec(piece);
    if (range) {
      const from = bounded(range[1]!, "a 'weekdays' bound", 1, 7);
      const to = bounded(range[2]!, "a 'weekdays' bound", 1, 7);
      if (to < from) {
        throw new Error(`'weekdays' declares a backwards range: ${piece}`);
      }
      for (let day = from; day <= to; day++) days.push(day);
      continue;
    }
    if (piece === "0") {
      throw new Error("'weekdays' uses 0 for Sunday; write 7 — one spelling per day");
    }
    days.push(bounded(piece, "a 'weekdays' entry", 1, 7));
  }
  // A day declared twice would render two identical calendar intervals: the
  // agent still fires once, so the duplicate is silent. Refused instead.
  const seen = new Set<number>();
  for (const day of days) {
    if (seen.has(day)) {
      throw new Error(`'weekdays' declares day ${day} twice: ${raw}`);
    }
    seen.add(day);
  }
  if (days.length === 0) {
    throw new Error("'weekdays' declares no days — an agent that never fires is not a trigger");
  }
  return days;
}

export function parseFactoryDeclaration(markdown: string, home: string): FactoryDeclaration {
  const { scalars, lists } = parseFrontmatter(markdown);

  for (const key of [...scalars.keys(), ...lists.keys()]) {
    if (!TOP_LEVEL.has(key)) {
      throw new Error(
        `the factory declaration carries an unrecognized key '${key}' — the schema defines ` +
          `${[...TOP_LEVEL].map((k) => `'${k}'`).join(", ")} and nothing else`,
      );
    }
  }

  const raw = lists.get("trigger");
  // Absent and empty are different states with different fixes (ADR 0014):
  // no key is an unarmed declaration, an empty list is an armed one that
  // declares nothing to arm.
  if (raw === undefined) {
    throw new Error("the factory declaration carries no 'trigger' key — nothing starts a pass");
  }
  if (raw.length === 0) {
    throw new Error("the factory declaration declares zero triggers — nothing starts a pass");
  }
  if (raw.length > 1) {
    // Never first-entry-wins: a second declared trigger would never fire and
    // nothing would say so.
    throw new Error(
      `the factory declaration declares ${raw.length} triggers and one pass runs at a time — ` +
        "a second trigger has nowhere to fire",
    );
  }
  const entry = raw[0]!;
  for (const key of entry.keys()) {
    if (!TRIGGER_FIELDS.has(key)) {
      throw new Error(`the trigger carries an unrecognized field '${key}'`);
    }
  }
  const field = (key: string): string => {
    const value = entry.get(key);
    if (!value) {
      throw new Error(`the trigger declares no '${key}'`);
    }
    return value;
  };

  const mechanism = field("mechanism");
  if (!MECHANISMS.has(mechanism)) {
    throw new Error(
      `the trigger declares mechanism '${mechanism}', which nothing here can render — ` +
        `${[...MECHANISMS].map((m) => `'${m}'`).join(", ")} is the vocabulary`,
    );
  }

  const recordHome = required(scalars, "record-home");
  if (!/^\d+$/.test(recordHome)) {
    throw new Error(`the factory declaration's 'record-home' is not an issue number: ${recordHome}`);
  }

  return {
    date: required(scalars, "date"),
    source: required(scalars, "source"),
    checkout: absolute(required(scalars, "checkout"), "checkout"),
    killSwitch: absolute(expandHome(required(scalars, "kill-switch"), home), "kill-switch"),
    lock: absolute(expandHome(required(scalars, "lock"), home), "lock"),
    logPath: absolute(expandHome(required(scalars, "log"), home), "log"),
    keychainService: required(scalars, "keychain-service"),
    deadlineSeconds: atLeastOne(
      required(scalars, "deadline-seconds"),
      "the factory declaration's 'deadline-seconds'",
    ),
    recordHome,
    trigger: {
      mechanism,
      label: field("label"),
      weekdays: parseWeekdays(field("weekdays")),
      hour: bounded(field("hour"), "the trigger's 'hour'", 0, 23),
      minute: bounded(field("minute"), "the trigger's 'minute'", 0, 59),
    },
  };
}
