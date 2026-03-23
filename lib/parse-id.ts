/**
 * Validates and parses a string ID into a positive integer.
 * Returns null if the value is NaN, non-positive, or non-integer.
 */
export function parseId(id: string): number | null {
  const num = Number(id);
  if (Number.isNaN(num) || num <= 0 || !Number.isInteger(num)) return null;
  return num;
}
