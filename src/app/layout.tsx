import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WatchClub - Ultimate Movie & TV Show Destination",
  description: "Explore, stream, and discuss movies and TV series on WatchClub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#181818] text-white antialiased">
        <Navbar />
        <div id="app-root" className="min-h-screen flex flex-col pt-[84px] bg-[#181818]">
          <div className="flex-1 w-full pt-6">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}



