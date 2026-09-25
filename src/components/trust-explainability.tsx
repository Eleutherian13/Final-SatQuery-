import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Download } from "lucide-react";

import { StatusDot } from "@/components/app-shell";
import {
  buildAuditLedger,
  buildEvidenceGraph,
  buildLowConfidenceBreakdown,
  buildProvenance,
  buildReportData,
  buildTrace,
  classifyRefusal,
  type AuditLedger,
  type EvidenceGraph,
  type LowConfidenceFactor,
  type ReportData,
  type ReportSection,
  type TraceEntry,
} from "@/lib/trust-data";
import type { Investigation } from "@/lib/types";
import { cn } from "@/lib/utils";

const EDGE_LABELS: Record<string, string> = {
  "query-to-task": "classified as",
  "task-to-tool": "routes to",
  "tool-to-evidence": "produces",
  "evidence-to-claim": "supports",
  "claim-to-claim": "refines",
};

function confidenceColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return "text-muted-foreground";
  if (value >= 0.85) return "text-success";
  if (value >= 0.7) return "text-warning";
  return "text-destructive";
}

function severityDot(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "bg-destructive";
  if (severity === "medium") return "bg-warning";
  return "bg-border";
}

export interface TrustExplainabilityViewProps {
  investigation: Investigation;
  onSelectEvidence?: ((evidenceId: string) => void) | undefined;
}

interface SectionProps {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  expanded: boolean;
  onToggle: () => void;
  meta?: string;
  children: ReactNode;
}

function Section({ id, title, icon, iconColor, expanded, onToggle, meta, children }: SectionProps) {
  return (
    <section className="border border-border bg-panel">
      <header
        className="flex h-8 shrink-0 cursor-pointer items-center justify-between gap-2 border-b border-border px-3"
        onClick={onToggle}
      >
        <div className="flex items-center gap-1.5">
          <span className={iconColor}>{icon}</span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {meta && <span>{meta}</span>}
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </header>
      {expanded && <div className="p-3">{children}</div>}
    </section>
  );
}

interface EvidenceGraphViewProps {
  graph: EvidenceGraph;
  onSelectNode: (nodeId: string) => void;
}

function EvidenceGraphView({ graph, onSelectNode }: EvidenceGraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const connectedEdgeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    graph.edges.forEach((edge) => {
      if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
        connected.add(edge.id);
      }
    });
    return connected;
  }, [selectedNodeId, graph.edges]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    graph.edges.forEach((edge) => {
      if (connectedEdgeIds.has(edge.id)) {
        connected.add(edge.source);
        connected.add(edge.target);
      }
    });
    return connected;
  }, [connectedEdgeIds, graph.edges, selectedNodeId]);

  const nodeColor = (node: (typeof graph.nodes)[number]): string => {
    switch (node.type) {
      case "QUERY":
        return "text-primary";
      case "TASK":
        return "text-active";
      case "TOOL":
        return "text-optical";
      case "EVIDENCE":
        return "text-sar";
      case "CLAIM":
        return "text-change";
      default:
        return "text-muted-foreground";
    }
  };

  const nodeBg = (node: (typeof graph.nodes)[number]): string => {
    if (selectedNodeId === node.id) return "bg-primary/20 ring-2 ring-primary";
    if (selectedNodeId && connectedNodeIds.has(node.id)) return "bg-primary/5";
    return "";
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground">Type</th>
              <th className="text-left text-muted-foreground">Label</th>
              <th className="text-left text-muted-foreground">Conf.</th>
              <th className="text-left text-muted-foreground">Detail</th>
            </tr>
          </thead>
          <tbody>
            {graph.nodes.map((node) => (
              <tr
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  onSelectNode(node.id);
                }}
                className={cn(
                  "cursor-pointer border-b border-border transition-colors",
                  nodeBg(node),
                )}
              >
                <td className={cn("py-1 pr-2", nodeColor(node))}>{node.type}</td>
                <td className="py-1 pr-2 text-foreground">{node.label}</td>
                <td className="py-1 pr-2">
                  {node.confidence !== undefined && node.confidence !== null
                    ? `${Math.round(node.confidence * 100)}%`
                    : "—"}
                </td>
                <td className="py-1 pr-2 text-[8px] text-muted-foreground">
                  {node.metadata && typeof node.metadata["coordinates"] === "string"
                    ? node.metadata["coordinates"]
                    : node.subtitle || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedNodeId && (
        <div className="border-l-2 border-primary pl-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Selected: {graph.nodes.find((n) => n.id === selectedNodeId)?.label ?? selectedNodeId}
          </div>
          <ul className="mt-1 space-y-0.5">
            {graph.edges
              .filter((e) => connectedEdgeIds.has(e.id))
              .map((edge) => {
                const src = graph.nodes.find((n) => n.id === edge.source);
                const tgt = graph.nodes.find((n) => n.id === edge.target);
                return (
                  <li key={edge.id} className="flex items-center gap-2 text-[9px]">
                    <span className="text-muted-foreground">{src?.type}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-primary">{EDGE_LABELS[edge.type] ?? edge.type}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{tgt?.type}</span>
                    {edge.weight !== undefined && edge.weight !== null && (
                      <span className="text-muted-foreground">
                        ({Math.round(edge.weight * 100)}%)
                      </span>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {!selectedNodeId && (
        <p className="text-[9px] text-muted-foreground">
          Click a node to see connected edges and trace its path through the graph.
        </p>
      )}
    </div>
  );
}

function LowConfidenceView({
  factors,
  summary,
}: {
  factors: LowConfidenceFactor[];
  summary: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">{summary}</p>
      <div className="space-y-1.5">
        {factors.map((factor) => (
          <div key={factor.id} className="flex items-start gap-2.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${severityDot(factor.severity)}`} />
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold text-foreground">{factor.label}</span>
                <span className="text-[10px] text-muted-foreground">({factor.value})</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{factor.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerificationView({ verification }: { verification: Investigation["verification"] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StatusDot
          status={
            verification.overallStatus === "pass"
              ? "pass"
              : verification.overallStatus === "warn"
                ? "warn"
                : "fail"
          }
        />
        <span
          className={cn(
            "text-[11px] font-semibold",
            verification.overallStatus === "pass"
              ? "text-success"
              : verification.overallStatus === "warn"
                ? "text-warning"
                : "text-destructive",
          )}
        >
          {verification.overallStatus === "pass"
            ? "PASSED"
            : verification.overallStatus === "warn"
              ? "WARNING"
              : "FAILED"}
        </span>
      </div>

      {verification.contradictions.length > 0 && (
        <div className="border border-destructive/40 bg-destructive/10 p-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-destructive">
            Contradictions
          </span>
          <ul className="mt-1 space-y-0.5">
            {verification.contradictions.map((c, i) => (
              <li key={i} className="text-[10px] text-foreground">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-32 text-muted-foreground">Evidence Completeness</span>
          <span
            className={cn(
              "font-semibold",
              verification.evidenceCompleteness === "complete"
                ? "text-success"
                : verification.evidenceCompleteness === "partial"
                  ? "text-warning"
                  : "text-destructive",
            )}
          >
            {verification.evidenceCompleteness}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-32 text-muted-foreground">Model Agreement</span>
          <span
            className={cn(
              "font-semibold",
              verification.modelAgreement === "agreed"
                ? "text-success"
                : verification.modelAgreement === "partial"
                  ? "text-warning"
                  : verification.modelAgreement === "disagreed"
                    ? "text-destructive"
                    : "text-muted-foreground",
            )}
          >
            {verification.modelAgreement ?? "—"}
          </span>
        </div>
        {verification.registrationQuality && (
          <div className="flex items-center gap-2">
            <span className="w-32 text-muted-foreground">Registration</span>
            <span className="font-semibold text-foreground">
              {verification.registrationQuality}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="w-32 text-muted-foreground">Checks Passed</span>
          <span className="font-semibold text-foreground">
            {verification.checks.filter((c) => c.status === "pass").length}/
            {verification.checks.length}
          </span>
        </div>
      </div>

      <div className="border-t border-border pt-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Verification Checks
        </span>
        <ul className="mt-1 space-y-0.5">
          {verification.checks.map((check, i) => (
            <li key={i} className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-[10px]">
                <StatusDot
                  status={
                    check.status === "pass" ? "pass" : check.status === "warn" ? "warn" : "fail"
                  }
                />
                {check.label}
              </span>
              {check.detail && (
                <span className="text-[9px] text-muted-foreground">{check.detail}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ClaimsView({
  claims,
  onSelectEvidence,
}: {
  claims: NonNullable<Investigation["structuredAnswer"]["claims"]>;
  onSelectEvidence?: ((evidenceId: string) => void) | undefined;
}) {
  if (claims.length === 0) {
    return <p className="text-[11px] text-muted-foreground">No structured claims available.</p>;
  }

  return (
    <div className="space-y-2">
      {claims.map((claim) => (
        <div key={claim.id} className="border border-border p-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-foreground">
              Claim {claim.id.toUpperCase()}
            </span>
            <span
              className={cn(
                "font-mono text-[9px]",
                claim.confidence === "high"
                  ? "text-success"
                  : claim.confidence === "medium"
                    ? "text-warning"
                    : "text-destructive",
              )}
            >
              {claim.confidence}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-foreground">{claim.text}</p>
          {claim.supportedBy && (
            <p className="mt-1 text-[9px] text-muted-foreground">
              Supported by: {claim.supportedBy}
            </p>
          )}
          {claim.evidenceIds.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {claim.evidenceIds.map((eid) => (
                <button
                  key={eid}
                  type="button"
                  onClick={() => onSelectEvidence?.(eid)}
                  className="border border-border bg-background px-1.5 py-0.5 text-[8px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  evidence: {eid}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProvenanceView({
  provenance,
  ledger,
  report,
}: {
  provenance: ReturnType<typeof buildProvenance>;
  ledger: AuditLedger;
  report: ReportData;
}) {
  const downloadReport = () => {
    const content = generateMarkdown(report);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery-audit-report-${report.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Sources
        </span>
        <table className="mt-1 w-full text-[9px]">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground">ID</th>
              <th className="text-left text-muted-foreground">Dataset</th>
              <th className="text-left text-muted-foreground">Sensor</th>
              <th className="text-right text-muted-foreground">GSD (m)</th>
              <th className="text-right text-muted-foreground">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {provenance.sources.map((src) => (
              <tr key={src.id} className="border-b border-border">
                <td className="py-0.5 text-muted-foreground">{src.id}</td>
                <td className="py-0.5 text-foreground">{src.dataset}</td>
                <td className="py-0.5 text-foreground">{src.sensor}</td>
                <td className="py-0.5 text-right text-muted-foreground">
                  {src.resolutionMeters !== null ? src.resolutionMeters : "—"}
                </td>
                <td className="py-0.5 text-right">
                  {src.confidence !== null ? `${Math.round(src.confidence * 100)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Processing Chain
        </span>
        <ol className="mt-1 space-y-0.5">
          {provenance.processingChain.map((step, i) => (
            <li key={i} className="flex items-center gap-2 text-[10px]">
              <span className="text-primary">{(i + 1).toString().padStart(2, "0")}.</span>
              <span className="text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Audit Ledger (Demo Mode — hash chained locally, not cryptographically verifiable)
        </span>
        <div className="mt-1 space-y-0.5">
          {ledger.entries.map((entry) => (
            <div
              key={entry.stage}
              className="flex items-center gap-2 border-b border-border py-0.5"
            >
              <span className="w-3 font-mono text-[8px] text-muted-foreground">
                {entry.hash.slice(0, 3)}
              </span>
              <span className="w-32 text-[9px] text-muted-foreground">{entry.stage}</span>
              <span className="font-mono text-[8px] text-muted-foreground">
                {entry.parentHash?.slice(0, 6) ?? "genesis"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={downloadReport}
        className="flex items-center gap-1 border border-border bg-background px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Download className="h-3 w-3" />
        Download Markdown Report
      </button>
    </div>
  );
}

function TraceView({ trace }: { trace: TraceEntry[] }) {
  return (
    <div className="space-y-1">
      {trace.map((entry) => (
        <div key={entry.stage} className="flex items-center gap-2.5">
          <span className="h-4 w-4 shrink-0 text-center leading-3">{entry.icon}</span>
          <span className="w-32 text-[9px] capitalize text-muted-foreground">
            {entry.stage.replace(/_/g, " ")}
          </span>
          <StatusDot
            status={
              entry.status === "complete" ? "pass" : entry.status === "failed" ? "fail" : "skipped"
            }
          />
          <span className="text-[9px] text-foreground">{entry.label}</span>
          {entry.detail && (
            <span className="text-[8px] text-muted-foreground">· {entry.detail}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function generateMarkdown(report: ReportData): string {
  const lines: string[] = [];
  lines.push("# SatQuery AI — Investigation Audit Report");
  lines.push("");
  lines.push(`**Report ID:** ${report.id}`);
  lines.push(`**Generated At:** ${report.generatedAt}`);
  lines.push("**Mode:** Demo Mode (client-side, non-custodial)");
  lines.push("");
  lines.push(`## Decision: ${report.decision}`);
  lines.push("");
  lines.push(report.structuredAnswer || "(no structured answer)");
  lines.push("");
  lines.push("## Sections");
  lines.push("");
  report.sections.forEach((s: ReportSection) => {
    lines.push(`- [${s.status.toUpperCase()}] ${s.title}: ${s.summary}`);
  });
  lines.push("");
  lines.push("## Evidence Graph");
  lines.push("");
  lines.push(`- Nodes: ${report.graph.nodes.length}`);
  lines.push(`- Edges: ${report.graph.edges.length}`);
  lines.push("");
  lines.push("## Refusal");
  lines.push("");
  if (report.refusal) {
    lines.push(`- Category: ${report.refusal.category}`);
    lines.push(`- Reason: ${report.refusal.reason}`);
    lines.push(`- Action: ${report.refusal.action}`);
  } else {
    lines.push("- No refusal");
  }
  lines.push("");
  lines.push("## Low-Confidence Factors");
  lines.push("");
  if (report.lowConfidence) {
    lines.push(report.lowConfidence.summary);
    report.lowConfidence.factors.forEach((f) => {
      lines.push(`- [${f.severity}] ${f.label}: ${f.value} — ${f.description}`);
    });
  } else {
    lines.push("- Not applicable");
  }
  lines.push("");
  lines.push(`## Provenance (${report.provenance.sources.length} sources)`);
  lines.push("");
  report.provenance.sources.forEach((s) => {
    lines.push(`- ${s.id}: ${s.dataset} (${s.sensor})`);
  });
  lines.push("");
  lines.push("## Audit Ledger");
  lines.push("");
  lines.push("| Stage | Hash | Parent |");
  lines.push("|-------|------|--------|");
  report.ledger.entries.forEach((e) => {
    lines.push(
      `| ${e.stage} | ${e.hash.slice(0, 8)} | ${e.parentHash?.slice(0, 8) ?? "genesis"} |`,
    );
  });
  return lines.join("\n");
}

export function TrustExplainabilityView({
  investigation,
  onSelectEvidence,
}: TrustExplainabilityViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["graph", "verification", "provenance"]),
  );

  const report = useMemo(() => buildReportData(investigation), [investigation]);
  const graph = useMemo(() => buildEvidenceGraph(investigation), [investigation]);
  const refusal = useMemo(() => classifyRefusal(investigation), [investigation]);
  const lowConfidence = useMemo(() => buildLowConfidenceBreakdown(investigation), [investigation]);
  const provenance = useMemo(() => buildProvenance(investigation), [investigation]);
  const ledger = useMemo(() => buildAuditLedger(investigation), [investigation]);
  const trace = useMemo(() => buildTrace(investigation), [investigation]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNodeClick = (nodeId: string) => {
    if (onSelectEvidence) {
      const node = graph.nodes.find((n) => n.id === nodeId);
      if (node && node.type === "EVIDENCE") {
        onSelectEvidence(nodeId);
      }
    }
  };

  const handleExport = () => {
    const content = generateMarkdown(report);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery-audit-report-${report.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3 p-3 font-mono text-[10px] uppercase tracking-[0.12em]">
      <Section
        id="summary"
        title="Investigation Summary"
        icon="📋"
        iconColor="text-primary"
        expanded={expandedSections.has("summary")}
        onToggle={() => toggleSection("summary")}
        meta={investigation.decision.status === "blocked" ? "BLOCKED" : "SUPPORTED"}
      >
        <div className="space-y-2 text-[11px] tracking-normal">
          <div className="flex items-start gap-3">
            <span className="w-32 shrink-0 text-muted-foreground">Workflow</span>
            <span className="text-foreground">{investigation.workflow.label}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-32 shrink-0 text-muted-foreground">Intent</span>
            <span className="text-foreground">{investigation.queryUnderstanding.intent}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-32 shrink-0 text-muted-foreground">Decision Engine</span>
            <span className="text-foreground">
              {investigation.decision.engine === "jev" ? "Jev" : "Laya"}
              {" · status: "}
              {investigation.decision.status}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-32 shrink-0 text-muted-foreground">Answer</span>
            <span className="text-foreground">
              {investigation.answer || investigation.detailedAnswer}
            </span>
          </div>
        </div>
      </Section>

      {refusal && (
        <Section
          id="refusal"
          title="Refusal Analysis"
          icon="🚫"
          iconColor="text-destructive"
          expanded={expandedSections.has("refusal")}
          onToggle={() => toggleSection("refusal")}
          meta="REFUSED"
        >
          <div className="space-y-2 text-[11px] tracking-normal">
            <div className="flex items-start gap-3">
              <span className="w-32 shrink-0 text-muted-foreground">Category</span>
              <span className="text-destructive font-semibold">
                {refusal.category.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-32 shrink-0 text-muted-foreground">Required</span>
              <span className="text-foreground">{investigation.refusal?.required ?? "—"}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-32 shrink-0 text-muted-foreground">Received</span>
              <span className="text-foreground">{investigation.refusal?.received ?? "—"}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-32 shrink-0 text-muted-foreground">Action</span>
              <span className="text-foreground">{refusal.action}</span>
            </div>
            {refusal.actionHint && (
              <div className="flex items-start gap-3">
                <span className="w-32 shrink-0 text-muted-foreground">Suggested Fix</span>
                <span className="text-primary">{refusal.actionHint}</span>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section
        id="graph"
        title="Evidence Graph"
        icon="🔗"
        iconColor="text-primary"
        expanded={expandedSections.has("graph")}
        onToggle={() => toggleSection("graph")}
        meta={`${graph.nodes.length} nodes · ${graph.edges.length} edges`}
      >
        <EvidenceGraphView graph={graph} onSelectNode={handleNodeClick} />
      </Section>

      {lowConfidence && (
        <Section
          id="confidence"
          title="Low-Confidence Factors"
          icon="⚠"
          iconColor="text-warning"
          expanded={expandedSections.has("confidence")}
          onToggle={() => toggleSection("confidence")}
          meta={`${lowConfidence.factors.length} factors`}
        >
          <LowConfidenceView factors={lowConfidence.factors} summary={lowConfidence.summary} />
        </Section>
      )}

      <Section
        id="verification"
        title="Verification"
        icon="✓"
        iconColor={
          investigation.verification.overallStatus === "pass"
            ? "text-success"
            : investigation.verification.overallStatus === "warn"
              ? "text-warning"
              : "text-destructive"
        }
        expanded={expandedSections.has("verification")}
        onToggle={() => toggleSection("verification")}
        meta={`Overall: ${investigation.verification.overallStatus}`}
      >
        <VerificationView verification={investigation.verification} />
      </Section>

      <Section
        id="claims"
        title="Structured Claims"
        icon="📝"
        iconColor="text-optical"
        expanded={expandedSections.has("claims")}
        onToggle={() => toggleSection("claims")}
        meta={`${investigation.structuredAnswer.claims.length} claims`}
      >
        <ClaimsView
          claims={investigation.structuredAnswer.claims}
          onSelectEvidence={onSelectEvidence}
        />
      </Section>

      <Section
        id="provenance"
        title="Provenance & Audit Ledger"
        icon="🔒"
        iconColor="text-sar"
        expanded={expandedSections.has("provenance")}
        onToggle={() => toggleSection("provenance")}
        meta="Demo Mode (non-custodial)"
      >
        <ProvenanceView provenance={provenance} ledger={ledger} report={report} />
      </Section>

      <Section
        id="trace"
        title="Trust Trace"
        icon="⏱"
        iconColor="text-muted-foreground"
        expanded={expandedSections.has("trace")}
        onToggle={() => toggleSection("trace")}
        meta={`${trace.length} stages`}
      >
        <TraceView trace={trace} />
      </Section>

      <button
        type="button"
        onClick={handleExport}
        className="self-start border border-border bg-panel-raised px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Download className="mr-1 h-3 w-3" />
        Export Report (Demo)
      </button>
    </div>
  );
}
