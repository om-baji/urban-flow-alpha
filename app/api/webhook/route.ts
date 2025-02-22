"use server";
import dbConnect from "@/server/db";
import { UserModel } from "@/server/models/userModel";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import {WebhookEvent} from "@clerk/nextjs/server"

export async function POST(req : NextRequest) {
    const webhook_secret = process.env.WEBHOOK_SECRET;

    if (!webhook_secret) {
        throw new Error("No webhook secret!");
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const headersList = await headers();
    const wh = new Webhook(webhook_secret);
    let evt : WebhookEvent;

    await dbConnect();

    try {
        evt = wh.verify(body,   {
            "svix-id": headersList.get("svix-id") as string,
            "svix-signature": headersList.get("svix-signature") as string,
            "svix-timestamp": headersList.get("svix-timestamp") as string,
        }) as WebhookEvent;

        console.log(evt);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Webhook verification failed" }, { status: 400 });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created") {
        try {
            const { email_addresses, primary_email_address_id } = evt.data;
            const email = email_addresses.find(
                (email) => email.id === primary_email_address_id
            );
            console.log(id,email)
            const user = new UserModel({
                clerk_id : id,
                email: email?.email_address,
            });

            await user.save();
            console.log("User created!");
        } catch (error) {
            console.log(error);
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }
    }

    return new Response("Webhook received", { status: 200 });
}