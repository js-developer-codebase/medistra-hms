import React from "react";
import MasterLayout from "@/components/layout/master-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <MasterLayout>{children}</MasterLayout>;
}
