export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
