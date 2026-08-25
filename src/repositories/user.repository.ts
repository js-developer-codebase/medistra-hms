import { Types } from "mongoose";
import User from "@/models/user.model";
import { IUser } from "@/interfaces/user.interface";
import { CreateUserDto, UpdateUserDto } from "@/dto/user.dto";

export class UserRepository {
    async create(data: CreateUserDto): Promise<IUser> {
        return await new User(data).save();
    }

    async findAll(): Promise<IUser[]> {
        return await User.find().select("-password").populate("role").populate("organization").populate("branch").lean();
    }

    async findById(id: Types.ObjectId): Promise<IUser | null> {
        return await User.findById(id).select("-password").populate("role").populate("organization").populate("branch").lean();
    }

    async findByIdWithPassword(id: Types.ObjectId): Promise<IUser | null> {
        return await User.findById(id).lean();
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email }).lean();
    }

    async findByOrganizationId(organizationId: Types.ObjectId): Promise<IUser[]> {
        return await User.find({ organization: organizationId }).select("-password").populate("role").populate("organization").populate("branch").lean();
    }

    async update(id: Types.ObjectId, data: UpdateUserDto): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, data, { new: true }).select("-password").populate("role").populate("organization").populate("branch").lean();
    }

    async delete(id: Types.ObjectId): Promise<IUser | null> {
        return await User.findByIdAndDelete(id).lean();
    }
}

export default new UserRepository();
