import { test } from "node:test";
import assert from "node:assert/strict";
import { shapeIssue } from "./fetch.ts";

test("an issue's labels within one page shape into the snapshot", () => {
  const issue = shapeIssue({
    number: 7,
    title: "TASK: t",
    body: null,
    labels: { pageInfo: { hasNextPage: false }, nodes: [{ name: "type:task" }] },
  });
  assert.deepEqual(issue, { number: 7, title: "TASK: t", body: "", labels: ["type:task"] });
});

test("labels overflowing the fetched page are refused loudly — axes are never certified over labels the fetch cannot see", () => {
  assert.throws(
    () =>
      shapeIssue({
        number: 8,
        title: "TASK: t",
        body: "",
        labels: { pageInfo: { hasNextPage: true }, nodes: [{ name: "type:task" }] },
      }),
    /issue #8 carries more labels than one fetch page/,
  );
});
