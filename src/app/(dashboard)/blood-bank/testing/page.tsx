"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FlaskConical
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
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function BloodTestingPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [inventoryBags, setInventoryBags] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bagNumber: "",
    bloodGroup: "O+",
    componentType: "PRBC",
    hivResult: "NON_REACTIVE",
    hbsagResult: "NON_REACTIVE",
    hcvResult: "NON_REACTIVE",
    vdrlResult: "NON_REACTIVE",
    malariaResult: "NEGATIVE",
    rhPhenotype: "Rh (D) Positive",
    irregularAntibodyScreening: "NEGATIVE",
    overallSafetyStatus: "SAFE_FOR_TRANSFUSION",
    testedBy: "Sr. Serologist",
    verifiedBy: "Dr. Transfusion Specialist",
    notes: "All 5 mandatory TTI serology markers negative."
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testRes, invRes] = await Promise.all([
        fetch("/api/blood-bank/testing"),
        fetch("/api/blood-bank/inventory")
      ]);

      const testData = await testRes.json();
      if (testData.success) setTests(testData.data || []);

      const invData = await invRes.json();
      if (invData.success) {
        setInventoryBags(invData.data || []);
        if (invData.data?.length > 0 && !formData.bagNumber) {
          setFormData((prev) => ({
            ...prev,
            bagNumber: invData.data[0].bagNumber,
            bloodGroup: invData.data[0].bloodGroup,
            componentType: invData.data[0].componentType
          }));
        }
      }
    } catch (err) {
      toast("Failed to load blood testing records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBagSelect = (bagNumber: string) => {
    const selected = inventoryBags.find((b) => b.bagNumber === bagNumber);
    if (selected) {
      setFormData({
        ...formData,
        bagNumber: selected.bagNumber,
        bloodGroup: selected.bloodGroup,
        componentType: selected.componentType
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bagNumber) {
      toast("Please specify a bag number", "error");
      return;
    }

    // Auto-calculate overall status
    const isUnsafe =
      formData.hivResult === "REACTIVE" ||
      formData.hbsagResult === "REACTIVE" ||
      formData.hcvResult === "REACTIVE" ||
      formData.vdrlResult === "REACTIVE" ||
      formData.malariaResult === "POSITIVE" ||
      formData.irregularAntibodyScreening === "POSITIVE";

    const payload = {
      ...formData,
      overallSafetyStatus: isUnsafe ? "UNSAFE_DISCARD" : "SAFE_FOR_TRANSFUSION"
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/testing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast(`TTI Test ${data.data.testCode} logged. Unit marked as ${data.data.overallSafetyStatus}!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to log test", "error");
      }
    } catch (err) {
      toast("Error submitting test", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tests.filter(
    (t) =>
      t.testCode?.toLowerCase().includes(search.toLowerCase()) ||
      t.bagNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Statutory TTI Serology &amp; Infection Testing Station
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mandatory statutory 5-pathogen screening: HIV 1/2, Hepatitis B (HBsAg), Hepatitis C (HCV), Syphilis (VDRL), and Malaria Parasite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Log TTI Screening Test
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by test code or bag number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-teal-600" />
            Mandatory TTI Screening Test Certificates ({filtered.length} Tests)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Test Code</TableHead>
                <TableHead>Bag Number &amp; Group</TableHead>
                <TableHead>HIV 1 &amp; 2</TableHead>
                <TableHead>HBsAg (Hep B)</TableHead>
                <TableHead>HCV (Hep C)</TableHead>
                <TableHead>VDRL (Syphilis)</TableHead>
                <TableHead>Malaria MP</TableHead>
                <TableHead>Verified By</TableHead>
                <TableHead className="text-center">Safety Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                    No TTI serology screening tests recorded yet. Click &quot;Log TTI Screening Test&quot; to test a quarantined blood bag.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-teal-700 dark:text-teal-400">
                      {t.testCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {t.bagNumber}
                      </div>
                      <Badge className="bg-rose-600 text-white text-[10px] mt-0.5">
                        {t.bloodGroup} • {t.componentType}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${t.hivResult === "NON_REACTIVE" ? "text-emerald-700 border-emerald-400" : "text-rose-700 border-rose-400"}`}>
                        {t.hivResult}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${t.hbsagResult === "NON_REACTIVE" ? "text-emerald-700 border-emerald-400" : "text-rose-700 border-rose-400"}`}>
                        {t.hbsagResult}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${t.hcvResult === "NON_REACTIVE" ? "text-emerald-700 border-emerald-400" : "text-rose-700 border-rose-400"}`}>
                        {t.hcvResult}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${t.vdrlResult === "NON_REACTIVE" ? "text-emerald-700 border-emerald-400" : "text-rose-700 border-rose-400"}`}>
                        {t.vdrlResult}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${t.malariaResult === "NEGATIVE" ? "text-emerald-700 border-emerald-400" : "text-rose-700 border-rose-400"}`}>
                        {t.malariaResult}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-800 dark:text-slate-200">{t.verifiedBy}</div>
                      <div className="text-[10px] text-slate-400">{new Date(t.testedAt).toLocaleDateString()}</div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[9px] ${
                          t.overallSafetyStatus === "SAFE_FOR_TRANSFUSION"
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {t.overallSafetyStatus === "SAFE_FOR_TRANSFUSION" ? "SAFE (CERTIFIED)" : "UNSAFE (DISCARD)"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Test Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              Log Statutory TTI Serology Screening Test
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Select Quarantined Bag Number *</Label>
              {inventoryBags.length === 0 ? (
                <Input
                  required
                  placeholder="BAG-YYYYMMDD-XXXX"
                  value={formData.bagNumber}
                  onChange={(e) => setFormData({ ...formData, bagNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              ) : (
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.bagNumber}
                  onChange={(e) => handleBagSelect(e.target.value)}
                >
                  {inventoryBags.map((b) => (
                    <option key={b._id} value={b.bagNumber}>
                      {b.bagNumber} ({b.bloodGroup} • {b.componentType})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border space-y-2">
              <span className="font-bold text-[11px] block uppercase text-slate-700 dark:text-slate-300">
                5 Mandatory Transfusion Transmissible Infections (TTI)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">1. HIV 1 &amp; 2 (ELISA) *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background"
                    value={formData.hivResult}
                    onChange={(e) => setFormData({ ...formData, hivResult: e.target.value as any })}
                  >
                    <option value="NON_REACTIVE">NON-REACTIVE</option>
                    <option value="REACTIVE">REACTIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">2. HBsAg (Hep B) *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background"
                    value={formData.hbsagResult}
                    onChange={(e) => setFormData({ ...formData, hbsagResult: e.target.value as any })}
                  >
                    <option value="NON_REACTIVE">NON-REACTIVE</option>
                    <option value="REACTIVE">REACTIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">3. HCV (Hep C) *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background"
                    value={formData.hcvResult}
                    onChange={(e) => setFormData({ ...formData, hcvResult: e.target.value as any })}
                  >
                    <option value="NON_REACTIVE">NON-REACTIVE</option>
                    <option value="REACTIVE">REACTIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">4. VDRL / RPR (Syphilis) *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background"
                    value={formData.vdrlResult}
                    onChange={(e) => setFormData({ ...formData, vdrlResult: e.target.value as any })}
                  >
                    <option value="NON_REACTIVE">NON-REACTIVE</option>
                    <option value="REACTIVE">REACTIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">5. Malaria Parasite (MP) *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background"
                    value={formData.malariaResult}
                    onChange={(e) => setFormData({ ...formData, malariaResult: e.target.value as any })}
                  >
                    <option value="NEGATIVE">NEGATIVE</option>
                    <option value="POSITIVE">POSITIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">Irregular Antibodies *</Label>
                  <select
                    className="w-full h-8 rounded border text-xs px-2 bg-background"
                    value={formData.irregularAntibodyScreening}
                    onChange={(e) => setFormData({ ...formData, irregularAntibodyScreening: e.target.value as any })}
                  >
                    <option value="NEGATIVE">NEGATIVE</option>
                    <option value="POSITIVE">POSITIVE</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tested By (Technician) *</Label>
                <Input
                  value={formData.testedBy}
                  onChange={(e) => setFormData({ ...formData, testedBy: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Verified By (Consultant Pathologist) *</Label>
                <Input
                  value={formData.verifiedBy}
                  onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white"
              >
                {submitting ? "Validating..." : "Certify TTI Safety Status"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
