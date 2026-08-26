# Medistra Hospital Management System (HMS)

Medistra is a comprehensive, enterprise-grade Hospital Management System built to streamline healthcare operations, clinical workflows, and administrative tasks. The system is designed with a modern tech stack, ensuring scalability, performance, and an intuitive user experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Language**: TypeScript

## ✨ Key Features & Modules

Medistra encompasses 22 primary hospital modules, delivering end-to-end management capabilities:

### 🏥 Core Medical Operations
* **Patient Management**: Complete registry, OP/IP tracking, demographic data, and medical history.
* **Clinical / EMR**: Digital charting, consultation notes, diagnoses (ICD), and vital sign monitoring.
* **Appointments Engine**: Doctor scheduling, calendar queues, and consultation booking.
* **Wards & Admissions**: Dynamic bed allocation, real-time occupancy tracking, and discharge workflows.

### 🔬 Diagnostics & Clinical Support
* **Laboratory**: Test catalogs, sample collection tracking, and pathology result publishing.
* **Radiology / Imaging**: Modality worklists, study tracking, and radiologist reporting.
* **Pharmacy**: Complete pharmacopeia, prescription dispensing, stock tracking, and expiry alerts.
* **Blood Bank**: Donor registry, cross-matching, blood inventory, and issue logs.

### 💼 Administration & HR
* **Advanced RBAC**: 39 predefined hospital roles (e.g., Doctor, Nurse, Lab Tech, Auditor) with granular, action-level permissions and hierarchical inheritance.
* **Staff & HR**: Employee directories, duty shifts, and departmental assignments.
* **Organization Management**: Multi-branch support modeling Hospitals, Branches, and Departments.
* **Audit & Compliance**: Deep system logging for security events, user activity, and data access.

### 💰 Finance & Supply Chain
* **Billing & Finance**: Patient invoicing, payment gateways, receipts, and refund tracking.
* **Inventory & Procurement**: Medical supply stock levels, low-stock alerts, and purchase order lifecycles.
* **Insurance / TPA**: Insurance provider mapping, patient policy linking, and claims processing.

### 📊 Operations
* **Emergency / Casualty**: Rapid registration, triage queuing, and critical care flow.
* **Operation Theatre (OT)**: Surgery scheduling, surgical team mapping, and pre/post-op tracking.
* **Reports & Analytics**: High-level dashboards aggregating daily hospital KPIs (revenue, admissions, footfall).
* **System Configuration**: Global localization, currency, timezone, and notification templates.

## 📦 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB Database URI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medistra-hms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_super_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Seed the Database**
   Initialize the system with the default roles, menus, and super-admin account:
   ```bash
   npm run seed
   # Note: You may need to run `npx ts-node src/seed.ts` depending on your setup
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧑‍💻 Architecture Highlights

* **Controller-Service-Repository Pattern**: The backend API routes strictly follow this pattern to separate business logic from data access, ensuring a clean and maintainable codebase.
* **Dynamic Sidebar Navigation**: The application navigation is rendered dynamically from the database based on the authenticated user's permission boundaries.
* **Graceful Degradation**: Routes that are currently under development are safely scaffolded with a professional "Under Construction" UI to prevent 404 navigation errors.

## 🛡️ Default Access
If you have run the seeder, you can log in with the default credentials:
- **Email:** `admin@hospital.com`
- **Password:** `password123`

