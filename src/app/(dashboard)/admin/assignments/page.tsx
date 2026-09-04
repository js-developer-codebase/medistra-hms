"use client";

import React, { useEffect, useState } from "react";
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Shield,
  Users,
  CheckCircle2,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RoleAssignmentsPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Selection
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [targetRoleId, setTargetRoleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.append("roleId", roleFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/assignments?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users || []);
        setRoles(json.data.roles || []);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load role assignments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssignments();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((u) => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenSingleChange = (user: any) => {
    setActiveUser(user);
    setTargetRoleId(user.role?._id || "");
    setSingleModalOpen(true);
  };

  const handleSaveSingleRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleId || !activeUser) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUser._id, roleId: targetRoleId }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Role Updated", description: json.message });
        setSingleModalOpen(false);
        fetchAssignments();
      } else {
        toast({ title: "Update Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBulkRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleId || selectedUserIds.length === 0) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds, roleId: targetRoleId }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Bulk Reassignment Complete", description: json.message });
        setBulkModalOpen(false);
        setSelectedUserIds([]);
        fetchAssignments();
      } else {
        toast({ title: "Bulk Update Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Role Assignments & Access Governance</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Institutional personnel-to-role assignment desk with batch privilege re-allocation controls.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAssignments} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {selectedUserIds.length > 0 && (
            <Button
              size="sm"
              onClick={() => {
                setTargetRoleId(roles[0]?._id || "");
                setBulkModalOpen(true);
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Reassign Selected ({selectedUserIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-sm border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search user name, email, or phone number..."
                  className="pl-9 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="text-xs">
                Filter
              </Button>
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter by Role:
              </span>
              <select
                className="h-8 rounded-md border bg-background px-2.5 text-xs"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Assignments Table */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3.5 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Institutional User Assignments ({users.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {selectedUserIds.length} Selected
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading assignments...</div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No users found matching current filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left font-medium text-muted-foreground">
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedUserIds.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Organization & Branch</th>
                    <th className="py-3 px-4">Current Assigned Role</th>
                    <th className="py-3 px-4">Authorized Modules</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => {
                    const isSelected = selectedUserIds.includes(u._id);
                    const accessModulesCount = u.role?.access?.length || 0;
                    return (
                      <tr
                        key={u._id}
                        className={`transition-colors ${
                          isSelected ? "bg-cyan-50/50 dark:bg-cyan-950/20" : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(u._id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{u.name}</div>
                          <div className="text-muted-foreground text-[11px]">{u.email}</div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <div>{u.organization?.organizationName || "Medistra Super Speciality"}</div>
                          <div className="text-[11px]">{u.branch?.organizationName || "Main Hospital"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`font-mono text-[11px] ${
                              u.role?.role === "SYSTEM_SUPER_ADMIN"
                                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {u.role?.role || "Staff"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {u.role?.role === "SYSTEM_SUPER_ADMIN" ? (
                            <span className="text-purple-600 font-semibold text-[11px]">All 21 Modules</span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">
                              {accessModulesCount} Modules Granted
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.isActive ? "default" : "secondary"} className="text-[10px]">
                            {u.isActive ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-primary"
                            onClick={() => handleOpenSingleChange(u)}
                          >
                            Change Role <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Single User Role Modal */}
      <Dialog open={singleModalOpen} onOpenChange={setSingleModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handleSaveSingleRole}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-600" />
                Change User Role
              </DialogTitle>
              <DialogDescription>
                Assign a new RBAC privilege profile to {activeUser?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <div className="font-semibold text-foreground">{activeUser?.name}</div>
                <div className="text-muted-foreground">{activeUser?.email}</div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Current Role: <span className="font-semibold text-foreground">{activeUser?.role?.role}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Select Target Role *</label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={targetRoleId}
                  onChange={(e) => setTargetRoleId(e.target.value)}
                  required
                >
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setSingleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Updating..." : "Confirm Role Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Reassign Modal */}
      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <form onSubmit={handleSaveBulkRole}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-cyan-700">
                <Users className="w-4 h-4" />
                Bulk Role Reassignment
              </DialogTitle>
              <DialogDescription>
                Reassign all {selectedUserIds.length} selected personnel to a new institutional role.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg border border-cyan-200 dark:border-cyan-900 text-cyan-900 dark:text-cyan-200">
                <p className="font-semibold">Attention:</p>
                <p className="text-[11px] mt-0.5">
                  This action will immediately update module authorizations for {selectedUserIds.length} hospital accounts.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Target Role *</label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={targetRoleId}
                  onChange={(e) => setTargetRoleId(e.target.value)}
                  required
                >
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setBulkModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {submitting ? "Reassigning..." : `Reassign ${selectedUserIds.length} Accounts`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
