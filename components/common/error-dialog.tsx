'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ErrorDialogProps = {
  readonly message: string | null;
  readonly onClose: () => void;
};

export function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <AlertDialog open={message !== null}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>오류</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
