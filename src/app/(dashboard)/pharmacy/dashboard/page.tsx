"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function PharmacyDashboard() {
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStock: 0,
        totalPrescriptions: 0,
        pendingDispense: 0,
    });

    useEffect(() => {
        // Fetch stats from APIs later
        const fetchStats = async () => {
            try {
                const medRes = await fetch('/api/pharmacy/medicines');
                const meds = await medRes.json();
                
                const presRes = await fetch('/api/pharmacy/prescriptions');
                const press = await presRes.json();

                const totalMeds = meds.data?.length || 0;
                const lowStock = meds.data?.filter((m: any) => m.stockQuantity <= m.reorderLevel).length || 0;
                const totalPresc = press.data?.length || 0;

                setStats({
                    totalMedicines: totalMeds,
                    lowStock: lowStock,
                    totalPrescriptions: totalPresc,
                    pendingDispense: Math.floor(totalPresc * 0.3) // mock pending dispenses
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pharmacy Dashboard</h1>
                <p className="text-muted-foreground">Overview of pharmacy inventory and operations.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMedicines}</div>
                        <p className="text-xs text-muted-foreground">Items in inventory</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStock}</div>
                        <p className="text-xs text-muted-foreground">Items below reorder level</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
                        <p className="text-xs text-muted-foreground">Processed this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Dispense</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingDispense}</div>
                        <p className="text-xs text-muted-foreground">Waiting for collection</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
