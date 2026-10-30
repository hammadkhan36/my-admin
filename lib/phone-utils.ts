// Normalizes a phone number to E.164 (`+<digits>`). Mirrors public.normalize_phone() in SQL.
// `defaultCountryCode` comes from business_settings.default_country_code (e.g. "+92").

const COUNTRY_CODE_PATTERN = /^\+[1-9]\d{0,3}$/;

export function isValidCountryCode(value: string): boolean {
  return COUNTRY_CODE_PATTERN.test(value);
}

// Returns the E.164 number, or null when the input is empty or not a valid phone number.
export function normalizePhone(
  phone: string,
  defaultCountryCode: string
): string | null {
  const cleaned = (phone || "").trim().replace(/[\s().-]/g, "");
  if (!cleaned || !/^\+?\d+$/.test(cleaned)) return null;

  const cc = (isValidCountryCode(defaultCountryCode) ? defaultCountryCode : "+92").slice(1);

  let digits: string;
  if (cleaned.startsWith("+")) {
    digits = cleaned.slice(1);
  } else if (cleaned.startsWith("00")) {
    digits = cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    digits = cc + cleaned.slice(1);
  } else if (cleaned.startsWith(cc) && cleaned.length - cc.length >= 7) {
    digits = cleaned;
  } else {
    digits = cc + cleaned;
  }

  return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : null;
}

// Choices for Business Profile -> Default country code. Any "+<1-4 digits>" is still valid in the DB.
export const COUNTRY_CODES = [
  { code: "+92", label: "Pakistan (+92)" },
  { code: "+91", label: "India (+91)" },
  { code: "+880", label: "Bangladesh (+880)" },
  { code: "+94", label: "Sri Lanka (+94)" },
  { code: "+977", label: "Nepal (+977)" },
  { code: "+93", label: "Afghanistan (+93)" },
  { code: "+971", label: "United Arab Emirates (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+965", label: "Kuwait (+965)" },
  { code: "+968", label: "Oman (+968)" },
  { code: "+973", label: "Bahrain (+973)" },
  { code: "+90", label: "Turkey (+90)" },
  { code: "+20", label: "Egypt (+20)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+1", label: "United States / Canada (+1)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+234", label: "Nigeria (+234)" },
] as const;
