import type { Metadata } from "next";
import { ThemeProvider } from "@/components/core/themeProvider"
import "./globals.css";
import "../fonts/css/satoshi.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Helmi Taqiyudin",
  description: "Helmi Taqiyudin's web portfolio",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`antialiased flex min-h-[calc(100dvh)] bg-[#F5F5F5] text-[#060606] dark:bg-[#202020] dark:text-[#F5F5F5]`}
      >
        <Analytics />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
