import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  의무: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  임의: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  면제: "bg-green-100 text-green-800 hover:bg-green-200",
};

export function InsuranceBadge({ status }: { readonly status: string }) {
  return (
    <Badge variant="secondary" className={STATUS_STYLES[status]}>
      {status}
    </Badge>
  );
}
