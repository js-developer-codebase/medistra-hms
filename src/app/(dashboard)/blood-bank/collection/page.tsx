"use client";

import { useEffect, useState } from "react";
import {
  HeartPulse,
  Plus,
  RefreshCw,
  Search,
  Droplet,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
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

export default function BloodCollectionPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    donorId: "",
    donorName: "",
    donorBloodGroup: "O+",
    bagType: "Triple with SAGM (450 ml)",
    volumeCollected: 450,
    phlebotomist: "Sr. Blood Bank Tech",
    veinSite: "Left Antecubital",
    adverseReaction: "None",
    notes: "Collection smooth, no adverse donor event observed."
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [colRes, donRes] = await Promise.all([
        fetch("/api/blood-bank/collection"),
        fetch("/api/blood-bank/donors")
      ]);

      const colData = await colRes.json();
      if (colData.success) setCollections(colData.data || []);

      const donData = await donRes.json();
      if (donData.success) {
        const eligible = (donData.data || []).filter(
          (d: any) => d.eligibilityStatus === "ELIGIBLE"
        );
        setDonors(eligible);
        if (eligible.length > 0 && !formData.donorId) {
          setFormData((prev) => ({
            ...prev,
            donorId: eligible[0]._id,
            donorName: eligible[0].fullName || `${eligible[0].firstName} ${eligible[0].lastName}`,
            donorBloodGroup: eligible[0].bloodGroup
          }));
        }
      }
    } catch (err) {
      toast("Failed to load blood collections", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDonorSelect = (donorId: string) => {
    const selected = donors.find((d) => d._id === donorId);
    if (selected) {
      setFormData({
        ...formData,
        donorId: selected._id,
        donorName: selected.fullName || `${selected.firstName} ${selected.lastName}`,
        donorBloodGroup: selected.bloodGroup
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName) {
      toast("Please select a donor", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Phlebotomy session ${data.data.collectionCode} logged. Bag ${data.data.bagNumber} created!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to log collection", "error");
      }
    } catch (err) {
      toast("Error logging blood collection", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = collections.filter(
    (c) =>
      c.collectionCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.bagNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.donorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Blood Phlebotomy Collection &amp; Separation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log donor bleed sessions, bag serial tracking, phlebotomy vitals, adverse event audit, and component fractionation.
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
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Log Phlebotomy Bleed
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by collection code, bag number, or donor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Collections Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-600" />
            Phlebotomy Collection Sessions ({filtered.length} Sessions)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Collection Code</TableHead>
                <TableHead>Assigned Bag Number</TableHead>
                <TableHead>Donor Name &amp; Group</TableHead>
                <TableHead>Bag Type &amp; Vol</TableHead>
                <TableHead>Phlebotomist / Site</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead className="text-center">Adverse Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No collection records found. Click &quot;Log Phlebotomy Bleed&quot; to record a donation session.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {c.collectionCode}
                    </TableCell>

                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                      {c.bagNumber}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {c.donorName}
                      </div>
                      <Badge className="bg-rose-600 text-white text-[10px] mt-0.5">
                        {c.donorBloodGroup}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {c.bagType}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {c.volumeCollected} ml collected
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-800 dark:text-slate-200">{c.phlebotomist}</div>
                      <div className="text-[10px] text-slate-400">{c.veinSite}</div>
                    </TableCell>

                    <TableCell className="font-mono text-[11px]">
                      {new Date(c.collectionDate).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[9px] ${
                          c.adverseReaction === "None"
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {c.adverseReaction}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Phlebotomy Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-emerald-600" />
              Log Phlebotomy Collection Bleed
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Select Voluntary Donor *</Label>
              {donors.length === 0 ? (
                <div className="text-[11px] text-amber-600 p-2 bg-amber-50 rounded border">
                  No eligible donors found. Please register an eligible donor first in Donors Registry!
                </div>
              ) : (
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.donorId}
                  onChange={(e) => handleDonorSelect(e.target.value)}
                >
                  {donors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.donorCode} — {d.fullName || d.firstName} ({d.bloodGroup})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Blood Group</Label>
                <Input
                  disabled
                  value={formData.donorBloodGroup}
                  className="text-xs font-bold font-mono bg-slate-100 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Volume Collected (ml) *</Label>
                <Input
                  type="number"
                  value={formData.volumeCollected}
                  onChange={(e) => setFormData({ ...formData, volumeCollected: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Bag Configuration *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.bagType}
                  onChange={(e) => setFormData({ ...formData, bagType: e.target.value as any })}
                >
                  <option value="Single (350 ml)">Single (350 ml)</option>
                  <option value="Double (450 ml)">Double (450 ml)</option>
                  <option value="Triple with SAGM (450 ml)">Triple with SAGM (450 ml)</option>
                  <option value="Quadruple (450 ml)">Quadruple (450 ml)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Vein Puncture Site *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.veinSite}
                  onChange={(e) => setFormData({ ...formData, veinSite: e.target.value as any })}
                >
                  <option value="Left Antecubital">Left Antecubital Fossa</option>
                  <option value="Right Antecubital">Right Antecubital Fossa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Phlebotomist Staff *</Label>
                <Input
                  value={formData.phlebotomist}
                  onChange={(e) => setFormData({ ...formData, phlebotomist: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Adverse Donor Event *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.adverseReaction}
                  onChange={(e) => setFormData({ ...formData, adverseReaction: e.target.value as any })}
                >
                  <option value="None">None (Normal Bleed)</option>
                  <option value="Mild Hematoma">Mild Hematoma</option>
                  <option value="Vasovagal Syncope">Vasovagal Syncope</option>
                  <option value="Nausea">Nausea / Dizziness</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Observations / Component Separation Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                disabled={submitting || donors.length === 0}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? "Logging Bleed..." : "Confirm Phlebotomy Bleed"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
