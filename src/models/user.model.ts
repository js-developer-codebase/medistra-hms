import mongoose, { Schema } from "mongoose";
import { IUser } from "@/interfaces/user.interface";

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    photoId: {
        type: String,
    },
    phone: {
        type: String,
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;