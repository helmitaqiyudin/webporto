"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EducationTimeline from "./eduTimeline"
import ExperienceTimeline from "./expTimeline"

export default function TimelineContainer() {
    return (
        <div className="w-full max-w-[650px] mx-auto">
            <Card className="bg-transparent">
                <Tabs defaultValue="experience" className="w-full">
                    <TabsList className="rounded-b-none grid w-full grid-cols-2">
                        <TabsTrigger value="experience">Experience</TabsTrigger>
                        <TabsTrigger value="education">Education</TabsTrigger>
                    </TabsList>
                    <TabsContent value="experience" className="p-4">
                        <ExperienceTimeline />
                    </TabsContent>
                    <TabsContent value="education" className="p-4">
                        <EducationTimeline />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}