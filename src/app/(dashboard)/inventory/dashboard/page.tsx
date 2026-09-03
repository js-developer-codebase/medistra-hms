"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function InventoryDashboard() {
    const { toast } = useToast();
    const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, totalValue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/inventory/items");
                if (!res.ok) throw new Error("Failed to fetch inventory stats");
                const data = await res.json();
                
                let lowStock = 0;
                let totalValue = 0;
                
                data.forEach((item: any) => {
                    if (item.currentStock <= item.reorderLevel) lowStock++;
                    totalValue += item.currentStock * item.unitPrice;
                });
                
                setStats({
                    totalItems: data.length,
                    lowStock,
                    totalValue
                });
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [toast]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Inventory Dashboard</h1>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats.lowStock}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
