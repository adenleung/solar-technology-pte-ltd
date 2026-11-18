"use client";
import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import Dialog from "./Dialog";
import Showroom, { Specifications } from "./Showroom";
import Planner from "./planner/Planner";
import { type PlannerConfig } from "./planner/plannerModel";
import {
  projects,
  products,
  solutions,
  contact,
  type Product,
  type Project,
} from "./catalogue/data";
import {
  About,
  SiteFooter,
  ProjectDirectory,
  Projects,
  Resources,
  Solutions,
  Technology,
} from "./Editorial";
import { Icon } from "./Icons";
import SiteSearch from "./SiteSearch";
import Quote from "./Quote";
import type { QuoteContext } from "@/lib/solar/quote";

type Modal =
  | { type: "search" | "projects" | "privacy" | "terms" }
  | { type: "product"; item: Product }
  | { type: "quote"; context: QuoteContext; plan?: PlannerConfig };
const defaultProduct = products.find((x) => x.id === "sp-n16b-96hg")!;
export default function SolarExperience() {
  const [item, setItem] = useState(defaultProduct),
    [project, setProject] = useState(projects[0]),
    [solution, setSolution] = useState(solutions[0].id);
  const [modal, setModal] = useState<Modal | null>(null);
  const close = () => setModal(null);
  const go = useCallback((id: string) => {
    setModal(null);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
        el.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });
  }, []);
  useEffect(() => {
    function shortcut(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        !modal &&
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !target.matches("input,textarea,select,[contenteditable=true]")
      ) {
        e.preventDefault();
        setModal({ type: "search" });
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [modal]);
  const pickProduct = useCallback(
    (p: Product) => {
      setItem(p);
      go("products");
    },
    [go],
  );
  const pickProject = useCallback(
    (p: Project) => {
      setProject(p);
      go("projects");
    },
    [go],
  );
  const quote = (context: QuoteContext = {}, plan?: PlannerConfig) =>
    setModal({ type: "quote", context, plan });
  function fromPlan(plan: PlannerConfig) {
    const chosen = products.find((p) => p.id === plan.modelId.toLowerCase());
    quote({ product: chosen?.model || "Silicon panels" }, plan);
  }
  return (
    <>
      <Header
        openSearch={() => setModal({ type: "search" })}
        openQuote={() => quote()}
        pickFamily={(id) => {
          const p = products.find((x) => x.family === id);
          if (p) pickProduct(p);
        }}
        pickSolution={(id) => {
          setSolution(id);
          go("solutions");
        }}
      />
      <main id="main">
        <Hero />
        <Showroom
          item={item}
          select={setItem}
          specs={() => setModal({ type: "product", item })}
          quote={() => quote({ product: item.model })}
        />
        <Solutions
          key={solution}
          activeId={solution}
          select={setSolution}
          quote={(building) => quote({ building })}
        />
        <Technology />
        <Planner onQuote={fromPlan} />
        <Projects
          item={project}
          select={setProject}
          open={() => setModal({ type: "projects" })}
        />
        <Resources onView={(p) => setModal({ type: "product", item: p })} />
        <About quote={() => quote()} />
      </main>
      <SiteFooter notice={(type) => setModal({ type })} />
      {modal?.type === "search" && (
        <Dialog
          title="Search the site."
          eyebrow="Products, projects & resources"
          onClose={close}
        >
          <SiteSearch
            product={pickProduct}
            project={pickProject}
            section={go}
          />
        </Dialog>
      )}
      {modal?.type === "product" && (
        <Dialog
          title={modal.item.name}
          eyebrow={modal.item.model}
          onClose={close}
          wide
        >
          <Specifications
            item={modal.item}
            quote={() => quote({ product: modal.item.model })}
          />
        </Dialog>
      )}
      {modal?.type === "projects" && (
        <Dialog
          title="Project directory."
          eyebrow="Published portfolio"
          onClose={close}
        >
          <ProjectDirectory select={pickProject} />
        </Dialog>
      )}
      {modal?.type === "quote" && (
        <Quote context={modal.context} plan={modal.plan} onClose={close} />
      )}
      {modal?.type === "privacy" && (
        <Dialog
          title="Privacy notice."
          eyebrow="About this site"
          onClose={close}
        >
          <div className="policy-copy">
            <p>
              The project form stores your contact details, project description,
              selected planner settings and any drawing you choose to upload.
              The site owner can review them against your enquiry reference.
            </p>
            <p>
              Drawings are stored privately. An hourly submission limit uses a
              temporary hashed identifier. The site does not send automatic
              emails or use marketing analytics.
            </p>
            <p>
              For a direct conversation with Solar Technology, use the published
              company email.
            </p>
            <a className="text-link" href={"mailto:" + contact.email}>
              {contact.email} <Icon name="diagonal" size={14} />
            </a>
          </div>
        </Dialog>
      )}
      {modal?.type === "terms" && (
        <Dialog title="Site terms." eyebrow="About this site" onClose={close}>
          <div className="policy-copy">
            <p>
              This private design preview uses a concept pavilion to illustrate
              solar integration. The project portfolio is identified separately
              and attributes the published information to Solar Technology.
            </p>
            <p>
              Planner results are preliminary geometric estimates. A site
              survey, engineering review and supplier quotation are needed to
              establish the final layout, structural suitability, electrical
              design, cost and performance.
            </p>
            <p>
              Manufacturer datasheets specify product ratings and conditions.
              Confirm the current variant and terms with the supplier before
              procurement.
            </p>
          </div>
        </Dialog>
      )}
    </>
  );
}
