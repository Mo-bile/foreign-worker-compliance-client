import type { FieldError, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
  readonly label: string;
  readonly name: Path<T>;
  readonly register: UseFormRegister<T>;
  readonly errors: FieldErrors<T>;
  readonly type?: "text" | "number" | "date" | "tel" | "email";
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly registerOptions?: Parameters<UseFormRegister<T>>[1];
  readonly children?: React.ReactNode;
  readonly description?: string;
  readonly descriptionId?: string;
}

export function FormField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  disabled,
  className,
  registerOptions,
  children,
  description,
  descriptionId,
}: FormFieldProps<T>) {
  const error = errors[name] as FieldError | undefined;
  return (
    <div className={className ?? "flex flex-col gap-1.5"}>
      <Label htmlFor={name}>{label}</Label>
      {children ?? (
        <Input
          id={name}
          type={type}
          {...register(name, registerOptions)}
          aria-invalid={!!error}
          aria-describedby={descriptionId}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
