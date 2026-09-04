"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Clock,
  QrCode,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle
} from "lucide-react";

export default function PatientsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("ALL");
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let url = `/api/patient?`;
      if (searchQuery.trim()) url += `query=${encodeURIComponent(searchQuery.trim())}&`;
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (bloodGroupFilter !== "ALL") url += `bloodGroup=${bloodGroupFilter}&`;
      if (selectedBranch !== "ALL") url += `branchId=${selectedBranch}&`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
        setPatients(data.data || []);
      } else {
        toast(data.message || "Failed to fetch patients", "error");
      }
    } catch (error) {
      toast("An error occurred while fetching patients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch("/api/org");
        const data = await res.json();
        if (data.success && data.data) {
          setBranches(data.data);
        }
      } catch (err) {
        console.error("Failed to load branches");
      }
    }
    loadBranches();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, bloodGroupFilter, selectedBranch]);

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete patient "${name}"?`)) return;

    try {
      const res = await fetch(`/api/patient/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Patient deleted successfully", "success");
        setPatients((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast(data.message || "Failed to delete patient", "error");
      }
    } catch (err) {
      toast("An error occurred while deleting patient", "error");
    }
  };

  const exportCSV = () => {
    if (patients.length === 0) {
      toast("No patient records to export", "error");
      return;
    }

    const headers = ["UHID", "Name", "Age", "Gender", "Blood Group", "Contact", "Email", "Address", "Emergency Contact", "Branch", "Status"];
    const rows = patients.map((p) => [
      `"${p.uhid || ""}"`,
      `"${p.name || ""}"`,
      p.age || "",
      p.gender || "",
      p.bloodGroup || "",
      `"${p.contact || ""}"`,
      `"${p.email || ""}"`,
      `"${(p.address || "").replace(/"/g, '""')}"`,
      `"${p.emergencyContact || ""}"`,
      `"${p.branchId?.organizationName || ""}"`,
      p.isMerged ? "Merged" : p.isActive ? "Active" : "Inactive"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medistra_patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Patient directory exported to CSV", "success");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-emerald-500" />
            Patient Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive registry of registered hospital patients, medical profiles, and records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => router.push("/patients/register")} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Register Patient
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by UHID, Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="merged">Merged Records</option>
            </Select>
          </div>

          {/* Blood Group Filter */}
          <div>
            <Select value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)}>
              <option value="ALL">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </Select>
          </div>

          {/* Branch Filter */}
          <div className="flex gap-2">
            <Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="flex-1">
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.organizationName}</option>
              ))}
            </Select>
            <Button variant="outline" size="sm" onClick={fetchPatients} title="Refresh Table">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Data Table */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
            <p className="text-sm">Loading patient records...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">No patient records found</div>
            <p className="text-xs max-w-sm mx-auto">
              No matching records were found for your filter criteria. You can register a new patient or adjust search filters.
            </p>
            <Button onClick={() => router.push("/patients/register")} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1" /> Register New Patient
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">UHID</th>
                  <th className="px-5 py-3.5 font-semibold">Patient Name</th>
                  <th className="px-5 py-3.5 font-semibold">Age / Gender</th>
                  <th className="px-5 py-3.5 font-semibold">Blood Group</th>
                  <th className="px-5 py-3.5 font-semibold">Contact</th>
                  <th className="px-5 py-3.5 font-semibold">Branch</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {patient.uhid || "MED-PENDING"}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                      <Link
                        href={`/patients/profile?id=${patient._id}`}
                        className="hover:text-emerald-500 hover:underline"
                      >
                        {patient.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {patient.age} yrs / {patient.gender}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {patient.bloodGroup || "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {patient.contact}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {patient.branchId?.organizationName || "Headquarters"}
                    </td>
                    <td className="px-5 py-3.5">
                      {patient.isMerged ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Merged
                        </span>
                      ) : patient.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/patients/profile?id=${patient._id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-2" title="View 360° Profile">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/patients/history?id=${patient._id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-2" title="Medical History">
                            <Clock className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/patients/documents?id=${patient._id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-2" title="Medical Documents">
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/patients/identification?id=${patient._id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-2" title="Print ID Card">
                            <QrCode className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePatient(patient._id, patient.name)}
                          className="h-8 px-2 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
