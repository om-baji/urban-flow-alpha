'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const Sudo = () => {

    const [sudo,setSudo] = useState("");
    const router = useRouter()

    const onValidate = () => {
        const key = process.env.SUPERUSER_KEY as string;
        if(key != sudo) router.push("/signin")

        localStorage.setItem("key", key)

        router.push("/simple")

    }
  return (
    <div className='flex flex-col gap-5 justify-center items-center h-screen'>

        <div className='flex flex-col gap-4'>
        <Input
            onChange={e => setSudo(e.target.value)}
            placeholder='SUPER KEY' />
        <Button 
        onClick={onValidate}
        className='w-full'>
            Validate
        </Button>
        </div>
        <p className='text-muted text-white'>Don&apost have one? <Link href="/signin" >Login</Link></p>
    </div>
  )
}

export default Sudo
