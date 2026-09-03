"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StockPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ code: "", name: "", category: "", unit: "", unitPrice: 0, reorderLevel: 0 });

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/inventory/items");
            if (!res.ok) throw new Error("Failed to fetch items");
            setItems(await res.json());
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/inventory/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem)
            });
            if (!res.ok) throw new Error("Failed to create item");
            toast({ title: "Success", description: "Item created successfully" });
            fetchItems();
            setNewItem({ code: "", name: "", category: "", unit: "", unitPrice: 0, reorderLevel: 0 });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Inventory Stock</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateItem} className="flex gap-4 items-end flex-wrap">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Code</label>
                            <Input value={newItem.code} onChange={(e) => setNewItem({...newItem, code: e.target.value})} required />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} required />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} required />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Unit</label>
                            <Input value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} required />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Price (₹)</label>
                            <Input type="number" value={newItem.unitPrice} onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})} required min="0" step="0.01" />
                        </div>
                        <Button type="submit">Add Item</Button>
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
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Price (₹)</TableHead>
                                    <TableHead>Total Value (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>{item.code}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>
                                            <span className={item.currentStock <= item.reorderLevel ? "text-destructive font-bold" : ""}>
                                                {item.currentStock} {item.unit}
                                            </span>
                                        </TableCell>
                                        <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>₹{(item.currentStock * item.unitPrice).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No items found</TableCell>
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
