import type { CSSProperties } from "react";

const paths = {
  arrow: "M4 12h15m-6-6 6 6-6 6",
  diagonal: "M5.5 18.5 18 6m-10 0h10v10",
  down: "m6 9 6 6 6-6",
  forward: "m9 5 7 7-7 7",
  back: "m15 5-7 7 7 7",
  close: "m5 5 14 14M19 5 5 19",
  search: "M16 16l4.5 4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0",
  menu: "M3 8h18M3 16h18",
  file: "M5 3h9l5 5v13H5zM14 3v6h5M8 13h8M8 16h6",
  check: "m4 12 5 5L20 6",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Zm-4.5 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0",
  plus: "M4 12h16m-8-8v16",
  minus: "M4 12h16",
  layers: "m2 9 10-5 10 5-10 5zM2 13l10 5 10-5M2 17l10 5 10-5",
  sun: "M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2m-3 8a5 5 0 1 1-10 0 5 5 0 1 1 10 0",
  sheet: "M4 5h16v14H4zM4 10h16M9 5v14",
};
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 18,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
