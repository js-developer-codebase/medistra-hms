"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  ShoppingCart,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export default function PharmacyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pharmacy/prescriptions");
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.data || []);
      }
    } catch (err) {
      toast("Failed to load prescriptions queue", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const pName = p.patientId?.name || "";
      const pUhid = p.patientId?.uhid || "";
      const dName = p.doctorId?.name || "";
      const diag = p.diagnosis || "";

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        pUhid.toLowerCase().includes(search.toLowerCase()) ||
        dName.toLowerCase().includes(search.toLowerCase()) ||
        diag.toLowerCase().includes(search.toLowerCase());

      const currentStatus = p.dispenseStatus || "PENDING";
      const matchesStatus = statusFilter === "ALL" || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, statusFilter]);

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "DISPENSED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" /> Dispensed
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1 text-[10px]">
            Partially Dispensed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="text-[10px]">
            Cancelled
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1 text-[10px]">
            <Clock className="h-3 w-3" /> Awaiting Dispense
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Prescription Dispensing Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inpatient and outpatient clinical electronic prescriptions verified for pharmaceutical dispensing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPrescriptions}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>

          <Link href="/pharmacy/dispensing">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <ShoppingCart className="h-3.5 w-3.5" />
              Open POS Counter
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, UHID, prescribing doctor or diagnosis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({prescriptions.length})</option>
                <option value="PENDING">Awaiting Dispense</option>
                <option value="DISPENSED">Dispensed</option>
                <option value="PARTIAL">Partially Dispensed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Prescriptions Directory ({filteredPrescriptions.length} Records)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Patient Details</TableHead>
                <TableHead>Prescribing Physician</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Medications Prescribed</TableHead>
                <TableHead>Dispense Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No prescriptions found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((p) => {
                  const status = p.dispenseStatus || "PENDING";
                  return (
                    <TableRow key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {p.patientId?.name || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          UHID: {p.patientId?.uhid || "N/A"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                          Dr. {p.doctorId?.name || "Consultant"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {p.visitDate ? new Date(p.visitDate).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-[180px] truncate text-slate-600 dark:text-slate-400 font-medium">
                          {p.diagnosis || p.symptoms || "Clinical Evaluation"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {p.medications?.length || 0} Drugs
                        </div>
                        <div className="text-[10px] text-slate-500 max-w-[200px] truncate">
                          {p.medications?.map((m: any) => m.name).join(", ")}
                        </div>
                      </TableCell>

                      <TableCell>{renderStatusBadge(status)}</TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => setSelectedPrescription(p)}
                            title="View Prescription Details"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>

                          {status !== "DISPENSED" ? (
                            <Link href={`/pharmacy/dispensing?prescriptionId=${p._id}`}>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Dispense
                              </Button>
                            </Link>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-emerald-600">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prescription Detail Modal */}
      <Dialog
        open={!!selectedPrescription}
        onOpenChange={(open) => !open && setSelectedPrescription(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-emerald-600" />
              Prescription Order Details
            </DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Patient & Doctor Header Box */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">PATIENT</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedPrescription.patientId?.name}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500">
                    UHID: {selectedPrescription.patientId?.uhid}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">PRESCRIBING DOCTOR</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Dr. {selectedPrescription.doctorId?.name}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    Date: {new Date(selectedPrescription.visitDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div className="p-2.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300">
                  <span className="font-bold text-[10px] block uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    DIAGNOSIS &amp; CLINICAL INDICATION
                  </span>
                  {selectedPrescription.diagnosis}
                </div>
              )}

              {/* Prescribed Medications Table */}
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Prescribed Medications ({selectedPrescription.medications?.length || 0})
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-50 dark:bg-slate-800">
                      <TableRow>
                        <TableHead>Drug Name</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Instructions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrescription.medications?.map((m: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-slate-900 dark:text-white">
                            {m.name}
                          </TableCell>
                          <TableCell>{m.dosage || "1 Tab"}</TableCell>
                          <TableCell>{m.frequency || "TDS (3x)"}</TableCell>
                          <TableCell>{m.duration || "5 Days"}</TableCell>
                          <TableCell className="text-slate-500">{m.instructions || "After food"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    PHYSICIAN ADVICE / NOTES
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t flex items-center justify-between">
                <div>{renderStatusBadge(selectedPrescription.dispenseStatus)}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPrescription(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                  {selectedPrescription.dispenseStatus !== "DISPENSED" && (
                    <Link href={`/pharmacy/dispensing?prescriptionId=${selectedPrescription._id}`}>
                      <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                        Proceed to Dispense
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
