import type { Metadata } from "next";
import { ThemeProvider } from "@/components/core/themeProvider"
import "./globals.css";
import "../fonts/css/satoshi.css";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
