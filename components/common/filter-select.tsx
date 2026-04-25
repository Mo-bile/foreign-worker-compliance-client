import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps<T extends string> {
  readonly value: T | "ALL";
  readonly onValueChange: (value: T | "ALL") => void;
  readonly placeholder: string;
  readonly options: readonly T[];
  readonly labelMap?: Readonly<Record<T, string>>;
  readonly className?: string;
}

export function FilterSelect<T extends string>({
  value,
  onValueChange,
  placeholder,
  options,
  labelMap,
  className = "w-48",
}: FilterSelectProps<T>) {
  const displayLabel =
    value === "ALL"
      ? placeholder
      : labelMap
        ? labelMap[value as T]
        : value;

  return (
    <Select value={value as string} onValueChange={(v) => onValueChange(v as T | "ALL")}>
      <SelectTrigger className={className} aria-label={placeholder}>
        <span className="truncate">{displayLabel}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">전체</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labelMap ? labelMap[option] : option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
