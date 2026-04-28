"use client";

import { useForm, Controller } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  registerWorkerRequestSchema,
  updateWorkerRequestSchema,
  NATIONALITIES,
  NATIONALITY_LABELS,
  VISA_TYPES,
  VISA_TYPE_LABELS,
  VISA_TYPE_SHORT,
} from "@/types/api";
import type { RegisterWorkerRequest, UpdateWorkerRequest, WorkerResponse } from "@/types/api";
import { useRegisterWorker, useUpdateWorker } from "@/lib/queries/use-workers";
import { useCompanies } from "@/lib/queries/use-companies";
import { useMetadata } from "@/lib/queries/use-metadata";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/form/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface WorkerFormCreateProps {
  readonly mode: "create";
  readonly worker?: undefined;
  readonly workerId?: undefined;
}

export interface WorkerFormEditProps {
  readonly mode: "edit";
  readonly worker: WorkerResponse;
  readonly workerId: number;
}

type WorkerFormProps = WorkerFormCreateProps | WorkerFormEditProps;
type WorkerFormValues = RegisterWorkerRequest & UpdateWorkerRequest;

export function WorkerForm(props: WorkerFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const editWorkerId = isEdit ? props.workerId : 0;
  const registerMutation = useRegisterWorker();
  const updateMutation = useUpdateWorker(editWorkerId);
  const isPending = isEdit ? updateMutation.isPending : registerMutation.isPending;
  const {
    data: companies = [],
    isLoading: companiesLoading,
    isError: companiesError,
  } = useCompanies();
  const { data: metadata } = useMetadata();

  const nationalityOptions = metadata
    ? metadata.nationalities.map((n) => ({ value: n.code, label: n.koreanName }))
    : NATIONALITIES.map((n) => ({ value: n, label: NATIONALITY_LABELS[n] }));

  const visaTypeOptions = metadata
    ? metadata.visaTypes.map((v) => ({ value: v.code, label: `${VISA_TYPE_SHORT[v.code as keyof typeof VISA_TYPE_SHORT] ?? v.code} ${v.description}` }))
    : VISA_TYPES.map((v) => ({ value: v, label: `${VISA_TYPE_SHORT[v]} ${VISA_TYPE_LABELS[v]}` }));

  const resolver = (
    isEdit
      ? standardSchemaResolver(updateWorkerRequestSchema)
      : standardSchemaResolver(registerWorkerRequestSchema)
  ) as unknown as Resolver<WorkerFormValues>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WorkerFormValues>({
    resolver,
    defaultValues: isEdit
      ? {
          name: props.worker.name,
          dateOfBirth: props.worker.dateOfBirth,
          nationality: props.worker.nationality,
          visaType: props.worker.visaType,
          visaExpiryDate: props.worker.visaExpiryDate,
          contractStartDate: props.worker.contractStartDate,
          contractEndDate: props.worker.contractEndDate ?? "",
          contactPhone: props.worker.contactPhone ?? "",
          contactEmail: props.worker.contactEmail ?? "",
          jobPosition: props.worker.jobPosition ?? "",
        }
      : {
          name: "",
          dateOfBirth: "",
          passportNumber: "",
          nationality: undefined,
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

  const onSubmit = (data: WorkerFormValues) => {
    if (isEdit) {
      const updateData: UpdateWorkerRequest = {
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        nationality: data.nationality,
        visaType: data.visaType,
        visaExpiryDate: data.visaExpiryDate,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate,
        jobPosition: data.jobPosition,
      };

      updateMutation.mutate(updateData, {
        onSuccess: () => {
          toast.success("근로자 정보가 수정되었습니다");
          router.push(`/workers/${editWorkerId}`);
        },
      });
      return;
    }

    const sanitized = {
      ...data,
      contractEndDate: data.contractEndDate || undefined,
      contactEmail: data.contactEmail || undefined,
      passportNumber: data.passportNumber || undefined,
      registrationNumber: data.registrationNumber || undefined,
      contactPhone: data.contactPhone || undefined,
    };
    registerMutation.mutate(sanitized, {
      onSuccess: (worker) => {
        toast.success("근로자가 등록되었습니다");
        router.push(`/workers/${worker.id}`);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "근로자 정보 수정" : "근로자 정보 입력"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="grid grid-cols-1 gap-4 pb-6 md:grid-cols-2">
          {/* 이름 */}
          <FormField<WorkerFormValues>
            label="이름"
            name="name"
            register={register}
            errors={errors}
            placeholder="홍길동"
          />
          <FormField<WorkerFormValues>
            label="생년월일"
            name="dateOfBirth"
            register={register}
            errors={errors}
            type="date"
          />

          {!isEdit && (
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
                      <SelectTrigger
                        id="companyId"
                        aria-label="사업장"
                        aria-invalid={!!errors.companyId}
                        className="w-full"
                      >
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
              {errors.companyId && (
                <p className="text-sm text-destructive">{errors.companyId.message}</p>
              )}
            </div>
          )}

          {/* 국적 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nationality">국적</Label>
            <Controller
              name="nationality"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger
                    id="nationality"
                    aria-label="국적"
                    aria-invalid={!!errors.nationality}
                    className="w-full"
                  >
                    <SelectValue placeholder="국적 선택">
                      {nationalityOptions.find((o) => o.value === field.value)?.label ?? field.value}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {nationalityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.nationality && (
              <p className="text-sm text-destructive">{errors.nationality.message}</p>
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
                    <SelectValue placeholder="비자 유형 선택">
                      {visaTypeOptions.find((o) => o.value === field.value)?.label ?? field.value}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
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
          <FormField<WorkerFormValues>
            label="비자 만료일"
            name="visaExpiryDate"
            register={register}
            errors={errors}
            type="date"
          />

          {/* 입국일 */}
          {!isEdit && (
            <FormField<WorkerFormValues>
              label="입국일"
              name="entryDate"
              register={register}
              errors={errors}
              type="date"
            />
          )}

          {/* 계약 시작일 */}
          <FormField<WorkerFormValues>
            label="계약 시작일"
            name="contractStartDate"
            register={register}
            errors={errors}
            type="date"
          />

          {/* 계약 종료일 (선택) */}
          <FormField<WorkerFormValues>
            label="계약 종료일 (선택)"
            name="contractEndDate"
            register={register}
            errors={errors}
            type="date"
          />

          {/* 직무 (수정 시 선택) */}
          {isEdit && (
            <FormField<WorkerFormValues>
              label="직무 (선택)"
              name="jobPosition"
              register={register}
              errors={errors}
              placeholder="생산직"
            />
          )}

          {/* 여권번호 (선택) */}
          {!isEdit && (
            <FormField<WorkerFormValues>
              label="여권번호 (선택)"
              name="passportNumber"
              register={register}
              errors={errors}
              placeholder="M12345678"
            />
          )}

          {/* 외국인등록번호 (선택) */}
          {!isEdit && (
            <FormField<WorkerFormValues>
              label="외국인등록번호 (선택)"
              name="registrationNumber"
              register={register}
              errors={errors}
              placeholder="000000-0000000"
            />
          )}

          {/* 연락처 (선택) */}
          <FormField<WorkerFormValues>
            label="연락처 (선택)"
            name="contactPhone"
            register={register}
            errors={errors}
            type="tel"
            placeholder="010-0000-0000"
          />

          {/* 이메일 (선택) */}
          <FormField<WorkerFormValues>
            label="이메일 (선택)"
            name="contactEmail"
            register={register}
            errors={errors}
            type="email"
            placeholder="example@email.com"
          />
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isPending || (!isEdit && companiesLoading)}>
            {isPending ? (isEdit ? "수정 중..." : "등록 중...") : isEdit ? "수정" : "등록"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
