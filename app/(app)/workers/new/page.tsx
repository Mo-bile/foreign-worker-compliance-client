import { WorkerForm } from "@/components/workers/worker-form";

export default function NewWorkerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">근로자 등록</h1>
      <WorkerForm mode="create" />
    </div>
  );
}
