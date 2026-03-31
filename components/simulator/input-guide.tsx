export function InputGuide() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-secondary p-5">
        <h3 className="mb-3 text-sm font-semibold">입력 가이드</h3>
        <div className="space-y-3 text-[13px] leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">내국인 피보험자 수</strong>는 고용허가제 한도
            계산의 기준이 됩니다. 고용보험 가입 내국인 근로자 수를 정확히 입력해주세요.
          </p>
          <p>
            <strong className="text-foreground">배정 점수</strong>는 사업장의 고용허가 신청 시
            경쟁력을 평가하는 지표입니다. 해당하는 항목을 체크하면 점수가 계산됩니다.
          </p>
          <p>
            <strong className="text-foreground">점수가 높을수록</strong> 같은 차수에서 배정받을
            확률이 높아집니다.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-signal-blue/20 bg-signal-blue-bg p-5">
        <h3 className="mb-3 text-sm font-semibold text-signal-blue">💡 팁</h3>
        <div className="space-y-2 text-[13px] leading-relaxed">
          <p>• 내국인 피보험자를 늘리면 고용 한도가 증가합니다</p>
          <p>• 우수 기숙사 제공 등으로 점수를 높이면 배정 확률이 올라갑니다</p>
          <p>• 자세한 기준은 관할 고용센터에 문의해주세요</p>
        </div>
      </div>
    </div>
  );
}
