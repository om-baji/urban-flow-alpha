import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import dbConnect from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { AdminModel } from "@/server/models/adminModel";
import bcrypt from "bcryptjs";

const typeDefs = `
  type Admin {
  centerID: String!
  password: String!
  lat: Float!
  lng: Float!
  centerName: String!
}

type Query {
  admins: [Admin!]
  admin(centerID: String!, password: String!): Admin
}

type Mutation {
  addAdmin(centerID: String!, password: String!, lat: Float!, lng: Float!, centerName: String!): Admin
}
`

const resolvers = {
  Query: {
      admins: async () => {
        return await AdminModel.find();
      },
      admin: async (_: unknown, { centerID, password }: {
        centerID: string,
        password: string
      }) => {
        try {
          console.log('Attempting to find admin with centerID:', centerID);
          
          const admin = await AdminModel.findOne({ centerID });
          if (!admin) {
            console.error('No admin found with centerID:', centerID);
            throw new Error(`Admin with centerID ${centerID} not found`);
          }
  
          console.log('Admin found, verifying password');
          const validPassword = await bcrypt.compare(password, admin.password);
          
          if (!validPassword) {
            console.error('Password verification failed for centerID:', centerID);
            throw new Error('Invalid credentials');
          }
          
          console.log('Password verified successfully');
          return admin;
        } catch (error) {
          console.error('Error in admin query:', error);
          throw error;
        }
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
          centerID: centerID,
          password: hashedPassword,
          lat: lat,
          lng: lng,
          centerName: centerName
        });
        await newAdmin.save();
        console.log(newAdmin)
  
        return newAdmin;
      },
    },
}

await dbConnect();

const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler(server, {
  //@ts-ignore
  context: async (req: NextRequest, res: NextResponse) => ({
    req,
    res,
  }),
});

export { handler as GET, handler as POST };
