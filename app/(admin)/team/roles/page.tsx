"use client";

import { useState } from "react";
import {
  roles,
  Role,
  permissionCategories,
  permissionActions,
} from "@/lib/team-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Save } from "lucide-react";

export default function RolesPermissionsPage() {
  const [roleData, setRoleData] = useState<Role[]>(roles);
  const [activeRole, setActiveRole] = useState(roles[0].name);

  const currentRole = roleData.find((r) => r.name === activeRole) || roleData[0];

  const togglePermission = (category: string, action: string) => {
    if (!currentRole) return;
    setRoleData((prevRoles) =>
      prevRoles.map((role) =>
        role.name === currentRole.name
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [category]: {
                  ...role.permissions[category],
                  [action]: !role.permissions[category][action],
                },
              },
            }
          : role
      )
    );
  };

  const resetPermissions = () => {
    // Optional: reset to default, not implemented
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>

      <Tabs value={activeRole} onValueChange={setActiveRole}>
        <TabsList className="mb-6">
          {roleData.map((role) => (
            <TabsTrigger key={role.name} value={role.name}>
              {role.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {roleData.map((role) => (
          <TabsContent key={role.name} value={role.name}>
            <Card>
              <CardHeader>
                <CardTitle>{role.name}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Category</th>
                        {permissionActions.map((action) => (
                          <th key={action} className="p-2 text-center font-medium">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissionCategories.map((category) => (
                        <tr key={category} className="border-b">
                          <td className="p-2 font-medium">{category}</td>
                          {permissionActions.map((action) => (
                            <td key={action} className="p-2 text-center">
                              <Checkbox
                                checked={!!role.permissions[category]?.[action]}
                                onCheckedChange={() => {
                                  if (activeRole === role.name) togglePermission(category, action);
                                }}
                                disabled={activeRole !== role.name}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}