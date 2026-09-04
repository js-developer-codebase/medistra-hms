"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { 
  Building2, 
  Hospital, 
  MapPin, 
  Network, 
  ShieldCheck, 
  Stethoscope, 
  Layers, 
  Sliders, 
  Clock, 
  Phone, 
  Mail, 
  BedDouble, 
  Users, 
  ArrowUpRight, 
  Activity,
  CheckCircle2,
  RefreshCw,
  FileText
} from "lucide-react";

interface OrganizationStats {
  totalFacilities: number;
  hospitalsCount: number;
  branchesCount: number;
  clinicsCount: number;
  diagnosticsCount: number;
  departmentsCount: number;
  totalBedCapacity: number;
  activeStaffCount: number;
  facilities: Array<{
    _id: string;
    organizationName: string;
    organizationId: string;
    organizationType: string;
    branchType: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    capacity?: number;
    isActive: boolean;
  }>;
}

export default function OrganizationDashboardPage() {
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast({ title: "Failed to load telemetry", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Network Error", description: error?.message || "Failed to load organization statistics", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const navCards = [
    {
      title: "Organization Profile",
      desc: "Corporate headquarters dossier, CIN, PAN, GSTIN, and statutory registrations.",
      href: "/organization/details",
      icon: Building2,
      badge: "HQ Dossier",
      color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
    },
    {
      title: "Hospitals Network",
      desc: "Tertiary and superspecialty hospitals with inpatient bed distribution and OT facilities.",
      href: "/organization/hospitals",
      icon: Hospital,
      badge: `${stats?.hospitalsCount || 0} Facilities`,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
    },
    {
      title: "Branches & Clinics",
      desc: "Satellite polyclinics, day-surgery branches, and sample collection networks.",
      href: "/organization/branches",
      icon: Network,
      badge: `${stats?.branchesCount || 0} Units`,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800",
    },
    {
      title: "Departments",
      desc: "Clinical specialties, diagnostic suites, trauma triage, and administrative departments.",
      href: "/organization/departments",
      icon: Layers,
      badge: `${stats?.departmentsCount || 0} Registered`,
      color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
    },
    {
      title: "Organization Settings",
      desc: "Corporate tax identification (PAN/GSTIN), fiscal year (April–March), and currency standard (₹).",
      href: "/organization/settings",
      icon: Sliders,
      badge: "INR (₹) Standard",
      color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
    },
    {
      title: "Hospital Operations",
      desc: "NABH accreditation credentials, ICU/NICU ratios, drug licenses, and casualty hotlines.",
      href: "/organization/hospital-settings",
      icon: ShieldCheck,
      badge: "NABH Accredited",
      color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
    },
    {
      title: "Branch Logistics",
      desc: "Satellite clinic operating hours, central lab courier timings, and daycare beds.",
      href: "/organization/branch-settings",
      icon: Clock,
      badge: "Logistics Sync",
      color: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-800",
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Organization Management</h1>
              <p className="text-muted-foreground text-sm">
                Centralized Governance, Healthcare Network Telemetry & Regulatory Compliance (₹ INR)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchTelemetry} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
          <Link href="/organization/details">
            <Button size="sm">
              <Building2 className="w-4 h-4 mr-2" /> HQ Dossier
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Telemetry Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Network Facilities
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-950/50">
              <Building2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats?.totalFacilities || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="font-medium text-blue-600">{stats?.hospitalsCount || 0}</span> Flagship Hospitals •{" "}
              <span className="font-medium text-indigo-600">{stats?.branchesCount || 0}</span> Satellite Units
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Inpatient Bed Capacity
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-950/50">
              <BedDouble className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : (stats?.totalBedCapacity || 0).toLocaleString("en-IN")} Beds
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tertiary Care, ICU, HDU & Day Care
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Clinical Departments
            </CardTitle>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-950/50">
              <Stethoscope className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats?.departmentsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-purple-600 font-medium">100% Operational</span> across network
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Healthcare Personnel
            </CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg dark:bg-amber-950/50">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : (stats?.activeStaffCount || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              Clinicians, Nursing & Allied Staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation & Management Workstations */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Administrative & Operational Workstations
          </h2>
          <p className="text-sm text-muted-foreground">
            Direct access to network facilities, clinical governance, logistics, and legal parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group block">
                <Card className="h-full border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl border ${card.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-xs font-medium">
                        {card.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex items-center gap-1.5 pt-2">
                      {card.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                      {card.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Network Facilities Directory Preview */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Hospital className="w-5 h-5 text-primary" /> Active Network Facilities
            </CardTitle>
            <CardDescription className="text-xs">
              Live directory of hospitals, specialized institutes, diagnostic hubs, and polyclinics.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/organization/hospitals">
              <Button variant="outline" size="sm">View All Hospitals</Button>
            </Link>
            <Link href="/organization/branches">
              <Button variant="outline" size="sm">View All Branches</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading facilities...
            </div>
          ) : !stats?.facilities?.length ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No facilities found. Seed or create organizations to view network telemetry.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.facilities.map((fac) => (
                <div
                  key={fac._id}
                  className="p-4 rounded-xl border bg-card text-card-foreground hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                        {fac.organizationName}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {fac.organizationId}
                      </p>
                    </div>
                    <Badge
                      variant={fac.branchType === "MAIN" ? "default" : "secondary"}
                      className="text-[10px] uppercase font-medium"
                    >
                      {fac.branchType === "MAIN" ? "Flagship HQ" : fac.organizationType}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t">
                    {fac.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{fac.city}{fac.state ? `, ${fac.state}` : ""}</span>
                      </div>
                    )}
                    {fac.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{fac.phone}</span>
                      </div>
                    )}
                    {fac.capacity && (
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <BedDouble className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{fac.capacity} Inpatient Beds</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
