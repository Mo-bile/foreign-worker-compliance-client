interface H2BadgeProps {
  readonly visaType: string;
}

export function H2Badge({ visaType }: H2BadgeProps) {
  if (visaType !== "H2") return null;

  return (
    <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
      신규 발급 중단
    </span>
  );
}
