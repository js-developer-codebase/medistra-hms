"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "OTHER",
    code: "",
    organizationId: ""
  });
  const { toast } = useToast();

  const fetchDeps = async () => {
    try {
      setLoading(true);
      const [depsRes, orgsRes] = await Promise.all([
        fetch("/api/department"),
        fetch("/api/organization")
      ]);
      const depsData = await depsRes.json();
      const orgsData = await orgsRes.json();
      
      if (depsData.success) setDepartments(depsData.data);
      if (orgsData.success) setOrganizations(orgsData.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeps();
  }, []);

  const handleCreate = async () => {
    try {
      if (!formData.organizationId || !formData.code) {
        toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" });
        return;
      }
      const res = await fetch("/api/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Department created successfully" });
        setIsDialogOpen(false);
        fetchDeps();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create", variant: "destructive" });
    }
  };

  const DEPARTMENT_TYPES = [
    "CARDIOLOGY", "NEUROLOGY", "ORTHOPEDICS", "PEDIATRICS", "GYNECOLOGY",
    "DERMATOLOGY", "OPHTHALMOLOGY", "EMERGENCY", "INTERNAL_MEDICINE", "OTHER"
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage departments for organizations.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Department</DialogTitle>
              <DialogDescription>Add a new department to an organization.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Organization</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.organizationId} onChange={(e) => setFormData({...formData, organizationId: e.target.value})}>
                  <option value="">Select Organization / Branch</option>
                  {organizations.map((org: any) => (
                    <option key={org._id} value={org._id}>{org.organizationName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department Type</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}>
                  {DEPARTMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="e.g. CARDIO-01" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></TableCell></TableRow>
              ) : departments.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No departments found.</TableCell></TableRow>
              ) : (
                departments.map((dept: any) => (
                  <TableRow key={dept._id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.code}</TableCell>
                    <TableCell>{organizations.find((o: any) => o._id === dept.organizationId)?.organizationName || 'Unknown'}</TableCell>
                    <TableCell>{dept.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
