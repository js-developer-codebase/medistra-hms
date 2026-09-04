import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultDoctorService, { DoctorService } from "@/services/doctor.service";
import { CreateDoctorDto, UpdateDoctorDto } from "@/dto/doctor.dto";
import User from "@/models/user.model";
import Role from "@/models/role.model";
import bcrypt from "bcryptjs";

export class DoctorController {
    constructor(private doctorService: DoctorService = defaultDoctorService) { }

    async createDoctor(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const body: any = await request.json();

            let userId = body.userId;

            // If user information is provided directly, find or create the User
            if (!userId && body.email && body.name) {
                let existingUser = await User.findOne({ email: body.email.toLowerCase().trim() });
                if (!existingUser) {
                    let doctorRole = await Role.findOne({ role: "DOCTOR" });
                    if (!doctorRole) {
                        doctorRole = await Role.create({
                            role: "DOCTOR",
                            access: []
                        });
                    }
                    const hashedPassword = await bcrypt.hash(body.password || "doctor123", 10);
                    existingUser = await User.create({
                        name: body.name.trim(),
                        email: body.email.toLowerCase().trim(),
                        password: hashedPassword,
                        gender: body.gender || "OTHER",
                        phone: body.phone,
                        role: doctorRole._id,
                        isActive: true
                    });
                }
                userId = existingUser._id.toString();
            }

            if (!userId || !body.departmentId || !body.licenseNo) {
                return NextResponse.json(
                    { success: false, message: "Doctor Name/User, Department, and License No. are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(userId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid user ID format" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(body.departmentId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid department ID format" },
                    { status: 400 }
                );
            }

            const doctorData: CreateDoctorDto = {
                userId,
                departmentId: body.departmentId,
                licenseNo: body.licenseNo.trim(),
                specialization: body.specialization?.trim() || "",
                qualification: body.qualification?.trim() || "",
                experienceYears: Number(body.experienceYears) || 0,
                consultationFee: Number(body.consultationFee) || 0,
                roomNumber: body.roomNumber?.trim() || "",
                bio: body.bio?.trim() || "",
                phone: body.phone?.trim() || "",
                status: body.status || "ACTIVE"
            };

            const doctor = await this.doctorService.createDoctor(doctorData);

            return NextResponse.json(
                { success: true, message: "Doctor created successfully", data: doctor },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create doctor" },
                { status: statusCode }
            );
        }
    }

    async getDoctors(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const departmentId = searchParams.get('departmentId');
            const search = searchParams.get('search')?.toLowerCase().trim();

            let doctors = await this.doctorService.getAllDoctors();

            if (departmentId && Types.ObjectId.isValid(departmentId)) {
                doctors = doctors.filter((d: any) => 
                    d.departmentId && (d.departmentId._id?.toString() === departmentId || d.departmentId.toString() === departmentId)
                );
            }

            if (search) {
                doctors = doctors.filter((d: any) => {
                    const name = d.userId?.name?.toLowerCase() || "";
                    const email = d.userId?.email?.toLowerCase() || "";
                    const spec = d.specialization?.toLowerCase() || "";
                    const lic = d.licenseNo?.toLowerCase() || "";
                    const dept = d.departmentId?.name?.toLowerCase() || "";
                    return name.includes(search) || email.includes(search) || spec.includes(search) || lic.includes(search) || dept.includes(search);
                });
            }

            return NextResponse.json(
                { success: true, count: doctors.length, data: doctors },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch doctors" },
                { status: 500 }
            );
        }
    }

    async getDoctorById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid doctor ID" },
                    { status: 400 }
                );
            }

            const doctor = await this.doctorService.getDoctorById(new Types.ObjectId(id));
            if (!doctor) {
                return NextResponse.json(
                    { success: false, message: "Doctor not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: doctor },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch doctor" },
                { status: 500 }
            );
        }
    }

    async updateDoctor(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid doctor ID" },
                    { status: 400 }
                );
            }

            const body: any = await request.json();

            if (body.userId && !Types.ObjectId.isValid(body.userId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid user ID format" },
                    { status: 400 }
                );
            }

            if (body.departmentId && !Types.ObjectId.isValid(body.departmentId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid department ID format" },
                    { status: 400 }
                );
            }

            const doctor = await this.doctorService.updateDoctor(new Types.ObjectId(id), body);

            // Also update linked user profile if doctor has userId
            if (doctor && doctor.userId) {
                const userUpdate: any = {};
                if (body.name) userUpdate.name = body.name.trim();
                if (body.phone) userUpdate.phone = body.phone.trim();
                if (typeof body.isActive === "boolean") userUpdate.isActive = body.isActive;
                if (Object.keys(userUpdate).length > 0) {
                    const uId = (doctor.userId as any)._id || doctor.userId;
                    await User.findByIdAndUpdate(uId, userUpdate);
                }
            }

            return NextResponse.json(
                { success: true, message: "Doctor updated successfully", data: doctor },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update doctor" },
                { status: statusCode }
            );
        }
    }

    async deleteDoctor(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid doctor ID" },
                    { status: 400 }
                );
            }

            await this.doctorService.deleteDoctor(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Doctor deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete doctor" },
                { status: statusCode }
            );
        }
    }
}

export default new DoctorController();
