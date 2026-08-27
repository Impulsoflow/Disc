import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../ScriptDisc.html", import.meta.url), "utf8");

test("checks legacy history only while migrating a first Central use", () => {
  assert.match(page, /if \(centralAccess\.firstUse\)[\s\S]*validateDiscAccess/);
  assert.match(page, /legacyUsed: true/);
});

test("records access before showing the DISC questionnaire", () => {
  const startCall = page.indexOf('postCentralAccess({ action: "start", grant: discAccessGrant })');
  const showQuiz = page.indexOf('showStep("step-quiz")', startCall);
  assert.ok(startCall >= 0, "central start call must exist");
  assert.ok(showQuiz > startCall, "the questionnaire must open only after Central start");
  assert.match(page, /startedAccess\.phase !== "INICIADO"/);
});

test("accepts one Central-approved retake and finalizes in the client after saving", () => {
  assert.match(script, /legacyAccess\.hasPreviousResult && !access\.retakeAuthorized && !legacyAccess\.allowed/);
  assert.match(script, /retakeAuthorized: payload\.centralRetakeAuthorized === true/);
  assert.match(page, /action: "start", grant: discAccessGrant/);
  assert.match(page, /completedAccess\.phase !== "UTILIZADO"/);
});
