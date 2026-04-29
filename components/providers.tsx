"use client";

import { ThemeProvider } from "next-themes";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ErrorDialog } from "@/components/common/error-dialog";
import { Toaster } from "@/components/ui/sonner";

const FALLBACK_ERROR_MESSAGE = "서버와의 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

export function Providers({ children }: { readonly children: ReactNode }) {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            setGlobalError(error.message || FALLBACK_ERROR_MESSAGE);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            setGlobalError(error.message || FALLBACK_ERROR_MESSAGE);
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
        <ErrorDialog message={globalError} onClose={() => setGlobalError(null)} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
