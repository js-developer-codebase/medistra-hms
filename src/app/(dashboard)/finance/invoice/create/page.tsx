"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  Search,
  User,
  Plus,
  Trash2,
  IndianRupee,
  Receipt,
  CheckCircle2,
  CreditCard,
  Building2,
  Calendar,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Printer
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface LineItem {
  name: string;
  category: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number; // percentage, e.g. 0, 5, 12, 18
  total: number;
}

const COMMON_SERVICES = [
  { name: "General OPD Consultation", category: "Consultation", price: 500, tax: 0 },
  { name: "Specialist Consultation (MD/MS)", category: "Consultation", price: 1000, tax: 0 },
  { name: "Emergency Casualty & Triage", category: "Emergency", price: 850, tax: 0 },
  { name: "Complete Blood Count (CBC)", category: "Laboratory", price: 450, tax: 0 },
  { name: "Comprehensive Metabolic Panel (CMP)", category: "Laboratory", price: 1200, tax: 0 },
  { name: "Digital Chest X-Ray (PA View)", category: "Radiology", price: 650, tax: 0 },
  { name: "Ultrasound Abdomen & Pelvis", category: "Radiology", price: 1500, tax: 0 },
  { name: "ICU Bed Charges (Per Day)", category: "IPD", price: 6500, tax: 12 },
  { name: "General Ward Bed (Per Day)", category: "IPD", price: 1800, tax: 0 },
  { name: "Minor Surgical Dressing & Suture", category: "Surgery", price: 750, tax: 5 }
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();

  // Patient Search & Selected Patient
  const [patients, setPatients] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // Billing Form State
  const [department, setDepartment] = useState("OPD Consultation");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { name: "General OPD Consultation", category: "Consultation", price: 500, quantity: 1, discount: 0, tax: 0, total: 500 }
  ]);

  // Payment Options
  const [collectNow, setCollectNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [cashierName, setCashierName] = useState("Central Billing Desk");

  const [submitting, setSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  // Load Patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setSearchingPatients(true);
        const res = await fetch("/api/patient");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPatients(data.data);
          if (data.data.length > 0) {
            setSelectedPatient(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load patients", err);
      } finally {
        setSearchingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.uhid?.toLowerCase().includes(q) ||
      p.contact?.includes(q)
    );
  });

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;

    const p = Number(newItems[index].price || 0);
    const q = Number(newItems[index].quantity || 0);
    const d = Number(newItems[index].discount || 0);
    const tPct = Number(newItems[index].tax || 0);

    const base = Math.max(0, p * q - d);
    const taxAmt = (base * tPct) / 100;
    newItems[index].total = Math.round(base + taxAmt);

    setItems(newItems);
  };

  const addPresetService = (preset: typeof COMMON_SERVICES[0]) => {
    const base = preset.price;
    const taxAmt = (base * preset.tax) / 100;
    setItems([
      ...items,
      {
        name: preset.name,
        category: preset.category,
        price: preset.price,
        quantity: 1,
        discount: 0,
        tax: preset.tax,
        total: Math.round(base + taxAmt)
      }
    ]);
  };

  const addCustomItem = () => {
    setItems([
      ...items,
      {
        name: "",
        category: "General",
        price: 0,
        quantity: 1,
        discount: 0,
        tax: 0,
        total: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast("At least one billing line item is required", "error");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const p = Number(item.price || 0);
      const q = Number(item.quantity || 0);
      const d = Number(item.discount || 0);
      const tPct = Number(item.tax || 0);

      const gross = p * q;
      const taxable = Math.max(0, gross - d);
      const tax = (taxable * tPct) / 100;

      subtotal += gross;
      totalDiscount += d;
      totalTax += tax;
    });

    const finalAmount = Math.max(0, subtotal - totalDiscount + totalTax);
    return {
      subtotal: Math.round(subtotal),
      totalDiscount: Math.round(totalDiscount),
      totalTax: Math.round(totalTax),
      finalAmount: Math.round(finalAmount)
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient?._id) {
      toast("Please select a valid patient to bill", "error");
      return;
    }

    if (items.some((it) => !it.name.trim() || it.price < 0 || it.quantity <= 0)) {
      toast("Please fill in valid name, price and quantity for all items", "error");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Invoice
      const invoicePayload = {
        patientId: selectedPatient._id,
        department,
        items,
        totalAmount: totals.subtotal,
        discount: totals.totalDiscount,
        taxAmount: totals.totalTax,
        finalAmount: totals.finalAmount,
        paidAmount: collectNow ? totals.finalAmount : 0,
        balanceAmount: collectNow ? 0 : totals.finalAmount,
        status: collectNow ? "PAID" : "UNPAID",
        paymentMethod: collectNow ? paymentMethod : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes
      };

      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoicePayload)
      });
      const data = await res.json();

      if (!data.success) {
        toast(data.message || "Failed to create invoice", "error");
        setSubmitting(false);
        return;
      }

      const invoice = data.data;

      // 2. If collectNow is true, record payment
      if (collectNow) {
        const payRes = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: invoice._id,
            patientId: selectedPatient._id,
            amount: totals.finalAmount,
            method: paymentMethod,
            transactionId: transactionId || `TXN-${Date.now().toString().slice(-6)}`,
            cashierName,
            notes: `Instant payment at billing counter for ${department}`
          })
        });
        const payData = await payRes.json();
        if (payData.success) {
          invoice.receipt = payData.data;
        }
      }

      setCreatedInvoice(invoice);
      toast("Invoice generated successfully!", "success");
    } catch (err: any) {
      toast("Failed to process billing: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Link href="/finance">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2.5 bg-emerald-600/10 text-emerald-600 rounded-xl">
            <FilePlus2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Patient Invoice</h1>
            <p className="text-sm text-muted-foreground">
              Hospital billing terminal with multi-service catalog, GST computation & instant payment receipt
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/finance/invoices">
            <Button variant="outline" size="sm">
              View Invoices
            </Button>
          </Link>
          <Link href="/finance/receipts">
            <Button variant="outline" size="sm">
              Receipts
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Modal / Banner if created */}
      {createdInvoice && (
        <Card className="border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-full">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">
                    Invoice {createdInvoice.invoiceNumber || createdInvoice._id} Created!
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Billed to {selectedPatient?.name} &bull; Total: ₹{Number(createdInvoice.finalAmount).toLocaleString("en-IN")} &bull; Status: {createdInvoice.status}
                    {createdInvoice.receipt?.receiptNumber && ` (Receipt: ${createdInvoice.receipt.receiptNumber})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/finance/invoices">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    View in Invoices
                  </Button>
                </Link>
                {createdInvoice.receipt?.receiptNumber && (
                  <Link href="/finance/receipts">
                    <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-700">
                      Print Receipt
                    </Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCreatedInvoice(null);
                    setItems([
                      { name: "General OPD Consultation", category: "Consultation", price: 500, quantity: 1, discount: 0, tax: 0, total: 500 }
                    ]);
                  }}
                >
                  Create Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Patient Info & Billing Catalog */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Patient Selection */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    1. Patient Details
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {patients.length} Registered Patients
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search patient by Name, UHID, or Mobile..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                {/* Patient Selection Dropdown */}
                <div className="max-h-40 overflow-y-auto border rounded-md divide-y text-xs">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.slice(0, 5).map((p) => {
                      const isSelected = selectedPatient?._id === p._id;
                      return (
                        <div
                          key={p._id}
                          onClick={() => setSelectedPatient(p)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-l-emerald-600 font-medium"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              UHID: {p.uhid || "N/A"} &bull; Age: {p.age || "N/A"} &bull; {p.gender} &bull; Contact: {p.contact}
                            </p>
                          </div>
                          {isSelected && (
                            <Badge className="bg-emerald-600 text-white text-[10px]">Selected</Badge>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No patients matched.</div>
                  )}
                </div>

                {/* Selected Patient Banner */}
                {selectedPatient && (
                  <div className="p-3 bg-muted/40 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs border">
                    <div>
                      <span className="text-muted-foreground">Patient:</span>{" "}
                      <strong className="text-slate-900 dark:text-white">{selectedPatient.name}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">UHID:</span>{" "}
                      <strong className="text-emerald-600">{selectedPatient.uhid || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age/Gender:</span>{" "}
                      <strong>{selectedPatient.age} Y / {selectedPatient.gender}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Blood:</span>{" "}
                      <Badge variant="outline" className="text-[10px]">{selectedPatient.bloodGroup || "O+"}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Line Items & Services */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold">2. Billable Services & Items</CardTitle>
                    <CardDescription className="text-xs">
                      Select preset clinical procedures or add custom hospital bill items
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={addCustomItem} className="text-xs gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add Item
                    </Button>
                  </div>
                </div>

                {/* Quick Presets Strip */}
                <div className="pt-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" /> Quick Add Common Services:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SERVICES.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPresetService(s)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:bg-slate-800 text-[11px] font-medium rounded-md border transition-colors text-left"
                      >
                        + {s.name} (₹{s.price})
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-y text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3 text-left font-semibold min-w-[200px]">Service / Item Name</th>
                        <th className="py-2.5 px-3 text-left font-semibold w-24">Category</th>
                        <th className="py-2.5 px-3 text-right font-semibold w-24">Rate (₹)</th>
                        <th className="py-2.5 px-3 text-center font-semibold w-16">Qty</th>
                        <th className="py-2.5 px-3 text-right font-semibold w-20">Disc (₹)</th>
                        <th className="py-2.5 px-3 text-center font-semibold w-20">GST %</th>
                        <th className="py-2.5 px-3 text-right font-semibold w-24">Total (₹)</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2 px-3">
                            <Input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                              placeholder="Item or service name"
                              className="h-8 text-xs"
                              required
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={item.category}
                              onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                            >
                              <option value="Consultation">Consultation</option>
                              <option value="Laboratory">Laboratory</option>
                              <option value="Radiology">Radiology</option>
                              <option value="Emergency">Emergency</option>
                              <option value="IPD">IPD Bed</option>
                              <option value="Surgery">Surgery</option>
                              <option value="Pharmacy">Pharmacy</option>
                              <option value="General">General</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                              className="h-8 text-xs text-right"
                              required
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                              className="h-8 text-xs text-center"
                              required
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleItemChange(idx, "discount", Number(e.target.value))}
                              className="h-8 text-xs text-right"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={item.tax}
                              onChange={(e) => handleItemChange(idx, "tax", Number(e.target.value))}
                              className="h-8 w-full rounded-md border border-input bg-background px-1 text-xs text-center"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                            ₹{item.total.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(idx)}
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right 1 Col: Department, Summary & Instant Payment */}
          <div className="space-y-6">
            {/* Department & Meta */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Department & Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs">Billing Department</Label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="OPD Consultation">OPD Consultation</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                    <option value="Inpatient (IPD)">Inpatient (IPD)</option>
                    <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                    <option value="Radiology & Imaging">Radiology & Imaging</option>
                    <option value="Pharmacy Counter">Pharmacy Counter</option>
                    <option value="Operation Theatre (OT)">Operation Theatre (OT)</option>
                    <option value="General Hospital Services">General Hospital Services</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Due Date (Optional)</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Notes / Clinical Referral</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Dr. Sen referral, Room 204"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bill Summary Calculation */}
            <Card className="shadow-sm border-t-4 border-t-emerald-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Invoice Calculation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Gross Subtotal</span>
                  <span className="font-medium">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Total Concessions</span>
                  <span className="font-medium text-rose-600">-₹{totals.totalDiscount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">GST / Taxes</span>
                  <span className="font-medium">+₹{totals.totalTax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg text-emerald-900 dark:text-emerald-300">
                  <span>Net Payable Amount:</span>
                  <span>₹{totals.finalAmount.toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Collection Action */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Payment Settlement
                  </CardTitle>
                  <input
                    type="checkbox"
                    id="collectNow"
                    checked={collectNow}
                    onChange={(e) => setCollectNow(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <CardDescription className="text-xs">
                  {collectNow ? "Generate receipt & mark PAID immediately" : "Save as UNPAID credit invoice"}
                </CardDescription>
              </CardHeader>

              {collectNow && (
                <CardContent className="space-y-3 text-xs border-t pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Payment Method</Label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="UPI">UPI / QR Scan (Google Pay / PhonePe / Paytm)</option>
                      <option value="CASH">Cash Counter</option>
                      <option value="CARD">Debit / Credit Card (POS Terminal)</option>
                      <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
                      <option value="INSURANCE_TPA">Insurance / TPA Pre-auth</option>
                      <option value="CHEQUE">Cheque / Demand Draft</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Transaction / UTR Reference (Optional)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. UPI Ref # or Card Slip #"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Cashier / Billing Counter</Label>
                    <Input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </CardContent>
              )}

              <CardFooter className="pt-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Processing Invoice...
                    </>
                  ) : collectNow ? (
                    <>
                      <Receipt className="h-4 w-4" /> Collect ₹{totals.finalAmount.toLocaleString("en-IN")} & Bill
                    </>
                  ) : (
                    <>
                      <FilePlus2 className="h-4 w-4" /> Generate Credit Invoice (₹{totals.finalAmount.toLocaleString("en-IN")})
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
