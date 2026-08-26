"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function DischargePage() {
  const { toast } = useToast();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [dischargeDate, setDischargeDate] = useState("");
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admission");
      const result = await res.json();
      if (res.ok && result.success) {
        // Only show admitted patients for discharge
        const active = result.data.filter((a: any) => a.status === "ADMITTED" || a.status === "TRANSFERRED");
        setAdmissions(active);
      } else {
        toast(result.message || "Failed to fetch admissions", "error");
      }
    } catch (err: any) {
      toast("An error occurred while fetching admissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [toast]);

  const handleDischargeClick = (admission: any) => {
    setSelectedAdmission(admission);
    setDischargeDate(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm
    setDischargeNotes("");
    setDischargeOpen(true);
  };

  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admission/${selectedAdmission._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DISCHARGED",
          dischargeDate: new Date(dischargeDate).toISOString(),
          notes: selectedAdmission.notes ? `${selectedAdmission.notes}\n\nDischarge Notes: ${dischargeNotes}` : `Discharge Notes: ${dischargeNotes}`
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast("Patient discharged successfully", "success");
        setDischargeOpen(false);
        fetchAdmissions(); // Refresh list
      } else {
        toast(result.message || "Failed to discharge patient", "error");
      }
    } catch (err: any) {
      toast("An error occurred while discharging patient", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Discharge Patients</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Process patient discharges from the hospital.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Patients Eligible for Discharge</CardTitle>
          <CardDescription>Select a patient to initiate the discharge process.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 h-24">
                        No active admissions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admissions.map((admission) => (
                      <TableRow key={admission._id}>
                        <TableCell>{new Date(admission.admissionDate).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">
                          {admission.patientId?.name || admission.patientId || "Unknown"}
                        </TableCell>
                        <TableCell>{admission.doctorId?.name || admission.doctorId || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{admission.admissionType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDischargeClick(admission)}
                          >
                            Discharge
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dischargeOpen} onOpenChange={setDischargeOpen}>
        <DialogContent>
          <form onSubmit={handleDischargeSubmit}>
            <DialogHeader>
              <DialogTitle>Discharge Patient</DialogTitle>
              <DialogDescription>
                You are about to discharge {selectedAdmission?.patientId?.name || "this patient"}. Please confirm the discharge details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="dischargeDate">Discharge Date & Time</Label>
                <Input
                  type="datetime-local"
                  id="dischargeDate"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dischargeNotes">Discharge Notes / Summary</Label>
                <Textarea
                  id="dischargeNotes"
                  rows={4}
                  placeholder="Final diagnosis, follow-up instructions, condition on discharge..."
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDischargeOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Discharge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
