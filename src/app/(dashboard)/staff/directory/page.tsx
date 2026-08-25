"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch("/api/user");
        const json = await res.json();
        if (json.success) {
          setStaff(json.data);
        } else {
          toast({ title: "Error", description: json.message, variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load staff directory.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Staff Directory</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Doctor & Staff Management Module</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Contact information and roles for all staff.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No staff found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone || 'N/A'}</TableCell>
                      <TableCell>{member.role?.role || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Active" : "Inactive"}
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
