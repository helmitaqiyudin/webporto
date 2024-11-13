import { useMotionValue, useSpring } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { MathUtils } from "three";
import { useThree } from "@react-three/fiber";
import { motion } from "framer-motion-3d";

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

export { BouncyControls };
