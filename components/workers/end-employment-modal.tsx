"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMPLOYMENT_END_REASONS,
  EMPLOYMENT_END_REASON_LABELS,
  endEmploymentRequestSchema,
  getKoreaTodayIsoDate,
  INSURANCE_DEREGISTRATION_NOTICE,
} from "@/types/api";
import type { EndEmploymentRequest, EmploymentEndReason } from "@/types/api";
import { useEndEmployment } from "@/lib/queries/use-workers";

interface EndEmploymentModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly workerId: number;
  readonly workerName: string;
}

export function EndEmploymentModal({
  open,
  onClose,
  workerId,
  workerName,
}: EndEmploymentModalProps) {
  const mutation = useEndEmployment(workerId);
  const today = getKoreaTodayIsoDate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EndEmploymentRequest>({
    resolver: zodResolver(endEmploymentRequestSchema),
    defaultValues: {
      endedAt: today,
      reason: undefined,
      employerFault: undefined,
      memo: "",
    },
  });

  const reason = useWatch({ control, name: "reason" });
  const showEmployerFault = reason === "WORKPLACE_CHANGE";

  function onSubmit(data: EndEmploymentRequest) {
    const payload: EndEmploymentRequest = {
      ...data,
      employerFault:
        data.reason === "WORKPLACE_CHANGE" ? (data.employerFault ?? null) : null,
      memo: data.memo?.trim() || null,
    };
    mutation.mutate(payload, {
      onSuccess: (response) => {
        const created = response.createdDeadlines.length;
        const autoCompleted = response.autoCompletedDeadlines.length;
        const preserved = response.preservedDeadlineCount;
        const baseLine =
          `${workerName} 고용종료 처리되었습니다. 고용변동신고 D+15 데드라인이 ${created}건 ` +
          `자동 생성되었고, 미래 데드라인 ${autoCompleted}건이 완료 처리되었습니다.`;
        const preservedLine =
          preserved > 0
            ? `\n※ 출국만기보험 / 임금체불보증보험 등 ${preserved}건은 출국 후에도 처리가 필요해 보존됩니다.`
            : "";
        toast.success(`${baseLine}${preservedLine}\n${INSURANCE_DEREGISTRATION_NOTICE}`);
        onClose();
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-xl! max-h-[90vh] overflow-y-auto p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>고용종료 처리 — {workerName}</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endedAt">고용종료일</Label>
            <Input
              id="endedAt"
              type="date"
              {...register("endedAt")}
              max={today}
              aria-invalid={!!errors.endedAt}
            />
            {errors.endedAt && (
              <p className="text-sm text-destructive">{errors.endedAt.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">종료 사유</Label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v as EmploymentEndReason)}
                >
                  <SelectTrigger id="reason" className="w-full">
                    <SelectValue placeholder="사유 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_END_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {EMPLOYMENT_END_REASON_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {showEmployerFault && (
            <div className="flex flex-col gap-1.5">
              <Label>사업주 귀책 여부</Label>
              <Controller
                name="employerFault"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-4 text-sm">
                    {[
                      { value: "true", label: "예" },
                      { value: "false", label: "아니오" },
                      { value: "null", label: "확인 필요" },
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="employerFault"
                          value={value}
                          checked={
                            (field.value === true && value === "true") ||
                            (field.value === false && value === "false") ||
                            (field.value === null && value === "null")
                          }
                          onChange={() =>
                            field.onChange(
                              value === "true" ? true : value === "false" ? false : null,
                            )
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.employerFault && (
                <p className="text-sm text-destructive">{errors.employerFault.message}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memo">메모 (선택, 최대 500자)</Label>
            <textarea
              id="memo"
              rows={3}
              {...register("memo")}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring resize-none"
            />
            {errors.memo && <p className="text-sm text-destructive">{errors.memo.message}</p>}
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "처리 중..." : "고용종료 처리"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
