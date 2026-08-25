"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function AppointmentsListPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/appointments');
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            } else {
                toast({ title: "Error", description: data.error, type: "error" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return;
        
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (data.success) {
                toast({ title: "Success", description: "Appointment deleted successfully", type: "success" });
                fetchAppointments();
            } else {
                toast({ title: "Error", description: data.error, type: "error" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, type: "error" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'SCHEDULED': return <Badge variant="secondary">Scheduled</Badge>;
            case 'CONFIRMED': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Confirmed</Badge>;
            case 'CHECKED_IN': return <Badge variant="default" className="bg-indigo-500 hover:bg-indigo-600">Checked In</Badge>;
            case 'IN_PROGRESS': return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">In Progress</Badge>;
            case 'COMPLETED': return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            case 'NO_SHOW': return <Badge variant="outline" className="text-red-500 border-red-500">No Show</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage and track patient appointments.</p>
                </div>
                <Link href="/appointments/book">
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Book Appointment
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-8 text-center text-slate-500">Loading appointments...</div>
                    ) : appointments.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">No appointments found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((apt) => (
                                    <TableRow key={apt._id}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                {apt.patientId?.name || "Unknown Patient"}
                                            </div>
                                            <div className="text-xs text-slate-500">{apt.patientId?.contact}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-700 dark:text-slate-300">
                                                Dr. {apt.doctorId?.name || "Unknown"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                <span>{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 mt-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{apt.appointmentTime}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize">{apt.type?.replace('_', ' ').toLowerCase()}</span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(apt.status)}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {/* Minimal action buttons */}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(apt._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
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
