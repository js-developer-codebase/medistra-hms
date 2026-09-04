"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileSpreadsheet,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NotificationHistoryPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [channel, setChannel] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inspect Modal
  const [inspectLog, setInspectLog] = useState<any>(null);
  const [inspectOpen, setInspectOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (channel !== "ALL") params.append("type", channel);
      if (status !== "ALL") params.append("status", status);
      if (search) params.append("search", search);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("limit", "100");

      const res = await fetch(`/api/notifications/logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || json.data || []);
        setTotal(json.total || 0);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load delivery history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [channel, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleRetry = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/logs/${id}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Delivery Retried", description: "Re-dispatched through carrier gateway." });
        fetchHistory();
        if (inspectLog && inspectLog._id === id) {
          setInspectLog(json.data);
        }
      } else {
        toast({ title: "Retry Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const exportCSV = () => {
    if (logs.length === 0) {
      toast({ title: "No Data", description: "No delivery records to export." });
      return;
    }

    const headers = [
      "ID",
      "Channel",
      "Recipient Name",
      "Recipient Contact",
      "Subject",
      "Content",
      "Status",
      "Cost (INR)",
      "Sent At",
      "Error",
    ];

    const rows = logs.map((l) => [
      l._id,
      l.type,
      `"${(l.recipientName || "").replace(/"/g, '""')}"`,
      `"${l.recipientPhone || l.recipientEmail || ""}"`,
      `"${(l.subject || "").replace(/"/g, '""')}"`,
      `"${(l.content || "").replace(/"/g, '""')}"`,
      l.status,
      l.cost || 0,
      l.sentAt ? new Date(l.sentAt).toISOString() : "",
      `"${(l.error || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `medistra-notification-history-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aggregated metrics
  const deliveredCount = logs.filter((l) => l.status === "DELIVERED").length;
  const failedCount = logs.filter((l) => l.status === "FAILED").length;
  const totalCostINR = logs.reduce((acc, l) => acc + (l.cost || 0), 0);
  const successRate = logs.length > 0 ? Math.round((deliveredCount / logs.length) * 100) : 100;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-lg">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Delivery History & Audit Trail</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Forensic carrier delivery logs, telecom cost tracking in Indian Rupees, and failure diagnostic history.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Historical Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Audited
            </CardTitle>
            <History className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active ledger entries
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Carrier Delivery Yield
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : `${successRate}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Delivered: {deliveredCount} messages
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Failed Deliveries
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${failedCount > 0 ? "text-rose-600" : "text-muted-foreground"}`}>
              {loading ? "..." : failedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unreachable / Invalid routing
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Telecom Spend (INR)
            </CardTitle>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {loading ? "..." : `₹${totalCostINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Telecom gateway expenditure
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-sm border">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search recipient, phone (+91), email, or error text..."
                  className="pl-9 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="text-xs">
                Filter
              </Button>
            </form>

            {/* Date Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                type="date"
                className="text-xs h-8 w-36"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                className="text-xs h-8 w-36"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 px-2"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    fetchHistory();
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Channel Filters */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {["ALL", "SMS", "EMAIL", "SYSTEM", "PUSH"].map((c) => (
                <Button
                  key={c}
                  variant={channel === c ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setChannel(c)}
                >
                  {c}
                </Button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {["ALL", "DELIVERED", "FAILED"].map((s) => (
                <Button
                  key={s}
                  variant={status === s ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Audit Table */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3.5 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Historical Delivery Audit Stream ({logs.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Complete audit trail
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No historical delivery records found for current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left font-medium text-muted-foreground">
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Dispatched Message</th>
                    <th className="py-3 px-4">Cost (₹)</th>
                    <th className="py-3 px-4">Delivery Status</th>
                    <th className="py-3 px-4">Sent Time</th>
                    <th className="py-3 px-4 text-right">Audit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            log.type === "SMS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.type === "EMAIL"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {log.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {log.recipientName || "Recipient"}
                        </div>
                        <div className="font-mono text-muted-foreground text-[11px]">
                          {log.recipientPhone || log.recipientEmail || "Internal Console"}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        {log.subject && (
                          <div className="font-medium text-foreground text-xs mb-0.5 truncate">
                            {log.subject}
                          </div>
                        )}
                        <div className="text-muted-foreground line-clamp-2">
                          {log.content}
                        </div>
                        {log.error && (
                          <div className="text-rose-600 text-[10px] mt-1 font-mono">
                            Error: {log.error}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {log.cost ? `₹${Number(log.cost).toFixed(2)}` : "₹0.00"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            log.status === "DELIVERED"
                              ? "default"
                              : log.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px] uppercase"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Inspect Details"
                            onClick={() => {
                              setInspectLog(log);
                              setInspectOpen(true);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {log.status === "FAILED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                              title="Re-transmit message"
                              onClick={() => handleRetry(log._id)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspect Audit Log Modal */}
      <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {inspectLog && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-teal-600" />
                    Delivery Audit Inspection
                  </DialogTitle>
                  <Badge variant={inspectLog.status === "DELIVERED" ? "default" : "destructive"}>
                    {inspectLog.status}
                  </Badge>
                </div>
                <DialogDescription>
                  Forensic audit trail for message ID: {inspectLog._id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Recipient</span>
                    <span className="font-semibold text-foreground">{inspectLog.recipientName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Destination Target</span>
                    <span className="font-mono text-foreground">
                      {inspectLog.recipientPhone || inspectLog.recipientEmail || "System Station"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Dispatched At</span>
                    <span>{inspectLog.sentAt ? new Date(inspectLog.sentAt).toLocaleString() : "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Delivered At</span>
                    <span>{inspectLog.deliveredAt ? new Date(inspectLog.deliveredAt).toLocaleString() : "Pending"}</span>
                  </div>
                </div>

                {inspectLog.subject && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Subject Header</span>
                    <div className="p-2.5 bg-muted/20 border rounded font-medium">
                      {inspectLog.subject}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground block mb-1">Delivered Content Body</span>
                  <div className="p-3 bg-muted/20 border rounded whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {inspectLog.content}
                  </div>
                </div>

                {inspectLog.error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded text-rose-800 dark:text-rose-200">
                    <span className="font-semibold block mb-1">Carrier Diagnostic Response:</span>
                    {inspectLog.error}
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between items-center w-full">
                {inspectLog.status === "FAILED" ? (
                  <Button
                    size="sm"
                    className="bg-primary"
                    onClick={() => handleRetry(inspectLog._id)}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry Delivery
                  </Button>
                ) : (
                  <div />
                )}
                <Button variant="outline" size="sm" onClick={() => setInspectOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
