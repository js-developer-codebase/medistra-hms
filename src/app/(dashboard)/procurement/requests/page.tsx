"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Building2,
  AlertTriangle,
  FileCheck2,
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

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    department: "Operation Theatre (OT)",
    requestedBy: "OT Incharge",
    requiredDate: "",
    priority: "MEDIUM",
    notes: "Regular departmental monthly supply replenishment",
    items: [
      {
        itemId: "",
        itemName: "Disposable Sterile Surgical Gloves (Size 7.5)",
        quantity: 20,
        uom: "Box of 100",
        estimatedUnitPrice: 850,
        clinicalJustification: "Surgeon sterile barrier protection"
      }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, itemsRes] = await Promise.all([
        fetch("/api/procurement/requests"),
        fetch("/api/inventory/items")
      ]);

      const reqData = await reqRes.json();
      if (reqData.success) {
        setRequests(reqData.data || []);
      }

      const itemsData = await itemsRes.json();
      setInventoryItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err: any) {
      toast(err.message || "Failed to load purchase requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: "",
          itemName: "",
          quantity: 10,
          uom: "Units",
          estimatedUnitPrice: 500,
          clinicalJustification: ""
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...formData.items];
    (updated[index] as any)[field] = value;
    if (field === "itemId") {
      const itm = inventoryItems.find((i) => i._id === value);
      if (itm) {
        updated[index].itemName = itm.name;
        updated[index].uom = itm.unit || "Units";
        updated[index].estimatedUnitPrice = itm.unitPrice || 0;
      }
    }
    setFormData({ ...formData, items: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department || !formData.requestedBy || formData.items.length === 0) {
      toast("Please complete department and line item details", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/procurement/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Purchase Indent ${data.data?.prNumber} submitted for approval!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to submit indent", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error submitting requisition", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/procurement/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          approvedBy: "Medical Director",
          rejectionReason: action === "REJECT" ? "Budget exceeded" : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        toast(`Request marked as ${action}D successfully`, "success");
        fetchData();
      }
    } catch (err: any) {
      toast("Error updating request status", "error");
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((pr) => {
      const matchesSearch =
        (pr.prNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (pr.department || "").toLowerCase().includes(search.toLowerCase()) ||
        (pr.requestedBy || "").toLowerCase().includes(search.toLowerCase());

      const matchesDept = deptFilter === "ALL" || pr.department === deptFilter;
      const matchesStatus = statusFilter === "ALL" || pr.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [requests, search, deptFilter, statusFilter]);

  const totalEstSpend = requests.reduce((sum, r) => sum + (r.totalEstimatedAmount || 0), 0);
  const pendingCount = requests.filter((r) => r.status === "SUBMITTED").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Purchase Requests &amp; Clinical Indents
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Internal departmental requisitions from OT, ICU, Emergency, and Wards awaiting clinical authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Raise Purchase Requisition
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Requisitions</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {requests.length} indents
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Logged across departments</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {pendingCount} indents
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Awaiting HOD sign-off</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Approved for PO</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {approvedCount} indents
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Ready for PO generation</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Estimated Value</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalEstSpend.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Total requisition budget</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by PR Number, Department, or Requested By..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="Operation Theatre (OT)">Operation Theatre (OT)</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Emergency & Casualty">Emergency &amp; Casualty</option>
                <option value="Inpatient General Wards">Inpatient General Wards</option>
                <option value="Biomedical & Maintenance">Biomedical &amp; Maintenance</option>
                <option value="CSSD Sterilization">CSSD Sterilization</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({requests.length})</option>
                <option value="SUBMITTED">Submitted (Pending Review)</option>
                <option value="APPROVED">Approved (Ready for PO)</option>
                <option value="PO_CREATED">PO Created</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" />
            Departmental Indents Register ({filteredRequests.length} records)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Purchase Requisitions
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Indent Code</TableHead>
                <TableHead>Date Logged</TableHead>
                <TableHead>Originating Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Requisition Items</TableHead>
                <TableHead className="text-right">Est. Budget (₹)</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    Loading purchase indents...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                    No purchase requisitions found. Click &quot;Raise Purchase Requisition&quot; to log a departmental need.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((pr) => {
                  return (
                    <TableRow key={pr._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-amber-700 dark:text-amber-400">
                        {pr.prNumber}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {new Date(pr.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>

                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {pr.department}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold ${
                            pr.priority === "URGENT_STAT"
                              ? "border-rose-500 text-rose-600 animate-pulse"
                              : pr.priority === "HIGH"
                              ? "border-orange-500 text-orange-600"
                              : "border-slate-400 text-slate-600"
                          }`}
                        >
                          {pr.priority}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-[240px]">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {(pr.items || []).map((i: any) => `${i.itemName} (x${i.quantity})`).join(", ")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {pr.items?.length || 0} line item(s)
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(pr.totalEstimatedAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {pr.requestedBy}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            pr.status === "APPROVED"
                              ? "bg-emerald-600 text-white"
                              : pr.status === "PO_CREATED"
                              ? "bg-blue-600 text-white"
                              : pr.status === "REJECTED"
                              ? "bg-rose-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          {pr.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {pr.status === "SUBMITTED" ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(pr._id, "APPROVE")}
                              className="h-6 text-[10px] text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(pr._id, "REJECT")}
                              className="h-6 text-[10px] text-rose-600 border-rose-300 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : pr.status === "APPROVED" ? (
                          <Link href={`/procurement/orders?prNumber=${pr.prNumber}`}>
                            <Button size="sm" className="h-6 text-[10px] bg-blue-600 hover:bg-blue-700 text-white">
                              Convert to PO
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {pr.poNumber || "Processed"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Raise Requisition Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Raise Departmental Purchase Indent
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Requesting Department *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  <option value="Operation Theatre (OT)">Operation Theatre (OT)</option>
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="Emergency & Casualty">Emergency &amp; Casualty</option>
                  <option value="Inpatient General Wards">Inpatient General Wards</option>
                  <option value="Labor & Delivery Room (LDR)">Labor &amp; Delivery Room (LDR)</option>
                  <option value="Biomedical & Maintenance">Biomedical &amp; Maintenance</option>
                  <option value="CSSD Sterilization">CSSD Sterilization</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Requested By (Staff / Nurse / Doctor) *</Label>
                <Input
                  required
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                  placeholder="e.g. Sister Incharge"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Priority Urgency *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="MEDIUM">Standard Requisition (Medium)</option>
                  <option value="LOW">Low Urgency (Stock Buffer)</option>
                  <option value="HIGH">High Priority (Low Safety Buffer)</option>
                  <option value="URGENT_STAT">CRITICAL STAT (Stockout Stoppage)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Required by Date</Label>
                <Input
                  type="date"
                  value={formData.requiredDate}
                  onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Line Items Entry */}
            <div className="space-y-2 border rounded-md p-3 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200">Requisition Items</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-6 text-[10px] flex items-center gap-1 text-blue-600"
                >
                  <Plus className="h-3 w-3" /> Add Item Line
                </Button>
              </div>

              {formData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded border">
                  <div className="col-span-4">
                    <Label className="text-[10px]">Select Catalog Item or Name</Label>
                    <Input
                      placeholder="Item name"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                      className="text-xs h-8"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px]">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="text-xs font-mono h-8"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px]">UOM</Label>
                    <Input
                      value={item.uom}
                      onChange={(e) => handleItemChange(idx, "uom", e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="col-span-3">
                    <Label className="text-[10px]">Est Rate (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.estimatedUnitPrice}
                      onChange={(e) => handleItemChange(idx, "estimatedUnitPrice", Number(e.target.value))}
                      className="text-xs font-mono h-8"
                    />
                  </div>

                  <div className="col-span-1 pt-4 text-center">
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-6 w-6 text-rose-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Clinical Purpose / Justification Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Reason for requisition (e.g. Surge in surgical cases, scheduled craniotomies)"
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
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? "Submitting..." : "Submit for HOD Approval"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
