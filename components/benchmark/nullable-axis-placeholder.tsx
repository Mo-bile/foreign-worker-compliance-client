"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface NullableAxisPlaceholderProps {
  readonly title: string;
  readonly fieldLabel: string;
  readonly companyId: number;
}

export function NullableAxisPlaceholder({
  title,
  fieldLabel,
  companyId,
}: NullableAxisPlaceholderProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-xs text-muted-foreground">데이터가 입력되지 않았습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">
          사업장 정보에서 {fieldLabel}을(를) 입력하면 진단이 활성화됩니다
        </p>
        <Link
          href={`/companies/${companyId}/edit`}
          className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          사업장 정보 수정
        </Link>
      </CardContent>
    </Card>
  );
}
