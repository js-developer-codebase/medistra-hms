"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Loader2, BellRing, BellOff, AlertTriangle, ShieldCheck, Thermometer, ShieldAlert, Plus } from "lucide-react";
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

interface AlertItem {
  id: string;
  source: "Clinical" | "Inventory" | "Operations";
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  timestamp: Date;
  status: "ACTIVE" | "ACKNOWLEDGED";
  isDbAlert?: boolean; // if it comes from the dynamic DB Alert model
}

export default function AlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sirenMuted, setSirenMuted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    source: "Operations" as "Clinical" | "Inventory" | "Operations",
    message: "",
    severity: "WARNING" as "CRITICAL" | "WARNING" | "INFO"
  });

  const fetchRealAlerts = async () => {
    try {
      setLoading(true);
      const generatedAlerts: AlertItem[] = [];

      // 1. Fetch Inventory Items for Low Stock
      const invRes = await fetch("/api/inventory/items");
      if (invRes.ok) {
        const items = await invRes.json();
        items.forEach((item: any) => {
          if (item.currentStock <= item.reorderLevel) {
            generatedAlerts.push({
              id: `inv-${item._id}`,
              source: "Inventory",
              message: `Critical Low Stock: "${item.name}" has only ${item.currentStock} ${item.unit} remaining (Reorder Level: ${item.reorderLevel}).`,
              severity: item.currentStock === 0 ? "CRITICAL" : "WARNING",
              timestamp: new Date(item.updatedAt || new Date()),
              status: "ACTIVE"
            });
          }
        });
      }

      // 2. Fetch Vitals for Clinical Alerts
      const vitalsRes = await fetch("/api/clinical/vitals");
      if (vitalsRes.ok) {
        const vitalsData = await vitalsRes.json();
        if (vitalsData.success && Array.isArray(vitalsData.data)) {
          vitalsData.data.forEach((vital: any) => {
            const temp = parseFloat(vital.temperature || "98.6");
            const hr = parseInt(vital.heartRate || "75");
            const spo2 = parseInt(vital.spo2 || "98");
            const bp = vital.bloodPressure || "";
            const patientName = vital.patientId?.name || "Patient";

            if (spo2 < 93) {
              generatedAlerts.push({
                id: `vital-spo2-${vital._id}`,
                source: "Clinical",
                message: `Oxygen saturation drop for patient ${patientName}: SpO2 is currently ${spo2}%. Immediate intervention required.`,
                severity: "CRITICAL",
                timestamp: new Date(vital.createdAt),
                status: "ACTIVE"
              });
            } else if (temp > 102) {
              generatedAlerts.push({
                id: `vital-temp-${vital._id}`,
                source: "Clinical",
                message: `High fever detected for patient ${patientName}: Temperature is ${temp}°F.`,
                severity: "WARNING",
                timestamp: new Date(vital.createdAt),
                status: "ACTIVE"
              });
            }
          });
        }
      }

      // 3. Fetch Operational & Custom Alerts from Mongoose Alert Model
      const customRes = await fetch("/api/dashboard/alerts");
      if (customRes.ok) {
        const customData = await customRes.json();
        if (customData.success && Array.isArray(customData.data)) {
          customData.data.forEach((alert: any) => {
            generatedAlerts.push({
              id: alert._id,
              source: alert.source,
              message: alert.message,
              severity: alert.severity,
              timestamp: new Date(alert.createdAt),
              status: alert.status,
              isDbAlert: true
            });
          });
        }
      }

      setAlerts(generatedAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (err: any) {
      toast({
        title: "Failed to load alerts",
        description: err.message,
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealAlerts();
    const interval = setInterval(fetchRealAlerts, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message) {
      toast({
        title: "Validation Error",
        description: "Please enter an alert message description.",
        variant: "error"
      });
      return;
    }

    try {
      const res = await fetch("/api/dashboard/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Alert Broadcasted",
          description: "Custom operational warning registered successfully.",
          variant: "success"
        });
        setIsDialogOpen(false);
        setFormData({
          source: "Operations",
          message: "",
          severity: "WARNING"
        });
        fetchRealAlerts();
      } else {
        toast({
          title: "Failed to create",
          description: data.message,
          variant: "error"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error submitting alert",
        description: err.message,
        variant: "error"
      });
    }
  };

  const handleAcknowledge = async (alertItem: AlertItem) => {
    if (alertItem.isDbAlert) {
      try {
        const res = await fetch(`/api/dashboard/alerts/${alertItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ACKNOWLEDGED" })
        });
        const data = await res.json();
        if (data.success) {
          toast({
            title: "Alert Acknowledged",
            description: "Mongoose database alert marked as reviewed.",
            variant: "success"
          });
          fetchRealAlerts();
        } else {
          toast({
            title: "Error",
            description: data.message,
            variant: "error"
          });
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "error"
        });
      }
    } else {
      // Local/derived warnings state update fallback
      setAlerts(prev =>
        prev.map(a => (a.id === alertItem.id ? { ...a, status: "ACKNOWLEDGED" as const } : a))
      );
      toast({
        title: "Alert Acknowledged",
        description: "Derived operational alert marked as reviewed locally.",
        variant: "success"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive" className="bg-red-500/15 text-red-500 hover:bg-red-500/20 border-red-500/30 font-semibold animate-pulse">Critical</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/20 border-amber-500/30 font-semibold">Warning</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-400">Info</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "Clinical":
        return <Badge variant="outline" className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 gap-1"><Thermometer className="h-3 w-3" /> Clinical</Badge>;
      case "Inventory":
        return <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 gap-1 font-medium">Inventory</Badge>;
      default:
        return <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 gap-1 font-medium">Operations</Badge>;
    }
  };

  const activeAlertsCount = alerts.filter(a => a.status === "ACTIVE").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Critical Alerts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time warnings, operational updates, and active vitals threshold alarms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setSirenMuted(!sirenMuted)}
            className="border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2"
          >
            {sirenMuted ? (
              <>
                <BellOff className="h-4 w-4 text-amber-500" />
                Muted
              </>
            ) : (
              <>
                <BellRing className="h-4 w-4 text-red-500 animate-bounce" />
                Audio Enabled
              </>
            )}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2 gap-1">
                <Plus className="h-3 w-3" />
                Trigger Custom Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-900 text-slate-100 border border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Broadcast Alert</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Trigger an immediate hospital warning notification in the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-slate-300">Alert Category</Label>
                    <Select
                      name="source"
                      value={formData.source}
                      onChange={(e) => handleSelectChange("source", e.target.value)}
                    >
                      <option value="Operations">Operations</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Inventory">Inventory</option>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-300">Severity Level</Label>
                    <Select
                      name="severity"
                      value={formData.severity}
                      onChange={(e) => handleSelectChange("severity", e.target.value)}
                    >
                      <option value="INFO">Information</option>
                      <option value="WARNING">Warning</option>
                      <option value="CRITICAL">Critical Alert</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="message" className="text-slate-300">Warning Message Description *</Label>
                  <Input
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="e.g. Ambulance incoming / backup initiating"
                    required
                    className="bg-slate-950 border-slate-800 text-slate-100"
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
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                    Broadcast Alarm
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button onClick={fetchRealAlerts} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2">
            Refresh Monitor
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Alarm Banner */}
        <Card className={`md:col-span-3 border ${activeAlertsCount > 0 ? "border-red-500/20 bg-red-500/5 dark:bg-red-500/10" : "border-slate-200 dark:border-slate-800"}`}>
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {activeAlertsCount > 0 ? (
                <ShieldAlert className="h-10 w-10 text-red-500 animate-pulse shrink-0" />
              ) : (
                <ShieldCheck className="h-10 w-10 text-emerald-500 shrink-0" />
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeAlertsCount > 0 ? `${activeAlertsCount} Unresolved System Alarms` : "All Hospital Channels Stable"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeAlertsCount > 0
                    ? "Critical updates are pending administrative acknowledgment."
                    : "No unresolved stock outages or critical patient anomalies detected."}
                </p>
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-500">
              Kolkata Time Zone (IST)
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card className="md:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Live Hospital Warning Feed
            </CardTitle>
            <CardDescription>
              Direct alerts fetched from active clinical vitals, medication stock levels, and custom logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin w-8 h-8 text-emerald-500" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No alerts detected. All systems operating under nominal values.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert Source</TableHead>
                    <TableHead>Notification Message</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} className={alert.status === "ACKNOWLEDGED" ? "opacity-60" : ""}>
                      <TableCell>{getSourceBadge(alert.source)}</TableCell>
                      <TableCell className="max-w-md font-medium text-slate-900 dark:text-slate-100">
                        {alert.message}
                      </TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {alert.timestamp.toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={alert.status === "ACTIVE" ? "default" : "outline"} className={alert.status === "ACTIVE" ? "bg-red-500 text-white" : ""}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {alert.status === "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAcknowledge(alert)}
                            className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2.5"
                          >
                            Acknowledge
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
