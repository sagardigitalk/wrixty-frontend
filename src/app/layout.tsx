import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM",
  description: "Advanced premium management portal for businesses to manage leads, tasks, and customer interactions with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-all duration-300">
        <NextTopLoader
          color="#0F766E"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0F766E,0 0 5px #0F766E"
        />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}


