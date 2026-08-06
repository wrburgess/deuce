---
date: 2026-08-06
source: the Direction gate on #82, where Option A — the orchestrated command — was chosen
---

# Sync configuration

The values the sync runs on — its trigger and cadence, and the receipt's default home. The
mechanism is canon, at [Chapter 5](../sds/05-distribution.md) → *The sync: updates arrive as pull
requests* and [ADR 0022](../adr/0022-updates-arrive-only-as-pull-requests.md); the tool is
[`tools/sync/`](../tools/sync/run.ts), admitted by
[ADR 0023](../adr/0023-the-sync-family-admitted.md); this file is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

## Trigger and cadence

- **HC-called, per host; no standing schedule.** Running the sync fleet-wide with the HC away is
  Chapter 6's, and until that chapter exists every run is a person deciding, on the record.
- The attended proving run under the HC's own credential precedes #83's blast-radius declaration
  by that gate's explicit direction; **no unattended run happens before #83 lands.**

## The receipt's home

- **Default: `config/vendoring-receipt.md` on the host** — the Direction gate on #82. The fleet
  roster records the location per host when its first row lands (#85); a host without a roster row
  is synced at the default.
