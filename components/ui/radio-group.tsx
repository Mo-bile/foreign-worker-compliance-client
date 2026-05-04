"use client";

import * as React from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { cn } from "@/lib/utils";

interface RadioGroupProps
  extends Omit<React.ComponentProps<typeof BaseRadioGroup>, "value" | "onValueChange"> {
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => (
    <BaseRadioGroup
      ref={ref}
      value={value}
      onValueChange={(v) => onValueChange?.(v as string)}
      className={cn("flex gap-4 text-sm", className)}
      {...props}
    />
  ),
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends React.ComponentProps<typeof Radio.Root> {
  readonly className?: string;
}

const RadioGroupItem = React.forwardRef<HTMLSpanElement, RadioGroupItemProps>(
  ({ className, children, ...props }, ref) => (
    <Radio.Root
      ref={ref}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-full border border-input",
        "focus-visible:outline-2 focus-visible:outline-ring",
        "data-[checked]:border-primary",
        className,
      )}
      {...props}
    >
      <Radio.Indicator className="h-2 w-2 rounded-full bg-primary data-[unchecked]:hidden" />
      {children}
    </Radio.Root>
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
