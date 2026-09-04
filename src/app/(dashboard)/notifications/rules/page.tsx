"use client";

import React, { useEffect, useState } from "react";
import {
  Sliders,
  Plus,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
  Radio,
  Bell,
  Trash2,
  Edit,
  Power,
  Users,
  AlertCircle,
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

export default function NotificationRulesPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    triggerEvent: "APPOINTMENT_BOOKED",
    channels: ["SMS"] as string[],
    recipientRoles: ["PATIENT"] as string[],
    templateId: "",
    description: "",
    isActive: true,
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const [rulesRes, tplRes] = await Promise.all([
        fetch("/api/notifications/rules"),
        fetch("/api/notifications/templates"),
      ]);

      const rulesData = await rulesRes.json();
      const tplData = await tplRes.json();

      if (rulesData.success) setRules(rulesData.data || []);
      if (tplData.success) setTemplates(tplData.data || []);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load notification rules", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      triggerEvent: "APPOINTMENT_BOOKED",
      channels: ["SMS", "EMAIL"],
      recipientRoles: ["PATIENT"],
      templateId: templates[0]?._id || "",
      description: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rule: any) => {
    setIsEditing(true);
    setActiveRuleId(rule._id);
    setFormData({
      name: rule.name,
      triggerEvent: rule.triggerEvent,
      channels: rule.channels || ["SMS"],
      recipientRoles: rule.recipientRoles || ["PATIENT"],
      templateId: rule.templateId?._id || rule.templateId || "",
      description: rule.description || "",
      isActive: rule.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (rule: any) => {
    try {
      const res = await fetch(`/api/notifications/rules/${rule._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: rule.isActive ? "Rule Deactivated" : "Rule Activated",
          description: `${rule.name} trigger status updated.`,
        });
        fetchRules();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.channels.length === 0) {
      toast({ title: "Validation Error", description: "Name and at least one channel required.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const url = isEditing
        ? `/api/notifications/rules/${activeRuleId}`
        : `/api/notifications/rules`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast({
          title: isEditing ? "Rule Updated" : "Rule Configured",
          description: `Successfully saved ${formData.name}.`,
        });
        setModalOpen(false);
        fetchRules();
      } else {
        toast({ title: "Save Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automated notification rule?")) return;
    try {
      const res = await fetch(`/api/notifications/rules/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Rule Deleted", description: "Automated trigger removed." });
        fetchRules();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientRoles: prev.recipientRoles.includes(role)
        ? prev.recipientRoles.filter((r) => r !== role)
        : [...prev.recipientRoles, role],
    }));
  };

  const eventDescriptions: Record<string, string> = {
    APPOINTMENT_BOOKED: "Fires when a patient confirms an OPD consultation.",
    APPOINTMENT_CANCELLED: "Fires when an appointment slot is cancelled or rescheduled.",
    INVOICE_GENERATED: "Fires when accounts generate an IPD or OPD tax invoice in ₹.",
    LAB_REPORT_READY: "Fires when lab test results are biochemically verified.",
    PATIENT_ADMITTED: "Fires when an inpatient is assigned to a ward or bed.",
    PATIENT_DISCHARGED: "Fires upon completion of patient discharge clearance.",
    EMERGENCY_ALERT: "Fires when trauma triage triggers an emergency code.",
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Automated Notification Rules & Triggers</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Hospital event pipelines that automatically transmit SMS, Email, and clinical alerts on key hospital workflows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRules} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Event Trigger
          </Button>
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading automated rules...</div>
      ) : rules.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No automated notification rules configured. Click "New Event Trigger" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rules.map((rule) => (
            <Card
              key={rule._id}
              className={`border shadow-sm transition-all ${
                rule.isActive ? "border-purple-200 dark:border-purple-900/50" : "opacity-75 bg-muted/20"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-[11px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200">
                    <Zap className="w-3 h-3 mr-1" />
                    {rule.triggerEvent}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(rule)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                        rule.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <Power className="w-3 h-3 mr-1" />
                      {rule.isActive ? "ACTIVE" : "DISABLED"}
                    </button>
                  </div>
                </div>

                <CardTitle className="text-base font-semibold pt-2">
                  {rule.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {rule.description || eventDescriptions[rule.triggerEvent] || "Hospital automated notification rule."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {/* Channels & Recipient Roles */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-1">Target Channels</span>
                    <div className="flex flex-wrap gap-1">
                      {rule.channels?.map((c: string) => (
                        <Badge key={c} variant="secondary" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-1">Audience</span>
                    <div className="flex flex-wrap gap-1">
                      {rule.recipientRoles?.map((r: string) => (
                        <Badge key={r} variant="outline" className="text-[10px]">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bound Template */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Linked Template:</span>
                  <span className="font-semibold text-foreground truncate max-w-xs">
                    {rule.templateId?.name || "Auto-Generated Format"}
                  </span>
                </div>
              </CardContent>

              <div className="px-6 py-3 bg-muted/20 border-t flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Updated: {new Date(rule.updatedAt || rule.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleOpenEdit(rule)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                    onClick={() => handleDeleteRule(rule._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <form onSubmit={handleSaveRule}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                {isEditing ? "Edit Trigger Rule" : "Configure Event Trigger Pipeline"}
              </DialogTitle>
              <DialogDescription>
                Bind hospital event triggers to outbound notification channels and recipient groups.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">Rule Name *</Label>
                <Input
                  placeholder="e.g. Outpatient Booking SMS & Email Notice"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Hospital Trigger Event *</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={formData.triggerEvent}
                  onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value as any })}
                >
                  <option value="APPOINTMENT_BOOKED">APPOINTMENT_BOOKED - Consultation Scheduled</option>
                  <option value="APPOINTMENT_CANCELLED">APPOINTMENT_CANCELLED - Appointment Cancelled</option>
                  <option value="INVOICE_GENERATED">INVOICE_GENERATED - Tax Invoice Created in ₹</option>
                  <option value="LAB_REPORT_READY">LAB_REPORT_READY - Lab Diagnostic Verified</option>
                  <option value="PATIENT_ADMITTED">PATIENT_ADMITTED - Bed & Ward Assigned</option>
                  <option value="PATIENT_DISCHARGED">PATIENT_DISCHARGED - Inpatient Discharge Clearance</option>
                  <option value="EMERGENCY_ALERT">EMERGENCY_ALERT - Trauma Code Red</option>
                </select>
                <p className="text-[10px] text-muted-foreground">
                  {eventDescriptions[formData.triggerEvent]}
                </p>
              </div>

              {/* Multi-Channel Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Dispatch Channels *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {["SMS", "EMAIL", "SYSTEM", "PUSH"].map((ch) => {
                    const isSelected = formData.channels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-muted/40 text-muted-foreground border-muted"
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Audience Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Target Audience *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {["PATIENT", "DOCTOR", "STAFF", "ADMIN"].map((role) => {
                    const isSelected = formData.recipientRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-muted"
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Linked Template */}
              <div className="space-y-1.5">
                <Label className="text-xs">Bound Notification Template</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                >
                  <option value="">-- Dynamic / Default Format --</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.type} - {t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Rule Description</Label>
                <Textarea
                  rows={2}
                  placeholder="Clinical purpose and routing instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : isEditing ? "Update Rule" : "Create Pipeline Rule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
