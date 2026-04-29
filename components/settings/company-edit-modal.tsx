"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useUpdateCompany } from "@/lib/queries/use-companies";
import { toast } from "sonner";

const emailSchema = z.object({
  contactEmail: z.string().email("올바른 이메일 주소를 입력해주세요"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface CompanyEditModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly companyId: number;
  readonly currentEmail: string | null;
}

export function CompanyEditModal({
  open,
  onClose,
  companyId,
  currentEmail,
}: CompanyEditModalProps) {
  const updateMutation = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    values: { contactEmail: currentEmail ?? "" },
  });

  function onSubmit(data: EmailFormData) {
    updateMutation.mutate(
      {
        id: companyId,
        data: { contactEmail: data.contactEmail } as unknown as Parameters<
          typeof updateMutation.mutate
        >[0]["data"],
      },
      {
        onSuccess: () => {
          toast.success("이메일이 변경되었습니다");
          onClose();
        },
        onError: (error) => {
          toast.error(`변경 실패: ${error.message}`);
        },
      },
    );
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>연락처 이메일 변경</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">이메일</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="example@company.com"
              {...register("contactEmail")}
            />
            {errors.contactEmail && (
              <p className="text-xs text-destructive">{errors.contactEmail.message}</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
