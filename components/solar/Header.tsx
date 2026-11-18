"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import Dialog from "./Dialog";
import { families, solutions } from "./catalogue/data";

export const navItems = [
  ["Products", "products"],
  ["Solutions", "solutions"],
  ["Technology", "technology"],
  ["Projects", "projects"],
  ["Resources", "resources"],
  ["About", "about"],
] as const;
export function Brand() {
  return (
    <a
      className="brand"
      href="#top"
      aria-label="Solar Technology Singapore, home"
    >
      <img
        src="/assets/catalog/brand.webp"
        width="157"
        height="45"
        alt="Solar Technology Pte Ltd"
      />
    </a>
  );
}
type Menu = "Products" | "Solutions";
export default function Header({
  openSearch,
  openQuote,
  pickFamily,
  pickSolution,
}: {
  openSearch: () => void;
  openQuote: () => void;
  pickFamily: (id: string) => void;
  pickSolution: (id: string) => void;
}) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    const outside = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) setMenu(null);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    if (menu) document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", update);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [menu]);
  const selectMenu = (id: string) => {
    const fn = menu === "Products" ? pickFamily : pickSolution;
    setMenu(null);
    fn(id);
  };
  function open(action: () => void) {
    setMenu(null);
    setMobile(false);
    action();
  }
  return (
    <>
      <a className="skip" href="#products">
        Skip architectural sequence
      </a>
      <header
        className={"site-header" + (scrolled || menu ? " solid" : "")}
        ref={header}
        onBlur={(e) => {
          if (
            e.relatedTarget &&
            !e.currentTarget.contains(e.relatedTarget as Node)
          )
            setMenu(null);
        }}
      >
        <div className="head-inner">
          <Brand />
          <nav aria-label="Main navigation" className="desktop-nav">
            {navItems.map(([name, id]) =>
              name === "Products" || name === "Solutions" ? (
                <button
                  type="button"
                  key={id}
                  className={menu === name ? "current" : ""}
                  aria-expanded={menu === name}
                  aria-controls="head-disclosure"
                  onClick={(e) => {
                    trigger.current = e.currentTarget;
                    setMenu(menu === name ? null : name);
                  }}
                >
                  {name}
                  <Icon name="down" size={12} />
                </button>
              ) : (
                <a key={id} href={"#" + id} onClick={() => setMenu(null)}>
                  {name}
                </a>
              ),
            )}
          </nav>
          <div className="head-actions">
            <button
              className="icon-button"
              aria-label="Search site"
              onClick={() => open(openSearch)}
            >
              <Icon name="search" size={19} />
            </button>
            <button className="head-quote" onClick={() => open(openQuote)}>
              Request a quote <Icon name="diagonal" size={14} />
            </button>
            <button
              className="icon-button mobile-trigger"
              aria-label="Open navigation"
              aria-expanded={mobile}
              onClick={() => {
                setMenu(null);
                setMobile(true);
              }}
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
        {menu && (
          <div id="head-disclosure" className="mega-menu">
            <div className="mega-inner">
              <div>
                <p className="kicker">
                  {menu === "Products" ? "Product catalogue" : "Applications"}
                </p>
                <h2>
                  {menu === "Products" ? "Solar materials" : "Energy solutions"}
                </h2>
                <a
                  className="text-link"
                  href={menu === "Products" ? "#products" : "#solutions"}
                  onClick={() => setMenu(null)}
                >
                  View {menu.toLowerCase()} <Icon name="arrow" size={15} />
                </a>
              </div>
              <div className="mega-items">
                {(menu === "Products" ? families : solutions).map((x) => (
                  <button onClick={() => selectMenu(x.id)} key={x.id}>
                    <span className="mega-thumb">
                      <img
                        src={x.image.replace(".webp", "-thumb.webp")}
                        alt=""
                        decoding="async"
                      />
                    </span>
                    <span>{x.name}</span>
                    <Icon name="diagonal" size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
      {mobile && (
        <Dialog
          title="Explore"
          eyebrow="Solar Technology"
          onClose={() => setMobile(false)}
        >
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map(([name, id]) => (
              <a href={"#" + id} key={id} onClick={() => setMobile(false)}>
                {name}
                <Icon name="arrow" />
              </a>
            ))}
            <a href="#planner" onClick={() => setMobile(false)}>
              Rooftop planner
              <Icon name="arrow" />
            </a>
          </nav>
          <button className="action light" onClick={() => open(openQuote)}>
            Request a quote <Icon name="diagonal" />
          </button>
        </Dialog>
      )}
    </>
  );
}
