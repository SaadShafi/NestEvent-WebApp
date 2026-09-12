import type { Metadata } from "next";
import { Poppins, Urbanist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <body className="min-h-full flex flex-col bg-bg text-text">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
