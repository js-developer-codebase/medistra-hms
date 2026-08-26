"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/insurance/providers");
      const data = await res.json();
      setProviders(data.data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch providers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      contactPerson: formData.get("contactPerson"),
      contactNumber: formData.get("contactNumber"),
      organizationId: "64a2f8b5f39d1b001a1c3123",
    };

    try {
      const res = await fetch("/api/insurance/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Provider added successfully" });
        fetchProviders();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add provider", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Insurance Providers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage insurance providers and TPAs</p>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Add New Provider</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
            <Input name="name" placeholder="Provider Name" required />
            <Input name="contactPerson" placeholder="Contact Person" required />
            <Input name="contactNumber" placeholder="Contact Number" required />
            <Button type="submit" className="md:col-span-3">Add Provider</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Providers List</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.contactPerson}</TableCell>
                    <TableCell>{p.contactNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
