import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swing Trading Calculator",
  description: "Risk-first trade planning calculator for swing traders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
