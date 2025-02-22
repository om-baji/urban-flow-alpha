import { AdminModel } from "@/server/models/adminModel";
import bcrypt from "bcryptjs"

export const resolvers = {
  Query: {
    admins: async () => {
      return await AdminModel.find();
    },
    admin: async (_: unknown, { centerID , password } : {
        centerID : string,
        password : string
    }) => {
      const admin = await AdminModel.findOne({ centerID });
      if (!admin) {
        throw new Error('AdminModel not found');
      }

      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        throw new Error('Invalid password');
      }
      
      return admin;
    },
  },
  Mutation: {
    addAdmin: async (_ : unknown, { centerID, password, lat, lng, centerName } : {
        centerID : string,
        password : string,
        lat : number,
        lng : number,
        centerName : string
    }) => {
      const existingAdmin = await AdminModel.findOne({ centerID });
      if (existingAdmin) {
        throw new Error('AdminModel already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new AdminModel({
        centerID,
        password: hashedPassword,
        lat,
        lng,
        centerName
      });
      await newAdmin.save();
      console.log(newAdmin)

      return newAdmin;
    },
  },
};
