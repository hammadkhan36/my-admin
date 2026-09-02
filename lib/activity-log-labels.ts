// Activity Log Types/Labels Helper
// Ye event names ko readable banayega. Example:

// member.permission_override_updated -> Member Permission Override Updated


export function formatEventType(eventType: string) {
  return eventType
    .split(".")
    .map((part) => part.replaceAll("_", " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getEventModule(eventType: string) {
  return eventType.split(".")[0] || "system";
}

export function getEventTone(eventType: string) {
  if (eventType.includes("deleted") || eventType.includes("removed")) {
    return "destructive";
  }

  if (eventType.includes("created") || eventType.includes("activated")) {
    return "success";
  }

  if (eventType.includes("updated") || eventType.includes("changed")) {
    return "warning";
  }

  return "default";
}