import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Clock, Mail, Phone, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentActionForm } from "@/components/appointments/appointment-action-form";
import {
    deleteAppointmentSafe,
    updateAppointmentStatusSafe,
} from "@/app/(admin)/appointments/actions";

import { AppointmentEditForm } from "@/components/appointments/appointment-edit-form";

type AppointmentDetail = {
    id: string;
    customer_id: string | null;
    lead_id: string | null;
    service_id: string | null;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    appointment_date: string;
    appointment_time: string;
    status: string;
    source: string;
    notes: string | null;
    created_at: string;
    customers: {
        id: string;
        name: string;
        phone: string;
        email: string | null;
    } | null;
    services: {
        id: string;
        name: string;
        price: number | null;
        duration_minutes: number | null;
    } | null;
};


type StatusHistoryRow = {
    id: string;
    old_status: string | null;
    new_status: string;
    note: string | null;
    created_at: string;
    profiles:
    | {
        full_name: string | null;
        email: string | null;
    }
    | {
        full_name: string | null;
        email: string | null;
    }[]
    | null;
};



type ActivityRow = {
    id: string;
    event_type: string;
    details: Record<string, unknown> | null;
    created_at: string;
    profiles:
    | {
        full_name: string | null;
        email: string | null;
    }
    | {
        full_name: string | null;
        email: string | null;
    }[]
    | null;
};

function statusVariant(status: string) {
    if (status === "approved" || status === "completed") return "default";
    if (status === "rejected" || status === "cancelled" || status === "no_show") {
        return "destructive";
    }
    return "secondary";
}

function getActorName(profile: ActivityRow["profiles"]) {
    const actor = Array.isArray(profile) ? profile[0] : profile;
    return actor?.full_name || actor?.email || "System";
}

export default async function AppointmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await requirePermission("appointments.view");

    const { id } = await params;
    const supabase = await createClient();

    const [{ data: appointment, error }, { data: logs }, { data: services }, { data: statusHistory },] = await Promise.all([
        supabase
            .from("appointments")
            .select(
                `
                id,
                customer_id,
                lead_id,
                service_id,
                customer_name,
                customer_phone,
                customer_email,
                appointment_date,
                appointment_time,
                status,
                source,
                notes,
                created_at,
                customers:customer_id (
                    id,
                    name,
                    phone,
                    email
                ),
                services:service_id (
                    id,
                    name,
                    price,
                    duration_minutes
                )
                `
            )
            .eq("id", id)
            .maybeSingle(),

        supabase
            .from("audit_logs")
            .select(
                `
      id,
      event_type,
      details,
      created_at,
      profiles:actor_id (
        full_name,
        email
      )
    `
            )
            .eq("target_type", "appointment")
            .eq("target_id", id)
            .order("created_at", { ascending: false })
            .limit(20),

        supabase
            .from("services")
            .select("id, name")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),

        supabase
            .from("appointment_status_history")
            .select(
                `
                id,
                old_status,
                new_status,
                note,
                created_at,
                profiles:changed_by (
                full_name,
                email
                )
            `
            )
            .eq("appointment_id", id)
            .order("created_at", { ascending: false }),
    ]);

    if (error) throw new Error(error.message);
    if (!appointment) notFound();

    const item: AppointmentDetail = {
        ...appointment,
        customers: Array.isArray(appointment.customers)
            ? appointment.customers[0] ?? null
            : appointment.customers,
        services: Array.isArray(appointment.services)
            ? appointment.services[0] ?? null
            : appointment.services,
    };
    const activities = (logs ?? []) as ActivityRow[];
    const serviceOptions = (services ?? []) as { id: string; name: string }[];
    const history = (statusHistory ?? []) as StatusHistoryRow[];

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <Link
                        href="/appointments"
                        className="mb-2 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to appointments
                    </Link>

                    <h1 className="text-2xl font-bold">Appointment Detail</h1>
                    <p className="text-sm text-muted-foreground">
                        Full appointment record with customer, service and activity history.
                    </p>
                </div>

                <Badge variant={statusVariant(item.status)} className="w-fit text-sm capitalize">
                    {item.status.replace("_", " ")}
                </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Appointment</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="flex gap-3">
                            <CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">{item.appointment_date}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="font-medium">{item.appointment_time}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Source</p>
                            <p className="font-medium capitalize">{item.source}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Service</p>
                            <p className="font-medium">{item.services?.name || "No service selected"}</p>
                            {item.services && (
                                <p className="text-xs text-muted-foreground">
                                    {item.services.duration_minutes ? `${item.services.duration_minutes} min` : ""}
                                    {item.services.price !== null ? ` · ${item.services.price}` : ""}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="font-medium">{item.notes || "No notes added."}</p>
                        </div>
                    </CardContent>
                </Card>


                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit / Reschedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AppointmentEditForm appointment={item} services={serviceOptions} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex gap-3">
                            <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{item.customer_name}</p>
                                {item.customer_id && (
                                    <Link
                                        href={`/crm/customers/${item.customer_id}`}
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        Open customer profile
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{item.customer_phone}</p>
                        </div>

                        {item.customer_email && (
                            <div className="flex gap-3">
                                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <p className="text-sm">{item.customer_email}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Update Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {["pending", "approved", "completed", "rejected", "cancelled", "no_show"].map(
                            (status) => (
                                <AppointmentActionForm
                                    key={status}
                                    action={updateAppointmentStatusSafe}
                                    fields={{
                                        id: item.id,
                                        status,
                                    }}
                                >
                                    {status.replace("_", " ")}
                                </AppointmentActionForm>
                            )
                        )}

                        <AppointmentActionForm
                            action={deleteAppointmentSafe}
                            fields={{ id: item.id }}
                            variant="destructive"
                        >
                            Delete
                        </AppointmentActionForm>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Status History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {history.map((item) => (
                            <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                                <p className="text-sm font-medium capitalize">
                                    {item.old_status ? `${item.old_status} → ${item.new_status}` : item.new_status}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {getActorName(item.profiles)} ·{" "}
                                    {formatDistanceToNow(new Date(item.created_at), {
                                        addSuffix: true,
                                    })}
                                </p>
                                {item.note && (
                                    <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                                )}
                            </div>
                        ))}

                        {history.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No status history recorded yet.
                            </p>
                        )}
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {activities.map((activity) => (
                            <div key={activity.id} className="border-b pb-3 last:border-0 last:pb-0">
                                <p className="text-sm font-medium">
                                    {activity.event_type.replaceAll("_", " ").replaceAll(".", " ")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {getActorName(activity.profiles)} ·{" "}
                                    {formatDistanceToNow(new Date(activity.created_at), {
                                        addSuffix: true,
                                    })}
                                </p>
                            </div>
                        ))}

                        {activities.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No activity recorded for this appointment yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}