"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Calendar, User, Clock, FileText } from 'lucide-react';

export default function BookAppointmentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'NEW',
        reason: '',
        notes: ''
    });

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                // Fetch patients
                const pRes = await fetch('/api/patient');
                const pData = await pRes.json();
                if (pData.success) {
                    setPatients(pData.data);
                }

                // Fetch doctors (mocked from users, ideally filtering by DOCTOR role)
                const uRes = await fetch('/api/user');
                const uData = await uRes.json();
                if (uData.success) {
                    setDoctors(uData.data.filter((u: any) => u.role?.name?.includes('DOCTOR') || u.role?.role?.includes('DOCTOR'))); // Very basic filter
                }
            } catch (err) {
                console.error("Failed to load dependencies", err);
            }
        };
        fetchDependencies();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            
            if (res.ok && data.success) {
                toast({ title: "Success", description: "Appointment booked successfully", variant: "success" });
                router.push('/appointments/list');
            } else {
                toast({ title: "Error", description: data.error || "Failed to book appointment", variant: "error" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Book Appointment</h1>
                <p className="text-slate-500 mt-2">Schedule a new appointment for a patient.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>Fill in the required information to book.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select 
                                label="Patient" 
                                name="patientId" 
                                value={formData.patientId} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select Patient</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.contact})</option>
                                ))}
                            </Select>

                            <Select 
                                label="Doctor" 
                                name="doctorId" 
                                value={formData.doctorId} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(d => (
                                    <option key={d._id} value={d._id}>Dr. {d.name}</option>
                                ))}
                            </Select>

                            <Input 
                                name="appointmentDate" 
                                type="date" 
                                value={formData.appointmentDate} 
                                onChange={handleChange} 
                                required
                            />

                            <Input 
                                name="appointmentTime" 
                                type="time" 
                                value={formData.appointmentTime} 
                                onChange={handleChange} 
                                required
                            />

                            <Select 
                                label="Type" 
                                name="type" 
                                value={formData.type} 
                                onChange={handleChange}
                            >
                                <option value="NEW">New</option>
                                <option value="FOLLOW_UP">Follow Up</option>
                                <option value="EMERGENCY">Emergency</option>
                            </Select>

                            <Input 
                                name="reason" 
                                type="text" 
                                value={formData.reason} 
                                onChange={handleChange} 
                                required
                                placeholder="e.g. Fever, Checkup"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                            <textarea 
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="mt-1 flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 min-h-[100px]"
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Booking..." : "Book Appointment"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
