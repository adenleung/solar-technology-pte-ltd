"use client";
import { useMemo, useState } from "react";
import {
  products,
  projects,
  families,
  type Product,
  type Project,
} from "./catalogue/data";
import { navItems } from "./Header";
import { Icon } from "./Icons";

export default function SiteSearch({
  product,
  project,
  section,
}: {
  product: (p: Product) => void;
  project: (p: Project) => void;
  section: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const items = useMemo(
    () => [
      ...[...navItems, ["Rooftop planner", "planner"]].map(([title, id]) => ({
        id,
        title,
        subtitle: "Page section",
        type: "Pages",
        keywords: title + " " + id,
        run: () => section(id),
      })),
      ...products.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.model + " · " + p.powerLabel,
        type: "Products",
        keywords: [
          p.name,
          p.model,
          p.powerLabel,
          p.description,
          families.find((x) => x.id === p.family)?.name,
        ].join(" "),
        run: () => product(p),
      })),
      ...projects.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.location + " · " + p.capacity,
        type: "Projects",
        keywords: [p.name, p.location, p.application, p.capacity].join(" "),
        run: () => project(p),
      })),
    ],
    [product, project, section],
  );
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const shortcuts = terms.length === 0 && filter === "All";
  const results = items.filter(
    (row) =>
      (shortcuts
        ? row.type === "Pages"
        : filter === "All" || row.type === filter) &&
      terms.every((t) => row.keywords.toLowerCase().includes(t)),
  );
  return (
    <>
      <label className="search-field">
        <Icon name="search" />
        <input
          type="search"
          value={query}
          data-autofocus
          aria-label="Search products, projects and pages"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try glass, 450 W or Singapore"
        />
      </label>
      <div className="dialog-filters">
        {["All", "Products", "Projects", "Pages"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            aria-pressed={t === filter}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="search-count" role="status">
        {shortcuts
          ? "Page shortcuts"
          : results.length +
            " " +
            (results.length === 1 ? "result" : "results")}
      </p>
      <div className="result-list">
        {results.map((r) => (
          <button key={r.type + r.id} onClick={r.run}>
            <span>
              <strong>{r.title}</strong>
              <small>{r.subtitle}</small>
            </span>
            <Icon name="arrow" size={15} />
          </button>
        ))}
        {!results.length && (
          <p>
            No matches. Try a model number, project location or product family.
          </p>
        )}
      </div>
    </>
  );
}
