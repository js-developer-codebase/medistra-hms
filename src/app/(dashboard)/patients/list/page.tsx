"use client";

import { useState, useEffect } from "react";
import Link from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Plus } from "lucide-react";

export default function PatientsListPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch("/api/patient");
        const data = await response.json();
        
        if (response.ok && data.success) {
          setPatients(data.data);
        } else {
          toast(data.message || "Failed to fetch patients", "error");
        }
      } catch (error) {
        toast("An error occurred while fetching patients", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, [toast]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage your patients and their details.</p>
        </div>
        <Button onClick={() => window.location.href = '/patients/register'}>
          <Plus className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No patients found. Click &apos;Add Patient&apos; to register one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Age / Gender</th>
                  <th className="px-6 py-3 font-medium">Blood Group</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{patient.name}</td>
                    <td className="px-6 py-4">{patient.contact}</td>
                    <td className="px-6 py-4">{patient.age} / {patient.gender}</td>
                    <td className="px-6 py-4">{patient.bloodGroup}</td>
                    <td className="px-6 py-4">
                      {patient.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
