export const APP_ROLES = [
  "superadmin",
  "owner",
  "admin",
  "manager",
  "supervisor",
  "staff",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AuthProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  is_active: boolean;
};

export const MANUALLY_PROVISIONED_ROLES: AppRole[] = [
  "superadmin",
  "owner",
];

export const DASHBOARD_CREATABLE_ROLES: AppRole[] = [
  "admin",
  "manager",
  "supervisor",
  "staff",
];

export function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" &&
    APP_ROLES.includes(value as AppRole)
  );
}

// Bara number = bara rank. Actor sirf apne se neeche wale rank ko manage kar sakta hai.
export const ROLE_RANK: Record<AppRole, number> = {
  superadmin: 6,
  owner: 5,
  admin: 4,
  manager: 3,
  supervisor: 2,
  staff: 1,
};

export const FULL_ACCESS_ROLES: AppRole[] = ["superadmin", "owner"];

export function canManageRole(actorRole: AppRole, targetRole: AppRole) {
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

export function assignableRoles(actorRole: AppRole): AppRole[] {
  return DASHBOARD_CREATABLE_ROLES.filter((role) =>
    canManageRole(actorRole, role)
  );
}

// staff.* aur roles.* keys se koi doosron ko manage kar sakta hai, is liye
// inki override sirf owner/superadmin de ya hata sakte hain.
export function isSensitivePermissionKey(permissionKey: string) {
  return permissionKey.startsWith("staff.") || permissionKey.startsWith("roles.");
}

export function canGrantPermissionKey(actorRole: AppRole, permissionKey: string) {
  return (
    !isSensitivePermissionKey(permissionKey) ||
    FULL_ACCESS_ROLES.includes(actorRole)
  );
}