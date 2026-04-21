"use client";

import { CircleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  readonly message: string | null;
  readonly onClose: () => void;
}

export function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <AlertDialog open={message !== null}>
      <AlertDialogContent className="max-w-[360px] gap-0 overflow-hidden p-0">
        <div className="border-b border-signal-red/20 bg-signal-red-bg px-5 py-4">
          <AlertDialogHeader className="flex-row items-center gap-2.5 space-y-0">
            <CircleAlert className="h-[18px] w-[18px] shrink-0 text-signal-red" />
            <AlertDialogTitle className="text-[13px] font-semibold text-signal-red">
              오류 안내
            </AlertDialogTitle>
          </AlertDialogHeader>
        </div>
        <div className="px-5 py-5">
          <AlertDialogDescription className="text-[14px] leading-relaxed text-foreground">
            {message}
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter className="border-t px-5 py-3 sm:justify-stretch">
          <AlertDialogAction onClick={onClose} className="h-9 w-full text-[13px]">
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
