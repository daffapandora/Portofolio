import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daffa Pandora - Full Stack Developer Portfolio",
  description:
    "Passionate developer specializing in React, Next.js, React Native, and Firebase. View my projects and get in touch.",
  keywords: [
    "Full Stack Developer",
    "React",
    "Next.js",
    "React Native",
    "Firebase",
    "TypeScript",
    "Web Developer",
    "Mobile Developer",
    "Daffa Pandora",
  ],
  authors: [{ name: "Daffa Pandora El-Farisin" }],
  creator: "Daffa Pandora El-Farisin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://daffapandora.dev",
    siteName: "Daffa Pandora Portfolio",
    title: "Daffa Pandora - Full Stack Developer Portfolio",
    description:
      "Passionate developer specializing in React, Next.js, React Native, and Firebase. View my projects and get in touch.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Daffa Pandora - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daffa Pandora - Full Stack Developer Portfolio",
    description:
      "Passionate developer specializing in React, Next.js, React Native, and Firebase.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* BBH Bartle Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=BBH+Bartle&display=swap" rel="stylesheet" />
        {/* Analytics placeholder */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script> */}
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
