export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN").format(amount);
  // Returns "8,000" — prefix ₹ separately in JSX
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  // Returns "26 May 2026"
}

export function isWeekendStay(isoDate: string): boolean {
  if (!isoDate) return false;
  const day = new Date(isoDate).getDay();
  return day === 5 || day === 6; // Fri or Sat check-in = weekend
}

export function calcStayNights(checkInIso: string, checkOutIso: string): number {
  if (!checkInIso || !checkOutIso) return 0;
  const diff = new Date(checkOutIso).getTime() - new Date(checkInIso).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function normalizePhone(raw: string): string {
  // Strip all non-digits
  const digits = raw.replace(/\D/g, "");
  // Ensure starts with 91 (India)
  return digits.startsWith("91") ? digits : `91${digits}`;
}
