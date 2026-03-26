import type { TrendMonth } from "@/types/benchmark";

interface TrendTableProps {
  readonly months: readonly TrendMonth[];
}

type FieldKey = "total" | "insurance" | "deadline" | "wage";

const ROW_LABELS: readonly { readonly key: FieldKey; readonly label: string }[] = [
  { key: "total", label: "종합" },
  { key: "insurance", label: "보험" },
  { key: "deadline", label: "데드라인" },
  { key: "wage", label: "임금" },
];

function formatMonth(month: string): string {
  const m = parseInt(month.split(".")[1], 10);
  return `${m}월`;
}

function changeClass(change: number): string {
  if (change > 0) return "text-signal-green";
  if (change < 0) return "text-signal-red";
  return "text-signal-gray";
}

function formatChange(change: number): string {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return "0";
}

export function TrendTable({ months }: TrendTableProps) {
  const lastIdx = months.length - 1;

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b text-muted-foreground">
          <th className="py-2 text-left font-medium">항목</th>
          {months.map((m) => (
            <th key={m.month} className="py-2 text-center font-medium">
              {formatMonth(m.month)}
            </th>
          ))}
          <th className="py-2 text-center font-medium">변동</th>
        </tr>
      </thead>
      <tbody>
        {ROW_LABELS.map((row) => {
          const change = lastIdx > 0 ? months[lastIdx][row.key] - months[lastIdx - 1][row.key] : 0;
          return (
            <tr key={row.key} className="border-b last:border-b-0">
              <td className="py-2 text-muted-foreground">{row.label}</td>
              {months.map((m, idx) => (
                <td
                  key={m.month}
                  className={`py-2 text-center ${idx === lastIdx ? "font-semibold" : ""}`}
                >
                  {m[row.key]}
                </td>
              ))}
              <td className={`py-2 text-center font-medium ${changeClass(change)}`}>
                {formatChange(change)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
