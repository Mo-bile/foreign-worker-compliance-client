import type { CompanyDerivedCountsResponse, CompanyResponse } from "@/types/api";

type CompanyOverrides = Omit<Partial<CompanyResponse>, "derivedCounts"> & {
  readonly derivedCounts?: Partial<CompanyDerivedCountsResponse>;
};

export const mockCompanyDerivedCounts: CompanyDerivedCountsResponse = {
  activeForeignWorkerCount: 5,
  upcomingForeignWorkerCount: 1,
  endedForeignWorkerCount: 2,
  reviewRequiredForeignWorkerCount: 0,
  recentYearEndedForeignWorkerCount: 1,
  registeredWorkforceTotal: 35,
  activeE9WorkerCount: 4,
  activeH2WorkerCount: 1,
  activeE7WorkerCount: 0,
  activeOtherForeignWorkerCount: 0,
  recentYearEndReasonDistribution: { VOLUNTARY_RESIGNATION: 1 },
  recentYearEmployerFaultEndCount: 0,
  workerLifecycleUpdatedAtMax: "2026-03-01T00:00:00Z",
};

export function createMockCompany(overrides: CompanyOverrides = {}): CompanyResponse {
  const { derivedCounts, ...rest } = overrides;

  return {
    id: 1,
    name: "테스트 회사",
    businessNumber: "123-45-67890",
    region: "SEOUL",
    subRegion: null,
    industryCategory: "MANUFACTURING",
    industrySubCategory: null,
    employeeCount: 50,
    domesticInsuredCount: 30,
    address: "서울시 종로구",
    contactPhone: "02-1234-5678",
    contactEmail: "test@demo.test",
    averageForeignWorkerWage: null,
    derivedCounts: {
      ...mockCompanyDerivedCounts,
      ...derivedCounts,
    },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    ...rest,
  };
}
