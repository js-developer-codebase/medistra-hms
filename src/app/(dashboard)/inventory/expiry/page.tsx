"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  RefreshCw,
  Search,
  IndianRupee,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowRight,
  Sliders
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

export default function ExpiryTrackingPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [daysFilter, setDaysFilter] = useState<number>(90);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchData = async (days: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/expiry?days=${days}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data || []);
      } else {
        toast(data.message || "Failed to load expiring stock", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error fetching expiry records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(daysFilter);
  }, [daysFilter]);

  const now = new Date();

  const metrics = useMemo(() => {
    let expiredCount = 0;
    let criticalCount = 0; // <= 30 days
    let warningCount = 0;  // 31-90 days
    let totalRiskValue = 0;

    transactions.forEach((txn) => {
      if (!txn.expiryDate) return;
      const exp = new Date(txn.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
      const val = (txn.quantity || 0) * (txn.unitPrice || 0);

      totalRiskValue += val;
      if (diffDays < 0) {
        expiredCount++;
      } else if (diffDays <= 30) {
        criticalCount++;
      } else {
        warningCount++;
      }
    });

    return { expiredCount, criticalCount, warningCount, totalRiskValue };
  }, [transactions, now]);

  const filteredTxns = transactions.filter((t) => {
    return (
      (t.itemName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.batchNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.transactionCode || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Near-Expiry Consumables &amp; Quarantine Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor shelf-life horizons, prevent clinical administration of expired consumables, and manage quarantine disposal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(daysFilter)}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/inventory/adjustment">
            <Button size="sm" className="text-xs flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white">
              <Sliders className="h-3.5 w-3.5" />
              Write-Off / Quarantine Disposal
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Value at Risk</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {metrics.totalRiskValue.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Expiring inventory cost</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Already Expired</p>
              <h3 className="text-xl font-bold text-rose-700 dark:text-rose-500 mt-1">
                {metrics.expiredCount} batches
              </h3>
              <p className="text-[10px] text-rose-500 mt-0.5 font-medium">Immediate quarantine required</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Critical (&le; 30 Days)</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {metrics.criticalCount} batches
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Expiring within 1 month</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Watchlist (31-90 Days)</p>
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {metrics.warningCount} batches
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Expiring within 3 months</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizon Filter Tabs & Search */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Button
                size="sm"
                variant={daysFilter === 30 ? "default" : "outline"}
                onClick={() => setDaysFilter(30)}
                className={`text-xs ${daysFilter === 30 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
              >
                &le; 30 Days (Critical)
              </Button>
              <Button
                size="sm"
                variant={daysFilter === 60 ? "default" : "outline"}
                onClick={() => setDaysFilter(60)}
                className={`text-xs ${daysFilter === 60 ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
              >
                &le; 60 Days (Urgent)
              </Button>
              <Button
                size="sm"
                variant={daysFilter === 90 ? "default" : "outline"}
                onClick={() => setDaysFilter(90)}
                className={`text-xs ${daysFilter === 90 ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
              >
                &le; 90 Days (Standard)
              </Button>
              <Button
                size="sm"
                variant={daysFilter === 180 ? "default" : "outline"}
                onClick={() => setDaysFilter(180)}
                className="text-xs"
              >
                &le; 180 Days (All)
              </Button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search item, batch number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Lots Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-600" />
            Near-Expiry Consumables &amp; Lot Monitor ({filteredTxns.length} records)
          </CardTitle>
          <div className="text-xs text-slate-400">
            Horizon: <span className="font-semibold text-slate-700 dark:text-slate-200">{daysFilter} Days</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Consumable Item</TableHead>
                <TableHead>Batch / Lot #</TableHead>
                <TableHead>Storage Location</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Shelf-Life Remaining</TableHead>
                <TableHead className="text-right">Lot Quantity</TableHead>
                <TableHead className="text-right">Unit Rate (₹)</TableHead>
                <TableHead className="text-right">Value at Risk (₹)</TableHead>
                <TableHead className="text-center">Quarantine Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    Scanning shelf-life registers...
                  </TableCell>
                </TableRow>
              ) : filteredTxns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                    No consumables approaching expiry within {daysFilter} days. Store stock is within safe shelf-life limits.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTxns.map((txn) => {
                  const exp = new Date(txn.expiryDate);
                  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
                  const isExpired = diffDays <= 0;
                  const isCritical = !isExpired && diffDays <= 30;

                  return (
                    <TableRow key={txn._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {txn.itemName || txn.itemId?.name || "Consumable Item"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Ref: {txn.transactionCode}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {txn.batchNumber || "—"}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300 text-[11px]">
                        {txn.destinationDepartment || "Central Warehouse"}
                      </TableCell>

                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                        {exp.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`font-semibold ${
                            isExpired
                              ? "text-rose-600 dark:text-rose-400"
                              : isCritical
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {isExpired ? `Expired (${Math.abs(diffDays)}d ago)` : `${diffDays} days remaining`}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {txn.quantity}
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-600">
                        ₹{(txn.unitPrice || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        ₹{((txn.quantity || 0) * (txn.unitPrice || 0)).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            isExpired
                              ? "bg-rose-700 text-white animate-pulse"
                              : isCritical
                              ? "bg-amber-600 text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {isExpired ? "QUARANTINE / DISPOSE" : isCritical ? "CRITICAL PRIORITY" : "MONITOR"}
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
    </div>
  );
}
