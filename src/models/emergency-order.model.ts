import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyOrder extends Document {
  orderNumber: string;
  casualtyId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  orderType: "LAB" | "IMAGING" | "MEDICATION" | "BLOOD_CROSSMATCH" | "PROCEDURE";
  itemName: string;
  dosageOrProtocol?: string;
  instructions?: string;
  priority: "STAT" | "URGENT" | "ROUTINE";
  orderedBy?: string;
  cost: number; // in INR ₹
  status: "ORDERED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  resultSummary?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emergencyOrderSchema = new Schema<IEmergencyOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    casualtyId: { type: Schema.Types.ObjectId, ref: "CasualtyRecord" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    orderType: {
      type: String,
      enum: ["LAB", "IMAGING", "MEDICATION", "BLOOD_CROSSMATCH", "PROCEDURE"],
      required: true
    },
    itemName: { type: String, required: true },
    dosageOrProtocol: { type: String },
    instructions: { type: String },
    priority: {
      type: String,
      enum: ["STAT", "URGENT", "ROUTINE"],
      default: "STAT"
    },
    orderedBy: { type: String, default: "ER Physician" },
    cost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ORDERED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "ORDERED"
    },
    resultSummary: { type: String }
  },
  { timestamps: true }
);

export const EmergencyOrder =
  mongoose.models.EmergencyOrder ||
  mongoose.model<IEmergencyOrder>("EmergencyOrder", emergencyOrderSchema);

export default EmergencyOrder;
