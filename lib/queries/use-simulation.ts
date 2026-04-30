import { useMutation } from "@tanstack/react-query";
import type { SimulationRequest, SimulationResponse } from "@/types/simulator";
import { mutateApi } from "@/lib/queries/query-utils";

export function useSimulation(companyId: number | null) {
  return useMutation<SimulationResponse, Error, SimulationRequest>({
    mutationFn: (data) => {
      if (companyId === null) {
        return Promise.reject(new Error("사업장을 먼저 선택해주세요"));
      }
      return mutateApi<SimulationResponse>(
        "/api/simulations",
        "POST",
        { ...data, companyId },
        "예상 계산 요청에 실패했습니다",
      );
    },
  });
}
