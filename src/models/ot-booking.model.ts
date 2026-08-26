import mongoose, { Schema, Document } from "mongoose";

export interface IOTBooking extends Document {
  patientId?: mongoose.Types.ObjectId;
  surgeryScheduleId?: mongoose.Types.ObjectId;
  bookingDate: Date;
  equipmentRequired: string[];
  notes?: string;
  status: "Pending" | "Confirmed" | "Cancelled";
}

const otBookingSchema = new Schema<IOTBooking>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    surgeryScheduleId: { type: Schema.Types.ObjectId, ref: "SurgerySchedule" },
    bookingDate: { type: Date, required: true },
    equipmentRequired: [{ type: String }],
    notes: { type: String },
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  },
  { timestamps: true }
);

export const OTBooking = mongoose.models.OTBooking || mongoose.model<IOTBooking>("OTBooking", otBookingSchema);
