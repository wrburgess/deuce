// Renders the launchd agent from config/factory.md's trigger entry.
//
// Why rendered and not tracked beside the declaration: a plist committed next
// to the schedule it duplicates is two statements of one fact, and the day they
// disagree the installed one wins silently. Generating it means the file on
// disk is a build product of the declaration — the same argument config/checks.md
// makes for the gate's contents (ADR 0015, *one definition*).

import type { Trigger } from "./declaration.ts";

export interface InstallFacts {
  // The program launchd runs, and the directory it runs it in.
  program: string;
  workingDirectory: string;
  // Captured at install time: launchd's own environment holds neither the
  // version-managed node nor the homebrew claude.
  path: string;
  stdoutPath: string;
  stderrPath: string;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function stringEntry(key: string, value: string): string[] {
  return [`  <key>${escapeXml(key)}</key>`, `  <string>${escapeXml(value)}</string>`];
}

export function renderPlist(trigger: Trigger, install: InstallFacts): string {
  const intervals = trigger.weekdays.flatMap((day) => [
    "    <dict>",
    `      <key>Weekday</key><integer>${day}</integer>`,
    `      <key>Hour</key><integer>${trigger.hour}</integer>`,
    `      <key>Minute</key><integer>${trigger.minute}</integer>`,
    "    </dict>",
  ]);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ' +
      '"http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    "<dict>",
    ...stringEntry("Label", trigger.label),
    "  <key>ProgramArguments</key>",
    "  <array>",
    `    <string>${escapeXml("/bin/bash")}</string>`,
    `    <string>${escapeXml(install.program)}</string>`,
    "  </array>",
    ...stringEntry("WorkingDirectory", install.workingDirectory),
    "  <key>EnvironmentVariables</key>",
    "  <dict>",
    `    <key>PATH</key><string>${escapeXml(install.path)}</string>`,
    "  </dict>",
    "  <key>StartCalendarInterval</key>",
    "  <array>",
    ...intervals,
    "  </array>",
    ...stringEntry("StandardOutPath", install.stdoutPath),
    ...stringEntry("StandardErrorPath", install.stderrPath),
    // Never on load: bootstrapping the agent is an arming act, not a pass.
    // A trigger that fired at install time would start a pass nobody asked for.
    "  <key>RunAtLoad</key>",
    "  <false/>",
    "</dict>",
    "</plist>",
    "",
  ].join("\n");
}
