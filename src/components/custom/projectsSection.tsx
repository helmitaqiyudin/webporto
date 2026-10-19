import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projects, type Project } from "@/data/projects";

/** One project: summary, highlights, stack, and links (or an Internal badge). */
function ProjectCard({ project }: { project: Project }) {
    return (
        <Card className="flex flex-col gap-3 overflow-hidden bg-background/70 backdrop-blur-sm">
            {project.image && (
                <div className="relative aspect-video">
                    <Image src={project.image} alt={project.name} fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
                </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.internal && (
                            <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Internal
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {project.year} · {project.role}
                    </p>
                </div>
                <p className="text-sm text-muted-foreground">{project.summary}</p>
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                    ))}
                </ul>
                {project.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {project.stack.map((tech) => (
                            <span key={tech} className="rounded-sm border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                                {tech}
                            </span>
                        ))}
                    </div>
                )}
                {!project.internal && (project.links?.demo || project.links?.repo) && (
                    <div className="mt-auto flex gap-2">
                        {project.links.demo && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={project.links.demo} target="_blank" rel="noopener noreferrer">
                                    Live <ExternalLink className="size-3.5" />
                                </Link>
                            </Button>
                        )}
                        {project.links.repo && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={project.links.repo} target="_blank" rel="noopener noreferrer">
                                    Code <FiGithub className="size-3.5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}

/** Grid of project cards from src/data/projects.ts. */
export default function ProjectsSection() {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-base sm:text-lg md:text-xl">Projects</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {projects.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                ))}
            </div>
        </section>
    );
}
