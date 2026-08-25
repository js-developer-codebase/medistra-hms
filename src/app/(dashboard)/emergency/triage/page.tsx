"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TriagePage() {
  const [triages, setTriages] = useState<any[]>([]);
  const [formData, setFormData] = useState({ patientName: "", priority: "Green", chiefComplaint: "" });
  const { toast } = useToast();

  async function loadTriages() {
    const res = await fetch("/api/emergency/triage");
    const data = await res.json();
    if (data.success) {
      setTriages(data.data);
    }
  }

  useEffect(() => {
    loadTriages();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/emergency/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Triage added successfully." });
        setFormData({ patientName: "", priority: "Green", chiefComplaint: "" });
        loadTriages();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Triage Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Triage</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Patient Name</label>
              <Input required value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium">Priority (Red/Yellow/Green/Black)</label>
              <Input required value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium">Chief Complaint</label>
              <Input required value={formData.chiefComplaint} onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})} />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Triages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Complaint</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triages.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{t.patientName}</TableCell>
                  <TableCell>{t.priority}</TableCell>
                  <TableCell>{t.chiefComplaint}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
