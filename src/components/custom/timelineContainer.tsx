"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import EducationTimeline from "./eduTimeline"
import ExperienceTimeline from "./expTimeline"

export default function TimelineContainer() {
    const [activeTab, setActiveTab] = useState<"experience" | "education">("experience")

    return (
        <div className="w-full max-w-[650px] mx-auto">
            <Card className="bg-transparent">
                <div className="grid grid-cols-2 p-1 gap-1">
                    <Button
                        variant="ghost"
                        className={cn(
                            "rounded-lg",
                            activeTab === "experience" && "bg-gray-200 dark:bg-gray-800"
                        )}
                        onClick={() => setActiveTab("experience")}
                    >
                        Experience
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "rounded-lg",
                            activeTab === "education" && "bg-gray-200 dark:bg-gray-800"
                        )}
                        onClick={() => setActiveTab("education")}
                    >
                        Education
                    </Button>
                </div>
                <div className="p-4">
                    {activeTab === "experience" && <ExperienceTimeline />}
                    {activeTab === "education" && <EducationTimeline />}
                </div>
            </Card>
        </div>
    )
}