"use client";

import { Download, Mail } from "lucide-react";
import { toast } from "sonner";

export function ExportButtons() {
  return (
    <div className="flex justify-center gap-3">
      <button
        type="button"
        onClick={() => toast("준비 중입니다")}
        className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
      >
        <Download className="h-4 w-4" />
        PDF로 다운로드
      </button>
      <button
        type="button"
        onClick={() => toast("준비 중입니다")}
        className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
      >
        <Mail className="h-4 w-4" />
        이메일로 전송
      </button>
    </div>
  );
}
