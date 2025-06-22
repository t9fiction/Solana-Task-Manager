import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WalletContextProvider from "./context/WalletContextProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Solana Wallet App",
  description:
    "A Next.js app integrated with Solana wallet for seamless blockchain interactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletContextProvider>
          <div className="h-16">
            <Navbar />
          </div>
          <div className="!py-12 !px-8 sm:!px-12 lg:!px-16 bg-background">
            {children}
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
