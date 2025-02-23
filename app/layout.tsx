"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache
} from "@apollo/client";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";

const client = new ApolloClient({
  uri: "http://localhost:3000/graphql",
  cache: new InMemoryCache(),
});

export default function RootLayout({ children } : {
  children : React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`antialiased dark`}
      >
        {/* Wrapping the Apollo client for the HomePage */}
        <ApolloProvider client={client}>
          <ClerkProvider>
            <Toaster />
            <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Navbar /> */}
            {children}
          </ThemeProvider>
          </ClerkProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
