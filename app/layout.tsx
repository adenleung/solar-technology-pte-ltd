import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solar Technology Singapore — Energy, engineered into architecture",
  description:
    "Explore photovoltaic glass, power tiles and silicon modules. See how solar integrates into a building and plan a preliminary rooftop installation.",
  icons: { icon: "/solar-icon.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-SG">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/assets/type/geist.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
