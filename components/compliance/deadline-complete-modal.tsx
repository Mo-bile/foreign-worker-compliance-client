"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteDeadline } from "@/lib/queries/use-compliance";
import {
  DEADLINE_COMPLETION_FIELDS,
  NEXT_DUE_DATE_LABEL,
  completeDeadlinePayloadSchema,
  type CompleteDeadlinePayload,
  type CompletionFieldKey,
} from "@/types/compliance";
import {
  DEADLINE_TYPE_LABELS,
  getKoreaTodayIsoDate,
  type ComplianceDeadlineResponse,
  type DeadlineType,
} from "@/types/api";

interface DeadlineCompleteModalProps {
  readonly deadline: ComplianceDeadlineResponse | null;
  readonly onClose: () => void;
}

const FIELD_LABEL: Record<Exclude<CompletionFieldKey, "nextDueDate">, string> = {
  completedAt: "완료일",
  renewedUntil: "갱신 만료일",
  referenceNumber: "증권번호",
  evidenceUrl: "증빙 URL",
  note: "메모",
};

function fieldLabel(name: CompletionFieldKey, type: DeadlineType): string {
  if (name === "nextDueDate") {
    return NEXT_DUE_DATE_LABEL[type] ?? "다음 기한";
  }
  return FIELD_LABEL[name];
}

export function DeadlineCompleteModal({ deadline, onClose }: DeadlineCompleteModalProps) {
  const mutation = useCompleteDeadline();
  const form = useForm<CompleteDeadlinePayload>({
    resolver: standardSchemaResolver(
      completeDeadlinePayloadSchema,
    ) as unknown as Resolver<CompleteDeadlinePayload>,
    defaultValues: { completedAt: getKoreaTodayIsoDate() },
  });

  useEffect(() => {
    if (deadline) {
      form.reset({ completedAt: getKoreaTodayIsoDate() });
    }
  }, [deadline, form]);

  if (!deadline) {
    return null;
  }

  const activeDeadline = deadline;
  const fields = DEADLINE_COMPLETION_FIELDS[activeDeadline.deadlineType];

  function onSubmit(body: CompleteDeadlinePayload) {
    mutation.mutate(
      { id: activeDeadline.id, body },
      {
        onSuccess: (summary) => {
          const created = summary.createdDeadlines;
          if (created.length === 0) {
            toast.success("완료 처리되었습니다");
          } else {
            const first = created[0];
            const dueLabel = new Date(first.dueDate).toLocaleDateString("ko-KR");
            const extra = created.length > 1 ? ` (외 ${created.length - 1}건)` : "";
            toast.success(
              `완료 처리되었습니다. 다음 데드라인이 ${dueLabel}에 자동 생성되었습니다${extra}.`,
            );
          }
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{DEADLINE_TYPE_LABELS[activeDeadline.deadlineType]} 완료</DialogTitle>
          <DialogDescription>
            {activeDeadline.description} · 현재 기한 {activeDeadline.dueDate}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {fields.map((name) => (
            <FieldRenderer
              key={name}
              name={name}
              type={activeDeadline.deadlineType}
              register={form.register}
              errors={form.formState.errors}
            />
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "처리 중..." : "완료"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FieldRendererProps {
  readonly name: CompletionFieldKey;
  readonly type: DeadlineType;
  readonly register: ReturnType<typeof useForm<CompleteDeadlinePayload>>["register"];
  readonly errors: ReturnType<typeof useForm<CompleteDeadlinePayload>>["formState"]["errors"];
}

function FieldRenderer({ name, type, register, errors }: FieldRendererProps) {
  const label = fieldLabel(name, type);
  const error = errors[name]?.message as string | undefined;

  if (name === "completedAt" || name === "nextDueDate" || name === "renewedUntil") {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Input id={name} type="date" {...register(name)} aria-invalid={!!error} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (name === "evidenceUrl") {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          type="url"
          placeholder="https://..."
          {...register(name)}
          aria-invalid={!!error}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (name === "note") {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Textarea id={name} rows={3} {...register(name)} aria-invalid={!!error} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type="text" {...register(name)} aria-invalid={!!error} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
