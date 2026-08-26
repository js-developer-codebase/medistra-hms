"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Loader2, Plus, Calendar, User, CheckCircle, ClipboardList, Trash2, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Bengali name and Kolkata localized dummy defaults for placeholders
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedBy: "",
    patientId: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    status: "PENDING" as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    dueDate: "",
    department: "Nursing",
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch Tasks
      const tasksRes = await fetch("/api/dashboard/tasks");
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        setTasks(tasksData.data);
      }

      // Fetch Staff Users
      const staffRes = await fetch("/api/user");
      const staffData = await staffRes.json();
      if (staffData.success) {
        setStaff(staffData.data);
        // Default assignedBy to the first staff member if available (or active user)
        if (staffData.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            assignedBy: staffData.data[0]._id,
            assignedTo: staffData.data[0]._id,
          }));
        }
      }

      // Fetch Patients
      const patientsRes = await fetch("/api/patient");
      const patientsData = await patientsRes.json();
      if (patientsData.success) {
        setPatients(patientsData.data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo || !formData.assignedBy || !formData.dueDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Task Created",
          description: "Hospital task successfully assigned.",
          variant: "success",
        });
        setIsDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          assignedTo: staff[0]?._id || "",
          assignedBy: staff[0]?._id || "",
          patientId: "",
          priority: "MEDIUM",
          status: "PENDING",
          dueDate: "",
          department: "Nursing",
        });
        fetchInitialData();
      } else {
        toast({
          title: "Submission Failed",
          description: data.message,
          variant: "error",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error submitting task",
        description: error.message,
        variant: "error",
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/dashboard/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Status Updated",
          description: `Task status set to ${newStatus}.`,
          variant: "success",
        });
        fetchInitialData();
      } else {
        toast({
          title: "Update Failed",
          description: data.message,
          variant: "error",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "error",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/dashboard/tasks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Task Deleted",
          description: "Task removed from schedule.",
          variant: "success",
        });
        fetchInitialData();
      } else {
        toast({
          title: "Delete Failed",
          description: data.message,
          variant: "error",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "error",
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Critical</Badge>;
      case "HIGH":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">High</Badge>;
      case "MEDIUM":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-emerald-500 font-semibold";
      case "IN_PROGRESS":
        return "text-blue-500 font-semibold";
      case "CANCELLED":
        return "text-slate-400 line-through";
      default:
        return "text-amber-500 font-semibold";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Task Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign duties, monitor clinical statuses, and handle ward care checklists.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm gap-2">
              <Plus className="h-4 w-4" />
              Assign New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-slate-900 text-slate-100 border border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Assign Hospital Duty</DialogTitle>
              <DialogDescription className="text-slate-400">
                Designate medical duties, nursing instructions, or general tasks to staff.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-slate-300">Task Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Administer ECG or check vitals"
                  required
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-slate-300">Detailed Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Take reading for Bed 4 patient in ward block 2"
                  rows={2}
                  className="w-full text-sm rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="assignedTo" className="text-slate-300">Assigned To *</Label>
                  <Select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => handleSelectChange("assignedTo", e.target.value)}
                    required
                  >
                    {staff.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({typeof u.role === "object" ? u.role?.role : (u.role || "Staff")})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="department" className="text-slate-300">Department</Label>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={(e) => handleSelectChange("department", e.target.value)}
                  >
                    <option value="Nursing">Nursing</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Administration">Administration</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="patientId" className="text-slate-300">Related Patient (Optional)</Label>
                <Select
                  name="patientId"
                  value={formData.patientId}
                  onChange={(e) => handleSelectChange("patientId", e.target.value)}
                >
                  <option value="">-- None --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.contact || "No Contact"})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="priority" className="text-slate-300">Priority</Label>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => handleSelectChange("priority", e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dueDate" className="text-slate-300">Due Date & Time *</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Assign Duty
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Quick Stats Panel */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {tasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {tasks.filter(t => t.priority === "CRITICAL" && t.status !== "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {tasks.filter(t => t.status === "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Total Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-350">{tasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-500" />
            Duty Schedule List
          </CardTitle>
          <CardDescription>
            Live view of tasks assigned across departments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin w-8 h-8 text-emerald-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No hospital tasks currently scheduled. Assign a task to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Duty / Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Patient Link</TableHead>
                  <TableHead>Dept.</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell className="max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {task.assignedTo?.name || "Unassigned"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.patientId ? (
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {task.patientId.name}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-semibold py-0.5">
                        {task.department || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(task.dueDate).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {task.status !== "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(task._id, "COMPLETED")}
                          className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2.5 gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </Button>
                      )}
                      {task.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(task._id, "IN_PROGRESS")}
                          className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2.5"
                        >
                          Start
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task._id)}
                        className="h-8 w-8 text-destructive hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
