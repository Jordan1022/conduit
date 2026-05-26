import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conduit | AI Referral Intelligence",
  description: "Private-network referral intelligence for trusted business leaders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
