/**
 * SatQuery AI — Multimodal & Cross-Modal (Optical + SAR) Specialist Panels
 *
 * Implements:
 * - CrossModalValidationCard: Pre-flight audit of CRS, GSD ratio, spatial overlap, temporal delta
 * - CrossModalSpecialistPanel: Dual-branch execution (Optical Branch + SAR Branch), Physics Side Features, Alignment Adapter, Fusion Layer
 * - CrossModalRefusalCard: Refusal for invalid/incompatible pairs (Optical+Optical -> Routing Blocked)
 * - PerModalityEvidenceInspector: Modality contribution indicators and evidence breakdown
 */

import { useState } from "react";
import {
  Layers,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Eye,
  Crosshair,
  ShieldCheck,
  Compass,
  Maximize2,
  Minimize2,
  Sliders,
  Flame,
  Droplets,
  Building,
  TreePine,
  Waves,
} from "lucide-react";
import type {
  AnalysisResult,
  CrossModalInvestigationData,
  CrossModalValidationInfo,
  EvidenceObject,
  Observation,
  PhysicsSideFeatures,
  Refusal,
} from "@/lib/types";
import { StatusDot } from "./app-shell";

/* =========================================================================
   1. CrossModalValidationCard
   Pre-fusion audit checking CRS alignment, GSD ratio, overlap, and temporal delta
   ========================================================================= */

export function CrossModalValidationCard({
  result,
  observations,
}: {
  result: AnalysisResult;
  observations: Observation[];
}) {
  const cm = result.crossModal?.validation;
  const optObs = observations.find((o) => o.modality === "optical") ?? observations[0];
  const sarObs = observations.find((o) => o.modality === "sar") ?? observations[1];

  const hasOptical = Boolean(optObs && optObs.modality === "optical");
  const hasSar = Boolean(sarObs && sarObs.modality === "sar");
  const isCompatible = hasOptical && hasSar;

  return (
    <div className="border border-border bg-panel p-3 font-mono text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold uppercase tracking-[0.16em] text-foreground">
            CROSS-MODAL VALIDATOR
          </span>
        </div>
        <span
          className={`border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${
            isCompatible
              ? "border-success/60 bg-success/10 text-success"
              : "border-destructive/60 bg-destructive/10 text-destructive font-bold"
          }`}
        >
          {isCompatible ? "✓ MODALITIES COMPATIBLE" : "⚠ INCOMPATIBLE INPUT"}
        </span>
      </div>

      {/* Modality Pair Readout */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="border border-border/80 bg-background/80 p-2">
          <div className="flex items-center justify-between text-optical">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-[0.14em]">
              <Eye className="h-3 w-3" />
              OPTICAL SENSOR
            </span>
            <span className="text-[9px]">T1</span>
          </div>
          <p className="mt-1 truncate text-[11px] text-foreground">
            {optObs?.filename ?? "cartosat_scene.tif"}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {optObs?.metadata.sensor ?? "Cartosat-3"} · GSD {optObs?.metadata.resolutionM ?? 0.6}m ·{" "}
            {optObs?.metadata.crs ?? "EPSG:4326"}
          </p>
        </div>

        <div className="border border-border/80 bg-background/80 p-2">
          <div className="flex items-center justify-between text-sar">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-[0.14em]">
              <Radio className="h-3 w-3" />
              SAR SENSOR
            </span>
            <span className="text-[9px]">T2</span>
          </div>
          <p className="mt-1 truncate text-[11px] text-foreground">
            {hasSar ? sarObs?.filename : "No SAR raster attached"}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {hasSar
              ? `${sarObs?.metadata.sensor ?? "EOS-04 (C-Band)"} · GSD ${sarObs?.metadata.resolutionM ?? 6.0}m · ${sarObs?.metadata.crs ?? "EPSG:4326"}`
              : "Required: C-Band or X-Band SAR"}
          </p>
        </div>
      </div>

      {/* Validation Audit Table */}
      <div className="mt-2.5 space-y-1 divide-y divide-border/60 border border-border bg-background/50 p-2 text-[9px]">
        <div className="flex items-center justify-between pb-1">
          <span className="text-muted-foreground">CRS Alignment</span>
          <span className="font-semibold text-success">
            {cm?.crsAlignment === "exact"
              ? "EPSG:4326 (Exact Match)"
              : "Auto-Reprojected to EPSG:4326"}
          </span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">Resolution Ratio</span>
          <span className="text-foreground">
            1 : {(cm?.resolutionRatio ?? 10).toFixed(1)} (Optical {cm?.opticalGsdM ?? 0.6}m / SAR{" "}
            {cm?.sarGsdM ?? 6.0}m)
          </span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">Spatial Overlap Area</span>
          <span className="text-success">
            {cm?.spatialOverlapPercent ?? 96.4}% Geometric Coincidence
          </span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">Temporal Delta</span>
          <span className="text-muted-foreground">
            Δt = {cm?.temporalDeltaDays ?? 2.1} days (Acceptable for quasi-static land cover)
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-muted-foreground">SAR Polarization & Geometry</span>
          <span className="text-sar">
            {cm?.polarization ?? "VV+VH"} Dual-Pol · θ = {cm?.incidenceAngleDeg ?? 34.2}°
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. CrossModalRefusalCard
   Displayed when an incompatible input pair is rejected before fusion
   ========================================================================= */

export function CrossModalRefusalCard({ refusal }: { refusal: Refusal }) {
  return (
    <div className="space-y-3 border border-destructive/60 bg-destructive/10 p-3 font-mono text-[10px]">
      <div className="flex items-center gap-2 border-b border-destructive/40 pb-2 text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <div>
          <span className="font-bold uppercase tracking-[0.16em]">
            INPUT INCOMPATIBLE · ROUTING BLOCKED
          </span>
          <p className="text-[9px] uppercase tracking-[0.12em] opacity-90">NO FUSION EXECUTED</p>
        </div>
      </div>

      <div className="space-y-1.5 bg-background/80 p-2.5 text-[9px]">
        <div>
          <span className="uppercase tracking-[0.14em] text-muted-foreground">REQUIRED INPUT:</span>
          <p className="font-semibold text-foreground">{refusal.required}</p>
        </div>
        <div>
          <span className="uppercase tracking-[0.14em] text-muted-foreground">RECEIVED INPUT:</span>
          <p className="font-semibold text-destructive">{refusal.received}</p>
        </div>
        <div>
          <span className="uppercase tracking-[0.14em] text-muted-foreground">
            RECOMMENDED ACTION:
          </span>
          <p className="text-foreground">{refusal.action}</p>
          {refusal.actionHint && (
            <p className="mt-0.5 text-muted-foreground">{refusal.actionHint}</p>
          )}
        </div>
      </div>

      <div className="border border-border/80 bg-background/60 p-2 text-[9px] text-muted-foreground">
        <p>
          Cross-modal fusion models require complementary physical modalities (dielectric
          backscatter + multispectral reflectance). Incompatible observation pairs are safely
          aborted at the routing stage before executing expensive GPU inference.
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   3. CrossModalSpecialistPanel
   The flagship dual-branch + physics + fusion visualization engine
   ========================================================================= */

export function CrossModalSpecialistPanel({
  result,
  observations,
}: {
  result: AnalysisResult;
  observations: Observation[];
}) {
  const [activeTab, setActiveTab] = useState<"branches" | "physics" | "adapter" | "fusion">(
    "branches",
  );
  const cm = result.crossModal;

  if (!cm) {
    return (
      <div className="p-3 font-mono text-[10px] text-muted-foreground">
        Cross-modal investigation data unavailable for this scenario.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-[10px]">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-border bg-panel">
        <button
          type="button"
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-1.5 border-r border-border px-3 py-1.5 uppercase tracking-[0.14em] transition-colors ${
            activeTab === "branches"
              ? "bg-panel-raised text-primary shadow-[inset_0_-2px_0_0_var(--primary)] font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-3 w-3" />
          Specialist Branches
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("physics")}
          className={`flex items-center gap-1.5 border-r border-border px-3 py-1.5 uppercase tracking-[0.14em] transition-colors ${
            activeTab === "physics"
              ? "bg-panel-raised text-primary shadow-[inset_0_-2px_0_0_var(--primary)] font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-3 w-3" />
          Physics Side Features
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("adapter")}
          className={`flex items-center gap-1.5 border-r border-border px-3 py-1.5 uppercase tracking-[0.14em] transition-colors ${
            activeTab === "adapter"
              ? "bg-panel-raised text-primary shadow-[inset_0_-2px_0_0_var(--primary)] font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className="h-3 w-3" />
          Alignment Adapter
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("fusion")}
          className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-[0.14em] transition-colors ${
            activeTab === "fusion"
              ? "bg-panel-raised text-primary shadow-[inset_0_-2px_0_0_var(--primary)] font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3 w-3" />
          Joint Fusion Matrix
        </button>
      </div>

      {/* Tab 1: Specialist Branches (Optical Branch vs SAR Branch) */}
      {activeTab === "branches" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Optical Branch Card */}
            <div className="border border-optical/40 bg-background p-2.5">
              <div className="flex items-center justify-between border-b border-border/80 pb-1.5">
                <span className="flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-optical">
                  <Eye className="h-3 w-3" />
                  OPTICAL SPECIALIST
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {cm.opticalBranch.runtimeMs} ms
                </span>
              </div>
              <p className="mt-1.5 text-[9px] text-muted-foreground">
                Model:{" "}
                <span className="text-foreground">
                  {cm.opticalBranch.modelName} ({cm.opticalBranch.modelVersion})
                </span>
              </p>
              <div className="mt-2 space-y-1">
                <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                  Extracted Features:
                </span>
                <ul className="space-y-0.5 text-[9px]">
                  {cm.opticalBranch.featuresExtracted.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1 text-foreground">
                      <span className="h-1 w-1 rounded-full bg-optical" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-1.5 text-[9px]">
                <span className="text-muted-foreground">Candidate Regions:</span>
                <span className="font-semibold text-foreground">
                  {cm.opticalBranch.candidateRegionsCount} clusters
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground">Branch Confidence:</span>
                <span className="font-semibold text-optical">
                  {Math.round(cm.opticalBranch.primaryConfidence * 100)}%
                </span>
              </div>
            </div>

            {/* SAR Branch Card */}
            <div className="border border-sar/40 bg-background p-2.5">
              <div className="flex items-center justify-between border-b border-border/80 pb-1.5">
                <span className="flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-sar">
                  <Radio className="h-3 w-3" />
                  SAR SPECIALIST
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {cm.sarBranch.runtimeMs} ms
                </span>
              </div>
              <p className="mt-1.5 text-[9px] text-muted-foreground">
                Model:{" "}
                <span className="text-foreground">
                  {cm.sarBranch.modelName} ({cm.sarBranch.modelVersion})
                </span>
              </p>
              <div className="mt-2 space-y-1">
                <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                  Extracted Features:
                </span>
                <ul className="space-y-0.5 text-[9px]">
                  {cm.sarBranch.featuresExtracted.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1 text-foreground">
                      <span className="h-1 w-1 rounded-full bg-sar" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-1.5 text-[9px]">
                <span className="text-muted-foreground">Candidate Regions:</span>
                <span className="font-semibold text-foreground">
                  {cm.sarBranch.candidateRegionsCount} clusters
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground">Branch Confidence:</span>
                <span className="font-semibold text-sar">
                  {Math.round(cm.sarBranch.primaryConfidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="border border-border bg-panel p-2.5 text-[9px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-[0.14em] text-foreground">
              Branch Execution Pipeline:
            </span>
            <p className="mt-1 leading-relaxed">
              Optical branch generates high-resolution multispectral boundary masks, while SAR
              branch calculates structural double-bounce and specular reflection to disambiguate
              shadows from water bodies and vegetation canopy from building roofs.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Physics Side Features */}
      {activeTab === "physics" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* SAR Physics Features */}
            <div className="border border-sar/40 bg-background p-2.5">
              <span className="font-semibold uppercase tracking-[0.14em] text-sar">
                SAR BACKSCATTER & SCATTERING
              </span>
              <dl className="mt-2 space-y-1 text-[9px]">
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <dt className="text-muted-foreground">Double Bounce Reflector:</dt>
                  <dd className="font-semibold text-sar">
                    +{cm.physicsSideFeatures.sar.doubleBounceIntensityDb} dB (Built-up)
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border/40 py-1">
                  <dt className="text-muted-foreground">Surface Roughness:</dt>
                  <dd className="capitalize text-foreground">
                    {cm.physicsSideFeatures.sar.surfaceRoughness}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border/40 py-1">
                  <dt className="text-muted-foreground">Polarization Ratio (VV/VH):</dt>
                  <dd className="text-foreground">
                    {cm.physicsSideFeatures.sar.polarizationRatioVvVh} dB
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border/40 py-1">
                  <dt className="text-muted-foreground">Dielectric Moisture:</dt>
                  <dd className="capitalize text-foreground">
                    {cm.physicsSideFeatures.sar.dielectricMoistureEstimate}
                  </dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="text-muted-foreground">Speckle Filter:</dt>
                  <dd className="text-muted-foreground">
                    {cm.physicsSideFeatures.sar.speckleFilterApplied}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Optical Physics Features */}
            <div className="border border-optical/40 bg-background p-2.5">
              <span className="font-semibold uppercase tracking-[0.14em] text-optical">
                OPTICAL SPECTRAL & TEXTURAL
              </span>
              <dl className="mt-2 space-y-1 text-[9px]">
                <div className="flex justify-between border-b border-border/40 pb-1">
                  <dt className="text-muted-foreground">NDBI (Built-up Index):</dt>
                  <dd className="font-semibold text-optical">
                    +{cm.physicsSideFeatures.optical.ndbiBuiltUpIndex.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border/40 py-1">
                  <dt className="text-muted-foreground">NDVI (Vegetation):</dt>
                  <dd className="text-foreground">
                    {cm.physicsSideFeatures.optical.ndviVegetationSuppression.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border/40 py-1">
                  <dt className="text-muted-foreground">NDWI (Water Index):</dt>
                  <dd className="text-foreground">
                    {cm.physicsSideFeatures.optical.ndwiWaterSuppression.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border/40 py-1">
                  <dt className="text-muted-foreground">Edge Density Index:</dt>
                  <dd className="text-foreground">
                    {(cm.physicsSideFeatures.optical.edgeDensity * 100).toFixed(1)}%
                  </dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="text-muted-foreground">Cloud / Shadow Occlusion:</dt>
                  <dd className="text-muted-foreground">
                    {cm.physicsSideFeatures.optical.cloudShadowOcclusionPercent}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Physics Insight Box */}
          <div className="border border-primary/50 bg-primary/5 p-2.5">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-primary">
              <Zap className="h-3 w-3" />
              PHYSICS-GUIDED INTERPRETATION INSIGHT
            </span>
            <p className="mt-1 text-[9px] leading-relaxed text-foreground">
              {cm.physicsSideFeatures.physicsInsight}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Alignment Adapter */}
      {activeTab === "adapter" && (
        <div className="space-y-2.5 border border-border bg-background p-3">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <span className="font-semibold uppercase tracking-[0.14em] text-foreground">
              HOMOGRAPHY & RESAMPLING ADAPTER
            </span>
            <span className="text-[9px] text-success">✓ SUB-PIXEL CO-REGISTRATION</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px]">
            <div>
              <span className="text-muted-foreground uppercase">Alignment Method:</span>
              <p className="font-semibold text-foreground uppercase">
                {cm.alignmentAdapter.method} + Affine Transform
              </p>
            </div>
            <div>
              <span className="text-muted-foreground uppercase">Sub-Pixel Residual Error:</span>
              <p className="font-semibold text-success">
                {cm.alignmentAdapter.subPixelResidualPx} px (Target &lt; 0.5 px)
              </p>
            </div>
            <div>
              <span className="text-muted-foreground uppercase">Resampling Interpolator:</span>
              <p className="text-foreground capitalize">
                {cm.alignmentAdapter.resamplingFilter} Filter
              </p>
            </div>
            <div>
              <span className="text-muted-foreground uppercase">Overlap Spatial Extent:</span>
              <p className="text-foreground">{cm.alignmentAdapter.coverageOverlapAreaKm2} km²</p>
            </div>
          </div>

          <p className="border-t border-border/60 pt-2 text-[9px] text-muted-foreground">
            SAR range-Doppler coordinates and optical orthorectified UTM grid are remapped into a
            canonical EPSG:4326 shared coordinate frame prior to tensor concatenation.
          </p>
        </div>
      )}

      {/* Tab 4: Joint Fusion Matrix */}
      {activeTab === "fusion" && (
        <div className="space-y-2.5 border border-border bg-background p-3">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <span className="font-semibold uppercase tracking-[0.14em] text-primary">
              CROSS-MODAL CONSENSUS MATRIX
            </span>
            <span className="border border-primary/50 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              {cm.fusion.agreementRatePercent}% AGREEMENT
            </span>
          </div>

          {/* Fusion Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
            <div className="border border-success/50 bg-success/10 p-2">
              <span className="text-muted-foreground uppercase">Consensus Regions</span>
              <p className="text-[13px] font-bold text-success">
                {cm.fusion.consensusRegionsCount}
              </p>
              <span className="text-[8px] text-muted-foreground">Dual Confirmation</span>
            </div>
            <div className="border border-optical/50 bg-optical/10 p-2">
              <span className="text-muted-foreground uppercase">Optical-Only</span>
              <p className="text-[13px] font-bold text-optical">
                {cm.fusion.opticalOnlyRegionsCount}
              </p>
              <span className="text-[8px] text-muted-foreground">Vegetated / Texture</span>
            </div>
            <div className="border border-sar/50 bg-sar/10 p-2">
              <span className="text-muted-foreground uppercase">SAR-Only</span>
              <p className="text-[13px] font-bold text-sar">{cm.fusion.sarOnlyRegionsCount}</p>
              <span className="text-[8px] text-muted-foreground">Metallic / Shadowed</span>
            </div>
          </div>

          <div className="mt-2 space-y-1 border-t border-border/60 pt-2 text-[9px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fusion Architecture:</span>
              <span className="font-semibold uppercase text-foreground">
                {cm.fusion.fusionMethod.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modality Weights:</span>
              <span className="text-foreground">
                Optical: {(cm.fusion.opticalWeight * 100).toFixed(0)}% · SAR:{" "}
                {(cm.fusion.sarWeight * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consensus Confidence:</span>
              <span className="font-bold text-primary">
                {Math.round(cm.fusion.consensusConfidence * 100)}%
              </span>
            </div>
          </div>

          <p className="text-[9px] leading-relaxed text-muted-foreground">
            {cm.fusion.fusionSummary}
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   4. PerModalityEvidenceInspector
   Displays evidence objects categorized by modality contribution
   ========================================================================= */

export function PerModalityEvidenceInspector({
  evidence,
  onSelectEvidence,
}: {
  evidence: EvidenceObject[];
  onSelectEvidence?: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "optical" | "sar" | "fused">("all");

  const filtered = evidence.filter((e) => {
    if (filter === "all") return true;
    if (filter === "optical") return e.layer === "optical" || e.type.includes("optical");
    if (filter === "sar") return e.layer === "sar" || e.type.includes("sar");
    if (filter === "fused") return e.layer === "fused" || e.type.includes("fused");
    return true;
  });

  return (
    <div className="space-y-2 font-mono text-[10px]">
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <span className="font-semibold uppercase tracking-[0.14em] text-foreground">
          PER-MODALITY EVIDENCE
        </span>
        <div className="flex items-center gap-px">
          {(["all", "fused", "optical", "sar"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] transition-colors ${
                filter === mode
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border text-muted-foreground hover:bg-panel-raised"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-1.5">
        {filtered.map((ev) => (
          <li
            key={ev.id}
            onClick={() => onSelectEvidence?.(ev.id)}
            className="cursor-pointer border border-border bg-background p-2 transition-colors hover:border-primary/60 hover:bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{ev.label}</span>
              <span
                className={`border px-1 py-0.2 text-[8px] uppercase tracking-[0.12em] ${
                  ev.layer === "optical"
                    ? "border-optical/60 text-optical"
                    : ev.layer === "sar"
                      ? "border-sar/60 text-sar"
                      : "border-primary/60 text-primary"
                }`}
              >
                {ev.layer ?? "Fused"}
              </span>
            </div>
            <p className="mt-0.5 text-[9px] text-muted-foreground">{ev.regionDescription}</p>
            <div className="mt-1 flex items-center justify-between text-[8px] text-muted-foreground">
              <span>
                {ev.sourceTool} ({ev.sourceVersion})
              </span>
              <span className="font-bold text-foreground">
                {Math.round((ev.confidence ?? 0.85) * 100)}% Conf.
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
