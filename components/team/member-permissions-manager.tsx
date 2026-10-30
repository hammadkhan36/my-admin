// "use client";

// import { useMemo, useState } from "react";
// import type { AppRole } from "@/lib/auth/roles";
// import {
//   removePermissionOverride,
//   setPermissionOverride,
//   updateMemberRole,
// } from "@/app/(admin)/team/permissions/actions";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export type PermissionMember = {
//   id: string;
//   full_name: string | null;
//   email: string;
//   role: AppRole;
//   is_active: boolean;
// };

// export type PermissionRow = {
//   permission_key: string;
//   feature_key: string;
//   action: string;
//   description: string | null;
// };

// export type RolePermissionRow = {
//   role: AppRole;
//   permission_key: string;
//   allowed: boolean;
// };

// export type UserOverrideRow = {
//   user_id: string;
//   permission_key: string;
//   allowed: boolean;
// };

// const editableRoles: AppRole[] = ["admin", "manager", "supervisor", "staff"];

// export function MemberPermissionsManager({
//   members,
//   permissions,
//   rolePermissions,
//   overrides,
// }: {
//   members: PermissionMember[];
//   permissions: PermissionRow[];
//   rolePermissions: RolePermissionRow[];
//   overrides: UserOverrideRow[];
// }) {
//   const editableMembers = members.filter(
//     (member) => member.role !== "superadmin" && member.role !== "owner"
//   );

//   const [selectedMemberId, setSelectedMemberId] = useState(
//     editableMembers[0]?.id ?? ""
//   );

//   const selectedMember = editableMembers.find(
//     (member) => member.id === selectedMemberId
//   );

//   const groupedPermissions = useMemo(() => {
//     return permissions.reduce<Record<string, PermissionRow[]>>(
//       (groups, permission) => {
//         groups[permission.feature_key] ??= [];
//         groups[permission.feature_key].push(permission);
//         return groups;
//       },
//       {}
//     );
//   }, [permissions]);

//   function roleAllows(role: AppRole, permissionKey: string) {
//     return rolePermissions.some(
//       (item) =>
//         item.role === role &&
//         item.permission_key === permissionKey &&
//         item.allowed
//     );
//   }

//   function getOverride(userId: string, permissionKey: string) {
//     return overrides.find(
//       (item) => item.user_id === userId && item.permission_key === permissionKey
//     );
//   }

//   return (
//     <div className="p-4 md:p-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Roles & Permissions</h1>
//         <p className="text-sm text-muted-foreground">
//           Select a member, change role, or allow/deny custom permissions.
//         </p>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-base">Members</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             {editableMembers.map((member) => (
//               <button
//                 key={member.id}
//                 type="button"
//                 onClick={() => setSelectedMemberId(member.id)}
//                 className={`w-full rounded-md border p-3 text-left text-sm ${
//                   selectedMemberId === member.id
//                     ? "border-primary bg-accent"
//                     : "hover:bg-muted"
//                 }`}
//               >
//                 <div className="font-medium">
//                   {member.full_name || member.email}
//                 </div>
//                 <div className="truncate text-xs text-muted-foreground">
//                   {member.email}
//                 </div>
//                 <div className="mt-2 flex gap-2">
//                   <Badge variant="outline" className="capitalize">
//                     {member.role}
//                   </Badge>
//                   <Badge variant={member.is_active ? "secondary" : "outline"}>
//                     {member.is_active ? "Active" : "Inactive"}
//                   </Badge>
//                 </div>
//               </button>
//             ))}

//             {editableMembers.length === 0 && (
//               <p className="text-sm text-muted-foreground">
//                 Pehle Staff page se member create karo.
//               </p>
//             )}
//           </CardContent>
//         </Card>

//         <div className="space-y-6">
//           {!selectedMember && (
//             <Card>
//               <CardContent className="p-6 text-sm text-muted-foreground">
//                 Select a member to manage permissions.
//               </CardContent>
//             </Card>
//           )}

//           {selectedMember && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-base">Member Role</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <form action={updateMemberRole} className="flex flex-col gap-3 sm:flex-row">
//                   <input type="hidden" name="memberId" value={selectedMember.id} />
//                   <select
//                     name="role"
//                     defaultValue={selectedMember.role}
//                     className="h-10 rounded-md border bg-background px-3 text-sm capitalize"
//                   >
//                     {editableRoles.map((role) => (
//                       <option key={role} value={role}>
//                         {role}
//                       </option>
//                     ))}
//                   </select>
//                   <Button type="submit">Update Role</Button>
//                 </form>
//               </CardContent>
//             </Card>
//           )}

//           {selectedMember &&
//             Object.entries(groupedPermissions).map(([featureKey, modulePermissions]) => (
//               <Card key={featureKey}>
//                 <CardHeader>
//                   <CardTitle className="text-base capitalize">
//                     {featureKey}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   {modulePermissions.map((permission) => {
//                     const defaultAllowed = roleAllows(
//                       selectedMember.role,
//                       permission.permission_key
//                     );
//                     const override = getOverride(
//                       selectedMember.id,
//                       permission.permission_key
//                     );
//                     const finalAllowed = override
//                       ? override.allowed
//                       : defaultAllowed;

//                     return (
//                       <div
//                         key={permission.permission_key}
//                         className="flex flex-col justify-between gap-3 border-b pb-3 last:border-0 sm:flex-row sm:items-center"
//                       >
//                         <div>
//                           <div className="font-mono text-sm font-medium">
//                             {permission.permission_key}
//                           </div>
//                           <div className="text-xs text-muted-foreground">
//                             Default: {defaultAllowed ? "Allowed" : "Denied"} |
//                             Final: {finalAllowed ? "Allowed" : "Denied"}
//                             {override ? " | Custom override" : ""}
//                           </div>
//                         </div>

//                         <div className="flex gap-2">
//                           <form action={setPermissionOverride}>
//                             <input type="hidden" name="memberId" value={selectedMember.id} />
//                             <input type="hidden" name="permissionKey" value={permission.permission_key} />
//                             <input type="hidden" name="allowed" value="true" />
//                             <Button size="sm" variant={finalAllowed ? "default" : "outline"} type="submit">
//                               Allow
//                             </Button>
//                           </form>

//                           <form action={setPermissionOverride}>
//                             <input type="hidden" name="memberId" value={selectedMember.id} />
//                             <input type="hidden" name="permissionKey" value={permission.permission_key} />
//                             <input type="hidden" name="allowed" value="false" />
//                             <Button size="sm" variant={!finalAllowed ? "destructive" : "outline"} type="submit">
//                               Deny
//                             </Button>
//                           </form>

//                           {override && (
//                             <form action={removePermissionOverride}>
//                               <input type="hidden" name="memberId" value={selectedMember.id} />
//                               <input type="hidden" name="permissionKey" value={permission.permission_key} />
//                               <Button size="sm" variant="ghost"  type="submit">
//                                 Reset
//                               </Button>
//                             </form>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </CardContent>
//               </Card>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// }















"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { AppRole } from "@/lib/auth/roles";
import {
  assignableRoles,
  canGrantPermissionKey,
  canManageRole,
} from "@/lib/auth/roles";
import {
  removePermissionOverride,
  setPermissionOverride,
  updateMemberRole,
} from "@/app/(admin)/team/permissions/actions";
import { initialActionState } from "@/lib/action-state";
import { FormActionAlert } from "@/components/form-action-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Types (as before)
export type PermissionMember = {
  id: string;
  full_name: string | null;
  email: string;
  role: AppRole;
  is_active: boolean;
};

export type PermissionRow = {
  permission_key: string;
  feature_key: string;
  action: string;
  description: string | null;
};

export type RolePermissionRow = {
  role: AppRole;
  permission_key: string;
  allowed: boolean;
};

export type UserOverrideRow = {
  user_id: string;
  permission_key: string;
  allowed: boolean;
};

// Custom SubmitButton with loading state
function SubmitButton({
  children,
  pendingText = "Processing...",
  className,
  variant,
  size,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

function MemberRoleForm({
  member,
  roles,
}: {
  member: PermissionMember;
  roles: AppRole[];
}) {
  const [state, formAction] = useActionState(
    updateMemberRole,
    initialActionState
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="memberId" value={member.id} />
        <select
          name="role"
          defaultValue={member.role}
          className="h-10 rounded-md border bg-background px-3 text-sm capitalize"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <SubmitButton pendingText="Updating...">Update Role</SubmitButton>
      </div>
      <FormActionAlert state={state} />
    </form>
  );
}

function PermissionOverrideRow({
  member,
  permission,
  defaultAllowed,
  override,
  canChange,
}: {
  member: PermissionMember;
  permission: PermissionRow;
  defaultAllowed: boolean;
  override: UserOverrideRow | undefined;
  canChange: boolean;
}) {
  const [allowState, allowAction] = useActionState(
    setPermissionOverride,
    initialActionState
  );
  const [denyState, denyAction] = useActionState(
    setPermissionOverride,
    initialActionState
  );
  const [resetState, resetAction] = useActionState(
    removePermissionOverride,
    initialActionState
  );

  const finalAllowed = override ? override.allowed : defaultAllowed;

  return (
    <div className="space-y-2 border-b pb-3 last:border-0">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="font-mono text-sm font-medium">
            {permission.permission_key}
          </div>
          <div className="text-xs text-muted-foreground">
            Default: {defaultAllowed ? "Allowed" : "Denied"} |
            Final: {finalAllowed ? "Allowed" : "Denied"}
            {override ? " | Custom override" : ""}
          </div>
        </div>

        {canChange ? (
          <div className="flex gap-2">
            <form action={allowAction}>
              <input type="hidden" name="memberId" value={member.id} />
              <input
                type="hidden"
                name="permissionKey"
                value={permission.permission_key}
              />
              <input type="hidden" name="allowed" value="true" />
              <SubmitButton
                size="sm"
                variant={finalAllowed ? "default" : "outline"}
                pendingText="Allowing..."
              >
                Allow
              </SubmitButton>
            </form>

            <form action={denyAction}>
              <input type="hidden" name="memberId" value={member.id} />
              <input
                type="hidden"
                name="permissionKey"
                value={permission.permission_key}
              />
              <input type="hidden" name="allowed" value="false" />
              <SubmitButton
                size="sm"
                variant={!finalAllowed ? "destructive" : "outline"}
                pendingText="Denying..."
              >
                Deny
              </SubmitButton>
            </form>

            {override && (
              <form action={resetAction}>
                <input type="hidden" name="memberId" value={member.id} />
                <input
                  type="hidden"
                  name="permissionKey"
                  value={permission.permission_key}
                />
                <SubmitButton size="sm" variant="ghost" pendingText="Resetting...">
                  Reset
                </SubmitButton>
              </form>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Owner only</span>
        )}
      </div>

      <FormActionAlert state={allowState} />
      <FormActionAlert state={denyState} />
      <FormActionAlert state={resetState} />
    </div>
  );
}

export function MemberPermissionsManager({
  actorId,
  actorRole,
  members,
  permissions,
  rolePermissions,
  overrides,
}: {
  actorId: string;
  actorRole: AppRole;
  members: PermissionMember[];
  permissions: PermissionRow[];
  rolePermissions: RolePermissionRow[];
  overrides: UserOverrideRow[];
}) {
  // Sirf UX ke liye: asal check server actions (assertCanManageMember) mein hai.
  const editableMembers = members.filter(
    (member) => member.id !== actorId && canManageRole(actorRole, member.role)
  );
  const roleOptions = assignableRoles(actorRole);

  const [selectedMemberId, setSelectedMemberId] = useState(
    editableMembers[0]?.id ?? ""
  );

  const selectedMember = editableMembers.find(
    (member) => member.id === selectedMemberId
  );

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionRow[]>>(
      (groups, permission) => {
        groups[permission.feature_key] ??= [];
        groups[permission.feature_key].push(permission);
        return groups;
      },
      {}
    );
  }, [permissions]);

  function roleAllows(role: AppRole, permissionKey: string) {
    return rolePermissions.some(
      (item) =>
        item.role === role &&
        item.permission_key === permissionKey &&
        item.allowed
    );
  }

  function getOverride(userId: string, permissionKey: string) {
    return overrides.find(
      (item) => item.user_id === userId && item.permission_key === permissionKey
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Select a member, change role, or allow/deny custom permissions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {editableMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`w-full rounded-md border p-3 text-left text-sm ${
                  selectedMemberId === member.id
                    ? "border-primary bg-accent"
                    : "hover:bg-muted"
                }`}
              >
                <div className="font-medium">
                  {member.full_name || member.email}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {member.email}
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                  <Badge variant={member.is_active ? "secondary" : "outline"}>
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </button>
            ))}

            {editableMembers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Pehle Staff page se member create karo.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right side: Role update and permissions */}
        <div className="space-y-6">
          {!selectedMember && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Select a member to manage permissions.
              </CardContent>
            </Card>
          )}

          {selectedMember && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Member Role</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberRoleForm
                  key={selectedMember.id}
                  member={selectedMember}
                  roles={roleOptions}
                />
              </CardContent>
            </Card>
          )}

          {selectedMember &&
            Object.entries(groupedPermissions).map(
              ([featureKey, modulePermissions]) => (
                <Card key={featureKey}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize">
                      {featureKey}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {modulePermissions.map((permission) => (
                      <PermissionOverrideRow
                        key={`${selectedMember.id}:${permission.permission_key}`}
                        member={selectedMember}
                        permission={permission}
                        defaultAllowed={roleAllows(
                          selectedMember.role,
                          permission.permission_key
                        )}
                        override={getOverride(
                          selectedMember.id,
                          permission.permission_key
                        )}
                        canChange={canGrantPermissionKey(
                          actorRole,
                          permission.permission_key
                        )}
                      />
                    ))}
                  </CardContent>
                </Card>
              )
            )}
        </div>
      </div>
    </div>
  );
}