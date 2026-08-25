import userRepository, { UserRepository } from "@/repositories/user.repository";
import { Types } from "mongoose";
import { IUser } from "@/interfaces/user.interface";
import { CreateUserDto, UpdateUserDto } from "@/dto/user.dto";
import bcrypt from "bcryptjs";

export class UserService {
    constructor(private repository: UserRepository = userRepository) { }

    async createUser(data: CreateUserDto): Promise<IUser> {
        const existing = await this.repository.findByEmail(data.email);
        if (existing) {
            throw { statusCode: 409, message: `User with email '${data.email}' already exists` };
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return await this.repository.create(data);
    }

    async getAllUsers(): Promise<IUser[]> {
        return await this.repository.findAll();
    }

    async getUserById(id: Types.ObjectId): Promise<IUser | null> {
        return await this.repository.findById(id);
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await this.repository.findByEmail(email);
    }

    async getUsersByOrganizationId(organizationId: Types.ObjectId): Promise<IUser[]> {
        return await this.repository.findByOrganizationId(organizationId);
    }

    async updateUser(id: Types.ObjectId, data: UpdateUserDto): Promise<IUser | null> {
        const user = await this.repository.findById(id);
        if (!user) {
            throw { statusCode: 404, message: "User not found" };
        }
        if (data.email) {
            const existing = await this.repository.findByEmail(data.email);
            if (existing && existing._id.toString() !== id.toString()) {
                throw { statusCode: 409, message: `Email '${data.email}' is already in use` };
            }
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return await this.repository.update(id, data);
    }

    async deleteUser(id: Types.ObjectId): Promise<IUser | null> {
        const user = await this.repository.findById(id);
        if (!user) {
            throw { statusCode: 404, message: "User not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new UserService();
