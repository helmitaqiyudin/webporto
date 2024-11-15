import Image from 'next/image'
import { education } from '@/data/education'

export default function EducationTimeline() {
    return (
        <div className="space-y-8">
            {education.map((item, index) => (
                <div key={index} className="relative pl-12 before:absolute before:left-5 before:top-2 before:h-full before:w-[1px] before:bg-border">
                    <div className="absolute left-0 top-1 h-10 w-10 rounded-full border border-border/50 overflow-hidden">
                        <Image
                            src={item.logo}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                            {item.date}
                        </div>
                        <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <div className="text-sm text-muted-foreground">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.location}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {item.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}