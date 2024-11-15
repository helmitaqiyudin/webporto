import { FileDown } from "lucide-react";
import { FiLinkedin, FiGithub, FiMail } from "react-icons/fi";

export const socials = [
    {
        href: "/resume.pdf",
        icon: <FileDown className="size-5" />,
        variant: "outline",
        text: "Resume",
    },
    {
        href: "https://www.linkedin.com/in/helmitaqiyudin/",
        icon: <FiLinkedin className="size-5" />,
        variant: "ghost",
    },
    {
        href: "https://www.github.com/helmitaqiyudin",
        icon: <FiGithub className="size-5" />,
        variant: "ghost",
    },
    {
        href: "mailto:helmitaqiyudin@gmail.com",
        icon: <FiMail className="size-5" />,
        variant: "ghost",
    },
];