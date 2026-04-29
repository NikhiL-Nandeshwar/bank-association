/**
 * Joins conditional class names while filtering out empty values.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
