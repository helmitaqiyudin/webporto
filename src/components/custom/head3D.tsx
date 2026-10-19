import { Canvas, useFrame } from "@react-three/fiber";
import { BouncyControls } from "@/components/modelControl";
import { useRef } from "react";
import { useGLTF, ContactShadows } from "@react-three/drei";
import type { Group } from "three";
import { stepSpring, type SpringConfig } from "@/lib/spring";

const scaleSpring: SpringConfig = { stiffness: 300, damping: 10 };

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={.4} />;
}

// Grows from 1 to 2 on load and to 3 while hovered, with a springy overshoot.
function BouncyHead() {
    const groupRef = useRef<Group>(null);
    const hovered = useRef(false);
    const scale = useRef({ value: 1, velocity: 0 });

    useFrame((_, delta) => {
        scale.current = stepSpring(scale.current, hovered.current ? 3 : 2, scaleSpring, delta);
        groupRef.current?.scale.setScalar(scale.current.value);
    });

    return (
        <group
            ref={groupRef}
            position={[0, .5, 0]}
            onPointerOver={() => { hovered.current = true; }}
            onPointerOut={() => { hovered.current = false; }}
        >
            <Model url="/models/helmi2.glb" />
        </group>
    );
}

export default function HeadModel() {
    return (
        <Canvas shadows camera={{ position: [0, 1, 3], fov: 80 }}>
            <ambientLight intensity={1.25} />
            <BouncyControls>
                <BouncyHead />
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
