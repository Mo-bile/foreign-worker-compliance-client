"use client";

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { useCompanies } from "@/lib/queries/use-companies";
import type { CompanyResponse } from "@/types/api";

const STORAGE_KEY = "fwc-selected-company-id";

interface CompanyContextValue {
  readonly selectedCompanyId: number | null;
  readonly selectedCompany: CompanyResponse | null;
  readonly companies: readonly CompanyResponse[];
  readonly isLoading: boolean;
  readonly setSelectedCompanyId: (id: number) => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { readonly children: ReactNode }) {
  const { data: companies = [], isLoading } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = Number(stored);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setSelectedCompanyIdState(parsed);
        }
      }
    } catch {
      // localStorage unavailable
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || companies.length === 0) return;
    if (selectedCompanyId !== null) {
      const exists = companies.some((c) => c.id === selectedCompanyId);
      if (exists) return;
    }
    setSelectedCompanyIdState(companies[0].id);
    try {
      localStorage.setItem(STORAGE_KEY, String(companies[0].id));
    } catch {
      // localStorage unavailable
    }
  }, [initialized, companies, selectedCompanyId]);

  const setSelectedCompanyId = (id: number) => {
    setSelectedCompanyIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // localStorage unavailable
    }
  };

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  const value = useMemo<CompanyContextValue>(
    () => ({ selectedCompanyId, selectedCompany, companies, isLoading, setSelectedCompanyId }),
    [selectedCompanyId, selectedCompany, companies, isLoading],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompanyContext() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompanyContext must be used within CompanyProvider");
  return ctx;
}
