type JsonObject = Record<string, unknown>;

export type PlanSummary = {
  hasSeqScan: boolean;
  seqScanNodes: string[];
};

export const summarizePlan = (plan: unknown): PlanSummary => {
  const seqScanNodes: string[] = [];

  visitPlan(plan, seqScanNodes);

  return {
    hasSeqScan: seqScanNodes.length > 0,
    seqScanNodes
  };
};

const visitPlan = (value: unknown, seqScanNodes: string[]) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      visitPlan(item, seqScanNodes);
    }
    return;
  }

  if (!isObject(value)) {
    return;
  }

  const nodeType = value["Node Type"];
  if (nodeType === "Seq Scan") {
    const relationName = typeof value["Relation Name"] === "string" ? value["Relation Name"] : "desconocida";
    seqScanNodes.push(`Seq Scan on ${relationName}`);
  }

  for (const childValue of Object.values(value)) {
    visitPlan(childValue, seqScanNodes);
  }
};

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null;
