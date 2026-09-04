"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThermometerSnowflake,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function BloodInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [componentFilter, setComponentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bloodGroup: "O+",
    componentType: "PRBC",
    volumeMl: 350,
    storageLocation: "Blood Refrigerator 1 (2-6°C)",
    shelfLifeDays: 35,
    donorName: "Voluntary Donor",
    ttiTestStatus: "TESTED_SAFE",
    processingFee: 1450,
    status: "AVAILABLE",
    notes: "Direct verified safe bag entry"
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blood-bank/inventory");
      const data = await res.json();
      if (data.success) {
        setInventory(data.data || []);
      }
    } catch (err) {
      toast("Failed to load blood inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(formData.shelfLifeDays));

    const payload = {
      ...formData,
      expiryDate: expiry
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Bag ${data.data.bagNumber} added to ${data.data.storageLocation}`, "success");
        setIsOpen(false);
        fetchInventory();
      } else {
        toast(data.message || "Failed to add inventory unit", "error");
      }
    } catch (err) {
      toast("Error creating inventory unit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const bag = item.bagNumber || "";
      const matchesSearch =
        bag.toLowerCase().includes(search.toLowerCase()) ||
        item.donorName?.toLowerCase().includes(search.toLowerCase());

      const matchesGroup = groupFilter === "ALL" || item.bloodGroup === groupFilter;
      const matchesComponent = componentFilter === "ALL" || item.componentType === componentFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesGroup && matchesComponent && matchesStatus;
    });
  }, [inventory, search, groupFilter, componentFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Blood Cold Chain Inventory &amp; Refrigerators
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time stock monitoring across 2°C–6°C blood refrigerators, -40°C deep freezers, and platelet agitators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInventory}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Blood Bag Unit
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by bag number or donor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="ALL">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
              >
                <option value="ALL">All Components</option>
                <option value="PRBC">Packed Red Cells (PRBC)</option>
                <option value="WHOLE_BLOOD">Whole Blood (WB)</option>
                <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                <option value="PLATELETS">Platelets (RDP/SDP)</option>
                <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available for Issue</option>
                <option value="RESERVED">Reserved for Patient / OT</option>
                <option value="ISSUED">Issued / Dispensed</option>
                <option value="DISCARDED">Discarded / Expired</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ThermometerSnowflake className="h-4 w-4 text-purple-600" />
            Blood Bank Refrigerated Bags Directory ({filtered.length} Bags)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Bag Number</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Component &amp; Volume</TableHead>
                <TableHead>Storage Location</TableHead>
                <TableHead>Expiry Date / Shelf-Life</TableHead>
                <TableHead>TTI Clearance</TableHead>
                <TableHead>Tariff (₹)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No blood units found matching current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const daysLeft = Math.ceil(
                    (new Date(item.expiryDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
                  const isExpired = daysLeft <= 0;

                  return (
                    <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.bagNumber}
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-rose-600 text-white font-bold text-[10px]">
                          {item.bloodGroup}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.componentType}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.volumeMl} ml
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-slate-800 dark:text-slate-200">{item.storageLocation}</div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-[11px]">
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            isExpired
                              ? "text-rose-600"
                              : isExpiringSoon
                              ? "text-orange-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {isExpired ? "EXPIRED" : `${daysLeft} days remaining`}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            item.ttiTestStatus === "TESTED_SAFE"
                              ? "border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950"
                              : item.ttiTestStatus === "PENDING_TEST"
                              ? "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950"
                              : "border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950"
                          }`}
                        >
                          {item.ttiTestStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(item.processingFee || 1450).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            item.status === "AVAILABLE"
                              ? "bg-emerald-600 text-white"
                              : item.status === "RESERVED"
                              ? "bg-indigo-600 text-white"
                              : item.status === "ISSUED"
                              ? "bg-slate-600 text-white"
                              : "bg-rose-600 text-white"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Blood Bag Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              Add Blood Bag to Inventory
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Blood Group *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Component Type *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.componentType}
                  onChange={(e) => {
                    const comp = e.target.value;
                    let defaultDays = 35;
                    let defaultFee = 1450;
                    let location = "Blood Refrigerator 1 (2-6°C)";
                    if (comp === "FFP" || comp === "CRYOPRECIPITATE") {
                      defaultDays = 365;
                      defaultFee = 1200;
                      location = "Deep Freezer -40°C";
                    } else if (comp === "PLATELETS") {
                      defaultDays = 5;
                      defaultFee = 2200;
                      location = "Platelet Agitator (22°C)";
                    }
                    setFormData({
                      ...formData,
                      componentType: comp,
                      shelfLifeDays: defaultDays,
                      processingFee: defaultFee,
                      storageLocation: location
                    });
                  }}
                >
                  <option value="PRBC">Packed Red Cells (PRBC)</option>
                  <option value="WHOLE_BLOOD">Whole Blood (WB)</option>
                  <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                  <option value="PLATELETS">Platelets Concentrate (RDP/SDP)</option>
                  <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Volume (ml) *</Label>
                <Input
                  type="number"
                  value={formData.volumeMl}
                  onChange={(e) => setFormData({ ...formData, volumeMl: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Shelf Life (Days) *</Label>
                <Input
                  type="number"
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData({ ...formData, shelfLifeDays: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Storage Cold Unit *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              >
                <option value="Blood Refrigerator 1 (2-6°C)">Blood Refrigerator 1 (2-6°C)</option>
                <option value="Blood Refrigerator 2 (2-6°C)">Blood Refrigerator 2 (2-6°C)</option>
                <option value="Deep Freezer -40°C">Deep Freezer -40°C</option>
                <option value="Platelet Agitator (22°C)">Platelet Agitator &amp; Incubator (22°C)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Processing Tariff (₹) *</Label>
                <Input
                  type="number"
                  value={formData.processingFee}
                  onChange={(e) => setFormData({ ...formData, processingFee: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">TTI Safety Status *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.ttiTestStatus}
                  onChange={(e) => setFormData({ ...formData, ttiTestStatus: e.target.value })}
                >
                  <option value="TESTED_SAFE">TESTED_SAFE (Ready)</option>
                  <option value="PENDING_TEST">PENDING_TEST (Quarantined)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? "Saving Bag..." : "Save to Cold Storage"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
