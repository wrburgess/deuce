// Which comments on a pull request thread are the standing findings records —
// the discovery rule, in one place (Chapter 2, *Validation on return*).
//
// It was written inline in the tracker lint's records check (#56) and is
// extracted here by #57, which needs the same rule to count what those records
// carry. Two copies of a discovery rule is the shape this repository already
// names as drift waiting to happen: the copies agree until one is taught
// something the other is not, and nothing says which one is stale.
//
// The rule, unchanged from the check that authored it:
//   - a record is a comment whose first line is the header summon.ts posts,
//     `## Contractor review — <reviewer> (<wave>)`;
//   - an outcome-headed post — nonconforming, reviewer unreachable, reviewer
//     unresponsive — is the machinery's own honest record of a failed exchange,
//     already named as what it is, and is skipped by name rather than counted;
//   - a record superseded by a later comment carrying `**Supersedes:** <url>`
//     is skipped, because a defective record's conforming fix is a superseding
//     post, never an edit.
//
// ---------------------------------------------------------------------------
// Declared limit
//
// A record so malformed it lacks the header is not discovered — it stays with
// review. Discovery is by the header alone; nothing here reads a record's
// contents, and nothing here decides whether what it finds is conforming.

export interface ThreadComment {
  body: string;
  url: string;
}

export interface StandingRecords<T extends ThreadComment> {
  standing: T[];
  outcomeSkipped: number;
  supersededSkipped: number;
}

const RECORD_HEADER = /^## Contractor review — /;
const OUTCOME_SUFFIX = /:\s*(nonconforming|reviewer unreachable|reviewer unresponsive)\s*$/;
const SUPERSEDES = /\*\*Supersedes:\*\*\s*(\S+)/g;

export function selectStandingRecords<T extends ThreadComment>(
  comments: T[],
): StandingRecords<T> {
  const superseded = new Set<string>();
  for (const comment of comments) {
    for (const m of comment.body.matchAll(SUPERSEDES)) {
      superseded.add(m[1]!.replace(/[<>]/g, ""));
    }
  }

  const standing: T[] = [];
  let outcomeSkipped = 0;
  let supersededSkipped = 0;

  for (const comment of comments) {
    const firstLine = comment.body.trimStart().split("\n", 1)[0]!.trim();
    if (!RECORD_HEADER.test(firstLine)) continue;
    if (OUTCOME_SUFFIX.test(firstLine)) {
      outcomeSkipped++;
      continue;
    }
    if (superseded.has(comment.url)) {
      supersededSkipped++;
      continue;
    }
    standing.push(comment);
  }

  return { standing, outcomeSkipped, supersededSkipped };
}
