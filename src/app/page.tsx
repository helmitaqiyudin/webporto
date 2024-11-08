"use client";

import { CustomTextEffect } from "@/components/TextEffectWithDelay";
import { ModeToggle } from "@/components/ThemeButton";
import { Separator } from "@/components/ui/Separator"
import { TextShimmer } from '@/components/core/TextShimmer';
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDown } from "lucide-react";
import { FiLinkedin, FiGithub, FiMail } from "react-icons/fi";
import HeadModel from "@/components/custom/Head3D";

export default function Home() {


  return (
    <>
      <div className="absolute z-10 top-5 right-5">
        <ModeToggle />
      </div>

      <div className="m-auto flex w-full max-w-[600px] flex-col gap-[20px] px-10 py-[50px] ">
        <section className="flex flex-col gap-[10px]">
          <div className="h-[400px]">
            <HeadModel />
          </div>

          <div className="flex flex-col">
            <div className="flex md:justify-between flex-col md:flex-row gap-2">
              <div>
                <TextShimmer
                  duration={3}
                  className='font-[family-name:Satoshi-Bold]
                text-xl [--base-color:theme(colors.black)] [--base-gradient-color:theme(colors.gray.300)] dark:[--base-color:theme(colors.white)] dark:[--base-gradient-color:theme(colors.gray.400)]'
                >Helmi Taqiyudin</TextShimmer>
                <CustomTextEffect
                  text="Software Engineer"
                  preset="blur"
                  opacity={0.3}
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
            <p className="opacity-50">
              I&apos;m an full-stack engineer from Surabaya, Indonesia. Specializing in web and mobile app development, working with technologies like Next.js, TypeScript, and Flutter.
            </p>
          </div>
        </section >

        <Separator />

        <section>

        </section>
      </div >
    </>
  );
}