import { ClinicalRecord } from "@/models/clinical-record.model";
import { Diagnosis } from "@/models/diagnosis.model";
import { Vitals } from "@/models/vitals.model";
import Patient from "@/models/patient.model";
import User from "@/models/user.model";

export class ClinicalService {
  // --- Clinical Records ---
  static async getRecords(filter = {}) {
    return ClinicalRecord.find(filter)
      .populate("patient", "firstName lastName")
      .populate("doctor", "name")
      .sort({ dateRecorded: -1 });
  }

  static async getRecordById(id: string) {
    return ClinicalRecord.findById(id).populate("patient doctor");
  }

  static async createRecord(data: any) {
    return ClinicalRecord.create(data);
  }

  static async updateRecord(id: string, data: any) {
    return ClinicalRecord.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteRecord(id: string) {
    return ClinicalRecord.findByIdAndDelete(id);
  }

  // --- Diagnoses ---
  static async getDiagnoses(filter = {}) {
    return Diagnosis.find(filter)
      .populate("patient", "firstName lastName")
      .populate("doctor", "name")
      .sort({ dateDiagnosed: -1 });
  }

  static async createDiagnosis(data: any) {
    return Diagnosis.create(data);
  }

  // --- Vitals ---
  static async getVitals(filter = {}) {
    return Vitals.find(filter)
      .populate("patient", "firstName lastName")
      .populate("recordedBy", "name")
      .sort({ dateRecorded: -1 });
  }

  static async createVitals(data: any) {
    return Vitals.create(data);
  }
}
