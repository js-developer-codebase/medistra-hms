"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Team</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Operation Theatre Module</p>
      </div>
      <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm">
        <CardHeader className="text-center pb-2 pt-12">
          <Hammer className="h-12 w-12 mx-auto text-emerald-500 mb-4 animate-bounce" />
          <CardTitle className="text-xl">Under Construction</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            This module is currently being built by the Medistra autonomous agents. The UI and backend endpoints will be deployed here soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-12 text-center text-sm font-mono text-slate-500">
          Module Route: Team
        </CardContent>
      </Card>
    </div>
  );
}
