"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function TestCatalogPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    price: "",
    normalRange: "",
    turnaroundTime: "",
  });

  const fetchTests = async () => {
    try {
      const res = await fetch("/api/lab/tests");
      const data = await res.json();
      if (data.success) {
        setTests(data.data);
      }
    } catch (error) {
      toast({ title: "Error fetching tests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/lab/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Test added successfully" });
        setOpen(false);
        fetchTests();
        setFormData({
          name: "", code: "", category: "", price: "", normalRange: "", turnaroundTime: ""
        });
      } else {
        toast({ title: data.error || "Failed to add test", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const filteredTests = tests.filter((t) => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Test Catalog</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Test</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lab Test</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTest} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Normal Range</Label>
                <Input value={formData.normalRange} onChange={e => setFormData({...formData, normalRange: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Turnaround Time</Label>
                <Input value={formData.turnaroundTime} onChange={e => setFormData({...formData, turnaroundTime: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Save Test</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Turnaround</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No tests found.</TableCell></TableRow>
                ) : (
                  filteredTests.map((test) => (
                    <TableRow key={test._id}>
                      <TableCell className="font-medium">{test.code}</TableCell>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{test.category}</TableCell>
                      <TableCell>${test.price}</TableCell>
                      <TableCell>{test.turnaroundTime || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${test.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {test.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
