import { TextEffect, PresetType, PerType } from '@/components/core/text-effect';

interface ProfileTextEffectProps {
    text: string;
    preset?: PresetType;
    opacity?: number;
    delay?: number;
    per?: PerType;
    className?: string;
}

export function CustomTextEffect({ text, preset, opacity, delay, per, className }: ProfileTextEffectProps) {
    return (
        <div className='flex flex-col space-y-0'>
            <TextEffect
                per={per}
                className={className}
                delay={delay}
                preset={preset}
                variants={{
                    container: {
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: opacity || 1,
                            transition: {
                                staggerChildren: 0.05,
                            },
                        },
                        exit: {
                            transition: { staggerChildren: 0.05, staggerDirection: -1 },
                        },
                    },
                }}
            >
                {text}
            </TextEffect>
        </div>
    );
}
