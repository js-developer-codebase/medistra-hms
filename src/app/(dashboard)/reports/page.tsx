"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Calendar,
  UserCheck,
  Bed,
  Activity,
  FlaskConical,
  Radio,
  Pill,
  Package,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  Building2,
  TrendingUp,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  ChevronRight,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  LogOut,
  Hospital
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ReportsHubPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const { toast } = useToast();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/summary?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load reports summary: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error fetching summary: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [timeframe]);

  const overview = data?.overview || {
    totalPatients: 0,
    totalAppointments: 0,
    totalAdmissions: 0,
    activeInpatients: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    bedOccupancyRate: "0%",
    totalRevenue: 0,
    totalBilled: 0,
    totalOutstanding: 0,
    pendingInsuranceReceivables: 0,
    lowStockAlerts: 0
  };

  const reportModules = [
    {
      category: "Executive & Administrative",
      items: [
        {
          title: "Management Dashboard",
          path: "/reports/management",
          icon: BarChart3,
          color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
          description: "High-level hospital KPI cockpit, doctor productivity, daily census, and revenue distribution.",
          metric: `${overview.activeInpatients} Active IPD`
        },
        {
          title: "Department Performance",
          path: "/reports/departments",
          icon: Building2,
          color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
          description: "Footfall, admissions, bed allocation, and revenue contribution across clinical specialties.",
          metric: "All Specialties"
        }
      ]
    },
    {
      category: "Clinical & Inpatient Care",
      items: [
        {
          title: "Patient Reports",
          path: "/reports/patients",
          icon: Users,
          color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
          description: "Patient demographic analysis, age group brackets, blood group trends, and registration growth.",
          metric: `${overview.totalPatients} Registered`
        },
        {
          title: "Appointment Reports",
          path: "/reports/appointments",
          icon: Calendar,
          color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
          description: "Booking load, completed vs cancelled rates, no-show monitoring, and departmental queues.",
          metric: `${overview.totalAppointments} Booked`
        },
        {
          title: "Doctor Productivity",
          path: "/reports/doctors",
          icon: UserCheck,
          color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40",
          description: "Consultation volumes, department staffing, schedule load, and estimated revenue generation.",
          metric: "Doctor Roster"
        },
        {
          title: "Admission Reports",
          path: "/reports/admissions",
          icon: Hospital,
          color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40",
          description: "Inpatient admission rates, emergency vs elective admissions, admitting consultants, and ward share.",
          metric: `${overview.totalAdmissions} Total IPD`
        },
        {
          title: "Discharge & ALOS Reports",
          path: "/reports/discharges",
          icon: LogOut,
          color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
          description: "Patient recovery rates, discharge conditions (Recovered, LAMA, Transferred), and Average Length of Stay.",
          metric: "Inpatient ALOS"
        },
        {
          title: "Bed Occupancy Reports",
          path: "/reports/beds",
          icon: Bed,
          color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
          description: "Live bed availability, ward-by-ward occupancy rates (BOR %), ICU capacity, and maintenance beds.",
          metric: overview.bedOccupancyRate
        },
        {
          title: "Clinical & Diagnoses Reports",
          path: "/reports/clinical",
          icon: Activity,
          color: "text-red-600 bg-red-50 dark:bg-red-950/40",
          description: "Morbidity patterns, top clinical diagnoses, treatment plan compliance, and clinical record logs.",
          metric: "ICD-10 Morbidity"
        }
      ]
    },
    {
      category: "Diagnostics & Pharmacy",
      items: [
        {
          title: "Laboratory Reports",
          path: "/reports/lab",
          icon: FlaskConical,
          color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
          description: "Test ordering volumes, priority distribution (Routine vs STAT), sample collection, and lab TAT.",
          metric: "Diagnostic Lab"
        },
        {
          title: "Radiology Reports",
          path: "/reports/radiology",
          icon: Radio,
          color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40",
          description: "Imaging study loads across modalities (MRI, CT, X-Ray, USG), reporting TAT, and study completion.",
          metric: "Imaging Modalities"
        },
        {
          title: "Pharmacy Reports",
          path: "/reports/pharmacy",
          icon: Pill,
          color: "text-green-600 bg-green-50 dark:bg-green-950/40",
          description: "Drug dispensing volumes, top fast-moving medicines, pharmacy sales revenue in ₹, and payment modes.",
          metric: "Drug Dispensing"
        }
      ]
    },
    {
      category: "Supply Chain & Procurement",
      items: [
        {
          title: "Inventory Reports",
          path: "/reports/inventory",
          icon: Package,
          color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40",
          description: "Stock valuation in ₹, reorder level alerts, stock wastage tracking, and surgical consumable levels.",
          metric: `${overview.lowStockAlerts} Low Stock Alerts`
        },
        {
          title: "Procurement Reports",
          path: "/reports/procurement",
          icon: ShoppingCart,
          color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
          description: "Purchase order commitments in ₹, PO approval pipeline, vendor spend analysis, and goods receipts.",
          metric: "PO Commitments"
        }
      ]
    },
    {
      category: "Financial & TPA Insurance",
      items: [
        {
          title: "Billing & Revenue Reports",
          path: "/reports/billing",
          icon: CreditCard,
          color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
          description: "Gross billings, net collections in ₹, collection efficiency, outstanding patient dues, and payment modes.",
          metric: `₹${overview.totalRevenue.toLocaleString("en-IN")}`
        },
        {
          title: "Insurance & TPA Reports",
          path: "/reports/insurance",
          icon: ShieldCheck,
          color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40",
          description: "Cashless claims recovery yield, settled remittances vs disallowed deductions in ₹, and carrier scorecards.",
          metric: `₹${overview.pendingInsuranceReceivables.toLocaleString("en-IN")} Pending`
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Hospital Intelligence Unit
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Hospital Reports & Analytics Hub
          </h1>
          <p className="text-muted-foreground text-sm">
            Centralized enterprise intelligence across clinical, diagnostic, supply chain, and financial hospital operations in ₹.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="h-8 text-xs rounded-md border border-input bg-background px-2.5 text-foreground focus:ring-1 focus:ring-primary"
          >
            <option value="ALL_TIME">All Time</option>
            <option value="TODAY">Today</option>
            <option value="7_DAYS">Last 7 Days</option>
            <option value="30_DAYS">Last 30 Days</option>
            <option value="QUARTER">Last 90 Days</option>
            <option value="YTD">Year to Date (YTD)</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchSummary} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Overview
          </Button>
        </div>
      </div>

      {/* High-Level Executive KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Realized Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{overview.totalRevenue.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                From ₹{overview.totalBilled.toLocaleString("en-IN")} billed
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bed Occupancy Rate</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">
                {overview.bedOccupancyRate}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {overview.occupiedBeds} occupied / {overview.totalBeds} total beds
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bed className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inpatient Census</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">
                {overview.activeInpatients} Active
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {overview.totalAdmissions} cumulative admissions
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Hospital className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outstanding Receivables</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                ₹{overview.totalOutstanding.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-amber-600 font-medium mt-1">
                + ₹{overview.pendingInsuranceReceivables.toLocaleString("en-IN")} TPA claims
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialized Reports Categorized Workstation Grid */}
      <div className="space-y-6">
        {reportModules.map((modGroup, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              {modGroup.category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modGroup.items.map((report, rIdx) => {
                const Icon = report.icon;
                return (
                  <Link key={rIdx} href={report.path} className="group">
                    <Card className="h-full shadow-sm hover:shadow-md transition-all hover:border-primary/50 group-hover:bg-muted/10 cursor-pointer">
                      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${report.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground">
                            {report.metric}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors flex items-center gap-1">
                            {report.title}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {report.description}
                          </p>
                        </div>

                        <div className="flex items-center text-xs font-medium text-primary pt-2 border-t border-border/40">
                          <span>View Detailed Report</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
