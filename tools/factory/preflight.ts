// Whether a trigger may start a pass, decided without touching anything —
// the observation is taken by run.ts and judged here, so every branch is
// measurable without a filesystem, a keychain, or a launchd agent (ADR 0014).
//
// The order of the guards is the whole content of the decision: the kill
// switch outranks everything, because an emergency act that loses to a lock or
// a dirty tree is not one act (Chapter 6, *The kill switch*).

// Presence and usability are different facts, and only one of them is what a
// pass needs. The receipt is this build's own first proving run: a keychain
// item holding 18 characters of something else passed a presence check, and the
// pass spent its whole start discovering at the queue read what one call at the
// door would have said. Recorded on #108.
export type TokenState = "absent" | "unusable" | "usable";

export interface Observation {
  killSwitchPresent: boolean;
  // When the lock directory was created; null when the lock is free.
  lockTakenAt: Date | null;
  // Null when the checkout could not be read at all — a different state from
  // a checkout read successfully and found dirty, and it gets its own message.
  checkoutClean: boolean | null;
  branch: string | null;
  token: TokenState;
}

export type Verdict =
  | { kind: "killed"; message: string }
  | { kind: "busy"; message: string }
  | { kind: "refused"; message: string }
  | { kind: "start"; message: string };

const HOUR_MS = 3_600_000;

export function describeAge(taken: Date, now: Date): string {
  const ms = now.getTime() - taken.getTime();
  if (ms < 0) return "taken in the future — the machine's clock moved";
  const hours = ms / HOUR_MS;
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60_000))} minutes old`;
  return `${hours.toFixed(1)} hours old`;
}

export function decide(observed: Observation, now: Date): Verdict {
  if (observed.killSwitchPresent) {
    return {
      kind: "killed",
      message: "the kill switch is present — nothing started. Delete the file to re-arm.",
    };
  }
  if (observed.lockTakenAt !== null) {
    // Never stolen, however old: taking a lock this pass did not take is how
    // two passes end up doing one stage twice (Chapter 6, *Passes do not
    // overlap*). An old lock is reported with its age and cleared by hand.
    return {
      kind: "busy",
      message:
        `a pass already holds the lock (${describeAge(observed.lockTakenAt, now)}) — ` +
        "nothing started. A lock left by a dead session is removed by hand.",
    };
  }
  if (observed.checkoutClean === null) {
    return {
      kind: "refused",
      message: "the checkout could not be read — nothing started.",
    };
  }
  if (!observed.checkoutClean) {
    // The branch is deliberately not a condition. A pass branches from
    // origin/main whatever the checkout sits on, and proving runs are run from
    // the branch under test; what actually collides is uncommitted work.
    return {
      kind: "refused",
      message:
        `the checkout has uncommitted changes (on ${observed.branch ?? "an unnamed branch"}) — ` +
        "nothing started. A pass must not commit over work in progress.",
    };
  }
  // Fail closed on both. Falling through to whatever gh holds would run the
  // pass on the HC's own login, which is the state ADR 0026 forbids outright.
  if (observed.token === "absent") {
    return {
      kind: "refused",
      message:
        "the tracker credential was not readable — nothing started. " +
        "A pass never falls back to the ambient login.",
    };
  }
  if (observed.token === "unusable") {
    // Deliberately names both causes rather than blaming the credential: one
    // failed call cannot tell a rejected token from an unreachable tracker, and
    // a message that picked one would send the reader to the wrong place half
    // the time.
    return {
      kind: "refused",
      message:
        "the tracker credential was read but did not work — the tracker rejected it, " +
        "or the tracker is unreachable. Nothing started, and no pass was spent finding out.",
    };
  }
  return {
    kind: "start",
    message: `starting a pass on ${observed.branch ?? "an unnamed branch"}`,
  };
}

export interface Death {
  label: string;
  startedAt: Date;
  endedAt: Date;
  reason: "deadline" | "exit";
  detail: string;
  logPath: string;
}

// Posted at the run record's home when a pass ends badly. Chapter 6 refuses to
// blur *finished* and *gone*; a silent hang is exactly that blur, so the wrapper
// says the thing the pass could not.
//
// What it never claims: that no run record was posted. The wrapper does not read
// the tracker, so it states what it saw — how the pass ended — and points the
// reader at the thread they are already looking at.
export function deathNotice(death: Death): string {
  const headline =
    death.reason === "deadline"
      ? "**A factory pass was killed by the wrapper's deadline.**"
      : "**A factory pass ended abnormally.**";
  return [
    "## Factory pass — died",
    "",
    headline,
    "",
    `- **Trigger:** \`${death.label}\``,
    `- **Started:** ${death.startedAt.toISOString()}`,
    `- **Ended:** ${death.endedAt.toISOString()}`,
    `- **How:** ${death.detail}`,
    `- **Log:** \`${death.logPath}\` on the machine that ran it`,
    "",
    "If no run record from this pass appears above, it died before writing one — that is what " +
      "this notice is for. Whatever it posted before dying stands; nothing rolls back, and the " +
      "next pass resumes from the artifacts on the tracker.",
  ].join("\n");
}
