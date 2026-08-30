import AboutHero from "@/components/about/AboutHero";
import StoryScroll from "@/components/about/StoryScroll";
import ValuesCards from "@/components/about/ValuesCards";
import StatsSection from "@/components/about/StatsSection";
import MadeInUae from "@/components/about/MadeInUae";
import AboutCta from "@/components/about/AboutCta";

export const metadata = { title: "من نحن" };

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StoryScroll />
      <ValuesCards />
      <StatsSection />
      <MadeInUae />
      <AboutCta />
    </>
  );
}
