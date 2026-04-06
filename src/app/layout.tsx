import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "USVT Events | Management Evenimente",
  description: 'Sistem de management al evenimentelor - Universitatea de Științele Vieții "Regele Mihai I" din Timișoara',
  icons: { icon: '/logos/usvt-main.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a3a6e',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { style: { background: '#2e7d32' } },
            error: { style: { background: '#dc2626' } },
          }}
        />
        </Providers>
      </body>
    </html>
  );
}
