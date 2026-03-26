interface ImpactBoxProps {
  readonly impacts: readonly string[];
}

export function ImpactBox({ impacts }: ImpactBoxProps) {
  return (
    <div className="rounded-lg bg-secondary p-4">
      <h4 className="mb-2 text-sm font-semibold">귀사 영향 분석</h4>
      <ul className="space-y-1">
        {impacts.map((impact) => (
          <li key={impact} className="text-sm text-muted-foreground">
            → {impact}
          </li>
        ))}
      </ul>
    </div>
  );
}
