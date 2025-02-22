import mongoose from "mongoose";

interface conenctionObject {
    isConnected? : number;
}

const connection : conenctionObject =  {}

export default async function dbConnect() : Promise<void> {
    if(connection.isConnected){
        console.log("Already connected to db")
        return;
    }

    try {
        
        const db = await mongoose.connect(process.env.MONGODB_URI as string)

        connection.isConnected = db.connections[0].readyState

        console.log("Database connected!")

    } catch (e) {
        console.log("Database connection failed!", e);

        process.exit();
    }

}