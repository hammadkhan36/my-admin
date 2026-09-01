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