"use client";

import { useMemo, useState } from "react";
import type { AppRole } from "@/lib/auth/roles";
import {
  removePermissionOverride,
  setPermissionOverride,
  updateMemberRole,
} from "@/app/(admin)/team/permissions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PermissionMember = {
  id: string;
  full_name: string | null;
  email: string;
  role: AppRole;
  is_active: boolean;
};

export type PermissionRow = {
  key: string;
  module: string;
  action: string;
  description: string | null;
};

export type RolePermissionRow = {
  role: AppRole;
  permission_key: string;
};

export type UserOverrideRow = {
  user_id: string;
  permission_key: string;
  allowed: boolean;
};

const editableRoles: AppRole[] = ["admin", "manager", "supervisor", "staff"];

export function MemberPermissionsManager({
  members,
  permissions,
  rolePermissions,
  overrides,
}: {
  members: PermissionMember[];
  permissions: PermissionRow[];
  rolePermissions: RolePermissionRow[];
  overrides: UserOverrideRow[];
}) {
  const editableMembers = members.filter(
    (member) => member.role !== "superadmin" && member.role !== "owner"
  );

  const [selectedMemberId, setSelectedMemberId] = useState(
    editableMembers[0]?.id ?? ""
  );

  const selectedMember = editableMembers.find(
    (member) => member.id === selectedMemberId
  );

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionRow[]>>((groups, permission) => {
      groups[permission.module] ??= [];
      groups[permission.module].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  function hasRolePermission(role: AppRole, permissionKey: string) {
    return rolePermissions.some(
      (item) => item.role === role && item.permission_key === permissionKey
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
          Role default access ke upar specific member ki permission allow/deny karo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
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
                <div className="text-xs text-muted-foreground">{member.email}</div>
                <Badge variant="outline" className="mt-2 capitalize">
                  {member.role}
                </Badge>
              </button>
            ))}

            {editableMembers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Pehle Staff page se member create karo.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedMember && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Member Role</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateMemberRole} className="flex flex-col gap-3 sm:flex-row">
                  <input type="hidden" name="memberId" value={selectedMember.id} />
                  <select
                    name="role"
                    defaultValue={selectedMember.role}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    {editableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <Button type="submit">Update Role</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {selectedMember &&
            Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <Card key={module}>
                <CardHeader>
                  <CardTitle className="text-base capitalize">{module}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {modulePermissions.map((permission) => {
                    const roleAllowed = hasRolePermission(
                      selectedMember.role,
                      permission.key
                    );
                    const override = getOverride(selectedMember.id, permission.key);
                    const finalAllowed = override ? override.allowed : roleAllowed;

                    return (
                      <div
                        key={permission.key}
                        className="flex flex-col justify-between gap-3 border-b pb-3 sm:flex-row sm:items-center"
                      >
                        <div>
                          <div className="font-medium">{permission.key}</div>
                          <div className="text-xs text-muted-foreground">
                            Default: {roleAllowed ? "Allowed" : "Denied"} | Final:{" "}
                            {finalAllowed ? "Allowed" : "Denied"}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <form action={setPermissionOverride}>
                            <input type="hidden" name="memberId" value={selectedMember.id} />
                            <input type="hidden" name="permissionKey" value={permission.key} />
                            <input type="hidden" name="allowed" value="true" />
                            <Button size="sm" variant={finalAllowed ? "default" : "outline"}>
                              Allow
                            </Button>
                          </form>

                          <form action={setPermissionOverride}>
                            <input type="hidden" name="memberId" value={selectedMember.id} />
                            <input type="hidden" name="permissionKey" value={permission.key} />
                            <input type="hidden" name="allowed" value="false" />
                            <Button size="sm" variant={!finalAllowed ? "destructive" : "outline"}>
                              Deny
                            </Button>
                          </form>

                          {override && (
                            <form action={removePermissionOverride}>
                              <input type="hidden" name="memberId" value={selectedMember.id} />
                              <input type="hidden" name="permissionKey" value={permission.key} />
                              <Button size="sm" variant="ghost">
                                Reset
                              </Button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}