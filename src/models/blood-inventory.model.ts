import mongoose, { Schema, Document } from "mongoose";

export interface IBloodInventory extends Document {
  bagNumber: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  componentType: "WHOLE_BLOOD" | "PRBC" | "FFP" | "PLATELETS" | "CRYOPRECIPITATE";
  volumeMl: number;
  unitsAvailable: number;
  storageLocation:
    | "Blood Refrigerator 1 (2-6°C)"
    | "Blood Refrigerator 2 (2-6°C)"
    | "Deep Freezer -40°C"
    | "Platelet Agitator (22°C)";
  collectionDate: Date;
  expiryDate: Date;
  donorId?: mongoose.Types.ObjectId;
  donorName?: string;
  ttiTestStatus: "TESTED_SAFE" | "PENDING_TEST" | "REACTIVE_DISCARDED";
  processingFee: number; // in INR ₹
  status: "AVAILABLE" | "RESERVED" | "ISSUED" | "DISCARDED";
  reservedForPatient?: string;
  reservedUntil?: Date;
  notes?: string;
  organizationId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodInventorySchema = new Schema<IBloodInventory>(
  {
    bagNumber: { type: String, required: true, unique: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    componentType: {
      type: String,
      required: true,
      enum: ["WHOLE_BLOOD", "PRBC", "FFP", "PLATELETS", "CRYOPRECIPITATE"],
      default: "PRBC"
    },
    volumeMl: { type: Number, required: true, default: 350 },
    unitsAvailable: { type: Number, required: true, default: 1 },
    storageLocation: {
      type: String,
      enum: [
        "Blood Refrigerator 1 (2-6°C)",
        "Blood Refrigerator 2 (2-6°C)",
        "Deep Freezer -40°C",
        "Platelet Agitator (22°C)"
      ],
      default: "Blood Refrigerator 1 (2-6°C)"
    },
    collectionDate: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date, required: true },
    donorId: { type: Schema.Types.ObjectId, ref: "BloodDonor" },
    donorName: { type: String },
    ttiTestStatus: {
      type: String,
      enum: ["TESTED_SAFE", "PENDING_TEST", "REACTIVE_DISCARDED"],
      default: "TESTED_SAFE"
    },
    processingFee: { type: Number, default: 1450 },
    status: {
      type: String,
      enum: ["AVAILABLE", "RESERVED", "ISSUED", "DISCARDED"],
      default: "AVAILABLE"
    },
    reservedForPatient: { type: String },
    reservedUntil: { type: Date },
    notes: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" }
  },
  { timestamps: true }
);

export const BloodInventory =
  mongoose.models.BloodInventory ||
  mongoose.model<IBloodInventory>("BloodInventory", bloodInventorySchema);

export default BloodInventory;
