import assert from "node:assert/strict";
import test from "node:test";
import { summarizePlan } from "./planSummary.js";

test("summarizePlan detecta Seq Scan en plan anidado", () => {
  const summary = summarizePlan([
    {
      Plan: {
        "Node Type": "Nested Loop",
        Plans: [
          {
            "Node Type": "Index Scan",
            "Relation Name": "empresas"
          },
          {
            "Node Type": "Seq Scan",
            "Relation Name": "documentos"
          }
        ]
      }
    }
  ]);

  assert.equal(summary.hasSeqScan, true);
  assert.deepEqual(summary.seqScanNodes, ["Seq Scan on documentos"]);
});

test("summarizePlan no marca Seq Scan cuando no existe", () => {
  const summary = summarizePlan([
    {
      Plan: {
        "Node Type": "Index Scan",
        "Relation Name": "documentos"
      }
    }
  ]);

  assert.equal(summary.hasSeqScan, false);
  assert.deepEqual(summary.seqScanNodes, []);
});

test("summarizePlan maneja entrada desconocida sin fallar", () => {
  const summary = summarizePlan(null);

  assert.equal(summary.hasSeqScan, false);
  assert.deepEqual(summary.seqScanNodes, []);
});
