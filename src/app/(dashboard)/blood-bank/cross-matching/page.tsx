"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Droplet,
  AlertTriangle,
  XCircle,
  Clock,
  FlaskConical,
  ShieldCheck,
  UserCheck
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

export default function CrossMatchingPage() {
  const [crossmatches, setCrossmatches] = useState<any[]>([]);
  const [availableBags, setAvailableBags] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientName: "",
    uhid: "",
    patientBloodGroup: "O+",
    bagNumber: "",
    bagBloodGroup: "O+",
    componentType: "PRBC",
    method: "Gel Card Matrix (Coombs)",
    majorCrossmatch: "COMPATIBLE",
    minorCrossmatch: "COMPATIBLE",
    overallResult: "COMPATIBLE",
    crossmatchedBy: "Sr. Blood Bank Tech",
    verifiedBy: "Dr. Transfusion Specialist",
    notes: "Gel-card agglutination negative at 37°C. Compatible for transfusion."
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [xmRes, invRes] = await Promise.all([
        fetch("/api/blood-bank/cross-matching"),
        fetch("/api/blood-bank/inventory?status=AVAILABLE")
      ]);

      const xmData = await xmRes.json();
      if (xmData.success) setCrossmatches(xmData.data || []);

      const invData = await invRes.json();
      if (invData.success) {
        setAvailableBags(invData.data || []);
        if (invData.data?.length > 0 && !formData.bagNumber) {
          setFormData((prev) => ({
            ...prev,
            bagNumber: invData.data[0].bagNumber,
            bagBloodGroup: invData.data[0].bloodGroup,
            componentType: invData.data[0].componentType
          }));
        }
      }
    } catch (err) {
      toast("Failed to load crossmatching records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBagSelect = (bagNumber: string) => {
    const selected = availableBags.find((b) => b.bagNumber === bagNumber);
    if (selected) {
      setFormData({
        ...formData,
        bagNumber: selected.bagNumber,
        bagBloodGroup: selected.bloodGroup,
        componentType: selected.componentType
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.bagNumber) {
      toast("Patient name and bag number are required", "error");
      return;
    }

    const isCompatible =
      formData.majorCrossmatch === "COMPATIBLE" &&
      formData.minorCrossmatch === "COMPATIBLE";

    const payload = {
      ...formData,
      overallResult: isCompatible ? "COMPATIBLE" : "INCOMPATIBLE"
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/cross-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Crossmatch ${data.data.crossmatchCode} completed: ${data.data.overallResult}!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to submit crossmatch", "error");
      }
    } catch (err) {
      toast("Error submitting crossmatch", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = crossmatches.filter(
    (xm) =>
      xm.crossmatchCode?.toLowerCase().includes(search.toLowerCase()) ||
      xm.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      xm.bagNumber?.toLowerCase().includes(search.toLowerCase()) ||
      xm.uhid?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Cross Matching &amp; Compatibility Workstation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Major &amp; minor Coombs gel-card matrix compatibility testing and 48-hour blood bag reservations.
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
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Perform Crossmatch Test
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by crossmatch code, patient name, UHID, or bag number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Crossmatches Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-indigo-600" />
            Completed Compatibility Crossmatch Records ({filtered.length} Records)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Crossmatch Code</TableHead>
                <TableHead>Patient Details &amp; Group</TableHead>
                <TableHead>Donor Bag Number &amp; Group</TableHead>
                <TableHead>Methodology</TableHead>
                <TableHead>Major / Minor</TableHead>
                <TableHead>Reservation Valid Until</TableHead>
                <TableHead className="text-center">Compatibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No crossmatch records found. Click &quot;Perform Crossmatch Test&quot; to test donor bag compatibility.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((xm) => {
                  const hoursLeft = Math.round(
                    (new Date(xm.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60)
                  );
                  const isExpired = hoursLeft <= 0;

                  return (
                    <TableRow key={xm._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                        {xm.crossmatchCode}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {xm.patientName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          UHID: {xm.uhid || "N/A"} • Group: <span className="font-bold text-rose-600">{xm.patientBloodGroup}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {xm.bagNumber}
                        </div>
                        <Badge className="bg-rose-600 text-white text-[10px] mt-0.5">
                          {xm.bagBloodGroup} • {xm.componentType}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-slate-800 dark:text-slate-200">{xm.method}</div>
                        <div className="text-[10px] text-slate-400">By {xm.crossmatchedBy}</div>
                      </TableCell>

                      <TableCell className="text-[11px] font-mono">
                        <div>Maj: <span className={xm.majorCrossmatch === "COMPATIBLE" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{xm.majorCrossmatch}</span></div>
                        <div>Min: <span className={xm.minorCrossmatch === "COMPATIBLE" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{xm.minorCrossmatch}</span></div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-[11px]">
                          {new Date(xm.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(xm.validUntil).toLocaleDateString()})
                        </div>
                        <div className={`text-[10px] font-semibold ${isExpired ? "text-rose-600" : "text-emerald-600"}`}>
                          {isExpired ? "Reservation Expired" : `${hoursLeft} hrs remaining`}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            xm.overallResult === "COMPATIBLE"
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-600 text-white"
                          }`}
                        >
                          {xm.overallResult}
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

      {/* Crossmatch Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              Perform Compatibility Crossmatch Test (Gel Card Coombs)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Patient Recipient Name *</Label>
                <Input
                  required
                  placeholder="Patient full name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Patient UHID</Label>
                <Input
                  placeholder="MED-2026-XXXX"
                  value={formData.uhid}
                  onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Patient Blood Group *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.patientBloodGroup}
                  onChange={(e) => setFormData({ ...formData, patientBloodGroup: e.target.value as any })}
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
                <Label className="text-xs">Select Available Donor Bag *</Label>
                {availableBags.length === 0 ? (
                  <Input
                    required
                    placeholder="BAG-YYYYMMDD-XXXX"
                    value={formData.bagNumber}
                    onChange={(e) => setFormData({ ...formData, bagNumber: e.target.value })}
                    className="text-xs font-mono"
                  />
                ) : (
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.bagNumber}
                    onChange={(e) => handleBagSelect(e.target.value)}
                  >
                    {availableBags.map((b) => (
                      <option key={b._id} value={b.bagNumber}>
                        {b.bagNumber} ({b.bloodGroup} • {b.componentType})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border space-y-2">
              <span className="font-bold text-[11px] block uppercase text-slate-700 dark:text-slate-300">
                Compatibility Testing Matrix
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Major Crossmatch (Donor RBC + Patient Serum) *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background font-semibold"
                    value={formData.majorCrossmatch}
                    onChange={(e) => setFormData({ ...formData, majorCrossmatch: e.target.value as any })}
                  >
                    <option value="COMPATIBLE">COMPATIBLE (No Agglutination)</option>
                    <option value="INCOMPATIBLE">INCOMPATIBLE (Agglutination / Hemolysis)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">Minor Crossmatch (Donor Serum + Patient RBC) *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background font-semibold"
                    value={formData.minorCrossmatch}
                    onChange={(e) => setFormData({ ...formData, minorCrossmatch: e.target.value as any })}
                  >
                    <option value="COMPATIBLE">COMPATIBLE (No Agglutination)</option>
                    <option value="INCOMPATIBLE">INCOMPATIBLE (Agglutination)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Crossmatched By (Tech) *</Label>
                <Input
                  value={formData.crossmatchedBy}
                  onChange={(e) => setFormData({ ...formData, crossmatchedBy: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Verified By (Pathologist) *</Label>
                <Input
                  value={formData.verifiedBy}
                  onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
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
                {submitting ? "Processing..." : "Confirm & Reserve Bag (48 Hrs)"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
