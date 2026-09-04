import mongoose, { Schema } from "mongoose";
import { IComplianceReport } from "@/interfaces/compliance-report.interface";

const complianceFindingSchema = new Schema(
  {
    category: { type: String, required: true },
    controlName: { type: String, required: true },
    status: {
      type: String,
      enum: ["PASS", "FLAG", "FAIL"],
      default: "PASS",
    },
    score: { type: Number, default: 100 },
    observation: { type: String, default: "" },
    recommendation: { type: String, default: "" },
  },
  { _id: false }
);

const complianceReportSchema = new Schema<IComplianceReport>(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    framework: {
      type: String,
      enum: ["NABH", "HIPAA", "DISHA_ABDM", "ISO_27001", "CLINICAL_ESTABLISHMENT_ACT"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    period: { type: String, required: true },
    overallScore: { type: Number, required: true, default: 90 },
    status: {
      type: String,
      enum: ["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "UNDER_AUDIT"],
      default: "COMPLIANT",
      index: true,
    },
    auditDate: { type: Date, default: Date.now },
    auditorName: { type: String, default: "Internal Quality Assurance Cell" },
    summary: { type: String, default: "" },
    findings: [complianceFindingSchema],
    remediationDeadline: { type: Date },
  },
  { timestamps: true }
);

complianceReportSchema.index({ auditDate: -1 });

const ComplianceReport =
  mongoose.models.ComplianceReport ||
  mongoose.model<IComplianceReport>("ComplianceReport", complianceReportSchema);

export default ComplianceReport;
