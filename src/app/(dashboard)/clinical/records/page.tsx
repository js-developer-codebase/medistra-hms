"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/clinical/records");
      const data = await res.json();
      setRecords(data.data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load medical records", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">Comprehensive clinical documents</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No records found.</TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any) => (
                    <TableRow key={r._id}>
                      <TableCell>{new Date(r.dateRecorded).toLocaleDateString()}</TableCell>
                      <TableCell>{r.patient?.firstName} {r.patient?.lastName} ({r.patient?._id || r.patient})</TableCell>
                      <TableCell>{r.recordType}</TableCell>
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
