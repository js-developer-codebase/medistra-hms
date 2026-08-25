"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, GitBranch, Search, Edit, Trash2, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useOrganizationStore, IOrganization } from "@/store/useOrganizationStore";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ManageOrganizationPage() {
  const { organizations, isLoading, fetchOrganizations, deleteOrganization, updateOrganization } = useOrganizationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [editingOrg, setEditingOrg] = useState<IOrganization | null>(null);
  const [editForm, setEditForm] = useState<Partial<IOrganization>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filteredOrganizations = organizations.filter(org => 
    org.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group branches by their parent organization for a better view?
  // For now we just list all organizations (MAIN and BRANCH).
  // We can calculate how many branches a MAIN org has:
  const getBranchCount = (parentId: string) => {
    return organizations.filter(org => org.branchType === 'BRANCH' && org.headQuarter === parentId).length;
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      const { success, message } = await deleteOrganization(id);
      if (success) {
        toast(message, "success");
      } else {
        toast(message, "error");
      }
    }
  };

  const openEditModal = (org: IOrganization) => {
    setEditingOrg(org);
    setEditForm({
      organizationName: org.organizationName,
      email: org.email || "",
      phone: org.phone || "",
      address: org.address || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setIsUpdating(true);
    const { success, message } = await updateOrganization(editingOrg._id, editForm);
    setIsUpdating(false);
    if (success) {
      toast(message, "success");
      setIsEditModalOpen(false);
    } else {
      toast(message, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Organizations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all registered organizations and their branches.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/dashboard/organization/create">
            <Button className="gap-2 whitespace-nowrap"><Plus className="h-4 w-4" /> Add Organization</Button>
          </Link>
          <Link href="/dashboard/organization/branch/create">
            <Button variant="outline" className="gap-2 whitespace-nowrap"><GitBranch className="h-4 w-4" /> Add Branch</Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-md">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-500" /> Organizations List</CardTitle>
              <CardDescription>A complete list of your hospital organizations</CardDescription>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="search" 
                placeholder="Search organizations..." 
                className="pl-9 bg-slate-50 dark:bg-slate-900/50" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-12 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading organizations...
              </div>
            ) : filteredOrganizations.length === 0 ? (
              <div className="flex flex-col justify-center items-center p-12 text-slate-500 space-y-3">
                <Info className="h-8 w-8 text-slate-400" />
                <p>No organizations found.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Organization Name</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Hierarchy</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrganizations.map((org) => (
                    <tr key={org._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                        <div className={`h-8 w-8 rounded flex items-center justify-center ${org.branchType === 'MAIN' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                          {org.branchType === 'MAIN' ? <Building2 className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
                        </div>
                        {org.organizationName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {org.organizationType}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {org.branchType === 'MAIN' ? (
                          <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Main ({getBranchCount(org._id)} branches)</div>
                        ) : (
                          <div className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5" /> Branch</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${org.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {org.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            onClick={() => openEditModal(org)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => handleDelete(org._id, org.organizationName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Make changes to the organization's details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.organizationName || ""}
                onChange={(e) => setEditForm({ ...editForm, organizationName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address || ""}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
