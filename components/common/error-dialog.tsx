"use client";

import { OctagonAlert } from "lucide-react";
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
      <AlertDialogContent className="max-w-sm gap-6 p-6">
        <AlertDialogHeader className="space-y-0">
          <AlertDialogTitle className="sr-only">알림</AlertDialogTitle>
          <AlertDialogDescription className="flex items-center gap-3 text-[15px] leading-relaxed text-foreground">
            <OctagonAlert className="h-5 w-5 shrink-0 text-signal-red" />
            <span>{message}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-stretch">
          <AlertDialogAction onClick={onClose} className="w-full">
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
