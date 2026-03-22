"use client";

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { useCompanies } from "@/lib/queries/use-companies";
import type { CompanyResponse } from "@/types/api";

const STORAGE_KEY = "fwc-selected-company-id";

function readStoredId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    console.warn("localStorage read failed, company selection will not persist:", e);
  }
  return null;
}

function writeStoredId(id: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(id));
  } catch (e) {
    console.warn("localStorage write failed, company selection will not persist:", e);
  }
}

interface CompanyContextValue {
  readonly selectedCompanyId: number | null;
  readonly selectedCompany: CompanyResponse | null;
  readonly companies: readonly CompanyResponse[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly setSelectedCompanyId: (id: number) => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { readonly children: ReactNode }) {
  const { data: companies = [], isLoading, isError } = useCompanies();
  // Read persisted selection once on mount via lazy initializer (avoids setState-in-effect)
  const [userSelectedId, setUserSelectedId] = useState<number | null>(readStoredId);

  // Derive the effective selectedCompanyId:
  // 1. If user explicitly selected a company that exists in the list, use it
  // 2. Otherwise, auto-select the first company
  const selectedCompanyId = useMemo(() => {
    if (companies.length === 0) return null;

    if (userSelectedId !== null) {
      const exists = companies.some((c) => c.id === userSelectedId);
      if (exists) return userSelectedId;
    }

    return companies[0].id;
  }, [companies, userSelectedId]);

  const setSelectedCompanyId = useCallback((id: number) => {
    setUserSelectedId(id);
    writeStoredId(id);
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  const value = useMemo<CompanyContextValue>(
    () => ({ selectedCompanyId, selectedCompany, companies, isLoading, isError, setSelectedCompanyId }),
    [selectedCompanyId, selectedCompany, companies, isLoading, isError, setSelectedCompanyId],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompanyContext() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompanyContext must be used within CompanyProvider");
  return ctx;
}
