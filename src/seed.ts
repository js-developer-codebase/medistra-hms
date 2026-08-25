import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Role from "./models/role.model";
import Menu from "./models/menu.model";
import User from "./models/user.model";
import RoleHierarchy from "./models/role-hierarchy.model";
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
    { role: "BRANCH_MANAGER", access: FULL_ACCESS }, // scoped to branch by logic
    
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
    { role: "BLOOD_BANK_TECHNICIAN", access: [] },
    { role: "BLOOD_BANK_MANAGER", access: [] },
    
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

        // Seed Menus
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

        // Seed Roles
        console.log("Seeding roles...");
        const roleDocs: Record<string, any> = {};
        for (const r of roleDefinitions) {
            const role = await Role.create(r);
            roleDocs[r.role] = role;
        }
        console.log(`✅ Successfully seeded ${roleDefinitions.length} roles.`);

        // Seed Role Hierarchy
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

        // Seed Admin User
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

        console.log("\n🎉 Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Error during seeding:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from database.");
    }
}

seedDatabase();
