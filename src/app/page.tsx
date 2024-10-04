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

export default function Home() {
  const modelRef = useRef(null);

  function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={.4} />;
  }

  return (
    <>
      <div className="absolute z-50 top-5 right-5">
        <ModeToggle />
      </div>

      <section className="relative m-auto flex w-full max-w-[600px] flex-col gap-[20px] px-10 py-[50px] font-[family-name:var(--font-geist-sans)]">
        <div className="relative w-full h-[400px]">
          <Canvas shadows camera={{ position: [0, 1, 3], fov: 80 }}>
            <ambientLight intensity={1.5} />
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
                <Model url="/models/helmi.glb" />
              </motion.group>
            </BouncyControls>

            <ContactShadows
              rotation-x={Math.PI / 2}
              position={[0, -2, 0]}
              opacity={1}
              width={1}
              height={1}
              blur={3}
              far={5}
            />
          </Canvas>
        </div>

        <div className="flex flex-col">
          <p>Helmi Taqiyudin</p>
          <CustomTextEffect
            text="Software Engineer"
            preset="blur"
            opacity={0.3}
            per={"char"} />
          <br />
          <CustomTextEffect
            text={`I'm an Informatics Engineering graduate from Sepuluh Nopember Institute of Technology. Passionate in web and mobile app development, working with technologies like Next.js, TypeScript, and Flutter.`}
            preset="slide"
            opacity={0.5}
            per="word"
            delay={1.3}
          />
        </div>
      </section>
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
