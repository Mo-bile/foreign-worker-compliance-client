interface ReportSectionProps {
  readonly icon: string;
  readonly title: string;
  readonly count: number;
  readonly children: React.ReactNode;
}

export function ReportSection({ icon, title, count, children }: ReportSectionProps) {
  return (
    <section className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">
          {icon} {title} ({count}건)
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
