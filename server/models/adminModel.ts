import mongoose, { Schema } from "mongoose";
const adminSchema = new Schema({
  centerID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  centerName: { type: String, required: true },
});

export const AdminModel =
  mongoose.models.admins || mongoose.model("Admin", adminSchema);
