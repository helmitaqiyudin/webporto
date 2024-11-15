import Link from "next/link";
import { Button } from "../ui/button";

interface SocialsProps {
    href: string;
    icon: React.ReactNode;
    variant: string;
    text?: string;
}

export default function Socials({ href, icon, variant, text }: SocialsProps) {
    return (
        <Link href={href} target="_blank">
            <Button variant={variant === "outline" ? "outline" : "ghost"}>
                {text && <span className="font-semibold mr-1">{text}</span>}
                {icon}
            </Button>
        </Link>
    );
}