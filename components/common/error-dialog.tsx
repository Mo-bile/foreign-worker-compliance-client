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
      <AlertDialogContent className="max-w-[340px] p-5">
        <AlertDialogHeader className="space-y-0">
          <AlertDialogTitle className="sr-only">오류 안내</AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] leading-relaxed text-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 sm:justify-stretch">
          <AlertDialogAction onClick={onClose} className="h-9 w-full">
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
