"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export default function CurrentAdmissionsPage() {
  const { toast } = useToast();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdmissions() {
      try {
        const res = await fetch("/api/admission");
        const result = await res.json();
        if (res.ok && result.success) {
          // Filter only active admissions
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
    }
    fetchAdmissions();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Current Admissions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View all currently admitted patients.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admitted Patients</CardTitle>
          <CardDescription>Total Admitted: {admissions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 h-24">
                      No current admissions.
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
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {admission.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
