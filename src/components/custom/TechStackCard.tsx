import Image from 'next/image';

interface StackCardProps {
    name: string;
    icon: string;
    color: string;
    desc: string;
}

export default function StackCard({ name, icon, color, desc }: StackCardProps) {
    return (
        <div className="flex gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Image src={`/icons/${icon}.svg`} alt={name} width={32} height={32} className={`hover:bg-${color}-100 dark:hover:bg-${color}-800 rounded-full`} />
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">{name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{desc}</span>
            </div>
        </div>
    )

}