"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RoleOption = Readonly<{ id: number; slug: string; name: string }>;

type UserRow = Readonly<{
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: readonly string[];
}>;

/**
 * Minimal UI to manage user roles: search users, assign and remove roles.
 */
export function UserRolesManager(): ReactElement {
  const [q, setQ] = useState<string>("");
  const [users, setUsers] = useState<readonly UserRow[]>([]);
  const [roles, setRoles] = useState<readonly RoleOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<string>(""); // userId while saving

  async function loadRoles(): Promise<void> {
    const res = await fetch("/api/admin/roles", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { items: RoleOption[] };
    setRoles(data.items);
  }

  async function loadUsers(): Promise<void> {
    setLoading(true);
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      if (q.trim()) url.searchParams.set("q", q.trim());
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: UserRow[] };
      setUsers(data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRoles();
  }, []);

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addRole(userId: string, slug: string): Promise<void> {
    setSaving(userId);
    try {
      await fetch(`/api/admin/users/${userId}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: slug }),
      });
      await loadUsers();
    } finally {
      setSaving("");
    }
  }

  async function removeRole(userId: string, slug: string): Promise<void> {
    setSaving(userId);
    try {
      await fetch(`/api/admin/users/${userId}/roles`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: slug }),
      });
      await loadUsers();
    } finally {
      setSaving("");
    }
  }

  const roleSlugToName = useMemo<Readonly<Record<string, string>>>(() => {
    const map: Record<string, string> = {};
    for (const r of roles) map[r.slug] = r.name;
    return map;
  }, [roles]);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="secondary" onClick={() => void loadUsers()} disabled={loading}>
            {loading ? "Loading…" : "Search"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="w-[220px]">Assign Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name ?? "(no name)"}</TableCell>
                  <TableCell className="font-mono text-sm">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {u.roles.length === 0 && <span className="text-muted-foreground">None</span>}
                      {u.roles.map((slug) => (
                        <Badge key={slug} variant="secondary" className="gap-2">
                          {roleSlugToName[slug] ?? slug}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void removeRole(u.id, slug)}
                            disabled={saving === u.id}
                            className="h-5 px-1"
                            aria-label={`Remove ${slug}`}
                            title="Remove role"
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(slug) => void addRole(u.id, slug)}
                        disabled={saving === u.id || roles.length === 0}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.slug}>
                              {r.name} ({r.slug})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
