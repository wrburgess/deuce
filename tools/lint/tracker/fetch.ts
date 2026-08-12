// The impure edge of the tracker lint: one fetch, one snapshot, which every
// check then reads — so no two checks see different trackers. Shelled to gh
// token-wise, never through a shell (the dispatch.ts pattern). A failure
// here — gh missing, unauthenticated, network down, malformed response — is
// the check unable to run, never a state it rejects: the caller maps the
// thrown error to exit 2, loud and named, so an unreachable tracker never
// reads as green (Chapter 3, *The tooling contract*; the Direction gate on
// #56 chose this shape over a hermetic gate).

import { spawnSync } from "node:child_process";
import type { TrackerComment, TrackerIssue, TrackerPullRequest, TrackerSnapshot } from "./snapshot.ts";

function gh(args: string[]): string {
  const r = spawnSync("gh", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
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

const ISSUES_QUERY = `
query($owner: String!, $name: String!, $after: String) {
  repository(owner: $owner, name: $name) {
    issues(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { number title body labels(first: 50) { nodes { name } } }
    }
  }
}`;

const PRS_QUERY = `
query($owner: String!, $name: String!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title body
        comments(first: 100) { pageInfo { hasNextPage endCursor } nodes { body url } }
      }
    }
  }
}`;

const PR_COMMENTS_QUERY = `
query($owner: String!, $name: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      comments(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { body url } }
    }
  }
}`;

interface Page<T> {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: T[];
}

function graphql(query: string, fields: Record<string, string | number | null>): unknown {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(fields)) {
    if (value === null) continue;
    args.push(typeof value === "number" ? "-F" : "-f", `${key}=${value}`);
  }
  const data = ghJson(args) as { data?: { repository?: unknown } };
  const repository = data?.data?.repository;
  if (repository === undefined || repository === null) {
    throw new Error("the tracker's response carries no repository — the query or the repo resolution broke");
  }
  return repository;
}

export function fetchSnapshot(): TrackerSnapshot {
  const repo = ghJson(["repo", "view", "--json", "owner,name,url"]) as {
    owner?: { login?: string };
    name?: string;
    url?: string;
  };
  const owner = repo?.owner?.login;
  const name = repo?.name;
  const repoUrl = repo?.url;
  if (typeof owner !== "string" || typeof name !== "string" || typeof repoUrl !== "string") {
    throw new Error("gh repo view did not resolve the repository's owner, name, and url");
  }

  const issues: TrackerIssue[] = [];
  let after: string | null = null;
  do {
    const repository = graphql(ISSUES_QUERY, { owner, name, after }) as {
      issues: Page<{ number: number; title: string; body: string | null; labels: { nodes: { name: string }[] } }>;
    };
    for (const node of repository.issues.nodes) {
      issues.push({
        number: node.number,
        title: node.title,
        body: node.body ?? "",
        labels: node.labels.nodes.map((l) => l.name),
      });
    }
    after = repository.issues.pageInfo.hasNextPage ? repository.issues.pageInfo.endCursor : null;
  } while (after !== null);

  const pullRequests: TrackerPullRequest[] = [];
  after = null;
  do {
    const repository = graphql(PRS_QUERY, { owner, name, after }) as {
      pullRequests: Page<{
        number: number;
        title: string;
        body: string | null;
        comments: Page<{ body: string; url: string }>;
      }>;
    };
    for (const node of repository.pullRequests.nodes) {
      const comments: TrackerComment[] = node.comments.nodes.map((c) => ({ body: c.body, url: c.url }));
      let commentsAfter = node.comments.pageInfo.hasNextPage ? node.comments.pageInfo.endCursor : null;
      while (commentsAfter !== null) {
        const more = graphql(PR_COMMENTS_QUERY, { owner, name, number: node.number, after: commentsAfter }) as {
          pullRequest: { comments: Page<{ body: string; url: string }> };
        };
        for (const c of more.pullRequest.comments.nodes) comments.push({ body: c.body, url: c.url });
        commentsAfter = more.pullRequest.comments.pageInfo.hasNextPage
          ? more.pullRequest.comments.pageInfo.endCursor
          : null;
      }
      pullRequests.push({ number: node.number, title: node.title, body: node.body ?? "", comments });
    }
    after = repository.pullRequests.pageInfo.hasNextPage ? repository.pullRequests.pageInfo.endCursor : null;
  } while (after !== null);

  return { issues, pullRequests, repoUrl };
}
