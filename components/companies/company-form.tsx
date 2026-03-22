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
import { useCreateCompany, useUpdateCompany } from "@/lib/queries/use-companies";

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

export function CompanyForm({ mode, defaultValues, businessNumber, companyId }: CompanyFormProps) {
  const router = useRouter();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = mode === "create" ? createCompanyRequestSchema : updateCompanyRequestSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCompanyRequest | UpdateCompanyRequest>({
    resolver: standardSchemaResolver(schema),
    defaultValues:
      mode === "edit"
        ? defaultValues
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

  const onSubmit = (data: CreateCompanyRequest | UpdateCompanyRequest) => {
    if (mode === "create") {
      createMutation.mutate(data as CreateCompanyRequest, {
        onSuccess: (company) => {
          toast.success("사업장이 등록되었습니다");
          router.push(`/companies/${company.id}`);
        },
      });
    } else {
      updateMutation.mutate(
        { id: companyId, data: data as UpdateCompanyRequest },
        {
          onSuccess: () => {
            toast.success("사업장이 수정되었습니다");
            router.push(`/companies/${companyId}`);
          },
        },
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "사업장 등록" : "사업장 수정"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 회사명 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">회사명</Label>
            <Input
              id="name"
              {...register("name")}
              aria-invalid={!!errors.name}
              placeholder="주식회사 OO"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* 사업자번호 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessNumber">사업자번호</Label>
            {mode === "create" ? (
              <Input
                id="businessNumber"
                {...register("businessNumber" as "name")}
                aria-invalid={!!(errors as Record<string, unknown>).businessNumber}
                placeholder="xxx-xx-xxxxx"
              />
            ) : (
              <Input id="businessNumber" value={businessNumber} disabled />
            )}
            {(errors as Record<string, { message?: string }>).businessNumber && (
              <p className="text-sm text-destructive">
                {(errors as Record<string, { message?: string }>).businessNumber?.message}
              </p>
            )}
          </div>

          {/* 지역 */}
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
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {REGION_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.region && (
              <p className="text-sm text-destructive">{errors.region.message}</p>
            )}
          </div>

          {/* 세부 지역 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subRegion">세부 지역 (선택)</Label>
            <Input id="subRegion" {...register("subRegion")} placeholder="강남구" />
          </div>

          {/* 업종 */}
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
                    {INDUSTRY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {INDUSTRY_CATEGORY_LABELS[cat]}
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

          {/* 세부 업종 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="industrySubCategory">세부 업종 (선택)</Label>
            <Input
              id="industrySubCategory"
              {...register("industrySubCategory")}
              placeholder="전자부품"
            />
          </div>

          {/* 총 직원 수 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employeeCount">총 직원 수</Label>
            <Input
              id="employeeCount"
              type="number"
              {...register("employeeCount", { valueAsNumber: true })}
              aria-invalid={!!errors.employeeCount}
              placeholder="50"
            />
            {errors.employeeCount && (
              <p className="text-sm text-destructive">{errors.employeeCount.message}</p>
            )}
          </div>

          {/* 외국인 근로자 수 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="foreignWorkerCount">외국인 근로자 수</Label>
            <Input
              id="foreignWorkerCount"
              type="number"
              {...register("foreignWorkerCount", { valueAsNumber: true })}
              aria-invalid={!!errors.foreignWorkerCount}
              placeholder="10"
            />
            {errors.foreignWorkerCount && (
              <p className="text-sm text-destructive">{errors.foreignWorkerCount.message}</p>
            )}
          </div>

          {/* 주소 */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              {...register("address")}
              aria-invalid={!!errors.address}
              placeholder="서울시 강남구 테헤란로 123"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* 연락처 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">연락처</Label>
            <Input
              id="contactPhone"
              type="tel"
              {...register("contactPhone")}
              aria-invalid={!!errors.contactPhone}
              placeholder="02-1234-5678"
            />
            {errors.contactPhone && (
              <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === "create"
                ? "등록 중..."
                : "수정 중..."
              : mode === "create"
                ? "등록"
                : "수정"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
