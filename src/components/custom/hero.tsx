"use client";

import { CustomTextEffect } from "@/components/textEffectWithDelay";
import { TextShimmer } from "@/components/core/textShimmer";
import Socials from "@/components/custom/socials";
import { HeadModelLazy } from "@/components/custom/lazy3d";
import ErrorBoundary from "@/components/core/errorBoundary";
import { socials } from "@/data/socials";

/** Name, role, links, and bio beside the 3D head. */
export default function Hero() {
    return (
        <section className="flex flex-col gap-4 sm:grid sm:grid-cols-[160px_1fr] sm:items-center">
            <div className="h-[220px] sm:h-[160px]">
                {/* No WebGL or a failed model load leaves an empty box instead of a crashed page. */}
                <ErrorBoundary fallback={null}>
                    <HeadModelLazy />
                </ErrorBoundary>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 md:flex-row md:justify-between">
                    <div>
                        <TextShimmer
                            duration={3}
                            className='font-[family-name:Satoshi-Bold] tracking-wider text-xl [--base-color:theme(colors.black)] [--base-gradient-color:theme(colors.gray.300)] dark:[--base-color:theme(colors.white)] dark:[--base-gradient-color:theme(colors.gray.400)]'
                        >Helmi Taqiyudin</TextShimmer>
                        <CustomTextEffect
                            className="text-muted-foreground"
                            text="Software Engineer"
                            preset="blur"
                            per={"char"} />
                    </div>
                    <div className="flex gap-1 md:self-center">
                        {socials.map((social, index) => (
                            <Socials
                                key={index}
                                href={social.href}
                                icon={social.icon}
                                variant={social.variant}
                                text={social.text}
                            />
                        ))}
                    </div>
                </div>
                <p className="text-muted-foreground">
                    I&apos;m an full-stack engineer from Surabaya, Indonesia. Specializing in web and mobile app development, working with technologies like Next.js, TypeScript, and Flutter.
                </p>
            </div>
        </section>
    );
}
