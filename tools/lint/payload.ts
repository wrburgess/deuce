// The payload-links check: every link in a shipped markdown file resolves to
// a path the payload manifest also ships (#121; Chapter 5, *What ships: the
// payload manifest*).
//
// Why this is not links-resolve. That check resolves against this
// repository's tracked files, so a shipped Skill naming `config/models.md` is
// green here and dead on every host — config/ is host class and never ships.
// The asymmetry was measured on bryce and nadal before this was written
// (#121): 24 of the 33 relative links in the shipped set point at a file no
// host receives. Green in the repository that authors the file and red in
// every repository that receives it is the defect, and it is decidable from
// this repository alone — the manifest already says exactly what a host gets.
//
// The resolution logic is links-resolve's, reused rather than rewritten: its
// `exists` predicate is an explicit parameter, and it already decides the
// escaping case, the fragment case, and the external-link count, each already
// tested. What this module supplies is the set that predicate answers from.
//
// ---------------------------------------------------------------------------
// Declared blind spot (Chapter 3, *Every check declares its blind spot*)
//
// It decides that a shipped link's target is shipped — for a host taking the
// whole payload, and for a host taking any one system. It cannot decide that
// a receiving repository has written a declaration the prose still names by
// name, nor that the absence clause beside that name is followed — both are
// prose, and prose has no failing test (Chapter 2, *Verifying prose*). Links
// in raw HTML are not read, external targets are counted and never probed,
// and a reference inside a shipped non-markdown file is not a markdown link
// and is not reached. Combinations of systems are not walked: every subset is
// a superset of some single system, so a link dead for a combination is dead
// for one of its members and is already reached — but a link dead only for
// the empty selection is not a state the manifest can express.

import { shipSet, type Manifest } from "../sync/manifest.ts";
import type { MarkdownFile } from "./markdown.ts";
import { checkLinks } from "./links.ts";

export interface PayloadLinksResult {
  violations: string[];
  // Cross-system dead links, kept apart from the aggregate ones so the
  // message can name which adoption breaks — and blocking, exactly as those
  // are. A host may adopt one system without the rest (Chapter 0), so a
  // lifecycle file linking a review path is dead for a lifecycle-only
  // adopter. An earlier draft reported these without failing; the contractor
  // review on PR #133 raised it as a must-fix under *does this check measure
  // the invariant it claims, or a proxy for it?* — a check that finds a real
  // dead link and exits green is measuring the aggregate payload as a proxy
  // for the host-facing invariant, and it was right.
  crossSystem: string[];
  // The fail-open state: the manifest has declared contract markdown since
  // #81, so a shipped-markdown set of zero means the manifest reader or the
  // document inventory broke, never that everything resolves (ADR 0014).
  guard: string | null;
  shippedPaths: number;
  markdownChecked: number;
  internalChecked: number;
  externalSkipped: number;
  systems: string[];
}

export const BLIND_SPOT = [
  "blind spot: whether a receiving repository has written a declaration the shipped prose names, and whether the absence clause beside it is followed, are prose and are not reached",
  "blind spot: links in raw HTML are not read, external targets are counted and never probed, and a reference inside a shipped non-markdown file is not a markdown link",
  "blind spot: the whole payload and each single system are walked; combinations are not, because every combination is a superset of a single system already walked",
];

interface View {
  paths: Set<string>;
  markdown: MarkdownFile[];
}

// A trailing slash is stripped so a directory entry and a link to it compare
// as the same string: links.ts normalizes `../config/` to `config`, and a set
// holding `config/` would not match it. No shipped entry is a directory today
// — the class that names directories is host, which never ships — so this is
// a trap closed rather than a bug fixed.
const normalize = (path: string): string => path.replace(/\/+$/, "");

function view(manifest: Manifest, systems: string[], files: MarkdownFile[]): View {
  const paths = new Set(shipSet(manifest, systems).map((e) => normalize(e.path)));
  return { paths, markdown: files.filter((f) => paths.has(f.path)) };
}

export function checkPayloadLinks(
  manifest: Manifest,
  files: MarkdownFile[],
): PayloadLinksResult {
  // An empty selection is every non-host entry: what a host taking the whole
  // standard receives, which is the view the violations are decided from.
  const whole = view(manifest, [], files);
  const empty = {
    violations: [],
    crossSystem: [],
    shippedPaths: whole.paths.size,
    markdownChecked: whole.markdown.length,
    internalChecked: 0,
    externalSkipped: 0,
    systems: [],
  };

  if (whole.markdown.length === 0) {
    return {
      ...empty,
      guard: `no shipped markdown among ${files.length} tracked documents — the manifest has declared contract markdown since #81, so an empty shipped set must never report green (ADR 0014)`,
    };
  }

  // A declared markdown path with no tracked file would narrow the walk in
  // silence — the check would report green over a file it never opened, which
  // is the fail-silent class this repository names by name. The sync already
  // refuses the same disagreement (tools/sync/payload.ts); this refuses it
  // where the disagreement is first visible.
  const tracked = new Set(files.map((f) => f.path));
  const undeclared = [...whole.paths]
    .filter((p) => p.endsWith(".md") && !tracked.has(p))
    .sort();
  if (undeclared.length > 0) {
    return {
      ...empty,
      guard: `the manifest ships ${undeclared.join(", ")}, which the tracked document set does not carry — the manifest and the tree disagree, and a link walk that skipped them would report green over files it never opened`,
    };
  }

  const result = checkLinks(whole.markdown, (path) => whole.paths.has(path));
  if (result.guard !== null) return { ...empty, guard: result.guard };

  // Per-system walks. A violation the whole-payload walk already raised is
  // that walk's to report; what is new here is a link that resolves for a
  // host taking everything and dies for a host taking one system. Both fail.
  const seen = new Set(result.violations);
  const systems = [...new Set(manifest.entries.map((e) => e.system))]
    .filter((s) => s !== "all")
    .sort();
  const crossSystem: string[] = [];
  for (const system of systems) {
    const selection = view(manifest, [system], files);
    if (selection.markdown.length === 0) continue;
    const perSystem = checkLinks(selection.markdown, (path) => selection.paths.has(path));
    // A guard here means this subset carries no links at all, which cannot
    // hide a cross-system dead link — there is none to hide. It is not the
    // fail-open state the whole-payload guard above covers, and it is skipped
    // by name rather than by omission.
    if (perSystem.guard !== null) continue;
    for (const violation of perSystem.violations) {
      if (!seen.has(violation)) {
        crossSystem.push(`a host adopting system '${system}' alone: ${violation}`);
      }
    }
  }

  return {
    violations: result.violations,
    crossSystem,
    guard: null,
    shippedPaths: whole.paths.size,
    markdownChecked: whole.markdown.length,
    internalChecked: result.internalChecked,
    externalSkipped: result.externalSkipped,
    systems,
  };
}
