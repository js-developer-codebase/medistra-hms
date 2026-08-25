"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "EMAIL",
    subject: "",
    content: "",
    variables: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/notifications/templates");
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...newTemplate,
        variables: newTemplate.variables.split(",").map((v) => v.trim()).filter(Boolean),
      };

      const res = await fetch("/api/notifications/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Template created" });
        fetchTemplates();
        setNewTemplate({ name: "", type: "EMAIL", subject: "", content: "", variables: "" });
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  if (loading) return <div className="p-8">Loading templates...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Notification Templates</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Template</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    required
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">Push</option>
                    <option value="SYSTEM">System</option>
                  </select>
                </div>
                {newTemplate.type === "EMAIL" && (
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    required
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Variables (comma-separated)</label>
                  <Input
                    placeholder="e.g. patientName, date"
                    value={newTemplate.variables}
                    onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Create Template</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No templates found.</div>
          ) : (
            templates.map((tpl) => (
              <Card key={tpl._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{tpl.name}</CardTitle>
                    <Badge>{tpl.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {tpl.subject && <div className="font-medium text-sm mb-2">Subject: {tpl.subject}</div>}
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {tpl.content}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {tpl.variables?.map((v: string) => (
                      <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
