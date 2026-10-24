import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Komiku App',
  description: 'Baca komik manga, manhwa, dan manhua online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
