import mongoose, { Schema, Document } from "mongoose";

export interface IOrganizationSetting extends Document {
  cinNumber: string; // Corporate Identity Number
  panNumber: string; // Indian PAN
  gstin: string; // Indian GST Number
  currency: string;
  currencySymbol: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  tagline: string;
  website: string;
  emergencyHotline: string;
  letterheadHeader: string;
  letterheadFooter: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSettingSchema: Schema = new Schema(
  {
    cinNumber: { type: String, default: "U85110WB2018PTC224890" },
    panNumber: { type: String, default: "AAACM8912P" },
    gstin: { type: String, default: "19AAACM8912P1ZV" },
    currency: { type: String, default: "INR" },
    currencySymbol: { type: String, default: "₹" },
    fiscalYearStart: { type: String, default: "April" },
    fiscalYearEnd: { type: String, default: "March" },
    tagline: { type: String, default: "Centre of Excellence in Tertiary & Quaternary Healthcare" },
    website: { type: String, default: "https://medistra.hospital" },
    emergencyHotline: { type: String, default: "+91 33 2345 6780" },
    letterheadHeader: { type: String, default: "MEDISTRA HEALTHCARE SYSTEM - TRUSTED CLINICAL EXCELLENCE" },
    letterheadFooter: { type: String, default: "12 Medical Enclave, Central Avenue, Kolkata | 24x7 Helpline: 1800-200-8899" },
  },
  { timestamps: true }
);

export default mongoose.models.OrganizationSetting ||
  mongoose.model<IOrganizationSetting>("OrganizationSetting", OrganizationSettingSchema);
