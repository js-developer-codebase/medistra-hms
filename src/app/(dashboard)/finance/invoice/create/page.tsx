"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function CreateInvoicePage() {
  const [patientId, setPatientId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [items, setItems] = useState([{ name: "", price: 0, quantity: 1, discount: 0, total: 0 }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-calculate total
    if (field === 'price' || field === 'quantity' || field === 'discount') {
      const p = Number(newItems[index].price || 0);
      const q = Number(newItems[index].quantity || 0);
      const d = Number(newItems[index].discount || 0);
      newItems[index].total = (p * q) - d;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", price: 0, quantity: 1, discount: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalDiscount = 0;
    items.forEach(item => {
      totalAmount += (Number(item.price || 0) * Number(item.quantity || 0));
      totalDiscount += Number(item.discount || 0);
    });
    const finalAmount = totalAmount - totalDiscount;
    return { totalAmount, totalDiscount, finalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { totalAmount, totalDiscount, finalAmount } = calculateTotals();
      
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          branchId,
          items,
          totalAmount,
          discount: totalDiscount,
          finalAmount,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast("Invoice created successfully!", "success");
        setPatientId("");
        setBranchId("");
        setItems([{ name: "", price: 0, quantity: 1, discount: 0, total: 0 }]);
      } else {
        toast(data.message || "Failed to create invoice", "error");
      }
    } catch (error) {
      toast("An error occurred while creating invoice", "error");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input 
                  id="patientId" 
                  value={patientId} 
                  onChange={(e) => setPatientId(e.target.value)} 
                  required 
                  placeholder="Enter Patient ObjectId"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchId">Branch ID</Label>
                <Input 
                  id="branchId" 
                  value={branchId} 
                  onChange={(e) => setBranchId(e.target.value)} 
                  required 
                  placeholder="Enter Branch ObjectId"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Invoice Items</h3>
                <Button type="button" onClick={addItem} variant="outline" size="sm">Add Item</Button>
              </div>
              
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 items-end border p-4 rounded-md">
                  <div className="col-span-2 space-y-2">
                    <Label>Item Name</Label>
                    <Input 
                      value={item.name} 
                      onChange={(e) => handleItemChange(index, "name", e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qty</Label>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input 
                      type="number" 
                      value={item.discount} 
                      onChange={(e) => handleItemChange(index, "discount", parseFloat(e.target.value))} 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total: ${item.total.toFixed(2)}</div>
                    {items.length > 1 && (
                      <Button type="button" onClick={() => removeItem(index)} variant="destructive" size="sm">
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <div className="space-y-2 text-right">
                <p>Subtotal: ${totals.totalAmount.toFixed(2)}</p>
                <p>Total Discount: ${totals.totalDiscount.toFixed(2)}</p>
                <p className="text-xl font-bold">Final Amount: ${totals.finalAmount.toFixed(2)}</p>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
