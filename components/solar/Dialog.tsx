"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icons";

export default function Dialog({
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const id = useId();
  useEffect(() => {
    const el = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.showModal();
    const target = el.querySelector<HTMLElement>("[data-autofocus]");
    if (target) target.focus({ preventScroll: true });
    else el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      className={"solar-dialog" + (wide ? " wide" : "")}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const b = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < b.left ||
            e.clientX > b.right ||
            e.clientY < b.top ||
            e.clientY > b.bottom
          )
            close.current();
        }
      }}
    >
      <header className="dialog-head">
        <div>
          {eyebrow && <p className="kicker">{eyebrow}</p>}
          <h2 id={id} tabIndex={-1}>
            {title}
          </h2>
        </div>
        <button
          type="button"
          className="circle-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
