"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ClockAlert,
  Search,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  IndianRupee,
  Calendar,
  MapPin,
  RefreshCw,
  Boxes,
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
import { useToast } from "@/components/ui/toast";

export default function PharmacyExpiryPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pharmacy/medicines");
      const data = await res.json();
      if (data.success) {
        setMedicines(data.data || []);
      }
    } catch (err) {
      toast("Failed to load medicines", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Categorize
  const analyzedMeds = useMemo(() => {
    return medicines.map((m) => {
      let tier: "EXPIRED" | "CRITICAL_30" | "WARNING_90" | "GOOD" = "GOOD";
      let daysRemaining = 999;

      if (m.expiryDate) {
        const exp = new Date(m.expiryDate);
        const diffMs = exp.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) tier = "EXPIRED";
        else if (daysRemaining <= 30) tier = "CRITICAL_30";
        else if (daysRemaining <= 90) tier = "WARNING_90";
        else tier = "GOOD";
      }

      return {
        ...m,
        tier,
        daysRemaining
      };
    });
  }, [medicines]);

  const filteredMeds = useMemo(() => {
    return analyzedMeds.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
        m.category?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (tierFilter === "ALL") return true;
      return m.tier === tierFilter;
    });
  }, [analyzedMeds, search, tierFilter]);

  const expiredList = analyzedMeds.filter((m) => m.tier === "EXPIRED");
  const criticalList = analyzedMeds.filter((m) => m.tier === "CRITICAL_30");
  const warningList = analyzedMeds.filter((m) => m.tier === "WARNING_90");

  const expiredValueAtRisk = expiredList.reduce(
    (acc, m) => acc + (m.stockQuantity || 0) * (m.unitPrice || 0),
    0
  );

  const handleWriteOff = async (med: any) => {
    if (!confirm(`Write off & discard ${med.stockQuantity} units of expired ${med.name}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/pharmacy/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: med._id,
          quantityChange: -med.stockQuantity,
          notes: "Expired batch quarantine write-off and biomedical waste disposal"
        })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Expired stock for ${med.name} written off to zero!`, "success");
        fetchMedicines();
      } else {
        toast(data.message || "Failed to write off", "error");
      }
    } catch (err) {
      toast("Error writing off stock", "error");
    }
  };

  const renderTierBadge = (tier: string, days: number) => {
    switch (tier) {
      case "EXPIRED":
        return (
          <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" /> Expired ({Math.abs(days)}d ago)
          </Badge>
        );
      case "CRITICAL_30":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Critical ({days}d left)
          </Badge>
        );
      case "WARNING_90":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px]">
            Expiring in {days}d
          </Badge>
        );
      case "GOOD":
      default:
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Safe ({days}d)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ClockAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Expiry Date &amp; Batch Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Patient safety audits, color-coded shelf rotation tiers, write-off disposal logs, and financial loss tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMedicines}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Risk Tiers KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Expired Stock
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {expiredList.length}
            </div>
            <p className="text-[10px] text-slate-500">Must be discarded</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Expiring &lt; 30 Days
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {criticalList.length}
            </div>
            <p className="text-[10px] text-slate-500">Priority rotation</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Expiring in 30–90 Days
              <ClockAlert className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {warningList.length}
            </div>
            <p className="text-[10px] text-slate-500">Upcoming return window</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Expired Value at Risk
              <IndianRupee className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{expiredValueAtRisk.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">Financial write-off</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by drug name, batch number or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <option value="ALL">All Expiry Windows ({analyzedMeds.length})</option>
                <option value="EXPIRED">Expired Only ({expiredList.length})</option>
                <option value="CRITICAL_30">Critical (&lt;30 Days)</option>
                <option value="WARNING_90">Warning (30–90 Days)</option>
                <option value="GOOD">Safe Shelf Life (&gt;90 Days)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ClockAlert className="h-4 w-4 text-rose-600" />
            Batch Expiry Directory ({filteredMeds.length} Batches)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Medicine Name</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Rack / Shelf</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Risk Category</TableHead>
                <TableHead className="text-right">Stock At Risk</TableHead>
                <TableHead className="text-right">Valuation (₹)</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No medicine batches found matching the selected expiry tier.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMeds.map((med) => {
                  const val = (med.stockQuantity || 0) * (med.unitPrice || 0);

                  return (
                    <TableRow key={med._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {med.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {med.category} • {med.dosageForm || "TABLET"}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                        {med.batchNumber || "N/A"}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                          <MapPin className="h-3 w-3" />
                          {med.rackLocation || "Rack A-01"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-slate-800 dark:text-slate-200">
                          {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>

                      <TableCell>{renderTierBadge(med.tier, med.daysRemaining)}</TableCell>

                      <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                        {med.stockQuantity} Units
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium">
                        ₹{val.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        {med.tier === "EXPIRED" && med.stockQuantity > 0 ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs px-2.5"
                            onClick={() => handleWriteOff(med)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Discard
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {med.tier === "EXPIRED" ? "Disposed" : "In Circulation"}
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
    </div>
  );
}
