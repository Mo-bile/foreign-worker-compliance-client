"use client";

import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createCompanyRequestSchema,
  updateCompanyRequestSchema,
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
} from "@/types/api";
import type { CreateCompanyRequest, UpdateCompanyRequest } from "@/types/api";
import type { Resolver } from "react-hook-form";
import { useCreateCompany, useUpdateCompany } from "@/lib/queries/use-companies";
import { useMetadata } from "@/lib/queries/use-metadata";

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
import { FormField } from "@/components/form/form-field";

interface CompanyFormCreateProps {
  readonly mode: "create";
  readonly defaultValues?: undefined;
  readonly businessNumber?: undefined;
  readonly companyId?: undefined;
}

interface CompanyFormEditProps {
  readonly mode: "edit";
  readonly defaultValues: UpdateCompanyRequest;
  readonly businessNumber: string;
  readonly companyId: number;
  readonly onSuccess?: () => void;
  readonly onCancel?: () => void;
  readonly variant?: "card" | "plain";
}

type CompanyFormProps = CompanyFormCreateProps | CompanyFormEditProps;

export function CompanyForm(props: CompanyFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const variant = isEdit ? (props.variant ?? "card") : "card";

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const mutation = isEdit ? updateMutation : createMutation;
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
  } = useForm<CreateCompanyRequest>({
    resolver: standardSchemaResolver(
      isEdit ? updateCompanyRequestSchema : createCompanyRequestSchema,
    ) as unknown as Resolver<CreateCompanyRequest>,
    defaultValues: isEdit
      ? { ...props.defaultValues, businessNumber: "" }
      : {
          name: "",
          businessNumber: "",
          region: undefined,
          subRegion: "",
          industryCategory: undefined,
          industrySubCategory: "",
          employeeCount: undefined,
          foreignWorkerCount: undefined,
          address: "",
          contactPhone: "",
        },
  });

  const onSubmit = (data: CreateCompanyRequest) => {
    if (isEdit) {
      const updateData = updateCompanyRequestSchema.parse(data);
      updateMutation.mutate(
        { id: props.companyId, data: updateData },
        {
          onSuccess: () => {
            toast.success("사업장이 수정되었습니다");
            if (props.onSuccess) {
              props.onSuccess();
            } else {
              router.push(`/companies/${props.companyId}`);
            }
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (company) => {
          toast.success("사업장이 등록되었습니다");
          router.push(`/companies/${company.id}`);
        },
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && props.onCancel) {
      props.onCancel();
      return;
    }

    router.back();
  };

  const formFields = (
    <>
      <FormField
        label="회사명"
        name="name"
        register={register}
        errors={errors}
        placeholder="주식회사 OO"
      />

      {isEdit ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="businessNumber">사업자번호</Label>
          <Input id="businessNumber" value={props.businessNumber} disabled />
        </div>
      ) : (
        <FormField
          label="사업자번호"
          name="businessNumber"
          register={register}
          errors={errors}
          placeholder="xxx-xx-xxxxx"
        />
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="region">지역</Label>
        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger
                id="region"
                aria-label="지역"
                aria-invalid={!!errors.region}
                className="w-full"
              >
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

      <FormField
        label="세부 지역 (선택)"
        name="subRegion"
        register={register}
        errors={errors}
        placeholder="강남구"
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="industryCategory">업종</Label>
        <Controller
          name="industryCategory"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger
                id="industryCategory"
                aria-label="업종"
                aria-invalid={!!errors.industryCategory}
                className="w-full"
              >
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

      <FormField
        label="세부 업종 (선택)"
        name="industrySubCategory"
        register={register}
        errors={errors}
        placeholder="전자부품"
      />

      <FormField
        label="주소"
        name="address"
        register={register}
        errors={errors}
        placeholder="서울시 강남구 테헤란로 123"
        className="flex flex-col gap-1.5 md:col-span-2"
      />

      <FormField
        label="연락처"
        name="contactPhone"
        register={register}
        errors={errors}
        type="tel"
        placeholder="02-1234-5678"
      />

      <FormField
        label="이메일 (선택)"
        name="contactEmail"
        register={register}
        errors={errors}
        type="email"
        placeholder="contact@company.com"
      />

      {/* 인원 정보 */}
      <div className="space-y-4 rounded-lg border border-dashed p-4 md:col-span-2">
        <p className="text-sm font-medium text-muted-foreground">
          인원 정보 (고용 한도 산정에 사용)
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            label="총 직원 수"
            name="employeeCount"
            register={register}
            errors={errors}
            type="number"
            placeholder="50"
            registerOptions={{ valueAsNumber: true }}
            description="내·외국인 포함 상시근로자"
          />

          <FormField
            label="내국인 피보험자 수"
            name="domesticInsuredCount"
            register={register}
            errors={errors}
            type="number"
            placeholder="40"
            registerOptions={{ setValueAs: (v: string) => (v === "" ? undefined : Number(v)) }}
            description="고용 한도 산정 기준 (선택)"
          />

          <FormField
            label="외국인 근로자 수"
            name="foreignWorkerCount"
            register={register}
            errors={errors}
            type="number"
            placeholder="10"
            registerOptions={{ valueAsNumber: true }}
            description="현재 고용 중인 외국인"
          />
        </div>
      </div>

      {/* 벤치마크 진단용 (선택) */}
      <div className="space-y-4 rounded-lg border border-dashed p-4 md:col-span-2">
        <p className="text-sm font-medium text-muted-foreground">벤치마크 진단용 (선택)</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="averageForeignWorkerWage">외국인 근로자 평균 월임금</Label>
            <Controller
              name="averageForeignWorkerWage"
              control={control}
              render={({ field }) => (
                <Input
                  id="averageForeignWorkerWage"
                  type="number"
                  placeholder="만원 단위"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                  aria-invalid={!!errors.averageForeignWorkerWage}
                />
              )}
            />
            <p className="text-sm text-muted-foreground">
              미입력 시 임금 포지셔닝 진단이 생략됩니다
            </p>
            {errors.averageForeignWorkerWage && (
              <p className="text-sm text-destructive">{errors.averageForeignWorkerWage.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="recentYearTerminationCount">최근 1년 퇴사 외국인 수</Label>
            <Controller
              name="recentYearTerminationCount"
              control={control}
              render={({ field }) => (
                <Input
                  id="recentYearTerminationCount"
                  type="number"
                  placeholder="명"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                  aria-invalid={!!errors.recentYearTerminationCount}
                />
              )}
            />
            <p className="text-sm text-muted-foreground">미입력 시 고용 안정성 진단이 생략됩니다</p>
            {errors.recentYearTerminationCount && (
              <p className="text-sm text-destructive">
                {errors.recentYearTerminationCount.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const formActions = (
    <>
      <Button type="button" variant="outline" onClick={handleCancel}>
        취소
      </Button>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (isEdit ? "수정 중..." : "등록 중...") : isEdit ? "수정" : "등록"}
      </Button>
    </>
  );

  const form = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={variant === "plain" ? "space-y-6" : undefined}
    >
      {variant === "plain" ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">{formFields}</div>
      ) : (
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">{formFields}</CardContent>
      )}
      {variant === "plain" ? (
        <div className="flex justify-end gap-2">{formActions}</div>
      ) : (
        <CardFooter className="flex justify-end gap-2">{formActions}</CardFooter>
      )}
    </form>
  );

  if (variant === "plain") {
    return form;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "사업장 수정" : "사업장 등록"}</CardTitle>
      </CardHeader>
      {form}
    </Card>
  );
}
