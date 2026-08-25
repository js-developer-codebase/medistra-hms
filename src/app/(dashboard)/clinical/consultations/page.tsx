"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ConsultationsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patient: "",
    chiefComplaint: "",
    assessment: "",
    plan: ""
  });

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/clinical/records?recordType=Consultation");
      const data = await res.json();
      setRecords(data.data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load consultations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        recordType: "Consultation"
      };
      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast({ title: "Success", description: "Consultation created" });
        setOpen(false);
        setFormData({ patient: "", chiefComplaint: "", assessment: "", plan: "" });
        fetchRecords();
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to create", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">Manage patient consultations and visits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Consultation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Consultation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient ID</Label>
                <Input required value={formData.patient} onChange={e => setFormData({...formData, patient: e.target.value})} placeholder="MongoDB Object ID of Patient" />
              </div>
              <div className="space-y-2">
                <Label>Chief Complaint</Label>
                <Input required value={formData.chiefComplaint} onChange={e => setFormData({...formData, chiefComplaint: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Assessment</Label>
                <Textarea value={formData.assessment} onChange={e => setFormData({...formData, assessment: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Textarea value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Save Consultation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No consultations found.</TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any) => (
                    <TableRow key={r._id}>
                      <TableCell>{new Date(r.dateRecorded).toLocaleDateString()}</TableCell>
                      <TableCell>{r.patient?.firstName} {r.patient?.lastName} ({r.patient?._id || r.patient})</TableCell>
                      <TableCell>{r.chiefComplaint || "N/A"}</TableCell>
                      <TableCell>{r.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
