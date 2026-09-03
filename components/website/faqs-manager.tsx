"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { HelpCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import {
    createFaq,
    deleteFaq,
    updateFaq,
} from "@/app/(admin)/website/faqs/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FaqRow = {
    id: string;
    question: string;
    answer: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
};

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

export function FaqsManager({ faqs }: { faqs: FaqRow[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);

    const activeCount = faqs.filter((faq) => faq.is_active).length;

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">FAQs</h1>
                <p className="text-sm text-muted-foreground">
                    Manage website frequently asked questions.
                </p>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total FAQs</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">{faqs.length}</CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Active</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-emerald-600">
                        {activeCount}
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <HelpCircle className="h-4 w-4" />
                        Add FAQ
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form action={createFaq} className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Question</Label>
                            <Input name="question" placeholder="What services do you offer?" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Answer</Label>
                            <textarea
                                name="answer"
                                placeholder="Write the answer here..."
                                required
                                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="space-y-2 sm:max-w-xs">
                            <Label>Sort Order</Label>
                            <Input name="sort_order" type="number" defaultValue={0} />
                        </div>

                        <div>
                            <SubmitButton>Add FAQ</SubmitButton>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-3">
                {faqs.map((faq) => {
                    const isEditing = editingId === faq.id;

                    return (
                        <Card key={faq.id}>
                            <CardContent className="p-4">
                                {isEditing ? (
                                    <form action={updateFaq} className="grid gap-4">
                                        <input type="hidden" name="id" value={faq.id} />

                                        <div className="space-y-2">
                                            <Label>Question</Label>
                                            <Input name="question" defaultValue={faq.question} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Answer</Label>
                                            <textarea
                                                name="answer"
                                                defaultValue={faq.answer}
                                                required
                                                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Sort Order</Label>
                                                <Input
                                                    name="sort_order"
                                                    type="number"
                                                    defaultValue={faq.sort_order}
                                                />
                                            </div>

                                            <label className="flex items-end gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    defaultChecked={faq.is_active}
                                                />
                                                Active on website
                                            </label>
                                        </div>

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
                                                <h2 className="font-semibold">{faq.question}</h2>
                                                <Badge variant={faq.is_active ? "default" : "secondary"}>
                                                    {faq.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                                <Badge variant="outline">Order {faq.sort_order}</Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditingId(faq.id)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>

                                            <form action={deleteFaq}>
                                                <input type="hidden" name="id" value={faq.id} />
                                                <input type="hidden" name="question" value={faq.question} />
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

                {faqs.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            No FAQs found yet. Add your first FAQ above.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}