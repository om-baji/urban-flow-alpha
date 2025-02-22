import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import dbConnect from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

const resolversArray = loadFilesSync("src/graphql/**/*.resolver.js");
const resolvers = mergeResolvers(resolversArray);

const baseTypeDefs = `
  type Admin {
  centerID: ID!
  password: String!
  lat: Float!
  lng: Float!
  centerName: String!
}

type Query {
  admins: [Admin!]
  admin(centerID: ID!, password: String!): Admin
}

type Mutation {
  addAdmin(centerID: ID!, password: String!, lat: Float!, lng: Float!, centerName: String!): Admin
}
  
`;
const typeDefsArray = loadFilesSync("src/graphql/**/*.graphql");
const typeDefs = mergeTypeDefs([baseTypeDefs, ...typeDefsArray]);

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
