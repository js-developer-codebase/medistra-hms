# Medistra Super Speciality Hospital Management System (Medistra HMS)

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.9-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Compliance](https://img.shields.io/badge/Compliance-NABH%20|%20NABL%20|%20ABDM%20|%20GST-emerald?style=flat-square)](https://abdm.gov.in/)

**Medistra HMS** is an enterprise-grade, full-stack Hospital Management & Electronic Medical Record (EMR) platform engineered for tertiary and quaternary care healthcare institutions. 

Built on a modern micro-monolith architecture utilizing Next.js 16 (App Router), React 19, TypeScript, and MongoDB, Medistra HMS unifies outpatient, inpatient, critical care, diagnostics, supply chain, financial billing, regulatory compliance, and multi-channel communications into a single, high-performance operational cockpit.

---

## 🏛️ System Architecture & Engineering Principles

```
                                  ┌────────────────────────┐
                                  │   Next.js 16 Client    │
                                  │ React 19, Tailwind v4  │
                                  │   Zustand, Lucide UI   │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                  ┌───────────▼────────────┐
                                  │   REST API Handlers    │
                                  │ Next.js Route Handlers │
                                  └───────────┬────────────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │   Controller Layer     │
                                  │  Request / Validation  │
                                  └───────────┬────────────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │     Service Layer      │
                                  │ Business Rules & Logic │
                                  └───────────┬────────────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │    Repository Layer    │
                                  │ Data Access & Queries  │
                                  └───────────┬────────────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │   MongoDB / Mongoose   │
                                  │ Atomic Writes & Audits │
                                  └────────────────────────┘
```

1. **Controller-Service-Repository Pattern**: Clean separation of concerns ensuring testability, non-repudiation, and business logic isolation from database operations.
2. **Zero Client-Side Mocking**: 100% of workstations load and persist data to real MongoDB collections via validated REST endpoints.
3. **Strict Indian Healthcare Standards**:
   - **Currency**: Primary currency standardized to **Indian Rupee (`₹` / `INR`)** with Indian numeral formatting (Lakhs and Crores: `1,00,000.00`).
   - **Taxation**: Statutory Indian GST slabs (0%, 5%, 12%, 18%) with room rent tax rules (>₹5,000/day: 5%) and GST-exempt healthcare services.
   - **Timezone**: **`Asia/Kolkata` (IST - UTC+05:30)** synchronized via Stratum-1 NTP atomic servers (`time.google.com`).
   - **Date Conventions**: Statutory Indian date formatting (`DD/MM/YYYY`) across prescriptions, lab reports, and tax invoices.
4. **National & International Compliance Protocols**:
   - **NABH (5th Edition)**: Clinical governance, patient charter compliance, medication safety, and infection control.
   - **ABDM (Ayushman Bharat Digital Mission)**: Milestones M1 (ABHA number issuance), M2 (Health Information Provider - HIP), and M3 (Health Information User - HIU).
   - **NABL 112**: Diagnostic pathology and radiology panic critical value escalation protocols.
   - **Drugs & Cosmetics Act**: Schedule H/H1 prescription mandates and Schedule X narcotic dual-signoff.
   - **HIPAA / DISHA / ISO 27001**: Role-based access control, cryptographic session management, and forensic audit trails.

---

## 🧭 Complete Hospital Menus & Workstation Directory

Medistra HMS encompasses **22 primary modules** and over **180 specialized clinical and administrative workstations**:

### 1. 📊 Executive Dashboard (`/dashboard`)
- `/dashboard/main`: Executive hospital command dashboard with live footfall, admissions, and revenue KPIs.
- `/dashboard/tasks`: Clinician and nurse task scheduler and clinical handovers.
- `/dashboard/notifications`: Real-time system announcements, critical alerts, and broadcasts.
- `/dashboard/alerts`: Emergency red-flag alarms and urgent escalations.

### 2. 👥 Patient Management (`/patients`)
- `/patients/register`: Patient intake with biometric capture, demographic profiling, and ABHA ID generation.
- `/patients/list`: Searchable master patient directory with UHID index.
- `/patients/profile`: Comprehensive 360-degree patient dossier (vitals, diagnoses, encounters).
- `/patients/history`: Chronological historical clinical record index.
- `/patients/documents`: Uploaded radiological scans, paper records, and signed consent forms.
- `/patients/merge`: Duplicate UHID forensic audit and clinical record merge utility.
- `/patients/identification`: Barcode wristband and photo identification generator.
- `/patients/reports`: Patient demographic, age bracket, and geographical distribution analytics.

### 3. 👨‍⚕️ Doctor & Staff Management (`/staff`)
- `/staff/doctors`: Specialist and consultant physician registry with NMC registration credentials.
- `/staff/list`: Allied healthcare staff, clinical technicians, and support personnel.
- `/staff/departments`: Clinical and non-clinical department hierarchy.
- `/staff/designations`: Position grades and job designations.
- `/staff/specializations`: Medical subspecialties and clinical fellowships.
- `/staff/schedule`: Doctor duty timetables, OPD consultation hours, and leave blocks.
- `/staff/directory`: Internal hospital communication telephone directory.

### 4. 📅 Appointments Engine (`/appointments`)
- `/appointments/book`: Outpatient consultation booking with clinician availability calendar.
- `/appointments/calendar`: Multi-physician department calendar matrix.
- `/appointments/list`: Active, completed, and rescheduled appointment index.
- `/appointments/schedule`: Doctor roster management and slot length configuration.
- `/appointments/queue`: Real-time OPD clinic waiting room queue and token screen.
- `/appointments/reschedule`: Slot shifting and doctor substitute assignment.
- `/appointments/cancel`: Patient and doctor cancellation with refund triggers.
- `/appointments/no-show`: Missed appointment logging and follow-up recall tracking.

### 5. 🛏️ Admissions & Discharge (`/admissions`)
- `/admissions/new`: IPD admission intake with admitting doctor and diagnosis allocation.
- `/admissions/current`: Real-time census of currently hospitalized inpatients.
- `/admissions/history`: Historical hospitalization archives.
- `/admissions/transfer`: Inter-ward, ICU, and step-down unit patient transfers.
- `/admissions/discharge`: Multidisciplinary discharge clearance workflow (pharmacy, billing, nursing).
- `/admissions/summary`: NABH-compliant formal electronic discharge summary generator.
- `/admissions/discharge-history`: Archive of discharged encounters.

### 6. 🏥 Ward & Bed Management (`/wards`)
- `/wards/list`: Ward configuration (General, Semi-Private, Deluxe, ICU, CCU, NICU).
- `/wards/rooms`: Room categorization with daily bed tariffs in Indian Rupees (`₹`).
- `/wards/beds`: Individual bed statuses (Available, Occupied, Cleaning, Maintenance).
- `/wards/allocate`: Bed assignment and admission link.
- `/wards/transfer`: Bed reassignment and tariff differential handling.
- `/wards/occupancy`: Real-time bed occupancy percentage and length of stay (ALOS).
- `/wards/availability`: Interactive visual bed availability grid.
- `/wards/dashboard`: Ward nursing station command center.

### 7. 🩺 Clinical / EMR (`/clinical`)
- `/clinical/dashboard`: Doctor outpatient and inpatient clinical console.
- `/clinical/consultations`: Active patient encounter charting.
- `/clinical/records`: Electronic Health Records (EHR) timeline.
- `/clinical/history`: Past medical, surgical, family, and social histories.
- `/clinical/allergies`: Food, drug, and environmental allergy red-flag registry.
- `/clinical/diagnoses`: ICD-10-CM diagnostic classification with provisional/final flags.
- `/clinical/notes`: SOAP clinical progress notes and rounds charting.
- `/clinical/plans`: Multidisciplinary treatment and care regimens.
- `/clinical/prescriptions`: Digital e-prescriptions with dosage, route, frequency, and drug interaction safety checks.
- `/clinical/orders`: Inpatient clinical diagnostic orders (Labs, Imaging, Nursing).
- `/clinical/referrals`: Inter-specialty internal and external physician referrals.
- `/clinical/follow-up`: Scheduled review visits and teleconsultation bookings.
- `/clinical/vitals`: Temperature, Pulse, Blood Pressure, SpO2, and Blood Glucose charting with panic warnings.
- `/clinical/problems`: Active and resolved chronic patient problem lists.

### 8. 👩‍⚕️ Nursing Care (`/nursing`)
- `/nursing/dashboard`: Shift handover and ward nursing overview.
- `/nursing/patients`: Nurse-to-patient assigned census.
- `/nursing/vitals`: Rapid bedside vital signs logging.
- `/nursing/notes`: Shift progress notes and doctor order execution remarks.
- `/nursing/plans`: Nursing care plans and wound dressing regimens.
- `/nursing/medications`: Medication Administration Record (MAR) with 5-rights verification.
- `/nursing/intake-output`: Fluid intake (oral/IV) and output (urine/drain) balance charts.
- `/nursing/tasks`: Timed nursing interventions and stat lab draws.
- `/nursing/handover`: SBAR (Situation, Background, Assessment, Recommendation) shift handovers.
- `/nursing/shifts`: Nursing duty roster and ward assignment.

### 9. 🧪 Laboratory / Pathology (`/lab`)
- `/lab/dashboard`: Lab specimen throughput and pending test queues.
- `/lab/catalog`: NABL diagnostic test catalog with normal reference ranges by age/gender.
- `/lab/orders`: Requisitions ordered by outpatient clinics and inpatient wards.
- `/lab/pending`: Uncollected or unprocessed test queue.
- `/lab/collection`: Phlebotomy sample collection and Code 128 vial barcoding.
- `/lab/processing`: Analyzer interface and batch preparation.
- `/lab/worklist`: Department worklists (Hematology, Biochemistry, Microbiology, Histopathology).
- `/lab/results`: Direct result entry with automated panic value bounds detection.
- `/lab/verify`: Pathologist digital sign-off and authorization.
- `/lab/reports`: Patient diagnostic report PDF generation and dispatch.
- `/lab/history`: Historical specimen and test archives.

### 10. 🦴 Radiology / Imaging (`/radiology`)
- `/radiology/dashboard`: Modality workload (X-Ray, CT, MRI, Ultrasound).
- `/radiology/catalog`: Imaging procedure master with radiation safety guidelines.
- `/radiology/orders`: Inpatient and outpatient radiologic requisitions.
- `/radiology/worklist`: Modality DICOM worklists.
- `/radiology/studies`: DICOM PACS study management.
- `/radiology/images`: Integrated DICOM image series viewer.
- `/radiology/reports`: Structured radiological report dictation.
- `/radiology/verify`: Senior radiologist sign-off.
- `/radiology/imaging-reports`: Verified imaging report library.
- `/radiology/history`: Historical imaging comparison archives.

### 11. 💊 Pharmacy Management (`/pharmacy`)
- `/pharmacy/dashboard`: Dispensing throughput, daily revenue in ₹, and low stock alarms.
- `/pharmacy/medicines`: Master formulary with generic molecule, brand name, and HSN codes.
- `/pharmacy/categories`: Therapeutic classes (Antibiotics, Analgesics, Cardiac, Schedule H, Schedule X).
- `/pharmacy/prescriptions`: Queue of clinical digital e-prescriptions.
- `/pharmacy/dispensing`: Point-of-sale FEFO batch selection and barcode dispensing.
- `/pharmacy/returns`: Patient unused medicine returns and credit memo issuance.
- `/pharmacy/stock`: Batch-level inventory tracking with cost and MRP in ₹.
- `/pharmacy/expiry`: Near-expiry quarantine management (30/60/90 days).
- `/pharmacy/suppliers`: Pharmaceutical manufacturer and distributor directory.
- `/pharmacy/reports`: Drug consumption, fast-moving items, and narcotic ledger reports.

### 12. 🚑 Emergency / Casualty (`/emergency`)
- `/emergency/dashboard`: Casualty bed capacity, red/yellow/green triage counter.
- `/emergency/registration`: Fast-track trauma registration.
- `/emergency/triage`: Manchester Triage System (MTS) color categorization.
- `/emergency/queue`: Priority casualty waiting line.
- `/emergency/consultation`: Emergency physician trauma assessment.
- `/emergency/orders`: Stat emergency lab and trauma radiology orders.
- `/emergency/treatment`: Resuscitation, minor procedures, and wound repair notes.
- `/emergency/admission`: Direct emergency admission to ICU or OT.
- `/emergency/discharge`: Outpatient emergency discharge.
- `/emergency/reports`: Medico-Legal Case (MLC) register and casualty statistics.

### 13. ✂️ Operation Theatre (`/ot`)
- `/ot/dashboard`: OT suite occupancy and ongoing surgical procedures.
- `/ot/schedule`: Master operating theatre daily schedule.
- `/ot/requests`: Surgeon operative requests and pacu reservations.
- `/ot/booking`: Slot confirmation and theatre allocation.
- `/ot/team`: Surgical team roster (Lead Surgeon, Assistant, Anesthetist, Scrub Nurse).
- `/ot/preop`: WHO Surgical Safety Checklist (Sign In, Time Out, Sign Out).
- `/ot/anesthesia`: Pre-anesthetic evaluation (PAC) and intra-op anesthesia chart.
- `/ot/intraop`: Surgeon intraoperative notes, implant tracking, and swabs count.
- `/ot/postop`: Recovery room (PACU) observations and Aldrete scoring.
- `/ot/reports`: OT utilization efficiency and surgical morbidity audits.

### 14. 🩸 Blood Bank (`/blood-bank`)
- `/blood-bank/dashboard`: Blood unit reserves by type (A+, B+, AB+, O+, etc.).
- `/blood-bank/donors`: Voluntary donor registry and donation history.
- `/blood-bank/collection`: Phlebotomy collection and bag numbering.
- `/blood-bank/inventory`: Component separation (PRBC, FFP, Platelets, Cryoprecipitate).
- `/blood-bank/testing`: Mandatory infectious disease screening (HIV, HBV, HCV, Syphilis, Malaria).
- `/blood-bank/cross-matching`: Major/minor cross-matching with recipient blood samples.
- `/blood-bank/requests`: Ward and OT blood component requisitions.
- `/blood-bank/issue`: Cross-matched blood unit issue with transfusion slips.
- `/blood-bank/return`: Unused blood unit return and cold-chain verification.
- `/blood-bank/reports`: State Drug Controller blood bank statutory registers.

### 15. 📦 Inventory Management (`/inventory`)
- `/inventory/dashboard`: Total hospital inventory valuation in ₹ and stock health.
- `/inventory/items`: Master non-pharmaceutical item catalog (Surgical consumables, PPE, Linens).
- `/inventory/categories`: Asset and consumable categorization.
- `/inventory/stock`: Departmental bin-level stock balances.
- `/inventory/stock-in`: Stock inwarding from central warehouse.
- `/inventory/stock-out`: Ward and clinic consumption dispatches.
- `/inventory/transfer`: Inter-department stock transfers.
- `/inventory/adjustment`: Physical audit reconciliation and wastage write-offs.
- `/inventory/expiry`: Consumable shelf-life monitoring.
- `/inventory/low-stock`: Minimum reorder level alerts.
- `/inventory/reports`: ABC/VED inventory analysis and consumption trends.

### 16. 🛒 Procurement & Supply Chain (`/procurement`)
- `/procurement/dashboard`: Active Purchase Orders, pending vendor receipts, and spends in ₹.
- `/procurement/suppliers`: Empaneled vendor directory with GSTIN and bank details.
- `/procurement/requests`: Internal departmental material purchase requisitions.
- `/procurement/orders`: Formal Purchase Order (PO) creation with GST tax breakdowns.
- `/procurement/receipt`: Goods Receipt Note (GRN) with inspection and gate-entry.
- `/procurement/invoices`: Vendor invoice matching and accounts payable verification.
- `/procurement/reports`: Spend analytics, vendor delivery SLA compliance, and purchase registers.

### 17. 💵 Billing & Finance (`/finance`)
- `/finance/dashboard`: Daily hospital collections, cash vs digital breakdown, and receivables in ₹.
- `/finance/invoice/create`: Comprehensive bill creation bundling OPD, IPD, Labs, and Drugs.
- `/finance/invoices`: Master invoice register with statutory CGST/SGST breakdowns.
- `/finance/payments`: Multi-mode payment recording (Cash, UPI/QR, Cards, NetBanking, NEFT).
- `/finance/receipts`: Official money receipts with thermal and A4 print templates.
- `/finance/refunds`: Deposit and cancellation refunds with dual approval.
- `/finance/discounts`: Concession and institutional discount authorization.
- `/finance/credit-notes`: Inpatient billing adjustments and cancellations.
- `/finance/outstanding`: Corporate, TPA, and patient pending debt aging.
- `/finance/reports`: Financial audit registers, revenue by department, and GST return sheets.

### 18. 🛡️ Insurance & TPA Desk (`/insurance`)
- `/insurance`: TPA operational hub with live claims pipeline, realized remittances, and recovery yields.
- `/insurance/providers`: Empaneled insurance companies and TPAs (Star Health, HDFC ERGO, ICICI Lombard, Medi Assist, etc.).
- `/insurance/policies`: Patient policy repository with sum insured, available balance, and room rent caps.
- `/insurance/eligibility`: Real-time coverage verification engine with downloadable Certificate of Coverage.
- `/insurance/preauth`: Cashless pre-authorization creation, clinical cost estimations, and approval tracking.
- `/insurance/claims`: Master claims register linked directly to inpatient invoices.
- `/insurance/documents`: Clinical document bundle repository (discharge summary, OT notes, lab reports).
- `/insurance/submission`: Electronic batch submission with validation audits.
- `/insurance/tracking`: 5-stage claim milestone stepper with color-coded turnaround time (TAT) alerts.
- `/insurance/settlement`: Bank remittance reconciliation with NEFT UTR numbers and disallowance analysis.
- `/insurance/reports`: TPA performance scorecards, recovery ratios, and root-cause deduction analytics.

### 19. 📈 Reports & Analytics (`/reports`)
- `/reports`: Central analytical hub providing unified cross-department telemetry.
- `/reports/management`: Executive dashboard with financial turnover, active doctors, and patient footfall.
- `/reports/patients`: Demographic analytics, gender ratios, blood groups, and pediatric/geriatric distributions.
- `/reports/appointments`: Doctor booking volumes, cancellation rates, and peak hour distributions.
- `/reports/doctors`: Clinical productivity, outpatient consultations, and surgical volumes.
- `/reports/admissions`: Ward admission trends, emergency vs elective admissions, and LOS.
- `/reports/discharges`: Planned vs unplanned discharges, LAMA cases, and discharge turnaround times.
- `/reports/beds`: Ward occupancy percentages, bed turnover intervals, and vacancy heatmaps.
- `/reports/clinical`: Top ICD-10 diagnoses, infection control rates, and surgical safety compliance.
- `/reports/lab`: Pathology test volumes, turnaround times (TAT), and abnormal result distribution.
- `/reports/radiology`: Modality utilization, reporting turnaround, and study counts.
- `/reports/pharmacy`: Medicine revenue in ₹, top dispensed molecules, and near-expiry scrap reports.
- `/reports/inventory`: Inventory valuation, stockout events, and department consumption trends.
- `/reports/procurement`: Purchase order fulfillment, procurement spends in ₹, and vendor rating scores.
- `/reports/billing`: Gross vs net revenue, cash vs digital payment splits, and collection efficiency.
- `/reports/insurance`: TPA claim settlement ratios, average settlement days, and deduction sums.
- `/reports/departments`: Revenue and clinical contribution matrix across hospital departments.

### 20. 🧑‍💼 Staff & Human Resources (`/hr`)
- `/hr/employees`: Comprehensive employee directory with emergency contacts and clinical credentials.
- `/hr/profiles`: Individual staff dossiers (qualifications, council registrations, compensation).
- `/hr/departments`: Hospital human resource allocation across departments.
- `/hr/designations`: Job bands and clinical ranks.
- `/hr/shifts`: Hospital shift definitions (Morning, Evening, Night, Emergency On-Call).
- `/hr/attendance`: Daily attendance logging with biometric punch-in emulation.
- `/hr/leave`: Leave balance management and clinical cover approval workflows.
- `/hr/documents`: Staff credential verification (Medical degree, State Council Registration, BLS/ACLS).
- `/hr/reports`: Staff turnover, absenteeism, and department staffing adequacy reports.

### 21. 🔔 Communications & Notifications (`/notifications`)
- `/notifications`: Communications hub with delivery rates across SMS, WhatsApp, and Email.
- `/notifications/list`: Real-time notification feed for logged-in users.
- `/notifications/sms`: National Health SMS dispatch console with TRAI DLT headers.
- `/notifications/email`: Hospital SMTP outbound dispatcher.
- `/notifications/templates`: Standardized clinical communication templates with dynamic tokens.
- `/notifications/rules`: Automated event triggers (OPD booking, panic lab results, discharge clearance).
- `/notifications/history`: Forensic communication delivery ledger with timestamped delivery receipts.

### 22. 🔒 Administration & Security (`/admin`)
- `/admin/users`: User account management with status toggling (Active/Suspended/Locked).
- `/admin/users/add`: New staff onboarding with role assignments.
- `/admin/sessions`: Active user session monitor with remote token revocation.
- `/admin/roles`: 39 pre-configured hospital roles with inheritance hierarchy.
- `/admin/roles/create`: Custom role builder with action-level permissions.
- `/admin/permissions`: Fine-grained permission matrix (View, Create, Update, Delete, Export).
- `/admin/assignments`: Direct user-to-role assignment engine.
- `/admin/policies`: Contextual access policies (IP whitelisting, time-of-day access, biometric mandates).

### 23. 🏢 Organization Management (`/organization`)
- `/organization/details`: Multi-hospital trust details, tax IDs, and institutional governance.
- `/organization/hospitals`: Multi-facility network configuration.
- `/organization/branches`: Geographical branch network management.
- `/organization/departments`: Global department taxonomy across all branch campuses.
- `/organization/settings`: Trust-wide financial years and consolidated policies.
- `/organization/hospital-settings`: Facility-specific inpatient bed quotas and clinical services.
- `/organization/branch-settings`: Branch-level contact numbers, reception desks, and operating hours.

### 24. 🛡️ Audit & Regulatory Compliance (`/audit`)
- `/audit`: Security and compliance telemetry hub with threat level banner and compliance posture score (94%).
- `/audit/logs`: Filterable master audit log with Category, Severity, and forensic event inspector.
- `/audit/activity`: Staff workflow monitoring with action attribution across clinical and financial modules.
- `/audit/login`: Authentication ledger tracking IP address, device fingerprints, and brute-force lockout warnings.
- `/audit/access`: Protected Health Information (PHI/EHR) access trails linked to patient UHID.
- `/audit/changes`: Dual-state record diff viewer capturing before-and-after attribute transitions.
- `/audit/security`: Threat incident console with root-cause investigation and resolution workflows.
- `/audit/deleted`: Forensic ledger of soft-deleted records, cancelled orders, and voided bills in ₹.
- `/audit/reports`: Formal compliance evaluations for NABH 5th Edition, HIPAA, DISHA/ABDM, and ISO 27001.

### 25. ⚙️ System Configuration (`/config`)
- `/config`: Master Configuration Hub with health diagnostics and telemetry across all 13 modules.
- `/config/general`: Hospital legal identity, branding, 24x7 emergency helpline, and campus address.
- `/config/localization`: Indian English (`en-IN`), Hindi, Indian date format (`DD/MM/YYYY`), and numeral systems.
- `/config/currency`: Strict Indian Rupee (`₹` / `INR`), Lakhs/Crores grouping, and round-to-nearest-rupee policy.
- `/config/timezone`: `Asia/Kolkata` (IST UTC+05:30), NTP stratum-1 time sync (`time.google.com`), and drift tolerance.
- `/config/numbering`: Auto-numbering sequence prefixes and zero-padding for UHID, IPD, OPD, Invoices, Prescriptions, Labs, and POs.
- `/config/appointments`: OPD slot length (15 min), buffer times, advance booking windows, and teleconsultation toggles.
- `/config/billing`: Statutory Indian GST slabs (0%, 5%, 12%, 18%), room rent tax cutoffs, and accepted payment modes.
- `/config/clinical`: ICD-10 diagnostic coding, vital panic alert thresholds (BP, Pulse, SpO2, Blood Sugar), and drug allergy blocks.
- `/config/laboratory`: NABL panic critical value thresholds, Code 128 barcode standards, and STAT emergency turnaround times.
- `/config/pharmacy`: FEFO dispensing valuation, Schedule H/H1 validation, and Schedule X narcotic dual-signoff.
- `/config/notifications`: National Health SMS gateway, TRAI DLT sender ID (`MDSTRA`), WhatsApp Business API, and SMTP relay.
- `/config/integrations`: Ayushman Bharat Digital Mission (ABDM M1/M2/M3), HL7/FHIR R4 server endpoints, and DICOM PACS archive.
- `/config/api`: Public REST API gateway rate-limiting (120 req/min), webhook retries, and CORS domain whitelisting.

---

## 💻 Tech Stack & Dependencies

| Category | Technology | Version / Specification |
|---|---|---|
| **Framework** | Next.js | `16.3.1` (App Router) |
| **Frontend UI** | React | `19.2.8` |
| **Language** | TypeScript | `^5.0` (Strict Mode) |
| **Styling** | Tailwind CSS | `@tailwindcss/postcss` `v4.0` |
| **Component Icons** | Lucide React | `^1.34.0` |
| **Charts & Telemetry** | Recharts | `^3.10.1` |
| **State Management** | Zustand | `^5.0.15` |
| **Database & ORM** | MongoDB & Mongoose | `^9.9.3` |
| **Authentication** | NextAuth.js & BCrypt | `next-auth ^4.24.15`, `bcryptjs ^3.0.3` |
| **Class Utilities** | clsx & tailwind-merge | `clsx ^2.1.1`, `tailwind-merge ^3.6.0` |

---

## ⚡ Setup & Installation Guide

### Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **MongoDB**: `v6.x` or higher (Local instance or MongoDB Atlas cluster)
- **Package Manager**: `npm` (v9+) or `pnpm`

### 1. Clone the Repository
```bash
git clone https://github.com/your-organization/medistra-hms.git
cd medistra-hms
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/medistra-hms

# NextAuth Security & URLs
NEXTAUTH_SECRET=your_super_secret_cryptographic_key_here
NEXTAUTH_URL=http://localhost:3000

# Default Super Administrator
DEFAULT_ADMIN_EMAIL=admin@hospital.com
DEFAULT_ADMIN_PASSWORD=password123

# Node Environment
NODE_ENV=development
```

### 4. Seed Baseline Hospital Data
Initialize the database with the complete hospital directory, 39 roles, navigation menus, sample patients, clinical staff, bed allocations, pharmacy inventory, lab tests, and baseline system settings (Sections 1 through 16):
```bash
npm run seed
```
*Note: This command runs `npx tsx src/seed.ts` and prepares a ready-to-use hospital database.*

### 5. Start Development Server
```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

### 6. Production Verification & Build
To verify type safety and build optimized static/dynamic route bundles:
```bash
# Verify TypeScript Type Safety (0 errors)
npx tsc --noEmit

# Compile Production Build
npm run build

# Start Production Server
npm run start
```

---

## 🔐 Default Access Credentials

Once the database has been initialized with `npm run seed`, you can authenticate using the default super administrator account:

| Attribute | Default Value | Notes |
|---|---|---|
| **URL** | `http://localhost:3000/login` | Secure NextAuth login portal |
| **Email** | `admin@hospital.com` | Configurable via `DEFAULT_ADMIN_EMAIL` |
| **Password** | `password123` | Configurable via `DEFAULT_ADMIN_PASSWORD` |
| **Assigned Role** | `Super Admin` | Full root access across all 22 modules |

### Additional Pre-Seeded Personnel Profiles
The database seed script initializes realistic doctor, nurse, pharmacist, lab technician, and TPA officer profiles that can be inspected under `/admin/users`.

---

## 📁 Repository Directory Structure

```
medistra-hms/
├── src/
│   ├── app/
│   │   ├── (dashboard)/            # Authenticated workstation layouts & pages
│   │   │   ├── admissions/         # Inpatient admissions & discharges
│   │   │   ├── appointments/       # Outpatient appointment scheduling
│   │   │   ├── audit/              # Forensic audit logs & compliance reports
│   │   │   ├── blood-bank/         # Donor registry & component management
│   │   │   ├── clinical/           # Doctor EMR, diagnoses & prescriptions
│   │   │   ├── config/             # System configuration hub & 13 submodules
│   │   │   ├── dashboard/          # Clinical & executive dashboards
│   │   │   ├── emergency/          # Casualty & trauma triage
│   │   │   ├── finance/            # Invoicing, GST tax bills & payments
│   │   │   ├── hr/                 # Staff directory, shifts & attendance
│   │   │   ├── insurance/          # TPA desk, cashless preauth & claims
│   │   │   ├── inventory/          # Medical supply stock & consumables
│   │   │   ├── lab/                # Pathology test orders & panic results
│   │   │   ├── notifications/      # Multi-channel alerts & delivery logs
│   │   │   ├── organization/       # Multi-branch trust governance
│   │   │   ├── ot/                 # Operation theatre suites & surgeries
│   │   │   ├── patients/           # Patient master index & ABHA ID intake
│   │   │   ├── pharmacy/           # Dispensary, formulary & narcotic controls
│   │   │   ├── procurement/        # Purchase orders & vendor receipts
│   │   │   ├── radiology/          # DICOM imaging & PACS studies
│   │   │   ├── reports/            # Analytical reports & cross-dept KPIs
│   │   │   ├── staff/              # Doctor schedules & staff directory
│   │   │   └── wards/              # Ward beds & occupancy tracking
│   │   ├── api/                    # REST API route handlers
│   │   │   ├── admin/
│   │   │   ├── audit/
│   │   │   ├── config/
│   │   │   ├── finance/
│   │   │   ├── insurance/
│   │   │   ├── reports/
│   │   │   └── ... (all module endpoints)
│   │   ├── layout.tsx              # Root HTML & theme wrapper
│   │   └── page.tsx                # Public redirect / landing page
│   ├── components/
│   │   ├── layout/                 # Sidebar, header & navigation components
│   │   └── ui/                     # Shadcn UI primitives (Card, Button, Badge, Modal, etc.)
│   ├── controllers/                # API Request handlers & response formatting
│   ├── interfaces/                 # TypeScript data contracts & interfaces
│   ├── lib/                        # Database connection & shared utilities
│   ├── models/                     # Mongoose schemas & MongoDB models
│   ├── repositories/               # Direct MongoDB queries & aggregation pipelines
│   ├── services/                   # Business logic, calculation & validation rules
│   └── seed.ts                     # Master database seeder (Sections 1 to 16)
├── public/                         # Static assets & brand media
├── .env.local                      # Local environment configuration (git-ignored)
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # TypeScript compiler configuration
└── README.md                       # Comprehensive platform documentation
```


