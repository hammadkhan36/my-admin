"use client";

import { Fragment, useActionState, useEffect, useState } from "react";

import { KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    createTeamMember,
    deleteTeamMember,
    setMemberActive,
    updateMemberPassword,
} from "@/app/(admin)/team/staff/actions";
import type { AppRole } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type TeamMember = {
    id: string;
    full_name: string | null;
    email: string;
    role: AppRole;
    is_active: boolean;
    created_at: string;
};

const initialState = {
    success: false,
};

export function StaffManager({ members }: { members: TeamMember[] }) {
    const [showForm, setShowForm] = useState(false);
    const [passwordMemberId, setPasswordMemberId] = useState<string | null>(null);
    const [state, action, pending] = useActionState(
        createTeamMember,
        initialState
    );

    useEffect(() => {
        if (!state.message) return;

        if (state.success) {
            toast.success(state.message);
            setShowForm(false);
        } else {
            toast.error(state.message);
        }
    }, [state]);

    const activeCount = members.filter((member) => member.is_active).length;

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Team Members</h1>
                    <p className="text-sm text-muted-foreground">
                        Create and control Admin, Manager, Supervisor and Staff accounts.
                    </p>
                </div>

                <Button onClick={() => setShowForm((value) => !value)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Create team member</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form action={action} className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full name</Label>
                                <Input id="fullName" name="fullName" required />
                                {state.errors?.fullName?.map((error) => (
                                    <p key={error} className="text-xs text-destructive">
                                        {error}
                                    </p>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required />
                                {state.errors?.email?.map((error) => (
                                    <p key={error} className="text-xs text-destructive">
                                        {error}
                                    </p>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary password</Label>
                                <Input id="password" name="password" type="password" required />
                                {state.errors?.password?.map((error) => (
                                    <p key={error} className="text-xs text-destructive">
                                        {error}
                                    </p>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    name="role"
                                    defaultValue="staff"
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>

                            <div className="flex gap-2 md:col-span-2">
                                <Button type="submit" disabled={pending}>
                                    {pending ? "Creating..." : "Create member"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {members.length}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Active</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-emerald-600">
                        {activeCount}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Inactive</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-red-600">
                        {members.length - activeCount}
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {members.map((member) => (
                            <Fragment key={member.id}>
                                <TableRow>
                                    <TableCell className="font-medium">
                                        {member.full_name || "Unnamed"}
                                    </TableCell>

                                    <TableCell>{member.email}</TableCell>

                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {member.role}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={member.is_active ? "secondary" : "outline"}>
                                            {member.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {!(["superadmin", "owner"] as AppRole[]).includes(member.role) && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setPasswordMemberId(
                                                            passwordMemberId === member.id ? null : member.id
                                                        )
                                                    }
                                                >
                                                    <KeyRound className="mr-1 h-3.5 w-3.5" />
                                                    Password
                                                </Button>

                                                <form
                                                    action={setMemberActive.bind(
                                                        null,
                                                        member.id,
                                                        !member.is_active
                                                    )}
                                                >
                                                    <Button type="submit" size="sm" variant="outline">
                                                        {member.is_active ? "Deactivate" : "Activate"}
                                                    </Button>
                                                </form>

                                                <form action={deleteTeamMember.bind(null, member.id)}>
                                                    <Button type="submit" size="sm" variant="destructive">
                                                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                        Delete
                                                    </Button>
                                                </form>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>

                                {passwordMemberId === member.id && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="bg-muted/40">
                                            <form
                                                action={updateMemberPassword}
                                                className="flex flex-col gap-2 sm:flex-row sm:items-end"
                                            >
                                                <input type="hidden" name="memberId" value={member.id} />

                                                <div className="space-y-1">
                                                    <Label htmlFor={`password-${member.id}`}>
                                                        New temporary password
                                                    </Label>
                                                    <Input
                                                        id={`password-${member.id}`}
                                                        name="password"
                                                        type="password"
                                                        placeholder="Example: Staff12345"
                                                        required
                                                        className="w-full sm:w-72"
                                                    />
                                                </div>

                                                <Button type="submit">Update Password</Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        ))}

                        {members.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}