"use client";

import { ThemeProvider } from "next-themes";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const FALLBACK_ERROR_MESSAGE = "오류가 발생했습니다";

export function Providers({ children }: { readonly children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error(error.message || FALLBACK_ERROR_MESSAGE);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(error.message || FALLBACK_ERROR_MESSAGE);
          },
        }),
        defaultOptions: {
          queries: {
            retry: 3,
            staleTime: 10_000,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
