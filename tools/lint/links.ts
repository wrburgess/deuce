// The links-resolve check: every internal link's file target exists, and
// every fragment matches a heading anchor of its target (epic brief on #5;
// Chapter 3, *The configuration lint* — decidable as written).
//
// External links (http, https, mailto) are counted and named in the output,
// never probed: the gate runs offline and a liveness probe would make its
// green depend on the network. Links carried in raw HTML are not read — the
// parser yields no link node for them, and none exist in tracked markdown
// today. Both limits are stated in the check's output.

import { posix } from "node:path";
import type { MarkdownFile } from "./markdown.ts";
import { parse, linkDestinations, headingSlugs } from "./markdown.ts";

export interface LinksResult {
  violations: string[];
  // The fail-open state: zero links parsed over a set of readable files is
  // indistinguishable from the parser silently breaking, so it is never a
  // green (ADR 0014; the guard sits on links — the unit measured — never on
  // files, the unit iterated: PR #51, finding 2).
  guard: string | null;
  filesRead: number;
  internalChecked: number;
  externalSkipped: number;
}

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;

export function checkLinks(
  files: MarkdownFile[],
  exists: (path: string) => boolean,
): LinksResult {
  const violations: string[] = [];
  let internalChecked = 0;
  let externalSkipped = 0;

  const byPath = new Map(files.map((f) => [f.path, f]));
  const slugCache = new Map<string, Set<string>>();
  const slugsOf = (path: string): Set<string> | undefined => {
    const file = byPath.get(path);
    if (file === undefined) return undefined;
    let slugs = slugCache.get(path);
    if (slugs === undefined) {
      slugs = headingSlugs(parse(file.content));
      slugCache.set(path, slugs);
    }
    return slugs;
  };

  for (const file of files) {
    for (const destination of linkDestinations(parse(file.content))) {
      if (EXTERNAL.test(destination)) {
        externalSkipped++;
        continue;
      }
      internalChecked++;
      const hash = destination.indexOf("#");
      const pathPart = hash === -1 ? destination : destination.slice(0, hash);
      const fragment = hash === -1 ? null : destination.slice(hash + 1);

      let target = file.path;
      if (pathPart !== "") {
        target = posix
          .normalize(posix.join(posix.dirname(file.path), pathPart))
          .replace(/\/+$/, "");
        if (target.startsWith("..")) {
          violations.push(
            `${file.path}: ${destination} resolves outside the repository`,
          );
          continue;
        }
        if (!exists(target)) {
          violations.push(`${file.path}: ${destination} — no such file: ${target}`);
          continue;
        }
      }

      if (fragment !== null) {
        const slugs = slugsOf(target);
        if (slugs === undefined) {
          violations.push(
            `${file.path}: ${destination} — a fragment on a target outside the tracked markdown set cannot be resolved`,
          );
          continue;
        }
        if (!slugs.has(fragment)) {
          violations.push(
            `${file.path}: ${destination} — no heading in ${target} slugs to #${fragment}`,
          );
        }
      }
    }
  }

  const guard =
    internalChecked + externalSkipped === 0
      ? `zero links parsed across ${files.length} files — a link check that found no links must never report green (PR #51, finding 2)`
      : null;

  return {
    violations,
    guard,
    filesRead: files.length,
    internalChecked,
    externalSkipped,
  };
}
