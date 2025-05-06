"use client"
import dynamic from "next/dynamic";
import React from "react";

const ClientRootLayout = dynamic(() => import("@/components/ClientRoot"), {
  ssr: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased dark">
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  );
}
