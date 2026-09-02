// Activity Log Types/Labels Helper
// Ye event names ko readable banayega. Example:

// member.permission_override_updated -> Member Permission Override Updated


// UI mein readable message show hoga, 
// aur niche technical event bhi small text mein rahega debugging ke liye


type ActivityDetails = Record<string, unknown> | null | undefined;

function readable(value: unknown) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "boolean") return value ? "Allowed" : "Denied";
    if (typeof value === "number") return String(value);
    return "";
}

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

export function getFriendlyActivityMessage(
    eventType: string,
    details?: ActivityDetails
) {
    const permission = readable(details?.permission_key);
    const role = readable(details?.role);
    const email = readable(details?.email);
    const allowed = readable(details?.allowed);

    switch (eventType) {
        case "member.created":
            return email
                ? `New team member created with ${role || "selected"} role: ${email}.`
                : "New team member created.";

        case "member.activated":
            return "Team member account was activated.";

        case "member.deactivated":
            return "Team member account was deactivated.";

        case "member.deleted":
            return "Team member account was deleted.";

        case "member.password_updated":
            return "Team member password was updated.";

        case "member.role_updated":
            return role ? `Team member role was changed to ${role}.` : "Team member role was changed.";

        case "member.permission_override_updated":
            return permission
                ? `Permission ${permission} was changed to ${allowed}.`
                : "Member permission was updated.";

        case "member.permission_override_removed":
            return permission
                ? `Custom permission override was removed for ${permission}.`
                : "Custom permission override was removed.";

        case "business_settings.updated":
            return "Business branding/contact settings were updated.";

        case "subscription.updated":
            return `Subscription was updated${role ? ` for ${role}` : ""}.`;

        case "feature_setting.updated":
            return "Feature access setting was updated.";

        case "customer.created":
            return `Customer created${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "customer.deleted":
            return `Customer deleted${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "customer.duplicate_phone_detected":
            return "Duplicate customer phone number was detected.";

        case "customer.updated":
            return `Customer updated${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "lead.created":
            return `Lead created${details?.name ? `: ${String(details.name)}` : ""}${details?.source ? ` from ${String(details.source)}` : ""
                }.`;

        case "lead.status_changed":
            return `Lead status changed from ${String(details?.old_status || "none")} to ${String(details?.new_status || "new")}.`;

        case "lead.note_added":
            return "Note added to lead.";

        case "lead.deleted":
            return `Lead deleted${details?.name ? `: ${String(details.name)}` : ""}.`;

        default:
            return formatEventType(eventType);
    }
}



