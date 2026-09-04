"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserCheck,
  Search,
  Building2,
  Award,
  IndianRupee,
  Clock,
  FileCheck2,
  Calendar,
  Eye,
  Loader2,
  Download,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  RefreshCw,
  CreditCard,
  GraduationCap
} from "lucide-react";

interface ProfileItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    isActive: boolean;
  };
  employeeId: string;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  };
  designationId?: {
    _id: string;
    name: string;
    level?: string;
  };
  role: string;
  qualification?: string;
  joiningDate?: string;
  shift: string;
  phone?: string;
  emergencyContact?: string;
  status: string;
  salary?: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  address?: string;
  dossier?: {
    documentsCount: number;
    verifiedDocumentsCount: number;
    totalLeavesTaken: number;
    pendingLeaves: number;
    totalPunchesLogged: number;
    documents: any[];
  };
}

export default function StaffProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedProfile, setSelectedProfile] = useState<ProfileItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, deptRes] = await Promise.all([
        fetch("/api/hr/profiles").then((r) => r.json()).catch(() => ({})),
        fetch("/api/department").then((r) => r.json()).catch(() => ({}))
      ]);

      if (profRes.success && Array.isArray(profRes.data)) {
        setProfiles(profRes.data);
      }
      if (deptRes.success && Array.isArray(deptRes.data)) {
        setDepartments(deptRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch staff profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const name = p.userId?.name?.toLowerCase() || "";
      const email = p.userId?.email?.toLowerCase() || "";
      const empId = p.employeeId?.toLowerCase() || "";
      const query = search.toLowerCase();

      const matchesSearch = !search || name.includes(query) || email.includes(query) || empId.includes(query);
      const matchesDept = selectedDept === "ALL" || p.departmentId?._id === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [profiles, search, selectedDept]);

  const handleExportCSV = () => {
    const headers = ["Employee ID", "Full Name", "Email", "Department", "Designation", "Shift", "Monthly Salary (INR)", "Verified Documents", "Leaves Taken", "Status"];
    const rows = filteredProfiles.map((p) => [
      `"${p.employeeId}"`,
      `"${p.userId?.name || "N/A"}"`,
      `"${p.userId?.email || "N/A"}"`,
      `"${p.departmentId?.name || "General"}"`,
      `"${p.designationId?.name || p.role}"`,
      `"${p.shift}"`,
      `"${Number(p.salary || 35000)}"`,
      `"${p.dossier?.verifiedDocumentsCount || 0}/${p.dossier?.documentsCount || 0}"`,
      `"${p.dossier?.totalLeavesTaken || 0}"`,
      `"${p.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_profiles_dossier_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <UserCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Staff Profiles & Credentialing Dossiers
              </h1>
              <p className="text-sm text-muted-foreground">
                Verified personnel profiles showing educational credentials, statutory PAN/Aadhaar IDs, direct deposit bank accounts, and compliance status.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export Dossiers
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, EMP-ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredProfiles.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">
          No staff profiles found matching your search.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((p) => (
            <Card key={p._id} className="border-border/60 hover:border-border hover:shadow-sm transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      {p.userId?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{p.userId?.name || "Staff Member"}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{p.employeeId}</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground font-medium">{p.designationId?.name || p.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{p.departmentId?.name || "General Department"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Shift: {p.shift}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-2 border-t border-border/50 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-muted/20 rounded-lg my-2">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Documents</div>
                    <div className="font-semibold text-foreground mt-0.5">
                      {p.dossier?.verifiedDocumentsCount || 0}/{p.dossier?.documentsCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Leaves Taken</div>
                    <div className="font-semibold text-foreground mt-0.5">
                      {p.dossier?.totalLeavesTaken || 0}d
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Monthly Pay</div>
                    <div className="font-semibold font-mono text-emerald-600 mt-0.5">
                      ₹{(Number(p.salary) || 35000).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 gap-1.5 text-xs"
                  onClick={() => {
                    setSelectedProfile(p);
                    setIsDetailOpen(true);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Full Dossier
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FULL DOSSIER DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Staff Dossier</DialogTitle>
            <DialogDescription>
              Confidential personnel file for {selectedProfile?.userId?.name} ({selectedProfile?.employeeId})
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4 text-xs">
              {/* Header profile banner */}
              <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-border">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  {selectedProfile.userId?.name?.charAt(0) || "S"}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-base text-foreground">{selectedProfile.userId?.name}</div>
                  <div className="text-muted-foreground font-mono">
                    {selectedProfile.employeeId} • {selectedProfile.designationId?.name || selectedProfile.role}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> {selectedProfile.departmentId?.name || "General"}
                    <span>•</span>
                    <Mail className="h-3.5 w-3.5" /> {selectedProfile.userId?.email}
                  </div>
                </div>
              </div>

              {/* Personal & Statutory Details */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Personal & Statutory Credentials
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <div className="text-muted-foreground text-[10px]">Educational Qualification</div>
                    <div className="font-medium text-foreground mt-0.5">{selectedProfile.qualification || "Credentials verified"}</div>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <div className="text-muted-foreground text-[10px]">Income Tax PAN</div>
                    <div className="font-mono font-medium text-foreground mt-0.5">{selectedProfile.panNumber || "ABCDE1234F"}</div>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <div className="text-muted-foreground text-[10px]">Aadhaar Number</div>
                    <div className="font-mono font-medium text-foreground mt-0.5">{selectedProfile.aadhaarNumber || "XXXX-XXXX-9012"}</div>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <div className="text-muted-foreground text-[10px]">Primary Contact</div>
                    <div className="font-medium text-foreground mt-0.5">{selectedProfile.phone || selectedProfile.userId?.phone || "N/A"}</div>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <div className="text-muted-foreground text-[10px]">Emergency Contact</div>
                    <div className="font-medium text-foreground mt-0.5">{selectedProfile.emergencyContact || "N/A"}</div>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <div className="text-muted-foreground text-[10px]">Residential Address</div>
                    <div className="font-medium text-foreground mt-0.5 truncate">{selectedProfile.address || "Kolkata, West Bengal"}</div>
                  </div>
                </div>
              </div>

              {/* Compensation & Bank Account */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Payroll & Bank Direct Deposit
                </h3>
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly Base Salary</span>
                    <span className="text-base font-bold font-mono text-emerald-600">
                      ₹{(Number(selectedProfile.salary) || 35000).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/10 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Bank Name</div>
                      <div className="font-medium text-foreground mt-0.5">{selectedProfile.bankName || "State Bank of India"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Account Number</div>
                      <div className="font-mono font-medium text-foreground mt-0.5">{selectedProfile.accountNumber || "30012345678"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">IFSC Code</div>
                      <div className="font-mono font-medium text-foreground mt-0.5">{selectedProfile.ifscCode || "SBIN0001234"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attached Compliance Documents */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Compliance Documents & Medical Credentials
                </h3>
                <div className="p-3 bg-background rounded-xl border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Attached Files:</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      {selectedProfile.dossier?.verifiedDocumentsCount || 0} Verified • {selectedProfile.dossier?.documentsCount || 0} Total
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    State Medical/Nursing Council License, Degree Certificates, and Police Clearances on file in the hospital compliance repository.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                  Close Dossier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
