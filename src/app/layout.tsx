import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APISmith — AI API Documentation Generator",
  description: "Generate beautiful API documentation from endpoints using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
