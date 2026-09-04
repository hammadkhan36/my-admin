
"use client";

import { useActionState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  createTeamMemberSafe,
  deleteTeamMemberSafe,
  setMemberActiveSafe,
  updateMemberPasswordSafe,
} from "@/app/(admin)/team/staff/actions";
import { DASHBOARD_CREATABLE_ROLES } from "@/lib/auth/roles";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";

type StaffMember = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
};

export function StaffCreateForm() {
  const [state, formAction] = useActionState(
    createTeamMemberSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input name="full_name" placeholder="Ali Khan" required />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input name="email" type="email" placeholder="user@example.com" required />
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input name="password" type="password" minLength={6} required />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <select
          name="role"
          defaultValue="staff"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {DASHBOARD_CREATABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Create Member</PendingSubmitButton>
      </div>
    </form>
  );
}

export function StaffStatusForm({ member }: { member: StaffMember }) {
  const [state, formAction, pending] = useActionState(
    setMemberActiveSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={member.id} />
      <input type="hidden" name="is_active" value={String(member.is_active)} />

      <Button type="submit" variant="outline" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {member.is_active ? "Deactivate" : "Activate"}
      </Button>

      <FormActionAlert state={state} />
    </form>
  );
}

export function StaffPasswordForm({ member }: { member: StaffMember }) {
  const [state, formAction] = useActionState(
    updateMemberPasswordSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
      <input type="hidden" name="id" value={member.id} />

      <Input
        name="password"
        type="password"
        minLength={6}
        placeholder="New password"
        required
      />

      <PendingSubmitButton>Update Password</PendingSubmitButton>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>
    </form>
  );
}

export function StaffDeleteForm({ member }: { member: StaffMember }) {
  const [state, formAction, pending] = useActionState(
    deleteTeamMemberSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={member.id} />
      <input type="hidden" name="email" value={member.email} />

      <Button
        type="submit"
        variant="destructive"
        disabled={pending}
        onClick={(event) => {
          if (!window.confirm(`Delete ${member.email}?`)) {
            event.preventDefault();
          }
        }}
      >
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>

      <FormActionAlert state={state} />
    </form>
  );
}