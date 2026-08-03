// Reads config/checks.md — the quality gate's declaration (Chapter 3, *The
// declaration schema*). The gate's contents live here and nowhere else, so the
// declared set and the executed set cannot drift (ADR 0015).
//
// This is a parser, not a scan, and the difference is Chapter 3's *Parse,
// never pattern-match*. Every line inside the frontmatter block is consumed by
// exactly one production below, and a line matching none of them stops the
// gate by name. The counter-example the chapter cites — reading a value out of
// prose with matchAll and ignoring everything else — cannot tell "absent" from
// "written in a shape I do not recognize". This can.
//
// The subset is deliberately tiny: scalars at the margin, and one level of
// list whose items carry scalar fields. Node ships no YAML parser, and taking
// a dependency to read a file whose shape we define would cross Chapter 0's
// trust boundary for nothing.

export interface CheckSpec {
  name: string;
  command: string;
  requires?: string;
}

export interface Declaration {
  date: string;
  source: string;
  checks: CheckSpec[];
}

const FENCE = "---";
const KEY = "[a-z][a-z0-9_-]*";
const SCALAR = new RegExp(`^(${KEY}): +(\\S.*?)\\s*$`);
const LIST_KEY = new RegExp(`^(${KEY}):\\s*$`);
const ITEM = new RegExp(`^ {2}- (${KEY}): +(\\S.*?)\\s*$`);
const FIELD = new RegExp(`^ {4}(${KEY}): +(\\S.*?)\\s*$`);

interface Parsed {
  scalars: Map<string, string>;
  lists: Map<string, Map<string, string>[]>;
}

function parseFrontmatter(markdown: string): Parsed {
  const lines = markdown.split("\n");
  if (lines[0]?.trim() !== FENCE) {
    throw new Error("declaration carries no frontmatter block — it must open with '---'");
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]!.trim() === FENCE) {
      end = i;
      break;
    }
  }
  if (end === -1) {
    throw new Error("frontmatter block is never closed with '---'");
  }

  const scalars = new Map<string, string>();
  const lists = new Map<string, Map<string, string>[]>();
  let openList: Map<string, string>[] | null = null;
  let openEntry: Map<string, string> | null = null;

  for (let i = 1; i < end; i++) {
    const line = lines[i]!;
    if (line.trim() === "") continue;

    const item = ITEM.exec(line);
    if (item) {
      if (!openList) {
        throw new Error(
          `frontmatter line ${i + 1} is a list item under no list key: ${line.trim()}`,
        );
      }
      openEntry = new Map([[item[1]!, item[2]!]]);
      openList.push(openEntry);
      continue;
    }

    const field = FIELD.exec(line);
    if (field) {
      if (!openEntry) {
        throw new Error(
          `frontmatter line ${i + 1} is a field under no list item: ${line.trim()}`,
        );
      }
      if (openEntry.has(field[1]!)) {
        throw new Error(`frontmatter line ${i + 1} repeats the field '${field[1]}' in one item`);
      }
      openEntry.set(field[1]!, field[2]!);
      continue;
    }

    const scalar = SCALAR.exec(line);
    if (scalar) {
      openList = null;
      openEntry = null;
      if (scalars.has(scalar[1]!)) {
        throw new Error(`frontmatter repeats the key '${scalar[1]}'`);
      }
      scalars.set(scalar[1]!, scalar[2]!);
      continue;
    }

    const listKey = LIST_KEY.exec(line);
    if (listKey) {
      if (lists.has(listKey[1]!)) {
        throw new Error(`frontmatter repeats the key '${listKey[1]}'`);
      }
      openList = [];
      openEntry = null;
      lists.set(listKey[1]!, openList);
      continue;
    }

    // Nothing matched. Refusing here is what separates this from a scan: a
    // parser that skips what it cannot read returns something plausible and
    // wrong, which is the fail-open class the index counts most.
    throw new Error(
      `frontmatter line ${i + 1} is outside the declared subset and is refused: ${line.trim()}`,
    );
  }

  return { scalars, lists };
}

function required(scalars: Map<string, string>, key: string): string {
  const value = scalars.get(key);
  if (value === undefined || value === "") {
    throw new Error(`declaration carries no '${key}' — every declaration is dated and sourced`);
  }
  return value;
}

export function parseDeclaration(markdown: string): Declaration {
  const { scalars, lists } = parseFrontmatter(markdown);
  const date = required(scalars, "date");
  const source = required(scalars, "source");

  const raw = lists.get("checks");
  // Absent and empty are different states with different fixes, so they are
  // different errors. Collapsing them is how "declared nothing" becomes
  // indistinguishable from "declared an empty list" (ADR 0014).
  if (raw === undefined) {
    throw new Error("declaration carries no 'checks' key — the gate has no contents to run");
  }
  if (raw.length === 0) {
    throw new Error(
      "declaration declares zero checks — a gate that ran nothing must never report green",
    );
  }

  const checks: CheckSpec[] = raw.map((entry) => {
    const name = entry.get("name");
    if (!name) {
      throw new Error("a check declares no name");
    }
    const command = entry.get("command");
    if (!command) {
      throw new Error(`check '${name}' declares no command`);
    }
    for (const key of entry.keys()) {
      if (key !== "name" && key !== "command" && key !== "requires") {
        throw new Error(`check '${name}' carries an unrecognized field '${key}'`);
      }
    }
    const requires = entry.get("requires");
    return requires === undefined ? { name, command } : { name, command, requires };
  });

  return { date, source, checks };
}
