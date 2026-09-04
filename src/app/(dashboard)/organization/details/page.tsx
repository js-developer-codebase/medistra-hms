"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  BedDouble, 
  ShieldCheck, 
  FileText, 
  Edit, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  Globe,
  Sliders
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrganizationDetailsPage() {
  const [hq, setHq] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    organizationName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    capacity: 0,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchDossier = async () => {
    try {
      setLoading(true);
      const [orgRes, settingsRes] = await Promise.all([
        fetch("/api/organization"),
        fetch("/api/organization/settings")
      ]);
      const orgData = await orgRes.json();
      const settingsData = await settingsRes.json();

      if (orgData.success) {
        const main = orgData.data.find((o: any) => o.branchType === "MAIN") || orgData.data[0];
        setHq(main);
        if (main) {
          setEditFormData({
            organizationName: main.organizationName || "",
            email: main.email || "",
            phone: main.phone || "",
            address: main.address || "",
            city: main.city || "Kolkata",
            state: main.state || "West Bengal",
            pincode: main.pincode || "700001",
            capacity: main.capacity || 450,
          });
        }
        setBranches(orgData.data.filter((o: any) => o.branchType === "BRANCH"));
      }
      if (settingsData.success) {
        setSettings(settingsData.data);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load headquarters dossier", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, []);

  const handleUpdate = async () => {
    if (!hq?._id) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/organization/${hq._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Updated Successfully", description: "Headquarters profile updated." });
        setIsEditDialogOpen(false);
        fetchDossier();
      } else {
        toast({ title: "Update Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/50">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Organization Details</h1>
              <p className="text-muted-foreground text-sm">
                Corporate Headquarters Dossier, Network Governance & Statutory Accreditation
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDossier} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsEditDialogOpen(true)} disabled={loading || !hq}>
            <Edit className="w-4 h-4 mr-2" /> Edit Dossier
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading Headquarters Dossier...
        </div>
      ) : !hq ? (
        <div className="py-16 text-center text-muted-foreground">
          No Organization records found. Please seed the database or create an organization.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Headquarters Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border">
              <CardHeader className="border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-bold text-foreground">
                        {hq.organizationName}
                      </CardTitle>
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                        Active Network HQ
                      </Badge>
                    </div>
                    <CardDescription className="font-mono text-xs text-muted-foreground mt-1">
                      Organization Identifier: {hq.organizationId}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs uppercase font-semibold">
                    {hq.organizationType} • {hq.branchType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Primary Contact Email
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{hq.email || "N/A"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Direct Telephony Helpline
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{hq.phone || "N/A"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-muted/20 space-y-1 md:col-span-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Corporate Registered Address
                    </span>
                    <div className="flex items-start gap-2 text-sm font-medium text-foreground pt-0.5">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        {hq.address || "12 Medical Enclave, Central Avenue, Kolkata"}, {hq.city || "Kolkata"}, {hq.state || "West Bengal"} - {hq.pincode || "700001"}, {hq.country || "India"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Inpatient Bed Strength
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <BedDouble className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{hq.capacity || 450} Operational Beds</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Statutory Currency Standard
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="font-bold text-amber-600">₹</span>
                      <span>INR (Indian Rupee - ₹)</span>
                    </div>
                  </div>
                </div>

                {/* Additional Clinical Governance metadata */}
                {hq.metadata && (
                  <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                    <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" /> Clinical Governance Attributes
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      {Object.entries(hq.metadata).map(([key, val]) => (
                        <div key={key} className="bg-background/80 p-2 rounded border">
                          <span className="font-medium text-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1")}:
                          </span>{" "}
                          <span>{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network Satellite Facilities */}
            <Card className="shadow-sm border">
              <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Associated Network Units</CardTitle>
                  <CardDescription className="text-xs">
                    Satellite branches and specialty hospitals affiliated with this headquarters.
                  </CardDescription>
                </div>
                <Link href="/organization/branches">
                  <Button variant="outline" size="sm">Manage Branches</Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                {branches.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No satellite branches linked yet.
                  </p>
                ) : (
                  <div className="divide-y text-xs">
                    {branches.map((b) => (
                      <div key={b._id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{b.organizationName}</p>
                          <p className="text-muted-foreground">{b.city || "Kolkata"} • {b.capacity || 0} Beds/Chairs</p>
                        </div>
                        <Badge variant="secondary" className="uppercase font-mono text-[10px]">
                          {b.organizationType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Legal & Statutory Compliance Snapshot */}
          <div className="space-y-6">
            <Card className="shadow-sm border">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Statutory & Legal Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Corporate Identity Number (CIN)</span>
                  <p className="font-mono font-medium text-foreground mt-0.5">
                    {settings?.cinNumber || "U85110WB2018PTC224890"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Income Tax PAN</span>
                  <p className="font-mono font-medium text-foreground mt-0.5">
                    {settings?.panNumber || "AAACM8912P"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">GSTIN (West Bengal)</span>
                  <p className="font-mono font-medium text-foreground mt-0.5">
                    {settings?.gstin || "19AAACM8912P1ZV"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Financial Year Cycle</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {settings?.fiscalYearStart || "April"} – {settings?.fiscalYearEnd || "March"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Official Website</span>
                  <p className="font-medium text-blue-600 mt-0.5">
                    <a href={settings?.website || "https://medistra.hospital"} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      {settings?.website || "https://medistra.hospital"} <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div className="pt-2 border-t flex flex-col gap-2">
                  <Link href="/organization/settings">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Sliders className="w-3.5 h-3.5 mr-2 text-primary" /> Configure Tax & Legal Settings
                    </Button>
                  </Link>
                  <Link href="/organization/hospital-settings">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" /> View NABH Credentials
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-gradient-to-br from-primary/5 via-background to-background">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> NABH Fully Accredited
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Medistra Healthcare System maintains highest clinical standards compliant with National Accreditation Board for Hospitals & Healthcare Providers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Headquarters Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Headquarters Dossier</DialogTitle>
            <DialogDescription>
              Update core administrative and contact information for the primary flagship facility.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <Label>Organization / Hospital Name</Label>
              <Input
                value={editFormData.organizationName}
                onChange={(e) => setEditFormData({ ...editFormData, organizationName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input
                  value={editFormData.pincode}
                  onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Inpatient Operational Bed Capacity</Label>
              <Input
                type="number"
                value={editFormData.capacity}
                onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
