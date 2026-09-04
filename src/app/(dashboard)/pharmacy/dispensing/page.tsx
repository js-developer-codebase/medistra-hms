"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Search,
  User,
  FileText,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  AlertTriangle,
  RefreshCw,
  Clock
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
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface CartItem {
  medicineId: string;
  medicineName: string;
  genericName?: string;
  dosageForm?: string;
  batchNumber?: string;
  availableStock: number;
  unitPrice: number;
  quantity: number;
  gstPercent: number;
  discountPercent: number;
  totalAmount: number;
}

function PharmacyDispenseContent() {
  const searchParams = useSearchParams();
  const preselectedPrescriptionId = searchParams.get("prescriptionId");

  const [medicines, setMedicines] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  // Patient Info
  const [patientName, setPatientName] = useState("Walk-in Patient");
  const [patientPhone, setPatientPhone] = useState("");
  const [uhid, setUhid] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);

  // Cart & POS
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState("");
  const [medSearch, setMedSearch] = useState("");
  const [discountOverall, setDiscountOverall] = useState(0); // in percent
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD" | "CREDIT_HOSPITAL">("CASH");
  const [pharmacistNotes, setPharmacistNotes] = useState("");

  // Completed Receipt Modal
  const [completedBill, setCompletedBill] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [medRes, presRes] = await Promise.all([
        fetch("/api/pharmacy/medicines"),
        fetch("/api/pharmacy/prescriptions")
      ]);

      const medData = await medRes.json();
      const allMeds = medData.data || [];
      setMedicines(allMeds);

      const presData = await presRes.json();
      const allPres = presData.data || [];
      setPrescriptions(allPres);

      // If prescription ID was provided in URL, auto-select it
      if (preselectedPrescriptionId) {
        const target = allPres.find((p: any) => p._id === preselectedPrescriptionId);
        if (target) {
          handleSelectPrescription(target, allMeds);
        }
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load dispensing data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedPrescriptionId]);

  const handleSelectPrescription = (pres: any, currentMeds: any[] = medicines) => {
    setSelectedPrescription(pres);
    setPatientName(pres.patientId?.name || "Patient");
    setPatientPhone(pres.patientId?.phone || "");
    setUhid(pres.patientId?.uhid || "");
    setPatientId(pres.patientId?._id || null);

    // Match prescribed medications with available medicines in stock
    const newItems: CartItem[] = [];
    if (pres.medications && Array.isArray(pres.medications)) {
      for (const rxItem of pres.medications) {
        const found = currentMeds.find((m) =>
          m.name.toLowerCase().includes(rxItem.name.toLowerCase()) ||
          rxItem.name.toLowerCase().includes(m.name.toLowerCase())
        );

        if (found) {
          const qty = 10; // default dosage count or 1 strip
          const unitPrice = found.unitPrice || 0;
          const gst = found.gstRate || 12;
          const lineTotal = Math.round(qty * unitPrice * (1 + gst / 100));

          newItems.push({
            medicineId: found._id,
            medicineName: found.name,
            genericName: found.genericName,
            dosageForm: found.dosageForm || "TABLET",
            batchNumber: found.batchNumber || "BAT-DEF",
            availableStock: found.stockQuantity || 0,
            unitPrice: unitPrice,
            quantity: Math.min(qty, found.stockQuantity || 1),
            gstPercent: gst,
            discountPercent: 0,
            totalAmount: lineTotal
          });
        }
      }
    }

    if (newItems.length > 0) {
      setCart(newItems);
      toast(`Loaded prescription & matched ${newItems.length} drugs from inventory`, "success");
    } else {
      toast("Loaded prescription details. Add required drugs to cart.", "info");
    }
  };

  const handleAddToCart = (med: any) => {
    if (med.stockQuantity <= 0) {
      toast(`${med.name} is currently OUT OF STOCK!`, "error");
      return;
    }

    const existingIndex = cart.findIndex((i) => i.medicineId === med._id);
    if (existingIndex > -1) {
      const updated = [...cart];
      const cur = updated[existingIndex];
      if (cur.quantity >= med.stockQuantity) {
        toast(`Maximum stock reached (${med.stockQuantity} available)`, "error");
        return;
      }
      cur.quantity += 1;
      const gst = cur.gstPercent || 12;
      cur.totalAmount = Math.round(cur.quantity * cur.unitPrice * (1 + gst / 100));
      setCart(updated);
    } else {
      const gst = med.gstRate || 12;
      const initialQty = 1;
      const total = Math.round(initialQty * (med.unitPrice || 0) * (1 + gst / 100));

      setCart([
        ...cart,
        {
          medicineId: med._id,
          medicineName: med.name,
          genericName: med.genericName,
          dosageForm: med.dosageForm || "TABLET",
          batchNumber: med.batchNumber || "BAT-DEF",
          availableStock: med.stockQuantity || 0,
          unitPrice: med.unitPrice || 0,
          quantity: initialQty,
          gstPercent: gst,
          discountPercent: 0,
          totalAmount: total
        }
      ]);
    }
  };

  const handleUpdateQuantity = (idx: number, qty: number) => {
    const updated = [...cart];
    const item = updated[idx];
    const safeQty = Math.max(1, Math.min(qty, item.availableStock));
    item.quantity = safeQty;
    const gst = item.gstPercent || 12;
    item.totalAmount = Math.round(safeQty * item.unitPrice * (1 + gst / 100));
    setCart(updated);
  };

  const handleRemoveFromCart = (idx: number) => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  // Totals calculation
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    return cart.reduce(
      (acc, item) =>
        acc + (item.quantity * item.unitPrice * (item.gstPercent || 12)) / 100,
      0
    );
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountOverall) / 100;
  }, [subtotal, discountOverall]);

  const netPayable = useMemo(() => {
    return Math.round(subtotal + taxAmount - discountAmount);
  }, [subtotal, taxAmount, discountAmount]);

  // Filtered medicine search results
  const filteredMeds = useMemo(() => {
    if (!medSearch) return medicines.slice(0, 8);
    return medicines
      .filter(
        (m) =>
          m.name?.toLowerCase().includes(medSearch.toLowerCase()) ||
          m.genericName?.toLowerCase().includes(medSearch.toLowerCase()) ||
          m.category?.toLowerCase().includes(medSearch.toLowerCase())
      )
      .slice(0, 10);
  }, [medicines, medSearch]);

  const handleCompleteDispense = async () => {
    if (cart.length === 0) {
      toast("Cart is empty. Add medicines to dispense.", "error");
      return;
    }
    if (!patientName.trim()) {
      toast("Patient name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        prescriptionId: selectedPrescription?._id || undefined,
        patientId: patientId || undefined,
        patientName,
        patientPhone,
        uhid,
        items: cart.map((i) => ({
          medicineId: i.medicineId,
          medicineName: i.medicineName,
          batchNumber: i.batchNumber,
          dosageForm: i.dosageForm,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          gstPercent: i.gstPercent,
          discountPercent: i.discountPercent,
          totalAmount: i.totalAmount
        })),
        subtotal: Math.round(subtotal),
        discountAmount: Math.round(discountAmount),
        taxAmount: Math.round(taxAmount),
        totalAmount: netPayable,
        paymentMode,
        paymentStatus: "PAID",
        notes: pharmacistNotes
      };

      const res = await fetch("/api/pharmacy/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast("Medications dispensed and inventory updated!", "success");
        setCompletedBill(data.data);
        // Reset POS
        setCart([]);
        setSelectedPrescription(null);
        setPatientName("Walk-in Patient");
        setPatientPhone("");
        setUhid("");
        loadData();
      } else {
        toast(data.message || "Dispense transaction failed", "error");
      }
    } catch (err) {
      toast("Error processing dispense", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Point-of-Sale &amp; Dispensing Counter
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time prescription dispensing, OTC drug sales, automatic inventory deduction, and tax invoices.
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

          {selectedPrescription && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPrescription(null);
                setPatientName("Walk-in Patient");
                setUhid("");
                setCart([]);
              }}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Clear Prescription
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient & Medicine Search (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Prescription & Patient Info Card */}
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                Customer &amp; Prescription Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {/* Prescription Picker */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">
                  Select Pending Prescription (Optional)
                </Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={selectedPrescription?._id || ""}
                  onChange={(e) => {
                    const pres = prescriptions.find((p) => p._id === e.target.value);
                    if (pres) handleSelectPrescription(pres);
                    else {
                      setSelectedPrescription(null);
                      setPatientName("Walk-in Patient");
                    }
                  }}
                >
                  <option value="">-- Direct OTC Walk-in Sale --</option>
                  {prescriptions
                    .filter((p) => p.dispenseStatus !== "DISPENSED")
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.patientId?.name || "Patient"} (UHID: {p.patientId?.uhid || "N/A"}) - Dr. {p.doctorId?.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs">Patient Name *</Label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient full name"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="text-xs"
                  />
                </div>
              </div>

              {selectedPrescription && (
                <div className="p-2.5 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-300">
                  <div className="font-bold flex items-center justify-between">
                    <span>Active Rx: Dr. {selectedPrescription.doctorId?.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {new Date(selectedPrescription.visitDate).toLocaleDateString()}
                    </Badge>
                  </div>
                  {selectedPrescription.diagnosis && (
                    <div className="text-[11px] mt-0.5">
                      Dx: {selectedPrescription.diagnosis}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Drug Lookup & Add */}
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-600" />
                Drug Search &amp; Fast Add
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search medicine brand, generic or category..."
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>

              <div className="divide-y max-h-[360px] overflow-y-auto border rounded-lg">
                {filteredMeds.map((med) => {
                  const out = med.stockQuantity <= 0;
                  return (
                    <div
                      key={med._id}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{med.name}</span>
                          <Badge variant="outline" className="text-[9px]">
                            {med.dosageForm || "TABLET"}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {med.genericName || med.category} • Batch: {med.batchNumber || "N/A"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="font-bold text-slate-900 dark:text-white">
                            ₹{med.unitPrice || 0}
                          </div>
                          <div className={`text-[9px] ${out ? "text-rose-500 font-bold" : "text-slate-400"}`}>
                            {out ? "Out of stock" : `${med.stockQuantity} left`}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          disabled={out}
                          onClick={() => handleAddToCart(med)}
                          className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Cart, Bill Summary & Payment (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  Itemized Dispensing Cart ({cart.length} Medicines)
                </CardTitle>
              </div>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCart([])}
                  className="h-7 text-xs text-rose-600"
                >
                  Clear Cart
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {cart.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  Your dispensing counter is empty. Pick a prescription or add medicines from the left search panel.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-center w-[90px]">Qty</TableHead>
                        <TableHead className="text-right">Total (₹)</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {item.medicineName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              GST {item.gstPercent}%
                            </div>
                          </TableCell>

                          <TableCell className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {item.batchNumber}
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            ₹{item.unitPrice}
                          </TableCell>

                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="1"
                              max={item.availableStock}
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(idx, Number(e.target.value))}
                              className="h-7 w-16 text-center text-xs mx-auto"
                            />
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              max {item.availableStock}
                            </div>
                          </TableCell>

                          <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                            ₹{item.totalAmount}
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-rose-500"
                              onClick={() => handleRemoveFromCart(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment & Checkout Summary */}
          {cart.length > 0 && (
            <Card className="border shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-sm font-bold">
                  Payment Mode &amp; Bill Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                {/* Payment Mode Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Settlement Method *
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      type="button"
                      variant={paymentMode === "CASH" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMode("CASH")}
                      className={`text-xs flex items-center justify-center gap-1.5 h-9 ${
                        paymentMode === "CASH" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                      }`}
                    >
                      <Banknote className="h-4 w-4" /> Cash
                    </Button>

                    <Button
                      type="button"
                      variant={paymentMode === "UPI" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMode("UPI")}
                      className={`text-xs flex items-center justify-center gap-1.5 h-9 ${
                        paymentMode === "UPI" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                      }`}
                    >
                      <QrCode className="h-4 w-4" /> UPI / QR
                    </Button>

                    <Button
                      type="button"
                      variant={paymentMode === "CARD" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMode("CARD")}
                      className={`text-xs flex items-center justify-center gap-1.5 h-9 ${
                        paymentMode === "CARD" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                      }`}
                    >
                      <CreditCard className="h-4 w-4" /> Card
                    </Button>

                    <Button
                      type="button"
                      variant={paymentMode === "CREDIT_HOSPITAL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMode("CREDIT_HOSPITAL")}
                      className={`text-xs flex items-center justify-center gap-1.5 h-9 ${
                        paymentMode === "CREDIT_HOSPITAL" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                      }`}
                    >
                      <Building2 className="h-4 w-4" /> IP Credit
                    </Button>
                  </div>
                </div>

                {/* Discount and Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Overall Concession / Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discountOverall}
                      onChange={(e) => setDiscountOverall(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Pharmacist Notes / Batch remarks</Label>
                    <Input
                      placeholder="Special instructions or batch remarks"
                      value={pharmacistNotes}
                      onChange={(e) => setPharmacistNotes(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Financial Summary Table */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Gross Subtotal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Taxes &amp; GST (Inclusive):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      +₹{Math.round(taxAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({discountOverall}%):</span>
                      <span>-₹{Math.round(discountAmount).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                    <span>Net Total Payable:</span>
                    <span className="text-emerald-600 text-lg">
                      ₹{netPayable.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Submit Dispense Button */}
                <Button
                  size="lg"
                  disabled={submitting}
                  onClick={handleCompleteDispense}
                  className="w-full text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 h-11"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {submitting ? "Processing..." : `Complete Dispense & Print Receipt (₹${netPayable.toLocaleString("en-IN")})`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Completed Dispense Receipt Modal */}
      <Dialog open={!!completedBill} onOpenChange={(open) => !open && setCompletedBill(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" /> Dispense Successful &amp; Invoiced
            </DialogTitle>
          </DialogHeader>

          {completedBill && (
            <div className="space-y-4 pt-2 text-xs" id="pharmacy-receipt-area">
              {/* Hospital Header */}
              <div className="text-center pb-3 border-b space-y-0.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  MEDISTRA SUPER SPECIALITY HOSPITAL
                </h3>
                <p className="text-[11px] text-slate-500">
                  Central Pharmacy Dispensary • 24x7 Emergency Services
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  GSTIN: 07AAACM1234E1Z1 • DL No: DL-20B/21B-MED9920
                </p>
              </div>

              {/* Bill & Patient Meta */}
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">BILL NUMBER</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {completedBill.billNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px]">DATE &amp; TIME</span>
                  <span>{new Date(completedBill.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">PATIENT NAME</span>
                  <span className="font-bold">{completedBill.patientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px]">PAYMENT MODE</span>
                  <Badge variant="outline" className="text-[10px]">
                    {completedBill.paymentMode} - PAID
                  </Badge>
                </div>
              </div>

              {/* Items List */}
              <div className="border rounded overflow-hidden">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50 dark:bg-slate-800">
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedBill.items?.map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.medicineName}</TableCell>
                        <TableCell className="font-mono text-[10px]">{item.batchNumber}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono">₹{item.unitPrice}</TableCell>
                        <TableCell className="text-right font-bold">₹{item.totalAmount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Total Settlement */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg flex items-center justify-between text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <span>Total Amount Paid:</span>
                <span className="text-base">₹{(completedBill.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>

              <div className="text-[10px] text-slate-400 text-center italic">
                Thank you for choosing Medistra Hospital Pharmacy. Keep medicines out of reach of children.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletedBill(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={handlePrintReceipt}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Tax Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PharmacyDispensingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <PharmacyDispenseContent />
    </Suspense>
  );
}
