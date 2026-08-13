// What one pull request looks like to the measures family, and how a literal
// one is read from a file (ADR 0028; Chapter 3, *Capturing the health
// measures*).
//
// The shape is deliberately narrow — one pull request, its comments, and the
// issues it closes — because that is the whole of what the two computed
// measures are computed from. The `--snapshot <file>` seam exists so every
// decision below this line is measurable without the network, the same seam
// the tracker lint uses for the same reason (ADR 0014).

export interface MeasuresComment {
  body: string;
  url: string;
  /** ISO 8601, as the platform returns it. */
  createdAt: string;
}

export interface MeasuresIssue {
  number: number;
  createdAt: string;
}

export interface PullRequestSnapshot {
  number: number;
  title: string;
  url: string;
  comments: MeasuresComment[];
  /** The issues this pull request closes, from the platform's own link —
   *  never inferred from the title or the body. Empty is a real state: the
   *  chapter-ratification pull requests close no issue at all. */
  closes: MeasuresIssue[];
}

function fail(what: string): never {
  throw new Error(`the snapshot is not a pull request snapshot — ${what}`);
}

function str(value: unknown, where: string): string {
  if (typeof value !== "string") fail(`${where} is not a string`);
  return value;
}

function num(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(`${where} is not a number`);
  return value;
}

// Parsing refuses rather than coerces: a snapshot missing a field is a
// snapshot that cannot answer the question, and a zero-comment pull request
// computed from a broken read would report a confident, wrong zero.
export function parseSnapshot(json: string): PullRequestSnapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (err) {
    fail(`it is not JSON: ${(err as Error).message}`);
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    fail("it is not an object");
  }
  const o = raw as Record<string, unknown>;

  if (!Array.isArray(o["comments"])) fail("'comments' is not a list");
  if (!Array.isArray(o["closes"])) fail("'closes' is not a list");

  return {
    number: num(o["number"], "'number'"),
    title: str(o["title"], "'title'"),
    url: str(o["url"], "'url'"),
    comments: o["comments"].map((c, i) => {
      const comment = c as Record<string, unknown>;
      return {
        body: str(comment?.["body"], `comment ${i + 1}'s 'body'`),
        url: str(comment?.["url"], `comment ${i + 1}'s 'url'`),
        createdAt: str(comment?.["createdAt"], `comment ${i + 1}'s 'createdAt'`),
      };
    }),
    closes: o["closes"].map((c, i) => {
      const issue = c as Record<string, unknown>;
      return {
        number: num(issue?.["number"], `closed issue ${i + 1}'s 'number'`),
        createdAt: str(issue?.["createdAt"], `closed issue ${i + 1}'s 'createdAt'`),
      };
    }),
  };
}
