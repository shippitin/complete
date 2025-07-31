// src/utils/parseNumber.ts

/**
 * Safely parses a value to a number.
 * Returns undefined if the value is null, undefined, an empty string, or cannot be parsed to a finite number.
 * @param value The value to parse.
 * @returns The parsed number, or undefined.
 */
export const parseNumber = (value: string | number | null | undefined): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return undefined;
  }
  return num;
};
