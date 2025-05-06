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
import "../app/globals.css";

const client = new ApolloClient({
  uri: "http://localhost:3000/graphql",
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <ClerkProvider>
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ClerkProvider>
    </ApolloProvider>
  );
}
