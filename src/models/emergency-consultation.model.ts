import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyConsultation extends Document {
  consultationCode: string;
  casualtyId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  consultingDoctor: string;
  doctorSpecialty?: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  systemicExamination?: {
    cvs?: string;
    rs?: string;
    cns?: string;
    pa?: string;
  };
  provisionalDiagnosis: string;
  emergencyCarePlan: string;
  disposition:
    | "ADMIT_ICU"
    | "ADMIT_WARD"
    | "EMERGENCY_OT"
    | "OBSERVATION"
    | "DISCHARGE_HOME"
    | "LAMA"
    | "TRANSFER_TERTIARY"
    | "DECEASED";
  dispositionNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emergencyConsultationSchema = new Schema<IEmergencyConsultation>(
  {
    consultationCode: { type: String, required: true, unique: true },
    casualtyId: { type: Schema.Types.ObjectId, ref: "CasualtyRecord" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    consultingDoctor: { type: String, required: true, default: "Dr. ER Consultant" },
    doctorSpecialty: { type: String, default: "Emergency Medicine" },
    chiefComplaint: { type: String, required: true },
    historyOfPresentIllness: { type: String, required: true },
    systemicExamination: {
      cvs: { type: String, default: "S1 S2 heard, no murmurs" },
      rs: { type: String, default: "Bilateral air entry equal, clear" },
      cns: { type: String, default: "Conscious, oriented, pupils equal & reactive" },
      pa: { type: String, default: "Soft, non-tender, bowel sounds present" }
    },
    provisionalDiagnosis: { type: String, required: true },
    emergencyCarePlan: { type: String, required: true },
    disposition: {
      type: String,
      enum: [
        "ADMIT_ICU",
        "ADMIT_WARD",
        "EMERGENCY_OT",
        "OBSERVATION",
        "DISCHARGE_HOME",
        "LAMA",
        "TRANSFER_TERTIARY",
        "DECEASED"
      ],
      default: "OBSERVATION"
    },
    dispositionNotes: { type: String }
  },
  { timestamps: true }
);

export const EmergencyConsultation =
  mongoose.models.EmergencyConsultation ||
  mongoose.model<IEmergencyConsultation>(
    "EmergencyConsultation",
    emergencyConsultationSchema
  );

export default EmergencyConsultation;
