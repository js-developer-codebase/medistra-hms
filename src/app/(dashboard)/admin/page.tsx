"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock,
  Users,
  UserPlus,
  Shield,
  ShieldPlus,
  Key,
  UserCheck,
  FileKey,
  RefreshCw,
  ArrowUpRight,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function AdminHubPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load administration telemetry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const adminModules = [
    {
      title: "User Directory",
      path: "/admin/users",
      icon: Users,
      desc: "Manage hospital staff, physicians, and administrative user accounts with branch associations.",
      badge: `${stats?.totalUsers || 0} Accounts`,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      title: "Add New User",
      path: "/admin/users/add",
      icon: UserPlus,
      desc: "Onboard new clinical or operational personnel with immediate role and department binding.",
      badge: "Onboarding",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    },
    {
      title: "User Sessions & Tokens",
      path: "/admin/sessions",
      icon: Laptop,
      desc: "Monitor active login sessions, terminal IP addresses, and revoke stale access tokens.",
      badge: `${stats?.activeSessions || 0} Live`,
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
    {
      title: "Role Management",
      path: "/admin/roles",
      icon: Shield,
      desc: "Maintain RBAC role hierarchies, access scopes, and granular module permissions.",
      badge: `${stats?.totalRoles || 0} Roles`,
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    },
    {
      title: "Create Custom Role",
      path: "/admin/roles/create",
      icon: ShieldPlus,
      desc: "Design custom role profiles with fine-grained CRUD authorization matrices.",
      badge: "RBAC Builder",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    },
    {
      title: "Permissions Matrix",
      path: "/admin/permissions",
      icon: Key,
      desc: "Comprehensive heatmap mapping all 21 hospital modules against defined user roles.",
      badge: "Heatmap View",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    },
    {
      title: "Role Assignments",
      path: "/admin/assignments",
      icon: UserCheck,
      desc: "Governance workstation to audit user privileges and perform bulk role re-assignments.",
      badge: "Governance",
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    },
    {
      title: "Security & Access Policies",
      path: "/admin/policies",
      icon: FileKey,
      desc: "Enforce password complexity, session idle timeouts, MFA policies, and IP whitelisting.",
      badge: `MFA: ${stats?.policies?.mfaPolicy || "ADMIN"}`,
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Administration & Governance Command Center
              </h1>
              <p className="text-muted-foreground text-sm">
                Centralized user management, role-based access control (RBAC), live sessions, and security policies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin/users/add">
            <Button size="sm" className="shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
          <Link href="/admin/roles/create">
            <Button variant="outline" size="sm">
              <ShieldPlus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </Link>
          <Link href="/admin/policies">
            <Button variant="outline" size="sm">
              <FileKey className="w-4 h-4 mr-2" />
              Security Policies
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total User Accounts
            </CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active: <span className="font-semibold text-emerald-600">{stats?.activeUsers || 0}</span> | Inactive: {stats?.inactiveUsers || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Defined Roles
            </CardTitle>
            <Shield className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {loading ? "..." : stats?.totalRoles || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Custom & System Super Admin Roles
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active User Sessions
            </CardTitle>
            <Laptop className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {loading ? "..." : stats?.activeSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Terminated/Revoked: {stats?.terminatedSessions || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Security Governance
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {loading ? "..." : `MFA: ${stats?.policies?.mfaPolicy || "ADMIN_ONLY"}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Timeout: {stats?.policies?.sessionTimeoutMinutes || 30}m | Pwd Expiry: {stats?.policies?.passwordExpiryDays || 90}d
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Administration Subsystems Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Administration & Security Subsystems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {adminModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.path} href={m.path} className="group">
                <Card className="h-full hover:border-primary/50 transition-all duration-200 hover:shadow-md cursor-pointer border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={m.badgeColor} variant="outline">
                        {m.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold pt-2 flex items-center justify-between">
                      {m.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {m.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent User Registrations */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent User Accounts</CardTitle>
            <CardDescription className="text-xs">
              Recently provisioned personnel credentials and institutional roles.
            </CardDescription>
          </div>
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="text-xs">
              View All Users <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading users...</div>
          ) : !stats?.recentUsers || stats.recentUsers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left font-medium py-2.5">User</th>
                    <th className="text-left font-medium py-2.5">Role</th>
                    <th className="text-left font-medium py-2.5">Organization</th>
                    <th className="text-left font-medium py-2.5">Status</th>
                    <th className="text-right font-medium py-2.5">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentUsers.map((u: any) => (
                    <tr key={u._id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-medium">
                        <div>{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {u.role?.role || "Staff"}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {u.organization?.organizationName || "Medistra Super Speciality"}
                      </td>
                      <td className="py-3">
                        <Badge variant={u.isActive ? "default" : "secondary"} className="text-[11px]">
                          {u.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
