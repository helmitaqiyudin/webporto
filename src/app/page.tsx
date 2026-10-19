import { ModeToggle } from "@/components/themeButton";
import { Separator } from "@/components/ui/separator"
import TechStackDisplay from "@/components/custom/techStack";
import TimelineContainer from "@/components/custom/timelineContainer";
import Hero from "@/components/custom/hero";
import SiteFooter from "@/components/custom/siteFooter";
import { InteractiveCatLazy } from "@/components/custom/lazy3d";
import WidgetGrid from "@/components/widgets/widgetGrid";

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 -z-50 h-full w-full bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bottom-0 dark:left-0 dark:right-0 dark:top-0 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] dark:bg-[size:14px_24px] dark:[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <InteractiveCatLazy className="z-10" />

      <main className="mx-auto flex w-full max-w-[680px] flex-col gap-8 px-4 py-12 sm:px-6">
        <Hero />

        <section className="flex flex-col gap-3">
          <h2 className="text-base sm:text-lg md:text-xl">Live</h2>
          <WidgetGrid />
        </section>

        <Separator />

        <section>
          <TimelineContainer />
        </section>

        <Separator />

        <section>
          <TechStackDisplay />
        </section>

        <Separator />

        <SiteFooter />
      </main>
    </>
  );
}
