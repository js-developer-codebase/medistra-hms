"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Scissors,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Edit2,
  CheckCircle2,
  Clock,
  Layers
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

export default function SurgicalTeamPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [teamForm, setTeamForm] = useState({
    surgeon: "",
    assistantSurgeon: "",
    anesthesiologist: "",
    scrubNurse: "",
    circulatingNurse: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ot/schedule");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      }
    } catch (err) {
      toast("Failed to load surgical team schedules", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditTeam = (s: any) => {
    setSelectedCase(s);
    setTeamForm({
      surgeon: s.surgeon || "",
      assistantSurgeon: s.assistantSurgeon || "",
      anesthesiologist: s.anesthesiologist || "",
      scrubNurse: s.scrubNurse || "",
      circulatingNurse: s.circulatingNurse || ""
    });
    setIsOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/ot/schedule/${selectedCase._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm)
      });
      const data = await res.json();

      if (data.success) {
        toast("Surgical team roster updated!", "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to update team roster", "error");
      }
    } catch (err) {
      toast("Error updating roster", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const pName = s.patientName || "";
      const surg = s.surgeryName || "";
      const doc = s.surgeon || "";
      const anesth = s.anesthesiologist || "";

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        surg.toLowerCase().includes(search.toLowerCase()) ||
        doc.toLowerCase().includes(search.toLowerCase()) ||
        anesth.toLowerCase().includes(search.toLowerCase());

      const matchesRoom = roomFilter === "ALL" || s.otRoom === roomFilter;
      return matchesSearch && matchesRoom;
    });
  }, [schedules, search, roomFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Surgical Team &amp; Theatre Staff Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consultant surgeons, surgical fellows, anesthetists, scrub nurses, and circulating nurse duty rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by surgeon, anesthetist, nurse, or surgery name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="ALL">All 5 OT Suites</option>
                <option value="OT 1 - Modular Cardiac OT">OT 1: Cardiac Suite</option>
                <option value="OT 2 - Neuro-Trauma OT">OT 2: Neuro Suite</option>
                <option value="OT 3 - Orthopedic & Joint Replacement OT">OT 3: Ortho Suite</option>
                <option value="OT 4 - Laparoscopic & GI OT">OT 4: Laparoscopic Suite</option>
                <option value="OT 5 - Emergency & Minor OT">OT 5: Daycare Suite</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600" />
            Theatre Personnel Assignments ({filtered.length} Procedures)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Surgery &amp; Room</TableHead>
                <TableHead>Lead Operating Surgeon</TableHead>
                <TableHead>Assistant Surgeon</TableHead>
                <TableHead>Consultant Anesthetist</TableHead>
                <TableHead>Scrub Nurse</TableHead>
                <TableHead>Circulating Nurse</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No surgical rosters found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {s.surgeryName}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {s.otRoom} • {s.time}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {s.surgeon}
                      </div>
                      <span className="text-[9px] text-slate-400">Lead Surgeon</span>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-700 dark:text-slate-300">
                        {s.assistantSurgeon || "Assigned On Duty"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {s.anesthesiologist || "Dr. Sunita Kapoor"}
                      </div>
                      <span className="text-[9px] text-slate-400">{s.anesthesiaType}</span>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-700 dark:text-slate-300">
                        {s.scrubNurse || "Sister Mary"}
                      </div>
                      <span className="text-[9px] text-teal-600 font-medium">Sterile Field</span>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-700 dark:text-slate-300">
                        {s.circulatingNurse || "Staff Nurse Praveen"}
                      </div>
                      <span className="text-[9px] text-slate-400">Non-Sterile / Log</span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTeam(s)}
                        className="h-7 text-xs px-2 text-amber-700 hover:text-amber-800"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Reassign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Roster Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Reassign Surgical Team Roster
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <form onSubmit={handleSaveTeam} className="space-y-4 pt-2 text-xs">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border">
                <span className="font-bold block text-slate-900 dark:text-white">
                  {selectedCase.surgeryName}
                </span>
                <span className="text-[10px] text-slate-500">
                  Patient: {selectedCase.patientName} • {selectedCase.otRoom}
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Primary Operating Surgeon *</Label>
                <Input
                  required
                  value={teamForm.surgeon}
                  onChange={(e) => setTeamForm({ ...teamForm, surgeon: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Assistant Surgeon / Fellow</Label>
                <Input
                  value={teamForm.assistantSurgeon}
                  onChange={(e) => setTeamForm({ ...teamForm, assistantSurgeon: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Consultant Anesthesiologist *</Label>
                <Input
                  required
                  value={teamForm.anesthesiologist}
                  onChange={(e) => setTeamForm({ ...teamForm, anesthesiologist: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Scrub Nurse *</Label>
                  <Input
                    required
                    value={teamForm.scrubNurse}
                    onChange={(e) => setTeamForm({ ...teamForm, scrubNurse: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Circulating Nurse *</Label>
                  <Input
                    required
                    value={teamForm.circulatingNurse}
                    onChange={(e) => setTeamForm({ ...teamForm, circulatingNurse: e.target.value })}
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
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {submitting ? "Updating..." : "Save Team Roster"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
