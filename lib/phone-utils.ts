export function normalizePhone(phone: string): string {
  if (!phone) return "";
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");
  
  // Convert local format to international (+92 for Pakistan, change as needed)
  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.slice(1);
  } else if (cleaned.startsWith("92")) {
    // already ok
  } else if (cleaned.startsWith("0092")) {
    cleaned = cleaned.slice(2); // remove leading 00
  } else if (cleaned.startsWith("+92")) {
    cleaned = cleaned.slice(1); // remove +
  }
  
  // Ensure +92 prefix
  if (!cleaned.startsWith("92")) {
    cleaned = "92" + cleaned;
  }
  
  return "+" + cleaned;
}