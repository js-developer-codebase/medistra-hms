require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Default local MongoDB URI, falls back to env variable if present
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medistra-hms";
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@hospital.com";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "password123";

// --- Schema Definitions (Self-contained for easy execution) ---

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, default: "" },
    icon: { type: String, default: "" },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu", default: [] }]
}, { timestamps: true });

const roleSchema = new mongoose.Schema({
    role: { type: String, required: true },
    access: { type: [Array], required: true }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Models
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);
const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- Seed Data ---

const menusData = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        children: []
    },
    {
        name: "Patient Management",
        path: "/patients",
        icon: "Users",
        children: [
            { name: "Add Patient", path: "/patients/add", icon: "UserPlus" },
            { name: "View Patients", path: "/patients/list", icon: "List" }
        ]
    },
    {
        name: "Doctor Management",
        path: "/doctors",
        icon: "Stethoscope",
        children: [
            { name: "Add Doctor", path: "/doctors/add", icon: "UserPlus" },
            { name: "View Doctors", path: "/doctors/list", icon: "List" }
        ]
    },
    {
        name: "Appointments",
        path: "/appointments",
        icon: "Calendar",
        children: [
            { name: "Book Appointment", path: "/appointments/book", icon: "CalendarPlus" },
            { name: "View Appointments", path: "/appointments/list", icon: "List" }
        ]
    },
    {
        name: "Admissions",
        path: "/admissions",
        icon: "Bed",
        children: [
            { name: "New Admission", path: "/admissions/new", icon: "PlusCircle" },
            { name: "View Admissions", path: "/admissions/list", icon: "List" }
        ]
    },
    {
        name: "Ward Management",
        path: "/wards",
        icon: "Building",
        children: [
            { name: "Wards", path: "/wards/list", icon: "Layout" },
            { name: "Rooms", path: "/wards/rooms", icon: "DoorOpen" },
            { name: "Beds", path: "/wards/beds", icon: "BedDouble" }
        ]
    },
    {
        name: "Inventory",
        path: "/inventory",
        icon: "Package",
        children: [
            { name: "Add Item", path: "/inventory/add", icon: "Plus" },
            { name: "Stock List", path: "/inventory/list", icon: "List" }
        ]
    },
    {
        name: "Billing & Invoices",
        path: "/billing",
        icon: "Receipt",
        children: [
            { name: "Create Invoice", path: "/billing/create", icon: "FilePlus" },
            { name: "View Invoices", path: "/billing/list", icon: "List" }
        ]
    }
];

async function seedDatabase() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully!");

        // 1. Clear existing base data to avoid duplicates (Optional but recommended for a seed script)
        console.log("Clearing existing seed data...");
        await User.deleteMany({ email: DEFAULT_ADMIN_EMAIL });
        await Role.deleteMany({ role: "SUPER_ADMIN" });
        await Menu.deleteMany({}); // Warning: Clears all menus

        // 2. Insert Menus
        console.log("Seeding menus...");
        const createdMenus = [];
        
        for (const menuGroup of menusData) {
            const { children, ...parentData } = menuGroup;
            
            // Create parent
            const parentMenu = await Menu.create(parentData);
            
            // Create children if any
            if (children && children.length > 0) {
                const childIds = [];
                for (const child of children) {
                    const childMenu = await Menu.create(child);
                    childIds.push(childMenu._id);
                }
                
                // Update parent with children IDs
                parentMenu.children = childIds;
                await parentMenu.save();
            }
            
            createdMenus.push(parentMenu);
        }
        console.log(`✅ Successfully seeded ${menusData.length} parent menus with their children.`);

        // 3. Insert Role
        console.log("Seeding roles...");
        const adminRole = await Role.create({
            role: "SUPER_ADMIN",
            access: [
                {
                    moduleName: "ALL",
                    permissions: ["CREATE", "READ", "UPDATE", "DELETE"]
                }
            ]
        });
        console.log("✅ Successfully seeded SUPER_ADMIN role.");

        // 4. Insert Admin User
        console.log("Seeding admin user...");
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
        const adminUser = await User.create({
            name: "Super Admin",
            email: DEFAULT_ADMIN_EMAIL,
            password: hashedPassword, 
            gender: "MALE",
            role: adminRole._id,
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

// Execute the seed function
seedDatabase();
