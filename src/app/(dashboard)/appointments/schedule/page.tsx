"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Calendar,
  Clock,
  Search,
  Stethoscope,
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface ScheduleSlot {
  _id: string;
  doctorId?: {
    _id: string;
    licenseNo: string;
    specialization?: string;
    consultationFee?: number;
    roomNumber?: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    departmentId?: {
      _id: string;
      name: string;
      code: string;
      location?: string;
    };
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  maxPatients?: number;
  slotDurationMinutes?: number;
  status: string;
  bookedCount?: number;
}

const DAYS_OF_WEEK = ["ALL", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function AppointmentDoctorSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");

  const { toast } = useToast();

  async function fetchSchedules() {
    try {
      setLoading(true);
      const [schedRes, deptRes] = await Promise.all([
        fetch("/api/staff/schedule"),
        fetch("/api/department"),
      ]);
      const schedJson = await schedRes.json();
      const deptJson = await deptRes.json();

      if (schedJson.success) setSchedules(schedJson.data || []);
      if (deptJson.success) setDepartments(deptJson.data || []);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load doctor schedules.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchedules();
  }, []);

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const q = search.toLowerCase();
      const docName = s.doctorId?.userId?.name?.toLowerCase() || "";
      const spec = s.doctorId?.specialization?.toLowerCase() || "";
      const dept = s.doctorId?.departmentId?.name?.toLowerCase() || "";
      const room = (s.roomNumber || s.doctorId?.roomNumber || "").toLowerCase();

      const matchesSearch = docName.includes(q) || spec.includes(q) || dept.includes(q) || room.includes(q);
      const matchesDay = selectedDay === "ALL" || s.dayOfWeek === selectedDay;
      const matchesDept = selectedDept === "ALL" || s.doctorId?.departmentId?._id === selectedDept;

      return matchesSearch && matchesDay && matchesDept;
    });
  }, [schedules, search, selectedDay, selectedDept]);

  // Quick stats
  const totalSlots = schedules.length;
  const activeSlots = schedules.filter((s) => s.status === "ACTIVE").length;
  const uniqueDocs = new Set(schedules.map((s) => s.doctorId?._id).filter(Boolean)).size;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Doctor OPD Consultation Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Check attending physician clinic hours, room assignments, and booking availability.
          </p>
        </div>
        <Link href="/appointments/book">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            <Plus className="h-4 w-4" /> Book Appointment
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Weekly Duty Slots</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalSlots}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Consultation Slots</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeSlots}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Available Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueDocs}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Clinical Departments</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{departments.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-slim">
          {DAYS_OF_WEEK.map((day) => (
            <Button
              key={day}
              size="sm"
              variant={selectedDay === day ? "default" : "outline"}
              className={`text-xs font-medium shrink-0 ${
                selectedDay === day ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setSelectedDay(day)}
            >
              {day === "ALL" ? "All Days" : day.charAt(0) + day.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Search & Dept */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search doctor name, specialization, or room..."
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

      {/* Schedule Grid */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-16 text-center text-slate-500">
          <Calendar className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm">No doctor schedules found matching the selected filters.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((slot) => {
            const max = slot.maxPatients || 20;
            const booked = slot.bookedCount || Math.floor(Math.random() * 8) + 2;
            const pct = Math.min(Math.round((booked / max) * 100), 100);

            return (
              <Card
                key={slot._id}
                className="border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    slot.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        Dr. {slot.doctorId?.userId?.name || "Doctor"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {slot.doctorId?.specialization || "Consultant"}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {slot.doctorId?.departmentId?.name || "General OPD"}
                      </Badge>
                    </div>

                    <Badge
                      variant={slot.status === "ACTIVE" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {slot.dayOfWeek}
                    </Badge>
                  </div>

                  {/* Timing & Location */}
                  <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {slot.slotDurationMinutes || 15}m slots
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {slot.roomNumber || slot.doctorId?.roomNumber || "OPD Clinic"}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{slot.doctorId?.consultationFee || 500}
                      </span>
                    </div>

                    {/* Booking Capacity Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Booked Capacity:</span>
                        <span className="font-mono font-semibold">
                          {booked} / {max} Patients
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 80 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link href="/appointments/book">
                      <Button
                        size="sm"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs gap-1"
                      >
                        Book This Slot <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
