"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MedicinesPage() {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        genericName: "",
        expiryDate: "",
        unitPrice: 0,
        stockQuantity: 0,
        reorderLevel: 10,
    });

    const fetchMedicines = async () => {
        try {
            const res = await fetch(`/api/pharmacy/medicines?search=${search}`);
            const data = await res.json();
            if (data.success) setMedicines(data.data);
        } catch (error) {
            console.error("Failed to fetch medicines", error);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, [search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/pharmacy/medicines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast("Medicine added successfully", "success");
                setIsOpen(false);
                fetchMedicines();
                setFormData({ name: "", category: "", genericName: "", expiryDate: "", unitPrice: 0, stockQuantity: 0, reorderLevel: 10 });
            } else {
                toast(data.message, "error");
            }
        } catch (error) {
            toast("Something went wrong", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
                    <p className="text-muted-foreground">Manage pharmacy inventory and medicines.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Medicine</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Medicine</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="genericName">Generic Name</Label>
                                <Input id="genericName" value={formData.genericName} onChange={(e) => setFormData({...formData, genericName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input id="expiryDate" type="date" required value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="unitPrice">Unit Price</Label>
                                    <Input id="unitPrice" type="number" required value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: Number(e.target.value)})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                                    <Input id="stockQuantity" type="number" required value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: Number(e.target.value)})} />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save Medicine</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search medicines..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Generic Name</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {medicines.map((medicine: any) => (
                            <TableRow key={medicine._id}>
                                <TableCell className="font-medium">{medicine.name}</TableCell>
                                <TableCell>{medicine.category}</TableCell>
                                <TableCell>{medicine.genericName || "-"}</TableCell>
                                <TableCell>{medicine.stockQuantity}</TableCell>
                                <TableCell>${medicine.unitPrice.toFixed(2)}</TableCell>
                                <TableCell>{new Date(medicine.expiryDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {medicine.stockQuantity <= medicine.reorderLevel ? (
                                        <Badge variant="destructive">Low Stock</Badge>
                                    ) : (
                                        <Badge variant="secondary">In Stock</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {medicines.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No medicines found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
