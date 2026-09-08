import type { EvidenceObject, Observation } from "@/lib/types";

interface Props {
  observation: Observation;
  evidence?: EvidenceObject[];
  activeEvidenceId?: string | null;
  onSelectEvidence?: (id: string) => void;
}

const LAYER_COLOR: Record<string, string> = {
  optical: "border-optical",
  sar: "border-sar",
  change: "border-change",
  fused: "border-primary",
};

export function ImageViewer({ observation, evidence = [], activeEvidenceId, onSelectEvidence }: Props) {
  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-sm border border-border bg-grid">
        <img
          src={observation.previewUrl}
          alt={`Preview of ${observation.filename}`}
          width={1024}
          height={1024}
          loading="lazy"
          className="block aspect-square w-full object-cover"
        />
        {evidence
          .filter((e) => e.geometry)
          .map((e) => {
            const g = e.geometry!;
            const active = activeEvidenceId === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onSelectEvidence?.(e.id)}
                style={{
                  left: `${g.x * 100}%`,
                  top: `${g.y * 100}%`,
                  width: `${g.w * 100}%`,
                  height: `${g.h * 100}%`,
                }}
                className={`absolute border-2 ${LAYER_COLOR[e.layer ?? "fused"] ?? "border-primary"} ${
                  active ? "bg-primary/15 ring-1 ring-primary" : "bg-transparent"
                } transition-colors`}
              >
                <span className="absolute -top-5 left-0 rounded-sm bg-background/85 px-1 font-mono text-[10px] text-foreground">
                  E{e.index} {e.label}
                </span>
              </button>
            );
          })}
        <span className="absolute bottom-1 right-1 rounded-sm bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {observation.role} · {observation.modality}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
        <Row label="file" value={observation.filename} />
        <Row
          label="size"
          value={`${observation.metadata.width ?? "?"}×${observation.metadata.height ?? "?"}`}
        />
        <Row label="crs" value={observation.metadata.crs ?? "—"} />
        <Row
          label="gsd"
          value={observation.metadata.resolutionM ? `${observation.metadata.resolutionM} m` : "—"}
        />
        <Row label="sensor" value={observation.metadata.sensor ?? "—"} />
        <Row label="acquired" value={observation.metadata.acquiredAt ?? "—"} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 truncate">
      <span className="uppercase tracking-widest">{label}</span>
      <span className="truncate text-foreground">{value}</span>
    </div>
  );
}
