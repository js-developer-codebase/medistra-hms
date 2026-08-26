import { NextRequest, NextResponse } from "next/server";
import { ClinicalService } from "@/services/clinical.service";

export class ClinicalController {
  static async getRecords(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const patient = searchParams.get("patient");
      const recordType = searchParams.get("recordType");

      const filter: any = {};
      if (patient) filter.patient = patient;
      if (recordType) filter.recordType = recordType;

      const records = await ClinicalService.getRecords(filter);
      return NextResponse.json({ success: true, data: records });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  static async createRecord(req: NextRequest) {
    try {
      const body = await req.json();
      const newRecord = await ClinicalService.createRecord(body);
      return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  static async getDiagnoses(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const patient = searchParams.get("patient");

      const filter: any = {};
      if (patient) filter.patient = patient;

      const diagnoses = await ClinicalService.getDiagnoses(filter);
      return NextResponse.json({ success: true, data: diagnoses });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  static async createDiagnosis(req: NextRequest) {
    try {
      const body = await req.json();
      const newDiagnosis = await ClinicalService.createDiagnosis(body);
      return NextResponse.json({ success: true, data: newDiagnosis }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  static async getVitals(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const patient = searchParams.get("patient");

      const filter: any = {};
      if (patient) filter.patient = patient;

      const vitals = await ClinicalService.getVitals(filter);
      return NextResponse.json({ success: true, data: vitals });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  static async createVitals(req: NextRequest) {
    try {
      const body = await req.json();
      const newVitals = await ClinicalService.createVitals(body);
      return NextResponse.json({ success: true, data: newVitals }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}
