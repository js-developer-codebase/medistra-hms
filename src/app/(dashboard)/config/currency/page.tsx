"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Coins,
  CheckCircle2,
  Save,
  Globe,
  RefreshCw,
  Sliders,
  Receipt,
  Building
} from "lucide-react";

export default function CurrencyConfigPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [currencySettings, setCurrencySettings] = useState({
    currencyName: "Indian Rupee",
    currencyCode: "INR",
    symbol: "₹",
    symbolPosition: "prefix",
    decimalPlaces: "2",
    numberFormat: "en-IN", // Indian Lakhs/Crores grouping
    roundingMethod: "round"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast("System currency successfully set to Indian Rupees (₹ - INR)!", "success");
    }, 600);
  };

  const formatSample = (amount: number) => {
    const formattedNum = amount.toLocaleString("en-IN", {
      minimumFractionDigits: parseInt(currencySettings.decimalPlaces) || 2,
      maximumFractionDigits: parseInt(currencySettings.decimalPlaces) || 2
    });

    return currencySettings.symbolPosition === "prefix"
      ? `${currencySettings.symbol} ${formattedNum}`
      : `${formattedNum} ${currencySettings.symbol}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Active Hospital Standard: Indian Rupee (₹)
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            System Currency & Monetary Configuration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure system-wide primary currency, display symbols, numbering formatting, and billing representation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form (2 Cols) */}
        <div className="lg:col-span-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                Primary Currency Setup
              </CardTitle>
              <CardDescription>
                System default parameters applied to Outpatient Billing, Inpatient Admissions, Laboratory, and Pharmacy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currencyName" className="text-xs font-semibold">
                      Currency Full Name *
                    </Label>
                    <Input
                      id="currencyName"
                      value={currencySettings.currencyName}
                      onChange={(e) =>
                        setCurrencySettings({ ...currencySettings, currencyName: e.target.value })
                      }
                      required
                      className="h-9 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="currencyCode" className="text-xs font-semibold">
                      ISO 4217 Currency Code *
                    </Label>
                    <Input
                      id="currencyCode"
                      value={currencySettings.currencyCode}
                      onChange={(e) =>
                        setCurrencySettings({ ...currencySettings, currencyCode: e.target.value })
                      }
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="symbol" className="text-xs font-semibold">
                      Currency Symbol *
                    </Label>
                    <Input
                      id="symbol"
                      value={currencySettings.symbol}
                      onChange={(e) =>
                        setCurrencySettings({ ...currencySettings, symbol: e.target.value })
                      }
                      required
                      className="h-9 text-xs font-bold text-lg text-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="symbolPos" className="text-xs font-semibold">
                      Symbol Placement
                    </Label>
                    <Select
                      id="symbolPos"
                      value={currencySettings.symbolPosition}
                      onChange={(e) =>
                        setCurrencySettings({ ...currencySettings, symbolPosition: e.target.value })
                      }
                      className="h-9 text-xs"
                    >
                      <option value="prefix">Prefix (e.g. ₹ 500)</option>
                      <option value="suffix">Suffix (e.g. 500 ₹)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="decimals" className="text-xs font-semibold">
                      Decimal Digits
                    </Label>
                    <Select
                      id="decimals"
                      value={currencySettings.decimalPlaces}
                      onChange={(e) =>
                        setCurrencySettings({ ...currencySettings, decimalPlaces: e.target.value })
                      }
                      className="h-9 text-xs font-mono"
                    >
                      <option value="0">0 (e.g. ₹ 500)</option>
                      <option value="2">2 (e.g. ₹ 500.00)</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="numberFormat" className="text-xs font-semibold">
                    Numeric Grouping System
                  </Label>
                  <Select
                    id="numberFormat"
                    value={currencySettings.numberFormat}
                    onChange={(e) =>
                      setCurrencySettings({ ...currencySettings, numberFormat: e.target.value })
                    }
                    className="h-9 text-xs"
                  >
                    <option value="en-IN">Indian Numbering System (Lakhs & Crores — ₹ 1,00,000.00)</option>
                    <option value="en-US">International Standard (Millions — ₹ 100,000.00)</option>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={saving}>
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Applying..." : "Apply Currency Configuration"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Card (1 Col) */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Live Format Previews
              </CardTitle>
              <CardDescription className="text-xs">
                How amounts appear across hospital workstations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Doctor Consultation</div>
                  <div className="text-[10px] text-slate-400">Standard OPD Fee</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs">
                  {formatSample(500)}
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Complete Blood Count (CBC)</div>
                  <div className="text-[10px] text-slate-400">Diagnostic Laboratory Test</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs">
                  {formatSample(350)}
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">ICU Daily Bed Tariff</div>
                  <div className="text-[10px] text-slate-400">Inpatient Ward Billing</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs">
                  {formatSample(4500)}
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Annual Surgical Package</div>
                  <div className="text-[10px] text-slate-400">High-Value Grouping</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs">
                  {formatSample(125000)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Building className="h-4 w-4 text-indigo-600" />
                Hospital Regulatory Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 space-y-1.5">
              <p>
                All hospital invoices, receipts, patient bills, and financial ledger exports comply with statutory Indian GST and medical council standards in Indian Rupees (INR).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
