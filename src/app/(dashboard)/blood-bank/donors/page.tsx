"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Phone,
  Calendar,
  ShieldCheck
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

export default function DonorsPage() {
  const [donors, setDonors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    age: 28,
    bloodGroup: "O+",
    contactNumber: "",
    email: "",
    city: "New Delhi",
    address: "",
    weight: 65,
    hemoglobin: 14.0,
    bloodPressure: "120/80",
    pulse: 72,
    isVoluntary: true,
    medicalHistory: "Fit for blood donation. No systemic illnesses."
  });

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blood-bank/donors");
      const data = await res.json();
      if (data.success) {
        setDonors(data.data || []);
      }
    } catch (err) {
      toast("Failed to load blood donors", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.contactNumber.trim()) {
      toast("First name and contact number are required", "error");
      return;
    }

    // Automated eligibility evaluation
    const isWeightEligible = formData.weight >= 45;
    const isHbEligible = formData.hemoglobin >= 12.5;
    const isEligible = isWeightEligible && isHbEligible;

    const payload = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      eligibilityStatus: isEligible ? "ELIGIBLE" : "DEFERRED_TEMPORARY",
      deferralReason: !isWeightEligible
        ? "Weight below statutory 45kg threshold"
        : !isHbEligible
        ? "Hemoglobin below 12.5 g/dL threshold"
        : undefined
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Donor ${data.data.donorCode} registered successfully!`, "success");
        setIsOpen(false);
        fetchDonors();
      } else {
        toast(data.message || "Failed to register donor", "error");
      }
    } catch (err) {
      toast("Error saving donor", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      const name = d.fullName || `${d.firstName || ""} ${d.lastName || ""}`;
      const code = d.donorCode || "";
      const contact = d.contactNumber || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase()) ||
        contact.includes(search);

      const matchesGroup = groupFilter === "ALL" || d.bloodGroup === groupFilter;
      const matchesStatus = statusFilter === "ALL" || d.eligibilityStatus === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [donors, search, groupFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Voluntary Blood Donors Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Donor intake screening (weight, Hb, vitals, 90-day intervals), eligibility validation, and donor database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDonors}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Register Voluntary Donor
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search donors by name, donor code, or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="ALL">All Blood Groups ({donors.length})</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Eligibility Statuses</option>
                <option value="ELIGIBLE">Eligible (Ready to Donate)</option>
                <option value="DEFERRED_TEMPORARY">Temporarily Deferred</option>
                <option value="DEFERRED_PERMANENT">Permanently Deferred</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Registered Voluntary Blood Donors ({filtered.length} Donors)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Donor Code</TableHead>
                <TableHead>Full Name &amp; Age</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Contact / Location</TableHead>
                <TableHead>Screening Vitals</TableHead>
                <TableHead>Donations</TableHead>
                <TableHead className="text-center">Eligibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No donors found matching criteria. Click &quot;Register Voluntary Donor&quot; to add.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow key={d._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-blue-700 dark:text-blue-400">
                      {d.donorCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {d.fullName || `${d.firstName} ${d.lastName || ""}`}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {d.age} Yrs • {d.gender}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-rose-600 text-white font-bold text-[10px]">
                        {d.bloodGroup}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="font-mono text-slate-800 dark:text-slate-200">
                        {d.contactNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {d.city || "New Delhi"}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-[11px]">
                      <div>Hb: <span className="font-bold">{d.hemoglobin || 13.5}</span> g/dL</div>
                      <div className="text-[10px] text-slate-400">
                        Wt: {d.weight}kg • BP: {d.bloodPressure || "120/80"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold font-mono text-slate-900 dark:text-white">
                        {d.donationCount || 0} times
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {d.lastDonationDate
                          ? `Last: ${new Date(d.lastDonationDate).toLocaleDateString()}`
                          : "First time donor"}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[9px] ${
                          d.eligibilityStatus === "ELIGIBLE"
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {d.eligibilityStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register Donor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Register Voluntary Blood Donor &amp; Clinical Screening
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">First Name *</Label>
                <Input
                  required
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Last Name</Label>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Blood Group *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Age (18–65) *</Label>
                <Input
                  type="number"
                  required
                  min={18}
                  max={65}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Gender *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Phone Number *</Label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email Address</Label>
                <Input
                  type="email"
                  placeholder="donor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Clinical Screening Checks */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border space-y-2">
              <span className="font-bold text-[11px] block uppercase text-slate-700 dark:text-slate-300">
                Statutory Clinical Donor Eligibility Screening
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <Label className="text-[10px]">Weight (min 45 kg) *</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="text-xs h-8"
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Hb (min 12.5 g/dL) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.hemoglobin}
                    onChange={(e) => setFormData({ ...formData, hemoglobin: Number(e.target.value) })}
                    className="text-xs h-8"
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Blood Pressure</Label>
                  <Input
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    className="text-xs h-8 font-mono"
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Pulse (/min)</Label>
                  <Input
                    type="number"
                    value={formData.pulse}
                    onChange={(e) => setFormData({ ...formData, pulse: Number(e.target.value) })}
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Medical History &amp; Consent Confirmation</Label>
              <Input
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                className="text-xs"
              />
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
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? "Registering..." : "Register & Validate Eligibility"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
