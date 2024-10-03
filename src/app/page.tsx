import { CustomTextEffect } from "@/components/textEffectWithDelay";
import { ModeToggle } from "@/components/themeButton";

export default function Home() {
  return (
    <>
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <section className="relative m-auto flex w-full max-w-[600px] flex-col gap-[20px] px-10 py-[50px] font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-col">
          <p>Helmi Taqiyudin</p>
          <CustomTextEffect text="Software Engineer" preset="blur" opacity={.3} per={"char"} />
          <br />
          <CustomTextEffect text={`Hi, I'm an Informatics Engineering graduate from Sepuluh Nopember Institute of Technology. Passionate in web and mobile app development, working with technologies like Next.js, TypeScript, and Flutter.`} preset="slide" opacity={.5} per="line" delay={1.3} />
        </div>
      </section>
    </>
  );
}
