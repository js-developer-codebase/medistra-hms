import mongoose, { Schema, Document } from "mongoose";

export interface IHospitalSetting extends Document {
  hospitalId?: mongoose.Types.ObjectId;
  nabhAccredited: boolean;
  nabhCode: string;
  jciAccredited: boolean;
  totalBeds: number;
  icuBeds: number;
  nicuBeds: number;
  otSuites: number;
  bloodBankLicense: string;
  pharmacyLicense: string;
  ambulanceHotline: string;
  casualtyPhone: string;
  visitingHours: string;
  dischargeCheckTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSettingSchema: Schema = new Schema(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: "Organization" },
    nabhAccredited: { type: Boolean, default: true },
    nabhCode: { type: String, default: "NABH-2024-HOSP-0982" },
    jciAccredited: { type: Boolean, default: true },
    totalBeds: { type: Number, default: 450 },
    icuBeds: { type: Number, default: 60 },
    nicuBeds: { type: Number, default: 24 },
    otSuites: { type: Number, default: 12 },
    bloodBankLicense: { type: String, default: "DL-BB-WB-2022-04" },
    pharmacyLicense: { type: String, default: "WB/KOL/20/21B/4921" },
    ambulanceHotline: { type: String, default: "+91 33 2345 6789" },
    casualtyPhone: { type: String, default: "+91 33 2345 6701" },
    visitingHours: { type: String, default: "04:30 PM - 07:00 PM" },
    dischargeCheckTime: { type: String, default: "11:00 AM" },
  },
  { timestamps: true }
);

export default mongoose.models.HospitalSetting ||
  mongoose.model<IHospitalSetting>("HospitalSetting", HospitalSettingSchema);
