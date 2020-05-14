/**
 * Utility function used to check if an input is present. This will
 * follow the html5 attribute behaviour where false is only evaluated
 * if the property is not present.
 */

export function isPropertyPresent(value: any): boolean {
  return value !== null;
}
