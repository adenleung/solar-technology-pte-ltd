"use client";

import { useId, useState } from "react";
import RoofDrawing, { type DrawingView } from "./RoofDrawing";
import {
  BUILDINGS,
  calculateLayout,
  DEFAULT_PLAN,
  LIMITS,
  MODULES,
  MOUNTS,
  parsePlannerConfig,
  PITCH_DEGREES,
  ROOFS,
  SHAPES,
  SHEET_BASE,
  type PlannerConfig,
} from "./plannerModel";
import "./planner.css";

type PlannerProps = { onQuote: (config: PlannerConfig) => void };
const numberFormat = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 2,
});
const zoomSteps = [1, 1.24, 1.55];

function Icon({ type }: { type: "rotate" | "zoomIn" | "zoomOut" | "arrow" }) {
  const paths = {
    rotate: "M4 11a8 8 0 1 1 2 5.3M4 5v6h6",
    zoomIn: "M12 5v14M5 12h14",
    zoomOut: "M5 12h14",
    arrow: "M5 12h14m-6-6 6 6-6 6",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={paths[type]}
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Planner({ onQuote }: PlannerProps) {
  const uid = `plan-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [draft, setDraft] = useState<PlannerConfig>(DEFAULT_PLAN);
  const [area, setArea] = useState(String(DEFAULT_PLAN.roofArea));
  const [yieldText, setYieldText] = useState("");
  const [view, setView] = useState<DrawingView>("axon");
  const [quarterTurns, setQuarterTurns] = useState(0);
  const [zoomStep, setZoomStep] = useState(0);
  const change = <K extends keyof PlannerConfig>(
    key: K,
    value: PlannerConfig[K],
  ) => setDraft((previous) => ({ ...previous, [key]: value }));
  const areaNumber = area.trim() === "" ? NaN : Number(area);
  const yieldNumber = yieldText.trim() === "" ? null : Number(yieldText);
  const areaOK =
    Number.isFinite(areaNumber) &&
    areaNumber >= LIMITS.roofMin &&
    areaNumber <= LIMITS.roofMax;
  const yieldOK =
    yieldNumber === null ||
    (Number.isFinite(yieldNumber) &&
      yieldNumber >= LIMITS.yieldMin &&
      yieldNumber <= LIMITS.yieldMax);
  const config = parsePlannerConfig({
    ...draft,
    roofArea: areaNumber,
    annualYield: yieldNumber,
  });
  // The drawing can still update while the visitor edits an optional annual yield.
  const drawingPlan = areaOK
    ? {
        ...draft,
        roofArea: areaNumber,
        annualYield: yieldOK ? yieldNumber : null,
      }
    : null;
  const layout = drawingPlan ? calculateLayout(drawingPlan) : null;
  const model = MODULES.find((item) => item.id === draft.modelId) ?? MODULES[0];
  const switchRoof = (value: PlannerConfig["roofType"]) =>
    setDraft((old) => ({
      ...old,
      roofType: value,
      mounting: value === "pitched" ? "flush" : "rack",
    }));
  const annual = layout?.annualKwh;

  return (
    <section className="planner" id="planner" aria-labelledby={`${uid}-title`}>
      <div className="pl-inner">
        <div className="pl-intro">
          <div>
            <p className="pl-eyebrow">Rooftop planner</p>
            <h2 id={`${uid}-title`}>Plan your solar project.</h2>
          </div>
          <p className="pl-lead">
            Fit a module array to your roof area. Carry the layout and its
            assumptions into a technical proposal.
          </p>
        </div>
        <div className="pl-board">
          <div className="pl-controls">
            <h3>Roof configuration</h3>
            <div className="pl-controls-grid">
              <label className="pl-field">
                <span>Building type</span>
                <select
                  value={draft.buildingType}
                  onChange={(event) =>
                    change(
                      "buildingType",
                      event.target.value as PlannerConfig["buildingType"],
                    )
                  }
                >
                  {Object.entries(BUILDINGS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pl-field">
                <span>Roof type</span>
                <select
                  value={draft.roofType}
                  onChange={(event) =>
                    switchRoof(event.target.value as PlannerConfig["roofType"])
                  }
                >
                  {Object.entries(ROOFS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pl-field">
                <span>Roof surface area</span>
                <span className="pl-input-unit">
                  <input
                    type="number"
                    min={LIMITS.roofMin}
                    max={LIMITS.roofMax}
                    step="any"
                    inputMode="decimal"
                    required
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    aria-invalid={!areaOK}
                    aria-describedby={!areaOK ? `${uid}-area-error` : undefined}
                  />
                  <span>m²</span>
                </span>
              </label>
              {!areaOK && (
                <p className="pl-error" id={`${uid}-area-error`}>
                  Enter a roof area from 1 to 10,000 m².
                </p>
              )}
              <label className="pl-field pl-range">
                <span>
                  Usable area <output>{draft.usablePercent}%</output>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={draft.usablePercent}
                  onChange={(event) =>
                    change("usablePercent", Number(event.target.value))
                  }
                  aria-valuetext={`${draft.usablePercent} percent`}
                />
              </label>
              <label className="pl-field pl-span">
                <span>Photovoltaic module</span>
                <select
                  value={draft.modelId}
                  onChange={(event) => change("modelId", event.target.value)}
                >
                  {MODULES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.watts} W · {item.id}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <details className="pl-disclosure pl-more">
              <summary>Mounting &amp; storage</summary>
              <div>
                <label className="pl-field">
                  <span>Mounting layout</span>
                  <select
                    value={draft.mounting}
                    onChange={(event) =>
                      change(
                        "mounting",
                        event.target.value as PlannerConfig["mounting"],
                      )
                    }
                  >
                    {Object.entries(MOUNTS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pl-check">
                  <input
                    type="checkbox"
                    checked={draft.storageInterest}
                    onChange={(event) =>
                      change("storageInterest", event.target.checked)
                    }
                  />
                  <span>Include battery storage in my enquiry</span>
                </label>
              </div>
            </details>
          </div>
          <div className="pl-canvas">
            <div className="pl-canvas-top">
              <div className="pl-canvas-caption">Roof drawing</div>
              <div
                className="pl-view-switch"
                role="group"
                aria-label="Drawing view"
              >
                <button
                  type="button"
                  aria-pressed={view === "axon"}
                  onClick={() => setView("axon")}
                >
                  3D view
                </button>
                <button
                  type="button"
                  aria-pressed={view === "plan"}
                  onClick={() => setView("plan")}
                >
                  Plan view
                </button>
              </div>
            </div>
            <div className="pl-drawing-wrap">
              {layout && drawingPlan ? (
                <RoofDrawing
                  plan={drawingPlan}
                  layout={layout}
                  view={view}
                  angle={quarterTurns}
                  zoom={zoomSteps[zoomStep]}
                />
              ) : (
                <p className="pl-no-drawing">
                  Enter a valid roof area to draw your layout.
                </p>
              )}
            </div>
            <div className="pl-canvas-foot">
              <div className="pl-legend">
                <span className="pl-key-usable" aria-hidden="true" /> Usable
                roof <span className="pl-key-module" aria-hidden="true" />{" "}
                Modules
              </div>
              <div
                className="pl-tools"
                role="group"
                aria-label="Drawing controls"
              >
                <button
                  type="button"
                  aria-label="Rotate drawing 90 degrees"
                  title="Rotate 90°"
                  onClick={() => setQuarterTurns((turn) => (turn + 1) % 4)}
                  disabled={!layout}
                >
                  <Icon type="rotate" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom out of drawing"
                  title="Zoom out"
                  onClick={() => setZoomStep((i) => Math.max(0, i - 1))}
                  disabled={!layout || zoomStep === 0}
                >
                  <Icon type="zoomOut" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom into drawing"
                  title="Zoom in"
                  onClick={() =>
                    setZoomStep((i) => Math.min(zoomSteps.length - 1, i + 1))
                  }
                  disabled={!layout || zoomStep === zoomSteps.length - 1}
                >
                  <Icon type="zoomIn" />
                </button>
              </div>
            </div>
            <span className="pl-sr" role="status">
              {view === "plan" ? "Plan view" : "3D view"}, rotation{" "}
              {quarterTurns * 90}°, zoom {Math.round(zoomSteps[zoomStep] * 100)}
              %.
            </span>
          </div>
          <div className="pl-results">
            <h3>System estimate</h3>
            <div className="pl-capacity">
              <span className="pl-metric-name">Installed DC capacity</span>
              <p>
                {layout ? numberFormat.format(layout.capacityKw) : "—"}{" "}
                <span>kWp</span>
              </p>
            </div>
            <dl className="pl-secondary">
              <div>
                <dt>Module count</dt>
                <dd>
                  {layout ? numberFormat.format(layout.moduleCount) : "—"}
                </dd>
              </div>
              <div>
                <dt>Usable roof</dt>
                <dd>
                  {layout
                    ? `${numberFormat.format(layout.usableDepth * layout.usableWidth)} m²`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Annual generation</dt>
                <dd>
                  {annual != null ? `${numberFormat.format(annual)} kWh` : "—"}
                </dd>
              </div>
            </dl>
            <span className="pl-sr" role="status">
              {layout
                ? `${numberFormat.format(layout.capacityKw)} kilowatts peak, ${layout.moduleCount} modules${annual != null ? `, estimated ${numberFormat.format(annual)} kilowatt-hours a year` : ""}.`
                : "Awaiting a valid roof area."}
            </span>
            {layout?.moduleCount === 0 && (
              <p className="pl-fit-note">
                A whole module does not fit this footprint. Adjust the roof area
                or usable share.
              </p>
            )}
            <details className="pl-disclosure pl-yield">
              <summary>
                {yieldNumber === null
                  ? "Add a yield assumption"
                  : "Edit yield assumption"}
              </summary>
              <div>
                <label className="pl-field">
                  <span>Annual yield (kWh/kWp)</span>
                  <input
                    type="number"
                    min="0"
                    max={LIMITS.yieldMax}
                    step="any"
                    inputMode="decimal"
                    value={yieldText}
                    onChange={(event) => setYieldText(event.target.value)}
                    aria-invalid={!yieldOK}
                    aria-describedby={`${uid}-yield-hint`}
                  />
                </label>
                <p
                  id={`${uid}-yield-hint`}
                  className={yieldOK ? "pl-help" : "pl-error"}
                >
                  {yieldOK
                    ? "Use a site-specific value to estimate annual energy."
                    : "Enter a value from 0 to 3,000 kWh/kWp, or leave it empty."}
                </p>
              </div>
            </details>
            <button
              className="pl-quote"
              type="button"
              disabled={!config}
              onClick={() => config && onQuote(config)}
            >
              Request a technical proposal <Icon type="arrow" />
            </button>
          </div>
        </div>
        <details className="pl-disclosure pl-method">
          <summary>How this estimate is calculated</summary>
          <div>
            <p>
              The {BUILDINGS[draft.buildingType].toLowerCase()} preset uses one
              rectangular roof plane with a{" "}
              {SHAPES[draft.buildingType].toFixed(1)}∶1 length-to-depth ratio.
              Roof area is measured along the surface. The drawing illustrates{" "}
              {draft.roofType === "pitched"
                ? `a ${PITCH_DEGREES}° single pitch`
                : "a flat plane"}
              . The usable share defines a centred rectangle for modules.
            </p>
            <p>
              The planner fits whole modules in both orientations and uses the
              layout with the higher count. It allows 4 cm between columns and{" "}
              {draft.mounting === "rack" ? "45" : "4"} cm between rows. These
              are layout assumptions. Shading, access routes, wind loads, roof
              condition and mount compatibility require a site assessment.
            </p>
            <p>
              Capacity equals module count × {model.watts} W ÷ 1,000. Annual
              energy multiplies this capacity by the yield you enter. Storage
              interest is recorded with the proposal. {model.id} measures{" "}
              {model.lengthMm.toLocaleString("en-SG")} ×{" "}
              {model.widthMm.toLocaleString("en-SG")} mm.{" "}
              <a
                href={SHEET_BASE + model.sheet}
                target="_blank"
                rel="noopener noreferrer"
              >
                Manufacturer datasheet <span aria-hidden="true">↗</span>
              </a>
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
