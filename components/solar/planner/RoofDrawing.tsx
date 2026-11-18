import { useId } from "react";
import {
  COLUMN_GAP,
  PITCH_DEGREES,
  type PlannerConfig,
  type PlannerLayout,
} from "./plannerModel";

type Point = [number, number];
type Coordinate = [number, number, number];
export type DrawingView = "axon" | "plan";

type DrawingProps = {
  plan: PlannerConfig;
  layout: PlannerLayout;
  view: DrawingView;
  angle: number;
  zoom: number;
};
const corners = (w: number, d: number, inset = 0): Point[] => [
  [-inset, -inset],
  [w + inset, -inset],
  [w + inset, d + inset],
  [-inset, d + inset],
];

export default function RoofDrawing({
  plan,
  layout,
  view,
  angle,
  zoom,
}: DrawingProps) {
  const id = `roof-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const {
    roofWidth: w,
    roofDepth: d,
    arrayDepth,
    arrayWidth,
    moduleCount,
    usableDepth,
    usableWidth,
  } = layout;
  // These elevations are illustrative; the same roof-plane coordinates drive the drawing and sizing.
  const baseHeights = {
    residential: 0.255,
    commercial: 0.31,
    industrial: 0.19,
  };
  const wall = Math.min(w, d) * baseHeights[plan.buildingType];
  const pitch =
    plan.roofType === "pitched" ? (PITCH_DEGREES * Math.PI) / 180 : 0;
  const azimuth = (((view === "plan" ? 0 : 32) + angle * 90) * Math.PI) / 180;
  const tilt = view === "plan" ? Math.PI / 2 : (31 * Math.PI) / 180;
  const c = Math.cos(azimuth),
    s = Math.sin(azimuth);
  const roof = (x: number, y: number, lift = 0): Coordinate => [
    x,
    y * Math.cos(pitch),
    wall + y * Math.sin(pitch) + lift,
  ];
  const horizontalDepth = d * Math.cos(pitch);
  const raw = ([x, y, z]: Coordinate): Point => [
    x * c - y * s,
    (x * s + y * c) * Math.sin(tilt) - z * Math.cos(tilt),
  ];
  const perimeter = corners(w, d).map(([x, y]) => roof(x, y));
  const boundary = [
    ...perimeter,
    ...corners(w, horizontalDepth).map(([x, y]): Coordinate => [x, y, 0]),
  ].map(raw);
  const xs = boundary.map((p) => p[0]),
    ys = boundary.map((p) => p[1]);
  const left = Math.min(...xs),
    right = Math.max(...xs),
    top = Math.min(...ys),
    bottom = Math.max(...ys);
  const fit = Math.min(478 / (right - left), 266 / (bottom - top));
  const size = fit * zoom;
  const project = (point: Coordinate): Point => {
    const [x, y] = raw(point);
    return [
      320 + (x - (left + right) / 2) * size,
      168 + (y - (top + bottom) / 2) * size,
    ];
  };
  const poly = (points: Coordinate[]) =>
    points.map((p) => project(p).join(",")).join(" ");
  const surface = (x: number, y: number, lift = 0) => project(roof(x, y, lift));
  const origin = surface(0, 0),
    axisX = surface(1, 0),
    axisY = surface(0, 1);
  const matrix = `matrix(${axisX[0] - origin[0]} ${axisX[1] - origin[1]} ${axisY[0] - origin[0]} ${axisY[1] - origin[1]} ${origin[0]} ${origin[1]})`;
  const ax = (w - arrayWidth) / 2,
    ay = (d - arrayDepth) / 2;
  const sill = wall * 0.12;
  const eave = Math.min(w, d) * 0.016;
  const frontY = c >= 0 ? horizontalDepth : 0,
    nearX = s >= 0 ? w : 0;
  const sides: [Point, Point][] = [
    [
      [0, frontY],
      [w, frontY],
    ],
    [
      [nearX, 0],
      [nearX, horizontalDepth],
    ],
  ];
  const maxHeight = (y: number) => wall + y * Math.tan(pitch) - eave;
  const groundGrid: Coordinate[][] = [];
  for (let i = -1; i <= 6; i++) {
    groundGrid.push([
      [(w * i) / 5, -horizontalDepth * 0.28, -sill],
      [(w * i) / 5, horizontalDepth * 1.3, -sill],
    ]);
    groundGrid.push([
      [-w * 0.16, (horizontalDepth * i) / 5, -sill],
      [w * 1.17, (horizontalDepth * i) / 5, -sill],
    ]);
  }

  const depthLabelSide = nearX > 0 ? 1 : -1;
  const widthLabelSide = frontY > 0 ? 1 : -1;
  const dimensionOffset = Math.min(w, d) * 0.11;
  const dim = (a: Point, b: Point, value: string) => {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = (b[1] - a[1]) / length,
      ny = -(b[0] - a[0]) / length;
    const tick = (p: Point) => (
      <path d={`M${p[0] - nx * 3},${p[1] - ny * 3}l${nx * 6},${ny * 6}`} />
    );
    let rotate = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    if (rotate > 90) rotate -= 180;
    if (rotate < -90) rotate += 180;
    return (
      <g className="pl-dim">
        <path d={`M${a.join(",")}L${b.join(",")}`} />
        {tick(a)}
        {tick(b)}
        <text
          textAnchor="middle"
          x="0"
          y="-5"
          transform={`translate(${(a[0] + b[0]) / 2},${(a[1] + b[1]) / 2}) rotate(${rotate})`}
        >
          {value}
        </text>
      </g>
    );
  };

  const mw = layout.moduleWidth,
    md = layout.moduleDepth;
  const moduleGapX = mw + COLUMN_GAP,
    moduleGapY = md + layout.rowGap;
  const thick = Math.min(w, d) / 750;
  const informativeLabel = `${view === "plan" ? "Roof plan" : "Axonometric drawing"} of a ${plan.buildingType} building with ${moduleCount} modules on a ${plan.roofType === "flat" ? "flat" : "single-pitch"} roof.`;
  return (
    <svg
      className="pl-drawing-svg"
      viewBox="0 0 640 352"
      role="img"
      aria-label={informativeLabel}
    >
      <defs>
        <linearGradient id={`${id}-roof`} x2="0.95" y2="1">
          <stop stopColor="#34464f" />
          <stop offset="1" stopColor="#24343d" />
        </linearGradient>
        <linearGradient id={`${id}-facade`} x2="0.8" y2="1">
          <stop stopColor="#293b44" />
          <stop offset="1" stopColor="#17252e" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x2="1" y2="1">
          <stop stopColor="#364d58" />
          <stop offset="0.6" stopColor="#253945" />
          <stop offset="1" stopColor="#1d2e38" />
        </linearGradient>
        <linearGradient id={`${id}-solar`} x2="0.74" y2="1">
          <stop stopColor="#436171" />
          <stop offset="1" stopColor="#2a414d" />
        </linearGradient>
        <pattern
          id={`${id}-arrays`}
          width={moduleGapX}
          height={moduleGapY}
          x={ax}
          y={ay}
          patternUnits="userSpaceOnUse"
          viewBox={`0 0 ${moduleGapX} ${moduleGapY}`}
        >
          <rect
            x={0}
            y={0}
            width={mw}
            height={md}
            fill={`url(#${id}-solar)`}
            stroke="#adbec4"
            strokeWidth={Math.min(mw, md) * 0.022}
          />
          {moduleCount <= 250 && (
            <g
              fill="none"
              stroke="#a9bfc9"
              strokeOpacity="0.28"
              strokeWidth={Math.min(mw, md) * 0.009}
            >
              <path
                d={`M${mw / 2},0v${md} M0,${md / 2}h${mw} M0,${md / 4}h${mw} M0,${(3 * md) / 4}h${mw}`}
              />
            </g>
          )}
        </pattern>
      </defs>
      <g fill="none" stroke="#546670" strokeWidth="0.65" opacity="0.34">
        {groundGrid.map((line, i) => (
          <polyline key={i} points={poly(line)} />
        ))}
      </g>
      {view === "axon" && (
        <>
          <polygon
            points={poly(
              corners(w, horizontalDepth, eave * 1.8).map(
                ([x, y]): Coordinate => [x, y, -sill],
              ),
            )}
            fill="#17232d"
            stroke="#5a6970"
            strokeWidth="0.7"
          />
          {sides.map(([[x0, y0], [x1, y1]], index) => {
            const at = (t: number): Point => [
              x0 + (x1 - x0) * t,
              y0 + (y1 - y0) * t,
            ];
            const field = (t: number, band: number): Coordinate => {
              const [x, y] = at(t);
              return [x, y, sill + (maxHeight(y) - sill) * band];
            };
            const panels =
              plan.buildingType === "industrial"
                ? index === 0
                  ? 15
                  : 9
                : index === 0
                  ? 9
                  : 5;
            const floors = plan.buildingType === "commercial" ? 3 : 1;
            return (
              <g key={index}>
                <polygon
                  points={poly([
                    [x0, y0, 0],
                    [x1, y1, 0],
                    [x1, y1, maxHeight(y1)],
                    [x0, y0, maxHeight(y0)],
                  ])}
                  fill={`url(#${id}-facade)`}
                  stroke="#778b94"
                  strokeWidth="0.85"
                />
                {Array.from({ length: floors }, (_, floor) => {
                  const low = (floor + 0.04) / floors,
                    high = (floor + 0.92) / floors;
                  return (
                    <g key={floor}>
                      <polygon
                        points={poly([
                          field(0.025, low),
                          field(0.975, low),
                          field(0.975, high),
                          field(0.025, high),
                        ])}
                        fill={
                          plan.buildingType === "industrial"
                            ? "#293b46"
                            : `url(#${id}-glass)`
                        }
                        stroke="#627680"
                        strokeWidth="0.65"
                      />
                      {Array.from({ length: panels - 1 }, (_, n) => (
                        <polyline
                          key={n}
                          points={poly([
                            field((n + 1) / panels, low),
                            field((n + 1) / panels, high),
                          ])}
                          fill="none"
                          stroke="#83939a"
                          strokeWidth={
                            plan.buildingType === "industrial" ? 0.52 : 0.82
                          }
                          opacity="0.82"
                        />
                      ))}
                    </g>
                  );
                })}
                <polyline
                  points={poly([
                    [x0, y0, sill],
                    [x1, y1, sill],
                  ])}
                  fill="none"
                  stroke="#99a9ae"
                  strokeWidth="0.9"
                />
              </g>
            );
          })}
          <polygon
            points={poly(
              corners(w, d, eave).map(([x, y]) => roof(x, y, -eave)),
            )}
            fill="#172832"
            stroke="#9cabb0"
            strokeWidth="1.1"
          />
        </>
      )}
      <g transform={matrix}>
        <rect
          x={-eave}
          y={-eave}
          width={w + 2 * eave}
          height={d + 2 * eave}
          fill={`url(#${id}-roof)`}
          stroke="#a0afb4"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {Array.from({ length: 11 }, (_, n) => (
          <line
            key={n}
            x1={(w * (n + 1)) / 12}
            x2={(w * (n + 1)) / 12}
            y1="0"
            y2={d}
            stroke="#99b0b8"
            strokeOpacity="0.2"
            strokeWidth="0.65"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {usableWidth > 0 && (
          <rect
            x={(w - usableWidth) / 2}
            y={(d - usableDepth) / 2}
            width={usableWidth}
            height={usableDepth}
            fill="none"
            stroke="#dcaf73"
            strokeDasharray="3 3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {moduleCount > 0 && (
          <>
            <rect
              x={ax - thick}
              y={ay - thick}
              width={arrayWidth + 2 * thick}
              height={arrayDepth + 2 * thick}
              fill="#14242d"
            />
            <rect
              x={ax}
              y={ay}
              width={arrayWidth}
              height={arrayDepth}
              fill={`url(#${id}-arrays)`}
            />
          </>
        )}
      </g>
      {zoom === 1 && (
        <>
          {dim(
            surface(0, (frontY > 0 ? d : 0) + widthLabelSide * dimensionOffset),
            surface(w, (frontY > 0 ? d : 0) + widthLabelSide * dimensionOffset),
            `${w.toFixed(1)} m`,
          )}
          {dim(
            surface(nearX + depthLabelSide * dimensionOffset, 0),
            surface(nearX + depthLabelSide * dimensionOffset, d),
            `${d.toFixed(1)} m`,
          )}
        </>
      )}
    </svg>
  );
}
