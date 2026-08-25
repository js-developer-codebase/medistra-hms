"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/user");
        const json = await res.json();
        if (json.success) {
          setEmployees(json.data);
        } else {
          toast({ title: "Error", description: json.message, variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load employees.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Employees</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Staff & HR Module</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>View and manage all employees in the organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No employees found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp._id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.role?.role || 'N/A'}</TableCell>
                      <TableCell>{emp.gender}</TableCell>
                      <TableCell>
                        <Badge variant={emp.isActive ? "default" : "secondary"}>
                          {emp.isActive ? "Active" : "Inactive"}
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
