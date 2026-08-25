"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function NotificationsListPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/notifications/logs");
        const json = await res.json();
        if (json.success) {
          setLogs(json.data);
        } else {
          toast({
            title: "Error",
            description: json.message || "Failed to fetch logs",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [toast]);

  if (loading) return <div className="p-8">Loading notifications...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Notifications Log</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No notifications found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject / Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <Badge variant="outline">{log.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.recipient?.name || "Unknown"} <br />
                      <span className="text-xs text-muted-foreground">{log.recipientModel}</span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.subject && <div className="font-semibold">{log.subject}</div>}
                      <span className="text-sm">{log.content}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === "SENT" ? "default" : log.status === "FAILED" ? "destructive" : "secondary"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : "N/A"}
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
