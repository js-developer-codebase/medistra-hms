import { Document } from "mongoose";

export type ComplianceFramework =
  | "NABH"
  | "HIPAA"
  | "DISHA_ABDM"
  | "ISO_27001"
  | "CLINICAL_ESTABLISHMENT_ACT";

export type ComplianceStatus =
  | "COMPLIANT"
  | "NEEDS_ATTENTION"
  | "NON_COMPLIANT"
  | "UNDER_AUDIT";

export interface IComplianceFinding {
  category: string;
  controlName: string;
  status: "PASS" | "FLAG" | "FAIL";
  score: number;
  observation: string;
  recommendation: string;
}

export interface IComplianceReport extends Document {
  reportId: string;
  framework: ComplianceFramework;
  title: string;
  period: string;
  overallScore: number;
  status: ComplianceStatus;
  auditDate: Date;
  auditorName: string;
  summary: string;
  findings: IComplianceFinding[];
  remediationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}
