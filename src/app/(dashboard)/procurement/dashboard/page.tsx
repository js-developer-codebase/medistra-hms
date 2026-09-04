"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  RefreshCw,
  IndianRupee,
  Building2,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function ProcurementDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, requestsRes] = await Promise.all([
        fetch("/api/procurement/stats"),
        fetch("/api/procurement/purchase-orders"),
        fetch("/api/procurement/requests")
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      const ordersData = await ordersRes.json();
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);

      const requestsData = await requestsRes.json();
      if (requestsData.success) {
        setRecentRequests((requestsData.data || []).slice(0, 5));
      }
    } catch (err: any) {
      toast(err.message || "Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const poDist = stats?.poStatusDistribution || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Procurement Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time procurement expenditure, order fulfillment pipeline, and hospital vendor commitments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/procurement/orders">
            <Button size="sm" className="text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white">
              <FileCheck2 className="h-3.5 w-3.5" />
              Manage Purchase Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Approved Procurement Spend</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {(stats?.totalSpend || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Committed budget in ₹</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Suppliers</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats?.activeSuppliersCount || 0}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Approved medical vendors</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending Indents</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {stats?.pendingRequestsCount || 0}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Requisitions awaiting review</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accounts Payable Due</p>
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {(stats?.unpaidLiability || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{stats?.unpaidInvoicesCount || 0} vendor bills pending</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PO Pipeline Status Distribution */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Purchase Order Pipeline Health
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border text-center">
              <span className="text-[10px] font-medium text-slate-500 uppercase">Draft Orders</span>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">
                {poDist.DRAFT || 0}
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 uppercase">Pending Approval</span>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {poDist.PENDING || 0}
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
              <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 uppercase">Approved / Active</span>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {poDist.APPROVED || 0}
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 uppercase">Completed / Delivered</span>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {poDist.COMPLETED || 0}
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
              <span className="text-[10px] font-medium text-rose-700 dark:text-rose-300 uppercase">Cancelled</span>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {poDist.CANCELLED || 0}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Section: Recent Orders & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-blue-600" />
              Recent Purchase Orders
            </CardTitle>
            <Link href="/procurement/orders" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                      No purchase orders recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((po) => (
                    <TableRow key={po._id}>
                      <TableCell className="font-mono font-bold text-blue-600">
                        {po.poNumber}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                        {po.supplierName}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(po.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            po.status === "APPROVED"
                              ? "bg-blue-600 text-white"
                              : po.status === "COMPLETED"
                              ? "bg-emerald-600 text-white"
                              : po.status === "PENDING"
                              ? "bg-amber-600 text-white"
                              : "bg-slate-500 text-white"
                          }`}
                        >
                          {po.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Purchase Requests */}
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Recent Department Indents (PR)
            </CardTitle>
            <Link href="/procurement/requests" className="text-xs text-amber-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>PR Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Estimated (₹)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                      No purchase requests pending.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentRequests.map((pr) => (
                    <TableRow key={pr._id}>
                      <TableCell className="font-mono font-bold text-amber-700 dark:text-amber-400">
                        {pr.prNumber}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                        {pr.department}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-slate-900 dark:text-white">
                        ₹{(pr.totalEstimatedAmount || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            pr.status === "APPROVED"
                              ? "border-emerald-500 text-emerald-600"
                              : pr.status === "PO_CREATED"
                              ? "border-blue-500 text-blue-600"
                              : "border-amber-500 text-amber-600"
                          }`}
                        >
                          {pr.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
