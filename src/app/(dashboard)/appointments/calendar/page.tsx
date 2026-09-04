"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface AppointmentItem {
  _id: string;
  patientId?: {
    _id: string;
    name: string;
    contact: string;
    uhid?: string;
  };
  doctorId?: {
    _id: string;
    userId?: {
      name: string;
      email?: string;
    };
    name?: string;
    specialization?: string;
    departmentId?: {
      name: string;
    };
    roomNumber?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber?: string;
  status: string;
  type: string;
  priority?: string;
  reason: string;
  consultationFee?: number;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppointmentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Modal for appointment details
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();

  async function fetchData() {
    try {
      setLoading(true);
      const [apptRes, docRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/doctor"),
      ]);
      const apptJson = await apptRes.json();
      const docJson = await docRes.json();

      if (apptJson.success) setAppointments(apptJson.data || []);
      if (docJson.success) setDoctors(docJson.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load calendar appointments.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDoc =
        selectedDoctor === "ALL" ||
        apt.doctorId?._id === selectedDoctor;
      const matchesStatus =
        selectedStatus === "ALL" || apt.status === selectedStatus;
      return matchesDoc && matchesStatus;
    });
  }, [appointments, selectedDoctor, selectedStatus]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix (42 cells: 6 weeks)
  const calendarCells = useMemo(() => {
    const cells = [];
    // Previous month filler
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }
    // Next month filler
    const remaining = 42 - cells.length;
    for (let n = 1; n <= remaining; n++) {
      cells.push({
        date: new Date(year, month + 1, n),
        isCurrentMonth: false,
      });
    }
    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, prevMonthDays]);

  // Map appointments by date string YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, AppointmentItem[]> = {};
    filteredAppointments.forEach((apt) => {
      const dateKey = new Date(apt.appointmentDate).toISOString().split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(apt);
    });
    return map;
  }, [filteredAppointments]);

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const todayKey = new Date().toISOString().split("T")[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "IN_PROGRESS":
      case "CHECKED_IN":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "CONFIRMED":
      case "SCHEDULED":
        return "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "CANCELLED":
      case "NO_SHOW":
        return "bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Appointment Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monthly and weekly overview of scheduled physician consultations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/appointments/book">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              <Plus className="h-4 w-4" /> Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation & Filter Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white min-w-[180px]">
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs px-2.5" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="ALL">All Doctors</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.userId?.name || "Doctor"}
                </option>
              ))}
            </select>

            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[768px]">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="py-2.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 42 Date Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
                {calendarCells.map((cell, idx) => {
                  const dateStr = cell.date.toISOString().split("T")[0];
                  const dayAppts = appointmentsByDate[dateStr] || [];
                  const isToday = dateStr === todayKey;

                  return (
                    <div
                      key={idx}
                      className={`min-h-[110px] p-1.5 transition-colors flex flex-col justify-between ${
                        cell.isCurrentMonth
                          ? isToday
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                            : "bg-white dark:bg-slate-950"
                          : "bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            isToday
                              ? "bg-emerald-600 text-white font-bold"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                        {dayAppts.length > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">
                            {dayAppts.length} appts
                          </span>
                        )}
                      </div>

                      {/* Appointment List Preview */}
                      <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[75px] scrollbar-slim">
                        {dayAppts.slice(0, 3).map((apt) => (
                          <div
                            key={apt._id}
                            onClick={() => {
                              setSelectedAppt(apt);
                              setIsModalOpen(true);
                            }}
                            className={`p-1 rounded text-[10px] font-medium border cursor-pointer hover:shadow-xs transition-shadow truncate ${getStatusColor(
                              apt.status
                            )}`}
                          >
                            <span className="font-bold mr-1">{apt.appointmentTime}</span>
                            <span>{apt.patientId?.name || "Patient"}</span>
                          </div>
                        ))}
                        {dayAppts.length > 3 && (
                          <div
                            onClick={() => {
                              setSelectedAppt(dayAppts[3]);
                              setIsModalOpen(true);
                            }}
                            className="text-[10px] text-slate-500 font-medium cursor-pointer hover:underline text-center"
                          >
                            +{dayAppts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* APPOINTMENT DETAIL MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          {selectedAppt && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs font-semibold">
                    {selectedAppt.tokenNumber || "Token Pending"}
                  </Badge>
                  <Badge
                    variant={
                      selectedAppt.status === "COMPLETED"
                        ? "default"
                        : selectedAppt.status === "CANCELLED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedAppt.status}
                  </Badge>
                </div>
                <DialogTitle className="text-lg mt-2">
                  {selectedAppt.patientId?.name}
                </DialogTitle>
                <DialogDescription>
                  UHID: {selectedAppt.patientId?.uhid || "MED-PENDING"} • Phone: {selectedAppt.patientId?.contact}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2.5 py-2 text-sm border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Doctor</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Dr. {selectedAppt.doctorId?.userId?.name || selectedAppt.doctorId?.name || "Doctor"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Specialty & Room</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedAppt.doctorId?.specialization || "OPD"} • Room {selectedAppt.doctorId?.roomNumber || "101"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Date & Timing</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedAppt.appointmentDate).toLocaleDateString()} at {selectedAppt.appointmentTime}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Reason for Visit</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedAppt.reason}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">₹{selectedAppt.consultationFee || 500}</span>
                </div>
              </div>

              <DialogFooter className="flex justify-between gap-2">
                <Link href="/appointments/reschedule" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Reschedule
                  </Button>
                </Link>
                <Button onClick={() => setIsModalOpen(false)} size="sm" className="text-xs">
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
