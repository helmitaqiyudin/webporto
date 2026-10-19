export type Project = {
    slug: string;
    name: string;
    year: string;
    role: string;
    summary: string;
    stack: string[];
    image?: string;
    highlights: string[];
    links?: { demo?: string; repo?: string };
    internal?: boolean;
};

// Drafted from the experience entries; numbers and screenshots (public/images/projects/) to come.
export const projects: Project[] = [
    {
        slug: "myits-housing",
        name: "myITS Housing",
        year: "2024",
        role: "Front-end developer",
        summary: "Campus housing management web app for ITS, with AR previews that help the housing team search properties.",
        stack: ["Next.js", "TypeScript", "AR"],
        highlights: [
            "Built the housing management app for the ITS housing team",
            "Added AR property previews to make searches faster",
            "Became my undergraduate thesis project",
        ],
        internal: true,
    },
    {
        slug: "iog-ecommerce",
        name: "IOG E-commerce",
        year: "2023",
        role: "Front-end developer",
        summary: "B2B/B2C platform for SKK Migas that streamlines compliant procurement in the oil and gas sector.",
        stack: [],
        highlights: [
            "Built front-end features for the procurement flow",
            "Resolved component issues together with the wider team",
        ],
        internal: true,
    },
    {
        slug: "webporto",
        name: "This portfolio",
        year: "2026",
        role: "Solo",
        summary: "A 3D head, a cat that chases your cursor, and live widgets for Discord, Spotify, Strava, and coding activity.",
        stack: ["Next.js", "React", "Three.js", "Tailwind"],
        highlights: [
            "Live widgets backed by my own Cloudflare Worker",
            "Visitors can suggest a song straight into my Spotify queue",
        ],
        links: { repo: "https://github.com/helmitaqiyudin/webporto" },
    },
    {
        slug: "helmi-api",
        name: "helmi-api",
        year: "2026",
        role: "Solo",
        summary: "Cloudflare Worker behind the live widgets: Spotify, the latest Strava run, and a GitHub + Bitbucket activity heatmap.",
        stack: ["Cloudflare Workers", "Hono", "TypeScript"],
        highlights: [
            "OAuth tokens rotate in KV, with admin-only re-auth pages",
            "Cron sync that stays inside the Workers free-plan limits",
        ],
    },
];
