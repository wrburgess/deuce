// The shared shape for the tracker lint (#56): one snapshot, fetched once,
// that every check reads — so no check sees a different tracker than the one
// beside it. This file shapes and validates; it decides nothing. Every
// decision lives in the check modules beside it, where it can be measured
// against a literal snapshot without touching the network (ADR 0014).

export interface TrackerIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
}

export interface TrackerComment {
  body: string;
  url: string;
}

export interface TrackerPullRequest {
  number: number;
  title: string;
  body: string;
  comments: TrackerComment[];
}

export interface TrackerSnapshot {
  issues: TrackerIssue[];
  pullRequests: TrackerPullRequest[];
  /** `https://github.com/<owner>/<name>` — what decides a link is external. */
  repoUrl: string;
}

// Malformed input is the check unable to run, never a state it rejects — the
// caller maps the thrown error to exit 2 (Chapter 3, *The tooling contract*).
export function parseSnapshot(json: string): TrackerSnapshot {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (err) {
    throw new Error(`the snapshot is not JSON: ${(err as Error).message}`);
  }
  const snap = data as Partial<TrackerSnapshot>;
  if (!Array.isArray(snap.issues) || !Array.isArray(snap.pullRequests)) {
    throw new Error("the snapshot carries no issues/pullRequests arrays");
  }
  if (typeof snap.repoUrl !== "string" || snap.repoUrl.length === 0) {
    throw new Error("the snapshot carries no repoUrl");
  }
  for (const issue of snap.issues) {
    if (
      typeof issue?.number !== "number" ||
      typeof issue?.title !== "string" ||
      typeof issue?.body !== "string" ||
      !Array.isArray(issue?.labels)
    ) {
      throw new Error("an issue in the snapshot is missing number/title/body/labels");
    }
  }
  for (const pr of snap.pullRequests) {
    if (
      typeof pr?.number !== "number" ||
      typeof pr?.title !== "string" ||
      typeof pr?.body !== "string" ||
      !Array.isArray(pr?.comments)
    ) {
      throw new Error("a pull request in the snapshot is missing number/title/body/comments");
    }
    for (const c of pr.comments) {
      if (typeof c?.body !== "string" || typeof c?.url !== "string") {
        throw new Error(`a comment on PR #${pr.number} is missing body/url`);
      }
    }
  }
  return snap as TrackerSnapshot;
}
