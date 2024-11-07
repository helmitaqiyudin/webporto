"use client";

import { CustomTextEffect } from "@/components/textEffectWithDelay";
import { ModeToggle } from "@/components/themeButton";
import { Canvas, useThree } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { useRef } from "react";
import { useGLTF, ContactShadows } from "@react-three/drei";
import { useMotionValue, useSpring } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { MathUtils } from "three";
import { Separator } from "@/components/ui/separator"
import { TextShimmer } from '@/components/core/text-shimmer';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { FiLinkedin, FiGithub, FiMail } from "react-icons/fi";

export default function Home() {
  const modelRef = useRef(null);

  function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={.4} />;
  }

  return (
    <>
      <div className="absolute z-10 top-5 right-5">
        <ModeToggle />
      </div>

      <div className="m-auto flex w-full max-w-[600px] flex-col gap-[20px] px-10 py-[50px] ">
        <section className="flex flex-col gap-[10px]">
          <div className="h-[400px]">
            <Canvas shadows camera={{ position: [0, 1, 3], fov: 80 }}>
              <ambientLight intensity={1.25} />
              <BouncyControls>
                <motion.group
                  ref={modelRef}
                  initial={{ scale: 1 }}
                  animate={{ scale: 2 }}
                  whileHover={{ scale: 3 }}
                  position={[0, .5, 0]}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 10,
                    restDelta: 0.000001,
                  }}
                >
                  <Model url="/models/helmi2.glb" />
                </motion.group>
              </BouncyControls>

              <ContactShadows
                rotation-x={Math.PI / 2}
                position={[0, -1.5, 0]}
                opacity={1}
                width={1}
                height={1}
                blur={3}
                far={5}
              />
            </Canvas>
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
      </div >
    </>
  );
}

function BouncyControls({ children }: { children: React.ReactNode }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, springSettings);
  const springY = useSpring(rotateY, springSettings);

  const { size, gl } = useThree();

  const handleDrag = ({ movement: [x, y], down }: { movement: [number, number], down: boolean }) => {
    const sensitivity = window.innerWidth <= 768 ? 2 : 1;

    y = MathUtils.clamp(y / size.height, -1, 1) * Math.PI;
    x = MathUtils.clamp(x / size.width, -1, 1) * Math.PI;
    rotateX.set(down ? (y / 2) * sensitivity : 0);
    rotateY.set(down ? (x * 1.25) * sensitivity : 0);
  };

  useDrag(handleDrag, {
    target: gl.domElement,
    pointer: { touch: true },
  });

  return (
    <motion.group
      rotation-x={springX}
      rotation-y={springY}
    >
      {children}
    </motion.group>
  );
}

const springSettings = {
  damping: 20,
  stiffness: 1000,
  restDelta: 0.000001,
};
