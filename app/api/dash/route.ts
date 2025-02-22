import dbConnect from "@/server/db";
import { NextResponse } from "next/server";
import { Violation } from "@/server/models/violationModel";

export async function GET(){
    await dbConnect();
    try {
        const data = await Violation.find()
        // console.log(data)

        return NextResponse.json({
            message : "Fetch Success!",
            data
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message : "Somethin went wrong!",
            error
        })
    }
}