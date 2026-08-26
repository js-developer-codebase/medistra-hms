"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PurchaseOrdersPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newOrder, setNewOrder] = useState({ poNumber: "" });

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/procurement/purchase-orders");
            if (!res.ok) throw new Error("Failed to fetch purchase orders");
            setOrders(await res.json());
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/procurement/purchase-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ poNumber: newOrder.poNumber, items: [], totalAmount: 0 })
            });
            if (!res.ok) throw new Error("Failed to create purchase order");
            toast({ title: "Success", description: "Purchase Order created successfully" });
            fetchOrders();
            setNewOrder({ poNumber: "" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-secondary text-secondary-foreground';
            case 'PENDING': return 'bg-yellow-500 text-white';
            case 'APPROVED': return 'bg-blue-500 text-white';
            case 'COMPLETED': return 'bg-green-500 text-white';
            case 'CANCELLED': return 'bg-red-500 text-white';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold">Purchase Orders</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Create Draft Order</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateOrder} className="flex gap-4 items-end">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">PO Number</label>
                            <Input value={newOrder.poNumber} onChange={(e) => setNewOrder({ poNumber: e.target.value })} required placeholder="e.g. PO-2023-001" />
                        </div>
                        <Button type="submit">Create PO</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="text-center text-muted-foreground">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-medium">{order.poNumber}</TableCell>
                                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">View / Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {orders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No purchase orders found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
