import Link from "next/link";
import { Stethoscope, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
      <div className="max-w-md space-y-6">
        {/* Animated ECG/Heart rate style flatline with stethoscope */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 ring-4 ring-emerald-500/20">
          <Stethoscope className="h-12 w-12 text-emerald-500 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500"></span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-black tracking-tight text-emerald-500">404</h1>
          <h2 className="text-xl font-bold tracking-tight text-slate-200">Page or Record Not Found</h2>
          <p className="text-sm text-slate-400">
            The ward, patient file, or system route you are trying to access does not exist or has been relocated in the Medistra HMS directory.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link href="/dashboard/main" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md transition-all active:scale-[0.98]">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
