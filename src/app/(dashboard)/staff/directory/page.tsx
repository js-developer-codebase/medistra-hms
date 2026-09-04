"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookUser,
  Search,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Building2,
  Users,
  Eye,
  LayoutGrid,
  List,
  Printer,
  Copy,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface DirectoryEntry {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  category: "Doctors" | "Nurses" | "Diagnostics" | "Pharmacy" | "Administration" | "Other";
  department: string;
  departmentId?: string;
  designation: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  shift?: string;
  roomNumber?: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  type: "DOCTOR" | "STAFF";
  avatar?: string;
}

const CATEGORY_TABS = [
  { key: "ALL", label: "All Personnel", icon: Users },
  { key: "Doctors", label: "Doctors", icon: Stethoscope },
  { key: "Nurses", label: "Nurses", icon: HeartPulse },
  { key: "Diagnostics", label: "Diagnostics & Lab", icon: FlaskConical },
  { key: "Pharmacy", label: "Pharmacy", icon: Building2 },
  { key: "Administration", label: "Administration", icon: Building2 },
];

export default function StaffDirectoryPage() {
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Profile Modal
  const [selectedPerson, setSelectedPerson] = useState<DirectoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();

  async function fetchDirectoryData() {
    try {
      setLoading(true);
      const [dirRes, deptRes] = await Promise.all([
        fetch("/api/staff/directory"),
        fetch("/api/department"),
      ]);
      const dirJson = await dirRes.json();
      const deptJson = await deptRes.json();

      if (dirJson.success) setDirectory(dirJson.data || []);
      if (deptJson.success) setDepartments(deptJson.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load staff directory.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  const filtered = useMemo(() => {
    return directory.filter((item) => {
      const q = search.toLowerCase();
      const name = item.name.toLowerCase();
      const email = item.email.toLowerCase();
      const phone = (item.phone || "").toLowerCase();
      const role = item.role.toLowerCase();
      const dept = item.department.toLowerCase();
      const desig = item.designation.toLowerCase();

      const matchesSearch =
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        role.includes(q) ||
        dept.includes(q) ||
        desig.includes(q);

      const matchesCategory =
        activeCategory === "ALL" ||
        item.category.toLowerCase() === activeCategory.toLowerCase();

      const matchesDept =
        selectedDept === "ALL" ||
        item.departmentId === selectedDept ||
        item.department === selectedDept;

      return matchesSearch && matchesCategory && matchesDept;
    });
  }, [directory, search, activeCategory, selectedDept]);

  // Quick stats
  const totalCount = directory.length;
  const docCount = directory.filter((d) => d.category === "Doctors").length;
  const nurseCount = directory.filter((d) => d.category === "Nurses").length;
  const diagCount = directory.filter((d) => d.category === "Diagnostics" || d.category === "Pharmacy").length;

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Personnel Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Contact directory, extension book, physician roster, and nursing staff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 text-xs"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Print Directory
          </Button>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 shadow-xs text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 shadow-xs text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <BookUser className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Directory Records</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Medical Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{docCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Nursing Staff</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{nurseCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Diagnostics & Pharmacy</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{diagCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-slim">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.key;
            return (
              <Button
                key={tab.key}
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={`text-xs gap-1.5 shrink-0 ${
                  isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                }`}
                onClick={() => setActiveCategory(tab.key)}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, phone, designation, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs w-full sm:w-60"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-12 text-center text-slate-500">
          <BookUser className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm">No hospital personnel found matching your filters.</p>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((person) => {
            const isDoc = person.type === "DOCTOR";
            return (
              <Card
                key={person.id}
                className="border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isDoc ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg text-white shadow-xs ${
                          isDoc ? "bg-emerald-600" : "bg-blue-600"
                        }`}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {isDoc ? `Dr. ${person.name}` : person.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{person.designation}</p>
                      </div>
                    </div>
                    <Badge variant={person.status === "ACTIVE" ? "default" : "outline"} className="text-[10px]">
                      {person.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {person.department}
                      </span>
                      {person.roomNumber && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {person.roomNumber}
                        </span>
                      )}
                    </div>

                    {person.email && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <a
                          href={`mailto:${person.email}`}
                          className="flex items-center gap-1.5 hover:text-emerald-600 truncate max-w-[200px]"
                        >
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{person.email}</span>
                        </a>
                        <button
                          onClick={() => copyToClipboard(person.email, "Email")}
                          title="Copy Email"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {person.phone && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <a
                          href={`tel:${person.phone}`}
                          className="flex items-center gap-1.5 hover:text-emerald-600"
                        >
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{person.phone}</span>
                        </a>
                        <button
                          onClick={() => copyToClipboard(person.phone!, "Phone")}
                          title="Copy Phone"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 gap-1 text-slate-600 hover:text-emerald-600"
                      onClick={() => {
                        setSelectedPerson(person);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" /> View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category & Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location / Extension</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((person) => (
                  <TableRow key={person.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {person.type === "DOCTOR" ? `Dr. ${person.name}` : person.name}
                      </div>
                      <div className="text-xs text-slate-500">{person.designation}</div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {person.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {person.department}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {person.roomNumber || "Main Hospital"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        {person.email}
                      </div>
                      {person.phone && (
                        <div className="text-[11px] text-slate-500">{person.phone}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={person.status === "ACTIVE" ? "default" : "outline"} className="text-xs">
                        {person.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                        onClick={() => {
                          setSelectedPerson(person);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* PERSON DETAIL MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          {selectedPerson && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl font-bold text-xl text-white ${
                      selectedPerson.type === "DOCTOR" ? "bg-emerald-600" : "bg-blue-600"
                    }`}
                  >
                    {selectedPerson.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">
                      {selectedPerson.type === "DOCTOR" ? `Dr. ${selectedPerson.name}` : selectedPerson.name}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedPerson.designation} • {selectedPerson.department}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-2.5 py-2 text-sm border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Staff Category</span>
                  <Badge variant="outline">{selectedPerson.category}</Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPerson.department}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Work Location</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPerson.roomNumber || "Main Building"}</span>
                </div>
                {selectedPerson.qualification && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Qualifications</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPerson.qualification}</span>
                  </div>
                )}
                {selectedPerson.shift && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Work Shift</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPerson.shift}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email Address</span>
                  <a href={`mailto:${selectedPerson.email}`} className="font-medium text-emerald-600 hover:underline">
                    {selectedPerson.email}
                  </a>
                </div>
                {selectedPerson.phone && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Direct Phone</span>
                    <a href={`tel:${selectedPerson.phone}`} className="font-medium text-emerald-600 hover:underline">
                      {selectedPerson.phone}
                    </a>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status</span>
                  <Badge variant={selectedPerson.status === "ACTIVE" ? "default" : "secondary"}>
                    {selectedPerson.status}
                  </Badge>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between items-center gap-2">
                <div className="flex gap-2 w-full sm:w-auto">
                  {selectedPerson.email && (
                    <a href={`mailto:${selectedPerson.email}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </Button>
                    </a>
                  )}
                  {selectedPerson.phone && (
                    <a href={`tel:${selectedPerson.phone}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <Phone className="h-3.5 w-3.5" /> Call
                      </Button>
                    </a>
                  )}
                </div>
                <Button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto text-xs">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
