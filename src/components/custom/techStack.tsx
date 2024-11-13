"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    SiTypescript,
    SiReact,
    SiNextdotjs,
    SiTailwindcss,
    SiGit,
    SiNodedotjs,
    SiExpress,
    SiMongodb,
} from "react-icons/si"

import { tech } from "@/data/stack"

const iconMap = {
    SiTypescript,
    SiReact,
    SiNextdotjs,
    SiTailwindcss,
    SiGit,
    SiNodedotjs,
    SiExpress,
    SiMongodb,
}

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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <TooltipProvider>
                        {tech.map((item) => {
                            const Icon = iconMap[item.icon as keyof typeof iconMap]
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
                                                    <h3 className="font-medium text-xs md:text-sm">{item.name}</h3>
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
                    </TooltipProvider>
                </div>
            </div>
        </div>
    )
}