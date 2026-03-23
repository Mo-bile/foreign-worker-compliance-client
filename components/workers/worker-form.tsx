"use client";

import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  registerWorkerRequestSchema,
  NATIONALITIES,
  NATIONALITY_LABELS,
  VISA_TYPES,
  VISA_TYPE_LABELS,
} from "@/types/api";
import type { RegisterWorkerRequest } from "@/types/api";
import { useRegisterWorker } from "@/lib/queries/use-workers";
import { useCompanies } from "@/lib/queries/use-companies";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WorkerForm() {
  const router = useRouter();
  const { mutate: registerWorker, isPending } = useRegisterWorker();
  const { data: companies = [], isLoading: companiesLoading, isError: companiesError } = useCompanies();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterWorkerRequest>({
    resolver: standardSchemaResolver(registerWorkerRequestSchema),
    defaultValues: {
      name: "",
      passportNumber: "",
      nationalityCode: undefined,
      visaType: undefined,
      visaExpiryDate: "",
      entryDate: "",
      registrationNumber: "",
      contractStartDate: "",
      contractEndDate: "",
      companyId: undefined,
      contactPhone: "",
      contactEmail: "",
    },
  });

  const onSubmit = (data: RegisterWorkerRequest) => {
    const sanitized = {
      ...data,
      contractEndDate: data.contractEndDate || undefined,
      contactEmail: data.contactEmail || undefined,
      passportNumber: data.passportNumber || undefined,
      registrationNumber: data.registrationNumber || undefined,
      contactPhone: data.contactPhone || undefined,
    };
    registerWorker(sanitized, {
      onSuccess: (worker) => {
        toast.success("근로자가 등록되었습니다");
        router.push(`/workers/${worker.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>근로자 정보 입력</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              {...register("name")}
              aria-invalid={!!errors.name}
              placeholder="홍길동"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companyId">사업장</Label>
            {companiesLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : companiesError ? (
              <p className="text-sm text-destructive">
                사업장 목록을 불러올 수 없습니다. 페이지를 새로고침해 주세요.
              </p>
            ) : companies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                등록된 사업장이 없습니다.{" "}
                <Link href="/companies/new" className="text-primary hover:underline">
                  사업장을 먼저 등록해주세요
                </Link>
              </p>
            ) : (
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value != null ? String(field.value) : undefined}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger id="companyId" aria-label="사업장" aria-invalid={!!errors.companyId} className="w-full">
                      <SelectValue placeholder="사업장 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} ({c.businessNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.companyId && <p className="text-sm text-destructive">{errors.companyId.message}</p>}
          </div>

          {/* 국적 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nationalityCode">국적</Label>
            <Controller
              name="nationalityCode"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger
                    id="nationalityCode"
                    aria-label="국적"
                    aria-invalid={!!errors.nationalityCode}
                    className="w-full"
                  >
                    <SelectValue placeholder="국적 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITIES.map((nat) => (
                      <SelectItem key={nat} value={nat}>
                        {NATIONALITY_LABELS[nat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.nationalityCode && (
              <p className="text-sm text-destructive">{errors.nationalityCode.message}</p>
            )}
          </div>

          {/* 비자 유형 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="visaType">비자 유형</Label>
            <Controller
              name="visaType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger
                    id="visaType"
                    aria-label="비자 유형"
                    aria-invalid={!!errors.visaType}
                    className="w-full"
                  >
                    <SelectValue placeholder="비자 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISA_TYPES.map((visa) => (
                      <SelectItem key={visa} value={visa}>
                        {VISA_TYPE_LABELS[visa]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.visaType && (
              <p className="text-sm text-destructive">{errors.visaType.message}</p>
            )}
          </div>

          {/* 비자 만료일 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="visaExpiryDate">비자 만료일</Label>
            <Input
              id="visaExpiryDate"
              type="date"
              {...register("visaExpiryDate")}
              aria-invalid={!!errors.visaExpiryDate}
            />
            {errors.visaExpiryDate && (
              <p className="text-sm text-destructive">{errors.visaExpiryDate.message}</p>
            )}
          </div>

          {/* 입국일 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entryDate">입국일</Label>
            <Input
              id="entryDate"
              type="date"
              {...register("entryDate")}
              aria-invalid={!!errors.entryDate}
            />
            {errors.entryDate && (
              <p className="text-sm text-destructive">{errors.entryDate.message}</p>
            )}
          </div>

          {/* 계약 시작일 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contractStartDate">계약 시작일</Label>
            <Input
              id="contractStartDate"
              type="date"
              {...register("contractStartDate")}
              aria-invalid={!!errors.contractStartDate}
            />
            {errors.contractStartDate && (
              <p className="text-sm text-destructive">{errors.contractStartDate.message}</p>
            )}
          </div>

          {/* 계약 종료일 (선택) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contractEndDate">계약 종료일 (선택)</Label>
            <Input
              id="contractEndDate"
              type="date"
              {...register("contractEndDate")}
              aria-invalid={!!errors.contractEndDate}
            />
            {errors.contractEndDate && (
              <p className="text-sm text-destructive">{errors.contractEndDate.message}</p>
            )}
          </div>

          {/* 여권번호 (선택) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="passportNumber">여권번호 (선택)</Label>
            <Input id="passportNumber" {...register("passportNumber")} placeholder="M12345678" />
          </div>

          {/* 외국인등록번호 (선택) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="registrationNumber">외국인등록번호 (선택)</Label>
            <Input
              id="registrationNumber"
              {...register("registrationNumber")}
              placeholder="000000-0000000"
            />
          </div>

          {/* 연락처 (선택) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">연락처 (선택)</Label>
            <Input
              id="contactPhone"
              type="tel"
              {...register("contactPhone")}
              placeholder="010-0000-0000"
            />
          </div>

          {/* 이메일 (선택) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactEmail">이메일 (선택)</Label>
            <Input
              id="contactEmail"
              type="email"
              {...register("contactEmail")}
              aria-invalid={!!errors.contactEmail}
              placeholder="example@email.com"
            />
            {errors.contactEmail && (
              <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isPending || companiesLoading}>
            {isPending ? "등록 중..." : "등록"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
