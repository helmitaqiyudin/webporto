"use client";

import { CustomTextEffect } from "@/components/textEffectWithDelay";
import { ModeToggle } from "@/components/themeButton";
import { Separator } from "@/components/ui/separator"
import { TextShimmer } from '@/components/core/textShimmer';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { FiLinkedin, FiGithub, FiMail } from "react-icons/fi";
import HeadModel from "@/components/custom/head3D";
import TechStackDisplay from "@/components/custom/techStack";

export default function Home() {


  return (
    <>
      <div className="absolute inset-0 -z-50 h-full w-full bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bottom-0 dark:left-0 dark:right-0 dark:top-0 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] dark:bg-[size:14px_24px] dark:[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      <div className="absolute z-10 top-5 right-5">
        <ModeToggle />
      </div>

      <div className="flex w-full flex-col max-w-[650px] m-auto gap-[20px] py-[50px] px-10 md:px-0">
        <section className="flex flex-col gap-[10px]">
          <div className="h-[400px]">
            <HeadModel />
          </div>

          <div className="flex flex-col">
            <div className="flex md:justify-between flex-col md:flex-row gap-2">
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
              <div className="md:self-center flex gap-1">
                <Link href="/resume.pdf" target="_blank">
                  <Button variant="outline">
                    <span className="font-semibold">Resume</span>
                    <FileDown className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link href="https://www.linkedin.com/in/helmitaqiyudin/" target="_blank">
                  <Button variant="ghost">
                    <FiLinkedin className="size-5" />
                  </Button>
                </Link>
                <Link href="mailto:helmitaqiyudin@gmail.com" target="_blank">
                  <Button variant="ghost">
                    <FiMail className="size-5" />
                  </Button>
                </Link>
                <Link href="https://github.com/helmitaqiyudin" target="_blank">
                  <Button variant="ghost">
                    <FiGithub className="size-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <br />
            <p className="text-muted-foreground">
              I&apos;m an full-stack engineer from Surabaya, Indonesia. Specializing in web and mobile app development, working with technologies like Next.js, TypeScript, and Flutter.
            </p>
          </div>
        </section >

        <Separator />

        <section>
          <TechStackDisplay />
        </section>
      </div >
    </>
  );
}