// Local QA page. This fixture and axe are staged only when testing the site.
const sizes = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [1024, 768],
  [768, 1024],
  [390, 844],
];
const $ = (s) => document.querySelector(s);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const issues = [];
const log = (s) => {
  $("#diagnostics").textContent += s + "\n";
};
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};
async function until(f, message) {
  for (let i = 0; i < 80; i++) {
    if (f()) return;
    await wait(40);
  }
  throw new Error(message);
}
for (const [w, h] of sizes)
  $("#viewport").add(new Option(w + " × " + h, w + "x" + h));
async function openFrame(w, h) {
  const frame = document.createElement("iframe");
  frame.width = w;
  frame.height = h;
  frame.title = "Solar site at " + w + " by " + h;
  const scale = Math.min(1, ($("#frameHost").clientWidth || 1000) / w);
  frame.style.transform = "scale(" + scale + ")";
  $("#frameHost").style.height = Math.ceil(h * scale) + "px";
  const loaded = new Promise((resolve) =>
    frame.addEventListener("load", resolve, { once: true }),
  );
  frame.src = "/";
  $("#frameHost").replaceChildren(frame);
  await loaded;
  await frame.contentDocument.fonts.ready;
  return frame;
}
function recordSize(frame) {
  const d = frame.contentDocument;
  return d.documentElement.scrollWidth - d.documentElement.clientWidth;
}
async function film(frame) {
  const w = frame.contentWindow,
    d = frame.contentDocument,
    track = d.querySelector(".film-track"),
    box = d.querySelector(".film-sticky");
  if (w.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    check(
      w.getComputedStyle(box).position === "relative",
      "Reduced-motion scene must be unpinned",
    );
    check(
      d.querySelector(".film-transcript").getBoundingClientRect().width > 100,
      "Reduced-motion transcript must be readable",
    );
    return "static";
  }
  await until(() => w.ScrollTrigger, "ScrollTrigger did not load");
  const span = track.offsetHeight - box.offsetHeight;
  const poses = [
    [0.22, "From architecture"],
    [0.35, "Built on precision"],
    [0.5, "Integrated with purpose"],
    [0.685, "Performance, layer"],
    [0.835, "Architecture that generates"],
    [0.95, "One building"],
    [0.5, "Integrated with purpose"],
    [0, "Energy, engineered"],
  ];
  let firstSvg;
  for (const [p, text] of poses) {
    w.scrollTo(0, Math.round(p * span));
    await until(
      () =>
        d.querySelector(".film-copy").innerText.includes(text) &&
        (p > 0 || d.querySelector(".film-copy h2") === null),
      "Stage missing at " + p,
    );
    if (p === 0.5) {
      const drawing = d.querySelector(".sts-arch-drawing").innerHTML;
      if (firstSvg)
        check(drawing === firstSvg, "A reversed pose changed geometry");
      else firstSvg = drawing;
    }
  }
  return "7 stages + reversal";
}
async function interactions(frame) {
  const d = frame.contentDocument,
    w = frame.contentWindow;
  const click = (s) => {
    const el = d.querySelector(s);
    check(el, "Missing " + s);
    el.click();
  };
  const textButton = (host, label) => {
    const el = [...d.querySelectorAll(host + " button")].find((b) =>
      b.textContent.toLowerCase().includes(label.toLowerCase()),
    );
    check(el, "Missing option " + label);
    el.click();
  };
  const modal = () => d.querySelector("dialog[open]");
  const close = async () => {
    click("dialog[open] [aria-label='Close dialog']");
    await until(() => !modal(), "Dialog did not close");
  };
  if (w.innerWidth <= 930) {
    click("[aria-label='Open navigation']");
    await until(() => modal(), "Mobile navigation did not open");
    check(
      modal().innerText.includes("Rooftop planner"),
      "Mobile planner link missing",
    );
    await close();
  } else {
    click(".desktop-nav button");
    await until(
      () => d.querySelector(".mega-menu"),
      "Products menu did not open",
    );
    check(
      d.querySelectorAll(".mega-items img").length === 3,
      "Missing thumbnails",
    );
    click(".desktop-nav button");
  }
  textButton(".family-bar", "Power tiles");
  await until(
    () =>
      d.querySelector(".product-info h3").textContent.includes("Power Tile"),
    "Family did not change",
  );
  textButton(".product-info", "View specifications");
  await until(
    () => modal()?.querySelector(".spec-list"),
    "Specification table missing",
  );
  check(modal().querySelector("a[href$='.pdf']"), "Missing sheet");
  await close();
  click("[aria-label='Search site']");
  await until(() => modal(), "Search did not open");
  const field = modal().querySelector("input[type=search]");
  const sv = Object.getOwnPropertyDescriptor(
    w.HTMLInputElement.prototype,
    "value",
  ).set;
  sv.call(field, "Somalia");
  field.dispatchEvent(new w.Event("input", { bubbles: true }));
  await until(
    () => modal().querySelectorAll(".result-list button").length === 1,
    "Search results did not narrow",
  );
  modal().querySelector(".result-list button").click();
  await until(
    () =>
      d.querySelector(".project-description h3").innerText.includes("Bosaso"),
    "Search did not select the project",
  );
  const input = d.querySelector("#planner input[type=number]");
  sv.call(input, "180");
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
  await until(
    () => !d.querySelector(".pl-capacity p").textContent.startsWith("18 "),
    "Layout did not recompute",
  );
  const first = d
    .querySelector(".pl-drawing-wrap svg")
    .getAttribute("aria-label");
  textButton(".pl-canvas-top", "Plan view");
  await until(
    () =>
      d.querySelector(".pl-drawing-wrap svg").getAttribute("aria-label") !==
      first,
    "Plan view did not change",
  );
  click(".pl-quote");
  await until(
    () => modal()?.querySelector(".attached-plan"),
    "Planner settings not attached",
  );
  check(
    modal().querySelector("select[name=interest]").value === "SP-N16B/96HG",
    "Wrong planner model in enquiry",
  );
  await close();
  w.scrollTo(0, 0);
  return "passed";
}
async function accessibility(frame, size) {
  const w = frame.contentWindow,
    d = frame.contentDocument;
  await new Promise((resolve, reject) => {
    const script = d.createElement("script");
    script.src = "/__qa/axe.min.js";
    script.onload = resolve;
    script.onerror = reject;
    d.head.appendChild(script);
  });
  const options = {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
    },
  };
  const findings = [];
  async function audit(label) {
    const report = await w.axe.run(d, options);
    for (const v of report.violations)
      findings.push({
        state: label,
        rule: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 9),
      });
  }
  await audit("page");
  if (size === 390 || size === 1440) {
    d.querySelector(".head-quote").click();
    await until(() => d.querySelector("dialog[open]"), "Quote did not open");
    await audit("quote");
    d.querySelector("dialog [aria-label='Close dialog']").click();
  }
  if (findings.length) {
    issues.push([size, findings]);
    log(size + " " + JSON.stringify(findings));
  }
  return findings.length;
}
async function run() {
  $("#run").disabled = true;
  $("#inspect").disabled = true;
  $("#diagnostics").textContent = "";
  $("tbody").replaceChildren();
  issues.length = 0;
  for (const [w, h] of sizes) {
    $("#status").textContent = "Testing " + w + " × " + h;
    const row = document.createElement("tr");
    $("tbody").append(row);
    let overflow = "—",
      scrub = "—",
      actions = "—",
      axe = "—",
      fcp = "—";
    try {
      const frame = await openFrame(w, h);
      overflow = recordSize(frame);
      scrub = await film(frame);
      actions = await interactions(frame);
      overflow = Math.max(overflow, recordSize(frame));
      axe = await accessibility(frame, w);
      const mark = frame.contentWindow.performance.getEntriesByName(
        "first-contentful-paint",
      )[0];
      if (mark) fcp = Math.round(mark.startTime) + " ms";
    } catch (e) {
      issues.push([w, String(e)]);
      log(w + " × " + h + " — " + e.message);
    }
    for (const value of [w + " × " + h, overflow, scrub, actions, axe, fcp]) {
      const cell = document.createElement("td");
      cell.textContent = String(value);
      row.append(cell);
    }
  }
  $("#status").textContent =
    "Finished six viewports. " + issues.length + " diagnostic groups.";
  $("#run").disabled = false;
  $("#inspect").disabled = false;
}
$("#run").addEventListener("click", run);
$("#inspect").addEventListener("click", async () => {
  const [w, h] = $("#viewport").value.split("x").map(Number);
  await openFrame(w, h);
  $("#status").textContent = "Inspecting " + w + " × " + h;
});
