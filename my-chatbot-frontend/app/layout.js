'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

console.log("Google Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{backgroundColor: 'black'}} className={`${geistSans.variable} ${geistMono.variable}`}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "535712446017-93leontoehv7i3v5bcpnokmb2f6qfgbv.apps.googleusercontent.com"}>
        {children}
      </GoogleOAuthProvider>
      </body>
    </html>
  );
}
