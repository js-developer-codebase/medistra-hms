"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  Eye,
  Trash2,
  RotateCcw,
  MessageSquare,
  Mail,
  Zap,
  Radio,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NotificationsListPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modals
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live recipients
  const [patients, setPatients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Compose form
  const [composeForm, setComposeForm] = useState({
    recipientType: "PATIENT",
    recipientId: "",
    recipientName: "",
    recipientContact: "",
    type: "SMS",
    subject: "",
    content: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/notifications/logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || json.data || []);
        setTotal(json.total || 0);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to fetch logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      const [patRes, userRes] = await Promise.all([
        fetch("/api/patient"),
        fetch("/api/user"),
      ]);
      const patJson = await patRes.json();
      const userJson = await userRes.json();
      if (patJson.success) setPatients(patJson.data || []);
      if (userJson.success) setUsers(userJson.data || []);
    } catch (e) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchRecipients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleRetry = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/logs/${id}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Re-dispatched", description: "Notification re-queued and delivered." });
        fetchLogs();
        if (selectedLog && selectedLog._id === id) {
          setSelectedLog(json.data);
        }
      } else {
        toast({ title: "Retry Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification record?")) return;
    try {
      const res = await fetch(`/api/notifications/logs/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Deleted", description: "Notification record removed." });
        fetchLogs();
        setViewModalOpen(false);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.content) return;
    try {
      setSubmitting(true);
      let recipientPhone = "";
      let recipientEmail = "";

      if (composeForm.type === "SMS") {
        recipientPhone = composeForm.recipientContact;
      } else if (composeForm.type === "EMAIL") {
        recipientEmail = composeForm.recipientContact;
      }

      const res = await fetch("/api/notifications/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: composeForm.type,
          subject: composeForm.subject,
          content: composeForm.content,
          recipientName: composeForm.recipientName || "Recipient",
          recipientPhone,
          recipientEmail,
          recipient: composeForm.recipientId || undefined,
          recipientModel: composeForm.recipientType === "PATIENT" ? "Patient" : "User",
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast({ title: "Dispatched", description: "Notification recorded & sent." });
        setComposeModalOpen(false);
        setComposeForm({
          recipientType: "PATIENT",
          recipientId: "",
          recipientName: "",
          recipientContact: "",
          type: "SMS",
          subject: "",
          content: "",
        });
        fetchLogs();
      } else {
        toast({ title: "Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectRecipient = (id: string) => {
    if (composeForm.recipientType === "PATIENT") {
      const p = patients.find((pat) => pat._id === id);
      if (p) {
        setComposeForm((prev) => ({
          ...prev,
          recipientId: p._id,
          recipientName: `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || "Patient",
          recipientContact: prev.type === "SMS" ? p.phone || "" : p.email || "",
        }));
      }
    } else {
      const u = users.find((usr) => usr._id === id);
      if (u) {
        setComposeForm((prev) => ({
          ...prev,
          recipientId: u._id,
          recipientName: u.name || "Staff Member",
          recipientContact: prev.type === "SMS" ? u.phone || "" : u.email || "",
        }));
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notification Directory & Logs</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Omnichannel outbound message registry, real-time carrier delivery statuses, and diagnostic logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setComposeModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Compose Notification
          </Button>
        </div>
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
                  placeholder="Search recipient name, phone, email, subject, or message text..."
                  className="pl-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Filter
              </Button>
            </form>

            {/* Channel Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Channel:
              </span>
              {["ALL", "SMS", "EMAIL", "SYSTEM", "PUSH"].map((c) => (
                <Button
                  key={c}
                  variant={typeFilter === c ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2.5"
                  onClick={() => setTypeFilter(c)}
                >
                  {c}
                </Button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              {["ALL", "DELIVERED", "SENT", "PENDING", "FAILED"].map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-8 px-2"
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-sm border">
        <CardHeader className="py-3.5 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Outbound Logs ({total})
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Showing latest {logs.length} entries
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading notification logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No notification records found matching the active filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left text-xs font-medium text-muted-foreground">
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject / Message</th>
                    <th className="py-3 px-4">Cost (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sent Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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
                              : log.type === "SYSTEM"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {log.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">
                          {log.recipientName || "Recipient"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {log.recipientPhone || log.recipientEmail || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        {log.subject && (
                          <div className="font-medium text-xs text-foreground truncate mb-0.5">
                            {log.subject}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {log.content}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
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
                          className="text-[11px]"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
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
                              setSelectedLog(log);
                              setViewModalOpen(true);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {log.status === "FAILED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                              title="Retry Delivery"
                              onClick={() => handleRetry(log._id)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                            title="Delete Log"
                            onClick={() => handleDelete(log._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedLog && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="flex items-center gap-2">
                    <Badge variant="outline">{selectedLog.type}</Badge>
                    Notification Inspection
                  </DialogTitle>
                  <Badge
                    variant={
                      selectedLog.status === "DELIVERED"
                        ? "default"
                        : selectedLog.status === "FAILED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedLog.status}
                  </Badge>
                </div>
                <DialogDescription>
                  Audit details and gateway receipt for log ID: {selectedLog._id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-sm">
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground block">Recipient Name</span>
                    <span className="font-semibold">{selectedLog.recipientName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Contact Target</span>
                    <span className="font-mono text-xs">
                      {selectedLog.recipientPhone || selectedLog.recipientEmail || "In-App Notice"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Dispatched Timestamp</span>
                    <span className="text-xs">
                      {selectedLog.sentAt ? new Date(selectedLog.sentAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Cost Incurred</span>
                    <span className="text-xs font-semibold">
                      ₹{(selectedLog.cost || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {selectedLog.subject && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Subject Header</span>
                    <div className="p-2.5 bg-muted/20 border rounded font-medium text-xs">
                      {selectedLog.subject}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Delivered Content Body</span>
                  <div className="p-3 bg-muted/20 border rounded whitespace-pre-wrap font-sans text-xs max-h-48 overflow-y-auto">
                    {selectedLog.content}
                  </div>
                </div>

                {selectedLog.error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded text-rose-800 dark:text-rose-200 text-xs">
                    <span className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Gateway Error Response:
                    </span>
                    {selectedLog.error}
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between items-center w-full">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedLog._id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRetry(selectedLog._id)}
                    className="bg-primary"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Resend
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose Notification Modal */}
      <Dialog open={composeModalOpen} onOpenChange={setComposeModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <form onSubmit={handleComposeSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Compose New Hospital Notification
              </DialogTitle>
              <DialogDescription>
                Dispatch a single message to a registered patient, staff member, or manual contact.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Channel</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={composeForm.type}
                    onChange={(e) =>
                      setComposeForm({ ...composeForm, type: e.target.value as any })
                    }
                  >
                    <option value="SMS">SMS (DLT Gateway)</option>
                    <option value="EMAIL">Email (Hospital SMTP)</option>
                    <option value="SYSTEM">System Alert</option>
                    <option value="PUSH">Mobile Push</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Recipient Target</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={composeForm.recipientType}
                    onChange={(e) =>
                      setComposeForm({ ...composeForm, recipientType: e.target.value, recipientId: "" })
                    }
                  >
                    <option value="PATIENT">Registered Patient</option>
                    <option value="STAFF">Doctor / Hospital Staff</option>
                    <option value="CUSTOM">Custom Contact</option>
                  </select>
                </div>
              </div>

              {composeForm.recipientType !== "CUSTOM" && (
                <div className="space-y-1.5">
                  <Label>
                    Select {composeForm.recipientType === "PATIENT" ? "Patient" : "Staff"}
                  </Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={composeForm.recipientId}
                    onChange={(e) => handleSelectRecipient(e.target.value)}
                  >
                    <option value="">-- Choose from Directory --</option>
                    {composeForm.recipientType === "PATIENT"
                      ? patients.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.firstName} {p.lastName} ({p.phone || p.email || p.patientId})
                          </option>
                        ))
                      : users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.email || u.role})
                          </option>
                        ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Recipient Name</Label>
                  <Input
                    placeholder="E.g. Amitabh Banerjee"
                    value={composeForm.recipientName}
                    onChange={(e) =>
                      setComposeForm({ ...composeForm, recipientName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {composeForm.type === "EMAIL" ? "Email Address *" : "Phone (+91) *"}
                  </Label>
                  <Input
                    placeholder={composeForm.type === "EMAIL" ? "user@domain.com" : "+91 98300 12345"}
                    value={composeForm.recipientContact}
                    onChange={(e) =>
                      setComposeForm({ ...composeForm, recipientContact: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {composeForm.type === "EMAIL" && (
                <div className="space-y-1.5">
                  <Label>Email Subject *</Label>
                  <Input
                    placeholder="Consultation Confirmation / Clinical Alert"
                    value={composeForm.subject}
                    onChange={(e) =>
                      setComposeForm({ ...composeForm, subject: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label>Message Content *</Label>
                  {composeForm.type === "SMS" && (
                    <span className="text-xs text-muted-foreground">
                      {composeForm.content.length} chars |{" "}
                      {Math.max(1, Math.ceil((composeForm.content.length || 1) / 160))} SMS (₹
                      {(
                        Math.max(1, Math.ceil((composeForm.content.length || 1) / 160)) * 0.2
                      ).toFixed(2)}
                      )
                    </span>
                  )}
                </div>
                <Textarea
                  rows={4}
                  placeholder="Type notification text..."
                  value={composeForm.content}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, content: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setComposeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Dispatching..." : "Send Notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
