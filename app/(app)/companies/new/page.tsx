import { CompanyForm } from "@/components/companies/company-form";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">사업장 등록</h1>
      <CompanyForm mode="create" />
    </div>
  );
}
