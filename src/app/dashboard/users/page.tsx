"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Users, UserPlus, Search, Pencil, Trash2, Loader2, Shield, Mail, Phone, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender: string;
  role: { _id: string; role: string } | string;
  organization?: { _id: string; organizationName: string } | string;
  branch?: { _id: string; organizationName: string } | string;
  isActive: boolean;
  createdAt?: string;
}
interface RoleOption { _id: string; role: string; }
interface OrganizationOption {
  _id: string;
  organizationName: string;
  branchType: "MAIN" | "BRANCH";
  headQuarter?: string;
}
interface SessionUser {
  organization?: string | { _id?: string };
  branch?: string | { _id?: string };
}

function idOf(value?: string | { _id?: string } | null): string {
  return typeof value === "object" ? value?._id || "" : value || "";
}

export default function ManageUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", gender: "", role: "", organization: "", branch: "", isActive: true });
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      const json = await res.json();
      if (json.success) setUsers(json.data || []);
    } catch { toast("Failed to load users", "error"); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    Promise.all([
      fetch("/api/role?permission=UPDATE").then(r => r.json()),
      fetch("/api/org").then(r => r.json()),
      fetch("/api/auth/session").then(r => r.json()),
    ]).then(([roleJson, orgJson, sessionJson]) => {
      if (roleJson.success) setRoles(roleJson.data || []);
      if (orgJson.success) setOrganizations(orgJson.data || []);
      setSessionUser(sessionJson?.user || null);
    }).catch(() => {});
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  function openEdit(user: UserItem) {
    setEditUser(user);
    setEditForm({
      name: user.name, email: user.email, phone: user.phone || "",
      gender: user.gender, role: typeof user.role === "object" ? user.role._id : String(user.role), isActive: user.isActive,
      organization: typeof user.organization === "object" ? user.organization._id : String(user.organization || ""),
      branch: typeof user.branch === "object" ? user.branch._id : String(user.branch || ""),
    });
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    try {
      const body: Record<string, unknown> = { ...editForm };
      const res = await fetch(`/api/user/${editUser._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) { toast("User updated successfully", "success"); setEditOpen(false); fetchUsers(); }
      else toast(json.message || "Update failed", "error");
    } catch { toast("Error updating user", "error"); } finally { setEditLoading(false); }
  }

  async function toggleActive(user: UserItem) {
    try {
      const res = await fetch(`/api/user/${user._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !user.isActive }) });
      const json = await res.json();
      if (json.success) { toast(`User ${!user.isActive ? "activated" : "deactivated"}`, "success"); fetchUsers(); }
      else toast(json.message || "Toggle failed", "error");
    } catch { toast("Error toggling status", "error"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/user/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast("User deleted", "success"); setDeleteOpen(false); fetchUsers(); }
      else toast(json.message || "Delete failed", "error");
    } catch { toast("Error deleting user", "error"); } finally { setDeleteLoading(false); }
  }

  const getRoleName = (role: UserItem["role"]) => typeof role === "object" ? role.role : "N/A";
  const getBranchName = (branch: UserItem["branch"]) => typeof branch === "object" ? branch.organizationName : "No branch";
  const sessionOrganizationId = idOf(sessionUser?.organization);
  const sessionBranchId = idOf(sessionUser?.branch);
  const editOrganizationOptions = sessionOrganizationId
    ? organizations.filter(org => org._id === sessionOrganizationId)
    : organizations.filter(org => org.branchType === "MAIN");
  const editBranchOptions = organizations.filter(org => {
    if (org.branchType !== "BRANCH") return false;
    if (sessionBranchId) return org._id === sessionBranchId;
    if (editForm.organization) return org.headQuarter === editForm.organization;
    return true;
  });
  const organizationLocked = Boolean(sessionOrganizationId);
  const branchLocked = Boolean(sessionBranchId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all system users</p>
        </div>
        <Link href="/dashboard/users/create">
          <Button className="gap-2"><UserPlus className="h-4 w-4" />Add New User</Button>
        </Link>
      </div>

      {/* Content Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><Users className="h-5 w-5" /></div>
              <div><CardTitle className="text-base">All Users</CardTitle><CardDescription>{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</CardDescription></div>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800/50 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center"><Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" /><p className="text-sm text-slate-500">No users found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="hidden md:table-cell">Branch</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">{user.name}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500 text-xs">{getBranchName(user.branch)}</TableCell>
                    <TableCell><Badge variant="info">{getRoleName(user.role)}</Badge></TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive(user)} title="Toggle Status">
                        {user.isActive ? <Badge variant="default" className="cursor-pointer gap-1"><ToggleRight className="h-3 w-3" />Active</Badge> : <Badge variant="destructive" className="cursor-pointer gap-1"><ToggleLeft className="h-3 w-3" />Inactive</Badge>}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" onClick={() => openEdit(user)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => { setDeleteTarget(user); setDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update user information</DialogDescription></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <Select label="Gender" value={editForm.gender} onChange={(e) => setEditForm(p => ({ ...p, gender: e.target.value }))}>
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </Select>
            </div>
            <Select label="Role" value={editForm.role} onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))}>
              {roles.map(r => <option key={r._id} value={r._id}>{r.role}</option>)}
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Organization" value={editForm.organization} onChange={(e) => setEditForm(p => ({ ...p, organization: e.target.value, branch: "" }))} disabled={organizationLocked}>
                <option value="">Select Organization</option>
                {editOrganizationOptions.map(org => <option key={org._id} value={org._id}>{org.organizationName}</option>)}
              </Select>
              <Select label="Branch" value={editForm.branch} onChange={(e) => setEditForm(p => ({ ...p, branch: e.target.value }))} disabled={branchLocked || !editForm.organization}>
                <option value="">No branch</option>
                {editBranchOptions.map(branch => <option key={branch._id} value={branch._id}>{branch.organizationName}</option>)}
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editLoading} className="gap-2">{editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User</DialogTitle><DialogDescription>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="gap-2">{deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
