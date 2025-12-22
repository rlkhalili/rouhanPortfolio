import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rouhan Khalili",
  description:
    "Portfolio site for a scraping, automation, and indie tools developer showcasing projects, capabilities.",
  verification: {
    google: "VQjxRQQlLD9FTEN7Tzl8uXGPUUVgY_O2In5oW3_AyJ4",
  },

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
