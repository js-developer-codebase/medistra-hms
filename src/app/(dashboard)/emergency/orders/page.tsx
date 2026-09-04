"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Flame,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  FlaskConical,
  Scan,
  Pill,
  Droplets,
  Activity,
  Trash2
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

export default function EmergencyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [casualties, setCasualties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    casualtyId: "",
    patientName: "",
    uhid: "",
    orderType: "LAB",
    itemName: "",
    priority: "STAT",
    cost: 1200,
    instructions: "Perform STAT within 15 minutes",
    orderedBy: "Dr. Arvind (ER Medical Officer)"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [oRes, cRes] = await Promise.all([
        fetch("/api/emergency/orders"),
        fetch("/api/emergency/casualty")
      ]);

      const oData = await oRes.json();
      if (oData.success) setOrders(oData.data || []);

      const cData = await cRes.json();
      if (cData.success) setCasualties(cData.data || []);
    } catch (err) {
      toast("Failed to load emergency orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCasualty = (cId: string) => {
    const found = casualties.find((c) => c._id === cId);
    if (found) {
      setFormData({
        ...formData,
        casualtyId: found._id,
        patientName: found.patientName,
        uhid: found.uhid || ""
      });
    }
  };

  const presetOrders = [
    { type: "LAB", name: "Cardiac Biomarkers (Troponin-I STAT & CK-MB)", cost: 1850 },
    { type: "LAB", name: "Arterial Blood Gas (ABG) & Lactate", cost: 1100 },
    { type: "LAB", name: "Emergency Trauma Panel (CBC, PT/INR, Crossmatch)", cost: 2400 },
    { type: "IMAGING", name: "STAT Bedside Portable Chest X-Ray", cost: 750 },
    { type: "IMAGING", name: "e-FAST Bedside Abdominal & Pleural Ultrasound", cost: 1400 },
    { type: "IMAGING", name: "STAT Non-Contrast Brain CT (Trauma)", cost: 2800 },
    { type: "MEDICATION", name: "IV Pantoprazole 40mg + Ondansetron 4mg", cost: 180 },
    { type: "MEDICATION", name: "Normal Saline 0.9% 500ml Bolus STAT", cost: 120 },
    { type: "BLOOD_CROSSMATCH", name: "PRBC 2 Units Crossmatch & Release", cost: 3200 }
  ];

  const handleSelectPreset = (p: { type: string; name: string; cost: number }) => {
    setFormData({
      ...formData,
      orderType: p.type as any,
      itemName: p.name,
      cost: p.cost
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName.trim() || !formData.patientName.trim()) {
      toast("Patient name and order item are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/emergency/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`STAT Order ${data.data.orderNumber} created!`, "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to create order", "error");
      }
    } catch (err) {
      toast("Error creating order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/emergency/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Order updated to ${newStatus}`, "success");
        loadData();
      }
    } catch (err) {
      toast("Failed to update order status", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        o.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "ALL" || o.orderType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [orders, search, typeFilter]);

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "LAB":
        return <FlaskConical className="h-4 w-4 text-emerald-600" />;
      case "IMAGING":
        return <Scan className="h-4 w-4 text-blue-600" />;
      case "MEDICATION":
        return <Pill className="h-4 w-4 text-amber-600" />;
      case "BLOOD_CROSSMATCH":
        return <Droplets className="h-4 w-4 text-rose-600" />;
      default:
        return <Activity className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            STAT Emergency Orders Requisition
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            STAT diagnostic labs, bedside portable imaging, crossmatch requests, and emergency medications in ₹.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (casualties.length > 0) handleSelectCasualty(casualties[0]._id);
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Create STAT Order
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search orders by patient, test name, or order #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All Categories ({orders.length})</option>
                <option value="LAB">STAT Laboratory</option>
                <option value="IMAGING">Bedside Imaging</option>
                <option value="MEDICATION">Emergency Medications</option>
                <option value="BLOOD_CROSSMATCH">Blood Crossmatch</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-600" />
            STAT Orders Ledger ({filteredOrders.length} Orders)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Order #</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Order Item &amp; Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Tariff (₹)</TableHead>
                <TableHead>Execution Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No emergency orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o) => (
                  <TableRow key={o._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                      {o.orderNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {o.patientName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {o.uhid || "Casualty"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        {renderTypeIcon(o.orderType)}
                        <span>{o.itemName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {o.instructions}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          o.priority === "STAT"
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-500 text-white"
                        }
                      >
                        {o.priority}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                      ₹{(o.cost || 0).toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell>
                      <select
                        className="h-7 rounded border border-input bg-background px-2 py-0 text-[11px] shadow-sm font-medium"
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                      >
                        <option value="ORDERED">Ordered</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </TableCell>

                    <TableCell className="text-center">
                      {o.status === "COMPLETED" ? (
                        <span className="text-emerald-600 font-medium text-[11px] flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Reported
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium text-[11px] flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" /> Processing
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* STAT Order Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              Requisition STAT Emergency Order
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Fast-pick Presets */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-500">
                FAST-PICK EMERGENCY PROTOCOL PRESETS
              </Label>
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800 rounded border">
                {presetOrders.map((p, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => handleSelectPreset(p)}
                  >
                    + {p.name.slice(0, 24)}... (₹{p.cost})
                  </Button>
                ))}
              </div>
            </div>

            {/* Casualty Patient */}
            <div className="space-y-1">
              <Label className="text-xs">Casualty Patient *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.casualtyId}
                onChange={(e) => handleSelectCasualty(e.target.value)}
              >
                <option value="">-- Choose Patient --</option>
                {casualties
                  .filter((c) => c.status !== "DISCHARGED" && c.status !== "ADMITTED")
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.patientName} ({c.caseNumber}) - Bay: {c.assignedBay}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Order Category *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value as any })}
                >
                  <option value="LAB">STAT Laboratory Investigation</option>
                  <option value="IMAGING">Bedside / Portable Imaging</option>
                  <option value="MEDICATION">Emergency Medication</option>
                  <option value="BLOOD_CROSSMATCH">Blood Bank Crossmatch</option>
                  <option value="PROCEDURE">Bedside Clinical Procedure</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Priority *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="STAT">STAT (Immediate / &lt; 15 mins)</option>
                  <option value="URGENT">URGENT (&lt; 45 mins)</option>
                  <option value="ROUTINE">ROUTINE</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Investigation / Drug Name *</Label>
              <Input
                required
                placeholder="e.g. Troponin-I STAT, Portable Chest X-Ray"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Emergency Tariff / Price (₹) *</Label>
                <Input
                  type="number"
                  required
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ordering Physician</Label>
                <Input
                  value={formData.orderedBy}
                  onChange={(e) => setFormData({ ...formData, orderedBy: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Clinical Indications &amp; Instructions</Label>
              <Input
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="text-xs"
              />
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
                className="text-xs bg-orange-600 hover:bg-orange-700 text-white"
              >
                {submitting ? "Submitting..." : `Dispatch STAT Order (₹${formData.cost})`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
