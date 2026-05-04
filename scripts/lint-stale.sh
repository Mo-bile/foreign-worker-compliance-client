#!/usr/bin/env bash
set -e

# Stale 1: INACTIVE 잔존 (테스트/문서/build 산출물 제외)
INACTIVE_HITS=$(grep -rn "INACTIVE" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=__tests__ \
  --exclude-dir=.next \
  --exclude-dir=.worktrees \
  --exclude-dir=docs \
  . || true)

if [ -n "$INACTIVE_HITS" ]; then
  echo "❌ INACTIVE 문자열 잔존:"
  echo "$INACTIVE_HITS"
  exit 1
fi

# Stale 2: Company foreignWorkerCount / recentYearTerminationCount 잔존
# benchmark 도메인 (BE benchmark response 별개 필드)은 grep -v로 후처리 제외
COMPANY_HITS=$(grep -rn "foreignWorkerCount\|recentYearTerminationCount" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=__tests__ \
  --exclude-dir=.next \
  --exclude-dir=.worktrees \
  --exclude-dir=docs \
  . \
  | grep -v "types/benchmark.ts" \
  | grep -v "components/benchmark/" \
  | grep -v "mocks/benchmark-data.ts" \
  || true)

if [ -n "$COMPANY_HITS" ]; then
  echo "❌ Company foreignWorkerCount/recentYearTerminationCount 잔존:"
  echo "$COMPANY_HITS"
  exit 1
fi

echo "✅ Stale scan 통과"
