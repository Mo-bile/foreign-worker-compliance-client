"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCompany } from "@/lib/queries/use-companies";
import { useMetadata } from "@/lib/queries/use-metadata";
import {
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
} from "@/types/api";
import type { CompanyResponse, Region, IndustryCategory } from "@/types/api";

// ─── Section Types ──────────────────────────────────────

export type EditSection = "info" | "workers" | "benchmark";

const SECTION_TITLES: Record<EditSection, string> = {
  info: "사업장 정보 수정",
  workers: "인원 정보 수정",
  benchmark: "벤치마크 정보 수정",
};

// ─── Section Schemas ────────────────────────────────────

const infoSchema = z.object({
  name: z.string().min(1, "회사명을 입력해주세요"),
  region: z.enum(REGIONS, { error: "지역을 선택해주세요" }),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES, { error: "업종을 선택해주세요" }),
  industrySubCategory: z.string().optional(),
  address: z.string().min(1, "주소를 입력해주세요"),
  contactPhone: z.string().min(1, "연락처를 입력해주세요"),
  contactEmail: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
});

const workersSchema = z
  .object({
    employeeCount: z.number().int().min(1, "1명 이상이어야 합니다"),
    domesticInsuredCount: z.number().int().min(0, "0명 이상이어야 합니다").optional(),
    foreignWorkerCount: z.number().int().min(0, "0명 이상이어야 합니다"),
  })
  .refine((d) => d.foreignWorkerCount <= d.employeeCount, {
    message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
    path: ["foreignWorkerCount"],
  });

const benchmarkSchema = z.object({
  averageForeignWorkerWage: z.number().positive("양수를 입력해주세요").optional(),
  recentYearTerminationCount: z.number().int().min(0, "0 이상이어야 합니다").optional(),
});

// ─── Props ──────────────────────────────────────────────

interface CompanyEditModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly company: CompanyResponse;
  readonly section: EditSection;
}

// ─── Main Component ─────────────────────────────────────

export function CompanyEditModal({ open, onClose, company, section }: CompanyEditModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>{SECTION_TITLES[section]}</AlertDialogTitle>
        </AlertDialogHeader>
        {section === "info" && <InfoForm company={company} onClose={onClose} />}
        {section === "workers" && <WorkersForm company={company} onClose={onClose} />}
        {section === "benchmark" && <BenchmarkForm company={company} onClose={onClose} />}
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Info Form ──────────────────────────────────────────

function InfoForm({
  company,
  onClose,
}: {
  readonly company: CompanyResponse;
  readonly onClose: () => void;
}) {
  const updateMutation = useUpdateCompany();
  const { data: metadata } = useMetadata();

  const regionOptions = metadata
    ? metadata.regions.map((r) => ({ value: r.code, label: r.koreanName }))
    : REGIONS.map((r) => ({ value: r, label: REGION_LABELS[r] }));

  const industryCategoryOptions = metadata
    ? metadata.industryCategories.map((c) => ({ value: c.code, label: c.koreanName }))
    : INDUSTRY_CATEGORIES.map((c) => ({ value: c, label: INDUSTRY_CATEGORY_LABELS[c] }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof infoSchema>>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: company.name,
      region: company.region,
      subRegion: company.subRegion ?? "",
      industryCategory: company.industryCategory,
      industrySubCategory: company.industrySubCategory ?? "",
      address: company.address,
      contactPhone: company.contactPhone,
      contactEmail: company.contactEmail ?? "",
    },
  });

  function onSubmit(data: z.infer<typeof infoSchema>) {
    updateMutation.mutate(
      { id: company.id, data },
      {
        onSuccess: () => {
          toast.success("사업장 정보가 수정되었습니다");
          onClose();
        },
        onError: (error) => toast.error(`수정 실패: ${error.message}`),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">회사명</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="region">지역</Label>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v as Region)}>
                <SelectTrigger id="region" className="w-full">
                  <SelectValue placeholder="지역 선택">
                    {regionOptions.find((o) => o.value === field.value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subRegion">세부 지역 (선택)</Label>
          <Input id="subRegion" {...register("subRegion")} placeholder="강남구" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industryCategory">업종</Label>
          <Controller
            name="industryCategory"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(v) => field.onChange(v as IndustryCategory)}
              >
                <SelectTrigger id="industryCategory" className="w-full">
                  <SelectValue placeholder="업종 선택">
                    {industryCategoryOptions.find((o) => o.value === field.value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {industryCategoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.industryCategory && (
            <p className="text-sm text-destructive">{errors.industryCategory.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industrySubCategory">세부 업종 (선택)</Label>
          <Input id="industrySubCategory" {...register("industrySubCategory")} placeholder="전자부품" />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="address">주소</Label>
          <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPhone">연락처</Label>
          <Input id="contactPhone" type="tel" {...register("contactPhone")} aria-invalid={!!errors.contactPhone} />
          {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">이메일 (선택)</Label>
          <Input id="contactEmail" type="email" {...register("contactEmail")} placeholder="contact@company.com" />
          {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
        </div>
      </div>

      <AlertDialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}

// ─── Workers Form ───────────────────────────────────────

function WorkersForm({
  company,
  onClose,
}: {
  readonly company: CompanyResponse;
  readonly onClose: () => void;
}) {
  const updateMutation = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof workersSchema>>({
    resolver: zodResolver(workersSchema),
    defaultValues: {
      employeeCount: company.employeeCount,
      domesticInsuredCount: company.domesticInsuredCount ?? undefined,
      foreignWorkerCount: company.foreignWorkerCount,
    },
  });

  function onSubmit(data: z.infer<typeof workersSchema>) {
    updateMutation.mutate(
      { id: company.id, data },
      {
        onSuccess: () => {
          toast.success("인원 정보가 수정되었습니다");
          onClose();
        },
        onError: (error) => toast.error(`수정 실패: ${error.message}`),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="employeeCount">총 직원 수</Label>
          <Input
            id="employeeCount"
            type="number"
            {...register("employeeCount", { valueAsNumber: true })}
            aria-invalid={!!errors.employeeCount}
          />
          <p className="text-xs text-muted-foreground">내·외국인 포함 상시근로자</p>
          {errors.employeeCount && (
            <p className="text-sm text-destructive">{errors.employeeCount.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="domesticInsuredCount">내국인 피보험자 수</Label>
          <Input
            id="domesticInsuredCount"
            type="number"
            {...register("domesticInsuredCount", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
          <p className="text-xs text-muted-foreground">고용 한도 산정 기준 (선택)</p>
          {errors.domesticInsuredCount && (
            <p className="text-sm text-destructive">{errors.domesticInsuredCount.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foreignWorkerCount">외국인 근로자 수</Label>
          <Input
            id="foreignWorkerCount"
            type="number"
            {...register("foreignWorkerCount", { valueAsNumber: true })}
            aria-invalid={!!errors.foreignWorkerCount}
          />
          <p className="text-xs text-muted-foreground">등록된 외국인 근로자 수</p>
          {errors.foreignWorkerCount && (
            <p className="text-sm text-destructive">{errors.foreignWorkerCount.message}</p>
          )}
        </div>
      </div>

      <AlertDialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}

// ─── Benchmark Form ─────────────────────────────────────

function BenchmarkForm({
  company,
  onClose,
}: {
  readonly company: CompanyResponse;
  readonly onClose: () => void;
}) {
  const updateMutation = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof benchmarkSchema>>({
    resolver: zodResolver(benchmarkSchema),
    defaultValues: {
      averageForeignWorkerWage: company.averageForeignWorkerWage ?? undefined,
      recentYearTerminationCount: company.recentYearTerminationCount ?? undefined,
    },
  });

  function onSubmit(data: z.infer<typeof benchmarkSchema>) {
    updateMutation.mutate(
      { id: company.id, data },
      {
        onSuccess: () => {
          toast.success("벤치마크 정보가 수정되었습니다");
          onClose();
        },
        onError: (error) => toast.error(`수정 실패: ${error.message}`),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="averageForeignWorkerWage">외국인 근로자 평균 월임금</Label>
          <Input
            id="averageForeignWorkerWage"
            type="number"
            placeholder="만원 단위"
            {...register("averageForeignWorkerWage", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
          <p className="text-xs text-muted-foreground">미입력 시 임금 포지셔닝 진단이 생략됩니다</p>
          {errors.averageForeignWorkerWage && (
            <p className="text-sm text-destructive">{errors.averageForeignWorkerWage.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recentYearTerminationCount">최근 1년 퇴사 외국인 수</Label>
          <Input
            id="recentYearTerminationCount"
            type="number"
            placeholder="명"
            {...register("recentYearTerminationCount", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
          <p className="text-xs text-muted-foreground">미입력 시 고용 안정성 진단이 생략됩니다</p>
          {errors.recentYearTerminationCount && (
            <p className="text-sm text-destructive">{errors.recentYearTerminationCount.message}</p>
          )}
        </div>
      </div>

      <AlertDialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
