"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClaims = async () => {
    try {
      const res = await fetch("/api/insurance/claims");
      const data = await res.json();
      setClaims(data.data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch claims", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      claimNumber: formData.get("claimNumber"),
      amountClaimed: Number(formData.get("amountClaimed")),
      patientId: "64a2f8b5f39d1b001a1c3124", // Dummy valid ObjectId
      providerId: "64a2f8b5f39d1b001a1c3125", // Dummy valid ObjectId
      organizationId: "64a2f8b5f39d1b001a1c3123",
    };

    try {
      const res = await fetch("/api/insurance/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Claim added successfully" });
        fetchClaims();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add claim", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Insurance Claims</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track insurance claims</p>
      </div>
      
      <Card>
        <CardHeader><CardTitle>File New Claim</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <Input name="claimNumber" placeholder="Claim Number" required />
            <Input name="amountClaimed" type="number" placeholder="Amount Claimed" required />
            <Button type="submit" className="md:col-span-2">File Claim</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Claims List</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Number</TableHead>
                  <TableHead>Amount Claimed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>{c.claimNumber}</TableCell>
                    <TableCell>{c.amountClaimed}</TableCell>
                    <TableCell>{c.status}</TableCell>
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
