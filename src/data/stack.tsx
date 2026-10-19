import type { IconType } from "react-icons";
import {
  SiCloudflareworkers,
  SiExpress,
  SiFlutter,
  SiGit,
  SiHono,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

export type TechCategory = "frontend" | "mobile" | "backend" | "infra" | "tools";

export type Tech = {
  name: string;
  icon: IconType;
  color: string;
  desc: string;
  category: TechCategory;
};

export const categories: { id: TechCategory; label: string }[] = [
  { id: "frontend", label: "Frontend" },
  { id: "mobile", label: "Mobile" },
  { id: "backend", label: "Backend" },
  { id: "infra", label: "Infra" },
  { id: "tools", label: "Tools" },
];

export const tech: Tech[] = [
  { name: "Typescript", icon: SiTypescript, color: "#3178c6", desc: "JavaScript with superpowers", category: "frontend" },
  { name: "React", icon: SiReact, color: "#61dafb", desc: "A JavaScript library", category: "frontend" },
  { name: "NextJS", icon: SiNextdotjs, color: "#808080", desc: "React framework", category: "frontend" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#38b2ac", desc: "CSS framework", category: "frontend" },
  { name: "Three.js", icon: SiThreedotjs, color: "#808080", desc: "3D on the web", category: "frontend" },
  { name: "Flutter", icon: SiFlutter, color: "#02569b", desc: "Cross-platform mobile apps", category: "mobile" },
  { name: "Node", icon: SiNodedotjs, color: "#339933", desc: "JavaScript runtime", category: "backend" },
  { name: "Express", icon: SiExpress, color: "#808080", desc: "Node framework", category: "backend" },
  { name: "Hono", icon: SiHono, color: "#e36002", desc: "Web framework for the edge", category: "backend" },
  { name: "MongoDB", icon: SiMongodb, color: "#47a248", desc: "NoSQL database", category: "backend" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169e1", desc: "Relational database", category: "backend" },
  { name: "Workers", icon: SiCloudflareworkers, color: "#f38020", desc: "Cloudflare's edge runtime", category: "infra" },
  { name: "Vercel", icon: SiVercel, color: "#808080", desc: "Frontend hosting", category: "infra" },
  { name: "Git", icon: SiGit, color: "#f05032", desc: "Version control system", category: "tools" },
];
