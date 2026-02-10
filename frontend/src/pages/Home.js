import HeroSection from "@/components/HeroSection";
import ScrollingTicker from "@/components/ScrollingTicker";
import ServicesSection from "@/components/ServicesSection";
import AboutPreview from "@/components/AboutPreview";

export default function Home() {
  return (
    <main data-testid="home-page" className="pt-[72px]">
      <HeroSection />
      <ScrollingTicker />
      <ServicesSection />
      <AboutPreview />
    </main>
  );
}
