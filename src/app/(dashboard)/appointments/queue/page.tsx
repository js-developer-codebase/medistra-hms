"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Volume2,
  Tv,
  ArrowRight,
  Loader2,
  Stethoscope,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface QueueItem {
  _id: string;
  patientId?: {
    _id: string;
    name: string;
    contact: string;
    uhid?: string;
    age?: number;
    gender?: string;
  };
  doctorId?: {
    _id: string;
    userId?: {
      name: string;
    };
    name?: string;
    specialization?: string;
    roomNumber?: string;
  };
  tokenNumber?: string;
  status: string;
  queueStatus?: string;
  priority?: string;
  appointmentTime: string;
  reason: string;
  checkedInAt?: string;
  consultationStartedAt?: string;
}

export default function AppointmentQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalToday: 0,
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    estimatedWaitTimeMins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [tvMode, setTvMode] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { toast } = useToast();

  async function fetchQueue() {
    try {
      setLoading(true);
      const url =
        selectedDoctor && selectedDoctor !== "ALL"
          ? `/api/appointments/queue?doctorId=${selectedDoctor}`
          : "/api/appointments/queue";

      const [qRes, dRes] = await Promise.all([fetch(url), fetch("/api/doctor")]);
      const qJson = await qRes.json();
      const dJson = await dRes.json();

      if (qJson.success) {
        setQueue(qJson.data || []);
        if (qJson.metrics) setMetrics(qJson.metrics);
      }
      if (dJson.success) setDoctors(dJson.data || []);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load queue.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueue();
    // Auto-refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [selectedDoctor]);

  // Advance queue state
  const handleQueueAction = async (appointmentId: string, action: string) => {
    try {
      setProcessingId(appointmentId);
      const res = await fetch("/api/appointments/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Queue Updated", description: `Patient moved to ${action.replace("_", " ")}.` });
        fetchQueue();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // Group queue by stages
  const waitingList = queue.filter(
    (q) => q.queueStatus === "WAITING" || q.status === "CHECKED_IN" || q.status === "SCHEDULED"
  );
  const inConsultationList = queue.filter(
    (q) => q.queueStatus === "IN_CONSULTATION" || q.status === "IN_PROGRESS"
  );
  const completedList = queue.filter(
    (q) => q.queueStatus === "COMPLETED" || q.status === "COMPLETED"
  );

  // Active consulting patient
  const currentServing = inConsultationList[0] || null;
  const nextInLine = waitingList[0] || null;

  // TV Display Mode Fullscreen
  if (tvMode) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white p-8 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-xl text-black">
              M
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Medistra Hospital OPD</h1>
              <p className="text-sm text-slate-400">Live Outpatient Queue & Token Board</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setTvMode(false)} className="text-xs bg-slate-900 border-slate-700 text-white">
            Exit TV Mode
          </Button>
        </div>

        {/* Big TV Token Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
          {/* NOW SERVING */}
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl flex flex-col justify-center items-center space-y-4">
            <span className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">
              Now Serving in Room
            </span>
            <div className="text-8xl font-black font-mono tracking-tight text-emerald-400">
              {currentServing?.tokenNumber || "---"}
            </div>
            <div className="text-3xl font-bold text-white">
              {currentServing?.patientId?.name || "Consultation Room Idle"}
            </div>
            <p className="text-lg text-slate-400">
              {currentServing
                ? `Dr. ${currentServing.doctorId?.userId?.name || currentServing.doctorId?.name} • Room ${
                    currentServing.doctorId?.roomNumber || "OPD"
                  }`
                : "Awaiting next patient call"}
            </p>
          </div>

          {/* NEXT IN LINE */}
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-8 text-center shadow-2xl flex flex-col justify-center items-center space-y-4">
            <span className="text-sm font-semibold tracking-widest text-blue-400 uppercase">
              Next Token In Line
            </span>
            <div className="text-8xl font-black font-mono tracking-tight text-blue-400">
              {nextInLine?.tokenNumber || "---"}
            </div>
            <div className="text-3xl font-bold text-white">
              {nextInLine?.patientId?.name || "No Patients in Queue"}
            </div>
            <p className="text-lg text-slate-400">Please be seated near consultation room</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-slate-400 text-sm">
          <span>Patients Waiting: {waitingList.length}</span>
          <span>Consultations Completed Today: {completedList.length}</span>
          <span>Time: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            OPD Token Queue & Waiting Room
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time outpatient caller, consultation room progression, and token tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTvMode(true)}
            className="gap-1.5 text-xs border-slate-300 dark:border-slate-700"
          >
            <Tv className="h-3.5 w-3.5 text-emerald-600" /> Waiting Room TV Mode
          </Button>
          <Button variant="outline" size="sm" onClick={fetchQueue} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Today</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalToday}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Waiting in Reception</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.waiting}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">In Consultation</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.inConsultation}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Completed Today</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.completed}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Filter Clinic Queue:</span>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-xs min-w-[240px]"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="ALL">All Consulting Doctors</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              Dr. {d.userId?.name || "Doctor"} ({d.specialization || "OPD"})
            </option>
          ))}
        </select>
      </div>

      {/* Control Banner: Current Serving & Next in Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Active Consultation */}
        <Card className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Now Inside with Doctor
              </span>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-sm px-2.5 py-0.5">
                {currentServing?.tokenNumber || "No Active"}
              </Badge>
            </div>

            {currentServing ? (
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentServing.patientId?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dr. {currentServing.doctorId?.userId?.name || currentServing.doctorId?.name} • Room{" "}
                  {currentServing.doctorId?.roomNumber || "OPD"}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-2">
                  Complaint: {currentServing.reason}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4">Physician is ready for the next patient.</p>
            )}

            {currentServing && (
              <div className="flex gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-800/40">
                <Button
                  size="sm"
                  onClick={() => handleQueueAction(currentServing._id, "COMPLETE")}
                  disabled={processingId === currentServing._id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 flex-1"
                >
                  <CheckCircle2 className="h-4 w-4" /> Complete Consultation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQueueAction(currentServing._id, "SKIP")}
                  disabled={processingId === currentServing._id}
                  className="text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  Skip
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Patient in Line */}
        <Card className="border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Next in Line
              </span>
              <Badge variant="outline" className="font-mono text-sm px-2.5 py-0.5 border-blue-400 text-blue-700 dark:text-blue-300">
                {nextInLine?.tokenNumber || "Queue Empty"}
              </Badge>
            </div>

            {nextInLine ? (
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {nextInLine.patientId?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dr. {nextInLine.doctorId?.userId?.name || nextInLine.doctorId?.name} • Scheduled:{" "}
                  {nextInLine.appointmentTime}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-2">
                  Complaint: {nextInLine.reason}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4">No waiting patients in queue.</p>
            )}

            {nextInLine && (
              <div className="pt-2 border-t border-blue-100 dark:border-blue-800/40">
                <Button
                  size="sm"
                  onClick={() => handleQueueAction(nextInLine._id, "START_CONSULTATION")}
                  disabled={processingId === nextInLine._id}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 w-full"
                >
                  <Play className="h-4 w-4" /> Call Next Patient Inside
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queue Columns (Waiting, In Consultation, Completed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Waiting Room */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" /> Waiting Room ({waitingList.length})
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">In Line</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 max-h-[500px] overflow-y-auto">
            {waitingList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Waiting area is clear</p>
            ) : (
              waitingList.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {item.tokenNumber || "T-??"}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.appointmentTime}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">
                    {item.patientId?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{item.reason}</div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleQueueAction(item._id, "START_CONSULTATION")}
                      className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Call Inside <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Column 2: In Consultation */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-500" /> With Physician ({inConsultationList.length})
              </CardTitle>
              <Badge className="bg-emerald-600 text-white text-[10px]">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 max-h-[500px] overflow-y-auto">
            {inConsultationList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No active consultations</p>
            ) : (
              inConsultationList.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-emerald-600 text-white px-2 py-0.5 rounded">
                      {item.tokenNumber}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium animate-pulse">
                      In Progress
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">
                    {item.patientId?.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dr. {item.doctorId?.userId?.name || item.doctorId?.name}
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleQueueAction(item._id, "COMPLETE")}
                      className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      ✓ Mark Completed
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Column 3: Completed Today */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500" /> Finished Today ({completedList.length})
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">Discharged</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 max-h-[500px] overflow-y-auto">
            {completedList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No completed visits yet today</p>
            ) : (
              completedList.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 opacity-80"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {item.tokenNumber}
                    </span>
                    <Badge variant="default" className="text-[9px] bg-purple-600">Completed</Badge>
                  </div>
                  <div className="font-medium text-xs text-slate-900 dark:text-white">
                    {item.patientId?.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dr. {item.doctorId?.userId?.name || item.doctorId?.name}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
