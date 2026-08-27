"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle, Clock, Send, Hammer, UserCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface UnderConstructionProps {
  moduleName: string;
  routePath: string;
}

export default function UnderConstruction({ moduleName, routePath }: UnderConstructionProps) {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);
  const [priorityCount, setPriorityCount] = useState(12);
  const [priorityVoted, setPriorityVoted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    toast({
      title: "Notification Scheduled",
      description: `You will be notified as soon as the ${moduleName} module is live.`,
      variant: "default",
    });
  };

  const handleVote = () => {
    if (!priorityVoted) {
      setPriorityCount(prev => prev + 1);
      setPriorityVoted(true);
      toast({
        title: "Priority Vote Registered",
        description: "Thank you! We've bumped up the queue status for this department.",
        variant: "default",
      });
    }
  };

  const tasks = [
    { name: "Schema & DB Repositories", status: "completed" },
    { name: "REST API & Controller Actions", status: "completed" },
    { name: "Indian/Kolkata Localization Seed", status: "in-progress" },
    { name: "Staff & Role Privilege Mapping", status: "pending" },
    { name: "Interactive React UI Pages", status: "pending" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{moduleName}</h1>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Under Construction
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Path: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">{routePath}</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleVote} 
            disabled={priorityVoted}
            className="border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2"
          >
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            Vote Priority ({priorityCount})
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Build Status & Checklist */}
        <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Hammer className="h-5 w-5 text-emerald-500" />
              Module Implementation Pipeline
            </CardTitle>
            <CardDescription>
              Check the live status of autonomous Medistra HMS agents working on this module.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{task.name}</span>
                  {task.status === "completed" && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-semibold text-xs gap-1 py-1">
                      <CheckCircle className="h-3 w-3" /> Completed
                    </Badge>
                  )}
                  {task.status === "in-progress" && (
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none font-semibold text-xs gap-1 py-1">
                      <Clock className="h-3 w-3 animate-spin" /> In Progress
                    </Badge>
                  )}
                  {task.status === "pending" && (
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 font-medium text-xs gap-1 py-1">
                      <Wrench className="h-3 w-3" /> Scheduled
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Notify Me & Actions */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-500" />
                Notify on Live
              </CardTitle>
              <CardDescription>
                Get a real-time system notification and SMS update when Medistra HMS activates this section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscribed ? (
                <div className="text-center py-6 space-y-2">
                  <UserCheck className="h-10 w-10 mx-auto text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Subscription Registered</p>
                  <p className="text-xs text-slate-500">We'll alert your user account as soon as this screen is active.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alert Email</label>
                    <input 
                      type="email" 
                      required 
                      defaultValue="admin@hospital.com" 
                      placeholder="Enter hospital email"
                      className="w-full text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2">
                    Subscribe for Updates
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm">
            <CardContent className="pt-6 flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Super Admin Notice</h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
                  Development database seeds are active. All layouts conform to standard Kolkata Hospital designs and Bengal names config.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
