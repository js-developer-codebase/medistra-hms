import mongoose, { Schema, Document } from "mongoose";

export interface IOTBooking extends Document {
  bookingNumber: string;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  surgeryScheduleId?: mongoose.Types.ObjectId;
  otRoom: string;
  bookingDate: Date;
  slotStartTime: string;
  slotEndTime: string;
  procedureName: string;
  surgeonName: string;
  equipmentRequired: string[];
  equipmentRentalCost: number; // in INR ₹
  cssdSterilizationStatus: "Sterilized & Verified" | "In Autoclave" | "Pending CSSD";
  notes?: string;
  status: "Pending" | "Confirmed" | "In Use" | "Completed" | "Cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const otBookingSchema = new Schema<IOTBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    surgeryScheduleId: { type: Schema.Types.ObjectId, ref: "SurgerySchedule" },
    otRoom: { type: String, required: true, default: "OT 1 - Modular Cardiac OT" },
    bookingDate: { type: Date, required: true },
    slotStartTime: { type: String, required: true, default: "08:30 AM" },
    slotEndTime: { type: String, required: true, default: "11:30 AM" },
    procedureName: { type: String, required: true },
    surgeonName: { type: String, required: true },
    equipmentRequired: [{ type: String }],
    equipmentRentalCost: { type: Number, default: 0 },
    cssdSterilizationStatus: {
      type: String,
      enum: ["Sterilized & Verified", "In Autoclave", "Pending CSSD"],
      default: "Sterilized & Verified"
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Use", "Completed", "Cancelled"],
      default: "Confirmed"
    }
  },
  { timestamps: true }
);

export const OTBooking =
  mongoose.models.OTBooking ||
  mongoose.model<IOTBooking>("OTBooking", otBookingSchema);

export default OTBooking;
