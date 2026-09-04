import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Role from "./models/role.model";
import Menu from "./models/menu.model";
import User from "./models/user.model";
import RoleHierarchy from "./models/role-hierarchy.model";
import Organization from "./models/organization.model";
import Department from "./models/department.model";
import Designation from "./models/designation.model";
import Specialization from "./models/specialization.model";
import LabTest from "./models/lab-test.model";
import RadiologyProcedure from "./models/radiology-procedure.model";
import MedicineCategory from "./models/medicine-category.model";
import Medicine from "./models/medicine.model";
import PharmacySupplier from "./models/pharmacy-supplier.model";
import BloodDonor from "./models/blood-donor.model";
import BloodInventory from "./models/blood-inventory.model";
import InventoryItem from "./models/inventory-item.model";
import InventoryCategory from "./models/inventory-category.model";
import ProcurementSupplier from "./models/procurement-supplier.model";
import Staff from "./models/staff.model";
import Shift from "./models/shift.model";
import Attendance from "./models/attendance.model";
import Leave from "./models/leave.model";
import StaffDocument from "./models/staff-document.model";
import NotificationTemplate from "./models/notification-template.model";
import NotificationRule from "./models/notification-rule.model";
import NotificationSetting from "./models/notification-setting.model";
import NotificationLog from "./models/notification-log.model";
import UserSession from "./models/user-session.model";
import AccessPolicy from "./models/access-policy.model";
import OrganizationSetting from "./models/organization-setting.model";
import HospitalSetting from "./models/hospital-setting.model";
import BranchSetting from "./models/branch-setting.model";
import AuditLog from "./models/audit-log.model";
import SecurityEvent from "./models/security-event.model";
import ComplianceReport from "./models/compliance-report.model";
import SystemSetting from "./models/system-setting.model";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medistra-hms";
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@hospital.com";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "password123";

const menusData = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        children: [
            { name: "Dashboard", path: "/dashboard/main" },
            { name: "My Tasks", path: "/dashboard/tasks" },
            { name: "Notifications", path: "/dashboard/notifications" },
            { name: "Alerts", path: "/dashboard/alerts" }
        ]
    },
    {
        name: "Patient Management",
        path: "/patients",
        icon: "Users",
        children: [
            { name: "Register Patient", path: "/patients/register" },
            { name: "Patients", path: "/patients/list" },
            { name: "Patient Profile", path: "/patients/profile" },
            { name: "Patient History", path: "/patients/history" },
            { name: "Medical Documents", path: "/patients/documents" },
            { name: "Patient Merge", path: "/patients/merge" },
            { name: "Patient Identification", path: "/patients/identification" },
            { name: "Patient Reports", path: "/patients/reports" }
        ]
    },
    {
        name: "Doctor & Staff Management",
        path: "/staff",
        icon: "UserCog",
        children: [
            { name: "Doctors", path: "/staff/doctors" },
            { name: "Staff", path: "/staff/list" },
            { name: "Departments", path: "/staff/departments" },
            { name: "Designations", path: "/staff/designations" },
            { name: "Specializations", path: "/staff/specializations" },
            { name: "Doctor Schedule", path: "/staff/schedule" },
            { name: "Staff Directory", path: "/staff/directory" }
        ]
    },
    {
        name: "Appointments",
        path: "/appointments",
        icon: "Calendar",
        children: [
            { name: "Book Appointment", path: "/appointments/book" },
            { name: "Appointment Calendar", path: "/appointments/calendar" },
            { name: "Appointments", path: "/appointments/list" },
            { name: "Doctor Schedule", path: "/appointments/schedule" },
            { name: "Appointment Queue", path: "/appointments/queue" },
            { name: "Appointment Reschedule", path: "/appointments/reschedule" },
            { name: "Appointment Cancellation", path: "/appointments/cancel" },
            { name: "No-Show Management", path: "/appointments/no-show" }
        ]
    },
    {
        name: "Admissions & Discharge",
        path: "/admissions",
        icon: "Bed",
        children: [
            { name: "New Admission", path: "/admissions/new" },
            { name: "Current Admissions", path: "/admissions/current" },
            { name: "Admission History", path: "/admissions/history" },
            { name: "Patient Transfer", path: "/admissions/transfer" },
            { name: "Discharge", path: "/admissions/discharge" },
            { name: "Discharge Summary", path: "/admissions/summary" },
            { name: "Discharge History", path: "/admissions/discharge-history" }
        ]
    },
    {
        name: "Ward & Bed Management",
        path: "/wards",
        icon: "Building",
        children: [
            { name: "Wards", path: "/wards/list" },
            { name: "Rooms", path: "/wards/rooms" },
            { name: "Beds", path: "/wards/beds" },
            { name: "Bed Allocation", path: "/wards/allocate" },
            { name: "Bed Transfer", path: "/wards/transfer" },
            { name: "Bed Occupancy", path: "/wards/occupancy" },
            { name: "Bed Availability", path: "/wards/availability" },
            { name: "Ward Dashboard", path: "/wards/dashboard" }
        ]
    },
    {
        name: "Clinical / EMR",
        path: "/clinical",
        icon: "Activity",
        children: [
            { name: "Clinical Dashboard", path: "/clinical/dashboard" },
            { name: "Consultations", path: "/clinical/consultations" },
            { name: "Medical Records", path: "/clinical/records" },
            { name: "Medical History", path: "/clinical/history" },
            { name: "Allergies", path: "/clinical/allergies" },
            { name: "Diagnoses", path: "/clinical/diagnoses" },
            { name: "Clinical Notes", path: "/clinical/notes" },
            { name: "Treatment Plans", path: "/clinical/plans" },
            { name: "Prescriptions", path: "/clinical/prescriptions" },
            { name: "Clinical Orders", path: "/clinical/orders" },
            { name: "Referrals", path: "/clinical/referrals" },
            { name: "Follow-Up", path: "/clinical/follow-up" },
            { name: "Vital Signs", path: "/clinical/vitals" },
            { name: "Patient Problems", path: "/clinical/problems" }
        ]
    },
    {
        name: "Nursing",
        path: "/nursing",
        icon: "HeartPulse",
        children: [
            { name: "Nursing Dashboard", path: "/nursing/dashboard" },
            { name: "My Patients", path: "/nursing/patients" },
            { name: "Vital Signs", path: "/nursing/vitals" },
            { name: "Nursing Notes", path: "/nursing/notes" },
            { name: "Care Plans", path: "/nursing/plans" },
            { name: "Medication Administration", path: "/nursing/medications" },
            { name: "Intake / Output", path: "/nursing/intake-output" },
            { name: "Nursing Tasks", path: "/nursing/tasks" },
            { name: "Nursing Handover", path: "/nursing/handover" },
            { name: "Shift Management", path: "/nursing/shifts" }
        ]
    },
    {
        name: "Laboratory",
        path: "/lab",
        icon: "FlaskConical",
        children: [
            { name: "Laboratory Dashboard", path: "/lab/dashboard" },
            { name: "Test Catalog", path: "/lab/catalog" },
            { name: "Lab Orders", path: "/lab/orders" },
            { name: "Pending Orders", path: "/lab/pending" },
            { name: "Sample Collection", path: "/lab/collection" },
            { name: "Sample Processing", path: "/lab/processing" },
            { name: "Lab Worklist", path: "/lab/worklist" },
            { name: "Result Entry", path: "/lab/results" },
            { name: "Result Verification", path: "/lab/verify" },
            { name: "Lab Reports", path: "/lab/reports" },
            { name: "Lab History", path: "/lab/history" }
        ]
    },
    {
        name: "Radiology / Imaging",
        path: "/radiology",
        icon: "Bone",
        children: [
            { name: "Radiology Dashboard", path: "/radiology/dashboard" },
            { name: "Imaging Catalog", path: "/radiology/catalog" },
            { name: "Imaging Orders", path: "/radiology/orders" },
            { name: "Worklist", path: "/radiology/worklist" },
            { name: "Study Management", path: "/radiology/studies" },
            { name: "Image Studies", path: "/radiology/images" },
            { name: "Report Entry", path: "/radiology/reports" },
            { name: "Report Verification", path: "/radiology/verify" },
            { name: "Imaging Reports", path: "/radiology/imaging-reports" },
            { name: "Imaging History", path: "/radiology/history" }
        ]
    },
    {
        name: "Pharmacy",
        path: "/pharmacy",
        icon: "Pill",
        children: [
            { name: "Pharmacy Dashboard", path: "/pharmacy/dashboard" },
            { name: "Medicines", path: "/pharmacy/medicines" },
            { name: "Medicine Categories", path: "/pharmacy/categories" },
            { name: "Prescriptions", path: "/pharmacy/prescriptions" },
            { name: "Dispensing", path: "/pharmacy/dispensing" },
            { name: "Returns", path: "/pharmacy/returns" },
            { name: "Pharmacy Stock", path: "/pharmacy/stock" },
            { name: "Expiry Management", path: "/pharmacy/expiry" },
            { name: "Suppliers", path: "/pharmacy/suppliers" },
            { name: "Pharmacy Reports", path: "/pharmacy/reports" }
        ]
    },
    {
        name: "Emergency / Casualty",
        path: "/emergency",
        icon: "Ambulance",
        children: [
            { name: "Emergency Dashboard", path: "/emergency/dashboard" },
            { name: "Emergency Registration", path: "/emergency/registration" },
            { name: "Triage", path: "/emergency/triage" },
            { name: "Emergency Queue", path: "/emergency/queue" },
            { name: "Emergency Consultation", path: "/emergency/consultation" },
            { name: "Emergency Orders", path: "/emergency/orders" },
            { name: "Emergency Treatment", path: "/emergency/treatment" },
            { name: "Emergency Admission", path: "/emergency/admission" },
            { name: "Emergency Discharge", path: "/emergency/discharge" },
            { name: "Emergency Reports", path: "/emergency/reports" }
        ]
    },
    {
        name: "Operation Theatre",
        path: "/ot",
        icon: "Scissors",
        children: [
            { name: "OT Dashboard", path: "/ot/dashboard" },
            { name: "OT Schedule", path: "/ot/schedule" },
            { name: "Surgery Requests", path: "/ot/requests" },
            { name: "OT Booking", path: "/ot/booking" },
            { name: "Surgical Team", path: "/ot/team" },
            { name: "Pre-Operative Checklist", path: "/ot/preop" },
            { name: "Anesthesia", path: "/ot/anesthesia" },
            { name: "Intraoperative Notes", path: "/ot/intraop" },
            { name: "Post-Operative Notes", path: "/ot/postop" },
            { name: "OT Reports", path: "/ot/reports" }
        ]
    },
    {
        name: "Blood Bank",
        path: "/blood-bank",
        icon: "Droplet",
        children: [
            { name: "Blood Bank Dashboard", path: "/blood-bank/dashboard" },
            { name: "Donors", path: "/blood-bank/donors" },
            { name: "Blood Collection", path: "/blood-bank/collection" },
            { name: "Blood Inventory", path: "/blood-bank/inventory" },
            { name: "Blood Testing", path: "/blood-bank/testing" },
            { name: "Cross Matching", path: "/blood-bank/cross-matching" },
            { name: "Blood Requests", path: "/blood-bank/requests" },
            { name: "Blood Issue", path: "/blood-bank/issue" },
            { name: "Blood Return", path: "/blood-bank/return" },
            { name: "Blood Reports", path: "/blood-bank/reports" }
        ]
    },
    {
        name: "Inventory",
        path: "/inventory",
        icon: "Boxes",
        children: [
            { name: "Inventory Dashboard", path: "/inventory/dashboard" },
            { name: "Items", path: "/inventory/items" },
            { name: "Categories", path: "/inventory/categories" },
            { name: "Stock", path: "/inventory/stock" },
            { name: "Stock In", path: "/inventory/stock-in" },
            { name: "Stock Out", path: "/inventory/stock-out" },
            { name: "Stock Transfer", path: "/inventory/transfer" },
            { name: "Stock Adjustment", path: "/inventory/adjustment" },
            { name: "Expiry", path: "/inventory/expiry" },
            { name: "Low Stock", path: "/inventory/low-stock" },
            { name: "Inventory Reports", path: "/inventory/reports" }
        ]
    },
    {
        name: "Procurement",
        path: "/procurement",
        icon: "ShoppingCart",
        children: [
            { name: "Procurement Dashboard", path: "/procurement/dashboard" },
            { name: "Suppliers", path: "/procurement/suppliers" },
            { name: "Purchase Requests", path: "/procurement/requests" },
            { name: "Purchase Orders", path: "/procurement/orders" },
            { name: "Goods Receipt", path: "/procurement/receipt" },
            { name: "Purchase Invoices", path: "/procurement/invoices" },
            { name: "Procurement Reports", path: "/procurement/reports" }
        ]
    },
    {
        name: "Billing & Finance",
        path: "/finance",
        icon: "Banknote",
        children: [
            { name: "Billing Dashboard", path: "/finance/dashboard" },
            { name: "Create Invoice", path: "/finance/invoice/create" },
            { name: "Invoices", path: "/finance/invoices" },
            { name: "Payments", path: "/finance/payments" },
            { name: "Receipts", path: "/finance/receipts" },
            { name: "Refunds", path: "/finance/refunds" },
            { name: "Discounts", path: "/finance/discounts" },
            { name: "Credit Notes", path: "/finance/credit-notes" },
            { name: "Outstanding Payments", path: "/finance/outstanding" },
            { name: "Financial Reports", path: "/finance/reports" }
        ]
    },
    {
        name: "Insurance / TPA",
        path: "/insurance",
        icon: "ShieldAlert",
        children: [
            { name: "Insurance Providers", path: "/insurance/providers" },
            { name: "Patient Policies", path: "/insurance/policies" },
            { name: "Eligibility", path: "/insurance/eligibility" },
            { name: "Pre-Authorization", path: "/insurance/preauth" },
            { name: "Claims", path: "/insurance/claims" },
            { name: "Claim Documents", path: "/insurance/documents" },
            { name: "Claim Submission", path: "/insurance/submission" },
            { name: "Claim Tracking", path: "/insurance/tracking" },
            { name: "Claim Settlement", path: "/insurance/settlement" },
            { name: "Insurance Reports", path: "/insurance/reports" }
        ]
    },
    {
        name: "Reports & Analytics",
        path: "/reports",
        icon: "BarChart3",
        children: [
            { name: "Management Dashboard", path: "/reports/management" },
            { name: "Patient Reports", path: "/reports/patients" },
            { name: "Appointment Reports", path: "/reports/appointments" },
            { name: "Doctor Reports", path: "/reports/doctors" },
            { name: "Admission Reports", path: "/reports/admissions" },
            { name: "Discharge Reports", path: "/reports/discharges" },
            { name: "Bed Occupancy Reports", path: "/reports/beds" },
            { name: "Clinical Reports", path: "/reports/clinical" },
            { name: "Laboratory Reports", path: "/reports/lab" },
            { name: "Radiology Reports", path: "/reports/radiology" },
            { name: "Pharmacy Reports", path: "/reports/pharmacy" },
            { name: "Inventory Reports", path: "/reports/inventory" },
            { name: "Procurement Reports", path: "/reports/procurement" },
            { name: "Billing Reports", path: "/reports/billing" },
            { name: "Insurance Reports", path: "/reports/insurance" },
            { name: "Department Reports", path: "/reports/departments" }
        ]
    },
    {
        name: "Staff & HR",
        path: "/hr",
        icon: "UsersRound",
        children: [
            { name: "Employees", path: "/hr/employees" },
            { name: "Staff Profiles", path: "/hr/profiles" },
            { name: "Departments", path: "/hr/departments" },
            { name: "Designations", path: "/hr/designations" },
            { name: "Shifts", path: "/hr/shifts" },
            { name: "Attendance", path: "/hr/attendance" },
            { name: "Leave", path: "/hr/leave" },
            { name: "Staff Documents", path: "/hr/documents" },
            { name: "HR Reports", path: "/hr/reports" }
        ]
    },
    {
        name: "Notifications",
        path: "/notifications",
        icon: "Bell",
        children: [
            { name: "Notifications", path: "/notifications/list" },
            { name: "SMS", path: "/notifications/sms" },
            { name: "Email", path: "/notifications/email" },
            { name: "Templates", path: "/notifications/templates" },
            { name: "Notification Rules", path: "/notifications/rules" },
            { name: "Delivery History", path: "/notifications/history" }
        ]
    },
    {
        name: "Administration",
        path: "/admin",
        icon: "Lock",
        children: [
            { name: "Users", path: "/admin/users" },
            { name: "Add User", path: "/admin/users/add" },
            { name: "User Sessions", path: "/admin/sessions" },
            { name: "Roles", path: "/admin/roles" },
            { name: "Create Role", path: "/admin/roles/create" },
            { name: "Permissions", path: "/admin/permissions" },
            { name: "Role Assignments", path: "/admin/assignments" },
            { name: "Access Policies", path: "/admin/policies" }
        ]
    },
    {
        name: "Organization Management",
        path: "/organization",
        icon: "Building2",
        children: [
            { name: "Organization", path: "/organization/details" },
            { name: "Hospitals", path: "/organization/hospitals" },
            { name: "Branches", path: "/organization/branches" },
            { name: "Departments", path: "/organization/departments" },
            { name: "Organization Settings", path: "/organization/settings" },
            { name: "Hospital Settings", path: "/organization/hospital-settings" },
            { name: "Branch Settings", path: "/organization/branch-settings" }
        ]
    },
    {
        name: "Audit & Compliance",
        path: "/audit",
        icon: "ShieldCheck",
        children: [
            { name: "Audit Logs", path: "/audit/logs" },
            { name: "User Activity", path: "/audit/activity" },
            { name: "Login History", path: "/audit/login" },
            { name: "Data Access Logs", path: "/audit/access" },
            { name: "Record Change History", path: "/audit/changes" },
            { name: "Security Events", path: "/audit/security" },
            { name: "Deleted Records", path: "/audit/deleted" },
            { name: "Compliance Reports", path: "/audit/reports" }
        ]
    },
    {
        name: "System Configuration",
        path: "/config",
        icon: "Settings",
        children: [
            { name: "General Settings", path: "/config/general" },
            { name: "Localization", path: "/config/localization" },
            { name: "Currency", path: "/config/currency" },
            { name: "Timezone", path: "/config/timezone" },
            { name: "Numbering", path: "/config/numbering" },
            { name: "Appointment Settings", path: "/config/appointments" },
            { name: "Billing Settings", path: "/config/billing" },
            { name: "Clinical Settings", path: "/config/clinical" },
            { name: "Laboratory Settings", path: "/config/laboratory" },
            { name: "Pharmacy Settings", path: "/config/pharmacy" },
            { name: "Notification Settings", path: "/config/notifications" },
            { name: "Integration Settings", path: "/config/integrations" },
            { name: "API Settings", path: "/config/api" }
        ]
    }
];

const FULL_ACCESS = [
    { moduleName: "patient", permissions: ["patient.patient.view", "patient.patient.create", "patient.patient.update", "patient.patient.delete", "patient.patient.export"] },
    { moduleName: "appointment", permissions: ["appointment.appointment.view", "appointment.appointment.create", "appointment.appointment.update", "appointment.appointment.cancel"] },
    { moduleName: "admission", permissions: ["admission.admission.view", "admission.admission.create", "admission.admission.update", "admission.admission.transfer", "admission.admission.discharge"] },
    { moduleName: "clinical", permissions: ["clinical.record.view", "clinical.record.create", "clinical.record.update", "clinical.record.sign", "clinical.diagnosis.view", "clinical.diagnosis.create", "clinical.diagnosis.update", "clinical.prescription.view", "clinical.prescription.create", "clinical.prescription.update", "clinical.prescription.cancel"] },
    { moduleName: "nursing", permissions: ["nursing.vitals.view", "nursing.vitals.create", "nursing.vitals.update"] },
    { moduleName: "lab", permissions: ["lab.order.view", "lab.order.create", "lab.sample.collect", "lab.result.create", "lab.result.update", "lab.result.verify", "lab.report.publish"] },
    { moduleName: "radiology", permissions: ["radiology.order.view", "radiology.order.create", "radiology.study.perform", "radiology.report.create", "radiology.report.verify", "radiology.report.publish"] },
    { moduleName: "pharmacy", permissions: ["pharmacy.prescription.view", "pharmacy.dispense.create", "pharmacy.dispense.cancel", "pharmacy.stock.view"] },
    { moduleName: "billing", permissions: ["billing.invoice.view", "billing.invoice.create", "billing.invoice.update", "billing.invoice.cancel", "billing.payment.view", "billing.payment.create", "billing.refund.create"] },
    { moduleName: "inventory", permissions: ["inventory.stock.view", "inventory.stock.receive", "inventory.stock.issue", "inventory.stock.transfer", "inventory.stock.adjust"] },
    { moduleName: "procurement", permissions: ["procurement.request.create", "procurement.request.approve", "procurement.order.create", "procurement.order.approve"] },
    { moduleName: "user", permissions: ["user.user.view", "user.user.create", "user.user.update", "user.user.disable"] },
    { moduleName: "role", permissions: ["role.role.view", "role.role.create", "role.role.update", "role.role.delete", "role.role.assign"] },
    { moduleName: "audit", permissions: ["audit.audit.view", "audit.audit.export"] },
    { moduleName: "system", permissions: ["system.settings.view", "system.settings.update"] }
];

const AUDITOR_ACCESS = [
    { moduleName: "audit", permissions: ["audit.audit.view", "audit.audit.export"] },
    { moduleName: "role", permissions: ["role.role.view"] },
    { moduleName: "user", permissions: ["user.user.view"] },
    { moduleName: "system", permissions: ["system.settings.view"] }
];

const DOCTOR_ACCESS = [
    { moduleName: "patient", permissions: ["patient.patient.view"] },
    { moduleName: "appointment", permissions: ["appointment.appointment.view", "appointment.appointment.create"] },
    { moduleName: "admission", permissions: ["admission.admission.view"] },
    { moduleName: "clinical", permissions: ["clinical.record.view", "clinical.record.create", "clinical.record.update", "clinical.record.sign", "clinical.diagnosis.view", "clinical.diagnosis.create", "clinical.diagnosis.update", "clinical.prescription.view", "clinical.prescription.create", "clinical.prescription.cancel"] },
    { moduleName: "nursing", permissions: ["nursing.vitals.view"] },
    { moduleName: "lab", permissions: ["lab.order.view", "lab.order.create"] },
    { moduleName: "radiology", permissions: ["radiology.order.view", "radiology.order.create"] },
    { moduleName: "pharmacy", permissions: ["pharmacy.prescription.view"] }
];

const NURSE_ACCESS = [
    { moduleName: "patient", permissions: ["patient.patient.view"] },
    { moduleName: "admission", permissions: ["admission.admission.view"] },
    { moduleName: "clinical", permissions: ["clinical.record.view"] },
    { moduleName: "nursing", permissions: ["nursing.vitals.view", "nursing.vitals.create", "nursing.vitals.update"] }
];

const RECEPTIONIST_ACCESS = [
    { moduleName: "patient", permissions: ["patient.patient.view", "patient.patient.create", "patient.patient.update"] },
    { moduleName: "appointment", permissions: ["appointment.appointment.view", "appointment.appointment.create", "appointment.appointment.update", "appointment.appointment.cancel"] },
    { moduleName: "admission", permissions: ["admission.admission.view", "admission.admission.create"] },
    { moduleName: "billing", permissions: ["billing.invoice.view"] }
];

const LAB_TECHNICIAN_ACCESS = [
    { moduleName: "patient", permissions: ["patient.patient.view"] },
    { moduleName: "lab", permissions: ["lab.order.view", "lab.sample.collect", "lab.result.create", "lab.result.update"] }
];

const LAB_SUPERVISOR_ACCESS = [
    ...LAB_TECHNICIAN_ACCESS,
    { moduleName: "lab", permissions: ["lab.order.view", "lab.sample.collect", "lab.result.create", "lab.result.update", "lab.result.verify", "lab.report.publish"] }
];

const PHARMACIST_ACCESS = [
    { moduleName: "pharmacy", permissions: ["pharmacy.prescription.view", "pharmacy.dispense.create", "pharmacy.dispense.cancel", "pharmacy.stock.view"] }
];

const BILLING_OFFICER_ACCESS = [
    { moduleName: "billing", permissions: ["billing.invoice.view", "billing.invoice.create", "billing.invoice.update", "billing.payment.view", "billing.payment.create"] }
];

const INVENTORY_MANAGER_ACCESS = [
    { moduleName: "inventory", permissions: ["inventory.stock.view", "inventory.stock.receive", "inventory.stock.issue", "inventory.stock.transfer", "inventory.stock.adjust"] }
];

const BLOOD_BANK_TECHNICIAN_ACCESS = [
    { moduleName: "blood-bank", permissions: ["blood-bank.donor.view", "blood-bank.donor.create", "blood-bank.collection.create", "blood-bank.testing.create", "blood-bank.crossmatch.create", "blood-bank.inventory.view", "blood-bank.issue.create"] }
];

const BLOOD_BANK_MANAGER_ACCESS = [
    ...BLOOD_BANK_TECHNICIAN_ACCESS,
    { moduleName: "blood-bank", permissions: ["blood-bank.donor.update", "blood-bank.inventory.adjust", "blood-bank.issue.approve", "blood-bank.reports.view"] }
];

const roleDefinitions = [
    // PLATFORM LEVEL
    { role: "SYSTEM_SUPER_ADMIN", access: FULL_ACCESS },
    { role: "SYSTEM_AUDITOR", access: AUDITOR_ACCESS },
    { role: "SYSTEM_IT_ADMIN", access: [{ moduleName: "system", permissions: ["system.settings.view", "system.settings.update"] }] },
    
    // ORGANIZATION LEVEL
    { role: "ORGANIZATION_ADMIN", access: FULL_ACCESS },
    { role: "ORGANIZATION_AUDITOR", access: AUDITOR_ACCESS },
    
    // HOSPITAL LEVEL
    { role: "HOSPITAL_ADMIN", access: FULL_ACCESS },
    { role: "HOSPITAL_AUDITOR", access: AUDITOR_ACCESS },
    
    // BRANCH LEVEL
    { role: "BRANCH_MANAGER", access: FULL_ACCESS },
    
    // CLINICAL
    { role: "DOCTOR", access: DOCTOR_ACCESS },
    { role: "CONSULTANT", access: DOCTOR_ACCESS },
    { role: "NURSE", access: NURSE_ACCESS },
    { role: "NURSE_MANAGER", access: NURSE_ACCESS },
    
    // LABORATORY
    { role: "LAB_TECHNICIAN", access: LAB_TECHNICIAN_ACCESS },
    { role: "LAB_SUPERVISOR", access: LAB_SUPERVISOR_ACCESS },
    
    // RADIOLOGY
    { role: "RADIOLOGY_TECHNICIAN", access: [{ moduleName: "radiology", permissions: ["radiology.order.view", "radiology.study.perform"] }] },
    { role: "RADIOLOGIST", access: [{ moduleName: "radiology", permissions: ["radiology.order.view", "radiology.report.create", "radiology.report.verify", "radiology.report.publish"] }] },
    
    // PHARMACY
    { role: "PHARMACIST", access: PHARMACIST_ACCESS },
    { role: "PHARMACY_MANAGER", access: PHARMACIST_ACCESS },
    
    // RECEPTION / FRONT DESK
    { role: "RECEPTIONIST", access: RECEPTIONIST_ACCESS },
    { role: "FRONT_DESK_MANAGER", access: RECEPTIONIST_ACCESS },
    
    // BILLING / FINANCE
    { role: "CASHIER", access: [{ moduleName: "billing", permissions: ["billing.invoice.view", "billing.payment.view", "billing.payment.create"] }] },
    { role: "BILLING_OFFICER", access: BILLING_OFFICER_ACCESS },
    { role: "BILLING_MANAGER", access: [...BILLING_OFFICER_ACCESS, { moduleName: "billing", permissions: ["billing.refund.create"] }] },
    { role: "FINANCE_MANAGER", access: FULL_ACCESS }, 
    
    // INVENTORY / PROCUREMENT
    { role: "STOREKEEPER", access: [{ moduleName: "inventory", permissions: ["inventory.stock.view", "inventory.stock.receive", "inventory.stock.issue", "inventory.stock.transfer"] }] },
    { role: "INVENTORY_MANAGER", access: INVENTORY_MANAGER_ACCESS },
    { role: "PROCUREMENT_OFFICER", access: [{ moduleName: "procurement", permissions: ["procurement.request.create", "procurement.order.create"] }] },
    { role: "PROCUREMENT_MANAGER", access: [{ moduleName: "procurement", permissions: ["procurement.request.create", "procurement.request.approve", "procurement.order.create", "procurement.order.approve"] }] },
    
    // HR
    { role: "HR_OFFICER", access: [] },
    { role: "HR_MANAGER", access: [] },
    
    // EMERGENCY
    { role: "EMERGENCY_DOCTOR", access: DOCTOR_ACCESS },
    { role: "EMERGENCY_NURSE", access: NURSE_ACCESS },
    { role: "EMERGENCY_MANAGER", access: FULL_ACCESS },
    
    // OPERATION THEATRE
    { role: "OT_NURSE", access: NURSE_ACCESS },
    { role: "OT_MANAGER", access: FULL_ACCESS },
    
    // BLOOD BANK
    { role: "BLOOD_BANK_TECHNICIAN", access: BLOOD_BANK_TECHNICIAN_ACCESS },
    { role: "BLOOD_BANK_MANAGER", access: BLOOD_BANK_MANAGER_ACCESS },
    
    // INSURANCE
    { role: "INSURANCE_OFFICER", access: [] },
    { role: "INSURANCE_MANAGER", access: [] }
];

async function seedDatabase() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully!");

        console.log("Clearing existing seed data...");
        await User.deleteMany({});
        await Role.deleteMany({});
        await RoleHierarchy.deleteMany({});
        await Menu.deleteMany({});
        await Organization.deleteMany({});
        await Department.deleteMany({});
        await Designation.deleteMany({});
        await Specialization.deleteMany({});
        await LabTest.deleteMany({});
        await RadiologyProcedure.deleteMany({});
        await MedicineCategory.deleteMany({});
        await Medicine.deleteMany({});
        await PharmacySupplier.deleteMany({});
        await Staff.deleteMany({});
        await Shift.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});
        await StaffDocument.deleteMany({});

        // 1. Seed Menus
        console.log("Seeding menus...");
        for (const menuGroup of menusData) {
            const { children, ...parentData } = menuGroup;
            // @ts-ignore
            const parentMenu = await Menu.create(parentData);
            if (children && children.length > 0) {
                const childIds = [];
                for (const child of children) {
                    const childMenu = await Menu.create(child);
                    childIds.push(childMenu._id);
                }
                parentMenu.children = childIds;
                await parentMenu.save();
            }
        }
        console.log(`✅ Successfully seeded ${menusData.length} parent menus with their children.`);

        // 2. Seed Roles
        console.log("Seeding roles...");
        const roleDocs: Record<string, any> = {};
        for (const r of roleDefinitions) {
            const role = await Role.create(r);
            roleDocs[r.role] = role;
        }
        console.log(`✅ Successfully seeded ${roleDefinitions.length} roles.`);

        // 3. Seed Role Hierarchy
        console.log("Seeding role hierarchy...");
        const hierarchies = [
            { parent: "SYSTEM_SUPER_ADMIN", target: "ORGANIZATION_ADMIN", permissions: ["role.assign", "role.create"] },
            { parent: "ORGANIZATION_ADMIN", target: "HOSPITAL_ADMIN", permissions: ["role.assign", "role.create"] },
            { parent: "HOSPITAL_ADMIN", target: "BRANCH_MANAGER", permissions: ["role.assign", "role.create"] },
            { parent: "BRANCH_MANAGER", target: "DOCTOR", permissions: ["role.assign"] },
            { parent: "BRANCH_MANAGER", target: "NURSE", permissions: ["role.assign"] },
            
            // Inheritance links
            { parent: "NURSE_MANAGER", target: "NURSE", permissions: ["INHERIT"] },
            { parent: "PHARMACY_MANAGER", target: "PHARMACIST", permissions: ["INHERIT"] },
            { parent: "BILLING_MANAGER", target: "BILLING_OFFICER", permissions: ["INHERIT"] },
            { parent: "LAB_SUPERVISOR", target: "LAB_TECHNICIAN", permissions: ["INHERIT"] },
            { parent: "INVENTORY_MANAGER", target: "STOREKEEPER", permissions: ["INHERIT"] }
        ];

        for (const h of hierarchies) {
            if (roleDocs[h.parent] && roleDocs[h.target]) {
                await RoleHierarchy.create({
                    parentRole: roleDocs[h.parent]._id,
                    targetRole: roleDocs[h.target]._id,
                    permissions: h.permissions
                });
            }
        }
        console.log("✅ Successfully seeded role hierarchy.");

        // 4. Seed Admin User
        console.log("Seeding super admin user...");
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
        const adminUser = await User.create({
            name: "Super Admin",
            email: DEFAULT_ADMIN_EMAIL,
            password: hashedPassword,
            gender: "MALE",
            role: roleDocs["SYSTEM_SUPER_ADMIN"]._id,
            isActive: true
        });
        console.log(`✅ Successfully seeded admin user: ${adminUser.email}`);

        // 5. Seed Default Organization & Main Branch
        console.log("Seeding organization & branch...");
        const defaultOrg = await Organization.create({
            organizationName: "Medistra Healthcare System",
            organizationId: "MEDISTRA-MAIN",
            organizationType: "HOSPITAL",
            branchType: "MAIN",
            email: "info@medistra.hospital",
            phone: "+91 33 2345 6789",
            address: "12 Medical Enclave, Central Avenue, Kolkata",
            city: "Kolkata",
            state: "West Bengal",
            pincode: "700001",
            country: "India",
            capacity: 450,
            metadata: {
                nabhAccredited: true,
                emergencyBeds: 35,
                icuBeds: 60,
                operatingTheatres: 12
            },
            isActive: true
        });
        console.log(`✅ Successfully seeded organization: ${defaultOrg.organizationName}`);

        // 6. Seed Standard Departments
        console.log("Seeding standard departments...");
        const defaultDepartments = [
            { name: "Emergency & Trauma", code: "EMER", location: "Ground Floor - Block A", phoneExtension: "101", description: "24/7 Emergency casualty care, acute trauma, and triage" },
            { name: "Cardiology", code: "CARD", location: "2nd Floor - Block B", phoneExtension: "201", description: "Interventional cardiology, non-invasive cardiac care, and cath lab" },
            { name: "Neurology", code: "NEUR", location: "3rd Floor - Block B", phoneExtension: "301", description: "Neurology and neurosurgical consultations" },
            { name: "Pediatrics", code: "PEDI", location: "1st Floor - Block C", phoneExtension: "105", description: "Comprehensive pediatric and neonatal care" },
            { name: "Orthopedics", code: "ORTH", location: "2nd Floor - Block A", phoneExtension: "205", description: "Orthopedic surgery, trauma, and joint replacements" },
            { name: "General Medicine", code: "GMED", location: "1st Floor - Block A", phoneExtension: "102", description: "Adult general health, chronic disease, and internal medicine" },
            { name: "General Surgery", code: "GSUR", location: "3rd Floor - Block A", phoneExtension: "302", description: "Elective and emergency general surgeries" },
            { name: "Radiology", code: "RADI", location: "Ground Floor - Block B", phoneExtension: "103", description: "Diagnostic X-ray, CT, MRI, and Ultrasound imaging" },
            { name: "Laboratory", code: "PATH", location: "Ground Floor - Block B", phoneExtension: "104", description: "Hematology, biochemistry, and microbiology diagnostics" },
            { name: "Pharmacy", code: "PHAR", location: "Ground Floor - Main Lobby", phoneExtension: "100", description: "Inpatient and outpatient pharmaceutical dispensing" },
            { name: "Obstetrics & Gynecology", code: "OBGY", location: "2nd Floor - Block C", phoneExtension: "208", description: "Maternity, labor, and gynecological care" },
            { name: "Intensive Care Unit (ICU)", code: "ICU", location: "3rd Floor - Block C", phoneExtension: "333", description: "Critical intensive care and life support" }
        ];

        const createdDepts: Record<string, any> = {};
        for (const dept of defaultDepartments) {
            const d = await Department.create({
                ...dept,
                organizationId: defaultOrg._id
            });
            createdDepts[d.code] = d;
        }
        console.log(`✅ Successfully seeded ${defaultDepartments.length} clinical departments.`);

        // 7. Seed Standard Designations
        console.log("Seeding designations...");
        const defaultDesignations = [
            { name: "Senior Consultant", code: "SR-CONS", department: "Medical", level: "Senior", description: "Senior specialty physician" },
            { name: "Consultant Physician", code: "CONS-MD", department: "Medical", level: "Mid-Level", description: "Attending consultant doctor" },
            { name: "Resident Medical Officer", code: "RMO", department: "Medical", level: "Junior", description: "Ward and emergency duty doctor" },
            { name: "Nursing Superintendent", code: "NRS-SUPT", department: "Nursing", level: "Executive", description: "Head of nursing services" },
            { name: "Head Nurse / Ward In-Charge", code: "HD-NRS", department: "Nursing", level: "Senior", description: "Ward shift supervisor" },
            { name: "Staff Nurse", code: "STF-NRS", department: "Nursing", level: "Mid-Level", description: "Bedside patient care nurse" },
            { name: "Chief Pharmacist", code: "CHF-PHAR", department: "Pharmacy", level: "Senior", description: "Head of pharmacy operations" },
            { name: "Staff Pharmacist", code: "STF-PHAR", department: "Pharmacy", level: "Mid-Level", description: "Dispensing pharmacist" },
            { name: "Senior Lab Technologist", code: "SR-TECH", department: "Laboratory", level: "Senior", description: "Senior diagnostic technologist" },
            { name: "Laboratory Technician", code: "LAB-TECH", department: "Laboratory", level: "Mid-Level", description: "Sample testing technician" },
            { name: "Radiology Technologist", code: "RAD-TECH", department: "Radiology", level: "Mid-Level", description: "X-ray, CT, MRI operator" },
            { name: "Receptionist / Front Desk", code: "REC-EXEC", department: "Administration", level: "Junior", description: "Patient intake executive" },
            { name: "Billing Officer", code: "BILL-OFF", department: "Finance", level: "Mid-Level", description: "Patient invoicing and cashier" },
            { name: "Hospital Administrator", code: "HOSP-ADM", department: "Administration", level: "Executive", description: "Hospital operational manager" }
        ];

        for (const desig of defaultDesignations) {
            await Designation.create(desig);
        }
        console.log(`✅ Successfully seeded ${defaultDesignations.length} designations.`);

        // 8. Seed Standard Specializations
        console.log("Seeding specializations...");
        const defaultSpecializations = [
            { name: "Interventional Cardiology", code: "CARD", departmentId: createdDepts["CARD"]?._id, description: "Angioplasty, stenting, cardiac catheterization" },
            { name: "Clinical Neurology", code: "NEUR", departmentId: createdDepts["NEUR"]?._id, description: "Stroke, epilepsy, and neurological disorders" },
            { name: "Pediatric Medicine", code: "PEDI", departmentId: createdDepts["PEDI"]?._id, description: "Child growth, vaccinations, and pediatric illnesses" },
            { name: "Orthopedic Surgery", code: "ORTH", departmentId: createdDepts["ORTH"]?._id, description: "Bone fractures, arthroscopy, joint replacement" },
            { name: "General & Laparoscopic Surgery", code: "GSUR", departmentId: createdDepts["GSUR"]?._id, description: "Minimally invasive general surgical procedures" },
            { name: "Internal Medicine", code: "IMED", departmentId: createdDepts["GMED"]?._id, description: "Diabetes, hypertension, multisystem conditions" },
            { name: "Diagnostic Radiology", code: "DRAD", departmentId: createdDepts["RADI"]?._id, description: "CT, MRI, Ultrasound, and Digital X-ray analysis" },
            { name: "Clinical Pathology", code: "PATH", departmentId: createdDepts["PATH"]?._id, description: "Hematology, biochemistry, and histology analysis" },
            { name: "Emergency Medicine", code: "EMED", departmentId: createdDepts["EMER"]?._id, description: "Acute resuscitation, trauma, and critical emergency triage" },
            { name: "Critical Care Medicine", code: "CCM", departmentId: createdDepts["ICU"]?._id, description: "ICU hemodynamics, ventilator care, and multi-organ support" }
        ];

        for (const spec of defaultSpecializations) {
            await Specialization.create(spec);
        }
        console.log(`✅ Successfully seeded ${defaultSpecializations.length} medical specializations.`);

        // 9. Seed Standard Lab Tests
        console.log("Seeding diagnostic lab tests...");
        const defaultLabTests = [
            { name: "Complete Blood Count (CBC)", code: "CBC-01", category: "Hematology", price: 350, normalRange: "Hb: 13.5-17.5 g/dL, WBC: 4-11k", turnaroundTime: "2 Hours" },
            { name: "Liver Function Test (LFT)", code: "LFT-01", category: "Biochemistry", price: 650, normalRange: "Bilirubin: 0.2-1.2 mg/dL, SGPT: 7-56 U/L", turnaroundTime: "4 Hours" },
            { name: "Kidney Function Test (KFT)", code: "KFT-01", category: "Biochemistry", price: 600, normalRange: "Creatinine: 0.7-1.3 mg/dL, Urea: 15-45 mg/dL", turnaroundTime: "4 Hours" },
            { name: "Lipid Profile Panel", code: "LIP-01", category: "Biochemistry", price: 750, normalRange: "Total Chol: <200 mg/dL, TG: <150 mg/dL", turnaroundTime: "4 Hours" },
            { name: "Fasting Blood Glucose", code: "GLU-F", category: "Biochemistry", price: 120, normalRange: "70 - 100 mg/dL", turnaroundTime: "1 Hour" },
            { name: "HbA1c Glycated Hemoglobin", code: "HBA1C", category: "Biochemistry", price: 500, normalRange: "< 5.7 %", turnaroundTime: "2 Hours" },
            { name: "Urine Routine & Microscopic", code: "UR-01", category: "Microbiology", price: 200, normalRange: "Clear, pH 5.5-7.0, Protein Nil", turnaroundTime: "1 Hour" },
            { name: "Thyroid Profile (T3, T4, TSH)", code: "THY-01", category: "Serology", price: 850, normalRange: "TSH: 0.4 - 4.0 uIU/mL", turnaroundTime: "6 Hours" }
        ];

        for (const test of defaultLabTests) {
            await LabTest.create(test);
        }
        console.log(`✅ Successfully seeded ${defaultLabTests.length} diagnostic lab tests.`);

        // 10. Seed Standard Radiology Procedures
        console.log("Seeding radiology procedures...");
        const defaultRadiologyProcedures = [
            { name: "X-Ray Chest PA View", code: "XR-CH-01", modality: "X-RAY", bodyPart: "Chest", price: 600, preparationInstructions: "Remove metallic necklaces & clothing with metal hooks.", durationMinutes: 10, requiresContrast: false },
            { name: "X-Ray Knee Joint AP & Lateral", code: "XR-KN-02", modality: "X-RAY", bodyPart: "Knee Joint", price: 800, preparationInstructions: "Wear loose clothing.", durationMinutes: 10, requiresContrast: false },
            { name: "X-Ray Lumbo-Sacral (LS) Spine", code: "XR-SP-03", modality: "X-RAY", bodyPart: "Spine", price: 950, preparationInstructions: "Bowel clearance recommended before scan.", durationMinutes: 15, requiresContrast: false },
            { name: "NCCT Brain (Non-Contrast Head CT)", code: "CT-BR-01", modality: "CT", bodyPart: "Brain", price: 2500, preparationInstructions: "No specific fasting required.", durationMinutes: 15, requiresContrast: false },
            { name: "CECT Abdomen & Pelvis (Triple Phase)", code: "CT-AB-02", modality: "CT", bodyPart: "Abdomen", price: 5500, preparationInstructions: "4 hours fasting. Serum creatinine report required.", durationMinutes: 30, requiresContrast: true },
            { name: "HRCT Chest (High Resolution CT)", code: "CT-CH-03", modality: "CT", bodyPart: "Chest", price: 3200, preparationInstructions: "Breath hold coaching required before scan.", durationMinutes: 15, requiresContrast: false },
            { name: "MRI Brain (Non-Contrast 3.0T)", code: "MRI-BR-01", modality: "MRI", bodyPart: "Brain", price: 5500, preparationInstructions: "Screen for cardiac pacemakers, surgical clips, metal implants.", durationMinutes: 30, requiresContrast: false },
            { name: "Ultrasound Whole Abdomen & Pelvis", code: "USG-AB-01", modality: "ULTRASOUND", bodyPart: "Abdomen", price: 1200, preparationInstructions: "6 hours fasting, full urinary bladder required.", durationMinutes: 20, requiresContrast: false }
        ];

        for (const proc of defaultRadiologyProcedures) {
            await RadiologyProcedure.create(proc);
        }
        console.log(`✅ Successfully seeded ${defaultRadiologyProcedures.length} radiology procedures.`);

        // 11. Seed Pharmacy Categories, Suppliers & Essential Medicines
        console.log("Seeding pharmacy categories, suppliers & essential medicines...");
        const defaultMedicineCategories = [
            { name: "Antibiotics", code: "ABX", description: "Antimicrobial pharmaceuticals", storageCondition: "COOL_DRY" as const, requiresPrescription: true },
            { name: "Analgesics & Antipyretics", code: "ANALG", description: "Pain relief and fever reduction", storageCondition: "ROOM_TEMPERATURE" as const, requiresPrescription: false },
            { name: "Cardiovascular", code: "CARD", description: "Blood pressure, antiarrhythmic, and heart medication", storageCondition: "ROOM_TEMPERATURE" as const, requiresPrescription: true },
            { name: "Gastrointestinal", code: "GI", description: "Antacids, antiemetics, and PPIs", storageCondition: "ROOM_TEMPERATURE" as const, requiresPrescription: false },
            { name: "Antidiabetic", code: "DIAB", description: "Oral hypoglycemics and insulin formulations", storageCondition: "ROOM_TEMPERATURE" as const, requiresPrescription: true }
        ];

        for (const cat of defaultMedicineCategories) {
            await MedicineCategory.create(cat);
        }

        const defaultSupplier = await PharmacySupplier.create({
            name: "Apex Healthcare Distribution",
            code: "APEX-DIST",
            contactPerson: "Rajesh Sengupta",
            phone: "+91 9830012345",
            email: "orders@apexhealth.in",
            address: "Plot 44, Salt Lake Sector V, Kolkata",
            gstin: "19AAACA1234A1Z5",
            dlNumber: "DL-WB-20B-987654",
            paymentTerms: "NET_30",
            leadTimeDays: 2,
            categoriesSupplied: ["Antibiotics", "Cardiovascular", "Analgesics"],
            rating: 4.9,
            isActive: true
        });

        const defaultMedicines = [
            { name: "Paracetamol 500mg", category: "Analgesics & Antipyretics", genericName: "Acetaminophen", dosageForm: "TABLET", manufacturer: "GlaxoSmithKline", batchNumber: "PCM-2026-01", unitPrice: 2.5, stockQuantity: 2500, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
            { name: "Amoxicillin 500mg", category: "Antibiotics", genericName: "Amoxicillin Trihydrate", dosageForm: "CAPSULE", manufacturer: "Cipla Ltd", batchNumber: "AMX-2026-04", unitPrice: 8.0, stockQuantity: 1200, expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000) },
            { name: "Metformin 500mg", category: "Antidiabetic", genericName: "Metformin Hydrochloride", dosageForm: "TABLET", manufacturer: "Sun Pharma", batchNumber: "MET-2026-02", unitPrice: 4.0, stockQuantity: 1800, expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000) },
            { name: "Atorvastatin 20mg", category: "Cardiovascular", genericName: "Atorvastatin Calcium", dosageForm: "TABLET", manufacturer: "Torrent Pharma", batchNumber: "ATV-2026-07", unitPrice: 12.5, stockQuantity: 950, expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000) },
            { name: "Pantoprazole 40mg", category: "Gastrointestinal", genericName: "Pantoprazole Sodium", dosageForm: "TABLET", manufacturer: "Alkem Labs", batchNumber: "PAN-2026-03", unitPrice: 9.0, stockQuantity: 1400, expiryDate: new Date(Date.now() + 380 * 24 * 60 * 60 * 1000) }
        ];

        for (const med of defaultMedicines) {
            await Medicine.create(med);
        }
        console.log(`✅ Successfully seeded pharmacy catalog with essential medicines.`);

        // 8. Seed Blood Bank Reference Donors & Inventory
        console.log("Seeding Blood Bank reference donors & inventory...");
        await BloodDonor.deleteMany({});
        await BloodInventory.deleteMany({});

        const sampleDonors = [
            { donorCode: "DNR-20260904-101", firstName: "Rahul", lastName: "Sharma", fullName: "Rahul Sharma", gender: "Male", age: 29, bloodGroup: "O+", contactNumber: "+91 98765 43210", email: "rahul.sharma@example.com", weight: 72, hemoglobin: 14.8, bloodPressure: "120/80", pulse: 72, donationCount: 4, eligibilityStatus: "ELIGIBLE", isVoluntary: true, address: "Sector 14, Rohini", city: "New Delhi" },
            { donorCode: "DNR-20260904-102", firstName: "Pooja", lastName: "Verma", fullName: "Pooja Verma", gender: "Female", age: 26, bloodGroup: "A+", contactNumber: "+91 98112 34567", email: "pooja.verma@example.com", weight: 58, hemoglobin: 13.2, bloodPressure: "118/76", pulse: 76, donationCount: 2, eligibilityStatus: "ELIGIBLE", isVoluntary: true, address: "Saket, South Delhi", city: "New Delhi" },
            { donorCode: "DNR-20260904-103", firstName: "Amit", lastName: "Patel", fullName: "Amit Patel", gender: "Male", age: 34, bloodGroup: "B+", contactNumber: "+91 99887 65432", email: "amit.patel@example.com", weight: 78, hemoglobin: 15.0, bloodPressure: "122/82", pulse: 70, donationCount: 5, eligibilityStatus: "ELIGIBLE", isVoluntary: true, address: "Dwarka Sector 9", city: "New Delhi" },
            { donorCode: "DNR-20260904-104", firstName: "Ananya", lastName: "Iyer", fullName: "Ananya Iyer", gender: "Female", age: 31, bloodGroup: "AB+", contactNumber: "+91 97654 32109", email: "ananya.iyer@example.com", weight: 62, hemoglobin: 13.6, bloodPressure: "116/74", pulse: 74, donationCount: 3, eligibilityStatus: "ELIGIBLE", isVoluntary: true, address: "Vasant Kunj", city: "New Delhi" },
            { donorCode: "DNR-20260904-105", firstName: "Vikas", lastName: "Malhotra", fullName: "Vikas Malhotra", gender: "Male", age: 40, bloodGroup: "O-", contactNumber: "+91 98234 56789", email: "vikas.m@example.com", weight: 80, hemoglobin: 14.5, bloodPressure: "124/80", pulse: 68, donationCount: 8, eligibilityStatus: "ELIGIBLE", isVoluntary: true, address: "Mayur Vihar Phase 1", city: "New Delhi" }
        ];

        for (const d of sampleDonors) {
            await BloodDonor.create(d);
        }

        const sampleInventory = [
            { bagNumber: "BAG-20260904-001", bloodGroup: "O+", componentType: "PRBC", volumeMl: 350, unitsAvailable: 1, storageLocation: "Blood Refrigerator 1 (2-6°C)", collectionDate: new Date(), expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), ttiTestStatus: "TESTED_SAFE", processingFee: 1450, status: "AVAILABLE" },
            { bagNumber: "BAG-20260904-002", bloodGroup: "A+", componentType: "PRBC", volumeMl: 350, unitsAvailable: 1, storageLocation: "Blood Refrigerator 1 (2-6°C)", collectionDate: new Date(), expiryDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), ttiTestStatus: "TESTED_SAFE", processingFee: 1450, status: "AVAILABLE" },
            { bagNumber: "BAG-20260904-003", bloodGroup: "B+", componentType: "PRBC", volumeMl: 350, unitsAvailable: 1, storageLocation: "Blood Refrigerator 1 (2-6°C)", collectionDate: new Date(), expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), ttiTestStatus: "TESTED_SAFE", processingFee: 1450, status: "AVAILABLE" },
            { bagNumber: "BAG-20260904-004", bloodGroup: "AB+", componentType: "FFP", volumeMl: 200, unitsAvailable: 1, storageLocation: "Deep Freezer -40°C", collectionDate: new Date(), expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), ttiTestStatus: "TESTED_SAFE", processingFee: 1200, status: "AVAILABLE" },
            { bagNumber: "BAG-20260904-005", bloodGroup: "O-", componentType: "PRBC", volumeMl: 350, unitsAvailable: 1, storageLocation: "Blood Refrigerator 2 (2-6°C)", collectionDate: new Date(), expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), ttiTestStatus: "TESTED_SAFE", processingFee: 1800, status: "AVAILABLE" },
            { bagNumber: "BAG-20260904-006", bloodGroup: "O+", componentType: "PLATELETS", volumeMl: 60, unitsAvailable: 1, storageLocation: "Platelet Agitator (22°C)", collectionDate: new Date(), expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), ttiTestStatus: "TESTED_SAFE", processingFee: 2200, status: "AVAILABLE" }
        ];

        for (const inv of sampleInventory) {
            await BloodInventory.create(inv);
        }
        console.log(`✅ Successfully seeded Blood Bank donors and certified inventory.`);

        // 9. Seed Inventory Categories & Consumables Catalog
        console.log("Seeding Inventory reference categories & catalog items...");
        await InventoryCategory.deleteMany({});
        await InventoryItem.deleteMany({});

        const defaultCategories = [
            { code: "CAT-SURG", name: "Surgical Disposables & Consumables", description: "Sutures, surgical blades, disposable gowns, drapes, suction tips", itemCount: 2 },
            { code: "CAT-ICU", name: "Critical Care & ICU Supplies", description: "Endotracheal tubes, central venous lines, arterial line sets, ventilator circuits", itemCount: 1 },
            { code: "CAT-CONSUM", name: "General Ward Consumables", description: "IV cannulas, infusion sets, syringes, needles, alcohol swabs, adhesive tape", itemCount: 2 },
            { code: "CAT-BIOMED", name: "Biomedical & Equipment Spares", description: "ECG cables, SpO2 sensors, NIBP cuffs, defibrillator pads, thermal paper", itemCount: 1 },
            { code: "CAT-CSSD", name: "CSSD & Sterilization Packaging", description: "Bowie-Dick test packs, biological indicators, autoclave rolls, chemical indicators", itemCount: 1 }
        ];

        for (const cat of defaultCategories) {
            await InventoryCategory.create(cat);
        }

        const defaultItems = [
            { code: "ITM-1001", name: "Disposable Sterile Surgical Gloves (Size 7.5)", category: "Surgical Disposables & Consumables", unit: "Box of 100", unitPrice: 850, currentStock: 85, reorderLevel: 25, safetyStock: 15, storageLocation: "Central Warehouse - Rack A1", supplierName: "Ansell Healthcare", description: "Powder-free sterile latex gloves with textured grip." },
            { code: "ITM-1002", name: "IV Cannula 20G with Injection Port", category: "General Ward Consumables", unit: "Box of 50", unitPrice: 420, currentStock: 120, reorderLevel: 30, safetyStock: 20, storageLocation: "Central Warehouse - Rack B2", supplierName: "Becton Dickinson (BD)", description: "PTFE radiopaque catheter with flashback chamber." },
            { code: "ITM-1003", name: "Endotracheal Tube Cuffed 7.5mm", category: "Critical Care & ICU Supplies", unit: "Pack of 10", unitPrice: 650, currentStock: 35, reorderLevel: 15, safetyStock: 10, storageLocation: "ICU Satellite Store - Bin 3", supplierName: "Teleflex Medical", description: "High-volume low-pressure cuff with Murphy eye." },
            { code: "ITM-1004", name: "Monocryl Suture 3-0 Reverse Cutting", category: "Surgical Disposables & Consumables", unit: "Box of 36", unitPrice: 2450, currentStock: 24, reorderLevel: 10, safetyStock: 8, storageLocation: "OT Sterile Sub-Store - Shelf 2", supplierName: "Ethicon Johnson & Johnson", description: "Absorbable synthetic monofilament suture." },
            { code: "ITM-1005", name: "ECG Thermal Recording Paper 80mm", category: "Biomedical & Equipment Spares", unit: "Pack of 10", unitPrice: 380, currentStock: 45, reorderLevel: 15, safetyStock: 10, storageLocation: "Central Warehouse - Rack D1", supplierName: "Schiller Medical", description: "High-contrast thermal grid paper rolls for 12-lead ECG." },
            { code: "ITM-1006", name: "Adult Oxygen Nasal Cannula with Tubing", category: "General Ward Consumables", unit: "Pack of 20", unitPrice: 280, currentStock: 90, reorderLevel: 25, safetyStock: 15, storageLocation: "Central Warehouse - Rack B1", supplierName: "Intersurgical", description: "Soft curved prongs with 2m crush-resistant star lumen tubing." },
            { code: "ITM-1007", name: "CSSD Autoclave Sterilization Reel 15cm x 200m", category: "CSSD & Sterilization Packaging", unit: "Roll", unitPrice: 1250, currentStock: 18, reorderLevel: 5, safetyStock: 4, storageLocation: "CSSD Store - Rack 1", supplierName: "Wipak Medical", description: "Multi-layer laminate with steam chemical indicators." }
        ];

        for (const itm of defaultItems) {
            await InventoryItem.create(itm);
        }
        console.log(`✅ Successfully seeded Inventory categories and essential hospital consumables.`);

        // 10. Seed Procurement Approved Hospital Suppliers
        console.log("Seeding Procurement approved hospital suppliers...");
        await ProcurementSupplier.deleteMany({});
        const defaultSuppliers = [
            { code: "SUP-101", name: "Ansell Healthcare India Ltd", contactPerson: "Rajesh Kumar", phone: "+91 98201 11223", email: "orders.india@ansell.com", address: "Plot 14, MIDC Industrial Area, Mumbai, Maharashtra", gstin: "27AABCA1234F1Z1", panNumber: "AABCA1234F", paymentTerms: "NET_30", leadTimeDays: 4, categoriesSupplied: ["Surgical Disposables & Consumables", "PPE & Barrier Protection"], rating: 4.9, status: "ACTIVE", bankDetails: { bankName: "HDFC Bank", accountNumber: "50200012345678", ifscCode: "HDFC0000123" } },
            { code: "SUP-102", name: "Becton Dickinson (BD) Medical", contactPerson: "Sunita Sharma", phone: "+91 98112 33445", email: "hospital.orders@bd.com", address: "DLF Cyber City, Tower B, Gurugram, Haryana", gstin: "06AABCB5678G1Z2", panNumber: "AABCB5678G", paymentTerms: "NET_45", leadTimeDays: 3, categoriesSupplied: ["General Ward Consumables", "Vascular Access", "Infusion Therapy"], rating: 4.8, status: "ACTIVE", bankDetails: { bankName: "Citibank India", accountNumber: "1002345678", ifscCode: "CITI0000003" } },
            { code: "SUP-103", name: "Teleflex Medical Technologies", contactPerson: "Vikram Mehta", phone: "+91 98450 55667", email: "procure@teleflex.in", address: "Electronic City, Phase 1, Bangalore, Karnataka", gstin: "29AABCT9012H1Z3", panNumber: "AABCT9012H", paymentTerms: "NET_30", leadTimeDays: 5, categoriesSupplied: ["Critical Care & ICU Supplies", "Anesthesia & Respiratory"], rating: 4.7, status: "ACTIVE", bankDetails: { bankName: "ICICI Bank", accountNumber: "000205001234", ifscCode: "ICIC0000002" } },
            { code: "SUP-104", name: "Ethicon Johnson & Johnson India", contactPerson: "Ananya Deshmukh", phone: "+91 98220 77889", email: "surgical.care@jnj.com", address: "LBS Marg, Mulund West, Mumbai, Maharashtra", gstin: "27AABCJ3456J1Z4", panNumber: "AABCJ3456J", paymentTerms: "NET_60", leadTimeDays: 4, categoriesSupplied: ["Surgical Disposables & Consumables", "Wound Closure & Sutures"], rating: 4.9, status: "ACTIVE", bankDetails: { bankName: "State Bank of India", accountNumber: "30012345678", ifscCode: "SBIN0000300" } },
            { code: "SUP-105", name: "Schiller Healthcare India Pvt Ltd", contactPerson: "Deepak Patel", phone: "+91 98330 99001", email: "biomed.support@schillerindia.com", address: "Andheri East, MIDC, Mumbai, Maharashtra", gstin: "27AABCS7890K1Z5", panNumber: "AABCS7890K", paymentTerms: "NET_30", leadTimeDays: 6, categoriesSupplied: ["Biomedical & Equipment Spares", "Cardiology Diagnostics"], rating: 4.6, status: "ACTIVE", bankDetails: { bankName: "Axis Bank", accountNumber: "915020012345678", ifscCode: "UTIB0000004" } },
            { code: "SUP-106", name: "Wipak Medical Packaging Solutions", contactPerson: "Kavita Rao", phone: "+91 98860 22334", email: "sales.india@wipak.com", address: "Peenya Industrial Area, Bangalore, Karnataka", gstin: "29AABCW1234L1Z6", panNumber: "AABCW1234L", paymentTerms: "NET_30", leadTimeDays: 5, categoriesSupplied: ["CSSD & Sterilization Packaging"], rating: 4.8, status: "ACTIVE", bankDetails: { bankName: "Standard Chartered", accountNumber: "22010012345", ifscCode: "SCBL0036001" } }
        ];

        for (const sup of defaultSuppliers) {
            await ProcurementSupplier.create(sup);
        }
        console.log(`✅ Successfully seeded Procurement approved hospital suppliers.`);

        // 11. Seed Representative Staff, Shifts, Attendance, Leaves & Compliance Documents
        console.log("Seeding representative Staff & HR records...");
        const staffRoles = await Role.find({ role: { $in: ["NURSE", "PHARMACIST", "LAB_TECHNICIAN", "RECEPTIONIST", "BILLING_OFFICER"] } }).lean();
        const roleMap: Record<string, any> = {};
        staffRoles.forEach((r: any) => { roleMap[r.role] = r._id; });

        const designationsList = await Designation.find().lean();
        const desigMap: Record<string, any> = {};
        designationsList.forEach((d: any) => { desigMap[d.code] = d._id; });

        const deptList = await Department.find().lean();
        const dMap: Record<string, any> = {};
        deptList.forEach((d: any) => { dMap[d.code] = d._id; });

        const sampleStaffData = [
            {
                name: "Sister Priya Das",
                email: "priya.das@medistra.hospital",
                gender: "FEMALE",
                employeeId: "EMP-1001",
                role: "NURSE",
                qualification: "B.Sc Nursing (Gold Medalist)",
                departmentId: dMap["ICU"] || dMap["EMER"],
                designationId: desigMap["HD-NRS"] || desigMap["STF-NRS"],
                shift: "MORNING" as const,
                phone: "+91 98311 22334",
                emergencyContact: "+91 98311 22335",
                salary: 55000,
                bankName: "State Bank of India",
                accountNumber: "30012345678",
                ifscCode: "SBIN0001234",
                panNumber: "ABCDE1234F",
                aadhaarNumber: "2345 6789 0123",
                address: "Salt Lake Sector II, Kolkata",
                status: "ACTIVE" as const
            },
            {
                name: "Brother Sourav Roy",
                email: "sourav.roy@medistra.hospital",
                gender: "MALE",
                employeeId: "EMP-1002",
                role: "NURSE",
                qualification: "GNM / Critical Care Nursing",
                departmentId: dMap["EMER"] || dMap["ICU"],
                designationId: desigMap["STF-NRS"],
                shift: "EVENING" as const,
                phone: "+91 98322 33445",
                emergencyContact: "+91 98322 33446",
                salary: 42000,
                bankName: "HDFC Bank",
                accountNumber: "50100023456789",
                ifscCode: "HDFC0000123",
                panNumber: "BCDEF2345G",
                aadhaarNumber: "3456 7890 1234",
                address: "New Town Action Area 1, Kolkata",
                status: "ACTIVE" as const
            },
            {
                name: "Subhashis Mukherjee",
                email: "subhashis.m@medistra.hospital",
                gender: "MALE",
                employeeId: "EMP-1003",
                role: "PHARMACIST",
                qualification: "M.Pharm (Pharmacology)",
                departmentId: dMap["PHAR"],
                designationId: desigMap["CHF-PHAR"] || desigMap["STF-PHAR"],
                shift: "MORNING" as const,
                phone: "+91 98333 44556",
                emergencyContact: "+91 98333 44557",
                salary: 68000,
                bankName: "ICICI Bank",
                accountNumber: "000205012345",
                ifscCode: "ICIC0000002",
                panNumber: "CDEFG3456H",
                aadhaarNumber: "4567 8901 2345",
                address: "Gariahat Road, South Kolkata",
                status: "ACTIVE" as const
            },
            {
                name: "Tanushree Mondal",
                email: "tanushree.m@medistra.hospital",
                gender: "FEMALE",
                employeeId: "EMP-1004",
                role: "LAB_TECHNICIAN",
                qualification: "M.Sc Medical Lab Technology (MLT)",
                departmentId: dMap["PATH"],
                designationId: desigMap["SR-TECH"] || desigMap["LAB-TECH"],
                shift: "MORNING" as const,
                phone: "+91 98344 55667",
                emergencyContact: "+91 98344 55668",
                salary: 48000,
                bankName: "Axis Bank",
                accountNumber: "915020023456789",
                ifscCode: "UTIB0000004",
                panNumber: "DEFGH4567J",
                aadhaarNumber: "5678 9012 3456",
                address: "Dum Dum Cantonment, Kolkata",
                status: "ACTIVE" as const
            },
            {
                name: "Rohan Chatterjee",
                email: "rohan.c@medistra.hospital",
                gender: "MALE",
                employeeId: "EMP-1005",
                role: "BILLING_OFFICER",
                qualification: "B.Com (Hons), Tally & Hospital ERP",
                departmentId: dMap["GMED"] || dMap["EMER"],
                designationId: desigMap["BILL-OFF"],
                shift: "ROTATING" as const,
                phone: "+91 98355 66778",
                emergencyContact: "+91 98355 66779",
                salary: 38000,
                bankName: "Punjab National Bank",
                accountNumber: "0014002100012345",
                ifscCode: "PUNB0014000",
                panNumber: "EFGHI5678K",
                aadhaarNumber: "6789 0123 4567",
                address: "Behala Chowrasta, Kolkata",
                status: "ACTIVE" as const
            }
        ];

        const defaultHashedPassword = await bcrypt.hash("Hospital@2026", 10);
        for (const s of sampleStaffData) {
            const user = await User.create({
                name: s.name,
                email: s.email,
                password: defaultHashedPassword,
                gender: s.gender,
                phone: s.phone,
                role: roleMap[s.role] || roleDocs["NURSE"]?._id || adminUser.role,
                isActive: true
            });

            await Staff.create({
                userId: user._id,
                employeeId: s.employeeId,
                departmentId: s.departmentId,
                designationId: s.designationId,
                role: s.role,
                qualification: s.qualification,
                shift: s.shift,
                phone: s.phone,
                emergencyContact: s.emergencyContact,
                salary: s.salary,
                bankName: s.bankName,
                accountNumber: s.accountNumber,
                ifscCode: s.ifscCode,
                panNumber: s.panNumber,
                aadhaarNumber: s.aadhaarNumber,
                address: s.address,
                status: s.status
            });

            // Biometric attendance for today
            await Attendance.create({
                userId: user._id,
                date: new Date(),
                clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000),
                shiftType: s.shift,
                status: "PRESENT",
                workingHours: 8,
                location: "Block A Biometric Terminal",
                verifiedBy: "Biometric Auto-Sync"
            });

            // Staff compliance document
            await StaffDocument.create({
                userId: user._id,
                documentType: s.role === "NURSE" ? "MEDICAL_LICENSE" : "DEGREE_CERTIFICATE",
                title: s.role === "NURSE" ? "State Nursing Council Registration" : "Degree Qualification Certificate",
                documentNumber: `REG-${s.employeeId}`,
                fileUrl: "/documents/sample-credentials.pdf",
                issueDate: new Date("2024-01-15"),
                expiryDate: new Date("2028-12-31"),
                verificationStatus: "VERIFIED",
                notes: "Verified against statutory portal"
            });
        }
        console.log(`✅ Successfully seeded ${sampleStaffData.length} Staff & HR employee dossiers with biometric attendance & compliance documents.`);

        // 12. Seed Standard Hospital Notification Templates, Rules, Settings & Delivery Logs
        console.log("Seeding Hospital Notification Templates, Rules & Gateway Settings...");
        const sampleTemplates = [
            {
                name: "Appointment Booking Confirmation",
                type: "SMS" as const,
                category: "APPOINTMENT" as const,
                content: "Dear {{patientName}}, your appointment with Dr. {{doctorName}} ({{department}}) is confirmed on {{appointmentDate}} at {{appointmentTime}}. Token #{{tokenNumber}}. - Medistra Hospital",
                variables: ["patientName", "doctorName", "department", "appointmentDate", "appointmentTime", "tokenNumber"],
                dltTemplateId: "1107161829304859",
                isActive: true
            },
            {
                name: "Appointment Detailed Confirmation",
                type: "EMAIL" as const,
                category: "APPOINTMENT" as const,
                subject: "Confirmed: Your Medical Consultation at Medistra Hospital",
                content: "Dear {{patientName}},\n\nYour appointment has been successfully scheduled.\n\nDoctor: Dr. {{doctorName}}\nSpeciality: {{department}}\nDate & Time: {{appointmentDate}} at {{appointmentTime}}\nConsultation Fee: ₹{{consultationFee}}\n\nPlease arrive 15 minutes prior to your time slot.\n\nWarm regards,\nMedistra Super Speciality Hospital",
                variables: ["patientName", "doctorName", "department", "appointmentDate", "appointmentTime", "consultationFee"],
                isActive: true
            },
            {
                name: "OPD Token Queue Call",
                type: "SMS" as const,
                category: "APPOINTMENT" as const,
                content: "Alert: Token #{{tokenNumber}} for {{patientName}}. Please report to {{roomNumber}}, Dr. {{doctorName}} is ready for consultation. - Medistra Hospital",
                variables: ["tokenNumber", "patientName", "roomNumber", "doctorName"],
                dltTemplateId: "1107161829304860",
                isActive: true
            },
            {
                name: "Inpatient Admission Intimation",
                type: "SMS" as const,
                category: "ADMISSION" as const,
                content: "Medistra IPD: Patient {{patientName}} has been admitted to Ward: {{wardName}}, Bed: {{bedNumber}} under Dr. {{attendingDoctor}}. IPD #{{ipdNumber}}.",
                variables: ["patientName", "wardName", "bedNumber", "attendingDoctor", "ipdNumber"],
                dltTemplateId: "1107161829304861",
                isActive: true
            },
            {
                name: "Laboratory Test Report Ready",
                type: "SMS" as const,
                category: "LAB_RESULT" as const,
                content: "Dear {{patientName}}, your laboratory test report for {{testName}} is verified & ready. Download from patient portal or collect from Central Desk. - Medistra Lab",
                variables: ["patientName", "testName"],
                dltTemplateId: "1107161829304862",
                isActive: true
            },
            {
                name: "Hospital Invoice & Receipt Notification",
                type: "EMAIL" as const,
                category: "BILLING" as const,
                subject: "Invoice Receipt: Medistra Hospital Inpatient / Outpatient Services",
                content: "Dear {{patientName}},\n\nThank you for choosing Medistra Super Speciality Hospital.\n\nInvoice Number: {{invoiceNumber}}\nTotal Bill Amount: ₹{{totalAmount}}\nAmount Paid: ₹{{paidAmount}}\nOutstanding Due: ₹{{balanceDue}}\n\nYou can download the tax invoice slip from our online billing portal.\n\nAccounts & Billing Department,\nMedistra Hospital",
                variables: ["patientName", "invoiceNumber", "totalAmount", "paidAmount", "balanceDue"],
                isActive: true
            },
            {
                name: "Emergency Code Red Trauma Alert",
                type: "SYSTEM" as const,
                category: "EMERGENCY" as const,
                content: "EMERGENCY ALERT: Trauma team required immediately in ER Bay 1. Triage Level 1 (Resuscitation) incoming patient. Trauma protocol activated.",
                variables: ["bayNumber", "triageLevel"],
                isActive: true
            }
        ];

        const createdTemplates: any[] = [];
        for (const t of sampleTemplates) {
            const existing = await NotificationTemplate.findOne({ name: t.name });
            if (!existing) {
                const created = await NotificationTemplate.create(t);
                createdTemplates.push(created);
            } else {
                createdTemplates.push(existing);
            }
        }
        console.log(`✅ Seeded ${createdTemplates.length} standard Hospital Notification Templates.`);

        // Notification Rules
        const sampleRules = [
            {
                name: "Outpatient Booking Notification",
                triggerEvent: "APPOINTMENT_BOOKED" as const,
                channels: ["SMS", "EMAIL"] as ("SMS" | "EMAIL")[],
                recipientRoles: ["PATIENT", "DOCTOR"] as ("PATIENT" | "DOCTOR")[],
                templateId: createdTemplates[0]?._id,
                description: "Automatically dispatches SMS token & Email confirmation whenever an OPD appointment is confirmed.",
                isActive: true
            },
            {
                name: "Emergency Trauma Broadcast",
                triggerEvent: "EMERGENCY_ALERT" as const,
                channels: ["SMS", "SYSTEM", "PUSH"] as ("SMS" | "SYSTEM" | "PUSH")[],
                recipientRoles: ["DOCTOR", "STAFF"] as ("DOCTOR" | "STAFF")[],
                templateId: createdTemplates[6]?._id,
                description: "Immediate hospital-wide alert broadcast to emergency on-duty physicians and trauma nurses.",
                isActive: true
            },
            {
                name: "Diagnostic Lab Verification Notice",
                triggerEvent: "LAB_REPORT_READY" as const,
                channels: ["SMS", "EMAIL"] as ("SMS" | "EMAIL")[],
                recipientRoles: ["PATIENT", "DOCTOR"] as ("PATIENT" | "DOCTOR")[],
                templateId: createdTemplates[4]?._id,
                description: "Alerts patient and ordering doctor when lab results are verified by the biochemist/pathologist.",
                isActive: true
            },
            {
                name: "IPD Admission Intimation",
                triggerEvent: "PATIENT_ADMITTED" as const,
                channels: ["SMS", "EMAIL"] as ("SMS" | "EMAIL")[],
                recipientRoles: ["PATIENT", "ADMIN"] as ("PATIENT" | "ADMIN")[],
                templateId: createdTemplates[3]?._id,
                description: "Sends admission notice with ward and bed allocation details upon bed assignment.",
                isActive: true
            },
            {
                name: "Financial Invoice Billing Alert",
                triggerEvent: "INVOICE_GENERATED" as const,
                channels: ["SMS", "EMAIL"] as ("SMS" | "EMAIL")[],
                recipientRoles: ["PATIENT"] as ("PATIENT")[],
                templateId: createdTemplates[5]?._id,
                description: "Transmits computerized invoice receipt and payment confirmation in Indian Rupees.",
                isActive: true
            }
        ];

        for (const r of sampleRules) {
            const existingRule = await NotificationRule.findOne({ name: r.name });
            if (!existingRule) {
                await NotificationRule.create(r);
            }
        }
        console.log(`✅ Seeded ${sampleRules.length} Automated Hospital Notification Rules.`);

        // Notification Settings
        const existingSettings = await NotificationSetting.findOne();
        if (!existingSettings) {
            await NotificationSetting.create({
                smsProvider: "FAST2SMS",
                smsApiKey: "DEMO_FAST2SMS_KEY_MEDISTRA",
                smsSenderId: "MEDSTR",
                smsDltEntityId: "1101234567890",
                smsCostPerCredit: 0.2, // ₹0.20
                smsBalanceCredits: 4850,
                emailProvider: "SMTP",
                smtpHost: "smtp.medistra.in",
                smtpPort: 587,
                smtpUser: "notifications@medistra.in",
                emailFromName: "Medistra Super Speciality Hospital",
                emailFromAddress: "noreply@medistra.in",
                systemAlertSound: true,
                autoRetryFailed: true,
                maxRetryCount: 3
            });
            console.log(`✅ Seeded default Notification Gateway Configuration (₹0.20/SMS, 4850 credits).`);
        }

        // Seed Sample Delivery Logs for Audit & History
        const sampleLogsCount = await NotificationLog.countDocuments();
        if (sampleLogsCount === 0) {
            await NotificationLog.create([
                {
                    recipientName: "Amitabh Banerjee",
                    recipientPhone: "+91 98300 12345",
                    type: "SMS",
                    content: "Dear Amitabh Banerjee, your appointment with Dr. Subhash Chandra (Cardiology) is confirmed on 04-Sep-2026 at 10:30 AM. Token #A-14. - Medistra Hospital",
                    status: "DELIVERED",
                    cost: 0.2,
                    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 4000),
                    metadata: { segments: 1, senderId: "MEDSTR" }
                },
                {
                    recipientName: "Smt. Sunita Mukherjee",
                    recipientEmail: "sunita.mukherjee@gmail.com",
                    type: "EMAIL",
                    subject: "Confirmed: Your Medical Consultation at Medistra Hospital",
                    content: "Dear Sunita Mukherjee,\nYour appointment with Dr. Subhash Chandra is confirmed for tomorrow 11:00 AM.",
                    status: "DELIVERED",
                    cost: 0,
                    sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 12000),
                    metadata: { priority: "NORMAL", from: "Medistra Hospital <noreply@medistra.in>" }
                },
                {
                    recipientName: "Rajesh Sharma",
                    recipientPhone: "+91 98311 99887",
                    type: "SMS",
                    content: "Dear Rajesh Sharma, your laboratory test report for Complete Blood Count (CBC) is verified & ready. - Medistra Lab",
                    status: "DELIVERED",
                    cost: 0.2,
                    sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                    deliveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 3500),
                    metadata: { segments: 1, senderId: "MEDSTR" }
                },
                {
                    recipientName: "Dr. Anirban Sengupta",
                    type: "SYSTEM",
                    content: "EMERGENCY ALERT: Trauma team required immediately in ER Bay 1. Triage Level 1 incoming patient.",
                    status: "DELIVERED",
                    cost: 0,
                    sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
                    deliveredAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
                    metadata: { severity: "CRITICAL" }
                },
                {
                    recipientName: "Vikram Malhotra",
                    recipientPhone: "+91 98300 00000",
                    type: "SMS",
                    content: "Medistra IPD: Patient Vikram Malhotra has been admitted to Ward: ICU-A, Bed: BED-04.",
                    status: "FAILED",
                    cost: 0.2,
                    error: "Carrier Error: Mobile subscriber unreachable / switch off (Network code 21)",
                    sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    metadata: { segments: 1, senderId: "MEDSTR" }
                }
            ]);
            console.log(`✅ Seeded 5 initial Notification Delivery Logs for audit & tracking.`);
        }

        // 13. Seed Administration Access Policies & Active User Sessions
        console.log("Seeding Hospital Administration Access Policies & Sessions...");
        const existingPolicy = await AccessPolicy.findOne();
        if (!existingPolicy) {
            await AccessPolicy.create({
                passwordMinLength: 8,
                passwordRequireSpecial: true,
                passwordRequireNumbers: true,
                passwordRequireUppercase: true,
                passwordExpiryDays: 90,
                sessionTimeoutMinutes: 30,
                maxConcurrentSessions: 3,
                maxFailedAttempts: 5,
                lockoutDurationMinutes: 15,
                mfaPolicy: "ADMIN_ONLY",
                ipWhitelist: ["192.168.1.0/24", "10.0.0.0/16", "127.0.0.1"],
                auditLevel: "DETAILED"
            });
            console.log(`✅ Seeded default Hospital Security & Access Policies.`);
        }

        const existingSessionsCount = await UserSession.countDocuments();
        if (existingSessionsCount === 0) {
            const adminUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).lean();
            const doctorUsers = await User.find({ email: { $ne: DEFAULT_ADMIN_EMAIL } }).limit(3).lean();

            const sampleSessions: any[] = [];
            if (adminUser) {
                sampleSessions.push({
                    userId: adminUser._id,
                    token: "sess_admin_super_live_token_9918",
                    ipAddress: "192.168.1.10",
                    device: "Workstation Terminal",
                    browser: "Chrome 128",
                    os: "Windows 11 Enterprise",
                    location: "Kolkata Hospital IT Wing",
                    status: "ACTIVE",
                    lastActiveAt: new Date(),
                    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
                });
            }

            doctorUsers.forEach((u: any, idx: number) => {
                sampleSessions.push({
                    userId: u._id,
                    token: `sess_clinician_token_${idx + 1}_4821`,
                    ipAddress: `192.168.1.${20 + idx}`,
                    device: idx === 1 ? "iPad Pro Clinical Console" : "OPD Room 104 PC",
                    browser: idx === 1 ? "Mobile Safari 17.5" : "Chrome 128",
                    os: idx === 1 ? "iPadOS 17.5" : "Windows 11",
                    location: "Medistra Main Campus OPD",
                    status: "ACTIVE",
                    lastActiveAt: new Date(Date.now() - (idx + 1) * 20 * 60 * 1000),
                    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
                });
            });

            if (sampleSessions.length > 0) {
                await UserSession.create(sampleSessions);
                console.log(`✅ Seeded ${sampleSessions.length} active administrative and clinician sessions.`);
            }
        }

        // 14. Seed Organization Management Settings, Network Hospitals & Satellite Branches
        console.log("Seeding Organization Settings & Network Facilities...");

        // 14.1 Network Hospitals & Satellite Branches
        const cancerHospital = await Organization.findOneAndUpdate(
            { organizationId: "MEDISTRA-ONCO" },
            {
                organizationName: "Medistra Comprehensive Cancer Center",
                organizationId: "MEDISTRA-ONCO",
                organizationType: "HOSPITAL",
                branchType: "BRANCH",
                email: "onco@medistra.hospital",
                phone: "+91 33 2410 5000",
                address: "Plot IIE/12, Action Area II, New Town, Kolkata",
                city: "Kolkata",
                state: "West Bengal",
                pincode: "700156",
                country: "India",
                capacity: 220,
                metadata: {
                    specialty: "Comprehensive Oncology & Bone Marrow Transplant",
                    nabhAccredited: true,
                    linearAccelerators: 3,
                    chemoDaycareChairs: 40
                },
                isActive: true
            },
            { upsert: true, new: true }
        );

        const saltLakeBranch = await Organization.findOneAndUpdate(
            { organizationId: "MEDISTRA-SL-01" },
            {
                organizationName: "Medistra Polyclinic & Day Surgery - Salt Lake",
                organizationId: "MEDISTRA-SL-01",
                organizationType: "CLINIC",
                branchType: "BRANCH",
                email: "saltlake@medistra.hospital",
                phone: "+91 33 2358 1122",
                address: "Block BD-34, Sector 1, Salt Lake, Kolkata",
                city: "Kolkata",
                state: "West Bengal",
                pincode: "700064",
                country: "India",
                capacity: 25,
                metadata: {
                    facilityType: "Satellite Polyclinic & Specimen Collection",
                    consultationSuites: 8,
                    ultrasoundRooms: 2
                },
                isActive: true
            },
            { upsert: true, new: true }
        );

        await Organization.findOneAndUpdate(
            { organizationId: "MEDISTRA-NT-02" },
            {
                organizationName: "Medistra Diagnostic & Dialysis Center - New Town",
                organizationId: "MEDISTRA-NT-02",
                organizationType: "DIAGNOSTIC",
                branchType: "BRANCH",
                email: "newtown@medistra.hospital",
                phone: "+91 33 2986 4400",
                address: "Axis Mall Tower, 3rd Floor, Major Arterial Road, New Town, Kolkata",
                city: "Kolkata",
                state: "West Bengal",
                pincode: "700156",
                country: "India",
                capacity: 35,
                metadata: {
                    facilityType: "Dialysis & Diagnostic Imaging",
                    dialysisStations: 16
                },
                isActive: true
            },
            { upsert: true, new: true }
        );

        // 14.2 Corporate Organization Legal & Financial Settings (INR / ₹)
        const existingOrgSetting = await OrganizationSetting.findOne();
        if (!existingOrgSetting) {
            await OrganizationSetting.create({
                cinNumber: "U85110WB2018PTC224890",
                panNumber: "AAACM8912P",
                gstin: "19AAACM8912P1ZV",
                currency: "INR",
                currencySymbol: "₹",
                fiscalYearStart: "April",
                fiscalYearEnd: "March",
                tagline: "Centre of Excellence in Tertiary & Quaternary Healthcare",
                website: "https://medistra.hospital",
                emergencyHotline: "+91 33 2345 6780",
                letterheadHeader: "MEDISTRA HEALTHCARE SYSTEM - TRUSTED CLINICAL EXCELLENCE",
                letterheadFooter: "12 Medical Enclave, Central Avenue, Kolkata | 24x7 Helpline: 1800-200-8899"
            });
            console.log(`✅ Seeded Corporate Organization Legal, Tax & Financial Settings (₹ / INR).`);
        }

        // 14.3 Hospital Operational & NABH Settings
        const existingHospSetting = await HospitalSetting.findOne();
        if (!existingHospSetting) {
            await HospitalSetting.create({
                hospitalId: defaultOrg._id,
                nabhAccredited: true,
                nabhCode: "NABH-2024-HOSP-0982",
                jciAccredited: true,
                totalBeds: 450,
                icuBeds: 60,
                nicuBeds: 24,
                otSuites: 12,
                bloodBankLicense: "DL-BB-WB-2022-04",
                pharmacyLicense: "WB/KOL/20/21B/4921",
                ambulanceHotline: "+91 33 2345 6789",
                casualtyPhone: "+91 33 2345 6701",
                visitingHours: "04:30 PM - 07:00 PM",
                dischargeCheckTime: "11:00 AM"
            });
            console.log(`✅ Seeded Main Hospital Operational Parameters & NABH Credentials.`);
        }

        // 14.4 Branch Logistics & Operational Settings
        const existingBranchSetting = await BranchSetting.findOne({ branchCode: "BR-SL-01" });
        if (!existingBranchSetting) {
            await BranchSetting.create({
                branchId: saltLakeBranch._id,
                branchCode: "BR-SL-01",
                operatingHours: "07:00 AM - 09:00 PM (All 7 Days)",
                consultationRooms: 8,
                dayCareBeds: 10,
                hasPharmacy: true,
                hasSampleCollection: true,
                sampleCourierSchedule: "Twice Daily (11:30 AM & 04:30 PM)",
                teleconsultationEnabled: true,
                branchManager: "Mr. Debabrata Sen",
                branchManagerPhone: "+91 98310 99881"
            });
            console.log(`✅ Seeded Satellite Branch Operational & Logistics Settings.`);
        }

        // 15. Seed Audit & Compliance Records
        console.log("Seeding Audit & Compliance baseline logs, security events & reports...");
        const existingAuditCount = await AuditLog.countDocuments();
        if (existingAuditCount === 0) {
            const adminUserDoc = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).lean();
            const doctorUserDoc = await User.findOne({ email: { $ne: DEFAULT_ADMIN_EMAIL } }).lean();
            const patientDoc: any = await mongoose.model("Patient").findOne().lean();

            const sampleAuditLogs: any[] = [
                // 15.1 System & User Activity Logs
                {
                    user: adminUserDoc?._id,
                    userName: adminUserDoc ? `${adminUserDoc.name}` : "Administrator",
                    userRole: "SYSTEM_SUPER_ADMIN",
                    action: "UPDATE_SECURITY_POLICY",
                    entity: "SECURITY_POLICY",
                    entityName: "Hospital Password & Session Policy",
                    category: "SYSTEM",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Updated hospital security policy: password expiry set to 90 days, session timeout to 30 mins.",
                    ipAddress: "192.168.1.10",
                    device: "Terminal PC",
                    location: "Kolkata IT Wing",
                    complianceTags: ["ISO27001", "NABH"],
                    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000)
                },
                {
                    user: doctorUserDoc?._id || adminUserDoc?._id,
                    userName: doctorUserDoc ? `${doctorUserDoc.name}` : "Dr. Arjun Banerjee",
                    userRole: "DOCTOR",
                    action: "CREATE_CONSULTATION",
                    entity: "CLINICAL_RECORD",
                    entityName: `Consultation for ${patientDoc ? patientDoc.firstName + ' ' + patientDoc.lastName : 'Rajat Sharma'}`,
                    category: "USER_ACTIVITY",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Recorded OPD cardiology consultation notes, preliminary ECG review, and prescribed statins.",
                    ipAddress: "192.168.1.25",
                    device: "OPD Room 104 PC",
                    location: "OPD Block A",
                    patientId: patientDoc?._id,
                    complianceTags: ["NABH", "CLINICAL_GOVERNANCE"],
                    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000)
                },
                {
                    user: doctorUserDoc?._id || adminUserDoc?._id,
                    userName: doctorUserDoc ? `${doctorUserDoc.name}` : "Dr. Arjun Banerjee",
                    userRole: "DOCTOR",
                    action: "DISPENSE_PRESCRIPTION",
                    entity: "PHARMACY",
                    entityName: "Rx #RX-2024-0491",
                    category: "USER_ACTIVITY",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Inpatient pharmacy dispensed Ampicillin 500mg (10 capsules) and Paracetamol 650mg.",
                    ipAddress: "192.168.1.105",
                    device: "Pharmacy Terminal 2",
                    location: "Main Lobby Pharmacy",
                    patientId: patientDoc?._id,
                    complianceTags: ["DRUG_SCHEDULE_H", "NABH"],
                    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
                },
                {
                    user: adminUserDoc?._id,
                    userName: "Billing Officer R. Das",
                    userRole: "BILLING_OFFICER",
                    action: "GENERATE_INVOICE",
                    entity: "BILLING",
                    entityName: "Invoice #INV-2024-0982",
                    category: "USER_ACTIVITY",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Generated final inpatient discharge invoice of ₹48,500 with TPA cashless sanction linkage.",
                    ipAddress: "192.168.1.42",
                    device: "Cash Counter 1",
                    location: "Admission & Billing Hub",
                    patientId: patientDoc?._id,
                    complianceTags: ["GST_COMPLIANT", "FINANCIAL_AUDIT"],
                    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000)
                },

                // 15.2 Login History & Authentication
                {
                    user: adminUserDoc?._id,
                    userName: adminUserDoc ? `${adminUserDoc.name}` : "Administrator",
                    userRole: "SYSTEM_SUPER_ADMIN",
                    action: "LOGIN_SUCCESS",
                    entity: "AUTHENTICATION",
                    entityName: "Console Session",
                    category: "LOGIN",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Administrative user authenticated successfully with valid credentials and corporate IP verification.",
                    ipAddress: "192.168.1.10",
                    device: "Chrome 128 / Windows 11",
                    location: "Central Avenue, Kolkata",
                    complianceTags: ["ACCESS_CONTROL", "ISO27001"],
                    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
                },
                {
                    user: doctorUserDoc?._id || adminUserDoc?._id,
                    userName: doctorUserDoc ? `${doctorUserDoc.name}` : "Dr. Arjun Banerjee",
                    userRole: "DOCTOR",
                    action: "LOGIN_SUCCESS",
                    entity: "AUTHENTICATION",
                    entityName: "Clinician Session",
                    category: "LOGIN",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Clinician mobile portal login via iPad Pro from hospital secure wireless intranet.",
                    ipAddress: "192.168.1.25",
                    device: "Mobile Safari / iPadOS 17",
                    location: "Medistra Main Campus",
                    complianceTags: ["ACCESS_CONTROL"],
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                },
                {
                    userName: "Unknown Attacker",
                    action: "LOGIN_FAILED",
                    entity: "AUTHENTICATION",
                    entityName: "Failed Login Trial",
                    category: "LOGIN",
                    severity: "WARNING",
                    status: "FAILURE",
                    details: "Failed login attempt with invalid password credentials targeting username admin@hospital.com.",
                    ipAddress: "203.0.113.45",
                    device: "Python-requests / Linux",
                    location: "External Public IP",
                    complianceTags: ["SECURITY_EVENT", "ISO27001"],
                    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
                },
                {
                    userName: "Suspicious User",
                    action: "LOGIN_BLOCKED",
                    entity: "AUTHENTICATION",
                    entityName: "Account Lockout Trigger",
                    category: "LOGIN",
                    severity: "HIGH",
                    status: "BLOCKED",
                    details: "Account lockout enforced after 5 consecutive failed authentication trials within 2 minutes.",
                    ipAddress: "198.51.100.12",
                    device: "Unknown Client",
                    location: "External Public IP",
                    complianceTags: ["SECURITY_EVENT", "INCIDENT"],
                    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
                },

                // 15.3 Patient Data Access (PHI / EHR Chart Access)
                {
                    user: doctorUserDoc?._id || adminUserDoc?._id,
                    userName: doctorUserDoc ? `${doctorUserDoc.name}` : "Dr. Arjun Banerjee",
                    userRole: "DOCTOR",
                    action: "VIEW_PHI_RECORD",
                    entity: "PATIENT_RECORD",
                    entityName: `EHR Chart of ${patientDoc ? patientDoc.firstName + ' ' + patientDoc.lastName : 'Rajat Sharma'}`,
                    category: "DATA_ACCESS",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Consultant accessed comprehensive medical history, past allergies, and coronary CT angiogram findings.",
                    ipAddress: "192.168.1.25",
                    device: "iPad Pro Clinical Console",
                    location: "Cardiology OPD Room 201",
                    patientId: patientDoc?._id,
                    complianceTags: ["HIPAA_PRIVACY", "NABH_CHARTS", "DISHA"],
                    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000)
                },
                {
                    user: adminUserDoc?._id,
                    userName: "Auditor Sunita Rao",
                    userRole: "HOSPITAL_AUDITOR",
                    action: "ACCESS_AUDIT_LOGS",
                    entity: "AUDIT_REGISTER",
                    entityName: "Monthly Clinical Peer Review",
                    category: "DATA_ACCESS",
                    severity: "INFO",
                    status: "SUCCESS",
                    details: "Hospital Quality Assurance officer extracted operative notes for monthly OT mortality & morbidity audit.",
                    ipAddress: "192.168.1.18",
                    device: "Auditor Terminal",
                    location: "Medical Records Department",
                    complianceTags: ["NABH", "QUALITY_AUDIT"],
                    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
                },

                // 15.4 Record Change History (Field-level Diffs in ₹)
                {
                    user: adminUserDoc?._id,
                    userName: "Sr. Billing Officer P. Ghosh",
                    userRole: "BILLING_OFFICER",
                    action: "UPDATE_INVOICE",
                    entity: "INVOICE",
                    entityName: "Invoice #INV-2024-0891",
                    category: "RECORD_CHANGE",
                    severity: "MEDIUM",
                    status: "SUCCESS",
                    details: "Adjusted bed room rent charge according to NABH concessional rate guidelines.",
                    diffSummary: "Room rent rate changed from ₹6,500/day to ₹4,500/day. Net invoice total adjusted from ₹52,000 to ₹48,000.",
                    oldValue: { dailyRoomRent: 6500, netTotal: 52000 },
                    newValue: { dailyRoomRent: 4500, netTotal: 48000 },
                    ipAddress: "192.168.1.42",
                    location: "Central Billing Wing",
                    patientId: patientDoc?._id,
                    complianceTags: ["TARIFF_REVISION", "FINANCIAL_AUDIT"],
                    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
                },
                {
                    user: doctorUserDoc?._id || adminUserDoc?._id,
                    userName: doctorUserDoc ? `${doctorUserDoc.name}` : "Dr. Arjun Banerjee",
                    userRole: "DOCTOR",
                    action: "UPDATE_PRESCRIPTION",
                    entity: "PRESCRIPTION",
                    entityName: "Prescription #RX-2024-0192",
                    category: "RECORD_CHANGE",
                    severity: "MEDIUM",
                    status: "SUCCESS",
                    details: "Dosage titration following clinical review of renal profile lab results.",
                    diffSummary: "Altered Enalapril dosage from 10mg once daily to 5mg once daily based on eGFR reports.",
                    oldValue: { drug: "Enalapril", dose: "10mg OD" },
                    newValue: { drug: "Enalapril", dose: "5mg OD" },
                    ipAddress: "192.168.1.25",
                    location: "Cardiology OPD",
                    patientId: patientDoc?._id,
                    complianceTags: ["MEDICATION_SAFETY", "NABH"],
                    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
                },

                // 15.5 Deleted Records (Forensic trail)
                {
                    user: doctorUserDoc?._id || adminUserDoc?._id,
                    userName: doctorUserDoc ? `${doctorUserDoc.name}` : "Dr. Arjun Banerjee",
                    userRole: "DOCTOR",
                    action: "CANCEL_LAB_ORDER",
                    entity: "LAB_ORDER",
                    entityName: "Order #LAB-2024-9912 (Serum Electrolytes)",
                    category: "DELETION",
                    severity: "WARNING",
                    status: "SUCCESS",
                    details: "Cancelled redundant laboratory order entered mistakenly during ward rounds.",
                    diffSummary: "Investigation voided: Serum Electrolytes (duplicate phlebotomy barcode cancelled)",
                    ipAddress: "192.168.1.25",
                    location: "Ward Block B",
                    patientId: patientDoc?._id,
                    complianceTags: ["LAB_STEWARDSHIP", "AUDIT_TRAIL"],
                    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
                },
                {
                    user: adminUserDoc?._id,
                    userName: "Billing Supervisor A. Sen",
                    userRole: "BILLING_OFFICER",
                    action: "VOID_DRAFT_RECEIPT",
                    entity: "BILLING",
                    entityName: "Draft Bill #RCPT-DRAFT-0492",
                    category: "DELETION",
                    severity: "WARNING",
                    status: "SUCCESS",
                    details: "Voided draft outpatient consultation receipt valued at ₹1,200 due to wrong consultant selection.",
                    diffSummary: "Draft receipt for ₹1,200 purged from active register before financial closure.",
                    oldValue: { receiptNo: "RCPT-DRAFT-0492", amount: 1200, status: "DRAFT" },
                    ipAddress: "192.168.1.42",
                    location: "OPD Billing Desk",
                    complianceTags: ["FINANCIAL_GOVERNANCE"],
                    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }
            ];

            await AuditLog.create(sampleAuditLogs);
            console.log(`✅ Seeded ${sampleAuditLogs.length} baseline Audit & Compliance event records.`);
        }

        // 15.2 Seed Security Incidents
        const existingSecurityCount = await SecurityEvent.countDocuments();
        if (existingSecurityCount === 0) {
            const adminDoc = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).lean();
            const sampleSecurityEvents: any[] = [
                {
                    eventType: "BRUTE_FORCE_ATTEMPT",
                    severity: "HIGH",
                    status: "BLOCKED",
                    ipAddress: "185.220.101.4",
                    userAgent: "Hydra/9.5 (Network Security Scanner)",
                    location: "External Tor Exit Node",
                    details: "18 rapid failed authentication attempts in 45 seconds targeting /api/auth/login. IP blocked by firewall.",
                    resolutionNotes: "Firewall rule auto-enforced: IP subnet 185.220.101.0/24 blacklisted for 30 days.",
                    resolvedBy: adminDoc?._id,
                    resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000)
                },
                {
                    eventType: "UNAUTHORIZED_RESOURCE_ACCESS",
                    severity: "MEDIUM",
                    status: "RESOLVED",
                    ipAddress: "192.168.1.77",
                    userName: "Receptionist Front Desk",
                    location: "Ground Floor Registration",
                    details: "Front desk staff user attempted direct HTTP GET request to /api/finance/credit-notes without permission.",
                    resolutionNotes: "Audit review verified accidental bookmark click. Staff re-trained on assigned menu scopes.",
                    resolvedBy: adminDoc?._id,
                    resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
                },
                {
                    eventType: "SUSPICIOUS_IP_LOGIN",
                    severity: "HIGH",
                    status: "INVESTIGATING",
                    ipAddress: "103.21.244.18",
                    userName: "Dr. Priyadarshini Mukherjee",
                    location: "Remote External Network",
                    details: "Physician account accessed system outside normal shift hours from an unrecognized ISP network in Singapore.",
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
                },
                {
                    eventType: "MASS_DATA_EXPORT",
                    severity: "MEDIUM",
                    status: "RESOLVED",
                    ipAddress: "192.168.1.42",
                    userName: "Billing Manager T. Guha",
                    location: "Central Billing Wing",
                    details: "Bulk CSV export of 450 patient billing ledgers initiated from Financial Reports workstation.",
                    resolutionNotes: "Verified as authorized quarterly statutory GST & TPA audit reconciliation file.",
                    resolvedBy: adminDoc?._id,
                    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
                }
            ];

            await SecurityEvent.create(sampleSecurityEvents);
            console.log(`✅ Seeded ${sampleSecurityEvents.length} baseline Security Events & Threat Incidents.`);
        }

        // 15.3 Seed Regulatory Compliance Framework Reports
        const existingComplianceCount = await ComplianceReport.countDocuments();
        if (existingComplianceCount === 0) {
            const sampleReports: any[] = [
                {
                    reportId: "COMP-2024-NABH-01",
                    framework: "NABH",
                    title: "NABH 5th Edition Hospital Comprehensive Clinical Audit",
                    period: "FY 2024-25 (Q2 Pre-Assessment)",
                    overallScore: 95,
                    status: "COMPLIANT",
                    auditDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    auditorName: "Quality & Clinical Governance Cell",
                    summary: "Demonstrated high adherence to National Accreditation Board for Hospitals guidelines across inpatient safety, medication reconciliation, and infection control.",
                    findings: [
                        {
                            category: "Access, Assessment and Continuity of Care (AAC)",
                            controlName: "AAC.1 Initial Assessment of Inpatients within 24 Hours",
                            status: "PASS",
                            score: 98,
                            observation: "99.2% of emergency and planned admissions had complete clinical baseline recorded within 4 hours.",
                            recommendation: "Maintain electronic clinical assessment checklist automation."
                        },
                        {
                            category: "Care of Patients (COP)",
                            controlName: "COP.3 Intensive Care & High Dependency Unit Guidelines",
                            status: "PASS",
                            score: 96,
                            observation: "1:1 nurse-to-patient ratio maintained in ICU; daily multidisciplinary rounds documented.",
                            recommendation: "Continue quarterly ICU mortality and central line infection reviews."
                        },
                        {
                            category: "Management of Medication (MOM)",
                            controlName: "MOM.4 Sound-Alike Look-Alike (LASA) Drug Separation",
                            status: "PASS",
                            score: 94,
                            observation: "Color-coded dual check bins instituted in central pharmacy and emergency triage.",
                            recommendation: "Periodic surprise checks on ward medication closets."
                        },
                        {
                            category: "Patient Rights and Education (PRE)",
                            controlName: "PRE.2 Informed Consent for High-Risk Surgical Procedures",
                            status: "PASS",
                            score: 92,
                            observation: "Multilingual consent forms in English, Bengali, and Hindi validated in 100% surgical records.",
                            recommendation: "Introduce electronic tablet-based video consent for complex cardiac interventions."
                        }
                    ]
                },
                {
                    reportId: "COMP-2024-HIPAA-02",
                    framework: "HIPAA",
                    title: "HIPAA Privacy & Electronic Protected Health Information (ePHI) Audit",
                    period: "Annual Compliance Audit 2024",
                    overallScore: 92,
                    status: "COMPLIANT",
                    auditDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                    auditorName: "CISO & Enterprise Information Security Team",
                    summary: "Full encryption of patient health records at rest and in transit. Access controls enforce least privilege role-based authorization.",
                    findings: [
                        {
                            category: "Technical Safeguards",
                            controlName: "Access Control & Automatic Logoff (§ 164.312(a))",
                            status: "PASS",
                            score: 95,
                            observation: "Inactivity timeout enforced at 30 minutes; unique credentials for all staff.",
                            recommendation: "Mandate hardware security key MFA for external VPN users."
                        },
                        {
                            category: "Audit Controls",
                            controlName: "Audit Controls & Forensic Logging (§ 164.312(b))",
                            status: "PASS",
                            score: 94,
                            observation: "Complete tamper-resistant logging of all PHI chart accesses, modifications, and deletions.",
                            recommendation: "Maintain 7-year cold archival storage tier for forensic compliance."
                        },
                        {
                            category: "Integrity Safeguards",
                            controlName: "Protection from Alteration or Destruction (§ 164.312(c))",
                            status: "PASS",
                            score: 90,
                            observation: "Field-level diff tracking records before and after states on all clinical entries.",
                            recommendation: "Incorporate cryptographic digital signatures on laboratory result signoffs."
                        }
                    ]
                },
                {
                    reportId: "COMP-2024-ABDM-03",
                    framework: "DISHA_ABDM",
                    title: "Ayushman Bharat Digital Mission (ABDM) Milestone 3 Audit",
                    period: "National Digital Health Ecosystem 2024",
                    overallScore: 88,
                    status: "NEEDS_ATTENTION",
                    auditDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
                    auditorName: "Digital Health Interoperability Taskforce",
                    summary: "Hospital Health Repository Provider (HIP/HIU) services linked to ABDM sandbox. Minor consent artifact latency observed during peak hours.",
                    findings: [
                        {
                            category: "Milestone 1: ABHA Number Generation & Linking",
                            controlName: "Patient Consent-based ABHA Validation",
                            status: "PASS",
                            score: 94,
                            observation: "86% of registered patients successfully issued or linked Ayushman Bharat Health Account (ABHA).",
                            recommendation: "Introduce dedicated kiosk at reception for fast-track ABHA registration."
                        },
                        {
                            category: "Milestone 2: Health Information Provider (HIP)",
                            controlName: "Diagnostic Reports & Discharge Summary Bundling (FHIR R4)",
                            status: "PASS",
                            score: 91,
                            observation: "Standard FHIR JSON document bundles generated for pathology and radiology reports.",
                            recommendation: "Expand bundling to nursing medication chart summaries."
                        },
                        {
                            category: "Milestone 3: Health Information User (HIU)",
                            controlName: "Real-time Consent Manager Callback Processing",
                            status: "FLAG",
                            score: 79,
                            observation: "Occasional timeouts during external Health Locker consent artifact verification under high load.",
                            recommendation: "Upgrade async worker queue concurrency for ABDM gateway webhooks."
                        }
                    ],
                    remediationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            ];

            await ComplianceReport.create(sampleReports);
            console.log(`✅ Seeded ${sampleReports.length} formal Regulatory Compliance Reports.`);
        }

        // ==========================================
        // 16. SYSTEM CONFIGURATION SETTINGS
        // ==========================================
        const systemSettingCount = await SystemSetting.countDocuments();
        if (systemSettingCount === 0) {
            console.log("Seeding baseline System Configuration across 13 modules...");

            const baselineSettings = [
                // 1. General Settings
                { category: "general", key: "hospital_name", value: "Medistra Super Speciality Hospital", description: "Official Hospital Legal Name" },
                { category: "general", key: "hospital_tagline", value: "Excellence in Tertiary Healthcare & Clinical Research", description: "Public Branding Tagline" },
                { category: "general", key: "hospital_email", value: "contact@medistra.in", description: "Official Contact Email" },
                { category: "general", key: "hospital_phone", value: "+91 11 4982 5000", description: "Official Reception Phone Line" },
                { category: "general", key: "hospital_emergency", value: "1066 / +91 11 4982 5099", description: "24x7 Emergency Helpline" },
                { category: "general", key: "hospital_address", value: "Plot 12, Institutional Area, Sector 62, New Delhi - 110092, India", description: "Hospital Campus Physical Address" },
                { category: "general", key: "hospital_website", value: "https://medistra.in", description: "Official Hospital Web Portal" },
                { category: "general", key: "hospital_cin", value: "U85110DL2018PTC321456", description: "Corporate Identity Number (CIN)" },
                { category: "general", key: "hospital_nabh", value: "NABH-2024-HOSP-0842", description: "NABH 5th Edition Accreditation ID" },

                // 2. Localization
                { category: "localization", key: "language", value: "en-IN", description: "Primary System Language (Indian English)" },
                { category: "localization", key: "secondary_language", value: "hi-IN", description: "Secondary Regional Language (Hindi)" },
                { category: "localization", key: "timezone", value: "Asia/Kolkata", description: "Standard Timezone" },
                { category: "localization", key: "date_format", value: "DD/MM/YYYY", description: "Standard Date Display Format" },
                { category: "localization", key: "time_format", value: "12h", description: "Time Format (12h/24h)" },
                { category: "localization", key: "week_start", value: "Monday", description: "First Day of Operational Week" },
                { category: "localization", key: "number_format", value: "en-IN", description: "Indian Numeral Grouping (Lakhs/Crores)" },

                // 3. Currency (Strictly Indian Rupee INR / ₹)
                { category: "currency", key: "currencyName", value: "Indian Rupee", description: "Full Currency Nomenclature" },
                { category: "currency", key: "currencyCode", value: "INR", description: "ISO 4217 Currency Code" },
                { category: "currency", key: "symbol", value: "₹", description: "Statutory Rupee Symbol" },
                { category: "currency", key: "symbolPosition", value: "prefix", description: "Symbol Placement (Prefix ₹)" },
                { category: "currency", key: "decimalPlaces", value: "2", description: "Decimal Precision for Invoices" },
                { category: "currency", key: "numberFormat", value: "en-IN", description: "Lakhs and Crores Grouping System" },
                { category: "currency", key: "roundingMethod", value: "round", description: "Rounding Method (Round to Nearest Rupee)" },

                // 4. Timezone
                { category: "timezone", key: "primary_timezone", value: "Asia/Kolkata", description: "National Standard Time (IST - UTC+05:30)" },
                { category: "timezone", key: "utc_offset", value: "+05:30", description: "UTC Offset String" },
                { category: "timezone", key: "ntp_server", value: "time.google.com", description: "Primary NTP Time Server" },
                { category: "timezone", key: "sync_interval_mins", value: "15", description: "NTP Synchronization Interval (Minutes)" },
                { category: "timezone", key: "daylight_saving", value: "disabled", description: "Daylight Saving Time Policy" },
                { category: "timezone", key: "drift_tolerance_ms", value: "500", description: "Maximum Clock Drift Tolerance (ms)" },

                // 5. Auto-Numbering Sequences
                { category: "numbering", key: "uhid_prefix", value: "MED-UHID-", description: "Patient Master UHID Prefix" },
                { category: "numbering", key: "uhid_digits", value: "6", description: "UHID Zero-padded Digit Length" },
                { category: "numbering", key: "ipd_prefix", value: "MED-IPD-", description: "Inpatient Admission ID Prefix" },
                { category: "numbering", key: "ipd_digits", value: "6", description: "IPD Zero-padded Digit Length" },
                { category: "numbering", key: "opd_prefix", value: "OPD-", description: "Outpatient Token Sequence Prefix" },
                { category: "numbering", key: "opd_digits", value: "4", description: "OPD Token Digit Length" },
                { category: "numbering", key: "invoice_prefix", value: "INV-2026-", description: "Statutory Tax Invoice Prefix" },
                { category: "numbering", key: "invoice_digits", value: "6", description: "Invoice Serial Digit Length" },
                { category: "numbering", key: "prescription_prefix", value: "RX-", description: "Digital E-Prescription Prefix" },
                { category: "numbering", key: "prescription_digits", value: "6", description: "Prescription Serial Length" },
                { category: "numbering", key: "lab_prefix", value: "LAB-", description: "Laboratory Sample Barcode Prefix" },
                { category: "numbering", key: "lab_digits", value: "6", description: "Lab Test Order Serial Length" },
                { category: "numbering", key: "po_prefix", value: "PO-2026-", description: "Purchase Order Sequence Prefix" },
                { category: "numbering", key: "po_digits", value: "5", description: "Purchase Order Digit Length" },

                // 6. Appointment Settings
                { category: "appointments", key: "slot_duration_mins", value: "15", description: "Standard Consultation Slot Duration (Mins)" },
                { category: "appointments", key: "buffer_time_mins", value: "5", description: "Buffer Time Between Doctor Slots (Mins)" },
                { category: "appointments", key: "advance_booking_days", value: "60", description: "Maximum Days in Advance for OPD Booking" },
                { category: "appointments", key: "same_day_cutoff_hours", value: "2", description: "Minimum Hours Prior for Same-Day Booking" },
                { category: "appointments", key: "cancellation_window_hours", value: "4", description: "Free Patient Cancellation Window (Hours)" },
                { category: "appointments", key: "allow_overbooking", value: "false", description: "Permit Slot Overbooking by Reception" },
                { category: "appointments", key: "max_overbooking_per_slot", value: "1", description: "Emergency Overbooking Ceiling" },
                { category: "appointments", key: "teleconsult_enabled", value: "true", description: "Integrated WebRTC Teleconsultation Feature" },
                { category: "appointments", key: "reminder_sms_hours", value: "24,2", description: "Automated SMS Reminder Intervals Before Slot" },

                // 7. Billing Settings (Statutory Indian GST & ₹ Standards)
                { category: "billing", key: "default_currency", value: "INR", description: "Primary Billing Currency" },
                { category: "billing", key: "currency_symbol", value: "₹", description: "Currency Display Symbol" },
                { category: "billing", key: "gst_medicine_rate", value: "12", description: "Standard Pharmaceutical GST Rate (%)" },
                { category: "billing", key: "gst_diagnostic_rate", value: "0", description: "Diagnostic & Lab Test GST Rate (%) - Exempt" },
                { category: "billing", key: "gst_consultation_rate", value: "0", description: "OPD Consultation GST Rate (%) - Exempt" },
                { category: "billing", key: "gst_ward_high_rate", value: "5", description: "Deluxe/VIP Room GST Rate (%) for Tariff >₹5000" },
                { category: "billing", key: "gst_ward_exemption_cutoff", value: "5000", description: "Room Rent GST Exemption Cutoff (₹/day)" },
                { category: "billing", key: "payment_modes", value: "CASH,UPI,CREDIT_DEBIT_CARD,NETBANKING,TPA_INSURANCE,NEFT_RTGS", description: "Active Payment Gateways and Modes" },
                { category: "billing", key: "credit_period_days", value: "30", description: "Corporate & TPA Credit Settlement Period (Days)" },
                { category: "billing", key: "grace_period_days", value: "7", description: "Payment Due Grace Period (Days)" },
                { category: "billing", key: "invoice_roundoff", value: "true", description: "Automatically Round Off Total Bill to Nearest Rupee" },

                // 8. Clinical Settings
                { category: "clinical", key: "diagnostic_coding", value: "ICD-10-CM", description: "Primary Diagnostic Classification Code System" },
                { category: "clinical", key: "procedure_coding", value: "ICD-10-PCS", description: "Surgical & Procedure Coding Standard" },
                { category: "clinical", key: "bp_systolic_high", value: "140", description: "Hypertension Systolic Alert Threshold (mmHg)" },
                { category: "clinical", key: "bp_systolic_low", value: "90", description: "Hypotension Systolic Alert Threshold (mmHg)" },
                { category: "clinical", key: "bp_diastolic_high", value: "90", description: "Hypertension Diastolic Alert Threshold (mmHg)" },
                { category: "clinical", key: "bp_diastolic_low", value: "60", description: "Hypotension Diastolic Alert Threshold (mmHg)" },
                { category: "clinical", key: "heart_rate_high", value: "100", description: "Tachycardia Alert Threshold (BPM)" },
                { category: "clinical", key: "heart_rate_low", value: "50", description: "Bradycardia Alert Threshold (BPM)" },
                { category: "clinical", key: "spo2_critical_low", value: "92", description: "Hypoxemia Critical SpO2 Threshold (%)" },
                { category: "clinical", key: "blood_glucose_high", value: "200", description: "Hyperglycemia Alert Threshold (mg/dL)" },
                { category: "clinical", key: "blood_glucose_low", value: "70", description: "Hypoglycemia Alert Threshold (mg/dL)" },
                { category: "clinical", key: "allergy_interaction_check", value: "STRICT_BLOCK", description: "Drug-Drug & Allergy Contraindication Rule" },
                { category: "clinical", key: "mandatory_clinician_signoff", value: "true", description: "Mandatory Digital Signature on Discharge Summaries" },

                // 9. Laboratory Settings
                { category: "laboratory", key: "panic_critical_notification", value: "IMMEDIATE_SMS_AND_CALL", description: "Panic Lab Result Notification Protocol" },
                { category: "laboratory", key: "barcode_standard", value: "Code 128", description: "Specimen Vial Barcode Standard" },
                { category: "laboratory", key: "specimen_rejection_protocol", value: "STRICT", description: "Specimen Hemolysis / Clot Rejection Policy" },
                { category: "laboratory", key: "routine_tat_hours", value: "4", description: "Standard Outpatient Turnaround Time (Hours)" },
                { category: "laboratory", key: "urgent_stat_tat_hours", value: "1", description: "STAT Emergency Turnaround Time (Hours)" },
                { category: "laboratory", key: "potassium_panic_low", value: "2.5", description: "Critical Low Potassium Bound (mmol/L)" },
                { category: "laboratory", key: "potassium_panic_high", value: "6.0", description: "Critical High Potassium Bound (mmol/L)" },
                { category: "laboratory", key: "hemoglobin_panic_low", value: "7.0", description: "Critical Low Hemoglobin Bound (g/dL)" },
                { category: "laboratory", key: "platelet_panic_low", value: "40000", description: "Critical Low Thrombocyte Bound (/mcL)" },
                { category: "laboratory", key: "troponin_panic_high", value: "0.04", description: "Critical Troponin I Cutoff (ng/mL)" },

                // 10. Pharmacy Settings
                { category: "pharmacy", key: "dispensing_mode", value: "FEFO", description: "Stock Dispensing Valuation (First Expired First Out)" },
                { category: "pharmacy", key: "schedule_h_prescription_mandatory", value: "true", description: "Mandatory Registered Doctor Rx for Schedule H/H1 Drugs" },
                { category: "pharmacy", key: "schedule_x_dual_signoff", value: "true", description: "Dual Pharmacist Authorization for Schedule X Narcotics" },
                { category: "pharmacy", key: "default_reorder_level", value: "50", description: "Default Safety Reorder Quantity (Packs)" },
                { category: "pharmacy", key: "low_stock_threshold", value: "20", description: "Emergency Low Stock Red Alert Cutoff (Packs)" },
                { category: "pharmacy", key: "auto_po_trigger", value: "true", description: "Automated Requisition Generation on Low Stock" },
                { category: "pharmacy", key: "expiry_warning_days", value: "90", description: "Near-Expiry Quarantine Horizon (Days)" },

                // 11. Notification Settings
                { category: "notifications", key: "sms_gateway_provider", value: "NIC_CDAC_GOV", description: "Primary Telecom SMS Gateway Provider" },
                { category: "notifications", key: "sms_sender_id", value: "MDSTRA", description: "TRAI Approved 6-Character SMS Sender Header" },
                { category: "notifications", key: "whatsapp_api_status", value: "CONNECTED", description: "WhatsApp Business Cloud API Connection Status" },
                { category: "notifications", key: "smtp_host", value: "smtp.medistra.in", description: "Hospital SMTP Outbound Mail Relay Server" },
                { category: "notifications", key: "smtp_port", value: "587", description: "SMTP Secure Submission Port" },
                { category: "notifications", key: "smtp_user", value: "notifications@medistra.in", description: "Hospital Dispatcher Email Account" },
                { category: "notifications", key: "smtp_encryption", value: "STARTTLS", description: "Mail Transport Security Protocol" },
                { category: "notifications", key: "notify_patient_appointment", value: "true", description: "Broadcast SMS Confirmation on OPD Booking" },
                { category: "notifications", key: "notify_critical_lab_doctor", value: "true", description: "Automated Phone & SMS Alert to Doctor on Panic Lab" },
                { category: "notifications", key: "notify_discharge_ready", value: "true", description: "Notify Patient Attendant on Final Bill Clearance" },

                // 12. Integration Settings
                { category: "integrations", key: "abdm_enabled", value: "true", description: "Ayushman Bharat Digital Mission (ABDM) Gateway Linkage" },
                { category: "integrations", key: "abdm_environment", value: "PRODUCTION_SANDBOX", description: "ABDM Sandbox vs Live Production Profile" },
                { category: "integrations", key: "abdm_hip_id", value: "IN0710000042", description: "National Health Registry Health Information Provider ID" },
                { category: "integrations", key: "abdm_hiu_id", value: "HIU0710000042", description: "ABDM Health Information User Entity ID" },
                { category: "integrations", key: "hl7_fhir_endpoint", value: "https://fhir.medistra.in/r4", description: "Interoperable HL7/FHIR R4 Diagnostic Server" },
                { category: "integrations", key: "hl7_version", value: "FHIR R4", description: "FHIR Standard Release Specification" },
                { category: "integrations", key: "pacs_dicom_server", value: "pacs.medistra.in:104", description: "Radiology DICOM PACS Storage Server Host" },
                { category: "integrations", key: "pacs_ae_title", value: "MEDISTRA_PACS", description: "Application Entity (AE) Title for DICOM Nodes" },

                // 13. API Settings
                { category: "api", key: "api_gateway_enabled", value: "true", description: "Public REST API Gateway Activation State" },
                { category: "api", key: "global_rate_limit_per_min", value: "120", description: "Client Rate Limit Ceiling (Requests per Minute)" },
                { category: "api", key: "webhook_retry_count", value: "3", description: "Automated Webhook Failure Delivery Retries" },
                { category: "api", key: "cors_allowed_origins", value: "https://medistra.in, https://portal.medistra.in", description: "Whitelisted Cross-Origin Resource Sharing Domains" },
                { category: "api", key: "api_audit_level", value: "VERBOSE", description: "Forensic Payload Logging Level for API Invocations" },
                { category: "api", key: "api_key_expiry_days", value: "90", description: "Developer Token Mandatory Rotation Interval (Days)" }
            ];

            await SystemSetting.create(baselineSettings);
            console.log(`✅ Seeded ${baselineSettings.length} baseline System Configuration settings across all 13 modules.`);
        }

        console.log("\n🎉 Complete database seeding finished successfully!");
    } catch (error) {
        console.error("❌ Error during seeding:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from database.");
    }
}

seedDatabase();
