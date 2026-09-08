import { Panel } from "@/components/app-shell";
import type { AnalysisResult, ConfidenceLevel, EvidenceObject, TraceEvent } from "@/lib/types";

const CONFIDENCE_STYLE: Record<ConfidenceLevel, string> = {
  high: "text-success border-success",
  medium: "text-warning border-warning",
  low: "text-warning border-warning",
  unsupported: "text-destructive border-destructive",
};

const STATUS_DOT: Record<string, string> = {
  complete: "bg-success",
  running: "bg-active",
  pending: "bg-muted-foreground",
  failed: "bg-destructive",
  skipped: "bg-border",
};

export function AnswerPanel({ result }: { result: AnalysisResult }) {
  return (
    <Panel
      title="Answer"
      meta={`${result.workflow.label} · ${(result.runtimeMs / 1000).toFixed(1)}s`}
    >
      {result.refusal ? (
        <div className="space-y-2 rounded-sm border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm font-semibold text-destructive">{result.refusal.title}</p>
          <dl className="space-y-1 font-mono text-[11px] text-muted-foreground">
            <div>required: {result.refusal.required}</div>
            <div>received: {result.refusal.received}</div>
          </dl>
          <p className="text-sm text-foreground">{result.refusal.action}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[15px] leading-relaxed text-foreground">{result.answer}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{result.detailedAnswer}</p>
          <p className="border-l-2 border-border pl-3 text-sm leading-relaxed text-muted-foreground">
            {result.interpretation}
          </p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{result.tool.name} {result.tool.version}</span>
        <span>{result.model.name} {result.model.version}</span>
        <span>{result.requestId}</span>
      </div>
    </Panel>
  );
}

export function ConfidencePanel({ result }: { result: AnalysisResult }) {
  const { confidence } = result;
  return (
    <Panel
      title="Confidence"
      meta={
        <span className={`rounded-sm border px-1.5 py-0.5 uppercase ${CONFIDENCE_STYLE[confidence.level]}`}>
          {confidence.level}
          {confidence.score != null ? ` · ${Math.round(confidence.score * 100)}%` : ""}
        </span>
      }
    >
      <ul className="space-y-1.5">
        {confidence.factors.map((f) => (
          <li key={f.label} className="flex items-start gap-2 text-xs">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                f.status === "supporting"
                  ? "bg-success"
                  : f.status === "uncertain"
                    ? "bg-warning"
                    : "bg-destructive"
              }`}
            />
            <span className="text-foreground">
              {f.label}
              {f.detail ? <span className="text-muted-foreground"> — {f.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {confidence.limitations.length > 0 && (
        <div className="mt-3 border-t border-border pt-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Limitations
          </p>
          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
            {confidence.limitations.map((l) => (
              <li key={l}>· {l}</li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

export function EvidencePanel({
  evidence,
  activeId,
  onSelect,
}: {
  evidence: EvidenceObject[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Panel title="Evidence" meta={`${evidence.length} objects`}>
      {evidence.length === 0 ? (
        <p className="text-xs text-muted-foreground">No evidence objects produced.</p>
      ) : (
        <ul className="space-y-1.5">
          {evidence.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onSelect(e.id)}
                className={`w-full rounded-sm border px-2 py-1.5 text-left transition-colors ${
                  activeId === e.id
                    ? "border-primary bg-panel-raised"
                    : "border-border hover:bg-panel-raised"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-foreground">
                    E{e.index} · {e.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {e.confidence != null ? `${Math.round(e.confidence * 100)}%` : "—"}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {e.regionDescription ?? e.type}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {e.sourceTool} {e.sourceVersion}
                  {e.coordinates ? ` · ${e.coordinates}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function TracePanel({ trace }: { trace: TraceEvent[] }) {
  return (
    <Panel title="Execution trace" meta={`${trace.length} stages`}>
      <ol className="space-y-2">
        {trace.map((t) => (
          <li key={t.eventId} className="flex gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[t.status] ?? "bg-border"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] text-foreground">{t.stage}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {t.runtimeMs != null ? `${t.runtimeMs} ms` : "—"}
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">
                {t.component}
                {t.tool ? ` · ${t.tool}` : ""}
                {t.modelVersion ? ` · ${t.modelVersion}` : ""}
              </p>
              {t.message ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{t.message}</p>
              ) : null}
              {t.error ? <p className="mt-0.5 text-[11px] text-destructive">{t.error}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function RoutePanel({ result }: { result: AnalysisResult }) {
  return (
    <Panel title="Routing" meta={`${Math.round(result.intent.confidence * 100)}% intent`}>
      <div className="space-y-1.5">
        {result.route.map((n, i) => (
          <div key={n.id} className="flex gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">{i + 1}</span>
            <div>
              <p className="text-xs text-foreground">{n.label}</p>
              {n.detail ? <p className="text-[11px] text-muted-foreground">{n.detail}</p> : null}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1 border-t border-border pt-2">
        {result.intent.entities.map((e) => (
          <span
            key={`${e.type}-${e.text}`}
            className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {e.type}: {e.text}
          </span>
        ))}
      </div>
    </Panel>
  );
}
