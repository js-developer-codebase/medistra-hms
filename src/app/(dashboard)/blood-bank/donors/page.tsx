"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function DonorsPage() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDonors = async () => {
    try {
      const res = await fetch("/api/blood-bank/donors");
      const data = await res.json();
      setDonors(data.data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch donors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      bloodGroup: formData.get("bloodGroup"),
      contactNumber: formData.get("contactNumber"),
      organizationId: "64a2f8b5f39d1b001a1c3123", // Dummy valid ObjectId
    };

    try {
      const res = await fetch("/api/blood-bank/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Donor added successfully" });
        fetchDonors();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add donor", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Donors</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage blood donors</p>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Add New Donor</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
            <Input name="firstName" placeholder="First Name" required />
            <Input name="lastName" placeholder="Last Name" required />
            <Input name="bloodGroup" placeholder="Blood Group (e.g. O+)" required />
            <Input name="contactNumber" placeholder="Contact Number" required />
            <Button type="submit" className="md:col-span-4">Add Donor</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Donors List</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donors.map((donor) => (
                  <TableRow key={donor._id}>
                    <TableCell>{donor.firstName} {donor.lastName}</TableCell>
                    <TableCell>{donor.bloodGroup}</TableCell>
                    <TableCell>{donor.contactNumber}</TableCell>
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
