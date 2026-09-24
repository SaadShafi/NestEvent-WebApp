import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

// Self-hosted (latin subset from Google Fonts). next/font/google breaks under Turbopack dev
// when Google returns font URLs with extra query params ("queries have exactly one entry").
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "./fonts/poppins-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.woff2", weight: "700", style: "normal" },
  ],
});

// Variable font covering weights 400–800.
const urbanist = localFont({
  variable: "--font-urbanist",
  display: "swap",
  src: [{ path: "./fonts/urbanist-400-800.woff2", weight: "400 800", style: "normal" }],
});

export const metadata: Metadata = {
  title: "Nest — Discover events. Meet your people.",
  description: "Nest event web app for guests and organizers.",
  icons: { icon: "/brand/nest-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${urbanist.variable} h-full antialiased`}
    >
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before
          hydration; this only silences mismatches on body's own attributes, not its children. */}
      <body className="min-h-full flex flex-col bg-bg text-text" suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
