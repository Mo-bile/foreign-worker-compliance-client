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
}

type CompanyFormProps = CompanyFormCreateProps | CompanyFormEditProps;

export function CompanyForm(props: CompanyFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";

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
      const { businessNumber: _, ...updateData } = data;
      updateMutation.mutate(
        { id: props.companyId, data: updateData as UpdateCompanyRequest },
        {
          onSuccess: () => {
            toast.success("사업장이 수정되었습니다");
            router.push(`/companies/${props.companyId}`);
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (company) => {
          toast.success("사업장이 등록되었습니다");
          router.push(`/companies/${company.id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "사업장 수정" : "사업장 등록"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <SelectValue placeholder="지역 선택" />
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
                    <SelectValue placeholder="업종 선택" />
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
            label="총 직원 수"
            name="employeeCount"
            register={register}
            errors={errors}
            type="number"
            placeholder="50"
            registerOptions={{ valueAsNumber: true }}
          />

          <FormField
            label="외국인 근로자 수"
            name="foreignWorkerCount"
            register={register}
            errors={errors}
            type="number"
            placeholder="10"
            registerOptions={{ valueAsNumber: true }}
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
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (isEdit ? "수정 중..." : "등록 중...") : isEdit ? "수정" : "등록"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
