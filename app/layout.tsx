import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono,
  Zain,
  Montserrat_Alternates
} from "next/font/google";

import "./globals.css";
import AdminDropdown from "@/components/AdminDropdown";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zain = Zain({
  variable: '--font-zain',
  subsets: ["latin"],
  weight: ['200', '300', '400', '700', '800'],
  display: 'swap'
});

const monst = Montserrat_Alternates({
  variable: '--font-monsterrat-alt',
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap'
});

import { WeatherProvider } from '@/providers/WeatherProvider';

export const metadata: Metadata = {
  title: "NextWeather",
  description: "A Next.js Weather App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${monst.variable} ${zain.variable} ${geistSans.variable} ${geistMono.variable} antialiased`} >
        <WeatherProvider>
          {/* {process.env.NEXT_PUBLIC_ENV !== 'production' && } */}
          <AdminDropdown />
          {children}
        </WeatherProvider>
      </body>
    </html>
  );
}
