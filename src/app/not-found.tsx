'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { HomeIcon } from 'lucide-react'

export default function Custom404() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-center">
            <div className="space-y-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404 - Page Not Found</h1>
                    <p className="text-muted-foreground max-w-[600px] text-lg">
                        Oops! It seems you&apos;ve ventured into undefined territory. This page doesn&apos;t exists.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 min-w-[200px] mt-8">
                    <Link href="/">
                        <Button className="w-full sm:w-auto gap-2">
                            <HomeIcon size={16} />
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}