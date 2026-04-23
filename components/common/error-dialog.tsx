"use client";

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
      <AlertDialogContent className="max-w-[340px] gap-4 px-5 pb-5 pt-6">
        <AlertDialogHeader className="space-y-0">
          <AlertDialogTitle className="sr-only">오류 안내</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[14px] leading-relaxed text-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-stretch">
          <AlertDialogAction onClick={onClose} className="h-9 w-full">
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
