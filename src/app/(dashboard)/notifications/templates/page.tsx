"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Tag,
  ShieldCheck,
  MessageSquare,
  Mail,
  Zap,
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

export default function NotificationTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    type: "SMS" as "SMS" | "EMAIL" | "PUSH" | "SYSTEM",
    category: "APPOINTMENT" as "APPOINTMENT" | "BILLING" | "ADMISSION" | "LAB_RESULT" | "EMERGENCY" | "GENERAL" | "PHARMACY",
    subject: "",
    content: "",
    dltTemplateId: "",
    variables: [] as string[],
    isActive: true,
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);

      const res = await fetch(`/api/notifications/templates?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data || []);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [typeFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      type: "SMS",
      category: "APPOINTMENT",
      subject: "",
      content: "",
      dltTemplateId: "",
      variables: [],
      isActive: true,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (template: any) => {
    setIsEditing(true);
    setActiveTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category || "GENERAL",
      subject: template.subject || "",
      content: template.content,
      dltTemplateId: template.dltTemplateId || "",
      variables: template.variables || [],
      isActive: template.isActive !== false,
    });
    setCreateModalOpen(true);
  };

  const handleInsertVariable = (variableTag: string) => {
    const formatted = `{{${variableTag}}}`;
    setFormData((prev) => ({
      ...prev,
      content: prev.content + " " + formatted,
      variables: prev.variables.includes(variableTag)
        ? prev.variables
        : [...prev.variables, variableTag],
    }));
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) return;

    try {
      setSubmitting(true);
      const url = isEditing
        ? `/api/notifications/templates/${activeTemplate._id}`
        : `/api/notifications/templates`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast({
          title: isEditing ? "Template Updated" : "Template Created",
          description: `Successfully saved ${formData.name}.`,
        });
        setCreateModalOpen(false);
        fetchTemplates();
      } else {
        toast({ title: "Save Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification template?")) return;
    try {
      const res = await fetch(`/api/notifications/templates/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Deleted", description: "Template removed." });
        fetchTemplates();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handlePreview = (template: any) => {
    setActiveTemplate(template);
    setPreviewModalOpen(true);
  };

  const renderSimulatedContent = (content: string) => {
    return content
      .replace(/{{patientName}}/g, "Amitabh Banerjee")
      .replace(/{{doctorName}}/g, "Dr. Subhash Chandra")
      .replace(/{{department}}/g, "Cardiology")
      .replace(/{{appointmentDate}}/g, "05-Sep-2026")
      .replace(/{{appointmentTime}}/g, "10:30 AM")
      .replace(/{{tokenNumber}}/g, "A-14")
      .replace(/{{wardName}}/g, "ICU Ward B")
      .replace(/{{bedNumber}}/g, "BED-08")
      .replace(/{{ipdNumber}}/g, "IPD-2026-0412")
      .replace(/{{testName}}/g, "High-Resolution Cardiac Echo")
      .replace(/{{invoiceNumber}}/g, "INV-2026-0849")
      .replace(/{{totalAmount}}/g, "4,500.00")
      .replace(/{{paidAmount}}/g, "4,500.00")
      .replace(/{{balanceDue}}/g, "0.00")
      .replace(/{{consultationFee}}/g, "800.00")
      .replace(/{{bayNumber}}/g, "Bay 1")
      .replace(/{{triageLevel}}/g, "Level 1");
  };

  const filteredTemplates = templates.filter((t) => {
    if (!search) return true;
    const match =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(search.toLowerCase())) ||
      (t.dltTemplateId && t.dltTemplateId.includes(search));
    return match;
  });

  const availableVariables = [
    "patientName",
    "doctorName",
    "department",
    "appointmentDate",
    "appointmentTime",
    "tokenNumber",
    "wardName",
    "bedNumber",
    "ipdNumber",
    "testName",
    "invoiceNumber",
    "totalAmount",
    "paidAmount",
    "balanceDue",
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notification Templates Library</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Centralized message presets for SMS, Email, and clinical alerts with DLT compliance IDs and variable bindings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTemplates} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-sm border">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, DLT ID, or content..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs font-medium text-muted-foreground">Channel:</span>
              {["ALL", "SMS", "EMAIL", "SYSTEM", "PUSH"].map((c) => (
                <Button
                  key={c}
                  variant={typeFilter === c ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setTypeFilter(c)}
                >
                  {c}
                </Button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs font-medium text-muted-foreground">Category:</span>
              {["ALL", "APPOINTMENT", "BILLING", "ADMISSION", "LAB_RESULT", "EMERGENCY"].map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No notification templates found. Click "Create Template" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="border shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={
                      template.type === "SMS"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : template.type === "EMAIL"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }
                  >
                    {template.type}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {template.category || "GENERAL"}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold pt-2">
                  {template.name}
                </CardTitle>
                {template.dltTemplateId && (
                  <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    DLT ID: {template.dltTemplateId}
                  </div>
                )}
                {template.subject && (
                  <div className="text-xs text-foreground/80 font-medium truncate pt-1">
                    Subject: {template.subject}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                <div className="p-3 bg-muted/30 border rounded text-xs whitespace-pre-wrap line-clamp-4 font-sans text-muted-foreground">
                  {template.content}
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((v: string) => (
                      <span
                        key={v}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-foreground"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>

              <div className="px-6 py-3 bg-muted/20 border-t flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> Test Preview
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleOpenEdit(template)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                    onClick={() => handleDeleteTemplate(template._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Template Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <form onSubmit={handleSaveTemplate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                {isEditing ? "Edit Template Preset" : "Create Notification Template"}
              </DialogTitle>
              <DialogDescription>
                Define standard message text, dynamic variables, and carrier compliance IDs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">Template Name *</Label>
                <Input
                  placeholder="e.g. Outpatient Consultation Booking Confirmation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Channel</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                  >
                    <option value="SMS">SMS (DLT Required)</option>
                    <option value="EMAIL">Email (Hospital SMTP)</option>
                    <option value="SYSTEM">System Alert</option>
                    <option value="PUSH">Push Notification</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Hospital Category</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                  >
                    <option value="APPOINTMENT">Outpatient / Appointment</option>
                    <option value="ADMISSION">Inpatient / Admission</option>
                    <option value="BILLING">Billing & Accounts</option>
                    <option value="LAB_RESULT">Laboratory & Diagnostics</option>
                    <option value="EMERGENCY">Emergency & Trauma</option>
                    <option value="PHARMACY">Pharmacy Dispense</option>
                    <option value="GENERAL">General Hospital Notice</option>
                  </select>
                </div>
              </div>

              {formData.type === "SMS" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">DLT Template ID (Indian Telecom Compliance) *</Label>
                  <Input
                    placeholder="e.g. 1107161829304859"
                    className="font-mono"
                    value={formData.dltTemplateId}
                    onChange={(e) =>
                      setFormData({ ...formData, dltTemplateId: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Required for carrier delivery across Airtel, Jio, and Vi networks.
                  </p>
                </div>
              )}

              {formData.type === "EMAIL" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Email Subject Line *</Label>
                  <Input
                    placeholder="Confirmed: Medical Consultation at Medistra Hospital"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              {/* Dynamic Variables Inserter */}
              <div className="space-y-1.5">
                <Label className="text-xs">Click to Insert Variables</Label>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-muted/40 rounded border">
                  {availableVariables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="px-1.5 py-0.5 text-[10px] font-mono bg-background hover:bg-primary/10 hover:text-primary rounded border transition-colors"
                      onClick={() => handleInsertVariable(v)}
                    >
                      +{`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Template Body *</Label>
                <Textarea
                  rows={4}
                  placeholder="Draft template content with {{variable}} placeholders..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : isEditing ? "Update Template" : "Save Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Test / Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {activeTemplate && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    Template Live Preview
                  </DialogTitle>
                  <Badge variant="outline">{activeTemplate.type}</Badge>
                </div>
                <DialogDescription>
                  Interpolated with sample patient & consultation records.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                  <div className="font-semibold text-foreground">{activeTemplate.name}</div>
                  <div className="text-muted-foreground text-[11px]">
                    Category: {activeTemplate.category}
                  </div>
                  {activeTemplate.dltTemplateId && (
                    <div className="text-muted-foreground text-[11px] font-mono">
                      DLT ID: {activeTemplate.dltTemplateId}
                    </div>
                  )}
                </div>

                {activeTemplate.subject && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Interpolated Subject:</span>
                    <div className="p-2.5 bg-muted/20 border rounded font-medium">
                      {activeTemplate.subject}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground block mb-1">Simulated Message Output:</span>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {renderSimulatedContent(activeTemplate.content)}
                  </div>
                </div>

                {activeTemplate.type === "SMS" && (
                  <div className="p-2 bg-muted/30 rounded text-[11px] text-muted-foreground flex justify-between">
                    <span>Simulated Char Count: {renderSimulatedContent(activeTemplate.content).length}</span>
                    <span>Segment Count: {Math.max(1, Math.ceil(renderSimulatedContent(activeTemplate.content).length / 160))} SMS</span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button size="sm" onClick={() => setPreviewModalOpen(false)}>
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
