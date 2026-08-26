"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Loader2, Plus, Send, Calendar, Mail, MessageSquare, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    recipient: "",
    recipientModel: "Patient" as "Patient" | "User",
    type: "SYSTEM" as "SMS" | "EMAIL" | "PUSH" | "SYSTEM",
    subject: "",
    content: "",
    templateId: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, templatesRes, patientsRes, staffRes] = await Promise.all([
        fetch("/api/notifications/logs"),
        fetch("/api/notifications/templates"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const logsData = await logsRes.json();
      if (logsData.success) setLogs(logsData.data);

      const templatesData = await templatesRes.json();
      if (templatesData.success) setTemplates(templatesData.data);

      const patientsData = await patientsRes.json();
      if (patientsData.success) setPatients(patientsData.data);

      const staffData = await staffRes.json();
      if (staffData.success) setStaff(staffData.data);

      // Set default recipient values
      if (patientsData.success && patientsData.data.length > 0) {
        setFormData(prev => ({ ...prev, recipient: patientsData.data[0]._id }));
      }
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "recipientModel") {
      const defaultRecipient = value === "Patient" ? patients[0]?._id : staff[0]?._id;
      setFormData((prev) => ({ ...prev, recipientModel: value as any, recipient: defaultRecipient || "" }));
    } else if (name === "templateId") {
      const selectedTemplate = templates.find(t => t._id === value);
      if (selectedTemplate) {
        setFormData((prev) => ({
          ...prev,
          templateId: value,
          subject: selectedTemplate.subject || "",
          content: selectedTemplate.content || "",
          type: selectedTemplate.type || "SYSTEM"
        }));
      } else {
        setFormData((prev) => ({ ...prev, templateId: "", subject: "", content: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please select a recipient and enter some message content.",
        variant: "error"
      });
      return;
    }

    try {
      const res = await fetch("/api/notifications/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: formData.recipient,
          recipientModel: formData.recipientModel === "Patient" ? "Patient" : "User",
          type: formData.type,
          subject: formData.type === "EMAIL" ? (formData.subject || "Medistra Notification") : undefined,
          content: formData.content,
          templateId: formData.templateId || undefined
        })
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Notification Sent",
          description: `Message successfully dispatched via ${formData.type}.`,
          variant: "success"
        });
        setIsDialogOpen(false);
        setFormData({
          recipient: patients[0]?._id || "",
          recipientModel: "Patient",
          type: "SYSTEM",
          subject: "",
          content: "",
          templateId: ""
        });
        fetchData();
      } else {
        toast({
          title: "Dispatch Failed",
          description: data.message,
          variant: "error"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "error"
      });
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "EMAIL":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "SMS":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch SMS, Email, and System broadcasts to medical staff and patients.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm gap-2">
              <Plus className="h-4 w-4" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-slate-900 text-slate-100 border border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Compose Dispatch</DialogTitle>
              <DialogDescription className="text-slate-400">
                Draft a new notification or load a pre-configured template.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-slate-300">Choose Template (Optional)</Label>
                <Select
                  name="templateId"
                  value={formData.templateId}
                  onChange={(e) => handleSelectChange("templateId", e.target.value)}
                >
                  <option value="">-- Manual Draft --</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.type})</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300">Recipient Model</Label>
                  <Select
                    name="recipientModel"
                    value={formData.recipientModel}
                    onChange={(e) => handleSelectChange("recipientModel", e.target.value)}
                  >
                    <option value="Patient">Patient</option>
                    <option value="User">Hospital Staff</option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300">Dispatch Channel</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={(e) => handleSelectChange("type", e.target.value)}
                  >
                    <option value="SYSTEM">System Broadcast</option>
                    <option value="EMAIL">Email Address</option>
                    <option value="SMS">SMS Mobile Alert</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Select Recipient</Label>
                <Select
                  name="recipient"
                  value={formData.recipient}
                  onChange={(e) => handleSelectChange("recipient", e.target.value)}
                  required
                >
                  {formData.recipientModel === "Patient"
                    ? patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.contact || "No contact"})
                        </option>
                      ))
                    : staff.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.email || "No email"})
                        </option>
                      ))}
                </Select>
              </div>

              {formData.type === "EMAIL" && (
                <div className="space-y-1">
                  <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter email subject"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="content" className="text-slate-300">Content / Message Body</Label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter message body here"
                  rows={3}
                  required
                  className="w-full text-sm rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2">
                  <Send className="h-4 w-4" />
                  Dispatch
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Dispatch Logs</CardTitle>
          <CardDescription>
            History of notifications sent across Medistra HMS channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin w-8 h-8 text-emerald-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No notifications dispatched yet. Use "Compose Message" to send your first alert.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Message Subject / Content</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {log.recipient?.name || "Deleted User/Patient"}
                      </div>
                      <div className="text-xs text-slate-500">
                        Model: {log.recipientModel}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {getChannelIcon(log.type)}
                        {log.type}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      {log.subject && (
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.subject}</div>
                      )}
                      <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{log.content}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(log.sentAt || log.createdAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={log.status === "SENT" ? "bg-emerald-500/10 text-emerald-600 border-none" : "bg-red-500/10 text-red-600 border-none"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
