"use client";

import { useRef, useState, type FormEvent } from "react";
import Dialog from "./Dialog";
import { Icon } from "./Icons";
import { products, families, contact } from "./catalogue/data";
import {
  BUILDINGS,
  ROOFS,
  calculateLayout,
  type PlannerConfig,
} from "./planner/plannerModel";
import {
  BUILDING_TYPES,
  MAX_FILE_BYTES,
  type QuoteContext,
} from "@/lib/solar/quote";

export default function Quote({
  context,
  plan,
  onClose,
}: {
  context: QuoteContext;
  plan?: PlannerConfig;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const [invalid, setInvalid] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const requestId = useRef(""),
    inFlight = useRef(false);
  const estimate = plan ? calculateLayout(plan) : null;
  const options = [
    "General solar enquiry",
    ...families.map((f) => f.name),
    ...products.map((p) => p.model),
  ];
  const defaultInterest =
    context.product && options.includes(context.product)
      ? context.product
      : "General solar enquiry";
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    const form = e.currentTarget,
      data = new FormData(form),
      file = data.get("drawing");
    setInvalid([]);
    setError("");
    if (file && typeof file !== "string" && file.size > MAX_FILE_BYTES) {
      setError("Choose a drawing of 5 MB or less.");
      setInvalid(["drawing"]);
      return;
    }
    requestId.current ||= crypto.randomUUID();
    data.set("id", requestId.current);
    if (plan) data.set("configuration", JSON.stringify(plan));
    inFlight.current = true;
    setPending(true);
    try {
      const res = await fetch("/api/enquiries", { method: "POST", body: data });
      const reply = (await res.json()) as {
        reference?: string;
        status?: string;
        error?: string;
        fields?: string[];
      };
      if (!res.ok || reply.status !== "received" || !reply.reference) {
        setError(
          reply.error ||
            "Your enquiry could not be confirmed. Please try again.",
        );
        setInvalid(reply.fields || []);
        const field = reply.fields?.[0];
        if (field)
          (form.elements.namedItem(field) as HTMLElement | null)?.focus();
        return;
      }
      setSuccess(reply.reference);
    } catch {
      setError("Connection interrupted. Keep your entries here and try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return (
    <Dialog
      wide
      title={success ? "Enquiry received." : "Plan your solar project."}
      eyebrow="Technical proposal"
      onClose={() => {
        if (!inFlight.current) onClose();
      }}
    >
      {success ? (
        <div className="quote-success" role="status">
          <span className="success-icon">
            <Icon name="check" size={26} />
          </span>
          <p>Your project brief has been saved for review by the site owner.</p>
          <p className="receipt">
            Enquiry reference <strong>{success}</strong>
          </p>
          <p>
            To reach Solar Technology directly, email{" "}
            <a href={"mailto:" + contact.email}>{contact.email}</a>.
          </p>
          <button className="action light" onClick={onClose}>
            Done <Icon name="check" size={16} />
          </button>
        </div>
      ) : (
        <form
          onSubmit={send}
          onChange={() => {
            requestId.current = "";
            if (error) setError("");
            if (invalid.length) setInvalid([]);
          }}
          className="quote-form"
        >
          {estimate && plan && (
            <div className="attached-plan">
              <Icon name="layers" />
              <div>
                <strong>Rooftop configuration attached</strong>
                <span>
                  {plan.roofArea} m² · {estimate.moduleCount} modules ·{" "}
                  {estimate.capacityKw.toLocaleString("en-SG", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  kWp
                </span>
              </div>
            </div>
          )}
          <div className="form-grid">
            <label>
              Name <span>required</span>
              <input
                name="name"
                autoComplete="name"
                maxLength={120}
                required
                aria-invalid={invalid.includes("name")}
              />
            </label>
            <label>
              Company <span>optional</span>
              <input
                name="company"
                autoComplete="organization"
                maxLength={160}
              />
            </label>
            <label>
              Email <span>required</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                aria-invalid={invalid.includes("email")}
              />
            </label>
            <label>
              Phone <span>optional</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                aria-invalid={invalid.includes("phone")}
              />
            </label>
            <label>
              Project location <span>required</span>
              <input
                name="location"
                placeholder="District, city or country"
                minLength={2}
                maxLength={220}
                required
                aria-invalid={invalid.includes("location")}
              />
            </label>
            <label>
              Building type <span>required</span>
              <select
                name="buildingType"
                defaultValue={
                  plan
                    ? BUILDINGS[plan.buildingType]
                    : context.building || "Residential"
                }
              >
                {BUILDING_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="full">
              Product interest
              <select name="interest" defaultValue={defaultInterest}>
                {options.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="full">
              Roof information <span>optional</span>
              <input
                name="roof"
                maxLength={450}
                defaultValue={
                  plan
                    ? ROOFS[plan.roofType] + " · " + plan.roofArea + " m²"
                    : context.roof || ""
                }
                placeholder="Roof material, area or existing installation"
              />
            </label>
            <label className="full">
              Project requirements <span>optional</span>
              <textarea
                name="requirements"
                rows={3}
                maxLength={4000}
                placeholder="What would you like the project team to consider?"
              />
            </label>
            <label className="full upload">
              Project drawing <span>PDF, PNG or JPEG · up to 5 MB</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                name="drawing"
                aria-invalid={invalid.includes("drawing")}
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
              {fileName && <small>Selected drawing · {fileName}</small>}
            </label>
          </div>
          <div className="honey" aria-hidden="true">
            <label>
              Website
              <input name="website" autoComplete="off" tabIndex={-1} />
            </label>
          </div>
          <label className="consent">
            <input type="checkbox" name="consent" value="yes" required />{" "}
            <span>
              I agree to save these details and any drawing on this private site
              for project review.
            </span>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-end">
            <p>
              Direct company enquiries
              <br />
              <a href={"mailto:" + contact.email}>{contact.email}</a>
            </p>
            <button className="action light" type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Submit enquiry"}{" "}
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
