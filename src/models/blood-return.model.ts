import mongoose, { Schema, Document } from "mongoose";

export interface IBloodReturn extends Document {
  returnCode: string;
  bagNumber: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  component: "PRBC" | "WHOLE_BLOOD" | "FFP" | "PLATELETS" | "CRYOPRECIPITATE";
  patientName: string;
  returnedBy: string;
  returnReason:
    | "Surgery Cancelled / Postponed"
    | "Patient Expired Before Transfusion"
    | "Clinical Condition Improved"
    | "Suspected Transfusion Adverse Reaction"
    | "Cold Chain Breach (>30m at room temp)";
  minutesOutsideColdChain: number;
  temperatureAtReturn: number; // in °C
  sealIntact: boolean;
  acceptanceDecision: "RESTOCKED_TO_INVENTORY" | "DISCARDED_AS_BIOHAZARD";
  disposalMethod?: string;
  acceptedBy: string;
  returnDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodReturnSchema = new Schema<IBloodReturn>(
  {
    returnCode: { type: String, required: true, unique: true },
    bagNumber: { type: String, required: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    component: {
      type: String,
      required: true,
      enum: ["PRBC", "WHOLE_BLOOD", "FFP", "PLATELETS", "CRYOPRECIPITATE"],
      default: "PRBC"
    },
    patientName: { type: String, required: true },
    returnedBy: { type: String, required: true },
    returnReason: {
      type: String,
      enum: [
        "Surgery Cancelled / Postponed",
        "Patient Expired Before Transfusion",
        "Clinical Condition Improved",
        "Suspected Transfusion Adverse Reaction",
        "Cold Chain Breach (>30m at room temp)"
      ],
      default: "Surgery Cancelled / Postponed"
    },
    minutesOutsideColdChain: { type: Number, required: true, default: 15 },
    temperatureAtReturn: { type: Number, required: true, default: 4.5 },
    sealIntact: { type: Boolean, default: true },
    acceptanceDecision: {
      type: String,
      enum: ["RESTOCKED_TO_INVENTORY", "DISCARDED_AS_BIOHAZARD"],
      default: "RESTOCKED_TO_INVENTORY"
    },
    disposalMethod: { type: String, default: "Autoclaving & Incineration" },
    acceptedBy: { type: String, required: true, default: "Blood Bank Officer" },
    returnDate: { type: Date, required: true, default: Date.now },
    notes: { type: String }
  },
  { timestamps: true }
);

export const BloodReturn =
  mongoose.models.BloodReturn ||
  mongoose.model<IBloodReturn>("BloodReturn", bloodReturnSchema);

export default BloodReturn;
