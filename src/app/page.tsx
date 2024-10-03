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
    return <primitive object={scene} scale={.5} />;
  }

  return (
    <>
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>

      <section className="relative m-auto flex w-full max-w-[600px] flex-col gap-[20px] px-10 py-[50px] font-[family-name:var(--font-geist-sans)]">
        <div className="relative w-full h-[400px]">
          <Canvas shadows camera={{ position: [-2, 2, 4], fov: 80 }}>
            <ambientLight intensity={3.5} />
            <BouncyControls>
              <motion.group
                ref={modelRef}
                initial={{ scale: 2 }}
                animate={{ scale: 3 }}
                whileHover={{ scale: 3.5 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 10,
                  restDelta: 0.000001,
                }}
              >
                <Model url="/models/nasb2_mr_krabs.glb" />
              </motion.group>
            </BouncyControls>

            <ContactShadows
              rotation-x={Math.PI / 2}
              position={[0, -1, 0]}
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

  useDrag(
    ({ movement: [x, y], down }) => {
      const newY = MathUtils.clamp(y / size.height, -1, 1) * Math.PI;
      const newX = MathUtils.clamp(x / size.width, -1, 1) * Math.PI;
      rotateX.set(down ? newY / 2 : 0);
      rotateY.set(down ? newX * 1.25 : 0);
    },
    { target: gl.domElement }
  );

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
