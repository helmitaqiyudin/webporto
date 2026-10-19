import { useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { MathUtils, type Group } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { stepSpring, type SpringConfig } from "@/lib/spring";

const springSettings: SpringConfig = { stiffness: 1000, damping: 20 };

function BouncyControls({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<Group>(null);
    const target = useRef({ x: 0, y: 0 });
    const springX = useRef({ value: 0, velocity: 0 });
    const springY = useRef({ value: 0, velocity: 0 });

    const { size, gl } = useThree();

    const handleDrag = ({ movement: [x, y], down }: { movement: [number, number], down: boolean }) => {
        const sensitivity = window.innerWidth <= 768 ? 2 : 1;

        y = MathUtils.clamp(y / size.height, -1, 1) * Math.PI;
        x = MathUtils.clamp(x / size.width, -1, 1) * Math.PI;
        target.current.x = down ? (y / 2) * sensitivity : 0;
        target.current.y = down ? (x * 1.25) * sensitivity : 0;
    };

    useDrag(handleDrag, {
        target: gl.domElement,
        pointer: { touch: true },
    });

    useFrame((_, delta) => {
        springX.current = stepSpring(springX.current, target.current.x, springSettings, delta);
        springY.current = stepSpring(springY.current, target.current.y, springSettings, delta);
        if (groupRef.current) {
            groupRef.current.rotation.x = springX.current.value;
            groupRef.current.rotation.y = springY.current.value;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

export { BouncyControls };
