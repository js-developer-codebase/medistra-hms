"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Scissors
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

export default function OTBookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientName: "",
    otRoom: "OT 1 - Modular Cardiac OT",
    bookingDate: new Date().toISOString().slice(0, 10),
    slotStartTime: "08:30 AM",
    slotEndTime: "12:00 PM",
    procedureName: "",
    surgeonName: "Dr. Rajeshwar Naidu",
    equipmentRequired: ["Heart-Lung Machine (CPB)", "IABP Console"],
    equipmentRentalCost: 35000,
    cssdSterilizationStatus: "Sterilized & Verified" as const,
    notes: "Laminar airflow positive pressure verified."
  });

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ot/booking");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (err) {
      toast("Failed to load OT bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const equipmentCatalog = [
    { name: "Heart-Lung Machine (CPB)", cost: 35000 },
    { name: "Zeiss Operating Neuro-Microscope", cost: 20000 },
    { name: "CUSA Ultrasonic Surgical Aspirator", cost: 15000 },
    { name: "Karl Storz 4K Laparoscopy Tower", cost: 12000 },
    { name: "Harmonic Scalpel & Ultrasonic Shear", cost: 8000 },
    { name: "C-Arm Fluoroscopy Imaging System", cost: 5000 },
    { name: "Stryker Orthopedic Power Tools", cost: 6000 },
    { name: "Argon Plasma Coagulator (APC)", cost: 7500 }
  ];

  const handleToggleEquipment = (eq: { name: string; cost: number }) => {
    const exists = formData.equipmentRequired.includes(eq.name);
    let updated: string[];
    let newCost = formData.equipmentRentalCost;

    if (exists) {
      updated = formData.equipmentRequired.filter((item) => item !== eq.name);
      newCost -= eq.cost;
    } else {
      updated = [...formData.equipmentRequired, eq.name];
      newCost += eq.cost;
    }

    setFormData({
      ...formData,
      equipmentRequired: updated,
      equipmentRentalCost: Math.max(0, newCost)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.procedureName.trim()) {
      toast("Patient name and procedure name are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ot/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`OT Suite booked: ${data.data.bookingNumber}!`, "success");
        setIsOpen(false);
        loadBookings();
      } else {
        toast(data.message || "Failed to create booking", "error");
      }
    } catch (err) {
      toast("Error saving booking", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const pName = b.patientName || "";
      const proc = b.procedureName || "";
      const surg = b.surgeonName || "";
      const num = b.bookingNumber || "";

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        proc.toLowerCase().includes(search.toLowerCase()) ||
        surg.toLowerCase().includes(search.toLowerCase()) ||
        num.toLowerCase().includes(search.toLowerCase());

      const matchesRoom = roomFilter === "ALL" || b.otRoom === roomFilter;
      return matchesSearch && matchesRoom;
    });
  }, [bookings, search, roomFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            OT Room &amp; Specialized Equipment Booking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Suite slot reservations, high-tech laparoscopic towers, C-Arms, and CSSD sterilization certifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Reserve OT Suite &amp; Equipment
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
                placeholder="Search bookings by patient, procedure, surgeon, or booking #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="ALL">All 5 OT Suites</option>
                <option value="OT 1 - Modular Cardiac OT">OT 1: Modular Cardiac Suite</option>
                <option value="OT 2 - Neuro-Trauma OT">OT 2: Neuro-Trauma Suite</option>
                <option value="OT 3 - Orthopedic & Joint Replacement OT">OT 3: Orthopedic &amp; Joint</option>
                <option value="OT 4 - Laparoscopic & GI OT">OT 4: Laparoscopic &amp; GI</option>
                <option value="OT 5 - Emergency & Minor OT">OT 5: Emergency &amp; Daycare</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            Active Suite Bookings &amp; Equipment Manifest ({filteredBookings.length} Bookings)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Booking #</TableHead>
                <TableHead>Patient &amp; Procedure</TableHead>
                <TableHead>OT Suite &amp; Slot</TableHead>
                <TableHead>Operating Surgeon</TableHead>
                <TableHead>Equipment Reserved</TableHead>
                <TableHead>CSSD Status</TableHead>
                <TableHead>Tariff</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No active OT bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b) => (
                  <TableRow key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                      {b.bookingNumber}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {b.patientName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {b.procedureName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-emerald-700 dark:text-emerald-400">
                        {b.otRoom}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {b.slotStartTime} - {b.slotEndTime}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      {b.surgeonName}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {b.equipmentRequired && b.equipmentRequired.map((eq: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] border"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[9px] text-teal-700 dark:text-teal-400 border-teal-300"
                      >
                        <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                        {b.cssdSterilizationStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-bold font-mono text-slate-900 dark:text-white">
                      ₹{(b.equipmentRentalCost || 0).toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={
                          b.status === "In Use"
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 text-white"
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Reserve OT Suite &amp; Specialized Equipment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Patient Full Name *</Label>
                <Input
                  required
                  placeholder="Patient Name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Procedure Title *</Label>
                <Input
                  required
                  placeholder="e.g. Total Knee Arthroplasty"
                  value={formData.procedureName}
                  onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Operating Surgeon *</Label>
                <Input
                  required
                  value={formData.surgeonName}
                  onChange={(e) => setFormData({ ...formData, surgeonName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">OT Suite *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.otRoom}
                  onChange={(e) => setFormData({ ...formData, otRoom: e.target.value })}
                >
                  <option value="OT 1 - Modular Cardiac OT">OT 1: Modular Cardiac Suite</option>
                  <option value="OT 2 - Neuro-Trauma OT">OT 2: Neuro-Trauma Suite</option>
                  <option value="OT 3 - Orthopedic & Joint Replacement OT">OT 3: Orthopedic Suite</option>
                  <option value="OT 4 - Laparoscopic & GI OT">OT 4: Laparoscopic Suite</option>
                  <option value="OT 5 - Emergency & Minor OT">OT 5: Emergency &amp; Daycare</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Slot Start Time *</Label>
                <Input
                  required
                  value={formData.slotStartTime}
                  onChange={(e) => setFormData({ ...formData, slotStartTime: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Slot End Time *</Label>
                <Input
                  required
                  value={formData.slotEndTime}
                  onChange={(e) => setFormData({ ...formData, slotEndTime: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Equipment Multi-Select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold">Select Specialized Equipment Towers</Label>
                <span className="text-xs font-bold text-indigo-600">
                  Equipment Cost: ₹{formData.equipmentRentalCost.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border">
                {equipmentCatalog.map((eq, idx) => {
                  const isChecked = formData.equipmentRequired.includes(eq.name);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-[11px] border transition-colors ${
                        isChecked
                          ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEquipment(eq)}
                          className="rounded border-gray-300"
                        />
                        <span>{eq.name}</span>
                      </div>
                      <span className="font-mono font-medium text-slate-500">
                        ₹{eq.cost.toLocaleString("en-IN")}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">CSSD Sterilization Status *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.cssdSterilizationStatus}
                  onChange={(e) => setFormData({ ...formData, cssdSterilizationStatus: e.target.value as any })}
                >
                  <option value="Sterilized & Verified">Sterilized &amp; Verified</option>
                  <option value="In Autoclave">In Autoclave</option>
                  <option value="Pending CSSD">Pending CSSD</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Special Instructions</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-xs"
                />
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
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? "Reserving..." : `Reserve OT Suite (₹${formData.equipmentRentalCost.toLocaleString("en-IN")})`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
