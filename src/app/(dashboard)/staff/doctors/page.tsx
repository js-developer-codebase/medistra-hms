"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("/api/doctor");
        const json = await res.json();
        if (json.success) {
          setDoctors(json.data);
        } else {
          toast({ title: "Error", description: json.message, variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load doctors.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Doctors</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Doctor & Staff Management Module</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Medical Staff</CardTitle>
          <CardDescription>View all doctors and their departmental assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No doctors found.</div>
          ) : (
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>License No.</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doc) => (
                    <TableRow key={doc._id}>
                      <TableCell className="font-medium">{doc.userId?.name || 'Unknown'}</TableCell>
                      <TableCell>{doc.departmentId?.name || 'N/A'}</TableCell>
                      <TableCell>{doc.licenseNo}</TableCell>
                      <TableCell>{doc.userId?.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={doc.userId?.isActive ? "default" : "secondary"}>
                          {doc.userId?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
