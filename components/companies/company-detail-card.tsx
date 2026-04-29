import { Pencil } from "lucide-react";
import { INDUSTRY_CATEGORY_LABELS, REGION_LABELS } from "@/types/api";
import type { CompanyResponse } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CompanyDetailCardProps {
  readonly company: CompanyResponse;
  readonly onEdit?: () => void;
}

export function CompanyDetailCard({ company, onEdit }: CompanyDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">사업장 정보</CardTitle>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              수정
            </Button>
          )}
        </div>
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
      </CardContent>
    </Card>
  );
}
