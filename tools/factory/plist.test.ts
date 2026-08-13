import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseFactoryDeclaration, type Trigger } from "./declaration.ts";
import { escapeXml, renderPlist } from "./plist.ts";

const INSTALL = {
  program: "/repo/bin/factory",
  workingDirectory: "/repo",
  path: "/opt/homebrew/bin:/usr/bin:/bin",
  stdoutPath: "/Users/test/Library/Logs/deuce-factory.log",
  stderrPath: "/Users/test/Library/Logs/deuce-factory.log",
};

const trigger: Trigger = {
  mechanism: "launchd",
  label: "com.example.factory",
  weekdays: [1, 2, 3, 4, 5],
  hour: 7,
  minute: 47,
};

test("renders one calendar interval per declared weekday, at the declared time", () => {
  const xml = renderPlist(trigger, INSTALL);
  const intervals = xml.match(/<key>Weekday<\/key><integer>\d<\/integer>/g) ?? [];
  assert.equal(intervals.length, 5);
  assert.match(xml, /<key>Weekday<\/key><integer>1<\/integer>/);
  assert.match(xml, /<key>Weekday<\/key><integer>5<\/integer>/);
  assert.doesNotMatch(xml, /<key>Weekday<\/key><integer>6<\/integer>/);
  assert.equal((xml.match(/<key>Hour<\/key><integer>7<\/integer>/g) ?? []).length, 5);
  assert.equal((xml.match(/<key>Minute<\/key><integer>47<\/integer>/g) ?? []).length, 5);
});

test("carries the label, the program, the working directory, the PATH, and the log", () => {
  const xml = renderPlist(trigger, INSTALL);
  assert.match(xml, /<key>Label<\/key>\n\s*<string>com\.example\.factory<\/string>/);
  assert.match(xml, /<string>\/repo\/bin\/factory<\/string>/);
  assert.match(xml, /<key>WorkingDirectory<\/key>\n\s*<string>\/repo<\/string>/);
  assert.match(xml, /<key>PATH<\/key><string>\/opt\/homebrew\/bin:\/usr\/bin:\/bin<\/string>/);
  assert.equal((xml.match(/deuce-factory\.log/g) ?? []).length, 2);
});

test("never fires on load — bootstrapping is an arming act, not a pass", () => {
  assert.match(renderPlist(trigger, INSTALL), /<key>RunAtLoad<\/key>\n\s*<false\/>/);
});

test("every interpolated value is XML-escaped", () => {
  assert.equal(escapeXml(`a&b<c>d"e'f`), "a&amp;b&lt;c&gt;d&quot;e&apos;f");
  const xml = renderPlist(
    { ...trigger, label: "com.example.a&b" },
    { ...INSTALL, workingDirectory: "/re<po>" },
  );
  assert.match(xml, /<string>com\.example\.a&amp;b<\/string>/);
  assert.match(xml, /<string>\/re&lt;po&gt;<\/string>/);
  assert.doesNotMatch(xml, /<string>[^<]*&(?!amp;|lt;|gt;|quot;|apos;)/);
});

test("the live declaration renders an agent", () => {
  const md = readFileSync(new URL("../../config/factory.md", import.meta.url), "utf8");
  const d = parseFactoryDeclaration(md, "/Users/test");
  const xml = renderPlist(d.trigger, INSTALL);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<string>com\.wrburgess\.deuce\.factory<\/string>/);
  assert.match(xml, /<\/plist>\n$/);
});
