"use client";

import { useState } from "react";
import {
  applications,
  solutions,
  contact,
  families,
  products,
  projects,
  sources,
  type Project,
  type Product,
} from "./catalogue/data";
import { Icon } from "./Icons";

export function Solutions({
  activeId,
  select,
  quote,
}: {
  activeId: string;
  select: (id: string) => void;
  quote: (type: string) => void;
}) {
  const active = solutions.find((s) => s.id === activeId) || solutions[0];
  const [appId, setApp] = useState<string | null>(null);
  const app = applications.find((a) => a.id === appId);
  const onSelect = (id: string) => {
    setApp(null);
    select(id);
  };
  return (
    <section
      id="solutions"
      className="section-shell paper"
      aria-labelledby="solutions-heading"
    >
      <div className="section-intro">
        <div>
          <p className="kicker">
            <span className="short-rule" />
            Solar solutions
          </p>
          <h2 id="solutions-heading">Designed for the site.</h2>
        </div>
        <p>
          Start with the building, the available surface and the way energy will
          be used.
        </p>
      </div>
      <div className="solutions-layout">
        <div className="market-list">
          {solutions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              aria-pressed={active.id === s.id}
            >
              <span className="market-no">0{i + 1}</span>
              <span>{s.name}</span>
              <Icon name={active.id === s.id ? "arrow" : "diagonal"} />
            </button>
          ))}
          <div className="solution-caption">
            <p>{active.description}</p>
            <button
              className="text-link"
              onClick={() =>
                quote(
                  active.id === "utility"
                    ? "Other"
                    : active.id === "commercial"
                      ? "Commercial"
                      : "Residential",
                )
              }
            >
              Discuss this project <Icon name="diagonal" size={15} />
            </button>
          </div>
        </div>
        <figure className="solution-figure">
          <img
            src={app ? app.image : active.image}
            alt={
              app
                ? app.name + " photovoltaic application"
                : active.name + " solar installation example"
            }
            loading="lazy"
            width="960"
            height="590"
          />
          <figcaption>
            <span>{app ? app.name + " application" : active.name}</span>
            <span>Solar Technology imagery</span>
          </figcaption>
        </figure>
      </div>
      <div className="application-strip">
        <span>Architectural applications</span>
        <div>
          {applications.map((a) => (
            <button
              key={a.id}
              aria-pressed={app?.id === a.id}
              onClick={() => setApp(app?.id === a.id ? null : a.id)}
            >
              {a.name}
              <Icon name="plus" size={12} />
            </button>
          ))}
        </div>
      </div>
      {app && <p className="application-detail">{app.description}</p>}
    </section>
  );
}
const tech = [
  {
    id: "silicon",
    title: "Double-glass silicon",
    text: "The SP-N16B/96HG contains 96 TOPCon silicon cells between two 2.0 mm glass faces. Its aluminium frame supports the module. The datasheet lists front-side ratings from 435 to 450 W under standard test conditions.",
    image: "/assets/catalog/module-detail.webp",
    alt: "Close view of a Solar N Plus silicon module",
    link: products.find((p) => p.id === "sp-n16b-96hg")!.datasheet,
  },
  {
    id: "glass",
    title: "Thin-film power glass",
    text: "COM-M1 uses a thin cadmium telluride coating on glass. A low-iron front pane, encapsulant and rear pane form a photovoltaic building material that can carry a colour or pattern.",
    image: "/assets/catalog/glass-marble.webp",
    alt: "Manufacturer views of COM-M1 architectural power glass",
    link: products.find((p) => p.id === "glass-marble")!.datasheet,
  },
  {
    id: "power",
    title: "From sunlight to building power",
    text: "A photovoltaic array produces direct current. An inverter converts it into alternating current for building loads. Storage and export depend on the equipment and connection selected for the project.",
    image: "/assets/catalog/singapore-silicon.webp",
    alt: "Rooftop silicon array in Singapore",
    link: "https://www.energy.gov/cmei/systems/solar-photovoltaic-system-design-basics",
  },
];
export function Technology() {
  const [active, setActive] = useState(tech[0]);
  return (
    <section className="section-shell tech-section" id="technology">
      <div className="section-intro">
        <div>
          <p className="kicker">
            <span className="short-rule" />
            Technology
          </p>
          <h2>Inside the system.</h2>
        </div>
        <a className="text-link" href="#top">
          Replay the architectural film <Icon name="diagonal" size={15} />
        </a>
      </div>
      <div className="tech-layout">
        <figure className={"tech-figure " + active.id}>
          <img
            loading="lazy"
            src={active.image}
            alt={active.alt}
            width="1024"
            height="600"
          />
          <figcaption>{active.title}</figcaption>
        </figure>
        <div className="tech-tabs">
          {tech.map((t, i) => (
            <div key={t.id}>
              <button
                aria-expanded={active.id === t.id}
                aria-controls={"topic-" + t.id}
                onClick={() => setActive(t)}
              >
                <span className="market-no">0{i + 1}</span>
                {t.title}
                <Icon name={active.id === t.id ? "minus" : "plus"} size={17} />
              </button>
              <div hidden={active.id !== t.id} id={"topic-" + t.id}>
                <p>{t.text}</p>
                <a
                  className="text-link"
                  href={t.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.id === "power"
                    ? "Read the system guide"
                    : "Read the datasheet"}{" "}
                  <Icon name="diagonal" size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Projects({
  item,
  select,
  open,
}: {
  item: Project;
  select: (p: Project) => void;
  open: () => void;
}) {
  const pos = projects.indexOf(item);
  const move = (n: number) =>
    select(projects[(pos + n + projects.length) % projects.length]);
  return (
    <section className="section-shell projects-section paper" id="projects">
      <div className="section-intro">
        <div>
          <p className="kicker">
            <span className="short-rule" />
            Project portfolio
          </p>
          <h2>Solar in practice.</h2>
        </div>
        <p>
          Documented installations from Solar Technology’s published portfolio.
        </p>
      </div>
      <div className="project-feature">
        <figure>
          <img
            loading="lazy"
            decoding="async"
            src={item.image}
            alt={item.alt}
            width="1100"
            height="680"
          />
        </figure>
        <div className="project-description">
          <p className="kicker">
            <Icon name="pin" size={15} />
            {item.location}
          </p>
          <h3>{item.name}</h3>
          <dl>
            <div>
              <dt>Published capacity</dt>
              <dd>{item.capacity}</dd>
            </div>
            <div>
              <dt>Application</dt>
              <dd>{item.application}</dd>
            </div>
          </dl>
          <a
            className="text-link"
            href={item.source}
            target="_blank"
            rel="noreferrer"
          >
            View project source <Icon name="diagonal" size={15} />
          </a>
        </div>
      </div>
      <div className="gallery-foot">
        <button className="text-link" onClick={open}>
          Browse all {projects.length} projects <Icon name="plus" size={15} />
        </button>
        <span className="arrows">
          <span className="position">
            {String(pos + 1).padStart(2, "0")} / {projects.length}
          </span>
          <button
            aria-label="Previous project"
            className="circle-button"
            onClick={() => move(-1)}
          >
            <Icon name="back" size={16} />
          </button>
          <button
            aria-label="Next project"
            className="circle-button"
            onClick={() => move(1)}
          >
            <Icon name="forward" size={16} />
          </button>
        </span>
      </div>
    </section>
  );
}
export function ProjectDirectory({ select }: { select: (p: Project) => void }) {
  const [query, setQuery] = useState("");
  const matches = projects.filter((p) =>
    (p.location + " " + p.name + " " + p.application + " " + p.capacity)
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <label className="search-field">
        <Icon name="search" />
        <input
          aria-label="Find projects"
          data-autofocus
          placeholder="Search by place or application"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <p className="search-count">{matches.length} projects</p>
      <div className="result-list">
        {matches.map((p) => (
          <button key={p.id} onClick={() => select(p)}>
            <img src={p.image} alt="" loading="lazy" />
            <span>
              <strong>{p.name}</strong>
              <small>
                {p.location} · {p.capacity}
              </small>
            </span>
            <Icon name="arrow" size={16} />
          </button>
        ))}
        {!matches.length && <p>No projects match this search.</p>}
      </div>
    </>
  );
}
export function Resources({ onView }: { onView: (p: Product) => void }) {
  const [family, setFamily] = useState("glass");
  const files = products.filter((p) => p.family === family);
  return (
    <section className="section-shell resource-section" id="resources">
      <div className="section-intro">
        <div>
          <p className="kicker">
            <span className="short-rule" />
            Technical resources
          </p>
          <h2>The datasheet library.</h2>
        </div>
        <p>
          Compare published ratings, dimensions, materials and warranty terms by
          model.
        </p>
      </div>
      <div className="resources-layout">
        <label className="select-label">
          Product family
          <select value={family} onChange={(e) => setFamily(e.target.value)}>
            {families.map((f) => (
              <option value={f.id} key={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <div className="resource-list">
          {files.map((p) => (
            <div key={p.id}>
              <span className="file-glyph">
                <Icon name="file" size={19} />
              </span>
              <div>
                <button onClick={() => onView(p)}>{p.name}</button>
                <small>{p.model}</small>
              </div>
              <a
                href={p.datasheet}
                aria-label={"Open " + p.name + " PDF datasheet"}
                target="_blank"
                rel="noreferrer"
              >
                PDF <Icon name="diagonal" size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function About({ quote }: { quote: () => void }) {
  return (
    <section className="closing" id="about">
      <picture>
        <source
          srcSet="/assets/facade-dusk-750.webp"
          media="(max-width:650px)"
        />
        <img
          loading="lazy"
          width="1536"
          height="650"
          alt=""
          src="/assets/facade-dusk-1536.webp"
        />
      </picture>
      <div className="closing-copy">
        <p className="kicker">
          <span className="short-rule" />
          Solar Technology Singapore
        </p>
        <h2>
          Let’s engineer
          <br />
          what’s next.
        </h2>
        <p>
          Bring us your roof plan, façade concept or site brief. Solar
          Technology’s services span design, supply, installation and ongoing
          maintenance.
        </p>
        <div className="inline-actions">
          <button className="action light" onClick={quote}>
            Start your project <Icon name="diagonal" size={16} />
          </button>
          <a className="text-link" href={"mailto:" + contact.email}>
            Speak to the team <Icon name="arrow" size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
export function SiteFooter({
  notice,
}: {
  notice: (id: "privacy" | "terms") => void;
}) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <a href="#top" className="footer-brand">
            <img
              src={contact.logo}
              alt={contact.company}
              width="165"
              height="54"
            />
          </a>
          <p>
            Photovoltaic materials and building-integrated solar solutions in
            Singapore.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          {[
            ["Products", "products"],
            ["Solutions", "solutions"],
            ["Projects", "projects"],
            ["Rooftop planner", "planner"],
          ].map(([t, id]) => (
            <a href={"#" + id} key={id}>
              {t}
            </a>
          ))}
        </div>
        <div>
          <h3>Resources</h3>
          <a href="#technology">Technology</a>
          <a href="#resources">Datasheets</a>
          <a href={sources.home} target="_blank" rel="noreferrer">
            Company website <Icon name="diagonal" size={12} />
          </a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <Icon name="diagonal" size={12} />
          </a>
        </div>
        <div>
          <h3>Get in touch</h3>
          <a href={"mailto:" + contact.email}>{contact.email}</a>
          <a href={"tel:" + contact.phone}>{contact.displayPhone}</a>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp <Icon name="diagonal" size={12} />
          </a>
          <address>{contact.address}</address>
        </div>
      </div>
      <div className="footer-floor">
        <span>© {new Date().getUTCFullYear()} Solar Technology Pte. Ltd.</span>
        <div>
          <button onClick={() => notice("privacy")}>Privacy notice</button>
          <button onClick={() => notice("terms")}>Site terms</button>
        </div>
        <a href="#top">
          Back to top <Icon name="diagonal" size={14} />
        </a>
      </div>
    </footer>
  );
}
