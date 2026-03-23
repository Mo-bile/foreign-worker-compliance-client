import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CompanyProvider } from "@/lib/contexts/company-context";

export default function AppLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </CompanyProvider>
  );
}
