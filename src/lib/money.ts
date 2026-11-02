export function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
