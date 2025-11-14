'use client';
import { SpriteAnimator } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";

const PLANE_Z = -2;
const SPEED = 1.5;
const STOP_DISTANCE = 1;
const DELTA_TIME = 1 / 60;
const IDLE_TO_SLEEP_TIME = 10;

function screenToWorldPos(
    screenPos: { x: number; y: number },
    camera: THREE.Camera,
    size: { width: number; height: number },
    planeZ: number
): { x: number; y: number } {
    const normalizedX = (screenPos.x / size.width) * 2 - 1;
    const normalizedY = -(screenPos.y / size.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);

    const direction = raycaster.ray.direction.clone();
    const distance = (planeZ - camera.position.z) / direction.z;
    const worldPos = raycaster.ray.origin.clone().add(direction.multiplyScalar(distance));

    return { x: worldPos.x, y: worldPos.y };
}

function Cat({ mouseScreenPos }: { mouseScreenPos: { x: number; y: number } }) {
    const { camera, size } = useThree();
    const idleRef = useRef<THREE.Group>(null);
    const runRef = useRef<THREE.Group>(null);
    const sleepRef = useRef<THREE.Group>(null);
    const wakeRef = useRef<THREE.Group>(null);
    const catPos = useRef({ x: 0, y: 0 });
    const [flipX, setFlipX] = useState(false);
    const idleTimeRef = useRef(0);
    const [isSleeping, setIsSleeping] = useState(false);
    const [isWakingUp, setIsWakingUp] = useState(false);
    const prevMousePosRef = useRef({ x: 0, y: 0 });
    const wakeStartTimeRef = useRef(0);
    const WAKE_ANIMATION_DURATION = 5 / 8;

    // Construct absolute URLs for textures to ensure they work in production
    const textureUrls = useMemo(() => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return {
            idle: `${baseUrl}/models/idle.png`,
            run: `${baseUrl}/models/run.png`,
            sleep: `${baseUrl}/models/sleep.png`,
        };
    }, []);

    useFrame((state, delta) => {
        const targetPos = screenToWorldPos(mouseScreenPos, camera, size, PLANE_Z);

        const dx = targetPos.x - catPos.current.x;
        const dy = targetPos.y - catPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const isRunning = distance > STOP_DISTANCE;

        const mouseMoved =
            prevMousePosRef.current.x !== mouseScreenPos.x ||
            prevMousePosRef.current.y !== mouseScreenPos.y;
        prevMousePosRef.current = { x: mouseScreenPos.x, y: mouseScreenPos.y };

        if (isSleeping && mouseMoved && !isWakingUp) {
            setIsWakingUp(true);
            wakeStartTimeRef.current = 0;
        }

        if (!isRunning && !isSleeping && !isWakingUp) {
            idleTimeRef.current += delta;
            if (idleTimeRef.current >= IDLE_TO_SLEEP_TIME) {
                setIsSleeping(true);
                idleTimeRef.current = 0;
            }
        } else if (isRunning || isWakingUp) {
            idleTimeRef.current = 0;
        }

        if (isRunning && !isSleeping && !isWakingUp) {
            const angle = Math.atan2(dy, dx);
            const moveDistance = SPEED * DELTA_TIME;
            catPos.current.x += Math.cos(angle) * moveDistance;
            catPos.current.y += Math.sin(angle) * moveDistance;

            const shouldFlipX = Math.cos(angle) < 0;
            if (flipX !== shouldFlipX) {
                setFlipX(shouldFlipX);
            }
        }

        if (isWakingUp) {
            wakeStartTimeRef.current += delta;

            let animationFinished = false;

            if (wakeStartTimeRef.current >= WAKE_ANIMATION_DURATION) {
                animationFinished = true;
            }

            if (wakeRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const wakeAnimator = wakeRef.current as any;
                if (wakeAnimator.currentFrame !== undefined && wakeAnimator.currentFrame <= 0) {
                    animationFinished = true;
                }
            }

            if (animationFinished) {
                setIsWakingUp(false);
                setIsSleeping(false);
                wakeStartTimeRef.current = 0;
            }
        }

        const updateSprite = (ref: React.RefObject<THREE.Group>) => {
            if (ref.current) {
                ref.current.position.set(catPos.current.x, catPos.current.y, PLANE_Z);
            }
        };

        updateSprite(idleRef);
        updateSprite(runRef);
        updateSprite(sleepRef);
        updateSprite(wakeRef);

        if (idleRef.current) idleRef.current.visible = !isRunning && !isSleeping && !isWakingUp;
        if (runRef.current) runRef.current.visible = isRunning && !isSleeping && !isWakingUp;
        if (sleepRef.current) sleepRef.current.visible = isSleeping && !isWakingUp;
        if (wakeRef.current) wakeRef.current.visible = isWakingUp;
    });

    return (
        <>
            <SpriteAnimator
                ref={idleRef}
                textureImageURL={textureUrls.idle}
                startFrame={0}
                position={[0, 0, PLANE_Z]}
                autoPlay
                loop
                fps={8}
                numberOfFrames={6}
                scale={1}
                flipX={!flipX}
            />
            <SpriteAnimator
                ref={runRef}
                textureImageURL={textureUrls.run}
                startFrame={0}
                position={[0, 0, PLANE_Z]}
                autoPlay
                loop
                fps={24}
                numberOfFrames={12}
                scale={1}
                visible={false}
                flipX={flipX}
            />
            <SpriteAnimator
                ref={sleepRef}
                textureImageURL={textureUrls.sleep}
                startFrame={0}
                position={[0, 0, PLANE_Z]}
                autoPlay={isSleeping && !isWakingUp}
                fps={8}
                numberOfFrames={5}
                scale={1}
                visible={false}
                flipX={flipX}
            />
            <SpriteAnimator
                ref={wakeRef}
                textureImageURL={textureUrls.sleep}
                startFrame={4}
                position={[0, 0, PLANE_Z]}
                autoPlay={isWakingUp}
                playBackwards={true}
                fps={8}
                numberOfFrames={5}
                scale={1}
                visible={false}
                flipX={flipX}
            />
        </>
    );
}

function CatFollower() {
    const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const updateMousePos = (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMouseScreenPos({
            x: clientX - rect.left,
            y: clientY - rect.top,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        updateMousePos(e.clientX, e.clientY);
    };

    const handleTouch = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
            updateMousePos(touch.clientX, touch.clientY);
        }
    };

    useEffect(() => {
        setMouseScreenPos({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className="bg-cyan-300 h-[100dvh] w-[100dvw] relative touch-none"
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
        >
            <Canvas camera={{ position: [0, 0, 5] }}>
                <Cat mouseScreenPos={mouseScreenPos} />
            </Canvas>
        </div>
    );
}

export default function CatPage() {
    return <CatFollower />;
}