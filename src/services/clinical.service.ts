import { ClinicalRecord } from "@/models/clinical-record.model";
import { Diagnosis } from "@/models/diagnosis.model";
import { Vitals } from "@/models/vitals.model";
import Patient from "@/models/patient.model";
import User from "@/models/user.model";

export class ClinicalService {
  // --- Clinical Records ---
  static async getRecords(filter = {}) {
    return ClinicalRecord.find(filter)
      .populate("patient", "name uhid age gender bloodGroup contact allergies medicalHistory")
      .populate("doctor", "name email")
      .sort({ dateRecorded: -1 });
  }

  static async getRecordById(id: string) {
    return ClinicalRecord.findById(id)
      .populate("patient", "name uhid age gender bloodGroup contact allergies medicalHistory")
      .populate("doctor", "name email");
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
      .populate("patient", "name uhid age gender bloodGroup contact")
      .populate("doctor", "name email")
      .sort({ dateDiagnosed: -1 });
  }

  static async createDiagnosis(data: any) {
    return Diagnosis.create(data);
  }

  static async updateDiagnosis(id: string, data: any) {
    return Diagnosis.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteDiagnosis(id: string) {
    return Diagnosis.findByIdAndDelete(id);
  }

  // --- Vitals ---
  static async getVitals(filter = {}) {
    return Vitals.find(filter)
      .populate("patient", "name uhid age gender bloodGroup contact")
      .populate("recordedBy", "name email")
      .sort({ dateRecorded: -1 });
  }

  static async createVitals(data: any) {
    return Vitals.create(data);
  }

  static async deleteVitals(id: string) {
    return Vitals.findByIdAndDelete(id);
  }

  // --- Clinical Statistics ---
  static async getClinicalStats() {
    const [
      totalRecords,
      consultationsCount,
      diagnosesCount,
      vitalsCount,
      allergiesCount,
      ordersCount,
      plansCount,
      notesCount,
      referralsCount,
      followUpsCount,
      problemsCount
    ] = await Promise.all([
      ClinicalRecord.countDocuments(),
      ClinicalRecord.countDocuments({ recordType: "Consultation" }),
      Diagnosis.countDocuments(),
      Vitals.countDocuments(),
      ClinicalRecord.countDocuments({ recordType: "Allergy" }),
      ClinicalRecord.countDocuments({ recordType: "Clinical Order" }),
      ClinicalRecord.countDocuments({ recordType: "Treatment Plan" }),
      ClinicalRecord.countDocuments({ recordType: { $in: ["Clinical Note", "Progress Note"] } }),
      ClinicalRecord.countDocuments({ recordType: "Referral" }),
      ClinicalRecord.countDocuments({ recordType: "Follow-Up" }),
      ClinicalRecord.countDocuments({ recordType: "Patient Problem" })
    ]);

    const recentRecords = await ClinicalRecord.find()
      .populate("patient", "name uhid age gender")
      .populate("doctor", "name")
      .sort({ dateRecorded: -1 })
      .limit(6)
      .lean();

    return {
      totalRecords,
      consultationsCount,
      diagnosesCount,
      vitalsCount,
      allergiesCount,
      ordersCount,
      plansCount,
      notesCount,
      referralsCount,
      followUpsCount,
      problemsCount,
      recentRecords
    };
  }
}
