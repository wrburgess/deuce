// The impure edge of the measures family: one pull request, fetched once, and
// handed to the pure modules beside it. Shelled to `gh` token-wise, never
// through a shell — the pattern `tools/lint/tracker/fetch.ts` and
// `tools/review/dispatch.ts` each already carry, kept per family rather than
// shared, because families share pure decisions and never each other's edges.
//
// A failure here — gh missing, unauthenticated, network down, malformed
// response — is the command unable to run, never a state it reports: the
// caller maps the thrown error to exit 2, loud and named, so an unreachable
// tracker never renders as a measured zero (Chapter 3, *The tooling
// contract*).

import { spawnSync } from "node:child_process";
import type { MeasuresComment, MeasuresIssue, PullRequestSnapshot } from "./snapshot.ts";

function gh(args: string[]): string {
  const r = spawnSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error !== undefined) {
    const code = (r.error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new Error("the tracker cannot be reached — gh is not installed");
    }
    throw new Error(`the tracker cannot be reached — gh could not run: ${r.error.message}`);
  }
  if (r.status !== 0) {
    throw new Error(
      `the tracker cannot be reached — gh exited ${r.status}: ${(r.stderr ?? "").trim().slice(0, 500)}`,
    );
  }
  return r.stdout;
}

function ghJson(args: string[]): unknown {
  const out = gh(args);
  try {
    return JSON.parse(out);
  } catch (err) {
    throw new Error(`the tracker's response is not JSON: ${(err as Error).message}`);
  }
}

const PR_QUERY = `
query($owner: String!, $name: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number title url
      comments(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { body url createdAt }
      }
      closingIssuesReferences(first: 20) {
        pageInfo { hasNextPage }
        nodes { number createdAt }
      }
    }
  }
}`;

interface Page<T> {
  pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  nodes: T[];
}

export interface PullRequestNode {
  number: number;
  title: string;
  url: string;
  comments: Page<{ body: string; url: string; createdAt: string }>;
  closingIssuesReferences: Page<{ number: number; createdAt: string }>;
}

// Exported for its rejecting branch's test. The guard is the one
// `shapeIssue` carries for labels, for the same reason: a measure must never
// be computed over links the fetch cannot see. Twenty closing references is
// far past anything real, so overflow means the query or the pull request is
// not what this command thinks it is.
export function shapePullRequest(node: PullRequestNode): PullRequestSnapshot {
  if (node.closingIssuesReferences.pageInfo.hasNextPage) {
    throw new Error(
      `PR #${node.number} links more closing issues than one fetch page — refusing to compute throughput over links the fetch cannot see`,
    );
  }
  const comments: MeasuresComment[] = node.comments.nodes.map((c) => ({
    body: c.body,
    url: c.url,
    createdAt: c.createdAt,
  }));
  const closes: MeasuresIssue[] = node.closingIssuesReferences.nodes.map((i) => ({
    number: i.number,
    createdAt: i.createdAt,
  }));
  return { number: node.number, title: node.title, url: node.url, comments, closes };
}

// The walk's one decision, exported for its rejecting branches' tests. A page
// that claims another page and carries no cursor is an inconsistent response,
// not the end of the thread — and reading it as the end truncates the thread
// silently, which is the whole failure this module says it does not have. The
// contractor review on PR #125 raised it as must-fix: `null` was both "no
// cursor" and "stop".
export function nextCursor(
  pageInfo: { hasNextPage: boolean; endCursor?: string | null },
  what: string,
): string | null {
  if (!pageInfo.hasNextPage) return null;
  const cursor = pageInfo.endCursor;
  if (cursor === null || cursor === undefined || cursor === "") {
    throw new Error(
      `the tracker's response for ${what} claims another page and carries no cursor — refusing to compute over a thread this fetch cannot finish reading`,
    );
  }
  return cursor;
}

function graphql(fields: Record<string, string | number | null>): PullRequestNode {
  const args = ["api", "graphql", "-f", `query=${PR_QUERY}`];
  for (const [key, value] of Object.entries(fields)) {
    if (value === null) continue;
    args.push(typeof value === "number" ? "-F" : "-f", `${key}=${value}`);
  }
  const data = ghJson(args) as { data?: { repository?: { pullRequest?: PullRequestNode | null } } };
  const pullRequest = data?.data?.repository?.pullRequest;
  if (pullRequest === undefined || pullRequest === null) {
    throw new Error(
      `the tracker's response carries no pull request #${fields["number"]} — the number or the repo resolution is wrong`,
    );
  }
  return pullRequest;
}

export function fetchPullRequest(number: number): PullRequestSnapshot {
  const repo = ghJson(["repo", "view", "--json", "owner,name"]) as {
    owner?: { login?: string };
    name?: string;
  };
  const owner = repo?.owner?.login;
  const name = repo?.name;
  if (typeof owner !== "string" || typeof name !== "string") {
    throw new Error("gh repo view did not resolve the repository's owner and name");
  }

  const first = graphql({ owner, name, number, after: null });
  const snapshot = shapePullRequest(first);

  // Threads run past one page. A truncated thread silently drops records and
  // their findings with them, so the walk is complete or the command does not
  // answer — `nextCursor` is what makes "complete" decidable rather than
  // assumed.
  const what = `PR #${number}'s comments`;
  let after = nextCursor(first.comments.pageInfo, what);
  while (after !== null) {
    const page = graphql({ owner, name, number, after });
    for (const c of page.comments.nodes) {
      snapshot.comments.push({ body: c.body, url: c.url, createdAt: c.createdAt });
    }
    after = nextCursor(page.comments.pageInfo, what);
  }

  return snapshot;
}
