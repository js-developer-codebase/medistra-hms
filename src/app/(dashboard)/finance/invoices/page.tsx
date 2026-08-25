"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("/api/invoice");
        const data = await response.json();
        if (data.success) {
          setInvoices(data.data);
        } else {
          toast(data.message || "Failed to fetch invoices", "error");
        }
      } catch (error) {
        toast("An error occurred while fetching invoices", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [toast]);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell>{invoice._id}</TableCell>
                      <TableCell>{invoice.patientId}</TableCell>
                      <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>${invoice.discount.toFixed(2)}</TableCell>
                      <TableCell>${invoice.finalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "PAID" ? "default" : "outline"}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
