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
            phone: "+91 11 2345 6789",
            address: "12 Medical Enclave, Central Avenue, Kolkata",
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

        console.log("\n🎉 Complete database seeding finished successfully!");
    } catch (error) {
        console.error("❌ Error during seeding:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from database.");
    }
}

seedDatabase();
