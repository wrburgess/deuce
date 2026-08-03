import { test } from "node:test";
import assert from "node:assert/strict";
import { dispatch, runReadiness } from "./dispatch.ts";

test("a passing readiness command reports reachable", () => {
  const r = runReadiness("true");
  assert.equal(r.ok, true);
});

test("a failing readiness command reports unreachable, with detail", () => {
  const r = runReadiness("echo down; exit 3");
  assert.equal(r.ok, false);
  assert.match(r.detail, /down/);
});

test("a failing readiness check is 'unreachable now' — nothing is dispatched", () => {
  const outcome = dispatch({
    readinessCommand: "exit 1",
    invocation: 'printf "should never run" > "$REVIEW_OUT"',
    summons: "s",
  });
  assert.equal(outcome.kind, "unreachable");
});

test("a mechanism that returns a review yields it", () => {
  const outcome = dispatch({
    readinessCommand: "true",
    invocation: 'cat > /dev/null && printf "the review" > "$REVIEW_OUT"',
    summons: "the summons",
  });
  assert.equal(outcome.kind, "review");
  assert.equal(outcome.kind === "review" && outcome.output, "the review");
});

test("a mechanism that writes nothing is unresponsive — a different outcome", () => {
  const outcome = dispatch({
    readinessCommand: "true",
    invocation: "cat > /dev/null",
    summons: "s",
  });
  assert.equal(outcome.kind, "unresponsive");
});
