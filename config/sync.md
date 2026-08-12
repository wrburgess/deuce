---
date: 2026-08-12
source: PR #118's review, finding 3, for the hold; superseding the 2026-08-08 declaration (the Direction gate on #82 for the trigger and the receipt's home; the Direction gate on #83 for the credential line)
---

# Sync configuration

The values the sync runs on — its trigger and cadence, and the receipt's default home. The
mechanism is canon, at [Chapter 5](../sds/05-distribution.md) → *The sync: updates arrive as pull
requests* and [ADR 0022](../adr/0022-updates-arrive-only-as-pull-requests.md); the tool is
[`tools/sync/`](../tools/sync/run.ts), admitted by
[ADR 0023](../adr/0023-the-sync-family-admitted.md); this file is adaptive configuration under
[Chapter 1](../sds/01-lifecycle-and-skills.md) → *The adaptive layer's home*.

## Trigger and cadence

- **Held: no sync dispatch until #117 lands.** The Skills moved (PR #118) and the sync cannot yet
  retire a path the manifest stopped naming — a sync before #117 would strand a stale `skills/`
  copy on the host, and the receipt would drop the retired entries so the stale copy sits with no
  drift signal. The hold lifts when #117 merges; it is written here because this file is where the
  sync's caller reads its trigger.
- **HC-called, per host; no standing schedule.** Running the sync fleet-wide with the HC away is
  Chapter 6's, and until that chapter exists every run is a person deciding, on the record.
- The attended proving run under the HC's own credential preceded #83's blast-radius declaration
  by that gate's explicit direction. **No unattended run happens except under a credential
  conforming to the declaration at [`config/credentials.md`](credentials.md)** — which #83
  landed, and which no minted credential yet satisfies.

## The receipt's home

- **Default: `config/vendoring-receipt.md` on the host** — the Direction gate on #82. The fleet
  roster records the location per host when its first row lands (#85); a host without a roster row
  is synced at the default.
