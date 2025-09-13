import { PageHeader } from "@/components/ui/page-header";
import type { ReactElement } from "react";
import { UserRolesManager } from "../_components/user-roles-manager";

export default async function AdminUsersPage(): Promise<ReactElement> {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Users & Roles" description="Assign and remove roles for users" />
        <UserRolesManager />
      </div>
    </div>
  );
}
