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

export default function OrganizationBranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [mains, setMains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "HOSPITAL",
    branchType: "BRANCH",
    headQuarter: "",
    email: "",
    phone: "",
    address: ""
  });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization");
      const data = await res.json();
      if (data.success) {
        setBranches(data.data.filter((o: any) => o.branchType === 'BRANCH'));
        setMains(data.data.filter((o: any) => o.branchType === 'MAIN'));
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch branches", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      if (!formData.headQuarter) {
        toast({ title: "Validation Error", description: "Please select a main organization", variant: "destructive" });
        return;
      }
      const res = await fetch("/api/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Branch created successfully" });
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">Manage organization branches.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Branch</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Branch</DialogTitle>
              <DialogDescription>Add a new branch to an existing organization.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Parent Organization</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.headQuarter} onChange={(e) => setFormData({...formData, headQuarter: e.target.value})}>
                  <option value="">Select Main Org</option>
                  {mains.map((m: any) => (
                    <option key={m._id} value={m._id}>{m.organizationName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input value={formData.organizationName} onChange={(e) => setFormData({...formData, organizationName: e.target.value})} placeholder="e.g. Salt Lake Branch" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.organizationType} onChange={(e) => setFormData({...formData, organizationType: e.target.value as any})}>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="PHARMACY">Pharmacy</option>
                </select>
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
                <TableHead>Branch Name</TableHead>
                <TableHead>Parent Org</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></TableCell></TableRow>
              ) : branches.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No branches found.</TableCell></TableRow>
              ) : (
                branches.map((branch: any) => (
                  <TableRow key={branch._id}>
                    <TableCell className="font-medium">{branch.organizationName}</TableCell>
                    <TableCell>{branch.headQuarter ? (mains.find((m: any) => m._id === branch.headQuarter)?.organizationName || 'Unknown') : 'N/A'}</TableCell>
                    <TableCell>{branch.organizationType}</TableCell>
                    <TableCell>{branch.isActive ? 'Active' : 'Inactive'}</TableCell>
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
