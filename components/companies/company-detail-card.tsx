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
      <CardContent>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">사업자번호</dt>
            <dd className="font-medium font-mono">{company.businessNumber}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">지역</dt>
            <dd className="font-medium">
              {company.regionName}
              {company.subRegion ? ` ${company.subRegion}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">업종</dt>
            <dd className="font-medium">
              {company.industryCategoryName}
              {company.industrySubCategory ? ` (${company.industrySubCategory})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">총 직원 수</dt>
            <dd className="font-medium">{company.employeeCount}명</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">내국인 피보험자 수</dt>
            <dd className="font-medium">
              {company.domesticInsuredCount != null ? `${company.domesticInsuredCount}명` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">외국인 근로자 수</dt>
            <dd className="font-medium">{company.foreignWorkerCount}명</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">주소</dt>
            <dd className="font-medium">{company.address}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">연락처</dt>
            <dd className="font-medium">{company.contactPhone}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
