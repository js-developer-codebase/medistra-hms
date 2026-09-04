import mongoose, { Schema, Document } from "mongoose";

export interface IBranchSetting extends Document {
  branchId?: mongoose.Types.ObjectId;
  branchCode: string;
  operatingHours: string;
  consultationRooms: number;
  dayCareBeds: number;
  hasPharmacy: boolean;
  hasSampleCollection: boolean;
  sampleCourierSchedule: string;
  teleconsultationEnabled: boolean;
  branchManager: string;
  branchManagerPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSettingSchema: Schema = new Schema(
  {
    branchId: { type: Schema.Types.ObjectId, ref: "Organization" },
    branchCode: { type: String, default: "BR-SL-01" },
    operatingHours: { type: String, default: "07:00 AM - 09:00 PM (All 7 Days)" },
    consultationRooms: { type: Number, default: 8 },
    dayCareBeds: { type: Number, default: 10 },
    hasPharmacy: { type: Boolean, default: true },
    hasSampleCollection: { type: Boolean, default: true },
    sampleCourierSchedule: { type: String, default: "Twice Daily (11:30 AM & 04:30 PM)" },
    teleconsultationEnabled: { type: Boolean, default: true },
    branchManager: { type: String, default: "Mr. Debabrata Sen" },
    branchManagerPhone: { type: String, default: "+91 98310 99881" },
  },
  { timestamps: true }
);

export default mongoose.models.BranchSetting ||
  mongoose.model<IBranchSetting>("BranchSetting", BranchSettingSchema);
