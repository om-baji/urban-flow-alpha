import { useState } from "react";
import jwt, { JwtPayload } from "jsonwebtoken"
export async function useAdmin(){
    const [isAdmin,setIsAdmin] = useState<boolean | null>(null)
    const [centerId,setCenterId] = useState<string | null>(null)

    const token = localStorage.getItem("admin-token");

    const payload = jwt.verify(token as string,process.env.ADMIN_KEY_SECRET as string) as JwtPayload;

    if(!payload) setIsAdmin(false);

    else setIsAdmin(true);

    setCenterId(payload.centerID)

    return {
        isAdmin,
        centerId
    }
}