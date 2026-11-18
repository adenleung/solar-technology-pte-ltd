"use client";

import { memo, useId } from "react";
import "./scene.css";

type Point = readonly [number, number];
// Clockwise, from the far-left corner of the surface.
type Quad = readonly [Point, Point, Point, Point];

const WIDTH = 1881;
const HEIGHT = 836;
const ROOF: Quad = [
  [419, 478],
  [1644, 312],
  [1521, 450],
  [122, 564],
];
const ARRAY: Quad = [
  [411, 482],
  [1597, 328],
  [1493, 433],
  [170, 551],
];
const SPECIMEN: Quad = [
  [632, 501],
  [1061, 420],
  [1211, 510],
  [754, 620],
];
const MODULE_EDGES = [
  0, 0.077, 0.148, 0.219, 0.286, 0.349, 0.41, 0.463, 0.521, 0.578, 0.64, 0.701,
  0.762, 0.817, 0.878, 0.947, 1,
];

const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
const mix = (a: Point, b: Point, n: number): Point => [
  lerp(a[0], b[0], n),
  lerp(a[1], b[1], n),
];
const shift = (p: Point, y: number): Point => [p[0], p[1] + y];
const coord = ([x, y]: Point) => `${x.toFixed(1)},${y.toFixed(1)}`;
const line = (a: Point, b: Point) => `M${coord(a)}L${coord(b)}`;
const corners = (q: readonly Point[]) => q.map(coord).join(" ");
const stepped = (from: number, to: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

// Map a unit square to a perspective plane. Equal subdivisions stay on a
// common vanishing point as the plane is lifted, filled, or inspected.
function project(q: Quad) {
  const [a, b, c, d] = q;
  const dx1 = b[0] - c[0],
    dx2 = d[0] - c[0],
    dx3 = a[0] - b[0] + c[0] - d[0];
  const dy1 = b[1] - c[1],
    dy2 = d[1] - c[1],
    dy3 = a[1] - b[1] + c[1] - d[1];
  const determinant = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / determinant;
  const h = (dx1 * dy3 - dx3 * dy1) / determinant;
  return (u: number, v: number): Point => {
    const w = g * u + h * v + 1;
    return [
      ((b[0] - a[0] + g * b[0]) * u + (d[0] - a[0] + h * d[0]) * v + a[0]) / w,
      ((b[1] - a[1] + g * b[1]) * u + (d[1] - a[1] + h * d[1]) * v + a[1]) / w,
    ];
  };
}

const onRoof = project(ROOF);
const onArray = project(ARRAY);
const rafters = Array.from({ length: 13 }, (_, i) => (i + 0.35) / 13);
const beamPaths = rafters
  .map(
    (u) =>
      line(onRoof(u, 0), onRoof(u, 1)) +
      line(shift(onRoof(u, 0), 4), shift(onRoof(u, 1), 9)) +
      line(onRoof(u, 1), shift(onRoof(u, 1), 9)),
  )
  .join("");
const purlinPaths = [0.12, 0.33, 0.55, 0.79]
  .map((v) => line(onRoof(0, v), onRoof(1, v)))
  .join("");
const railPaths = [0.13, 0.38, 0.63, 0.88]
  .map((v) => line(onArray(0, v), onArray(1, v)))
  .join("");

const modules = [0, 1].flatMap((row) =>
  MODULE_EDGES.slice(0, -1).map((u, col) => {
    const right = MODULE_EDGES[col + 1];
    const gapU = (right - u) * 0.014;
    const top = row * 0.5 + 0.014;
    const bottom = (row + 1) * 0.5 - 0.014;
    const q: Quad = [
      onArray(u + gapU, top),
      onArray(right - gapU, top),
      onArray(right - gapU, bottom),
      onArray(u + gapU, bottom),
    ];
    const panel = project(q);
    const seams =
      line(panel(0, 0.5), panel(1, 0.5)) +
      [0.25, 0.5, 0.75].map((t) => line(panel(t, 0), panel(t, 1))).join("");
    return {
      row,
      col,
      q,
      shape: corners(q),
      seams,
      start: 0.435 + col * 0.006 + row * 0.012,
    };
  }),
);
const SELECTED = modules.find((m) => m.row === 1 && m.col === 10)!.q;

const frontMullions = [
  249, 369, 378, 403, 428, 446, 459, 492, 520, 548, 570, 579, 610, 645, 687,
  732, 780, 818, 848, 875, 914, 969, 980, 1026, 1090, 1150, 1211, 1251, 1265,
  1304, 1356, 1426,
];
const frontTop = (x: number) => 578 - 0.0675 * (x - 249);
const frontBase = (x: number) => 656 + 0.0068 * (x - 249);
const mullionPath = frontMullions
  .map((x) => line([x, frontTop(x)], [x, frontBase(x)]))
  .join("");
const wallColumns = [
  [444, 458],
  [547, 574],
  [780, 814],
  [848, 866],
  [1211, 1251],
];
const columnFaces = wallColumns.map(([a, b]) =>
  corners([
    [a, frontTop(a)],
    [b, frontTop(b)],
    [b, frontBase(b)],
    [a, frontBase(a)],
  ]),
);
const sideMullions = [
  1458, 1488, 1506, 1523, 1537, 1554, 1582, 1600, 1616, 1636,
];
const sidePath = sideMullions
  .map((x) =>
    line([x, 500 + 0.284 * (x - 1426)], [x, 664 - 0.022 * (x - 1426)]),
  )
  .join("");
const visibleRoofGrid = modules
  .map((m) => `M${m.q.map(coord).join("L")}Z`)
  .join("");

const Walls = memo(function Walls() {
  return (
    <g strokeLinejoin="round" fill="none">
      <path
        className="arch-ink-fine"
        opacity=".55"
        d="M246 578L310 588 1391 527 1559 561M307 587V652L1388 655 1559 653M388 583V651M530 575V652M649 569V652M789 560V654M969 551V654M1129 542V655M1389 528V655"
      />
      <path
        className="arch-glaze"
        d="M248 577L1427 499 1638 558 1637 659 1428 665 248 657Z"
      />
      {columnFaces.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="#203342"
          stroke="#a2b3be"
          strokeWidth="1.15"
        />
      ))}
      <path className="arch-ink" d={mullionPath + sidePath} />
      <path
        className="arch-ink"
        d="M248 577L1427 499 1638 558V659L1428 665 248 657ZM1427 499V665M1538 529V662M1550 533V661M1585 544V661"
      />
      <path
        className="arch-ink-fine"
        d="M368 588L1211 536M1254 534L1423 520 1535 548M429 642L550 643M570 650L779 651M1372 652L1423 652M468 643V619L523 619V644"
        opacity=".7"
      />
      <path
        fill="#1d303e"
        stroke="#b6c7d3"
        strokeWidth="1.45"
        d="M153 657L248 655 1428 662 1641 657 1606 671 1341 683 153 665Z"
      />
      <path
        className="arch-ink-fine"
        d="M154 661L1340 677 1609 666M125 670L1341 689 1586 677M177 672L177 678M1328 687L1328 693"
      />
      <path
        className="arch-ink-fine"
        d="M103 680L672 684M114 675v9M1652 662h71M1679 657v10"
        opacity=".46"
      />
    </g>
  );
});

const RoofOutline = memo(function RoofOutline() {
  return (
    <g fill="none" strokeLinejoin="round">
      <polygon
        points={corners(ROOF)}
        fill="#334c61"
        fillOpacity=".16"
        stroke="#d1e1ea"
        strokeWidth="1.9"
      />
      <path
        fill="#304455"
        stroke="#c1d0da"
        strokeWidth="1.6"
        d="M122 564L1521 450 1521 470 125 572Z"
      />
      <path
        fill="#263848"
        fillOpacity=".6"
        stroke="#c4d4de"
        strokeWidth="1.6"
        d="M1521 450L1644 312 1746 553 1521 470Z"
      />
      <path
        className="arch-ink-fine"
        d="M1525 451L1644 321 1735 541M1521 470L1697 536 1746 553M1609 371L1609 475 1658 502 1657 410M1626 352L1626 484M1548 422V479M1573 394V486"
      />
      <path
        className="arch-ink-fine"
        d="M121 565L1520 453M125 571L1520 465M419 481L1641 316"
      />
    </g>
  );
});

function Specimen({
  focus,
  open,
  gradientId,
}: {
  focus: number;
  open: number;
  gradientId: string;
}) {
  const q = SELECTED.map((p, index) =>
    mix(p, SPECIMEN[index], focus),
  ) as unknown as Quad;
  const at = project(q);
  const glassY = -61 * open;
  const rearY = 54 * open;
  const cellLines =
    Array.from({ length: 15 }, (_, i) =>
      line(at((i + 1) / 16, 0), at((i + 1) / 16, 1)),
    ).join("") +
    Array.from({ length: 5 }, (_, i) =>
      line(at(0, (i + 1) / 6), at(1, (i + 1) / 6)),
    ).join("");
  const cross = (p: Point) =>
    `M${coord([p[0] - 5, p[1]])}h10M${coord([p[0], p[1] - 5])}v10`;
  const left = q[0],
    right = q[2];
  return (
    <g opacity={stepped(0, 0.16, focus)} fill="none" strokeLinejoin="round">
      <g
        stroke="#8ba7b8"
        strokeWidth="1.2"
        opacity={open * 0.62}
        strokeDasharray="3 6"
      >
        {q.map((p, i) => (
          <path key={i} d={line(shift(p, glassY - 5), shift(p, rearY + 6))} />
        ))}
      </g>
      <g transform={`translate(0 ${rearY})`}>
        <polygon
          points={corners(q)}
          fill="#627e8f"
          fillOpacity=".27"
          stroke="#adc2cd"
          strokeWidth="1.8"
        />
        <path
          d={
            line(shift(q[3], 3), shift(q[2], 3)) +
            line(shift(q[2], 3), shift(q[1], 3))
          }
          stroke="#7c929f"
          strokeWidth="1.8"
        />
      </g>
      <polygon
        points={corners(q)}
        fill={`url(#${gradientId})`}
        stroke="#d3e2ec"
        strokeWidth="1.5"
      />
      <path d={cellLines} stroke="#b0cee0" strokeWidth="1" opacity=".85" />
      <g transform={`translate(0 ${glassY})`}>
        <polygon
          points={corners(q)}
          fill="#c4e2f2"
          fillOpacity=".15"
          stroke="#d1e7f0"
          strokeWidth="2.1"
        />
        <path
          d={
            line(at(0.1, 0.12), at(0.72, 0.12)) +
            line(at(0.13, 0.16), at(0.43, 0.16))
          }
          stroke="#d9effb"
          opacity=".46"
        />
      </g>
      <g opacity={stepped(0.3, 0.92, open)} className="arch-fig-label">
        <path d={cross([left[0] - 11, left[1] + glassY])} />
        <path d={`M${coord(shift(left, glassY))}l-35,-17h-92`} />{" "}
        <text x={left[0] - 126} y={left[1] + glassY - 25}>
          2.0 mm front glass
        </text>
        <path d={`M${coord(right)}l30,-10h86`} />{" "}
        <text x={right[0] + 33} y={right[1] - 17}>
          96 TOPCon cells
        </text>
        <path d={`M${coord(shift(right, rearY))}l30,14h86`} />{" "}
        <text x={right[0] + 33} y={right[1] + rearY + 35}>
          2.0 mm rear glass
        </text>
      </g>
    </g>
  );
}

function Energy({ progress }: { progress: number }) {
  const appear = stepped(0.772, 0.835, progress);
  const disappear = 1 - stepped(0.893, 0.965, progress);
  if (appear * disappear <= 0.001) return null;
  const ac = stepped(0.806, 0.874, progress),
    load = stepped(0.839, 0.89, progress);
  return (
    <g
      opacity={appear * disappear}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        stroke="#aec8d9"
        strokeWidth="2"
        opacity=".88"
        d="M1131 426L1121 454 1230 443 1223 469M1338 409L1322 435 1230 443"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - appear}
      />
      <path
        stroke="#e9bd7b"
        strokeWidth="2.6"
        d="M1223 469L1226 481V574"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - appear}
      />
      <g opacity={ac}>
        <rect
          x="1211"
          y="574"
          width="28"
          height="38"
          rx="3"
          fill="#17212a"
          stroke="#edc98d"
          strokeWidth="2"
        />
        <path d="M1218 597q4-9 8 0t8 0" stroke="#e4c58d" strokeWidth="1.4" />
        <path
          d="M1226 612V639L1090 634 1036 636"
          stroke="#f3c584"
          strokeWidth="2.3"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - ac}
        />
      </g>
      <g opacity={load}>
        <circle cx="1036" cy="636" r="4.1" fill="#f8deb2" stroke="#fbdeb2" />
        <rect x="1003" y="614" width="4" height="11" rx="1" fill="#efc88f" />
        <rect x="1010" y="607" width="4" height="18" rx="1" fill="#efc88f" />
        <rect x="1017" y="600" width="4" height="25" rx="1" fill="#efc88f" />
      </g>
    </g>
  );
}

export default function Scene({ progress }: { progress: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const name = (suffix: string) => `arch-${id}-${suffix}`;
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const reveal = stepped(0.087, 0.24, p) * (1 - stepped(0.758, 0.88, p));
  const initialTrace = 1 - stepped(0.03, 0.12, p);
  const wipeX = -110 + initialTrace * 850 + reveal * 2290;
  const lift = 55 * (stepped(0.25, 0.367, p) - stepped(0.438, 0.548, p));
  const sketchPanels = 1 - stepped(0.24, 0.322, p);
  const structure = stepped(0.24, 0.343, p) * (1 - stepped(0.54, 0.608, p));
  const rail = stepped(0.378, 0.478, p) * (1 - stepped(0.562, 0.632, p));
  const zoom = stepped(0.605, 0.668, p) * (1 - stepped(0.738, 0.792, p));
  const open = stepped(0.635, 0.687, p) * (1 - stepped(0.723, 0.766, p));
  const moduleEnd = 0.697;
  return (
    <div className="sts-arch" aria-hidden="true">
      <div className="sts-arch-plate">
        <img
          className="sts-arch-photo"
          src="/assets/arch/scene-1280.webp"
          srcSet="/assets/arch/scene-800.webp 800w, /assets/arch/scene-960.webp 960w, /assets/arch/scene-1280.webp 1280w, /assets/arch/scene-1881.webp 1881w"
          sizes="(max-width: 600px) 236vw, (max-aspect-ratio: 1/1) 128vw, 100vw"
          width={WIDTH}
          height={HEIGHT}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          alt=""
          draggable={false}
        />
        <svg
          className="sts-arch-drawing"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          focusable="false"
        >
          <defs>
            <linearGradient
              id={name("wipe")}
              x1={wipeX - 78}
              y1="625"
              x2={wipeX + 94}
              y2="690"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="white" />
              <stop offset="1" stopColor="black" />
            </linearGradient>
            <mask
              id={name("paper-mask")}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={WIDTH}
              height={HEIGHT}
            >
              <rect
                width={WIDTH}
                height={HEIGHT}
                fill={`url(#${name("wipe")})`}
              />
            </mask>
            <linearGradient
              id={name("paper")}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#101d2a" />
              <stop offset=".52" stopColor="#1b2b38" />
              <stop offset=".83" stopColor="#14222e" />
              <stop offset="1" stopColor="#0e1820" />
            </linearGradient>
            <linearGradient
              id={name("cell")}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#567083" />
              <stop offset=".3" stopColor="#27495d" />
              <stop offset=".64" stopColor="#162f42" />
              <stop offset="1" stopColor="#3f5f72" />
            </linearGradient>
          </defs>
          <g mask={`url(#${name("paper-mask")})`}>
            <rect
              width={WIDTH}
              height={HEIGHT}
              fill={`url(#${name("paper")})`}
              opacity={lerp(0.88, 0.965, reveal)}
            />
            <g opacity={(1 - zoom * 0.85) * (0.65 + reveal * 0.35)}>
              <Walls />
              {structure > 0.001 && (
                <g opacity={structure} fill="none">
                  <polygon
                    points={corners(ROOF)}
                    fill="#142632"
                    fillOpacity=".9"
                    stroke="#b4c9d7"
                    strokeWidth="1.7"
                  />
                  <path d={purlinPaths} stroke="#7e9cae" strokeWidth="1.2" />
                  <path d={beamPaths} stroke="#c6d8e1" strokeWidth="1.35" />
                  <path
                    className="arch-ink"
                    d="M1521 450L1644 312 1746 553ZM1552 413L1670 465 1704 456M1583 379L1670 465 1644 312"
                  />
                  {ROOF.map((point, i) => (
                    <path
                      key={i}
                      d={line(point, shift(point, -lift - 5))}
                      stroke="#c2d7e3"
                      strokeWidth="1.2"
                      strokeDasharray="4 6"
                    />
                  ))}
                </g>
              )}
              <g transform={`translate(0 ${-lift})`}>
                <RoofOutline />
                {sketchPanels > 0.001 && (
                  <path
                    d={visibleRoofGrid}
                    fill="none"
                    stroke="#d2e1eb"
                    strokeWidth="1.13"
                    opacity={0.83 * sketchPanels}
                  />
                )}
                {rail > 0.001 && (
                  <path
                    d={railPaths}
                    stroke="#dab77b"
                    fill="none"
                    opacity={rail}
                    strokeWidth="2.35"
                  />
                )}
                {p > 0.425 &&
                  p < 0.88 &&
                  modules.map((module, index) => {
                    const seat = stepped(module.start, module.start + 0.053, p);
                    if (seat <= 0.001) return null;
                    return (
                      <g
                        key={index}
                        opacity={seat}
                        transform={`translate(0 ${-(1 - seat) * 24})`}
                      >
                        <polygon
                          points={module.shape}
                          fill={`url(#${name("cell")})`}
                          stroke="#b4d1e2"
                          strokeWidth="1.28"
                        />
                        <path
                          d={module.seams}
                          fill="none"
                          stroke="#98b7ca"
                          strokeWidth=".63"
                          opacity=".66"
                        />
                      </g>
                    );
                  })}
              </g>
              {structure > 0.5 && (
                <g className="arch-fig-label" opacity={2 * structure - 1}>
                  <path d="M754 487L689 442H563" />
                  <circle cx="754" cy="487" r="3" />
                  <text x="563" y="433">
                    Roof structure
                  </text>
                </g>
              )}
            </g>
            {zoom > 0.001 && (
              <Specimen focus={zoom} open={open} gradientId={name("cell")} />
            )}
          </g>
          {p > moduleEnd && <Energy progress={p} />}
        </svg>
      </div>
    </div>
  );
}
