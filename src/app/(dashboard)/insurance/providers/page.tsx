"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Add Provider Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("INSURER");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [tollFreeNumber, setTollFreeNumber] = useState("");
  const [email, setEmail] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [address, setAddress] = useState("");
  const [slaDays, setSlaDays] = useState<number>(30);
  const [cashlessEmpaneled, setCashlessEmpaneled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/insurance/providers");
      const data = await res.json();
      if (data.success) {
        setProviders(data.data || []);
      } else {
        toast(data.message || "Failed to fetch insurance providers", "error");
      }
    } catch (err: any) {
      toast("Error fetching providers: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Provider name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/insurance/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code: code || name.toUpperCase().replace(/\s+/g, '-').slice(0, 15),
          type,
          contactPerson,
          contactNumber,
          tollFreeNumber,
          email,
          portalUrl,
          address,
          slaDays,
          cashlessEmpaneled,
          active: true
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Insurance provider empanelled successfully!", "success");
        setShowAddModal(false);
        setName("");
        setCode("");
        setContactPerson("");
        setContactNumber("");
        setEmail("");
        setPortalUrl("");
        setAddress("");
        fetchProviders();
      } else {
        toast(data.message || "Failed to add provider", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProviders = providers.filter((p) => {
    if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const pName = (p.name || "").toLowerCase();
    const pCode = (p.code || "").toLowerCase();
    const pContact = (p.contactPerson || "").toLowerCase();
    return pName.includes(q) || pCode.includes(q) || pContact.includes(q);
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Link href="/insurance">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insurance Providers & TPAs</h1>
            <p className="text-sm text-muted-foreground">
              Empanelled healthcare insurers, third-party administrators (TPAs), cashless SLAs & claim portals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchProviders} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Empanel New Partner
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search insurance company or TPA by Name, Code, or Contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">All Partner Types</option>
                <option value="INSURER">Direct Insurance Companies</option>
                <option value="TPA">Third Party Administrators (TPAs)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers Grid / Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Provider / TPA</th>
                  <th className="py-3 px-4 font-semibold">Payer Code</th>
                  <th className="py-3 px-4 font-semibold">Partner Type</th>
                  <th className="py-3 px-4 font-semibold text-center">Cashless Empaneled</th>
                  <th className="py-3 px-4 font-semibold">Contact Person & Phone</th>
                  <th className="py-3 px-4 font-semibold">Toll-Free / Email</th>
                  <th className="py-3 px-4 font-semibold text-center">SLA Benchmark</th>
                  <th className="py-3 px-4 font-semibold text-center">TPA Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((p: any) => (
                    <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">{p.address || "Kolkata & Pan-India Operations"}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {p.code || "TPA-GEN"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={p.type === "TPA" ? "secondary" : "outline"} className="text-[10px]">
                          {p.type === "TPA" ? "Third Party Admin (TPA)" : "Direct Insurer"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.cashlessEmpaneled !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" /> Cashless Active
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[10px] font-medium">Reimbursement Only</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{p.contactPerson || "Hospital Desk"}</p>
                        <p className="text-muted-foreground text-[10px]">{p.contactNumber || "+91 1800-XXX-XXXX"}</p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <p>{p.tollFreeNumber || "1800-425-2255"}</p>
                        <p className="text-[10px]">{p.email || "claims@tpa.com"}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {p.slaDays || 30} Days
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.portalUrl ? (
                          <a
                            href={p.portalUrl.startsWith("http") ? p.portalUrl : `https://${p.portalUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            Portal <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">E-Portal</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading insurance partners..." : "No insurance partners empaneled yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empanel Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Empanel Insurance Partner / TPA
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleAddProvider} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Company / TPA Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Star Health and Allied Insurance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Payer Code</label>
                  <Input
                    type="text"
                    placeholder="e.g. STAR-HEALTH"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Partner Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="INSURER">Direct Insurance Company</option>
                    <option value="TPA">Third Party Administrator (TPA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Contact Person</label>
                  <Input
                    type="text"
                    placeholder="Hospital Relationship Manager"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Contact Number</label>
                  <Input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Toll-Free Helpline</label>
                  <Input
                    type="text"
                    placeholder="1800-XXX-XXXX"
                    value={tollFreeNumber}
                    onChange={(e) => setTollFreeNumber(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Official Claims Email</label>
                  <Input
                    type="email"
                    placeholder="claims@insurer.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Claims Portal URL</label>
                  <Input
                    type="text"
                    placeholder="https://tpa.portal.com"
                    value={portalUrl}
                    onChange={(e) => setPortalUrl(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">SLA Settlement Days</label>
                  <Input
                    type="number"
                    min="7"
                    max="90"
                    value={slaDays}
                    onChange={(e) => setSlaDays(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cashlessEmpaneled"
                  checked={cashlessEmpaneled}
                  onChange={(e) => setCashlessEmpaneled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="cashlessEmpaneled" className="font-medium cursor-pointer">
                  Hospital is Empaneled for Cashless Hospitalization with this Partner
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting ? "Saving..." : "Empanel Partner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
