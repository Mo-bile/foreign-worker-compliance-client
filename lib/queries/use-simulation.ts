import { useMutation } from "@tanstack/react-query";
import type { SimulationRequest, SimulationResponse } from "@/types/simulator";
import { mutateApi } from "@/lib/queries/query-utils";

export function useSimulation() {
  return useMutation<SimulationResponse, Error, SimulationRequest>({
    mutationFn: (data) =>
      mutateApi<SimulationResponse>(
        "/api/simulations",
        "POST",
        data,
        "시뮬레이션 요청에 실패했습니다",
      ),
  });
}
