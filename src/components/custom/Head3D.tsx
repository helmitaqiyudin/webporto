import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { BouncyControls } from "@/components/ModelControl";
import { useRef } from "react";
import { useGLTF, ContactShadows } from "@react-three/drei";

export default function HeadModel() {
    const modelRef = useRef(null);

    function Model({ url }: { url: string }) {
        const { scene } = useGLTF(url);
        return <primitive object={scene} scale={.4} />;
    }

    return (
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
    )
}
