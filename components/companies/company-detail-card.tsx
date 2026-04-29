import { INDUSTRY_CATEGORY_LABELS, REGION_LABELS } from "@/types/api";
import type { CompanyResponse } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyDetailCardProps {
  readonly company: CompanyResponse;
}

export function CompanyDetailCard({ company }: CompanyDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">사업장 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">사업자번호</dt>
            <dd className="font-medium font-mono">{company.businessNumber}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">지역</dt>
            <dd className="font-medium">
              {REGION_LABELS[company.region] ?? company.region}
              {company.subRegion ? ` ${company.subRegion}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">업종</dt>
            <dd className="font-medium">
              {INDUSTRY_CATEGORY_LABELS[company.industryCategory] ?? company.industryCategory}
              {company.industrySubCategory ? ` (${company.industrySubCategory})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">주소</dt>
            <dd className="font-medium">{company.address}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">연락처</dt>
            <dd className="font-medium">{company.contactPhone}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">이메일</dt>
            <dd className="font-medium">{company.contactEmail ?? "—"}</dd>
          </div>
        </dl>

        {/* 인원 정보 */}
        <div className="rounded-lg border border-dashed p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            인원 정보 (고용 한도 산정에 사용)
          </p>
          <dl className="grid gap-4 md:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">총 직원 수</dt>
              <dd className="font-medium">{company.employeeCount}명</dd>
              <p className="text-xs text-muted-foreground">내·외국인 포함 상시근로자</p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">내국인 피보험자 수</dt>
              <dd className="font-medium">
                {company.domesticInsuredCount != null ? `${company.domesticInsuredCount}명` : "—"}
              </dd>
              <p className="text-xs text-muted-foreground">고용 한도 산정 기준</p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">외국인 근로자 수</dt>
              <dd className="font-medium">{company.foreignWorkerCount}명</dd>
              <p className="text-xs text-muted-foreground">등록된 외국인 근로자 수</p>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
