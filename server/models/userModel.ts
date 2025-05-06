import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
    id?: number;
    name?: string;
    email: string;
    clerk_id?: string;
}

const userSchema = new Schema({
    id: {
        type: Number,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: [true],
    },
    clerk_id: {
        type: String,
    },
});

export const UserModel = mongoose.models.user || mongoose.model<IUser>("user", userSchema);