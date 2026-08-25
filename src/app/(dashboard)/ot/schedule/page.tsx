"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OTSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [formData, setFormData] = useState({ patientName: "", surgeryName: "", surgeon: "", date: "", time: "", duration: 60, otRoom: "" });
  const { toast } = useToast();

  async function loadSchedules() {
    const res = await fetch("/api/ot/schedule");
    const data = await res.json();
    if (data.success) {
      setSchedules(data.data);
    }
  }

  useEffect(() => {
    loadSchedules();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/ot/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Schedule added successfully." });
        setFormData({ patientName: "", surgeryName: "", surgeon: "", date: "", time: "", duration: 60, otRoom: "" });
        loadSchedules();
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
        <h1 className="text-2xl font-bold tracking-tight">Surgery Schedule</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Surgery Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Patient Name</label>
                <Input required value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Surgery Name</label>
                <Input required value={formData.surgeryName} onChange={(e) => setFormData({...formData, surgeryName: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Surgeon</label>
                <Input required value={formData.surgeon} onChange={(e) => setFormData({...formData, surgeon: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">OT Room</label>
                <Input required value={formData.otRoom} onChange={(e) => setFormData({...formData, otRoom: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>
            <div>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Surgeries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Surgery</TableHead>
                <TableHead>Surgeon</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{new Date(s.date).toLocaleDateString()} {s.time}</TableCell>
                  <TableCell>{s.patientName}</TableCell>
                  <TableCell>{s.surgeryName}</TableCell>
                  <TableCell>{s.surgeon}</TableCell>
                  <TableCell>{s.otRoom}</TableCell>
                  <TableCell>{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
