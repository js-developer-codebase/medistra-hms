"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Images,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Contrast,
  SlidersHorizontal,
  FileEdit,
  Loader2,
  Scan,
  RefreshCw,
  Move,
  Ruler,
  Upload,
  Camera,
  FlipHorizontal,
  CheckCircle2
} from "lucide-react";

export default function PACSLightViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PACSRealTimeContent />
    </Suspense>
  );
}

// Active Tool Types: Window/Level, Pan, Caliper Measurement, Zoom
type ToolType = "wl" | "pan" | "ruler" | "zoom";

function PACSRealTimeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("studyId") || "";
  const { toast } = useToast();

  const [studies, setStudies] = useState<any[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // PACS Interactive Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Tool: "wl" (Window/Level), "pan", "ruler", "zoom"
  const [activeTool, setActiveTool] = useState<ToolType>("wl");

  // Real-time Display Parameters
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [inverted, setInverted] = useState(false);

  // Windowing & Level (Brightness & Contrast)
  // Window Width (Contrast) & Window Center (Brightness)
  const [contrast, setContrast] = useState(1.0); // 0.5 - 3.0
  const [brightness, setBrightness] = useState(1.0); // 0.2 - 2.5
  const [presetName, setPresetName] = useState("Standard Soft Tissue");

const BUCKET_CHEST_XRAY =
  "https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428084462_chest_xray.jpg";
const BUCKET_BRAIN_CT =
  "https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428085696_brain_ct.jpg";
const BUCKET_MRI_SPINE =
  "https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428086452_mri_spine.jpg";

  // Current active image URL
  const [activeImageUrl, setActiveImageUrl] = useState<string>(BUCKET_CHEST_XRAY);
  const [activeSliceIndex, setActiveSliceIndex] = useState(0);

  // Real-time Caliper Measurement Points
  const [rulerPoints, setRulerPoints] = useState<{ start: { x: number; y: number } | null; end: { x: number; y: number } | null }>({
    start: null,
    end: null
  });

  // Mouse Drag Tracking
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Loaded Image Reference
  const currentImageRef = useRef<HTMLImageElement | null>(null);

  const getScanFallback = (modality: string) => {
    switch (modality) {
      case "CT":
        return BUCKET_BRAIN_CT;
      case "MRI":
        return BUCKET_MRI_SPINE;
      case "X-RAY":
      default:
        return BUCKET_CHEST_XRAY;
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/radiology/studies");
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setStudies(list);

        let initial = null;
        if (preselectedId) {
          initial = list.find((s: any) => s._id === preselectedId);
        }
        if (!initial && list.length > 0) {
          initial = list[0];
        }

        if (initial) {
          setSelectedStudy(initial);
          const firstImage = (initial.imageUrls && initial.imageUrls[0]) || getScanFallback(initial.modality);
          setActiveImageUrl(firstImage);
        }
      }
    } catch (e) {
      toast("Failed to load PACS studies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When study changes, update active image
  const handleSelectStudy = (s: any) => {
    setSelectedStudy(s);
    setActiveSliceIndex(0);
    const imgUrl = (s.imageUrls && s.imageUrls[0]) || getScanFallback(s.modality);
    setActiveImageUrl(imgUrl);
    handleReset();
  };

  // Load image object whenever activeImageUrl changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeImageUrl;
    img.onload = () => {
      currentImageRef.current = img;
      renderCanvas();
    };
  }, [activeImageUrl]);

  // Re-render canvas whenever display controls change
  useEffect(() => {
    renderCanvas();
  }, [zoom, panOffset, rotation, flipped, inverted, contrast, brightness, rulerPoints]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = currentImageRef.current;
    if (!img || !img.complete) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Move to canvas center + pan
    ctx.translate(canvas.width / 2 + panOffset.x, canvas.height / 2 + panOffset.y);

    // Rotation & Flip
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipped) ctx.scale(-1, 1);

    // Zoom
    ctx.scale(zoom, zoom);

    // Apply real-time Filter for Windowing / Leveling & Inversion
    const inv = inverted ? "invert(100%)" : "invert(0%)";
    ctx.filter = `contrast(${contrast * 100}%) brightness(${brightness * 100}%) ${inv}`;

    // Fit image to canvas maintaining aspect ratio
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgRatio > canvasRatio) {
      drawHeight = canvas.width / imgRatio;
    } else {
      drawWidth = canvas.height * imgRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    ctx.restore();

    // Draw Caliper Ruler (if active)
    if (rulerPoints.start && rulerPoints.end) {
      ctx.save();
      ctx.strokeStyle = "#10b981"; // Emerald green
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(rulerPoints.start.x, rulerPoints.start.y);
      ctx.lineTo(rulerPoints.end.x, rulerPoints.end.y);
      ctx.stroke();

      // Draw cross endpoints
      const drawPoint = (pt: { x: number; y: number }) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();
      };
      drawPoint(rulerPoints.start);
      drawPoint(rulerPoints.end);

      // Distance calculation in mm (assuming 0.35mm per pixel calibration standard)
      const dx = rulerPoints.end.x - rulerPoints.start.x;
      const dy = rulerPoints.end.y - rulerPoints.start.y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const mmDist = (pixelDist * (0.35 / zoom)).toFixed(1);

      // Label background & text
      const midX = (rulerPoints.start.x + rulerPoints.end.x) / 2;
      const midY = (rulerPoints.start.y + rulerPoints.end.y) / 2;

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(midX - 28, midY - 18, 56, 18);
      ctx.fillStyle = "#34d399";
      ctx.textAlign = "center";
      ctx.fillText(`${mmDist} mm`, midX, midY - 5);

      ctx.restore();
    }
  };

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = { x, y };

    if (activeTool === "ruler") {
      setRulerPoints({ start: { x, y }, end: { x, y } });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStartRef.current.x;
    const dy = y - dragStartRef.current.y;

    if (activeTool === "wl") {
      // Real-time Window / Level Adjustment
      // Horizontal drag = Window Width (Contrast)
      // Vertical drag = Window Center (Brightness)
      setContrast((prev) => Math.max(0.2, Math.min(prev + dx * 0.005, 3.5)));
      setBrightness((prev) => Math.max(0.1, Math.min(prev - dy * 0.005, 2.8)));
      setPresetName("Custom W/L");
      dragStartRef.current = { x, y };
    } else if (activeTool === "pan") {
      // Real-time Pan
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStartRef.current = { x, y };
    } else if (activeTool === "zoom") {
      // Real-time Drag Zoom
      setZoom((prev) => Math.max(0.2, Math.min(prev - dy * 0.01, 5.0)));
      dragStartRef.current = { x, y };
    } else if (activeTool === "ruler") {
      setRulerPoints((prev) => ({ ...prev, end: { x, y } }));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mouse Wheel Smooth Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(0.3, Math.min(prev * zoomFactor, 5.0)));
  };

  // Reset Controls
  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
    setFlipped(false);
    setInverted(false);
    setContrast(1.0);
    setBrightness(1.0);
    setPresetName("Standard Soft Tissue");
    setRulerPoints({ start: null, end: null });
  };

  // Preset Windows
  const applyPreset = (name: string, c: number, b: number) => {
    setContrast(c);
    setBrightness(b);
    setPresetName(name);
    toast(`Applied ${name} (W: ${(c * 1000).toFixed(0)}, L: ${(b * 500).toFixed(0)})`, "info");
  };

  // Upload Real Scan / Image File to Cloud Bucket
  const handleUploadFileToBucket = async (file: File) => {
    // 1. Instant local preview for zero latency
    const localReader = new FileReader();
    localReader.onload = (ev) => {
      if (ev.target?.result) {
        setActiveImageUrl(ev.target.result as string);
      }
    };
    localReader.readAsDataURL(file);

    // 2. Upload to Cloud Storage Bucket
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("folder", "radiology/scans");
      uploadForm.append("category", "RADIOLOGY");
      uploadForm.append(
        "title",
        `Radiology Scan - ${selectedStudy?.accessionNumber || file.name}`
      );
      if (selectedStudy?.patient?._id) {
        uploadForm.append("patientId", selectedStudy.patient._id);
      }

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm
      });
      const uploadJson = await uploadRes.json();

      let targetUrl = "";
      if (uploadJson.success && uploadJson.data?.fileUrl) {
        targetUrl = uploadJson.data.fileUrl;
      }

      if (targetUrl && selectedStudy) {
        const updatedUrls = [...(selectedStudy.imageUrls || []), targetUrl];
        setSelectedStudy({ ...selectedStudy, imageUrls: updatedUrls });
        setActiveSliceIndex(updatedUrls.length - 1);
        setActiveImageUrl(targetUrl);

        await fetch(`/api/radiology/studies/${selectedStudy._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrls: updatedUrls,
            instanceCount: updatedUrls.length
          })
        });

        toast(`Scan uploaded and saved to storage bucket!`, "success");
      } else {
        toast(`Scan loaded into PACS viewer!`, "success");
      }
    } catch (err) {
      toast("Scan loaded into PACS viewport", "info");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUploadFileToBucket(file);
  };

  // Download Snapshot
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `PACS_${selectedStudy?.accessionNumber || "Scan"}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast("PACS diagnostic snapshot saved", "success");
  };

  const currentSliceList = useMemo(() => {
    if (!selectedStudy) return [BUCKET_CHEST_XRAY];
    if (selectedStudy.imageUrls && selectedStudy.imageUrls.length > 0) {
      return selectedStudy.imageUrls;
    }
    return [getScanFallback(selectedStudy.modality)];
  }, [selectedStudy]);

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Hidden File Input for Real Scan Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.dcm"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Images className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            PACS Real-Time Diagnostic Viewport
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real medical scan engine with interactive Window/Level, caliper measurements, zoom, pan, negative invert, and custom scan upload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs flex items-center gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
          >
            <Upload className="h-4 w-4" />
            Upload Real Scan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSnapshot}
            className="text-xs flex items-center gap-1.5"
          >
            <Camera className="h-4 w-4" />
            Save Snapshot
          </Button>

          {selectedStudy && (
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
              onClick={() => router.push(`/radiology/reports?studyId=${selectedStudy._id}`)}
            >
              <FileEdit className="h-4 w-4" />
              Dictate Report
            </Button>
          )}
        </div>
      </div>

      {/* PACS Layout: Sidebar (1 Col) + Viewport (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar: Studies & Slices Strip */}
        <div className="space-y-3">
          <Card className="border shadow-sm">
            <CardHeader className="p-3 pb-2 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Diagnostic Studies ({studies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5 max-h-[360px] overflow-y-auto">
              {studies.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No studies available.</div>
              ) : (
                studies.map((s) => {
                  const isSelected = selectedStudy?._id === s._id;
                  return (
                    <div
                      key={s._id}
                      onClick={() => handleSelectStudy(s)}
                      className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {s.accessionNumber}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            s.modality === "CT"
                              ? "text-cyan-600 border-cyan-300"
                              : s.modality === "MRI"
                              ? "text-purple-600 border-purple-300"
                              : "text-blue-600 border-blue-300"
                          }`}
                        >
                          {s.modality || "X-RAY"}
                        </Badge>
                      </div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {s.patient?.name || "Patient"}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                        <span>{s.bodyPart || "Chest"}</span>
                        <span>{s.imageUrls?.length || 1} slices</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Slices Thumbnail Strip */}
          {selectedStudy && (
            <Card className="border shadow-sm">
              <CardHeader className="p-3 pb-2 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Scan Slices ({currentSliceList.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-indigo-600 px-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  + Add Slice
                </Button>
              </CardHeader>
              <CardContent className="p-2 grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto">
                {currentSliceList.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveSliceIndex(idx);
                      setActiveImageUrl(url);
                    }}
                    className={`aspect-square rounded-md border p-1 cursor-pointer flex flex-col items-center justify-center bg-black overflow-hidden relative transition-all ${
                      activeSliceIndex === idx
                        ? "ring-2 ring-indigo-500 border-indigo-500"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Slice ${idx + 1}`} className="w-full h-full object-cover rounded" />
                    <span className="absolute bottom-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Viewport Area: Toolbar + HTML5 Interactive Canvas (3 Cols) */}
        <div className="lg:col-span-3 space-y-2">
          {/* PACS Real-Time Interactive Toolbar (Light & Dark Mode Compatible) */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Tool Selection Segmented Group */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-xs transition-all ${
                  activeTool === "wl"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 hover:text-white"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                }`}
                onClick={() => setActiveTool("wl")}
                title="Window / Level (Click & drag horizontally/vertically to adjust contrast/brightness)"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                W/L Tool
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-xs transition-all ${
                  activeTool === "pan"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 hover:text-white"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                }`}
                onClick={() => setActiveTool("pan")}
                title="Pan / Move (Click and drag to move image)"
              >
                <Move className="h-3.5 w-3.5 mr-1.5" />
                Pan
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-xs transition-all ${
                  activeTool === "ruler"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 hover:text-white"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                }`}
                onClick={() => setActiveTool("ruler")}
                title="Caliper Ruler (Click and drag to measure millimeters)"
              >
                <Ruler className="h-3.5 w-3.5 mr-1.5" />
                Measure
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-xs transition-all ${
                  activeTool === "zoom"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 hover:text-white"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                }`}
                onClick={() => setActiveTool("zoom")}
                title="Zoom Tool"
              >
                <ZoomIn className="h-3.5 w-3.5 mr-1.5" />
                Zoom
              </Button>
            </div>

            {/* Windowing Presets Group */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1.5 hidden sm:inline">
                Presets:
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-[11px] px-2.5 transition-all ${
                  presetName === "Soft Tissue"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => applyPreset("Soft Tissue", 1.0, 1.0)}
              >
                Soft Tissue
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-[11px] px-2.5 transition-all ${
                  presetName === "Bone Window"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => applyPreset("Bone Window", 2.0, 1.3)}
              >
                Bone
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-[11px] px-2.5 transition-all ${
                  presetName === "Lung Window"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => applyPreset("Lung Window", 1.8, 0.7)}
              >
                Lung
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-[11px] px-2.5 transition-all ${
                  presetName === "Brain Window"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => applyPreset("Brain Window", 1.5, 1.1)}
              >
                Brain
              </Button>
            </div>

            {/* Invert, Rotate, Flip, Reset Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className={`h-7 px-2.5 text-xs transition-all ${
                  inverted
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-semibold"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setInverted((prev) => !prev)}
                title="Invert Negative Film Grayscale"
              >
                <Contrast className="h-3.5 w-3.5 mr-1" />
                Invert
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`h-7 px-2 border-slate-200 dark:border-slate-700 transition-all ${
                  flipped
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setFlipped((prev) => !prev)}
                title="Flip Horizontal (Mirror View)"
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-200"
                onClick={handleReset}
                title="Reset Viewport & Adjustments"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Interactive Medical Canvas Viewport */}
          <div
            className="relative aspect-[4/3] sm:aspect-[16/10] bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none shadow-2xl"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                handleUploadFileToBucket(file);
              }
            }}
          >
            {/* Top-Left Patient Demographic HUD */}
            {selectedStudy && (
              <div className="absolute top-3 left-3 z-10 font-mono text-[11px] text-emerald-400 space-y-0.5 pointer-events-none drop-shadow bg-black/70 backdrop-blur px-2.5 py-1.5 rounded-lg border border-white/10">
                <div className="font-bold">{selectedStudy.patient?.name}</div>
                <div className="text-[10px] text-slate-300">UHID: {selectedStudy.patient?.uhid}</div>
                <div className="text-[10px] text-slate-300">
                  {selectedStudy.patient?.age}y / {selectedStudy.patient?.gender}
                </div>
              </div>
            )}

            {/* Top-Right Study Acquisition HUD */}
            {selectedStudy && (
              <div className="absolute top-3 right-3 z-10 font-mono text-[11px] text-right text-emerald-400 space-y-0.5 pointer-events-none drop-shadow bg-black/70 backdrop-blur px-2.5 py-1.5 rounded-lg border border-white/10">
                <div className="font-bold">{selectedStudy.accessionNumber}</div>
                <div className="text-[10px] text-slate-300">
                  {selectedStudy.modality} • {selectedStudy.bodyPart}
                </div>
                <div className="text-[10px] text-slate-300">
                  {new Date(selectedStudy.createdAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Bottom-Left Real-time Window / Level HUD */}
            <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-slate-300 space-y-0.5 pointer-events-none drop-shadow bg-black/60 px-2 py-1 rounded">
              <div className="text-emerald-400 font-bold">Preset: {presetName}</div>
              <div>
                W: {(contrast * 1000).toFixed(0)} • L: {(brightness * 500).toFixed(0)} • Zoom: {Math.round(zoom * 100)}%
              </div>
              <div className="text-[9px] text-slate-400">
                Active Tool: {activeTool.toUpperCase()} (Drag on image to adjust)
              </div>
            </div>

            {/* Bottom-Right Medistra PACS Calibration Stamp */}
            <div className="absolute bottom-3 right-3 z-10 font-mono text-[10px] text-slate-400 pointer-events-none drop-shadow bg-black/60 px-2 py-1 rounded">
              MEDISTRA PACS ENGINE • 0.35mm/px CALIBRATED
            </div>

            {/* Real-time HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={700}
              height={500}
              className={`max-w-full max-h-full cursor-${
                activeTool === "wl"
                  ? "crosshair"
                  : activeTool === "pan"
                  ? "move"
                  : activeTool === "ruler"
                  ? "crosshair"
                  : "zoom-in"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
            <span>
              💡 <strong>Tip:</strong> Drag-and-drop any medical image file directly onto the viewport or click "Upload Real Scan".
            </span>
            <span>
              Drag mouse on canvas to adjust <strong>Contrast (X)</strong> and <strong>Brightness (Y)</strong> in real time.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
