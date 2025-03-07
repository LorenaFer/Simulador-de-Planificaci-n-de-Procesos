/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Safely parses a JSON string
 * @param jsonString - The JSON string to parse
 * @returns The parsed object or null if parsing fails
 */
export const safeJsonParse = <T>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    return null;
  }
};

/**
 * Sleep for the specified duration
 * @param ms - Duration in milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Returns a number clamped between min and max (inclusive)
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Format a duration in milliseconds to a human-readable string
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}; 