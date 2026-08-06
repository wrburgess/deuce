// Reads config/payload.md — the payload manifest (Chapter 5, *What ships: the
// payload manifest*; declared under #81). Same grammar as every declaration
// (tools/gate/declaration.ts), own closed vocabulary: a key or class this
// schema does not define is refused by name, never skipped.

import { parseFrontmatter } from "../gate/declaration.ts";

export type PayloadClass = "contract" | "seed" | "host";

export interface PayloadEntry {
  path: string;
  class: PayloadClass;
  system: string;
}

export interface Manifest {
  date: string;
  source: string;
  entries: PayloadEntry[];
}

const TOP_LEVEL = new Set(["date", "source", "payload"]);
const ENTRY_FIELDS = new Set(["path", "class", "system"]);
const CLASSES = new Set<string>(["contract", "seed", "host"]);

export function parseManifest(markdown: string): Manifest {
  const { scalars, lists } = parseFrontmatter(markdown);

  for (const key of [...scalars.keys(), ...lists.keys()]) {
    if (!TOP_LEVEL.has(key)) {
      throw new Error(
        `manifest carries an unrecognized key '${key}' — the schema defines ` +
          `${[...TOP_LEVEL].map((k) => `'${k}'`).join(", ")} and nothing else`,
      );
    }
  }

  const date = scalars.get("date");
  const source = scalars.get("source");
  if (!date || !source) {
    throw new Error("manifest carries no 'date'/'source' — every declaration is dated and sourced");
  }

  const raw = lists.get("payload");
  if (raw === undefined) {
    throw new Error("manifest carries no 'payload' key — nothing is declared to ship");
  }
  if (raw.length === 0) {
    throw new Error("manifest declares zero paths — an empty payload is a different decision");
  }

  const seen = new Set<string>();
  const entries: PayloadEntry[] = raw.map((entry, i) => {
    for (const key of entry.keys()) {
      if (!ENTRY_FIELDS.has(key)) {
        throw new Error(`payload item ${i + 1} carries an unrecognized field '${key}'`);
      }
    }
    const path = entry.get("path");
    const cls = entry.get("class");
    const system = entry.get("system");
    if (!path || !cls || !system) {
      throw new Error(`payload item ${i + 1} is missing a field — each carries path, class, system`);
    }
    if (!CLASSES.has(cls)) {
      throw new Error(
        `payload item '${path}' carries an unrecognized class '${cls}' — ` +
          `the classes are contract, seed, host and nothing else (ADR 0021)`,
      );
    }
    if (seen.has(path)) {
      throw new Error(`payload declares '${path}' twice — one class per path (ADR 0021)`);
    }
    seen.add(path);
    return { path, class: cls as PayloadClass, system };
  });

  return { date, source, entries };
}

// The ship set for one selection. Host entries never ship (they are the
// written boundary); `all` ships with every selection — that is its meaning,
// defined in the manifest's own body.
export function shipSet(manifest: Manifest, systems: string[]): PayloadEntry[] {
  const wanted = new Set(systems);
  return manifest.entries.filter((e) => {
    if (e.class === "host") return false;
    if (wanted.size === 0) return true;
    return e.system === "all" || wanted.has(e.system);
  });
}
