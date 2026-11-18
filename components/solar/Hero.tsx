"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Scene from "./architecture/Scene";
import { Icon } from "./Icons";
import { siliconDefinitions } from "../../lib/solar/siliconModules.ts";

const openingModule = siliconDefinitions.find((m) => m.id === "sp-n16b-96hg")!;

const steps = [
  {
    at: 0,
    title: "Energy, engineered into architecture.",
    label: "Solar systems for modern buildings",
    detail: "",
  },
  {
    at: 0.075,
    title: "Every great system begins with design.",
    label: "01 / 07   ·   Architectural design",
    detail:
      "Solar design starts with the orientation, form and use of the building.",
  },
  {
    at: 0.155,
    title: "From architecture to engineering.",
    label: "02 / 07   ·   Architectural sketch",
    detail: "The roof planes, glazing and structural grid come into view.",
  },
  {
    at: 0.29,
    title: "Built on precision.",
    label: "03 / 07   ·   Structural study",
    detail: "Roof construction and load capacity shape the mounting design.",
  },
  {
    at: 0.435,
    title: "Integrated with purpose.",
    label: "04 / 07   ·   Solar installation",
    detail:
      "Mounting rails align with the roof before each row of modules settles into place.",
  },
  {
    at: 0.622,
    title: "Performance, layer by layer.",
    label: "05 / 07   ·   Module anatomy",
    detail:
      "Explore the glass and TOPCon cell assembly of the SP-N16B/96HG silicon module.",
  },
  {
    at: 0.78,
    title: "Architecture that generates energy.",
    label: "06 / 07   ·   Energy in operation",
    detail:
      "Solar modules supply direct current. An inverter converts it to alternating current for the building.",
  },
  {
    at: 0.917,
    title: "One building. One solar system.",
    label: "07 / 07   ·   Reassembly",
    detail: "Explore the materials or plan a system for your own roof.",
  },
];
const chapters = [
  { name: "Design", desc: "Architecture & planning", at: 0 },
  { name: "Structure", desc: "Roof & load assessment", at: 0.33 },
  { name: "Integration", desc: "Modules & mounting", at: 0.48 },
  { name: "Operation", desc: "Energy & performance", at: 0.83 },
];
type TriggerInstance = { kill: () => void };
type TriggerAPI = {
  create: (vars: {
    trigger: HTMLElement;
    start: string;
    end: () => string;
    onUpdate: (self: { progress: number }) => void;
    invalidateOnRefresh: boolean;
  }) => TriggerInstance;
  refresh: () => void;
};
type MotionWindow = Window & {
  gsap?: { registerPlugin: (p: TriggerAPI) => void };
  ScrollTrigger?: TriggerAPI;
};
let motionLibraries: Promise<TriggerAPI | null> | undefined;
function loadMotion() {
  if (motionLibraries) return motionLibraries;
  const script = (url: string) =>
    new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = url;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = reject;
      document.head.appendChild(el);
    });
  motionLibraries = (async () => {
    const w = window as MotionWindow;
    await script("/assets/vendor/gsap.min.js");
    await script("/assets/vendor/ScrollTrigger.min.js");
    if (!w.ScrollTrigger || !w.gsap) return null;
    w.gsap.registerPlugin(w.ScrollTrigger);
    return w.ScrollTrigger;
  })().catch(() => null);
  return motionLibraries;
}
export default function Hero() {
  const outer = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    change();
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const el = outer.current!,
      box = pinned.current!;
    if (reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(0);
      return;
    }
    let active = true,
      tick = 0,
      controller: TriggerInstance | undefined;
    const span = () => Math.max(1, el.offsetHeight - box.offsetHeight);
    const update = (n: number) => setProgress(Math.max(0, Math.min(1, n)));
    const native = () => {
      if (!tick)
        tick = requestAnimationFrame(() => {
          tick = 0;
          update(-el.getBoundingClientRect().top / span());
        });
    };
    native();
    window.addEventListener("scroll", native, { passive: true });
    window.addEventListener("resize", native);
    loadMotion().then((api) => {
      if (!active || !api) return;
      controller = api.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + span(),
        invalidateOnRefresh: true,
        onUpdate: (self) => update(self.progress),
      });
      api.refresh();
      window.removeEventListener("scroll", native);
    });
    return () => {
      active = false;
      controller?.kill();
      cancelAnimationFrame(tick);
      window.removeEventListener("scroll", native);
      window.removeEventListener("resize", native);
    };
  }, [reduced]);
  const step = steps.reduce(
    (last, s) => (progress >= s.at ? s : last),
    steps[0],
  );
  const current =
    progress < 0.28 ? 0 : progress < 0.43 ? 1 : progress < 0.78 ? 2 : 3;
  function jump(at: number) {
    if (!outer.current || !pinned.current) return;
    window.scrollTo({
      top:
        window.scrollY +
        outer.current.getBoundingClientRect().top +
        at * (outer.current.offsetHeight - pinned.current.offsetHeight),
      behavior: "instant",
    });
  }
  const teaser = reduced ? 0 : Math.max(0, 1 - progress / 0.085);
  return (
    <section
      ref={outer}
      className="film-track"
      id="top"
      aria-label="Solar architecture, from design to operation"
    >
      <div
        className="film-sticky"
        ref={pinned}
        style={{ "--intro-exposure": teaser } as CSSProperties}
      >
        <div className="film-stage">
          <Scene progress={progress} />
        </div>
        <div className="film-shade" aria-hidden="true" />
        <div className="film-copy" key={step.at}>
          <p className="film-kicker">
            <span />
            {step.label}
            <span />
          </p>
          {step === steps[0] ? (
            <h1>
              Energy, engineered <strong>into architecture.</strong>
            </h1>
          ) : (
            <>
              <h1 className="visually-hidden">
                Energy, engineered into architecture.
              </h1>
              <h2>{step.title}</h2>
            </>
          )}
          {step.detail && <p className="film-detail">{step.detail}</p>}
          {step === steps[0] && (
            <div className="film-actions">
              <a href="#technology">
                Explore technology <Icon name="diagonal" size={14} />
              </a>
              <i aria-hidden="true" />
              <a href="#solutions">
                View solar solutions <Icon name="arrow" size={14} />
              </a>
            </div>
          )}
          {step === steps[7] && (
            <div className="film-actions">
              <a href="#solutions">
                Explore solutions <Icon name="diagonal" size={14} />
              </a>
              <i aria-hidden="true" />
              <a href="#planner">
                Plan your project <Icon name="arrow" size={14} />
              </a>
            </div>
          )}
        </div>
        <div className="film-controls">
          <div className="chapter-rail">
            <div className="rail-line" aria-hidden="true">
              <span
                style={{
                  width: Math.max(1, Math.min(100, progress * 100)) + "%",
                }}
              />
            </div>
            {chapters.map((c, i) => (
              <button
                onClick={() => jump(c.at)}
                key={c.name}
                aria-current={current === i ? "step" : undefined}
                aria-label={"Jump to " + c.name}
                className={"chapter " + (i === current ? "active" : "")}
              >
                <span className="chapter-dot" />
                <span className="chapter-title">
                  <b>0{i + 1}</b>
                  {c.name}
                </span>
                <span className="chapter-desc">{c.desc}</span>
              </button>
            ))}
          </div>
          <div className="film-foot">
            <span>Architectural concept</span>
            <a
              className="scroll-cue"
              aria-label="Scroll to explore the architectural sketch"
              href="#film-description"
              onClick={(e) => {
                if (!reduced) {
                  e.preventDefault();
                  if (progress >= 0.91)
                    document.getElementById("products")?.scrollIntoView();
                  else
                    jump(
                      steps.find((s) => s.at > progress + 0.025)?.at ?? 0.94,
                    );
                }
              }}
            >
              <i />
              {progress > 0.91 ? "Explore the collection" : "Scroll to explore"}
            </a>
            <a href="#products">
              Skip film <Icon name="diagonal" size={13} />
            </a>
          </div>
        </div>
        {teaser > 0 && (
          <aside
            className="film-plan"
            aria-label="Project planning"
            aria-hidden={teaser < 0.5}
            inert={teaser < 0.5}
          >
            <div className="plan-band-inner">
              <div className="band-heading">
                <p className="kicker">
                  <span className="short-rule" />
                  Project planning
                </p>
                <a href="#planner">
                  <h2>Plan your solar project.</h2>
                  <Icon name="diagonal" size={22} />
                </a>
                <p>Explore a module layout for your roof.</p>
              </div>
              <div className="band-product">
                <p>
                  {openingModule.model} <span> / </span> Published module data
                </p>
                <div className="band-values">
                  <div>
                    <strong>{openingModule.high} W</strong>
                    <span>Peak output</span>
                  </div>
                  <div>
                    <strong>{openingModule.highEfficiency}%</strong>
                    <span>Max. efficiency</span>
                  </div>
                  <div>
                    <strong>{openingModule.weight} kg</strong>
                    <span>Module weight</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
      <div className="film-transcript" id="film-description">
        <details>
          <summary>Read the architectural sequence</summary>
          <ol>
            {steps.slice(1).map((s) => (
              <li key={s.at}>
                <strong>{s.title}</strong> {s.detail}
              </li>
            ))}
          </ol>
        </details>
      </div>
    </section>
  );
}
