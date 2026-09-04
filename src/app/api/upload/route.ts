import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import storage from "@/lib/storage";
import patientService from "@/services/patient.service";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        await dbConnect();
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const category = (formData.get("category") as string) || "OTHER";
        const folder = (formData.get("folder") as string) || "documents";
        const title = (formData.get("title") as string) || (file ? file.name : "Uploaded Document");
        const patientId = formData.get("patientId") as string | null;
        const notes = (formData.get("notes") as string) || "";

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file provided in the request" },
                { status: 400 }
            );
        }

        // Convert File to ArrayBuffer and Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase / S3 bucket
        const uploadResult = await storage.uploadFile(
            buffer,
            file.name,
            file.type || "application/octet-stream",
            folder
        );

        let patientDocument = null;

        // If a patient ID was supplied, link this document to the patient record
        if (patientId && Types.ObjectId.isValid(patientId)) {
            try {
                const validCategory = (["LAB_REPORT", "PRESCRIPTION", "DISCHARGE_SUMMARY", "ID_PROOF", "CONSENT_FORM", "RADIOLOGY", "OTHER"].includes(category)
                    ? category
                    : "OTHER") as any;

                const updatedPatient = await patientService.addDocument(
                    new Types.ObjectId(patientId),
                    {
                        title,
                        category: validCategory,
                        fileName: uploadResult.fileName,
                        fileUrl: uploadResult.fileUrl,
                        fileSize: uploadResult.fileSize,
                        notes
                    }
                );

                patientDocument = updatedPatient?.documents?.[updatedPatient.documents.length - 1] || null;
            } catch (linkErr) {
                console.error("Failed to link document to patient:", linkErr);
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Document uploaded successfully to storage bucket",
                data: {
                    ...uploadResult,
                    title,
                    category,
                    notes,
                    patientDocument
                }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Upload API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Failed to upload file to storage"
            },
            { status: 500 }
        );
    }
}
