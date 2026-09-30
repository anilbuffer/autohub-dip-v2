import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ 
  subsets: ["latin"], 
  variable: '--font-roboto',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: "AutoHub DIP · Dealer Intelligence Platform",
  description: "Market data, landed costs, and vehicle intelligence for automotive dealers — powered by AutoHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${roboto.variable} font-sans antialiased h-full`}>
        {children}
      </body>
    </html>
  );
}
