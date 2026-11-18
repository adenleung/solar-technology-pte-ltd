"use client";

import { families, products, type Product } from "./catalogue/data";
import { Icon } from "./Icons";

export default function Showroom({
  item,
  select,
  specs,
  quote,
}: {
  item: Product;
  select: (p: Product) => void;
  specs: () => void;
  quote: () => void;
}) {
  const f = families.find((x) => x.id === item.family)!;
  const variants = products.filter((p) => p.family === f.id);
  const position = variants.indexOf(item);
  const change = (diff: number) =>
    select(variants[(position + diff + variants.length) % variants.length]);
  return (
    <section
      className="showroom section-shell ink"
      id="products"
      aria-labelledby="catalog-heading"
    >
      <div className="section-intro">
        <div>
          <p className="kicker">
            <span className="short-rule" />
            Product showroom
          </p>
          <h2 id="catalog-heading">The solar collection.</h2>
        </div>
        <p>
          Explore glass, tiles and silicon modules, with technical
          specifications for each model.
        </p>
      </div>
      <div className="family-bar" aria-label="Filter by product family">
        {[families[2], families[0], families[1]].map((x) => (
          <button
            key={x.id}
            aria-pressed={x.id === f.id}
            onClick={() => select(products.find((p) => p.family === x.id)!)}
          >
            {x.name}
            <span>
              {String(
                products.filter((p) => p.family === x.id).length,
              ).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
      <div className="product-stage">
        <div className="product-photo" key={item.id}>
          <div className="specimen-grid" />
          <img
            loading="lazy"
            decoding="async"
            src={item.image}
            alt={item.alt}
            width="560"
            height="460"
          />
          <span className="photo-caption">Manufacturer product image</span>
        </div>
        <div className="product-info">
          <p className="kicker">{f.name}</p>
          <h3>{item.name}</h3>
          <p className="model-id">{item.model}</p>
          <p>{item.description}</p>
          <div className="product-power">
            <span>Rated output</span>
            <strong>{item.powerLabel}</strong>
          </div>
          <label className="select-label">
            Select model
            <select
              value={item.id}
              onChange={(e) => {
                const next = products.find((p) => p.id === e.target.value);
                if (next) select(next);
              }}
            >
              {variants.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.model}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-actions">
            <button className="action light" onClick={specs}>
              View specifications <Icon name="plus" size={15} />
            </button>
            <button className="text-link" onClick={quote}>
              Enquire <Icon name="diagonal" size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="gallery-foot">
        <span>
          {f.name} <i>/</i> <b>{String(position + 1).padStart(2, "0")}</b> of{" "}
          {String(variants.length).padStart(2, "0")}
        </span>
        <span className="arrows">
          <button
            className="circle-button"
            aria-label="Previous product"
            onClick={() => change(-1)}
          >
            <Icon name="back" size={16} />
          </button>
          <button
            className="circle-button"
            aria-label="Next product"
            onClick={() => change(1)}
          >
            <Icon name="forward" size={16} />
          </button>
        </span>
      </div>
    </section>
  );
}
export function Specifications({
  item,
  quote,
}: {
  item: Product;
  quote: () => void;
}) {
  return (
    <>
      <p className="modal-intro">{item.description}</p>
      <dl className="spec-list">
        {item.specs.map((s, i) => (
          <div key={i}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="inline-actions">
        <a
          className="action light"
          href={item.datasheet}
          target="_blank"
          rel="noreferrer"
        >
          Open datasheet <Icon name="diagonal" size={15} />
        </a>
        <button className="text-link" onClick={quote}>
          Request a quote <Icon name="arrow" size={16} />
        </button>
      </div>
    </>
  );
}
