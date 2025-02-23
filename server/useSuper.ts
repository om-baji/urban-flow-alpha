import { useState } from "react";

export default function useSuper(){
    const [isSuper,setIsSuper] = useState<boolean | null>(null);

    const key = process.env.SUPERUSER_KEY as string;

    const token = localStorage.getItem("key")

    setIsSuper((key === token))

    return {
        isSuper
    }

}