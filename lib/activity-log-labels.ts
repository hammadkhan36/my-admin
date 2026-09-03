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
    if (eventType.startsWith("member.")) return "Team";
    if (eventType.startsWith("business_settings.")) return "Business";
    if (eventType.startsWith("business_profile.")) return "Business";
    if (eventType.startsWith("business_hours.")) return "Business";
    if (eventType.startsWith("service_area.")) return "Business";
    if (eventType.startsWith("feature_setting.")) return "Features";
    if (eventType.startsWith("subscription.")) return "Subscription";
    if (eventType.startsWith("customer.")) return "Customers";
    if (eventType.startsWith("lead.")) return "Leads";
    if (eventType.startsWith("service.")) return "Services";
    if (eventType.startsWith("appointment.")) return "Appointments";
    if (eventType.startsWith("report.")) return "Reports";
    if (eventType.startsWith("faq.")) return "FAQs";
    if (eventType.startsWith("testimonial.")) return "Testimonials";
    if (eventType.startsWith("media.")) return "Media";
    if (eventType.startsWith("offer.")) return "Offers";
    if (eventType.startsWith("coupon.")) return "Coupons";
    return eventType.split(".")[0] || "System";
}



export function getEventTone(eventType: string) {
    if (eventType.includes("deleted") || eventType.includes("removed")) {
        return "destructive";
    }

    if (
        eventType.includes("created") ||
        eventType.includes("activated") ||
        eventType.includes("requested")
    ) {
        return "success";
    }

    if (
        eventType.includes("updated") ||
        eventType.includes("changed") ||
        eventType.includes("deactivated")
    ) {
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

        case "business_profile.updated":
            return `Business profile updated${details?.business_name ? `: ${String(details.business_name)}` : ""
                }.`;

        case "business_hours.updated":
            return "Business hours were updated.";

        case "service_area.created":
            return `Service area created${details?.area_name ? `: ${String(details.area_name)}` : ""}.`;

        case "service_area.activated":
            return "Service area was activated.";

        case "service_area.deactivated":
            return "Service area was deactivated.";

        case "service_area.deleted":
            return "Service area was deleted.";

        case "service.created":
            return `Service created${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "service.updated":
            return `Service updated${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "service.activated":
            return `Service activated${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "service.deactivated":
            return `Service deactivated${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "service.deleted":
            return `Service deleted${details?.name ? `: ${String(details.name)}` : ""}.`;

        case "appointment.created":
            return `Appointment created${details?.customer_name ? ` for ${String(details.customer_name)}` : ""}.`;

        case "appointment.status_updated":
            return `Appointment status changed from ${String(
                details?.old_status || "none"
            )} to ${String(details?.new_status || details?.status || "new")}.`;


        case "appointment.updated":
            return `Appointment details were updated${details?.date ? ` for ${String(details.date)}` : ""}.`;

        case "appointment.deleted":
            return "Appointment was deleted.";

        case "appointment.website_requested":
            return `Website appointment requested${details?.customer_name ? ` by ${String(details.customer_name)}` : ""}.`;

        case "report.exported":
            return `Report exported${details?.type ? `: ${String(details.type)}` : ""}.`;

        case "faq.created":
            return `FAQ created${details?.question ? `: ${String(details.question)}` : ""}.`;

        case "faq.updated":
            return `FAQ updated${details?.question ? `: ${String(details.question)}` : ""}.`;

        case "faq.deleted":
            return `FAQ deleted${details?.question ? `: ${String(details.question)}` : ""}.`;

        case "testimonial.created":
            return `Testimonial created${details?.customer_name ? `: ${String(details.customer_name)}` : ""}.`;

        case "testimonial.updated":
            return `Testimonial updated${details?.customer_name ? `: ${String(details.customer_name)}` : ""}.`;

        case "testimonial.deleted":
            return `Testimonial deleted${details?.customer_name ? `: ${String(details.customer_name)}` : ""}.`;

        case "media.created":
            return `Media item created${details?.title ? `: ${String(details.title)}` : ""}.`;

        case "media.updated":
            return `Media item updated${details?.title ? `: ${String(details.title)}` : ""}.`;

        case "media.deleted":
            return `Media item deleted${details?.title ? `: ${String(details.title)}` : ""}.`;

        case "offer.created":
            return `Offer created${details?.title ? `: ${String(details.title)}` : ""}.`;

        case "offer.updated":
            return `Offer updated${details?.title ? `: ${String(details.title)}` : ""}.`;

        case "offer.deleted":
            return `Offer deleted${details?.title ? `: ${String(details.title)}` : ""}.`;

        case "coupon.created":
            return `Coupon created${details?.code ? `: ${String(details.code)}` : ""}.`;

        case "coupon.updated":
            return `Coupon updated${details?.code ? `: ${String(details.code)}` : ""}.`;

        case "coupon.deleted":
            return `Coupon deleted${details?.code ? `: ${String(details.code)}` : ""}.`;


        default:
            return formatEventType(eventType);
    }
}



