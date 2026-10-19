"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { categories, tech } from "@/data/stack"

export default function TechStackDisplay() {
    return (
        <div className="w-full max-w-[650px] mx-auto">
            <div className="space-y-6">
                <div>
                    <h2 className="text-base sm:text-lg md:text-xl">
                        Current technologies
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        These are some of my main tech stack.
                    </p>
                </div>
                <TooltipProvider>
                    {categories.map((category) => {
                        const items = tech.filter((item) => item.category === category.id)
                        if (items.length === 0) return null
                        return (
                            <div key={category.id} className="space-y-3">
                                <h3 className="text-sm text-muted-foreground">{category.label}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {items.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <Tooltip key={item.name}>
                                                <TooltipTrigger asChild>
                                                    <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg bg-transparent dark:hover:bg-gray-800 hover:bg-gray-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="p-2 rounded-md"
                                                                    style={{
                                                                        backgroundColor: `${item.color}15`,
                                                                    }}
                                                                >
                                                                    <Icon
                                                                        className="w-6 h-6"
                                                                        style={{ color: item.color }}
                                                                    />
                                                                </div>
                                                                <h4 className="font-medium text-xs md:text-sm">{item.name}</h4>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{item.desc}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </TooltipProvider>
            </div>
        </div>
    )
}
