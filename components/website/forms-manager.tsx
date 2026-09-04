"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import {
    createCustomForm,
    deleteCustomForm,
    deleteFormSubmission,
    updateCustomForm,
} from "@/app/(admin)/website/forms/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CustomFormRow = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    fields: {
        label: string;
        name: string;
        type: string;
        required: boolean;
    }[];
    is_active: boolean;
    created_at: string;
};

export type FormSubmissionRow = {
    id: string;
    form_slug: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    data: Record<string, unknown>;
    source: string;
    page_url: string | null;
    created_at: string;
};

function fieldsToText(fields: CustomFormRow["fields"]) {
    return fields
        .map((field) => `${field.label}|${field.type}|${field.required}`)
        .join("\n");
}

function SubmitButton({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: "default" | "outline" | "destructive";
}) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" variant={variant} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Button>
    );
}

export function FormsManager({
    forms,
    submissions,
}: {
    forms: CustomFormRow[];
    submissions: FormSubmissionRow[];
}) {
    const [editingId, setEditingId] = useState<string | null>(null);

    const activeCount = forms.filter((form) => form.is_active).length;

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Forms</h1>
                <p className="text-sm text-muted-foreground">
                    Create custom website forms and review submitted entries.
                </p>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Forms</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">{forms.length}</CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Active Forms</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-emerald-600">
                        {activeCount}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Submissions</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-blue-600">
                        {submissions.length}
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        Create Form
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form action={createCustomForm} className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Form Name</Label>
                                <Input name="name" placeholder="Contact Form" required />
                            </div>

                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input name="slug" placeholder="contact-form" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input name="description" placeholder="Website contact form" />
                        </div>

                        <div className="space-y-2">
                            <Label>Fields</Label>
                            <textarea
                                name="fields"
                                placeholder={"Full Name|text|true\nPhone|tel|true\nEmail|email|false\nMessage|textarea|true"}
                                className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: Label|type|required. Example: Phone|tel|true
                            </p>
                        </div>

                        <div>
                            <SubmitButton>Create Form</SubmitButton>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mb-8 grid gap-3">
                {forms.map((form) => {
                    const isEditing = editingId === form.id;

                    return (
                        <Card key={form.id}>
                            <CardContent className="p-4">
                                {isEditing ? (
                                    <form action={updateCustomForm} className="grid gap-4">
                                        <input type="hidden" name="id" value={form.id} />

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Form Name</Label>
                                                <Input name="name" defaultValue={form.name} required />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Slug</Label>
                                                <Input name="slug" defaultValue={form.slug} required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                name="description"
                                                defaultValue={form.description ?? ""}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Fields</Label>
                                            <textarea
                                                name="fields"
                                                defaultValue={fieldsToText(form.fields)}
                                                className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                defaultChecked={form.is_active}
                                            />
                                            Active on website
                                        </label>

                                        <div className="flex gap-2">
                                            <SubmitButton>Save</SubmitButton>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditingId(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <h2 className="font-semibold">{form.name}</h2>

                                                <Badge variant={form.is_active ? "default" : "secondary"}>
                                                    {form.is_active ? "Active" : "Inactive"}
                                                </Badge>

                                                <Badge variant="outline">{form.slug}</Badge>
                                            </div>

                                            {form.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {form.description}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {form.fields.map((field) => (
                                                    <Badge key={field.name} variant="outline">
                                                        {field.label} · {field.type}
                                                        {field.required ? " · required" : ""}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditingId(form.id)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>

                                            <form action={deleteCustomForm}>
                                                <input type="hidden" name="id" value={form.id} />
                                                <input type="hidden" name="name" value={form.name} />
                                                <SubmitButton variant="destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </SubmitButton>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {forms.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            No custom forms found yet.
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold">Latest Submissions</h2>
                <p className="text-sm text-muted-foreground">
                    Recent website form submissions.
                </p>
            </div>

            <div className="grid gap-3">
                {submissions.map((submission) => (
                    <Card key={submission.id}>
                        <CardContent className="p-4">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">
                                    {submission.customer_name || "Unknown visitor"}
                                </h3>
                                <Badge variant="outline">{submission.form_slug}</Badge>
                                <Badge variant="secondary">{submission.source}</Badge>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {submission.customer_phone || "No phone"}
                                {submission.customer_email ? ` · ${submission.customer_email}` : ""}
                            </div>

                            <div className="mt-3 grid gap-2 rounded-md bg-muted p-3 text-sm">
                                {Object.entries(submission.data).map(([key, value]) => (
                                    <div key={key} className="grid gap-1 sm:grid-cols-3">
                                        <span className="font-medium">{key}</span>
                                        <span className="sm:col-span-2">{String(value)}</span>
                                    </div>
                                ))}
                            </div>

                            {submission.page_url && (
                                <p className="mt-2 truncate text-xs text-muted-foreground">
                                    Page: {submission.page_url}
                                </p>
                            )}

                            <div className="mt-4">
                                <form action={deleteFormSubmission}>
                                    <input type="hidden" name="id" value={submission.id} />
                                    <input type="hidden" name="form_slug" value={submission.form_slug} />
                                    <SubmitButton variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Submission
                                    </SubmitButton>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {submissions.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            No form submissions yet.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}