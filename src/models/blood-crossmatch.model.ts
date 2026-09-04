import mongoose, { Schema, Document } from "mongoose";

export interface IBloodCrossmatch extends Document {
  crossmatchCode: string;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  patientBloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  bagNumber: string;
  bagBloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  componentType: string;
  method: "Gel Card Matrix (Coombs)" | "Conventional Tube Agglutination";
  majorCrossmatch: "COMPATIBLE" | "INCOMPATIBLE";
  minorCrossmatch: "COMPATIBLE" | "INCOMPATIBLE";
  overallResult: "COMPATIBLE" | "INCOMPATIBLE";
  crossmatchedBy: string;
  verifiedBy: string;
  validUntil: Date;
  reservationStatus: "RESERVED" | "ISSUED" | "RELEASED" | "EXPIRED";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodCrossmatchSchema = new Schema<IBloodCrossmatch>(
  {
    crossmatchCode: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    patientBloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    bagNumber: { type: String, required: true },
    bagBloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    componentType: { type: String, default: "PRBC" },
    method: {
      type: String,
      enum: ["Gel Card Matrix (Coombs)", "Conventional Tube Agglutination"],
      default: "Gel Card Matrix (Coombs)"
    },
    majorCrossmatch: {
      type: String,
      enum: ["COMPATIBLE", "INCOMPATIBLE"],
      default: "COMPATIBLE"
    },
    minorCrossmatch: {
      type: String,
      enum: ["COMPATIBLE", "INCOMPATIBLE"],
      default: "COMPATIBLE"
    },
    overallResult: {
      type: String,
      enum: ["COMPATIBLE", "INCOMPATIBLE"],
      default: "COMPATIBLE"
    },
    crossmatchedBy: { type: String, required: true, default: "Sr. Blood Bank Tech" },
    verifiedBy: { type: String, required: true, default: "Dr. Transfusion Specialist" },
    validUntil: { type: Date, required: true },
    reservationStatus: {
      type: String,
      enum: ["RESERVED", "ISSUED", "RELEASED", "EXPIRED"],
      default: "RESERVED"
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const BloodCrossmatch =
  mongoose.models.BloodCrossmatch ||
  mongoose.model<IBloodCrossmatch>("BloodCrossmatch", bloodCrossmatchSchema);

export default BloodCrossmatch;
